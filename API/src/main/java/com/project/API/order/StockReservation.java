package com.project.API.order;

import com.project.API.cart.exception.InsufficientStockException;
import com.project.API.product.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Holds an order's units out of stock while it is open, and hands them back when it
 * is not.
 *
 * <p>Stock used to come off only when the payment was approved. Checkout checked it,
 * but reserved nothing, so two buyers could both check out the last unit and both
 * pay — Pix can take a while — and the second approval found nothing to take. Now the
 * units leave stock when the order is created, and {@link Order#isStockReserved()}
 * records that this order holds them, so taking or returning them twice is a no-op.
 *
 * <p>Items with a non-positive quantity are skipped everywhere: the queries do
 * {@code quantity - :qty}, so a negative one would add stock.
 */
@Component
public class StockReservation {

    private static final Logger log = LoggerFactory.getLogger(StockReservation.class);

    private final ProductRepository productRepository;

    public StockReservation(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Takes every item out of stock, or none. The first item short throws, and the
     * caller's transaction rolls back the items already taken — so this must run inside
     * one.
     */
    public void reserve(Order order) {
        if (order.isStockReserved()) return;

        for (OrderItem item : order.getItems()) {
            if (item.getQuantity() <= 0) continue;
            if (productRepository.decrementStock(item.getProductId(), item.getQuantity()) == 0) {
                int available = productRepository.findQuantityById(item.getProductId()).orElse(0);
                throw new InsufficientStockException(
                        "Estoque insuficiente para " + item.getProductName() + ": apenas " + available + " disponíveis");
            }
        }
        order.setStockReserved(true);
    }

    /**
     * For an order whose money already came in but holds no stock: one created before
     * reservations existed, or one cancelled and then paid anyway (Pix landing after
     * the cleanup sweep). Refusing would not return the money, so this takes what is
     * there and logs what is not, for someone to sort out by hand.
     */
    public void reserveForPaidOrder(Order order) {
        if (order.isStockReserved()) return;

        for (OrderItem item : order.getItems()) {
            if (item.getQuantity() <= 0) continue;
            if (productRepository.decrementStock(item.getProductId(), item.getQuantity()) == 0) {
                int available = productRepository.findQuantityById(item.getProductId()).orElse(0);
                log.error("Pedido {} pago sem baixa de estoque: produto {} pediu {}, disponível {}",
                        order.getId(), item.getProductId(), item.getQuantity(), available);
            }
        }
        order.setStockReserved(true);
    }

    /** Hands the order's units back to stock. */
    public void release(Order order) {
        if (!order.isStockReserved()) return;

        for (OrderItem item : order.getItems()) {
            if (item.getQuantity() <= 0) continue;
            productRepository.incrementStock(item.getProductId(), item.getQuantity());
        }
        order.setStockReserved(false);
    }
}
