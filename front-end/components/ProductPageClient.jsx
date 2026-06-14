"use client";

import { Button } from "@/primitives/button";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/lib/use-cart";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function ProductPageClient({ categories, products, totalPages, currentPage }) {
  const { addItem } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "0");
    router.push(`?${params.toString()}`);
  }

  function goToPage(page) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page);
    router.push(`?${params.toString()}`);
  }

  const handleAddToCart = React.useCallback((product) => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.finalPrice, image: product.mainImageUrl }, 1);
  }, [addItem]);

  const selectedCategoryId = searchParams.get("categoryId");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-8 md:py-10">
        <div className="container px-4 md:px-6">

          {/* Heading & filters */}
          <div className="mb-6 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Produtos</h1>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                Explore nossos produtos e encontre algo que você vai amar.
              </p>
            </div>

            {/* Category pills — horizontally scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <Button
                className="rounded-full shrink-0"
                size="sm"
                variant={!selectedCategoryId ? "default" : "outline"}
                onClick={() => updateParam("categoryId", null)}
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  aria-pressed={category.id === Number(selectedCategoryId)}
                  className="rounded-full shrink-0"
                  key={category.id}
                  onClick={() => updateParam("categoryId", category.id)}
                  size="sm"
                  variant={category.id === Number(selectedCategoryId) ? "default" : "outline"}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => {}}
                product={product}
              />
            ))}
          </div>

          {/* Empty state */}
          {products.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-2 flex-wrap">
              <Button
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => goToPage(currentPage - 1)}
              >
                Anterior
              </Button>

              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={i === currentPage ? "default" : "outline"}
                  aria-current={i === currentPage ? "page" : undefined}
                  onClick={() => goToPage(i)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                disabled={currentPage === totalPages - 1}
                onClick={() => goToPage(currentPage + 1)}
              >
                Próximo
              </Button>
            </nav>
          )}

        </div>
      </main>
    </div>
  );
}
