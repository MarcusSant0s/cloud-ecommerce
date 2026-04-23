package com.project.API.order;

import com.project.API.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
//id, user, orderitem snspashot, total status

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;


    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
     private List<OrderItem> items;

   @Column(nullable = false)
    private BigDecimal total;

   @Enumerated(EnumType.STRING)
   private OrderStatus status;

    @Column(name = "mercado_pago_preference_id")
    private String mercadoPagoPreferenceId;
    @Column(name = "mercado_pago_payment_id")
    private String mercadoPagoPaymentId;


    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public void addItem(OrderItem orderItem){
        if (this.items == null) {
            this.items = new ArrayList<>();
        }
        orderItem.setOrder(this);
        this.items.add(orderItem);

    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public String getMercadoPagoPreferenceId() {
        return mercadoPagoPreferenceId;
    }

    public String getMercadoPagoPaymentId() {
        return mercadoPagoPaymentId;
    }

    public void setMercadoPagoPaymentId(String mercadoPagoPaymentId) {
        this.mercadoPagoPaymentId = mercadoPagoPaymentId;
    }

    public void setMercadoPagoPreferenceId(String mercadoPagoPreferenceId) {
        this.mercadoPagoPreferenceId = mercadoPagoPreferenceId;
    }


}
