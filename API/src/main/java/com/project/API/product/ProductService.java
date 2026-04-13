package com.project.API.product;

import com.project.API.product.dto.CreateProduct;
import com.project.API.product.dto.ProductFilterDTO;
import com.project.API.product.dto.ProductPageResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    Product create(CreateProduct createProduct);
    Product update(Long id, Product product);
    void delete(Long id);
    Product findById(Long id);
    Page<ProductPageResponseDTO> findAll(ProductFilterDTO filters, Pageable pageable);
    void UploadImages(MultipartFile file, Long id) ;
}

