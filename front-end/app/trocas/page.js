import Link from "next/link";
import { InstitutionalPage, Section, p, WhatsAppLink } from "@/components/InstitutionalPage";

export const metadata = {
  title: "Trocas e Devoluções",
  description: "Prazo de arrependimento, condições para troca e como solicitar.",
};

export default function TrocasPage() {
  return (
    <InstitutionalPage
      title="Trocas e Devoluções"
      intro="Comprar joia sem ver ao vivo tem risco, e ele é nosso, não seu."
    >
      <Section title="Arrependimento: 7 dias">
        <p className={p}>
          Em compra pela internet você pode desistir em até{" "}
          <strong className="font-medium text-foreground">7 dias corridos</strong>{" "}
          a partir do recebimento, sem precisar justificar. É o direito de
          arrependimento do Código de Defesa do Consumidor (art. 49). Devolvida a
          peça, o valor pago é restituído integralmente, frete incluído.
        </p>
      </Section>

      <Section title="Troca por tamanho">
        <p className={p}>
          Aro apertado ou colar mais curto do que você esperava é o motivo mais
          comum de troca, e não tem problema nenhum. Se ficar em dúvida antes de
          comprar, o{" "}
          <Link
            href="/guia-de-tamanhos"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            guia de tamanhos
          </Link>{" "}
          resolve na maioria dos casos.
        </p>
      </Section>

      <Section title="Condições">
        <ul className={`${p} list-disc space-y-2 pl-5`}>
          <li>Peça sem sinais de uso, sem riscos e sem alteração.</li>
          <li>Embalagem original, com a peça acomodada como veio.</li>
          <li>Pedido identificável — o número está em Meus Pedidos.</li>
        </ul>
        <p className={p}>
          Peça com defeito não depende dessas condições nem do prazo de 7 dias:
          isso é{" "}
          <Link
            href="/garantia"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            garantia
          </Link>
          .
        </p>
      </Section>

      <Section title="Como solicitar">
        <p className={p}>
          <WhatsAppLink>Chame no WhatsApp</WhatsAppLink> com o número do pedido e
          diga se prefere troca ou devolução. Combinamos a postagem a partir dali —
          não envie a peça antes de falar com a gente, para não se perder no
          caminho.
        </p>
      </Section>
    </InstitutionalPage>
  );
}
