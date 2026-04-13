package com.project.API.category;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(
        name = "category",
        uniqueConstraints = {
        @UniqueConstraint(columnNames = "name")
        }
)
public class Category {

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


    public Long getId() {
        return id;
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
        Category category = (Category) o;
        return Objects.equals(id, category.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
