package com.project.API.category;

import com.project.API.category.DTO.ResponseCategoryDTO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface CategoryRepository extends JpaRepository<Category, Long> {
    Boolean existsByName(String name);
    List<ResponseCategoryDTO>  findAllBy();
}
