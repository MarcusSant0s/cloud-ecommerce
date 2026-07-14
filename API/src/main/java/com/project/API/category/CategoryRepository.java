package com.project.API.category;

import com.project.API.category.DTO.ResponseCategoryDTO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface CategoryRepository extends JpaRepository<Category, Long> {
    Boolean existsByName(String name);
    Boolean existsByNameAndIdNot(String name, Long id);
    List<ResponseCategoryDTO>  findAllBy();
    Optional<ResponseCategoryDTO> findProjectedById(Long id);
}
