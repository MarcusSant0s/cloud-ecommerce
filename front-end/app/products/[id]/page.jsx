"use client"

import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

 import { useCart } from "@/lib/use-cart";
 import { Separator } from "@/primitives/separator";
import { Button } from "@/primitives/button";

 
/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const range = (length) => Array.from({ length }, (_, i) => i);

/* -------------------------------------------------------------------------- */
/*                                Mock products                               */
/* -------------------------------------------------------------------------- */

const products = [
  {
    category: "Audio",
    description:
      "Experience crystal-clear sound with our premium wireless headphones.",
    features: [
      "Active noise cancellation",
      "30-hour battery life",
      "Bluetooth 5.2 connectivity",
    ],
    id: "1",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    inStock: true,
    name: "Premium Wireless Headphones",
    originalPrice: 249.99,
    price: 199.99,
    rating: 4.5,
    specs: {
      batteryLife: "30 hours",
      brand: "AudioMax",
      model: "WH-1000XM5",
      warranty: "2 years",
    },
  },
  {
    category: "Wearables",
    description:
      "Advanced smartwatch with health tracking and GPS.",
    features: [
      "Health monitoring",
      "GPS tracking",
      "7-day battery life",
    ],
    id: "2",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    inStock: true,
    name: "Smart Watch Series 5",
    originalPrice: 349.99,
    price: 299.99,
    rating: 4.2,
    specs: {
      brand: "TechFit",
      batteryLife: "7 days",
      waterResistance: "5 ATM",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);

  const product = React.useMemo(
    () => products.find((p) => p.id === id),
    [id]
  );

  const discountPercentage = React.useMemo(() => {
    if (!product?.originalPrice) return 0;
    return Math.round(
      ((product.originalPrice - product.price) /
        product.originalPrice) *
        100
    );
  }, [product]);

  const handleQuantityChange = React.useCallback((newQty) => {
    setQuantity((prev) => (newQty >= 1 ? newQty : prev));
  }, []);

  const handleAddToCart = React.useCallback(async () => {
    if (!product) return;

    setIsAdding(true);

    addItem(
      {
        category: product.category,
        id: product.id,
        image: product.image,
        name: product.name,
        price: product.price,
      },
      quantity
    );

    setQuantity(1);
    toast.success(`${product.name} added to cart`);

    await new Promise((r) => setTimeout(r, 400));
    setIsAdding(false);
  }, [addItem, product, quantity]);

  if (!product) {
    return (
      <div className="container py-20">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <Button className="mt-6" onClick={() => router.push("/products")}>
          Back to products
        </Button>
      </div>
    );
  }

 return (
    <div className="container py-10">
      <Button variant="ghost" onClick={() => router.push("/products")}>
        ← Back to products
      </Button>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />

          {discountPercentage > 0 && (
            <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            {range(5).map((i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.rating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground">
              ({product.rating.toFixed(1)})
            </span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-bold">
              {CURRENCY_FORMATTER.format(product.price)}
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-muted-foreground line-through">
                {CURRENCY_FORMATTER.format(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="mt-4 text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <Button
              size="icon"
              variant="outline"
              disabled={quantity <= 1}
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className="w-10 text-center">{quantity}</span>

            <Button
              size="icon"
              variant="outline"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            className="mt-6"
            disabled={!product.inStock || isAdding}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isAdding ? "Adding…" : "Add to cart"}
          </Button>
        </div>
      </div>

      <Separator className="my-10" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-2xl font-bold">Features</h2>
          <ul className="space-y-2">
            {product.features.map((feature) => (
              <li
                key={slugify(feature)}
                className="flex items-start gap-2"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Specifications</h2>
          <div className="space-y-2">
            {Object.entries(product.specs).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between border-b pb-2 text-sm"
              >
                <span className="capitalize font-medium">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
