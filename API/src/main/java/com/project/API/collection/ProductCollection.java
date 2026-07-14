package com.project.API.collection;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.API.product.Product;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(
        name = "collection",
        uniqueConstraints = {
        @UniqueConstraint(columnNames = "name")
        }
)
public class ProductCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,
            unique = true
    )
    private String name;

    @Column(nullable = false)
    private String s3key;

    @Column(nullable = false)
    private String url;

    // Inverse side of Product.collections. Product owns the product_collection join
    // table, so the join rows can only be cleared from there — see DeleteCollection.
    @ManyToMany(mappedBy = "collections")
    @JsonIgnore
    private Set<Product> products = new HashSet<>();


    public Long getId() {
        return id;
    }

    public Set<Product> getProducts() {
        return products;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getS3key(){
        return s3key;
    }

    public void setS3key(String s3key) {
        this.s3key = s3key;
    }
    public String getUrl(){
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        ProductCollection collection = (ProductCollection) o;
        return Objects.equals(id, collection.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
