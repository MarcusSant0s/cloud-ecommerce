package com.project.API.productImage;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/images")
public class ProductImageController {

    private final ProductImageService service;

    public ProductImageController(ProductImageService service) {
        this.service = service;
    }

    @PatchMapping("/{id}/set-main")
    public ResponseEntity<String> setMainImage(@PathVariable Long id) {

        ProductImage image = service.setMainImage(id);

        return ResponseEntity.ok(image.getUrl());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long id) {

        service.deleteImage(id);

        return ResponseEntity.noContent().build();
    }


}
