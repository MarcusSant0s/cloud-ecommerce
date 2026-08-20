import Link from "next/link"
import { fetchJson } from "@/lib/server-api"

const colHead = "mb-4 text-[0.6rem] font-medium uppercase tracking-[0.25em] text-muted-foreground"
const colLink = "text-sm text-muted-foreground transition-colors hover:text-foreground"

const Footer = async () => {
  // fetchJson returns null when the API is down or times out — degrade gracefully.
  const data = await fetchJson("/category/all-categories", {
    next: { revalidate: 60 },
  });
  const categories = Array.isArray(data) ? data : [];

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-normal uppercase tracking-[0.3em] text-foreground">
                Loja
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Peças selecionadas com curadoria. Elegância não é ser notada — é ser lembrada.
            </p>
          </div>

          {/* Coleções */}
          <div>
            <h3 className={colHead}>Coleções</h3>
            <ul className="space-y-3">
              <li><Link className={colLink} href="/products">Todos os Produtos</Link></li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link className={`${colLink} capitalize`} href={`/products?categoryId=${category.id}`}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conta */}
          <div>
            <h3 className={colHead}>Conta</h3>
            <ul className="space-y-3">
              <li><Link className={colLink} href="/auth/sign-in">Entrar</Link></li>
              <li><Link className={colLink} href="/auth/sign-up">Cadastrar</Link></li>
              <li><Link className={colLink} href="/orders">Meus Pedidos</Link></li>
              <li><Link className={colLink} href="/account-user">Minha Conta</Link></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className={colHead}>Suporte</h3>
            <ul className="space-y-3">
              <li><Link className={colLink} href="/products">Central de Ajuda</Link></li>
              <li><Link className={colLink} href="/products">Entrega e Frete</Link></li>
              <li><Link className={colLink} href="/products">Trocas e Devoluções</Link></li>
              <li><Link className={colLink} href="/products">Fale Conosco</Link></li>
            </ul>
          </div>
        </div>

        {/* Legal band */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Loja. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <Link className="transition-colors hover:text-foreground" href="/privacidade">Privacidade</Link>
            <Link className="transition-colors hover:text-foreground" href="/termos">Termos</Link>
            <span>PT-BR · BRL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
