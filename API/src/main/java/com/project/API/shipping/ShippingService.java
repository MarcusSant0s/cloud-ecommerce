package com.project.API.shipping;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Region-based shipping (frete) calculation derived from the Brazilian CEP.
 * The first CEP digit maps to a macro-region; each region has a configurable flat rate.
 */
@Service
public class ShippingService {

    @Value("${shipping.rate.sudeste}")
    private BigDecimal rateSudeste;

    @Value("${shipping.rate.sul}")
    private BigDecimal rateSul;

    @Value("${shipping.rate.centro-oeste}")
    private BigDecimal rateCentroOeste;

    @Value("${shipping.rate.norte-nordeste}")
    private BigDecimal rateNorteNordeste;

    public BigDecimal calculate(String cep) {
        return rateFor(regionFromCep(cep));
    }

    public BigDecimal rateFor(Region region) {
        return switch (region) {
            case SUDESTE -> rateSudeste;
            case SUL -> rateSul;
            case CENTRO_OESTE -> rateCentroOeste;
            case NORTE_NORDESTE -> rateNorteNordeste;
        };
    }

    public Region regionFromCep(String cep) {
        String digits = cep == null ? "" : cep.replaceAll("\\D", "");
        if (digits.length() != 8) {
            throw new IllegalArgumentException("CEP inválido: " + cep);
        }
        return switch (digits.charAt(0)) {
            case '0', '1', '2', '3' -> Region.SUDESTE;       // SP, RJ, ES, MG
            case '4', '5', '6' -> Region.NORTE_NORDESTE;     // BA, SE, PE, AL, PB, RN, CE, PI, MA, PA, AM...
            case '7' -> Region.CENTRO_OESTE;                 // DF, GO, TO, MT, MS, RO
            case '8', '9' -> Region.SUL;                     // PR, SC, RS
            default -> throw new IllegalArgumentException("CEP inválido: " + cep);
        };
    }
}
