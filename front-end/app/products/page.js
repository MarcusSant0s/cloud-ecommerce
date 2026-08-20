import ProductPageClient from "@/components/ProductPageClient";
import { fetchJson } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Produtos",
  description: "Explore nosso catálogo completo de produtos. Filtre por categoria ou coleção e encontre o que você precisa.",
};

export default async function Page({ searchParams }) {

  const { page = 0, size = 10, categoryId, collectionId, name } = await searchParams;

  const productQuery = new URLSearchParams({
    page: String(page),
    size: String(size),
    categoryId: categoryId ?? "",
    collectionId: collectionId ?? "",
    name: name ?? "",
  });

  // fetchJson returns null on failure or after a 5s timeout — the page still
  // renders, just empty, instead of hanging SSR when the API is unreachable.
  const [categories, collections, productsPage] = await Promise.all([
    fetchJson("/category/all-categories", { next: { revalidate: 60 } }),
    fetchJson("/collection/all-collections", { next: { revalidate: 60 } }),
    fetchJson(`/product?${productQuery.toString()}`, { cache: "no-store" }),
  ]);

  return (
    <ProductPageClient
      categories={Array.isArray(categories) ? categories : []}
      collections={Array.isArray(collections) ? collections : []}
      products={productsPage?.content ?? []}
      totalPages={productsPage?.totalPages ?? 0}
      currentPage={Number(page)}
    />
  );
}