import { cn } from "@/lib/utils";
import { CartClient } from "./cart-client";
 
export function Cart({ className }) {
  return (
    <div className={cn("relative", className)}>
      {/* TODO: buscar carrinho real depois */}
      <CartClient className={cn("", className)}  />
    </div>
  );
}
