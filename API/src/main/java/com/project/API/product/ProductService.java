package com.project.API.product;

import com.project.API.product.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    Product create(CreateProduct createProduct);
    Product update(Long id, UpdateProduct product);
    void delete(Long id);
    Product findById(Long id);
    Page<ProductPageResponseDTO> findAll(ProductFilterDTO filters, Pageable pageable);
    void uploadImages(MultipartFile file, Long id) ;
      List<ProductsImagesResponse> findImagesById(Long id);

}

