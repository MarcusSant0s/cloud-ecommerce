import Categories from '@/components/Categories';
import HeroBanner from '@/components/HeroBanner';
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
    <div>
      <main className="flex min-h-screen flex-col bg-background">

        <HeroBanner />

        <Categories />

        <ProductSection />

        <Testimonial
          description="Não acredite só em nós — ouça o que nossos clientes têm a dizer"
          testimonials={testimonials}
          title="O que nossos clientes dizem"
        />

      </main>
    </div>
  );
}
