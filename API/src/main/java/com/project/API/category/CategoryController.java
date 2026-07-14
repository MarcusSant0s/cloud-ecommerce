package com.project.API.category;

import com.project.API.category.DTO.ResponseCategoryDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/category")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService){
        this.categoryService = categoryService;
    }

    @GetMapping("/all-categories")
    public List<ResponseCategoryDTO> getAllCategories(){
        return categoryService.GetAllCategories();
    }

    @GetMapping("/{id}")
    public ResponseCategoryDTO findCategoryId(@PathVariable Long id){
        return categoryService.GetCategoryById(id);
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestParam String name,
                                            @RequestPart("File") MultipartFile file){
        categoryService.CreateCategory(name, file);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory( @PathVariable Long id){
        categoryService.DeleteCategory(id);

        return  ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @PutMapping("/{category_id}")
    public ResponseEntity<Category> editCategory( @PathVariable Long category_id,
                                          @RequestParam String name,
                                          @RequestPart(value = "File", required = false)  MultipartFile file){

        return ResponseEntity.ok(categoryService.editCategory(category_id, name, file));
    }

}
