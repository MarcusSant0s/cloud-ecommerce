package com.project.API.order.DTO;

import java.util.List;

/**
 * What the admin dashboard shows: every order still owed a shipment or a delivery,
 * each tagged with what is wrong with it. The thresholds travel along so the screen
 * can say "late" in the same terms the server used to decide it.
 */
public record AdminOrderAttentionResponse(
        int shippingSlaDays,
        int transitAlertDays,
        List<AttentionOrder> awaitingShipment,
        List<AttentionOrder> inTransit
) {
    public record AttentionOrder(AdminOrderResponse order, List<Alert> alerts) {}

    public enum Alert {
        /** Paid longer ago than the shipping SLA and still not sent. */
        LATE_SHIPMENT,
        /** Paid, but the buyer has no address on file: it cannot be sent. */
        NO_ADDRESS,
        /** Shipped longer ago than the transit threshold and not marked delivered. */
        LONG_IN_TRANSIT
    }
}
