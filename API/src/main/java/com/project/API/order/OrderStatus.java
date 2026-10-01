package com.project.API.order;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum OrderStatus {

    @JsonProperty("pending")
    PENDING,
    @JsonProperty("paid")
    PAID,
    // Fulfilment, after PAID: the parcel left (SHIPPED) and reached the buyer (DELIVERED).
    @JsonProperty("shipped")
    SHIPPED,
    @JsonProperty("delivered")
    DELIVERED,
    @JsonProperty("cancelled")
    CANCELLED,
    @JsonProperty("refunded")
    REFUNDED

}
