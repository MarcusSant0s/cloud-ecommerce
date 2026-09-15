package com.project.API.order;

import com.project.API.cart.CartRepository;
import com.project.API.cart.CartService;
import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.order.DTO.OrderResponse;
import com.project.API.product.ProductRepository;
import com.project.API.shipping.ShippingService;
import com.project.API.user.User;
import com.project.API.user.UserAdress;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * GET /order/{id}: alimenta a tela de detalhes e o polling das páginas de retorno
 * do Mercado Pago. Como recebe um id vindo da URL, quem não é dono do pedido não
 * pode ler nada dele.
 */
class OrderDetailAccessTest {

    private OrderRepository orderRepository;
    private OrderServiceImp orderService;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        orderService = new OrderServiceImp(
                orderRepository,
                Mockito.mock(CartRepository.class),
                Mockito.mock(ProductRepository.class),
                Mockito.mock(ShippingService.class),
                Mockito.mock(CartService.class),
                Mockito.mock(PaymentResultHandler.class));
    }

    private Order orderOwnedBy(Long userId) {
        User user = OrderFactory.mockUser(userId);
        UserAdress address = new UserAdress("Rua das Flores", "Taubaté", "12000-000", "123");
        address.setBairro("Centro");
        address.setPhone("(12) 99999-0000");
        when(user.getUserAdress()).thenReturn(address);

        return OrderFactory.orderWithItems(user, OrderStatus.PAID, OrderFactory.singleItem(10L, 2));
    }

    @Test
    @DisplayName("o dono recebe o pedido com itens, endereço e data do pagamento")
    void shouldReturnTheOrderToItsOwner() {
        Order order = orderOwnedBy(1L);
        order.setPaidAt(LocalDateTime.now());
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrderForUser(1L, 5L);

        assertEquals(OrderStatus.PAID, response.status());
        assertEquals(1, response.items().size());
        assertNotNull(response.paidAt());
        assertEquals("Rua das Flores", response.shippingAddress().street());
        assertEquals("Centro", response.shippingAddress().bairro());
    }

    @Test
    @DisplayName("pedido de outro usuário responde 404, sem revelar que existe")
    void shouldNotLeakAnotherUsersOrder() {
        // Montado antes do when(): orderOwnedBy() faz stubbing próprio, e chamá-lo
        // dentro do thenReturn() aninharia um when() em outro ainda aberto.
        Order order = orderOwnedBy(1L);
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.getOrderForUser(2L, 5L));
    }

    @Test
    @DisplayName("pedido inexistente responde 404")
    void shouldFailForAnUnknownOrder() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.getOrderForUser(1L, 99L));
    }

    @Test
    @DisplayName("pedido sem endereço cadastrado não quebra a resposta")
    void shouldTolerateAMissingAddress() {
        User user = OrderFactory.mockUser(1L);
        when(user.getUserAdress()).thenReturn(null);
        Order order = OrderFactory.orderWithItems(user, OrderStatus.PENDING, OrderFactory.singleItem(10L, 1));
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrderForUser(1L, 5L);

        assertNull(response.shippingAddress());
        assertNull(response.paidAt());
    }
}
