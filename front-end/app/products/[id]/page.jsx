"use client";

import { Minus, Plus, ShoppingCart, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useCart } from "@/lib/use-cart";
import { Button } from "@/primitives/button";
import api from "@/services/api";
import { useEffect, useState, useMemo } from "react";

/* -------------------------------------------------------------------------- */
/* Helpers                                  */
/* -------------------------------------------------------------------------- */

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* Data Fetching                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/product/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        toast.error("Erro ao carregar produto.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  /* -------------------------------------------------------------------------- */
  /* Calculations                              */
  /* -------------------------------------------------------------------------- */

  // Mapeando a imagem principal do array de imagens da sua API
  const mainImage = useMemo(() => {
    if (!product?.images) return null;
    const main = product.images.find((img) => img.main) || product.images[0];
    return main?.url;
  }, [product]);

  // priceDiscount is a fraction (e.g. 0.10 = 10% off), not an absolute price.
  // finalPrice is the discounted price (null when there's no discount).
  const hasDiscount =
    typeof product?.priceDiscount === "number" && product.priceDiscount > 0;
  const price = product?.finalPrice ?? product?.priceOriginal ?? 0;
  const originalPrice = hasDiscount ? product?.priceOriginal : null;

  const discountPercentage = hasDiscount
    ? Math.round(product.priceDiscount * 100)
    : 0;

  const handleQuantityChange = (newQty) => {
    setQuantity(newQty >= 1 ? newQty : 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);

    addItem(
      {
        id: product.id,
        name: product.name,
        price: price,
        image: mainImage,
        category: product.categories?.[0]?.name || "Geral",
      },
      quantity
    );

    toast.success(`${product.name} adicionado ao carrinho!`);
    await new Promise((r) => setTimeout(r, 400));
    setIsAdding(false);
  };

  /* -------------------------------------------------------------------------- */
  /* States                                   */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="container flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-normal uppercase tracking-[0.12em]">Produto não encontrado</h1>
        <Button className="mt-8 rounded-sm text-[0.7rem] uppercase tracking-[0.15em]" onClick={() => router.push("/products")}>
          Voltar para produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 md:py-14">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Voltar
      </button>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        {/* Image Section */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-border/60 bg-muted">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              Sem imagem
            </div>
          )}

          {discountPercentage > 0 && (
            <span className="absolute left-4 top-4 bg-foreground px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-background">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col md:pt-4">
          <div className="mb-3 flex gap-2">
            {product.categories?.map((cat) => (
              <span key={cat.id} className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {cat.name}
              </span>
            ))}
          </div>

          <h1 className="font-display text-3xl font-normal uppercase leading-tight tracking-[0.1em] md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-medium tracking-[0.03em] text-foreground">
              {CURRENCY_FORMATTER.format(price)}
            </span>
            {originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {CURRENCY_FORMATTER.format(originalPrice)}
              </span>
            )}
          </div>

          <div className="mt-6 h-px w-12 bg-foreground/30" />

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-6">
            <div className="flex items-center rounded-sm border border-border">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-none border-r border-border"
                disabled={quantity <= 1}
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-none border-l border-border"
                disabled={quantity >= product.quantity}
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              {product.quantity} disponíveis
            </span>
          </div>

          <Button
            size="lg"
            className="mt-8 h-14 rounded-sm text-[0.7rem] uppercase tracking-[0.2em]"
            disabled={product.quantity <= 0 || isAdding}
            onClick={handleAddToCart}
          >
            {isAdding ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-5 w-5" />
            )}
            {product.quantity <= 0 ? "Esgotado" : "Adicionar ao Carrinho"}
          </Button>
        </div>
      </div>

      {/* Aqui você pode adicionar seções de especificações se a API retornar */}
    </div>
  );
}