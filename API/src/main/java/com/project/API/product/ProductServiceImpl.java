package com.project.API.product;

import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.file.S3StorageService;
import com.project.API.product.dto.*;
import com.project.API.productImage.ProductImage;
import com.project.API.category.Category;
import com.project.API.category.CategoryRepository;
import com.project.API.collection.ProductCollection;
import com.project.API.collection.ProductCollectionRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
    public class ProductServiceImpl implements ProductService {

        private static final String BUCKET_URL = "https://cloud-commerce-stack.s3.sa-east-1.amazonaws.com/";

        private final CategoryRepository categoryRepository;
        private final ProductCollectionRepository collectionRepository;
        private final ProductRepository repository;
        private final S3StorageService storage;

        public ProductServiceImpl(ProductRepository repository, S3StorageService s3StorageService, CategoryRepository categoryRepository, ProductCollectionRepository collectionRepository) {
            this.categoryRepository = categoryRepository;
            this.collectionRepository = collectionRepository;
            this.repository = repository;
            this.storage = s3StorageService;
        }

        @Override
        @Transactional
        public Product create(CreateProduct createProduct) {

            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(createProduct.getCategoryIds()));
            Set<ProductCollection> collections = new HashSet<>(collectionRepository.findAllById(createProduct.getCollectionIds()));

            Product product = ProductMapper.toEntity(createProduct);
            product.setCategories(categories);
            product.setCollections(collections);

            // Images come in with the product, so a failed upload rolls the product back
            // instead of leaving a half-created product behind for the admin to retry.
            attachImages(product, createProduct.getFiles());

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

            ObjectMapper mapper = new ObjectMapper();

            //Category
            if(product.categoryIds() != null && !product.categoryIds().isBlank()){
                List<Long> categoryIds = mapper.readValue(
                        product.categoryIds(),
                        new TypeReference<List<Long>>() {}
                );
                Set<Category> categories = new HashSet<>(categoryRepository.findAllById(categoryIds));
                existing.setCategories(categories);
            }

            //Collection
            if(product.collectionIds() != null && !product.collectionIds().isBlank()){
                List<Long> collectionIds = mapper.readValue(
                        product.collectionIds(),
                        new TypeReference<List<Long>>() {}
                );
                Set<ProductCollection> collections = new HashSet<>(collectionRepository.findAllById(collectionIds));
                existing.setCollections(collections);
            }


            return repository.save(existing);
        }

        @Override
        @Transactional
        public void delete(Long id) {
            Product product = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            // Image rows cascade away with the product, but the S3 objects would be left
            // behind forever. Collected before the delete, dropped once it sticks.
            List<String> keys = product.getImages().stream()
                    .map(ProductImage::getS3Key)
                    .toList();

            repository.delete(product);
            repository.flush();

            keys.forEach(storage::delete);
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
        @Transactional
        public void uploadImages(
                List<MultipartFile> files,
                Long id
        )  {

            Product product = repository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            attachImages(product, files);

            repository.save(product);
        }

        // Uploads each file and hangs the resulting images off the product.
        private void attachImages(Product product, List<d> files) {

            if (files == null || files.isEmpty()) {
                return;
            }

            List<String> uploadedKeys = new ArrayList<>();

            // S3 is not transactional: an upload that succeeds before the transaction fails
            // (bad upload, constraint violation on commit, ...) would strand the object in
            // the bucket. Tying the cleanup to the transaction covers every rollback path.
            registerRollbackCleanup(uploadedKeys);

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }

                String key = storage.upload(file);
                uploadedKeys.add(key);

                ProductImage image = new ProductImage();
                image.setS3Key(key);
                image.setUrl(BUCKET_URL + key);

                // A product's first image is its main one. This flag used to be left at
                // false, so API-created products had a main image that reported isMain=false.
                boolean isFirst = product.getImages().isEmpty();
                image.setMain(isFirst);

                product.AddImages(image);

                if (isFirst) {
                    product.setMainImage(image);
                }
            }
        }

        private void registerRollbackCleanup(List<String> uploadedKeys) {

            if (!TransactionSynchronizationManager.isSynchronizationActive()) {
                return;
            }

            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    if (status == STATUS_COMMITTED) {
                        return;
                    }
                    for (String key : uploadedKeys) {
                        try {
                            storage.delete(key);
                        } catch (RuntimeException cleanupFailure) {
                            // Best effort — the original failure is what the caller must see.
                        }
                    }
                }
            });
        }





    }
