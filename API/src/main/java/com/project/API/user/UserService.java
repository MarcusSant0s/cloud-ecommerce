package com.project.API.user;

import com.project.API.cart.CartRepository;
import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.commom.exception.RoleChangeNotAllowedException;
import com.project.API.commom.exception.UserNotDeletableException;
import com.project.API.order.Order;
import com.project.API.order.OrderRepository;
import com.project.API.user.dto.AdminUserDetailResponse;
import com.project.API.user.dto.AllUsersRequest;
import com.project.API.user.dto.SingleUserRequest;
import com.project.API.user.dto.UpdateUserRequest;
import jakarta.transaction.Transactional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final UserAdressRepository adressRepository;
    private final OrderRepository orderRepository;


    public UserService(
            UserRepository userRepository,
            CartRepository cartRepository,
            UserAdressRepository adressRepository,
            OrderRepository orderRepository
    ) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.adressRepository = adressRepository;
        this.orderRepository = orderRepository;
    }

    // `email` em branco lista todo mundo; preenchido, filtra por trecho do e-mail.
    public List<AllUsersRequest> GetAllUsers(String email){
        List<User> users = (email == null || email.isBlank())
                ? userRepository.findAll()
                : userRepository.findByEmailContainingIgnoreCaseOrderByIdAsc(email.trim());

        return users.stream()
                .map(AllUsersRequest::from)
                .toList();
    }

    public AdminUserDetailResponse getUserDetail(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return AdminUserDetailResponse.from(user, cartRepository.countByUserId(userId), orders);
    }

    // Promove ou rebaixa uma conta. O admin não pode mexer no próprio papel: além
    // de derrubar o acesso dele no meio da sessão (o JwtAuthFilter relê o papel do
    // banco a cada requisição), é o que garante que sempre reste pelo menos um
    // ADMIN — quem faz a troca continua sendo um.
    @Transactional
    public AllUsersRequest updateUserRole(Long userId, Role role, Long requesterId){
        if (userId.equals(requesterId)) {
            throw new RoleChangeNotAllowedException(
                    "Você não pode alterar o papel da própria conta.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRole(role);

        return AllUsersRequest.from(user);
    }

    // Exclusão pelo admin: só passa se a conta não tiver histórico. Carrinho ou
    // pedido atrelado significa dado que seria perdido (ou FK que quebraria), então
    // a resposta é 409 em vez de apagar em cascata como faz o deleteMe (LGPD).
    @Transactional
    public void deleteUserAsAdmin(Long userId, Long requesterId){
        if (userId.equals(requesterId)) {
            throw new UserNotDeletableException(
                    "Você não pode apagar a própria conta pelo painel.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long cartCount = cartRepository.countByUserId(userId);
        long orderCount = orderRepository.countByUserId(userId);

        if (cartCount > 0 || orderCount > 0) {
            throw new UserNotDeletableException(
                    "Usuário tem " + cartCount + " carrinho(s) e " + orderCount
                            + " pedido(s) atrelados e não pode ser apagado.");
        }

        UserAdress adress = user.getUserAdress();

        userRepository.delete(user);

        if (adress != null) {
            adressRepository.delete(adress);
        }
    }


    @Transactional
    public SingleUserRequest updateUser(
                            UpdateUserRequest request,
                            Long userId
    ){
          User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // The seeded admin (AdminSeeder) is created without an address, and
        // applyTo() writes straight onto user.getUserAdress(). Without this the
        // one account that has no address yet gets an NPE when saving its profile.
        // User.userAdress has no cascade, so the new row is saved explicitly.
        if (user.getUserAdress() == null) {
            UserAdress created = new UserAdress(
                    request.street(), request.city(), request.cep(), request.number());
            created.setBairro(request.bairro());
            created.setPhone(request.phone());
            created.setUser(user);
            adressRepository.save(created);
            user.setUserAdress(created);
        }

        request.applyTo(user);

        return SingleUserRequest.from(user);
    }

    // Direito de eliminação (LGPD, art. 18, VI): remove a conta e todos os
    // dados pessoais associados. Ordem respeita as FKs: carrinhos primeiro
    // (não têm cascade a partir de User), depois o usuário (orders caem por
    // cascade) e por fim o endereço (referenciado por users.user_adress_id).
    @Transactional
    public void deleteMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        cartRepository.deleteAll(cartRepository.findByUserId(userId));

        UserAdress adress = user.getUserAdress();

        userRepository.delete(user);

        if (adress != null) {
            adressRepository.delete(adress);
        }
    }
}





