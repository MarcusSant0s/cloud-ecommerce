
import ProductCard from './ProductCard';
import { fetchJson } from '@/lib/server-api';

const ProductSection = async () => {

  // fetchJson returns null when the API is down or times out — degrade gracefully.
  const data = await fetchJson('/product?size=10', {
    next: { revalidate: 300 },
  });
  const products = Array.isArray(data?.content) ? data.content : [];

  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10 flex flex-col items-center text-center">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Seleção
          </span>
          <h2 className="mt-3 font-display text-3xl font-normal uppercase leading-tight tracking-[0.12em] md:text-4xl">
            Produtos em Destaque
          </h2>
          <div className="mt-4 h-px w-12 bg-foreground/30" />
          <p className="mt-4 max-w-2xl text-center text-sm text-muted-foreground">
            Confira nossos itens mais populares e as últimas novidades
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Nenhum produto disponível no momento.
          </p>
        )}
      </div>
    </section>
  )
}

export default ProductSection
