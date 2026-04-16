"use client";

import * as React from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CartContext = React.createContext(undefined);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchCart = React.useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get(`/cart/${user.id}`);
      
      // Ajustado para ler o seu DTO achatado (CartResponseDTO)
      if (res.data && res.data.items) {
        const formattedItems = res.data.items.map(item => ({
          cartItemId: item.id,      // ID do CartItem no banco
          productId: item.productId, // ID do Produto
          name: item.name,
          price: item.finalPrice,         // BigDecimal vindo do DTO
          image: item.imageUrl,      // Campo imageUrl do DTO
          quantity: item.quantity,
          stock: item.stockAvailable
        }));
        setItems(formattedItems);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Erro ao carregar carrinho:", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ----------------------------- Actions -------------------------------- */

  const addItem = React.useCallback(async (product, qty = 1) => {
    if (!user?.id) return toast.error("Faça login para comprar");

    try {
      await api.post(`/cart/${user.id}/add`, null, {
        params: { productId: product.id, quantity: qty }
      });
      await fetchCart();
      toast.success("Produto adicionado!");
    } catch (err) {
      toast.error("Erro ao adicionar item");
    }
  }, [user?.id, fetchCart]);

  const updateQuantity = React.useCallback(async (cartItemId, isIncrement) => {
    if (!user?.id) return;

    try {
      // Atualização Otimista (Local)
      setItems(prev => prev.map(item => 
        item.cartItemId === cartItemId 
          ? { ...item, quantity: isIncrement ? item.quantity + 1 : item.quantity - 1 }
          : item
      ));

      await api.patch(`/cart/${user.id}/item/${cartItemId}`, null, {
        params: { isIncrement }
      });
    } catch (err) {
      toast.error("Erro ao atualizar quantidade");
      fetchCart(); // Reverte para o estado do banco se der erro
    }
  }, [user?.id, fetchCart]);

  const removeItem = React.useCallback(async (cartItemId) => {
    if (!user?.id) return;

    try {
      // Remove localmente primeiro
      setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
      
      await api.delete(`/cart/${user.id}/item/${cartItemId}`);
      toast.success("Item removido");
    } catch (err) {
      toast.error("Erro ao remover item");
      fetchCart();
    }
  }, [user?.id, fetchCart]);

  const clearCart = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      setItems([]);
      await api.delete(`/cart/${user.id}`);
      toast.success("Carrinho limpo");
    } catch (err) {
      toast.error("Erro ao limpar carrinho");
      fetchCart();
    }
  }, [user?.id, fetchCart]);

  /* --------------------------- Data ----------------------------- */

  const value = React.useMemo(() => ({
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount: items.reduce((t, i) => t + i.quantity, 0),
    subtotal: items.reduce((t, i) => t + (i.price * i.quantity), 0),
    isLoading
  }), [items, addItem, updateQuantity, removeItem, clearCart, isLoading]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}