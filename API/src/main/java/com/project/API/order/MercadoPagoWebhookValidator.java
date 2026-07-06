package com.project.API.order;

import com.project.API.commom.exception.InvalidWebhookSignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Validates the origin of Mercado Pago webhook notifications.
 *
 * <p>MP signs a manifest built from the {@code data.id} query parameter, the
 * {@code x-request-id} header and the {@code ts} carried inside {@code x-signature}:
 *
 * <pre>id:&lt;data.id&gt;;request-id:&lt;x-request-id&gt;;ts:&lt;ts&gt;;</pre>
 *
 * The HMAC-SHA256 of that manifest, keyed with the webhook secret, must match the
 * {@code v1} value inside {@code x-signature}. See
 * https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
 *
 * <p>When no secret is configured the check is skipped — local/demo deploys never
 * receive real MP callbacks — but a warning is logged so it never passes silently
 * in an environment that takes real payments. Production MUST set
 * {@code MP_WEBHOOK_SECRET}.
 */
@Component
public class MercadoPagoWebhookValidator {

    private static final Logger log = LoggerFactory.getLogger(MercadoPagoWebhookValidator.class);

    private final String secret;

    public MercadoPagoWebhookValidator(@Value("${mercadopago.webhook.secret:}") String secret) {
        this.secret = secret;
    }

    public void validate(String xSignature, String xRequestId, String dataId) {
        if (secret == null || secret.isBlank()) {
            log.warn("Mercado Pago webhook signature check skipped: mercadopago.webhook.secret is not configured");
            return;
        }

        if (xSignature == null || xSignature.isBlank()) {
            throw new InvalidWebhookSignatureException("Missing x-signature header");
        }

        String ts = null;
        String v1 = null;
        for (String part : xSignature.split(",")) {
            String[] kv = part.split("=", 2);
            if (kv.length != 2) {
                continue;
            }
            String key = kv[0].trim();
            String value = kv[1].trim();
            if ("ts".equals(key)) {
                ts = value;
            } else if ("v1".equals(key)) {
                v1 = value;
            }
        }

        if (ts == null || v1 == null) {
            throw new InvalidWebhookSignatureException("Malformed x-signature header");
        }

        String expected = hmacSha256(buildManifest(dataId, xRequestId, ts));

        // Constant-time comparison to avoid leaking the signature via timing.
        if (!MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                v1.getBytes(StandardCharsets.UTF_8))) {
            throw new InvalidWebhookSignatureException("Webhook signature mismatch");
        }
    }

    private String buildManifest(String dataId, String xRequestId, String ts) {
        StringBuilder manifest = new StringBuilder();
        if (dataId != null && !dataId.isBlank()) {
            // MP lowercases alphanumeric ids before signing.
            manifest.append("id:").append(dataId.toLowerCase()).append(";");
        }
        if (xRequestId != null && !xRequestId.isBlank()) {
            manifest.append("request-id:").append(xRequestId).append(";");
        }
        manifest.append("ts:").append(ts).append(";");
        return manifest.toString();
    }

    private String hmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Unable to compute webhook HMAC", e);
        }
    }
}
