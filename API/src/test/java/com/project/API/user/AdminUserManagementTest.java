package com.project.API.user;

import com.project.API.cart.CartRepository;
import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.commom.exception.RoleChangeNotAllowedException;
import com.project.API.commom.exception.UserNotDeletableException;
import com.project.API.order.Order;
import com.project.API.order.OrderRepository;
import com.project.API.user.dto.AdminUserDetailResponse;
import com.project.API.user.dto.AllUsersRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Admin-side user management: listagem com busca por e-mail, ficha completa e
 * exclusão — que só pode acontecer quando a conta não tem carrinho nem pedido.
 */
class AdminUserManagementTest {

    private UserRepository userRepository;
    private CartRepository cartRepository;
    private UserAdressRepository adressRepository;
    private OrderRepository orderRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        cartRepository = Mockito.mock(CartRepository.class);
        adressRepository = Mockito.mock(UserAdressRepository.class);
        orderRepository = Mockito.mock(OrderRepository.class);
        userService = new UserService(userRepository, cartRepository, adressRepository, orderRepository);
    }

    @Test
    @DisplayName("sem termo de busca a lista traz todos os usuários")
    void getAllUsers_shouldListEveryoneWhenTheSearchIsBlank() {
        when(userRepository.findAll()).thenReturn(List.of(UserFactory.createValidUser()));

        List<AllUsersRequest> result = userService.GetAllUsers("   ");

        assertEquals(1, result.size());
        verify(userRepository).findAll();
        verify(userRepository, never()).findByEmailContainingIgnoreCaseOrderByIdAsc(anyString());
    }

    @Test
    @DisplayName("a busca filtra por trecho do e-mail, sem espaços nas pontas")
    void getAllUsers_shouldSearchByEmail() {
        when(userRepository.findByEmailContainingIgnoreCaseOrderByIdAsc("marcus"))
                .thenReturn(List.of(UserFactory.createValidUser()));

        List<AllUsersRequest> result = userService.GetAllUsers("  marcus  ");

        assertEquals(1, result.size());
        assertEquals("marcus@test.com", result.get(0).email());
        verify(userRepository, never()).findAll();
    }

    @Test
    @DisplayName("a listagem devolve o papel do usuário")
    void getAllUsers_shouldExposeTheRole() {
        when(userRepository.findAll()).thenReturn(List.of(UserFactory.createAdminUser()));

        assertEquals("ADMIN", userService.GetAllUsers(null).get(0).role());
    }

    @Test
    @DisplayName("a ficha completa traz endereço, contagens e o histórico de pedidos")
    void getUserDetail_shouldReturnTheWholeProfile() {
        User user = UserFactory.createValidUser();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.countByUserId(1L)).thenReturn(2L);
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(new Order()));

        AdminUserDetailResponse detail = userService.getUserDetail(1L);

        assertEquals("marcus@test.com", detail.email());
        assertEquals("USER", detail.role());
        assertEquals("Rua das Flores", detail.address().street());
        assertEquals(2L, detail.cartCount());
        assertEquals(1L, detail.orderCount());
        assertEquals(1, detail.orders().size());
        assertFalse(detail.deletable(), "tem histórico, não pode ser apagado");
    }

    @Test
    @DisplayName("a ficha completa tolera usuário sem endereço")
    void getUserDetail_shouldTolerateAMissingAddress() {
        User admin = new User("admin", "admin", "admin@local.com", "hashed");
        admin.setRole(Role.ADMIN);
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        AdminUserDetailResponse detail = userService.getUserDetail(1L);

        assertNull(detail.address());
        assertTrue(detail.deletable(), "sem carrinho nem pedido, pode ser apagado");
    }

    @Test
    @DisplayName("promover um usuário grava o novo papel e devolve a linha atualizada")
    void updateUserRole_shouldPromoteAUser() {
        User user = UserFactory.createValidUser();
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        AllUsersRequest updated = userService.updateUserRole(2L, Role.ADMIN, 1L);

        assertEquals(Role.ADMIN, user.getRole());
        assertEquals("ADMIN", updated.role());
        assertEquals("marcus@test.com", updated.email());
    }

    @Test
    @DisplayName("rebaixar outro admin é permitido")
    void updateUserRole_shouldDemoteAnotherAdmin() {
        User other = UserFactory.createAdminUser();
        when(userRepository.findById(2L)).thenReturn(Optional.of(other));

        userService.updateUserRole(2L, Role.USER, 1L);

        assertEquals(Role.USER, other.getRole());
    }

    @Test
    @DisplayName("o admin não altera o papel da própria conta")
    void updateUserRole_shouldRefuseChangingOwnRole() {
        assertThrows(RoleChangeNotAllowedException.class,
                () -> userService.updateUserRole(1L, Role.USER, 1L));

        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("trocar o papel de um usuário inexistente dá 404")
    void updateUserRole_shouldFailForAnUnknownUser() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.updateUserRole(99L, Role.ADMIN, 1L));
    }

    @Test
    @DisplayName("usuário sem carrinho nem pedido é apagado junto com o endereço")
    void deleteUserAsAdmin_shouldDeleteACleanAccount() {
        User user = UserFactory.createValidUser();
        UserAdress adress = user.getUserAdress();
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(cartRepository.countByUserId(2L)).thenReturn(0L);
        when(orderRepository.countByUserId(2L)).thenReturn(0L);

        userService.deleteUserAsAdmin(2L, 1L);

        verify(userRepository).delete(user);
        verify(adressRepository).delete(adress);
    }

    @Test
    @DisplayName("usuário com carrinho atrelado não é apagado")
    void deleteUserAsAdmin_shouldRefuseWhenACartExists() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(UserFactory.createValidUser()));
        when(cartRepository.countByUserId(2L)).thenReturn(1L);
        when(orderRepository.countByUserId(2L)).thenReturn(0L);

        assertThrows(UserNotDeletableException.class,
                () -> userService.deleteUserAsAdmin(2L, 1L));

        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    @DisplayName("usuário com pedido atrelado não é apagado")
    void deleteUserAsAdmin_shouldRefuseWhenAnOrderExists() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(UserFactory.createValidUser()));
        when(cartRepository.countByUserId(2L)).thenReturn(0L);
        when(orderRepository.countByUserId(2L)).thenReturn(1L);

        assertThrows(UserNotDeletableException.class,
                () -> userService.deleteUserAsAdmin(2L, 1L));

        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    @DisplayName("o admin não apaga a própria conta pelo painel")
    void deleteUserAsAdmin_shouldRefuseSelfDeletion() {
        assertThrows(UserNotDeletableException.class,
                () -> userService.deleteUserAsAdmin(1L, 1L));

        verify(userRepository, never()).findById(anyLong());
        verify(userRepository, never()).delete(any(User.class));
    }
}
