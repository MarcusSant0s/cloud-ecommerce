package com.project.API.order.DTO;

import com.project.API.order.Order;
import com.project.API.order.OrderItem;
import com.project.API.order.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
         Long id,
         List<OrderItem> items,
         BigDecimal total,
         BigDecimal shippingCost,
         OrderStatus status,
         LocalDateTime createdAt
        ) {
    public static OrderResponse fromEntity(Order order){
        return new OrderResponse(
                order.getId(),
                order.getItems(),
                order.getTotal(),
                order.getShippingCost(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }
}
