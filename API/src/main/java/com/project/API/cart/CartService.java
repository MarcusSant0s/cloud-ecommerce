package com.project.API.cart;

import com.project.API.cart.dto.CartResponseDTO;
import com.project.API.cart.exception.InsufficientStockException;
import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.product.Product;
import com.project.API.product.ProductRepository;
import com.project.API.productImage.ProductImage;
import com.project.API.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
public class CartService {

    private final CartRepository cartrepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,UserRepository userRepository, ProductRepository productRepository){
        this.cartrepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    //add item, clean, update quality   , remove item
    @Transactional
    public void addItem(Long userId, Long id_product, int quantity){

        // `quantity` comes straight off a request parameter. A non-positive value
        // used to be stored as-is, and nothing downstream rejects it: the cart
        // subtotal is price x quantity (so it goes negative), the checkout stock
        // check is `stock < requested` (so -3 passes), and decrementStock runs
        // `quantity = quantity - :qty`, which for a negative qty *adds* stock.
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }

        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingCartItem = cart.getCartItem().stream()
                .filter(item -> item.getProduct().getId().equals(id_product))
                .findFirst();

        if(existingCartItem.isPresent()){
            // Add the requested amount. This used to delegate to updateQuantity(),
            // which increments by exactly 1 — so "add 4 more" added 1.
            CartItem cartItem = existingCartItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            validateStockAvailability(id_product, newQuantity);
            cartItem.setQuantity(newQuantity);
        }else{

            Product  product = productRepository.findById(id_product)
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o id " + id_product));

            // The first add was never stock-checked; only the increment path was.
            validateStockAvailability(id_product, quantity);

            CartItem cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cart.addCartItem(cartItem);

        }

        cartrepository.save(cart);

    }

    //Clear
    @Transactional
    public void clean(Long userId){
        Cart cart = getOrCreateCart(userId);

        cart.getCartItem().clear();

        cartrepository.save(cart);
    }

    // Remove Item
    @Transactional
    public void removeItem(Long userId, Long id_cart_item){
        Cart cart = getOrCreateCart(userId);

        CartItem removeCartItem = getCartItem(cart, id_cart_item);
        cart.removeCartItem(removeCartItem);

        cartrepository.save(cart);
        cartItemRepository.delete(removeCartItem);

    }

    @Transactional
    public void updateQuantity(Long userId, Long idCartItem, boolean isIncrement) {
        // 1. Localiza o carrinho
        Cart cart = getOrCreateCart(userId);

         CartItem cartItem = getCartItem(cart, idCartItem);
         if (isIncrement) {
             validateStockAvailability(cartItem.getProduct().getId(), cartItem.getQuantity() + 1);
            cartItem.increaseQuantity();

         } else {
            cartItem.decreaseQuantity();
        }

        if (cartItem.getQuantity() <= 0) {
            cart.getCartItem().remove(cartItem);
            cartItemRepository.delete(cartItem);
        }

     }
//     public void mergeGuestCart(Long userId, MergeCartDTO request) {
//         if (request.items() == null || request.items().isEmpty()) return;
//
//         Cart cart = getOrCreateCart(userId);
//
//         for (GuestItemDTO item : request.items()) {
//             Product product = productRepository.findById(item.productId())
//                     .orElseThrow(() -> new RuntimeException("Product Not Found"));
//
//             Optional<CartItem> existing = cart.getCartItem().stream()
//                     .filter(i -> i.getProduct().getId().equals(item.productId()))
//                     .findFirst();
//
//             if (existing.isPresent()) {
//                 int total = existing.get().getQuantity() + item.quantity();
//                 validateStockAvailability(item.productId(), total);
//                 existing.get().setQuantity(total);
//             } else {
//                 validateStockAvailability(item.productId(), item.quantity());
//                 addItem(userId, item.productId(), item.quantity());
//             }
//         }        ;
//     }


    /**
     * Hands a CHECKOUT cart back to the user after its order fell through.
     *
     * <p>Deliberately not a plain status flip. Nothing stops a user from building a
     * new cart while an order sits pending — {@link #getOrCreateCart} mints one the
     * moment they open the cart page — so flipping the old cart straight back to
     * ACTIVE can leave the account holding two. Every cart read goes through
     * {@code findByUserIdAndStatus}, which returns an {@code Optional}, so a second
     * ACTIVE row turns every cart request for that user into a 500 that nothing
     * short of a manual database edit clears.
     *
     * <p>When the user already has an ACTIVE cart the abandoned lines are folded
     * into it and the CHECKOUT cart is deleted, so nothing the buyer picked is lost.
     */
    @Transactional
    public void restoreToActive(Cart checkoutCart) {
        Cart activeCart = cartrepository
                .findByUserIdAndStatus(checkoutCart.getUser().getId(), CartStatus.ACTIVE)
                .orElse(null);

        // No competing cart, or the query found this very cart because the caller had
        // not flushed its CHECKOUT status yet: a flip is all that is needed.
        if (activeCart == null || Objects.equals(activeCart.getId(), checkoutCart.getId())) {
            checkoutCart.setStatus(CartStatus.ACTIVE);
            cartrepository.save(checkoutCart);
            return;
        }

        for (CartItem abandoned : checkoutCart.getCartItem()) {
            mergeIntoCart(activeCart, abandoned);
        }

        cartrepository.save(activeCart);
        // Cascade plus orphanRemoval take the emptied lines with it.
        cartrepository.delete(checkoutCart);
    }

    /**
     * Folds one abandoned line into the cart the user is using now, capped at what is
     * actually in stock: getOrCreateCart drops a line whose quantity outruns stock, so
     * summing past it would lose the whole line instead of trimming it.
     */
    private void mergeIntoCart(Cart target, CartItem abandoned) {
        Long productId = abandoned.getProduct().getId();
        int stock = productRepository.findQuantityById(productId).orElse(0);

        Optional<CartItem> existing = target.getCartItem().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        int quantity = Math.min(existing.map(CartItem::getQuantity).orElse(0) + abandoned.getQuantity(), stock);
        if (quantity <= 0) {
            return;
        }

        if (existing.isPresent()) {
            existing.get().setQuantity(quantity);
            return;
        }

        // A fresh line rather than re-parenting the old one: moving a CartItem out of
        // the CHECKOUT cart's collection makes orphanRemoval delete it mid-flush.
        CartItem moved = new CartItem();
        moved.setProduct(abandoned.getProduct());
        moved.setQuantity(quantity);
        target.addCartItem(moved);
    }


     // Helpers methods
    private void validateStockAvailability(Long productId, int requestedQuantity) {
        int stock = productRepository.findQuantityById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (stock < requestedQuantity){
            throw new InsufficientStockException("Estoque insuficiente: apenas " + stock + " disponíveis");
        }
    }


    public CartResponseDTO getActiveCartDTO(Long userId) {
        Cart cart = getOrCreateCart(userId);


        List<CartResponseDTO.CartItemDTO> itemDTOs = cart.getCartItem().stream()
                .map(item -> {
                    Product product = item.getProduct();



                    // Cálculo do Subtotal: preço * quantidade
                    BigDecimal itemSubtotal = item.getProduct().getFinalPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

                    return new CartResponseDTO.CartItemDTO(
                            item.getId(),
                            product.getId(),
                            product.getName(),
                            getMainImageUrl(product),
                            product.getFinalPrice(),
                            item.getQuantity(),
                            product.getQuantity(),
                            itemSubtotal
                    );
                }).toList();

        // Soma total do carrinho usando reduce
        BigDecimal totalCartValue = itemDTOs.stream()
                .map(CartResponseDTO.CartItemDTO::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponseDTO(cart.getId(), cart.getStatus(), itemDTOs, totalCartValue);
    }

    private String getMainImageUrl(Product product) {
        Set<ProductImage> images = product.getImages();

        if (images == null || images.isEmpty()) {
            return null;
        }

        return images.stream()
                .filter(ProductImage::isMain)
                .map(ProductImage::getUrl)
                .findFirst() // O findFirst no Set pegará o primeiro que encontrar que seja 'main'
                .orElseGet(() -> images.iterator().next().getUrl()); // Se não houver 'main', pega qualquer uma do Set

    }








    public Cart getOrCreateCart(Long userId){

        return cartrepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .map(cart -> {
                    // Drop lines that can no longer be honoured: the product is gone,
                    // stock fell below what the cart holds, or the quantity is not
                    // positive. The last case self-heals carts written before addItem
                    // started rejecting a non-positive quantity.
                    cart.getCartItem().removeIf(cartItem ->
                            cartItem.getQuantity() <= 0
                            || productRepository.findQuantityById(cartItem.getProduct().getId())
                                    .map(stock -> stock < cartItem.getQuantity())
                                    .orElse(true)
                    );
                    return cartrepository.save(cart);
                })
                    .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(userRepository.getReferenceById(userId));
                    cart.setStatus(CartStatus.ACTIVE);
                    return cartrepository.save(cart);
                });
    }












    public CartItem getCartItem(Cart cart, Long id_cart_item){
        return  cart.getCartItem().stream().filter(item -> item.getId().equals(id_cart_item)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item não encontrado, id " + id_cart_item));
    }


}
