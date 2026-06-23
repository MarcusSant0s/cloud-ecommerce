package com.project.API.shipping;

import com.project.API.commom.exception.ShippingAddressRequiredException;
import com.project.API.shipping.dto.ShippingQuote;
import com.project.API.user.User;
import com.project.API.user.UserAdress;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/shipping")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @GetMapping("/quote")
    public ShippingQuote quote(@AuthenticationPrincipal User user) {
        UserAdress address = user.getUserAdress();
        if (address == null || address.getCep() == null || address.getCep().isBlank()) {
            throw new ShippingAddressRequiredException(
                    "Cadastre um endereço de entrega para calcular o frete.");
        }
        Region region = shippingService.regionFromCep(address.getCep());
        return new ShippingQuote(region, shippingService.rateFor(region));
    }
}
