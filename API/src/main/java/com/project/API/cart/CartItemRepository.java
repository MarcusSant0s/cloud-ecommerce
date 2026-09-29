package com.project.API.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Modifying
    @Query("DELETE FROM CartItem i WHERE i.product.id = :productId")
    int deleteByProductId(@Param("productId") Long productId);
}
