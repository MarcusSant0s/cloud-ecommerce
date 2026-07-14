package com.project.API.category;

import com.project.API.category.DTO.ResponseCategoryDTO;
import com.project.API.commom.exception.DuplicateResourceException;
import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.file.S3StorageService;
import com.project.API.product.Product;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;

@Service
public class CategoryService {

    private static final String BUCKET_URL = "https://cloud-commerce-stack.s3.sa-east-1.amazonaws.com/";

    private final CategoryRepository categoryRepository;
    private final S3StorageService storageService;

    public CategoryService(CategoryRepository categoryRepository, S3StorageService storageService){
        this.categoryRepository = categoryRepository;
        this.storageService = storageService;
    }

    public List<ResponseCategoryDTO> GetAllCategories(){
        return categoryRepository.findAllBy();
    }

    public ResponseCategoryDTO GetCategoryById(Long id){
        return categoryRepository.findProjectedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    public Category CreateCategory(String name, MultipartFile file){

        name = name.trim();

        if (name.isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        // Checked before the upload: letting the insert fail on the unique constraint
        // would leave the file already orphaned in S3.
        if (categoryRepository.existsByName(name)) {
            throw new DuplicateResourceException("Category '" + name + "' already exists");
        }

        String key = storageService.upload(file);

        Category category = new Category();
        category.setName(name);
        category.setS3key(key);
        category.setUrl(BUCKET_URL + key);

        return categoryRepository.save(category);
    }

    @Transactional
    public void DeleteCategory(Long id){

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Product owns the product_category join table, so the rows have to be cleared
        // from that side before the category row can go — the FK rejects it otherwise.
        for (Product product : new HashSet<>(category.getProducts())) {
            product.RemoveCategory(category);
        }
        category.getProducts().clear();

        // Flushed before touching S3 so a rejected delete doesn't destroy the image.
        categoryRepository.delete(category);
        categoryRepository.flush();

        storageService.delete(category.getS3key());
    }

    @Transactional
    public Category editCategory(Long category_id, String name, MultipartFile file){
        Category category = categoryRepository.findById(category_id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if(name != null && !name.isBlank()){
            name = name.trim();
            if (categoryRepository.existsByNameAndIdNot(name, category_id)) {
                throw new DuplicateResourceException("Category '" + name + "' already exists");
            }
            category.setName(name);
        }
        if(file != null && !file.isEmpty()){
            // New image goes up before the old one comes down, so a failed upload doesn't
            // leave the category pointing at an object that no longer exists.
            String oldKey = category.getS3key();
            String key = storageService.upload(file);
            category.setS3key(key);
            category.setUrl(BUCKET_URL + key);
            storageService.delete(oldKey);
        }

        return category;
    }
}
