import Link from "next/link";
import { InstitutionalPage, Section, p, WhatsAppLink } from "@/components/InstitutionalPage";

export const metadata = {
  title: "Entrega e Frete",
  description: "Como funciona o frete, os prazos de envio e o acompanhamento do seu pedido.",
};

export default function EntregaPage() {
  return (
    <InstitutionalPage
      title="Entrega e Frete"
      intro="O frete é calculado pela região do seu CEP e aparece no carrinho antes de você fechar o pedido — sem surpresa no final."
    >
      <Section title="Como o frete é calculado">
        <p className={p}>
          O valor sai da macrorregião do CEP de entrega. Assim que você preenche o
          endereço, o carrinho mostra o frete somado ao subtotal, e é exatamente
          esse valor que vai para o pagamento. Regiões atendidas: Sudeste, Sul,
          Centro-Oeste e Norte/Nordeste.
        </p>
      </Section>

      <Section title="Prazo de postagem">
        <p className={p}>
          A peça é separada, conferida e embalada após a confirmação do pagamento.
          Pagamento por Pix costuma confirmar em segundos; cartão pode levar mais.
          Enquanto o pagamento não confirma, o pedido fica como{" "}
          <em>aguardando pagamento</em> e a peça não é enviada.
        </p>
      </Section>

      <Section title="Acompanhar">
        <p className={p}>
          O andamento de cada compra fica em{" "}
          <Link
            href="/orders"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Meus Pedidos
          </Link>
          , com o status, os itens e o endereço de entrega. Se algo parecer parado,{" "}
          <WhatsAppLink>chame no WhatsApp</WhatsAppLink>.
        </p>
      </Section>

      <Section title="Endereço">
        <p className={p}>
          A entrega usa o endereço cadastrado na sua conta, que você pode conferir
          e corrigir em{" "}
          <Link
            href="/account-user"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Minha Conta
          </Link>
          . Vale revisar antes de fechar o pedido — depois de despachado não dá
          para redirecionar.
        </p>
      </Section>
    </InstitutionalPage>
  );
}
