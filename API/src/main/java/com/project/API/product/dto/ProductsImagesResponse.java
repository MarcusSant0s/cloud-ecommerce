package com.project.API.product.dto;

public interface ProductsImagesResponse
{
    Long getId();
    String getUrl();
    // Matches the "isMain" alias in ProductRepository.findImagesById — without this the
    // flag was queried but never serialized, so clients could not tell which image is main.
    Boolean getIsMain();
}
