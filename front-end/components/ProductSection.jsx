
import ProductCard from './ProductCard';

const ProductSection = async () => {

    const products = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/product?size=10`,
    {
       next: { revalidate: 300 }
   })
   .then(res => res.json())
   .then(data => data.content);


  return (
    <section className="bg-muted/50 py-12 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Produtos em Destaque
          </h2>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Confira nossos itens mais populares e as últimas novidades
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductSection
