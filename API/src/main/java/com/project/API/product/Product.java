package com.project.API.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.API.cart.Cart;
import com.project.API.cart.CartItem;
import com.project.API.productImage.ProductImage;
import com.project.API.category.Category;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.JoinFormula;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(
        name = "Product"
)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable  = false)
    private String name;

    @Column(nullable  = false)
    private String description;

    @Column(nullable  = false)
    private int quantity;

    @Column(nullable  = false)
    private BigDecimal priceOriginal;

    // Disount percentage ex: 5% -> 0.05
    @DecimalMin("0.01")
    @DecimalMax("0.9")
    @Column(nullable  = true)
    private BigDecimal priceDiscount;

    @Formula("price_original * (1 - price_discount)")
    private BigDecimal finalPrice;

    @ManyToMany()
    @JoinTable(
            name = "product_category",
            joinColumns = @JoinColumn(name = "product_id"),
             inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();


    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("product")
    private Set<ProductImage> images = new HashSet<>();

    @OneToOne
    @JoinColumn(name = "main_image_id", nullable = true)
    @JsonIgnoreProperties("product")
    private ProductImage mainImage;

    // Methods
    public void AddImages(ProductImage image){
        images.add(image);
        image.setProduct(this);
    }

    public void RemoveImages(ProductImage image){
        this.images.remove(image);
        image.setProduct(null);
    }

    public ProductImage getMainImage() {
        return mainImage;
    }

    public void setMainImage(ProductImage mainImage) {
        this.mainImage = mainImage;
    }

    public Set<ProductImage> getImages(){
        return images;
    }

    public void setImages(Set<ProductImage> images) {
        this.images = images;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }

    public void AddCategory(Category category){
        categories.add(category);
    }

    public void RemoveCategory(Category category){
        categories.remove(category);
    }

    public Long getId() {
        return id;
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

    public BigDecimal getFinalPrice() {
        return finalPrice;
    }
}
