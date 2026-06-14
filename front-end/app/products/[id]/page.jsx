"use client";

import { Minus, Plus, ShoppingCart, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useCart } from "@/lib/use-cart";
import { Separator } from "@/primitives/separator";
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

  const price = product?.priceDiscount || product?.priceOriginal || 0;
  const originalPrice = product?.priceDiscount ? product?.priceOriginal : null;

  const discountPercentage = useMemo(() => {
    if (!originalPrice || !price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }, [price, originalPrice]);

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold">Produto não encontrado</h1>
        <Button className="mt-6" onClick={() => router.push("/products")}>
          Voltar para produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" onClick={() => router.back()}>
        ← Voltar
      </Button>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">Sem imagem</div>
          )}

          {discountPercentage > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col">
          <div className="mb-2 flex gap-2">
            {product.categories?.map((cat) => (
              <span key={cat.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cat.name}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl font-bold">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {CURRENCY_FORMATTER.format(price)}
            </span>
            {originalPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {CURRENCY_FORMATTER.format(originalPrice)}
              </span>
            )}
          </div>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-6">
            <div className="flex items-center border rounded-md">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-none border-r"
                disabled={quantity <= 1}
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-none border-l"
                disabled={quantity >= product.quantity}
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <span className="text-sm text-muted-foreground">
              {product.quantity} unidades disponíveis
            </span>
          </div>

          <Button
            size="lg"
            className="mt-8 h-14 text-lg"
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

      <Separator className="my-10" />
      
      {/* Aqui você pode adicionar seções de especificações se a API retornar */}
    </div>
  );
}