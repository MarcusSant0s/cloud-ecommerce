package com.project.API.collection;

import com.project.API.collection.DTO.ResponseProductCollectionDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/collection")
public class ProductCollectionController {

    private final ProductCollectionService collectionService;

    public ProductCollectionController(ProductCollectionService collectionService){
        this.collectionService = collectionService;
    }

    @GetMapping("/all-collections")
    public List<ResponseProductCollectionDTO> getAllCollections(){
        return collectionService.GetAllCollections();
    }

    @GetMapping("/{id}")
    public ResponseProductCollectionDTO findCollectionId(@PathVariable Long id){
        return collectionService.GetCollectionById(id);
    }

    @PostMapping
    public ResponseEntity<?> createCollection(@RequestParam String name,
                                              @RequestPart("File") MultipartFile file){
        collectionService.CreateCollection(name, file);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCollection(@PathVariable Long id){
        collectionService.DeleteCollection(id);

        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @PutMapping("/{collection_id}")
    public ResponseEntity<ProductCollection> editCollection(@PathVariable Long collection_id,
                                                            @RequestParam String name,
                                                            @RequestPart(value = "File", required = false) MultipartFile file){

        return ResponseEntity.ok(collectionService.editCollection(collection_id, name, file));
    }

}
