package com.project.API.file;

import com.project.API.productImage.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepository extends JpaRepository<ProductImage, Long> {
}
