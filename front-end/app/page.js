import Categories from '@/components/Categories';
import HeroBanner from '@/components/HeroBanner';
import ProductSection from '@/components/ProductSection';
import Testimonial from '@/components/Testimonial';
import { fetchJson } from '@/lib/server-api';

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Início",
  description:
    "Semijoias com banho de ouro 18k e prata 925. Brincos, colares, anéis e pulseiras escolhidos peça a peça.",
};

const RATING_FORMAT = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export default async function Home() {
  // Avaliações reais do perfil da loja no Google, servidas pelo back-end (que
  // guarda a chave e mantém cache). Se não houver — chave não configurada, API
  // fora, perfil sem avaliação — a seção não é renderizada. Nada é inventado
  // para preencher o espaço.
  const data = await fetchJson("/reviews");
  const reviews = data?.reviews ?? [];

  const testimonials = reviews.map((review) => ({
    author: {
      name: review.authorName,
      avatar: review.authorPhotoUrl,
      uri: review.authorUri,
      // No lugar de um @, o que importa numa avaliação: quando foi escrita.
      handle: review.relativeTime,
    },
    text: review.text,
    rating: review.rating,
  }));

  const summary =
    data?.rating && data?.totalRatings
      ? `${RATING_FORMAT.format(data.rating)} de 5 em ${data.totalRatings} avaliações no Google`
      : "Avaliações de quem já comprou, direto do Google";

  return (
    <div>
      <main className="flex min-h-screen flex-col bg-background">

        <HeroBanner />

        <Categories />

        <ProductSection />

        {testimonials.length > 0 && (
          <Testimonial
            description={summary}
            testimonials={testimonials}
            title="O que nossas clientes dizem"
          />
        )}

      </main>
    </div>
  );
}
