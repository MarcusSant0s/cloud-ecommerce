"use client";

import { Button } from "@/primitives/button";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/lib/use-cart";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function ProductPageClient({ categories, collections = [], products, totalPages, currentPage }) {
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
  const selectedCollectionId = searchParams.get("collectionId");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-8 md:py-10">
        <div className="container px-4 md:px-6">

          {/* Heading & filters */}
          <div className="mb-6 flex flex-col gap-4">
            <div>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Catálogo
              </span>
              <h1 className="mt-2 font-display text-3xl font-normal uppercase tracking-[0.12em] md:text-4xl">Produtos</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore nossas coleções e encontre algo que você vai amar.
              </p>
            </div>

            {/* Filter pills — horizontally scrollable on mobile */}
            <div className="flex flex-col gap-3">
              <div>
                {/* Only worth naming the rows once there are two of them. */}
                {collections.length > 0 && (
                  <span className="mb-2 block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Categoria
                  </span>
                )}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <Button
                    className="rounded-sm shrink-0 text-[0.7rem] uppercase tracking-[0.12em]"
                    size="sm"
                    variant={!selectedCategoryId ? "default" : "outline"}
                    onClick={() => updateParam("categoryId", null)}
                  >
                    Todos
                  </Button>
                  {categories.map((category) => (
                    <Button
                      aria-pressed={category.id === Number(selectedCategoryId)}
                      className="rounded-sm shrink-0 text-[0.7rem] uppercase tracking-[0.12em]"
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

              {collections.length > 0 && (
                <div>
                  <span className="mb-2 block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Coleção
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <Button
                      className="rounded-sm shrink-0 text-[0.7rem] uppercase tracking-[0.12em]"
                      size="sm"
                      variant={!selectedCollectionId ? "default" : "outline"}
                      onClick={() => updateParam("collectionId", null)}
                    >
                      Todas
                    </Button>
                    {collections.map((collection) => (
                      <Button
                        aria-pressed={collection.id === Number(selectedCollectionId)}
                        className="rounded-sm shrink-0 text-[0.7rem] uppercase tracking-[0.12em]"
                        key={collection.id}
                        onClick={() => updateParam("collectionId", collection.id)}
                        size="sm"
                        variant={collection.id === Number(selectedCollectionId) ? "default" : "outline"}
                      >
                        {collection.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
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
