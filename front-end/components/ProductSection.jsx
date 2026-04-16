 
import {featuredProductsHomepage} from '../app/mocks'; 
import ProductCard from './ProductCard';
import api from "@/services/api";  

const ProductSection = ({products}) => {

  console.log(products) 
 
  return (
    <section className="bg-muted/50 py-12 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Featured Products
          </h2>

          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Check out our latest and most popular tech items
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          {/* Product Card */}
 

            {products.map(product =>(
            <ProductCard key={product.id} product={product} /> 
            ) )}

 

        </div>
      </div>
    </section>
  )
}

export default ProductSection
