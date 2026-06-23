package com.project.API.shipping.dto;

import com.project.API.shipping.Region;

import java.math.BigDecimal;

public record ShippingQuote(Region region, BigDecimal cost) {}
