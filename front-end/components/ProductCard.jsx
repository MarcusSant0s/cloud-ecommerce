'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/lib/use-cart";
import { toast } from "sonner";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
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

  const hasDiscount =
    typeof discountPrice === "number" &&
    discountPrice > 0 &&
    discountPrice < originalPrice;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

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
    <Link href={`/products/${id}`} className="group">
      <div
        className={`
          relative flex h-full flex-col overflow-hidden rounded-lg border
          bg-card shadow-sm transition-all duration-200
          hover:shadow-md
          ${isHovered ? "ring-1 ring-primary/20" : ""}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`
                object-cover transition-transform duration-300
                ${isHovered ? "scale-105" : ""}
              `}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
              Sem Imagem
            </div>
          )}

          {hasDiscount && (
            <span className="absolute right-2 top-2 z-10 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground sm:px-2 sm:text-xs">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 flex-grow sm:p-4">
          <h3 className="line-clamp-2 text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
            {name}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-primary sm:text-base">
                  R$ {finalPrice.toFixed(2)}
                </span>
                <span className="text-[10px] line-through text-muted-foreground sm:text-xs">
                  R$ {originalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold sm:text-base">
                R$ {finalPrice?.toFixed(2) ?? "0.00"}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 pt-0 sm:p-4 sm:pt-0">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !inStock}
            className="
              flex w-full items-center justify-center gap-1.5
              rounded-md bg-primary px-2 py-2 text-xs font-medium
              text-primary-foreground transition
              hover:bg-primary/90 disabled:opacity-70
              sm:gap-2 sm:px-4 sm:text-sm
            "
          >
            {isAdding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
            {isAdding ? "Aguarde..." : inStock ? "Adicionar" : "Esgotado"}
          </button>
        </div>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
            <span className="rounded bg-destructive px-3 py-1 text-xs font-bold text-white shadow-lg">
              Esgotado
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
