import Link from "next/link";
import { InstitutionalPage, Section, p, WhatsAppLink } from "@/components/InstitutionalPage";

export const metadata = {
  title: "Garantia",
  description:
    "O que a garantia das semijoias Brenda Nunes cobre, por quanto tempo e como acionar.",
};

export default function GarantiaPage() {
  return (
    <InstitutionalPage
      title="Garantia"
      intro="Toda peça sai daqui conferida. Se o banho falhar em uso normal, o problema é nosso."
    >
      <Section title="O que cobre">
        <ul className={`${p} list-disc space-y-2 pl-5`}>
          <li>Oxidação ou perda de banho em uso normal, dentro do prazo.</li>
          <li>Defeito de fabricação: solda que cede, fecho que não trava, pedra que solta sem impacto.</li>
          <li>Peça que chega diferente do anunciado ou danificada no transporte.</li>
        </ul>
      </Section>

      <Section title="O que não cobre">
        <ul className={`${p} list-disc space-y-2 pl-5`}>
          <li>Contato com produtos químicos — perfume, cloro, água do mar, produtos de limpeza.</li>
          <li>Riscos, amassados, peça torta ou corrente arrebentada por esforço.</li>
          <li>Desgaste natural muito além do prazo de garantia.</li>
          <li>Peça alterada, soldada ou repolida por terceiros.</li>
        </ul>
        <p className={p}>
          A maior parte desses casos é evitável — está tudo em{" "}
          <Link
            href="/cuidados"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            cuidados com a peça
          </Link>
          .
        </p>
      </Section>

      <Section title="Como acionar">
        <p className={p}>
          <WhatsAppLink>Chame no WhatsApp</WhatsAppLink> com o número do pedido e
          fotos da peça em boa luz, mostrando o ponto do problema. Não é preciso
          enviar nada antes de conversarmos — se for caso de garantia, combinamos
          a troca ou o reparo a partir dali.
        </p>
        <p className={p}>
          Seus pedidos e os respectivos números estão em{" "}
          <Link
            href="/orders"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Meus Pedidos
          </Link>
          .
        </p>
      </Section>
    </InstitutionalPage>
  );
}
