package com.project.API.cart.dto;


import java.util.List;

public record MergeCartDTO(
        List<GuestItemDTO> items
) {
}

