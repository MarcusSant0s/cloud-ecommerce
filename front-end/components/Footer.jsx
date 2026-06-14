import Link from "next/link"
import { Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 space-y-4 md:col-span-1">
            <Link className="flex items-center gap-2" href="/">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                Loja
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Sua loja completa de tecnologia. Produtos premium com preços competitivos e entrega rápida.
            </p>
            <div className="flex space-x-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Github, label: "GitHub" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <button key={label} className="flex h-8 w-8 items-center justify-center rounded-full border bg-background transition hover:bg-accent">
                  <Icon className="h-4 w-4" />
                  <span className="sr-only">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Loja</h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="text-muted-foreground hover:text-foreground" href="/products">Todos os Produtos</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/products?category=audio">Áudio</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/products?category=wearables">Wearables</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/products?category=smartphones">Smartphones</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/products?category=laptops">Notebooks</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="text-muted-foreground hover:text-foreground" href="/about">Sobre Nós</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/careers">Carreiras</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/blog">Blog</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/press">Imprensa</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/contact">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="text-muted-foreground hover:text-foreground" href="/help">Central de Ajuda</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/shipping">Entrega e Devoluções</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/warranty">Garantia</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/privacy">Política de Privacidade</Link></li>
              <li><Link className="text-muted-foreground hover:text-foreground" href="/terms">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Loja. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <Link className="hover:text-foreground" href="/privacy">Privacidade</Link>
              <Link className="hover:text-foreground" href="/terms">Termos</Link>
              <Link className="hover:text-foreground" href="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
