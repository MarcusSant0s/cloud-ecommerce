package com.project.API.order.DTO;

import com.project.API.order.Order;
import com.project.API.order.OrderItem;
import com.project.API.order.OrderStatus;
import com.project.API.user.User;
import com.project.API.user.UserAdress;

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
        Customer customer,
        ShippingAddress shippingAddress
) {
    public record Customer(Long id, String firstName, String lastName, String email) {}

    public record ShippingAddress(String street, String number, String city, String cep) {}

    public static AdminOrderResponse fromEntity(Order order) {
        User user = order.getUser();
        Customer customer = user == null
                ? null
                : new Customer(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail());

        ShippingAddress shippingAddress = null;
        if (user != null && user.getUserAdress() != null) {
            UserAdress address = user.getUserAdress();
            shippingAddress = new ShippingAddress(
                    address.getStreet(),
                    address.getNumber(),
                    address.getCity(),
                    address.getCep()
            );
        }

        return new AdminOrderResponse(
                order.getId(),
                order.getItems(),
                order.getTotal(),
                order.getShippingCost(),
                order.getStatus(),
                order.getCreatedAt(),
                customer,
                shippingAddress
        );
    }
}
