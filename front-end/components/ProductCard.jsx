"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.originalPrice

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.discountPrice) /
          product.originalPrice) *
          100
      )
    : 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    setIsAdding(true)

    setTimeout(() => {
      setIsAdding(false)
    }, 600)
  }

  return (
    <Link href={`/products/${product.id}`} className="group">
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
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`
              object-cover transition-transform duration-300
              ${isHovered ? "scale-105" : ""}
            `}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute right-2 top-2 rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3
            className="
              line-clamp-2 text-base font-medium transition-colors
              group-hover:text-primary
            "
          >
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-medium">
                  R$ {product.discountPrice.toFixed(2)}
                </span>
                <span className="text-sm line-through text-muted-foreground">
                  R$ {product.originalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-medium">
                R$ {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-0">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
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
            Add to Cart
          </button>
        </div>

        {/* Out of stock overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <span className="rounded bg-destructive px-3 py-1 text-sm text-destructive-foreground">
              Out of stock
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default ProductCard
