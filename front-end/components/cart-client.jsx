"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, X, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";
import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/primitives/drawer";
import { Separator } from "@/primitives/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/primitives/sheet";

import { useCart } from "@/lib/use-cart";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { toast } from "sonner";

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

import { useRouter } from "next/navigation";

export function CartClient({ className }) {
  
  const router = useRouter(); 
  const { user } = useAuth();
  const { 
    items, 
    itemCount, 
    subtotal, 
    removeItem, 
    updateQuantity, 
    clearCart,
    isLoading
  } = useCart();



  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [shipping, setShipping] = React.useState(null); // { region, cost }
  const [shippingStatus, setShippingStatus] = React.useState("idle"); // idle | loading | ready | no-address | error
  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Quote region-based shipping (frete) from the user's saved CEP when the cart opens
  React.useEffect(() => {
    if (!isOpen || !user || items.length === 0) return;
    let cancelled = false;
    setShippingStatus("loading");
    api.get("/shipping/quote")
      .then((res) => {
        if (cancelled) return;
        setShipping(res.data);
        setShippingStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setShipping(null);
        setShippingStatus(err?.response?.data?.code === "ADDRESS_REQUIRED" ? "no-address" : "error");
      });
    return () => { cancelled = true; };
  }, [isOpen, user, items.length]);

  const freteCost = shippingStatus === "ready" && shipping ? Number(shipping.cost) : 0;
  const total = subtotal + freteCost;

  // Handlers que chamam a API via Context
  const handleUpdateQuantity = (cartItemId, currentQty, isIncrement) => {
    updateQuantity(cartItemId, isIncrement);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      toast.error("Faça login para continuar");
      return;
    }
    try {
      setIsCheckingOut(true);
      const res = await api.post("/order/checkout");
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === "INSUFFICIENT_STOCK") {
        toast.error("Quantidade indisponível em estoque. Atualize seu carrinho.");
      } else if (code === "ADDRESS_REQUIRED") {
        toast.error("Cadastre um endereço de entrega antes de finalizar.");
      } else {
        toast.error("Erro ao iniciar pagamento. Tente novamente.");
      }
      setIsCheckingOut(false);
    }
  };

  const CartTrigger = (
    <Button
      aria-label="Open cart"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm transition-all hover:bg-accent"
      size="icon"
      variant="outline"
    >
      <ShoppingCart className="h-4 w-4" />
      {isMounted && itemCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );

  const CartContent = (
    <div className="flex flex-col h-full max-h-[100vh]">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <div className="text-xl font-semibold">Seu Carrinho</div>
          <div className="text-sm text-muted-foreground">
            {isLoading ? "Carregando..." : `${itemCount} item(s)`}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Carrinho vazio</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Você ainda não adicionou produtos.
              </p>
              <SheetClose asChild>
                <Link href="/products">
                  <Button onClick={() => setIsOpen(false)}>Ver Produtos</Button>
                </Link>
              </SheetClose>
            </motion.div>
          ) : (
            <div className="space-y-4 py-4">
              {items.map((item) => (
                <motion.div
                  key={item.cartItemId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative flex gap-4 rounded-lg border bg-card p-3 shadow-sm"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      alt={item.name}
                      fill
                      src={item.image || "/placeholder.png"}
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/products/${item.productId}`}
                        onClick={() => setIsOpen(false)}
                        className="line-clamp-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-md border bg-background">
                        <button
                          onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity, false)}
                          disabled={item.quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center hover:bg-muted disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity, true)}
                          className="flex h-8 w-8 items-center justify-center hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {CURRENCY_FORMATTER.format(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {items.length > 0 && (
        <div className="border-t bg-muted/20 px-6 py-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{CURRENCY_FORMATTER.format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frete</span>
              {shippingStatus === "loading" && <span className="text-muted-foreground">Calculando…</span>}
              {shippingStatus === "ready" && <span>{CURRENCY_FORMATTER.format(freteCost)}</span>}
              {shippingStatus === "no-address" && (
                <span className="text-xs text-amber-600">Cadastre um endereço</span>
              )}
              {(shippingStatus === "error" || shippingStatus === "idle") && (
                <span className="text-xs text-muted-foreground">A calcular</span>
              )}
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{CURRENCY_FORMATTER.format(total)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => clearCart()} className="w-full">
              Limpar
            </Button>
            <Button className="w-full" size="default" onClick={handleCreateOrder} disabled={isCheckingOut}>
              {isCheckingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finalizar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (!isMounted) return <div className={className}>{CartTrigger}</div>;

  return (
    <div className={cn("relative", className)}>
      {isDesktop ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>{CartTrigger}</SheetTrigger>
          <SheetContent className="flex w-full sm:max-w-[420px] flex-col p-0">
            {CartContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>{CartTrigger}</DrawerTrigger>
          <DrawerContent className="h-[85vh]">
            <DrawerTitle className="sr-only">Carrinho de Compras</DrawerTitle>
            {CartContent}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}