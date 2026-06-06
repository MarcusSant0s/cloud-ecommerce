package com.project.API.cart;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.API.user.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "cart")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    private Instant createdDate;

    @Enumerated(EnumType.STRING)
    private CartStatus status;

    @ManyToOne
    @JoinColumn(name = "id_user")
    @JsonIgnoreProperties("cart")
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("cart")
    private List<CartItem> cartItem;

    // Methods

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public Long getId() {
        return id;
    }

    public List<CartItem> getCartItem() {
        return cartItem;
    }

    public void setCartItem(List<CartItem> cartItem) {
        this.cartItem = cartItem;
    }

    public CartStatus getStatus() {
        return status;
    }

    public void setStatus(CartStatus status) {
        this.status = status;
    }

    public void addCartItem(CartItem cartItem){
        this.cartItem.add(cartItem);
        cartItem.setCart(this);
    }

    public void removeCartItem( CartItem cartItem){
        this.cartItem.remove(cartItem);
        cartItem.setCart(null);
    }
}
