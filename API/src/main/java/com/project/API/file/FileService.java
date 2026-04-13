package com.project.API.file;

import com.project.API.product.Product;
import com.project.API.productImage.ProductImage;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class FileService {

    private final S3StorageService storage;
    private final FileRepository fileRepository;


    public FileService(S3StorageService storage, FileRepository fileRepository){
        this.storage = storage;
        this.fileRepository = fileRepository;
    }

    @Transactional
    public String CreateFile(MultipartFile file, Product product) throws IOException {
        String key = storage.upload(file);

        ProductImage image = new ProductImage();
        image.setS3Key(key);
        image.setUrl("https://cloud-commerce-stack.s3.sa-east-1.amazonaws.com/" + key);
        image.setProduct(product);

         fileRepository.save(image);

        return image.getUrl();

    }
}
