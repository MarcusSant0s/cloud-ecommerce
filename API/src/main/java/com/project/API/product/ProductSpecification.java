package com.project.API.product;

 import com.project.API.category.Category;
 import com.project.API.product.dto.ProductFilterDTO;
 import jakarta.persistence.criteria.Join;
 import jakarta.persistence.criteria.JoinType;
 import org.springframework.data.jpa.domain.Specification;

 import java.math.BigDecimal;
 import java.util.List;

public class ProductSpecification{
    public static Specification<Product> withFilters (ProductFilterDTO filters){
        return Specification
                .where(byCategoryId(filters.categoryId()))
                .and(byName(filters.name()))
                .and(byMinPrice(filters.minPrice()))
                .and(byMaxPrice(filters.maxPrice()))
                .and(byInStock(filters.inStock()));
    }
    private static Specification<Product> byCategoryId(Long categoryId) {
        return (root, query, cb) -> {
            System.out.println("byCategoryId chamado com: " + categoryId);
            if (categoryId == null) return null;
            query.distinct(true);
            Join<Product, Category> categories = root.join("categories", JoinType.INNER);
            return cb.equal(categories.get("id"), categoryId);
        };
    }
    private static Specification<Product> byName(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return null;
            return cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
        };
    }
    private static Specification<Product> byMinPrice(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if(minPrice == null) return null;
            return cb.greaterThanOrEqualTo(root.get("finalPrice"), minPrice);
        };
    }
    private static Specification<Product> byMaxPrice(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if(maxPrice == null) return null;
            return cb.lessThanOrEqualTo(root.get("finalPrice"), maxPrice);
        };
    }

    //revisar
    private static Specification<Product> byInStock(Boolean inStock) {
        return (root, query, cb) -> {
        //  if (inStock == null || !inStock) return null;

            return cb.greaterThan(root.get("quantity"), 0);
        };
    }


    }




