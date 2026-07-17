package com.project.API.user;

import com.project.API.cart.CartRepository;
import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.user.dto.AllUsersRequest;
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
    public ResponseEntity<Object> updateUser(
                            UpdateUserRequest request,
                            Long userId
    ){
          User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        request.applyTo(user);

        return ResponseEntity.accepted().build();
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





