package com.project.API.product.dto;

import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class CreateProduct {

    private String name;
    private String description;
    private int quantity;
    private BigDecimal priceOriginal;
    private BigDecimal priceDiscount;

    private Set<Long> categoryIds = new HashSet<>();

    private Set<Long> collectionIds = new HashSet<>();

    // Images are sent with the product itself so the two are created in one transaction.
    // The first file becomes the main image.
    private List<MultipartFile> files = new ArrayList<>();

    public CreateProduct() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceOriginal() {
        return priceOriginal;
    }

    public void setPriceOriginal(BigDecimal priceOriginal) {
        this.priceOriginal = priceOriginal;
    }

    public BigDecimal getPriceDiscount() {
        return priceDiscount;
    }

    public void setPriceDiscount(BigDecimal priceDiscount) {
        this.priceDiscount = priceDiscount;
    }

    public Set<Long> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(Set<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }

    public Set<Long> getCollectionIds() {
        return collectionIds;
    }

    public void setCollectionIds(Set<Long> collectionIds) {
        this.collectionIds = collectionIds;
    }

    public List<MultipartFile> getFiles() {
        return files;
    }

    public void setFiles(List<MultipartFile> files) {
        this.files = files;
    }

}
