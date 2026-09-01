package com.project.API.user;

import com.project.API.cart.CartRepository;
import com.project.API.commom.exception.ResourceNotFoundException;
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


    public UserService(
            UserRepository userRepository,
            CartRepository cartRepository,
            UserAdressRepository adressRepository
    ) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.adressRepository = adressRepository;
    }

    public List<AllUsersRequest> GetAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(user -> new AllUsersRequest(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail()
                ))
                .toList();
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





