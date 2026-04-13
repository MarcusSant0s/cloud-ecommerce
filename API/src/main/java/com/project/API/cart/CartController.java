package com.project.API.cart;

import com.project.API.cart.dto.CartResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<Void> addItem(
            @PathVariable Long userId,
            @RequestParam Long productId,
            @RequestParam int quantity) {
        cartService.addItem(userId, productId, quantity);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @RequestMapping("/{userId}")
    public ResponseEntity<CartResponseDTO>  getCartActive(
            @PathVariable Long userId){
        CartResponseDTO cartResponseDTO = cartService.getActiveCartDTO(userId);
        return ResponseEntity.ok(cartResponseDTO);
    }

    //  Limpa o carrinho
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clean(@PathVariable Long userId) {
        cartService.clean(userId);
        return ResponseEntity.noContent().build();
    }

    //  Remove um item específico
    @DeleteMapping("/{userId}/item/{idCartItem}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long userId,
            @PathVariable Long idCartItem) {
        cartService.removeItem(userId, idCartItem);
        return ResponseEntity.noContent().build();
    }

    // Altera quantidade
    @PatchMapping("/{userId}/item/{idCartItem}")
    public ResponseEntity<Void> updateQuantity(
            @PathVariable Long userId,
            @PathVariable Long idCartItem,
            @RequestParam boolean isIncrement) {
        cartService.updateQuantity(userId, idCartItem, isIncrement);
        return ResponseEntity.ok().build();

    }
}
