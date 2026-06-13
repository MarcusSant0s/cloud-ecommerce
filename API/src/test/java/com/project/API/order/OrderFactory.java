package com.project.API.order;

import com.project.API.cart.Cart;
import com.project.API.cart.CartItem;
import com.project.API.cart.CartStatus;
import com.project.API.product.Product;
import com.project.API.user.User;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderFactory {

    public static User mockUser(Long id) {
        User user = Mockito.mock(User.class);
        Mockito.when(user.getId()).thenReturn(id);
        return user;
    }

    public static Product mockProduct(Long id, int stock, BigDecimal price) {
        Product product = Mockito.mock(Product.class);
        Mockito.when(product.getId()).thenReturn(id);
        Mockito.when(product.getQuantity()).thenReturn(stock);
        Mockito.when(product.getFinalPrice()).thenReturn(price);
        Mockito.when(product.getName()).thenReturn("Product " + id);
        Mockito.when(product.getDescription()).thenReturn("desc");
        Mockito.when(product.getMainImage()).thenReturn(null);
        return product;
    }

    public static CartItem mockCartItem(Long id, Product product, int quantity) {
        CartItem item = Mockito.mock(CartItem.class);
        Mockito.when(item.getId()).thenReturn(id);
        Mockito.when(item.getProduct()).thenReturn(product);
        Mockito.when(item.getQuantity()).thenReturn(quantity);
        return item;
    }

    public static Cart mockCart(Long id, User user, CartStatus status, List<CartItem> items) {
        Cart cart = Mockito.mock(Cart.class);
        Mockito.when(cart.getId()).thenReturn(id);
        Mockito.when(cart.getUser()).thenReturn(user);
        Mockito.when(cart.getStatus()).thenReturn(status);
        Mockito.when(cart.getCartItem()).thenReturn(items);
        return cart;
    }

    public static Order orderWithItems(User user, OrderStatus status, List<OrderItem> items) {
        Order order = new Order();
        order.setUser(user);
        order.setStatus(status);
        order.setTotal(BigDecimal.TEN);
        order.setCreatedAt(LocalDateTime.now().minusHours(2));
        items.forEach(order::addItem);
        return order;
    }

    public static OrderItem orderItem(Long productId, int quantity) {
        return new OrderItem(productId, "Product " + productId, BigDecimal.TEN, quantity, "url", "desc");
    }

    public static List<OrderItem> singleItem(Long productId, int quantity) {
        List<OrderItem> list = new ArrayList<>();
        list.add(orderItem(productId, quantity));
        return list;
    }
}
