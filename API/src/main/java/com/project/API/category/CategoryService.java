package com.project.API.category;

import com.project.API.category.DTO.ResponseCategoryDTO;
import com.project.API.file.S3StorageService;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final S3StorageService storageService;

    public CategoryService(CategoryRepository categoryRepository, S3StorageService storageService){
        this.categoryRepository = categoryRepository;
        this.storageService = storageService;
    }
    public List<ResponseCategoryDTO> GetAllCategories(){
        return categoryRepository.findAllBy();
    }
    
    public Optional<Category> GetCategoryById(Long id){
        return categoryRepository.findById(id);
    }

    public Category CreateCategory(String name, MultipartFile file){

        name = name.trim();

        if (name.isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        String key = storageService.upload(file);


        Category category = new Category();
        category.setName(name);
        category.setS3key(key);
        category.setUrl("https://cloud-commerce-stack.s3.sa-east-1.amazonaws.com/" + key);

        try {
            return categoryRepository.save(category);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Category already exists");
        }    }

    public void DeleteCategory(Long id){

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        try {
            storageService.delete(category.getS3key());
            categoryRepository.deleteById(category.getId());
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar categoria", e);
        }

    }

    @Transactional
    public Category editCategory(Long category_id, String name, MultipartFile file){
        Category category = categoryRepository.findById(category_id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if(name != null && !name.isEmpty()){
            category.setName(name);
        }
        if(file != null && !file.isEmpty()){
            storageService.delete(category.getS3key());
            String key = storageService.upload(file);
            category.setS3key(key);
            category.setUrl("https://cloud-commerce-stack.s3.sa-east-1.amazonaws.com/" + key);
        }


        return category;
    }
}
