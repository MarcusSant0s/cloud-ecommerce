package com.project.API.order.DTO;

import com.project.API.order.Order;
import com.project.API.order.OrderItem;
import com.project.API.order.OrderStatus;
import com.project.API.user.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminOrderResponse(
        Long id,
        List<OrderItem> items,
        BigDecimal total,
        BigDecimal shippingCost,
        OrderStatus status,
        LocalDateTime createdAt,
        Customer customer
) {
    public record Customer(Long id, String firstName, String lastName, String email) {}

    public static AdminOrderResponse fromEntity(Order order) {
        User user = order.getUser();
        Customer customer = user == null
                ? null
                : new Customer(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail());

        return new AdminOrderResponse(
                order.getId(),
                order.getItems(),
                order.getTotal(),
                order.getShippingCost(),
                order.getStatus(),
                order.getCreatedAt(),
                customer
        );
    }
}
