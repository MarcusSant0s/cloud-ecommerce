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

  /* --------------------------- Handlers --------------------------------- */
  function updateParam(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "0"); // reset page on filter change
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
      <main className="flex-1 py-10">
        <div className="container px-4 md:px-6">

          {/* Heading & filters */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Products</h1>
              <p className="mt-1 text-lg text-muted-foreground">
                Browse our latest products and find something you&apos;ll love.
              </p>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <Button
                className="rounded-full"
                size="sm"
                variant={!selectedCategoryId ? "default" : "outline"}
                onClick={() => updateParam("categoryId", null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  aria-pressed={category.id === Number(selectedCategoryId)}
                  className="rounded-full"
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => console.log(`Added ${product.id} to wishlist`)}
                product={product}
              />
            ))}
          </div>

          {/* Empty state */}
          {products.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          )}

          {/* Pagination */}
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
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
              Next
            </Button>
          </nav>

        </div>
      </main>
    </div>
  );
}