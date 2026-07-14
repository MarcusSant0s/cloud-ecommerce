package com.project.API.collection;

import com.project.API.collection.DTO.ResponseProductCollectionDTO;
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
public class ProductCollectionService {

    private static final String BUCKET_URL = "https://cloud-commerce-stack.s3.sa-east-1.amazonaws.com/";

    private final ProductCollectionRepository collectionRepository;
    private final S3StorageService storageService;

    public ProductCollectionService(ProductCollectionRepository collectionRepository, S3StorageService storageService){
        this.collectionRepository = collectionRepository;
        this.storageService = storageService;
    }

    public List<ResponseProductCollectionDTO> GetAllCollections(){
        return collectionRepository.findAllBy();
    }

    public ResponseProductCollectionDTO GetCollectionById(Long id){
        return collectionRepository.findProjectedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
    }

    public ProductCollection CreateCollection(String name, MultipartFile file){

        name = name.trim();

        if (name.isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        // Checked before the upload: letting the insert fail on the unique constraint
        // would leave the file already orphaned in S3.
        if (collectionRepository.existsByName(name)) {
            throw new DuplicateResourceException("Collection '" + name + "' already exists");
        }

        String key = storageService.upload(file);

        ProductCollection collection = new ProductCollection();
        collection.setName(name);
        collection.setS3key(key);
        collection.setUrl(BUCKET_URL + key);

        return collectionRepository.save(collection);
    }

    @Transactional
    public void DeleteCollection(Long id){

        ProductCollection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));

        // Product owns the product_collection join table, so the rows have to be cleared
        // from that side before the collection row can go — the FK rejects it otherwise.
        for (Product product : new HashSet<>(collection.getProducts())) {
            product.RemoveCollection(collection);
        }
        collection.getProducts().clear();

        // Flushed before touching S3 so a rejected delete doesn't destroy the image.
        collectionRepository.delete(collection);
        collectionRepository.flush();

        storageService.delete(collection.getS3key());
    }

    @Transactional
    public ProductCollection editCollection(Long collection_id, String name, MultipartFile file){
        ProductCollection collection = collectionRepository.findById(collection_id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));

        if(name != null && !name.isBlank()){
            name = name.trim();
            if (collectionRepository.existsByNameAndIdNot(name, collection_id)) {
                throw new DuplicateResourceException("Collection '" + name + "' already exists");
            }
            collection.setName(name);
        }
        if(file != null && !file.isEmpty()){
            // New image goes up before the old one comes down, so a failed upload doesn't
            // leave the collection pointing at an object that no longer exists.
            String oldKey = collection.getS3key();
            String key = storageService.upload(file);
            collection.setS3key(key);
            collection.setUrl(BUCKET_URL + key);
            storageService.delete(oldKey);
        }

        return collection;
    }
}
