 
import ProductPageClient from "@/components/ProductPageClient";

export default async function Page() {
  const res = await fetch("http://localhost:8080/category/all-categories", {
    next: { revalidate: 60 },
  }).then(res => res.json());
 

  return <ProductPageClient categories={res} />;
}