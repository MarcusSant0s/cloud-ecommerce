package com.project.API.order;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum OrderStatus {

    @JsonProperty("pending")
    PENDING,
    @JsonProperty("paid")
    PAID,
    @JsonProperty("cancelled")
    CANCELLED,
    @JsonProperty("refunded")
    REFUNDED

}
