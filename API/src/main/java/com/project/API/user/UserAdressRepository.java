package com.project.API.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAdressRepository extends JpaRepository<UserAdress, Long> {
}
