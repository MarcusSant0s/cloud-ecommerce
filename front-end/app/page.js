import Categories from '@/components/Categories';
import HeroBanner from '@/components/HeroBanner';
import ProductSection from '@/components/ProductSection';
import Testimonial from '@/components/Testimonial';
import {testimonials} from '@/app/mocks'

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Início",
  description:
    "Semijoias com banho de ouro 18k e prata 925. Brincos, colares, anéis e pulseiras escolhidos peça a peça.",
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
