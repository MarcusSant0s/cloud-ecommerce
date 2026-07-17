import Link from "next/link";

export const metadata = {
  title: "Termos de Uso",
  description: "Condições de uso da Loja.",
};

const h2 = "font-display text-xl font-normal uppercase tracking-[0.12em] text-foreground";
const p = "text-sm leading-relaxed text-muted-foreground";

export default function TermosPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12 space-y-3">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Loja
        </span>
        <h1 className="font-display text-3xl font-normal uppercase tracking-[0.12em] text-foreground">
          Termos de Uso
        </h1>
        <p className={p}>Última atualização: 16 de julho de 2026.</p>
        <p className="rounded-sm border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Aviso:</strong> este site é uma
          demonstração de portfólio. Nenhuma venda real é realizada, nenhum
          produto é entregue e nenhuma cobrança real é efetuada.
        </p>
      </header>

      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className={h2}>1. Aceitação</h2>
          <p className={p}>
            Ao criar uma conta ou navegar pela Loja, você concorda com estes
            Termos de Uso e com a nossa{" "}
            <Link
              href="/privacidade"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>2. Conta</h2>
          <p className={p}>
            Você é responsável por manter a confidencialidade das suas
            credenciais de acesso. As informações fornecidas no cadastro devem
            ser verdadeiras e atualizadas. Você pode editar seus dados ou
            excluir sua conta a qualquer momento na página Minha Conta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>3. Compras e pagamentos</h2>
          <p className={p}>
            Os pedidos são processados por meio do Mercado Pago. Preços,
            promoções e disponibilidade de estoque exibidos nesta demonstração
            são fictícios e podem mudar sem aviso.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>4. Propriedade intelectual</h2>
          <p className={p}>
            A identidade visual, o código e o conteúdo desta demonstração
            pertencem aos seus autores. As imagens de produtos utilizadas
            provêm de bancos de imagens (Unsplash) apenas para fins
            ilustrativos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>5. Limitação de responsabilidade</h2>
          <p className={p}>
            Por se tratar de um ambiente de demonstração, o serviço é fornecido
            &ldquo;como está&rdquo;, sem garantias de disponibilidade ou
            adequação a qualquer finalidade comercial.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>6. Contato</h2>
          <p className={p}>
            Dúvidas sobre estes termos podem ser enviadas para{" "}
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
