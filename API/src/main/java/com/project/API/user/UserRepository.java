package com.project.API.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // Busca do painel admin: trecho do e-mail, sem diferenciar maiúsculas.
    List<User> findByEmailContainingIgnoreCaseOrderByIdAsc(String email);
}
