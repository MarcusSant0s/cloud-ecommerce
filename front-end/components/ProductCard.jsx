'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Mapeamento dos nomes da API para variáveis internas
  const {
    id,
    name,
    mainImageUrl: image,
    priceOriginal: originalPrice,
    priceDiscount: discountPrice,
  } = product;

  // Lógica de Desconto ajustada para os nomes da API
  const hasDiscount = 
    typeof discountPrice === "number" && 
    discountPrice > 0 && 
    discountPrice < originalPrice;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    setIsAdding(true);
    
    // Passamos o objeto original ou o ID conforme sua necessidade
    onAddToCart(product);

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
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
          {image && (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`
                object-cover transition-transform duration-300
                ${isHovered ? "scale-105" : ""}
              `}
            />
          )}

          {hasDiscount && (
            <span className="absolute right-2 top-2 z-10 rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-grow">
          <h3 className="line-clamp-2 text-base font-medium transition-colors group-hover:text-primary">
            {name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-bold text-primary">
                  R$ {discountPrice.toFixed(2)}
                </span>
                <span className="text-sm line-through text-muted-foreground">
                  R$ {originalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-bold">
                R$ {(originalPrice || 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-0">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.inStock === false}
            className="
              flex w-full items-center justify-center gap-2
              rounded-md bg-primary px-4 py-2 text-sm font-medium
              text-primary-foreground transition
              hover:bg-primary/90 disabled:opacity-70
            "
          >
            {isAdding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {isAdding ? "Adicionando..." : "Add to Cart"}
          </button>
        </div>

        {/* Out of stock overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <span className="rounded bg-destructive px-3 py-1 text-sm font-bold text-white shadow-lg">
              Esgotado
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;