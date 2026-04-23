package com.project.API.cart;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.API.product.Product;
import jakarta.persistence.*;



@Entity
@Table(name = "cartItem")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int quantity;


    @ManyToOne
    @JoinColumn(name = "product_id", unique = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonIgnoreProperties("cartItem") // Impede que o Item tente serializar a lista de itens do Cart novamente
    private Cart cart;

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Long getId() {
        return id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public void increaseQuantity(){
        this.quantity = quantity + 1;
    }
    public void decreaseQuantity(){
        this.quantity = quantity - 1;
    }

}
