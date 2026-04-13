package com.project.API.productImage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    @Modifying
    @Query("""
        UPDATE ProductImage i
        SET i.isMain = false
        WHERE i.product.id = :productId
    """)
    void resetMainImages(Long productId);

}