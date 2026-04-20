package com.project.API.order;

import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.project.API.cart.Cart;
import com.project.API.cart.CartItem;
import com.project.API.cart.CartItemStatus;
import com.project.API.cart.CartRepository;
import com.project.API.config.ResourceNotFoundException;
import com.project.API.product.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImp implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public OrderServiceImp(OrderRepository orderRepository, CartRepository cartRepository, ProductRepository productRepository){
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    @Override
    public Order createOrder(Long userId) {

        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartItemStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.setStatus(CartItemStatus.CHECKOUT);

        List<CartItem> cartItems = cart.getCartItem();

        Order order = new Order();

        for(CartItem cartItem : cartItems){
            validateStockAvailability(cartItem.getProduct().getId(), cartItem.getQuantity());

            OrderItem orderItem = new OrderItem(
                    cartItem.getProduct().getId(),
                    cartItem.getProduct().getName(),
                    cartItem.getProduct().getFinalPrice(),
                    cartItem.getQuantity(),
                    cartItem.getProduct().getMainImage().getUrl(),
                    cartItem.getProduct().getDescription()
            );

            order.addItem(orderItem);
        }

        order.setStatus(OrderStatus.PENDING);
        order.setUser(cart.getUser());
        order.setTotal(
                cartItems.stream()
                        .map(i -> i.getProduct().getFinalPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

       return orderRepository.save(order);
    }

     @Override
     public String createChekout(Long orderId) throws MPException, MPApiException {
         Order order = orderRepository.findById(orderId)
                 .orElseThrow(() -> new RuntimeException("Order not found"));

         List<PreferenceItemRequest> items = order.getItems().stream()
                 .map(item -> PreferenceItemRequest.builder()
                         .id(item.getProductId().toString())
                         .title(item.getProductName())
                         .description(item.getDescription())
                         .pictureUrl(item.getUrl())
                         .quantity(item.getQuantity())
                         .currencyId("BRL")
                         .unitPrice(item.getUnitPrice())
                         .build()
                 ).toList();

         PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                 .success("https://seusite.com/orders/success")
                 .failure("https://seusite.com/orders/failure")
                 .pending("https://seusite.com/orders/pending")
                 .build();

         PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                 .items(items)
                 .backUrls(backUrls)
                 .autoReturn("approved")
                 .build();

         PreferenceClient client = new PreferenceClient();
         Preference preference = client.create(preferenceRequest);

         order.setMercadoPagoPreferenceId(preference.getId());
         orderRepository.save(order);

         return preference.getInitPoint();

    }



    private void validateStockAvailability(Long productId, int requestedQuantity) {
        int stock = productRepository.findQuantityById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (stock < requestedQuantity){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estoque insuficiente: apenas " + stock + " disponíveis");        }
    }



}
