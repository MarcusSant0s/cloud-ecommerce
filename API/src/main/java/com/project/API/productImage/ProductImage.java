package com.project.API.productImage;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.API.product.Product;
import jakarta.persistence.*;

@Entity
@Table(
        name = "product_image"
)
public class ProductImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String s3Key;
    @Column(nullable = false)
    private String url;
    @Column(nullable = false)
    private boolean isMain;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties("images") // Impede que o produto dentro da imagem puxe a lista de imagens de novo
    private Product product;


    @Override
    public boolean equals(Object o){
        if(this == o) return true;
        if(!(o instanceof ProductImage)) return false;
        ProductImage image = (ProductImage) o;
        return id != null && id.equals(image.id);
    }

    @Override
    public int hashCode(){
        return getClass().hashCode();
    }
    public String getS3Key() {
        return s3Key;
    }

    public Long getId() {
        return id;
    }

    public void setS3Key(String s3Key) {
        this.s3Key = s3Key;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public boolean isMain() {
        return isMain;
    }

    public void setMain(boolean main) {
        isMain = main;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}
