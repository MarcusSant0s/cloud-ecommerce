
import Link from "next/link"
import Image from "next/image"
import { fetchJson } from "@/lib/server-api"

export default async function Categories(){

  // fetchJson returns null when the API is down or times out — degrade gracefully.
  const data = await fetchJson("/category/all-categories", {
    next: { revalidate: 60 },
  });
  const categories = Array.isArray(data) ? data : [];

  // Nothing to show (e.g. API down) — hide the section rather than crash.
  if (categories.length === 0) return null;

    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center text-center">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Coleções
            </span>
            <h2 className="mt-3 font-display text-3xl font-normal uppercase leading-tight tracking-[0.12em] md:text-4xl">
              Compre por Categoria
            </h2>
            <div className="mt-4 h-px w-12 bg-foreground/30" />
            <p className="mt-4 max-w-2xl text-center text-sm text-muted-foreground">
              Encontre a peça ideal em nossas coleções
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
            {categories.map((category) => (
              <Link
                aria-label={`Ver produtos de ${category.name}`}
                className="group relative flex flex-col space-y-4 overflow-hidden rounded-sm border border-border/60 bg-card transition-colors duration-300 hover:border-foreground/30"
                href={`/products?categoryId=${category.id}`}
                key={category.id}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent" />
                  <Image
                    alt={category.name}
                    className="object-cover transition duration-300 group-hover:scale-105"
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    src={category.url}
                  />
                </div>
                <div className="relative z-20 -mt-6 p-3 sm:p-4">
                  <div className="font-display text-sm uppercase tracking-[0.12em] capitalize sm:text-lg">
                    {category.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
}
