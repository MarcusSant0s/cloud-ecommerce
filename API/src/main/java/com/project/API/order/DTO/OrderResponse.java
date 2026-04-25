package com.project.API.order.DTO;

import com.project.API.order.Order;
import com.project.API.order.OrderItem;
import com.project.API.order.OrderStatus;

import java.math.BigDecimal;
import java.util.List;

public record OrderResponse(
         List<OrderItem> items,
         BigDecimal total,
         OrderStatus status
        ) {
    public static OrderResponse fromEntity(Order order){
        return new OrderResponse(
                order.getItems(),
                order.getTotal(),
                order.getStatus()
        );
    }
}
