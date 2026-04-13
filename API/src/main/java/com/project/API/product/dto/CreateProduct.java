package com.project.API.product.dto;

import com.project.API.category.Category;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

public class CreateProduct {

    private String name;
    private String description;
    private int quantity;
    private BigDecimal priceOriginal;
    private BigDecimal priceDiscount;
    private Set<Category> categories = new HashSet<>();

    private Set<Long> categoryIds = new HashSet<>();

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
    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }


}
