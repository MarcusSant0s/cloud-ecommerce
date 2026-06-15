import Categories from '@/components/Categories';
import ProductSection from '@/components/ProductSection';
import Testimonial from '@/components/Testimonial';
import {testimonials} from '@/app/mocks'

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Início",
  description: "Encontre os melhores produtos com entrega rápida e preços imbatíveis. Explore categorias, promoções e destaques.",
};

export default  function Home() {






  return (
    <div className="">
      <main className="          
      flex min-h-screen flex-col gap-y-16
       bg-gradient-to-b from-muted/50
          via-muted/25 to-background          
          ">
      

        <Categories/>

         <ProductSection />

         <Testimonial
          className="py-0"
          description="Não acredite só em nós — ouça o que nossos clientes têm a dizer"
          testimonials={testimonials}
          title="O que nossos clientes dizem"
         ></Testimonial>
         
      </main>
    </div>
  );
}
