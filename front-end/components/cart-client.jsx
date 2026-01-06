"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
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

export function CartClient({ className, mockCart }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [cartItems, setCartItems] = React.useState(mockCart);
  const [isMounted, setIsMounted] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const CartTrigger = (
    <Button
      aria-label="Open cart"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-xs transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent/40"
      size="icon"
      variant="outline"
    >
      <ShoppingCart className="h-4 w-4" />
      {totalItems > 0 && (
        <Badge
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-primary-foreground"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );

  const CartContent = (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <div className="text-xl font-semibold">Your Cart</div>
          <div className="text-sm text-muted-foreground">
            {totalItems === 0
              ? "Your cart is empty"
              : `You have ${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`}
          </div>
        </div>
        {isDesktop && (
          <SheetClose asChild>
            <Button size="icon" variant="ghost">
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <AnimatePresence>
          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Your cart is empty</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Looks like you haven't added anything yet.
              </p>
              {isDesktop ? (
                <SheetClose asChild>
                  <Link href="/products">
                    <Button>Browse Products</Button>
                  </Link>
                </SheetClose>
              ) : (
                <DrawerClose asChild>
                  <Link href="/products">
                    <Button>Browse Products</Button>
                  </Link>
                </DrawerClose>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4 py-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="group relative flex rounded-lg border bg-card p-2 shadow-sm hover:bg-accent/50"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded">
                    <Image
                      alt={item.name}
                      fill
                      src={item.image}
                      className="object-cover"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/products/${item.id}`}
                          onClick={() => setIsOpen(false)}
                          className="line-clamp-2 text-sm font-medium group-hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-md border">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 border-r text-muted-foreground hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="h-7 w-7 text-xs font-medium flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-7 w-7 border-l text-muted-foreground hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {cartItems.length > 0 && (
        <div className="border-t px-6 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <Separator />
          <Button className="w-full" size="lg">
            Checkout
          </Button>
          <Button variant="outline" onClick={handleClearCart}>
            Clear Cart
          </Button>
        </div>
      )}
    </div>
  );

  if (!isMounted) {
    return <div className={cn("relative", className)}>{CartTrigger}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      {isDesktop ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>{CartTrigger}</SheetTrigger>
          <SheetContent className="flex w-[400px] flex-col p-0">
            <SheetHeader>
              <SheetTitle>Shopping Cart</SheetTitle>
            </SheetHeader>
            {CartContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTitle> Carrinho</DrawerTitle>
          <DrawerTrigger asChild>{CartTrigger}</DrawerTrigger>
          <DrawerContent>{CartContent}</DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
