package com.project.API.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.API.cart.Cart;
import com.project.API.order.Order;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Entity
@Table(
        name="users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "user")
    @JsonIgnoreProperties("user")
    private List<Cart> cart;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> order;

    @OneToOne
    @JoinColumn(name = "user_adress_id")
    private UserAdress userAdress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "user_role")
    private Role userRole = Role.USER;



   //JPA constructor
   protected User() {    }

    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    // ========== UserDetails ==========

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + userRole.name())); // ou roles depois
    }

    @Override
    public String getUsername() {
        return email; // Spring usa isso como "login"
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }


    // Getter Setters
    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getFirstName(){
        return firstName;
    }
    public void setFirstName(String firstName){
        this.firstName = firstName;
    }
    public String getLastName(){
        return lastName;
    }
    public void setLastName(String lastName){
        this.lastName = lastName;
    }

    public String getEmail(){
        return email;
    }
    public void setEmail(String email){
        this.email = email;
    }
    public void changePassword(String hashedPassword){
        this.password = hashedPassword;
    }

    public List<Cart> getCart() {
        return cart;
    }
    public void setCart(List<Cart> cart) {
        this.cart = cart;
    }

    public List<Order> getOrder() {
        return order;
    }
    public void setOrder(List<Order> order) {
        this.order = order;
    }

    public UserAdress getUserAdress() {
        return userAdress;
    }
    public void setUserAdress(UserAdress userAdress) {
        this.userAdress = userAdress;
    }

    public Role getRole() {
        return userRole;
    }
    public void setRole(Role role) {
        this.userRole = role;
    }
}
