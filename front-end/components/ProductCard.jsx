'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/lib/use-cart";
import { toast } from "sonner";

const ProductCard = ({ product, priority = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const {
    id,
    name,
    mainImageUrl: image,
    priceOriginal: originalPrice,
    priceDiscount: discountPrice,
    finalPrice,
    quantity: stockQuantity
  } = product;

  const inStock = stockQuantity > 0;

  // priceDiscount is a fraction (e.g. 0.10 = 10% off), not an absolute price
  const hasDiscount = typeof discountPrice === "number" && discountPrice > 0;

  const discountPercent = hasDiscount ? Math.round(discountPrice * 100) : 0;

  // finalPrice is null for products without a discount — fall back to the
  // original price so it never renders as R$ 0,00
  const displayPrice = finalPrice ?? originalPrice;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addItem({ id: product.id, quantity: 1 });
      toast.success(`${name} adicionado ao carrinho!`);
    } catch {
      toast.error("Não foi possível adicionar ao carrinho.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative flex h-full flex-col overflow-hidden rounded-sm border border-border/60 bg-card transition-colors duration-300 hover:border-foreground/30">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              Sem Imagem
            </div>
          )}

          {hasDiscount && inStock && (
            <span className="absolute left-3 top-3 z-10 bg-foreground px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-background">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-grow flex-col p-3 sm:p-4">
          <h3 className="line-clamp-2 font-display text-sm leading-snug tracking-[0.02em] text-foreground sm:text-base">
            {name}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-medium tracking-[0.03em] text-foreground sm:text-base">
              R$ {displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                R$ {originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 pt-0 sm:p-4 sm:pt-0">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !inStock}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-foreground px-3 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-background transition hover:bg-foreground/90 disabled:opacity-60"
          >
            {isAdding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              inStock && <ShoppingBag className="h-3.5 w-3.5" />
            )}
            {isAdding ? "Aguarde" : inStock ? "Adicionar" : "Esgotado"}
          </button>
        </div>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
            <span className="bg-foreground px-4 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-background">
              Esgotado
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
