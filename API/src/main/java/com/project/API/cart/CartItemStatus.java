package com.project.API.cart;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum CartItemStatus {
        @JsonProperty("active")
        ACTIVE,
        @JsonProperty("checkout")
        CHECKOUT

}
