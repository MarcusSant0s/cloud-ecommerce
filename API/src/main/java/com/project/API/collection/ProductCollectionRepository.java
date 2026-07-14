package com.project.API.collection;

import com.project.API.collection.DTO.ResponseProductCollectionDTO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ProductCollectionRepository extends JpaRepository<ProductCollection, Long> {
    Boolean existsByName(String name);
    Boolean existsByNameAndIdNot(String name, Long id);
    List<ResponseProductCollectionDTO> findAllBy();
    Optional<ResponseProductCollectionDTO> findProjectedById(Long id);
}
