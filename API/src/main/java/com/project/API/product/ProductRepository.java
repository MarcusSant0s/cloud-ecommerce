package com.project.API.product;

import com.project.API.order.interfaces.QuantityChecks;
import com.project.API.product.dto.ProductsImagesResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {


    @Query("SELECT p.quantity FROM Product p WHERE p.id = :id")
    Optional<Integer> findQuantityById(@Param("id") Long id);

    @Query("""
    SELECT i.id AS id, i.url AS url, i.isMain AS isMain
    FROM Product p
    JOIN p.images i
    WHERE p.id = :id
    """)
    List<ProductsImagesResponse> findImagesById(@Param("id") Long id);




    List<QuantityChecks> findAllByIdIn(Collection<Long> ids);

    @Modifying
    @Query("UPDATE Product p SET p.quantity = p.quantity - :qty WHERE p.id = :id AND p.quantity >= :qty")
    int decrementStock(@Param("id") Long productId, @Param("qty") int quantity);
}