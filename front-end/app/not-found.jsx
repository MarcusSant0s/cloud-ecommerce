import ErrorState from "@/components/ErrorState";

export const metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <ErrorState
      description="A página que você procura não existe ou foi movida."
      eyebrow="Erro 404"
      homeHref="/"
      homeLabel="Voltar para a home"
      secondaryHref="/products"
      secondaryLabel="Ver todos os produtos"
      title="Página não encontrada"
    />
  );
}
