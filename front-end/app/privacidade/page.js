import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Loja coleta, usa e protege seus dados pessoais, em conformidade com a LGPD (Lei nº 13.709/2018).",
};

const h2 = "font-display text-xl font-normal uppercase tracking-[0.12em] text-foreground";
const p = "text-sm leading-relaxed text-muted-foreground";
const li = "text-sm leading-relaxed text-muted-foreground";

export default function PrivacidadePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12 space-y-3">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Loja
        </span>
        <h1 className="font-display text-3xl font-normal uppercase tracking-[0.12em] text-foreground">
          Política de Privacidade
        </h1>
        <p className={p}>
          Última atualização: 16 de julho de 2026 · Em conformidade com a Lei
          Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018).
        </p>
        <p className="rounded-sm border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Aviso:</strong> este site é uma
          demonstração de portfólio. Nenhuma venda real é realizada e os dados
          cadastrados existem apenas para fins de demonstração técnica.
        </p>
      </header>

      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className={h2}>1. Controlador dos dados</h2>
          <p className={p}>
            A Loja é a controladora dos dados pessoais tratados neste site.
            Para exercer seus direitos ou tirar dúvidas sobre esta política,
            utilize o canal indicado na seção &ldquo;Contato&rdquo;.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>2. Dados que coletamos</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li className={li}>
              <strong className="text-foreground">Cadastro:</strong> nome,
              sobrenome, e-mail, senha (armazenada com criptografia
              irreversível), telefone e endereço de entrega (CEP, rua, número,
              bairro e cidade).
            </li>
            <li className={li}>
              <strong className="text-foreground">Compras:</strong> itens do
              carrinho, pedidos realizados e status de pagamento.
            </li>
            <li className={li}>
              <strong className="text-foreground">Armazenamento local:</strong>{" "}
              seu navegador guarda um token de sessão (<code>token</code>) e o
              registro da sua escolha sobre cookies (<code>cookie-consent</code>).
              Não utilizamos cookies de rastreamento nem ferramentas de
              analytics de terceiros.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>3. Finalidades e bases legais</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li className={li}>
              Criar e manter sua conta, processar pedidos e realizar entregas —{" "}
              <em>execução de contrato</em> (art. 7º, V).
            </li>
            <li className={li}>
              Manter sua sessão autenticada e garantir a segurança da loja —{" "}
              <em>legítimo interesse</em> (art. 7º, IX).
            </li>
            <li className={li}>
              Cumprir obrigações legais e fiscais relacionadas a vendas —{" "}
              <em>obrigação legal</em> (art. 7º, II).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>4. Compartilhamento com operadores</h2>
          <p className={p}>
            Compartilhamos dados apenas com os serviços estritamente
            necessários à operação da loja:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li className={li}>
              <strong className="text-foreground">Mercado Pago</strong> —
              processamento de pagamentos.
            </li>
            <li className={li}>
              <strong className="text-foreground">ViaCEP</strong> — consulta de
              endereço a partir do CEP digitado no cadastro.
            </li>
            <li className={li}>
              <strong className="text-foreground">Amazon Web Services (AWS)</strong>{" "}
              — hospedagem da aplicação e armazenamento de imagens de produtos.
            </li>
          </ul>
          <p className={p}>Não vendemos nem cedemos seus dados a terceiros.</p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>5. Retenção</h2>
          <p className={p}>
            Mantemos seus dados enquanto sua conta existir. Ao excluir a conta,
            seus dados cadastrais, carrinho e pedidos são removidos. Em uma
            operação comercial real, registros de pedidos pagos poderiam ser
            retidos pelo prazo exigido pela legislação fiscal (art. 16, I).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>6. Seus direitos (art. 18)</h2>
          <p className={p}>Você pode, a qualquer momento:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li className={li}>
              Acessar e corrigir seus dados na página{" "}
              <Link
                href="/account-user"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Minha Conta
              </Link>
              ;
            </li>
            <li className={li}>
              Eliminar seus dados excluindo sua conta na própria página Minha
              Conta;
            </li>
            <li className={li}>
              Solicitar confirmação de tratamento, portabilidade, anonimização
              ou revogação de consentimento pelo canal de contato abaixo.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>7. Segurança</h2>
          <p className={p}>
            Senhas são armazenadas com hash BCrypt, o acesso à API é protegido
            por autenticação JWT e as áreas administrativas exigem permissão
            específica. Nenhum dado de cartão de crédito transita ou é
            armazenado por nossos servidores — o pagamento ocorre no ambiente
            do Mercado Pago.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>8. Contato</h2>
          <p className={p}>
            Para exercer seus direitos como titular de dados, entre em contato
            pelo e-mail{" "}
            <a
              href="mailto:privacidade@loja.demo"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              privacidade@loja.demo
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
