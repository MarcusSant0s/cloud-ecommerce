package com.project.API.order.DTO;

import com.project.API.order.Order;
import com.project.API.order.OrderItem;
import com.project.API.order.OrderStatus;
import com.project.API.user.User;
import com.project.API.user.UserAdress;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
         Long id,
         List<OrderItem> items,
         BigDecimal total,
         BigDecimal shippingCost,
         OrderStatus status,
         LocalDateTime createdAt,
         LocalDateTime paidAt,
         ShippingAddress shippingAddress
        ) {

    public record ShippingAddress(
            String street,
            String number,
            String bairro,
            String city,
            String cep,
            String phone
    ) {}

    public static OrderResponse fromEntity(Order order){
        // O endereço fica no usuário, não no pedido — mesma leitura que o painel
        // admin faz. Pode não existir: a conta semeada do admin não tem endereço.
        User user = order.getUser();
        ShippingAddress shippingAddress = null;
        if (user != null && user.getUserAdress() != null) {
            UserAdress address = user.getUserAdress();
            shippingAddress = new ShippingAddress(
                    address.getStreet(),
                    address.getNumber(),
                    address.getBairro(),
                    address.getCity(),
                    address.getCep(),
                    address.getPhone()
            );
        }

        return new OrderResponse(
                order.getId(),
                order.getItems(),
                order.getTotal(),
                order.getShippingCost(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getPaidAt(),
                shippingAddress
        );
    }
}
