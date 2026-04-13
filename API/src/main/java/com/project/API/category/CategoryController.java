package com.project.API.category;

import com.project.API.category.DTO.ResponseCategoryDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/category")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService){
        this.categoryService = categoryService;
    }

    @RequestMapping("/all-categories")
    public List<ResponseCategoryDTO> getAllCategories(){
        return categoryService.GetAllCategories();
    }

    @RequestMapping("/find-category")
    public Optional<Category> findCategorieById(Long id){
        return categoryService.GetCategoryById(id);
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestParam String name,
                                            @RequestParam("File") MultipartFile file){
        categoryService.CreateCategory(name, file);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @DeleteMapping
    public ResponseEntity<?> deleteCategory(Long id){
        categoryService.DeleteCategory(id);

        return  ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }


}
