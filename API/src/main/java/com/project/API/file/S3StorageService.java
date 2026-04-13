package com.project.API.file;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3StorageService {

    private final S3Client s3Client;

    public S3StorageService(S3Client s3Client){
        this.s3Client = s3Client;
    }

    public String upload(MultipartFile file) {
        String key = UUID.randomUUID() + "-" + file.getOriginalFilename();

        try {
        s3Client.putObject(
                PutObjectRequest.builder()
                .bucket("cloud-commerce-stack")
                .key(key)
                .build(),
                RequestBody.fromBytes(file.getBytes())
        );

        } catch (IOException e) {
            throw new RuntimeException("Erro no upload", e);
        }

        return key;
    }

    public void delete(String key){
        try {

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket("cloud-commerce-stack")
                    .key(key)
                    .build();


            s3Client.deleteObject(deleteObjectRequest);
        } catch (S3Exception e) {
            throw new RuntimeException("Erro no delete", e);
        }

    }

}
