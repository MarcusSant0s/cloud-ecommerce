package com.project.API.product;

import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.file.S3StorageService;
import com.project.API.product.dto.*;
import com.project.API.productImage.ProductImage;
import com.project.API.category.Category;
import com.project.API.category.CategoryRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
    public class ProductServiceImpl implements ProductService {

        private final CategoryRepository categoryRepository;
        private final ProductRepository repository;
        private final S3StorageService storage;

        public ProductServiceImpl(ProductRepository repository, S3StorageService s3StorageService, CategoryRepository categoryRepository) {
            this.categoryRepository = categoryRepository;
            this.repository = repository;
            this.storage = s3StorageService;
        }

        @Override
        @Transactional
        public Product create(CreateProduct createProduct) {

            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(createProduct.getCategoryIds()));

            Product product = ProductMapper.toEntity(createProduct);
            product.setCategories(categories);
            return repository.save(product);
        }

        @Override
        public Product update(Long id, UpdateProduct product) {
            Product existing = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            existing.setName(product.name());
            existing.setDescription(product.description());
            existing.setQuantity(product.quantity());
            existing.setPriceOriginal(product.priceOriginal());
            existing.setPriceDiscount(product.priceDiscount());

            //Category
            ObjectMapper mapper = new ObjectMapper();
            List<Long> categoryIds = mapper.readValue(
                    product.categoryIds(),
                    new TypeReference<List<Long>>() {}
            );

             if(product.categoryIds() != null){
                Set<Category> categories = new HashSet<>(categoryRepository.findAllById(categoryIds));
                existing.setCategories(categories);

            }


            return repository.save(existing);
        }

        @Override
        public void delete(Long id) {
            if (!repository.existsById(id)) {
                throw new ResourceNotFoundException("Product not found");
            }
            repository.deleteById(id);
        }

    @Override
    public Product findById(Long id) {
        Product product =  repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

         return product;
        }

    @Override
    public List<ProductsImagesResponse> findImagesById(Long id) {

        List<ProductsImagesResponse> images = repository.findImagesById(id);

        if (images.isEmpty()) {
            throw new ResourceNotFoundException("No images found for product id " + id);
        }

        return images;
    }



    @Transactional(readOnly = true)
    @Override
        public Page<ProductPageResponseDTO> findAll(ProductFilterDTO filters, Pageable pageable) {

         Specification<Product> spec = ProductSpecification.withFilters(filters);

        return repository.findAll(spec, pageable)
                             .map(ProductPageResponseDTO::from);
        }

        @Override
        public void uploadImages(
                MultipartFile file,
                Long id
        )  {

            Product product = repository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            String key = storage.upload(file);

            ProductImage image = new ProductImage();
            image.setS3Key(key);
            image.setUrl("https://cloud-commerce-stack.s3.sa-east-1.amazonaws.com/" + key);
            image.setProduct(product);

            if(product.getImages().isEmpty()){
                product.setMainImage(image);
            }
            product.AddImages(image);

            repository.save(product);
             return;

        }





    }
