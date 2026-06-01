package com.project.API.product;

import com.project.API.product.dto.*;
import com.project.API.productImage.ProductImage;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.springframework.http.ResponseEntity.noContent;

@RestController
@RequestMapping("product")
public class ProductController {

    private final ProductService service;


    public ProductController(ProductService service) {
        this.service = service;

    }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody CreateProduct dto) {

        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> update(
            @PathVariable Long id,
            @ModelAttribute UpdateProduct product) {
        return ResponseEntity.ok(service.update(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<Page<ProductPageResponseDTO>> findAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock,
            @PageableDefault(size = 10, sort = "name") Pageable pageable
    ) {
        ProductFilterDTO filters = new ProductFilterDTO(categoryId, name, minPrice, maxPrice, inStock);
        return ResponseEntity.ok(service.findAll(filters, pageable));
    }


    //Attaching images endpoint
    @PostMapping("/{id}/images")
    public ResponseEntity<Void> UploadImages(
            @RequestParam("File") @NotNull MultipartFile file,
            @PathVariable long id ) throws IOException {

        service.uploadImages(file, id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product-images/{id_product}")
    public ResponseEntity<List<ProductsImagesResponse>> getProductsImages(@PathVariable Long id_product){
        List<ProductsImagesResponse> images = service.findImagesById(id_product);
        return ResponseEntity.ok(images);
    }





}
