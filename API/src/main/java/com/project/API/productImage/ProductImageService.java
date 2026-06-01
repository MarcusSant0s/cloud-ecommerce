package com.project.API.productImage;

import com.project.API.product.Product;
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

    @Transactional
    public void deleteImage(Long id) {
        ProductImage image = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found"));


        Product product = image.getProduct();
        if (product.getMainImage() != null &&
                product.getMainImage().getId().equals(id)
        ) {
            product.setMainImage(null);
            product.getImages().stream()
                    .filter(item -> !item.getId().equals(id))
                    .findFirst()
                    .ifPresent(next -> {
                        next.setMain(true);
                        product.setMainImage(next);
                    });
        }

        repository.deleteById(id);

    }
}