package com.project.API.config;

import com.mercadopago.MercadoPagoConfig;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MercadoPagoConfigClass {


    @Value("${mercadopago.access.token}")
    private String accessToken;

    @PostConstruct
    public void init(){
        MercadoPagoConfig.setAccessToken(accessToken);
    }
}
