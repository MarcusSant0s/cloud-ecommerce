import Link from "next/link";

/**
 * Shell das páginas institucionais ligadas no rodapé (cuidados, garantia,
 * entrega, trocas, guia de tamanhos). Segue o mesmo desenho de /termos e
 * /privacidade — cabeçalho com sobrelinha da marca, título em Cormorant e o
 * aviso de demonstração.
 */

export const h2 =
  "font-display text-xl font-normal uppercase tracking-[0.12em] text-foreground";
export const p = "text-sm leading-relaxed text-muted-foreground";
export const strong = "font-medium text-foreground";

export const WHATSAPP_URL = "https://wa.me/message/WRRZNW4WUYWVJ1";

export function WhatsAppLink({ children = "falar no WhatsApp" }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-foreground underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

export function InstitutionalPage({ title, intro, children }) {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12 space-y-3">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Brenda Nunes
        </span>
        <h1 className="font-display text-3xl font-normal uppercase tracking-[0.12em] text-foreground">
          {title}
        </h1>
        {intro && <p className={p}>{intro}</p>}
        <p className="rounded-sm border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Aviso:</strong> este site é uma
          demonstração de portfólio. Nenhuma venda real é realizada, nenhuma peça
          é enviada e os prazos e condições abaixo são ilustrativos.
        </p>
      </header>

      <div className="space-y-10">{children}</div>

      <footer className="mt-16 border-t border-border/60 pt-6">
        <p className={p}>
          Ficou alguma dúvida? Você pode <WhatsAppLink />, ou ver também{" "}
          <Link
            href="/termos"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            os termos de uso
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}

export function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className={h2}>{title}</h2>
      {children}
    </section>
  );
}
