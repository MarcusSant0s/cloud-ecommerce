package com.project.API.productImage;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class ProductImageService{

    private final ProductImageRepository repository;

    public ProductImageService(ProductImageRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ProductImage setMainImage(Long imageId) {

        ProductImage image = repository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        Long productId = image.getProduct().getId();

        // remove main das outras
        repository.resetMainImages(productId);

        // define essa como principal
        image.setMain(true);
        image.getProduct().setMainImage(image);


        return repository.save(image);
    }

    public void deleteImage(Long id) {
        repository.deleteById(id);
    }
}