 
import ProductPageClient from "@/components/ProductPageClient";
import api from "@/services/api";

export default async function Page({searchParams}) {

  const { page = 0, size = 10, categoryId, name } = await searchParams;

  const [categories, productsPage] = await Promise.all([
    fetch("http://localhost:8080/category/all-categories", {
      next: { revalidate: 60 }
    }).then(res => res.json()),

    api.get("/product", {
      params: { page, size, categoryId: categoryId ?? '', name: name ?? '' }
    }).then(res => res.data)
  ]);
   
 
  return <ProductPageClient     
      categories={categories}
      products={productsPage.content}
      totalPages={productsPage.totalPages}
      currentPage={Number(page)}/>;
}