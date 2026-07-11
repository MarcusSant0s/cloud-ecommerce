import ProductPageClient from "@/components/ProductPageClient";
import { SERVER_API_URL } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Produtos",
  description: "Explore nosso catálogo completo de produtos. Filtre por categoria e encontre o que você precisa.",
};

async function getJson(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // API unreachable or non-JSON — degrade gracefully instead of crashing SSR.
    return null;
  }
}

export default async function Page({ searchParams }) {

  const { page = 0, size = 10, categoryId, name } = await searchParams;

  const productQuery = new URLSearchParams({
    page: String(page),
    size: String(size),
    categoryId: categoryId ?? "",
    name: name ?? "",
  });

  const [categories, productsPage] = await Promise.all([
    getJson(`${SERVER_API_URL}/category/all-categories`, { next: { revalidate: 60 } }),
    getJson(`${SERVER_API_URL}/product?${productQuery.toString()}`, { cache: "no-store" }),
  ]);

  return (
    <ProductPageClient
      categories={Array.isArray(categories) ? categories : []}
      products={productsPage?.content ?? []}
      totalPages={productsPage?.totalPages ?? 0}
      currentPage={Number(page)}
    />
  );
}