package com.project.API.product;

import com.project.API.file.S3StorageService;
import com.project.API.product.dto.CreateProduct;
import com.project.API.product.dto.ProductFilterDTO;
import com.project.API.product.dto.ProductMapper;
import com.project.API.product.dto.ProductPageResponseDTO;
import com.project.API.productImage.ProductImage;
import com.project.API.category.Category;
import com.project.API.category.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

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
        public Product update(Long id, Product product) {
            Product existing = repository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));

            existing.setName(product.getName());
            existing.setDescription(product.getDescription());
            existing.setQuantity(product.getQuantity());
            existing.setPriceOriginal(product.getPriceOriginal());
            existing.setPriceDiscount(product.getPriceDiscount());
            existing.setCategories(product.getCategories());

            return repository.save(existing);
        }

        @Override
        public void delete(Long id) {
            if (!repository.existsById(id)) {
                throw new EntityNotFoundException("Product not found");
            }
            repository.deleteById(id);
        }

        @Override
        public Product findById(Long id) {
            return repository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        }

    @Transactional(readOnly = true)
    @Override
        public Page<ProductPageResponseDTO> findAll(ProductFilterDTO filters, Pageable pageable) {
         Specification<Product> spec = ProductSpecification.withFilters(filters);
        return repository.findAll   (spec, pageable)
                    .map(ProductPageResponseDTO::from);
        }

        @Override
        public void UploadImages(
                        @RequestParam("File") @NotNull MultipartFile file,
                        @PathVariable Long id )  {

            Product product = repository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Product not found"));

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
