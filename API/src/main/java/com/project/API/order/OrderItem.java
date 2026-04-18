package com.project.API.order;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Order order;

    // snapshot
    private Long productId;
    private String productName;
    private BigDecimal unitPrice;  // preço no momento da compra
    private int quantity;
}
