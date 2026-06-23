package com.project.API.shipping;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ShippingServiceTest {

    private ShippingService shippingService;

    @BeforeEach
    void setUp() {
        shippingService = new ShippingService();
        ReflectionTestUtils.setField(shippingService, "rateSudeste", new BigDecimal("15.00"));
        ReflectionTestUtils.setField(shippingService, "rateSul", new BigDecimal("20.00"));
        ReflectionTestUtils.setField(shippingService, "rateCentroOeste", new BigDecimal("25.00"));
        ReflectionTestUtils.setField(shippingService, "rateNorteNordeste", new BigDecimal("30.00"));
    }

    @Test
    void regionFromCep_mapsFirstDigitToRegion() {
        assertEquals(Region.SUDESTE, shippingService.regionFromCep("01310-100"));        // SP
        assertEquals(Region.SUDESTE, shippingService.regionFromCep("20040-002"));        // RJ
        assertEquals(Region.SUDESTE, shippingService.regionFromCep("30110-012"));        // MG
        assertEquals(Region.NORTE_NORDESTE, shippingService.regionFromCep("40010-000")); // BA
        assertEquals(Region.NORTE_NORDESTE, shippingService.regionFromCep("66010-000")); // PA
        assertEquals(Region.CENTRO_OESTE, shippingService.regionFromCep("70040-010"));   // DF
        assertEquals(Region.SUL, shippingService.regionFromCep("80010-000"));            // PR
        assertEquals(Region.SUL, shippingService.regionFromCep("90010-000"));            // RS
    }

    @Test
    void calculate_returnsConfiguredRatePerRegion() {
        assertEquals(new BigDecimal("15.00"), shippingService.calculate("01310-100"));
        assertEquals(new BigDecimal("20.00"), shippingService.calculate("80010-000"));
        assertEquals(new BigDecimal("25.00"), shippingService.calculate("70040-010"));
        assertEquals(new BigDecimal("30.00"), shippingService.calculate("40010-000"));
    }

    @Test
    void regionFromCep_acceptsUnformattedCep() {
        assertEquals(Region.SUDESTE, shippingService.regionFromCep("01310100"));
    }

    @Test
    void regionFromCep_rejectsInvalidCep() {
        assertThrows(IllegalArgumentException.class, () -> shippingService.regionFromCep(null));
        assertThrows(IllegalArgumentException.class, () -> shippingService.regionFromCep(""));
        assertThrows(IllegalArgumentException.class, () -> shippingService.regionFromCep("123"));
        assertThrows(IllegalArgumentException.class, () -> shippingService.regionFromCep("abcdefgh"));
    }
}
