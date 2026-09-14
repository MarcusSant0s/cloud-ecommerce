package com.project.API.user.dto;

import com.project.API.order.Order;
import com.project.API.user.User;
import com.project.API.user.UserAdress;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

// Visão completa de um usuário para o painel admin: perfil, endereço e o
// histórico que decide se a conta pode ser apagada.
public record AdminUserDetailResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String role,
        Instant createdAt,
        Address address,
        long cartCount,
        long orderCount,
        boolean deletable,
        List<OrderSummary> orders
) {

    public record Address(
            Long id,
            String street,
            String number,
            String bairro,
            String city,
            String cep,
            String phone
    ) {}

    public record OrderSummary(
            Long id,
            String status,
            BigDecimal total,
            LocalDateTime createdAt
    ) {}

    public static AdminUserDetailResponse from(
            User user,
            long cartCount,
            List<Order> orders
    ) {
        UserAdress adress = user.getUserAdress();
        Address address = adress == null ? null : new Address(
                adress.getId(),
                adress.getStreet(),
                adress.getNumber(),
                adress.getBairro(),
                adress.getCity(),
                adress.getCep(),
                adress.getPhone()
        );

        List<OrderSummary> orderSummaries = orders.stream()
                .map(order -> new OrderSummary(
                        order.getId(),
                        order.getStatus() == null ? null : order.getStatus().name(),
                        order.getTotal(),
                        order.getCreatedAt()
                ))
                .toList();

        return new AdminUserDetailResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt(),
                address,
                cartCount,
                orderSummaries.size(),
                // Mesma regra aplicada no serviço antes de apagar de fato.
                cartCount == 0 && orderSummaries.isEmpty(),
                orderSummaries
        );
    }
}
