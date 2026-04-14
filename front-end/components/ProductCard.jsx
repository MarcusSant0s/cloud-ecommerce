'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/lib/use-cart"; // Certifique-se que o caminho está correto
import { toast } from "sonner";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Pegamos a função addItem do nosso contexto integrado com o Java
  const { addItem } = useCart();
  
  const {
    id,
    name,
    mainImageUrl: image,
    priceOriginal: originalPrice,
    priceDiscount: discountPrice,
    quantity: stockQuantity // Usando a quantidade que vem da sua API
  } = product;

  const inStock = stockQuantity > 0;
  const currentPrice = discountPrice || originalPrice || 0;

  const hasDiscount = 
    typeof discountPrice === "number" && 
    discountPrice > 0 && 
    discountPrice < originalPrice;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Evita navegar para a página do produto ao clicar no botão
    
    setIsAdding(true);
    try {
      // Chamada para o contexto (que disparará o POST /cart/{userId}/add)
      await addItem(
        {
          id:product.id,
          quantity:1
        }
      );
       
      toast.success(`${name} adicionado ao carrinho!`);
    } catch (error) {
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
              sizes="(max-width: 768px) 100vw, 33vw"
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
            <span className="absolute right-2 top-2 z-10 rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-grow">
          <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
            {name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-bold text-primary">
                  R$ {discountPrice.toFixed(2)}
                </span>
                <span className="text-xs line-through text-muted-foreground">
                  R$ {originalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-bold">
                R$ {currentPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-0">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !inStock}
            className="
              flex w-full items-center justify-center gap-2
              rounded-md bg-primary px-4 py-2 text-sm font-medium
              text-primary-foreground transition
              hover:bg-primary/90 disabled:opacity-70
            "
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {isAdding ? "Aguarde..." : inStock ? "Adicionar" : "Esgotado"}
          </button>
        </div>

        {/* Out of stock overlay */}
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