package com.project.API.order;

import com.project.API.commom.exception.InvalidWebhookSignatureException;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.*;

class MercadoPagoWebhookValidatorTest {

    private static final String SECRET = "super-secret-key";
    private static final String DATA_ID = "123456";
    private static final String REQUEST_ID = "req-abc-1";
    private static final String TS = "1700000000";

    private String sign(String dataId, String requestId, String ts, String secret) {
        String manifest = "id:" + dataId.toLowerCase() + ";request-id:" + requestId + ";ts:" + ts + ";";
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String header(String ts, String v1) {
        return "ts=" + ts + ",v1=" + v1;
    }

    @Test
    void validate_shouldPass_whenSignatureMatches() {
        var validator = new MercadoPagoWebhookValidator(SECRET);
        String v1 = sign(DATA_ID, REQUEST_ID, TS, SECRET);

        assertDoesNotThrow(() -> validator.validate(header(TS, v1), REQUEST_ID, DATA_ID));
    }

    @Test
    void validate_shouldThrow_whenSignatureComputedWithWrongSecret() {
        var validator = new MercadoPagoWebhookValidator(SECRET);
        String v1 = sign(DATA_ID, REQUEST_ID, TS, "attacker-secret");

        assertThrows(InvalidWebhookSignatureException.class,
                () -> validator.validate(header(TS, v1), REQUEST_ID, DATA_ID));
    }

    @Test
    void validate_shouldThrow_whenDataIdTampered() {
        var validator = new MercadoPagoWebhookValidator(SECRET);
        String v1 = sign(DATA_ID, REQUEST_ID, TS, SECRET);

        assertThrows(InvalidWebhookSignatureException.class,
                () -> validator.validate(header(TS, v1), REQUEST_ID, "999999"));
    }

    @Test
    void validate_shouldThrow_whenSignatureHeaderMissing() {
        var validator = new MercadoPagoWebhookValidator(SECRET);

        assertThrows(InvalidWebhookSignatureException.class,
                () -> validator.validate(null, REQUEST_ID, DATA_ID));
    }

    @Test
    void validate_shouldThrow_whenSignatureHeaderMalformed() {
        var validator = new MercadoPagoWebhookValidator(SECRET);

        assertThrows(InvalidWebhookSignatureException.class,
                () -> validator.validate("garbage-no-ts-or-v1", REQUEST_ID, DATA_ID));
    }

    @Test
    void validate_shouldSkip_whenSecretNotConfigured() {
        var validator = new MercadoPagoWebhookValidator("");

        // No secret => check disabled, must not throw even with a bogus signature.
        assertDoesNotThrow(() -> validator.validate("ts=1,v1=deadbeef", REQUEST_ID, DATA_ID));
    }
}
