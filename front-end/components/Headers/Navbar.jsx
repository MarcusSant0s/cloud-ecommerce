'use client'
import { useState, useRef, useEffect } from "react"
import Link from "next/link";
import Image from "next/image";
import { Cart } from "@/components/cart"
import { useAuth } from "@/contexts/AuthContext";
import { User, Package, LogOut, ChevronDown, ShieldCheck, Menu, X, ArrowRight } from "lucide-react";
import useIsAdmin from "@/lib/useIsAdmin";

export default function Navbar({ categories = [] }) {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const dropdownRef = useRef(null)
  const catRef = useRef(null)

  const { user, logout } = useAuth();
  const isAdmin = useIsAdmin();

  const hasCategories = categories.length > 0;
  const featured = hasCategories ? categories[0] : null;

  // close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCatOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // shared underline-on-hover treatment for top-level nav items
  const navLink = "group relative py-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
  const underline = "pointer-events-none absolute inset-x-0 -bottom-px h-px origin-center scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100"

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-10">
            <Link href="/" className="shrink-0">
              <span className="font-display text-2xl font-normal uppercase tracking-[0.3em] text-foreground">
                Loja
              </span>
            </Link>

            <nav className="hidden md:flex">
              <ul className="flex items-center gap-8">
                <li>
                  <Link href="/" className={navLink}>
                    Início
                    <span className={underline} />
                  </Link>
                </li>

                {/* Categorias mega-menu */}
                {hasCategories && (
                  <li
                    className="relative"
                    ref={catRef}
                    onMouseEnter={() => setCatOpen(true)}
                    onMouseLeave={() => setCatOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setCatOpen(o => !o)}
                      aria-expanded={catOpen}
                      aria-haspopup="true"
                      className={`flex items-center gap-1.5 ${navLink} ${catOpen ? "text-foreground" : ""}`}
                    >
                      Categorias
                      <ChevronDown className={`h-3 w-3 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                      <span className={`${underline} ${catOpen ? "scale-x-100" : ""}`} />
                    </button>

                    {catOpen && (
                      <div className="absolute left-0 top-full z-50 pt-3">
                        <div className="flex w-[42rem] max-w-[92vw] gap-6 rounded-sm border border-border/60 bg-popover p-6 shadow-xl">
                          {/* Category list */}
                          <div className="flex-1">
                            <p className="mb-3 text-[0.6rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                              Coleções
                            </p>
                            <ul className="divide-y divide-border/50">
                              {categories.map((category) => (
                                <li key={category.id}>
                                  <Link
                                    href={`/products?categoryId=${category.id}`}
                                    onClick={() => setCatOpen(false)}
                                    className="group flex items-center justify-between py-2.5 text-foreground/80 transition-colors hover:text-foreground"
                                  >
                                    <span className="text-sm uppercase tracking-[0.12em] capitalize">{category.name}</span>
                                    <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link
                              href="/products"
                              onClick={() => setCatOpen(false)}
                              className="mt-4 inline-block text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground underline-offset-4 hover:underline"
                            >
                              Ver tudo
                            </Link>
                          </div>

                          {/* Featured collection */}
                          {featured && (
                            <Link
                              href={`/products?categoryId=${featured.id}`}
                              onClick={() => setCatOpen(false)}
                              className="group relative hidden w-48 shrink-0 overflow-hidden rounded-sm sm:block"
                            >
                              <div className="relative aspect-[3/4]">
                                {featured.url && (
                                  <Image
                                    src={featured.url}
                                    alt={featured.name}
                                    fill
                                    sizes="192px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                              </div>
                              <div className="absolute inset-x-3 bottom-3">
                                <p className="text-[0.55rem] uppercase tracking-[0.25em] text-white/80">Destaque</p>
                                <p className="font-display text-lg uppercase tracking-[0.1em] text-white capitalize">{featured.name}</p>
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                )}

                <li>
                  <Link href="/products" className={navLink}>
                    Produtos
                    <span className={underline} />
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <Cart />

            {/* Auth — desktop */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  {/* trigger */}
                  <button
                    onClick={() => setDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-accent"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="max-w-[100px] truncate">{user.firstName}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* dropdown */}
                  {(dropdownOpen) && (
                    <div className="absolute right-0 z-50 mt-2 w-52 rounded-sm border bg-popover p-1 shadow-lg">
                      <div className="border-b px-3 py-2 mb-1">
                        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Conectado como</p>
                        <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition hover:bg-accent"
                        >
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          Painel Admin
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition hover:bg-accent"
                      >
                        <Package className="h-4 w-4 text-muted-foreground" />
                        Meus Pedidos
                      </Link>

                      <Link
                        href="/account-user"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition hover:bg-accent"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Minha Conta
                      </Link>

                      <div className="border-t mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth/sign-in" className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground">
                    Entrar
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="rounded-sm bg-foreground px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.15em] text-background transition hover:bg-foreground/90"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Abrir menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-foreground transition hover:bg-accent md:hidden"
              onClick={() => setMobileMenuOpen(prev => !prev)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile category strip — one-tap access, hidden on desktop where the mega-menu handles it */}
        {hasCategories && (
          <div className="md:hidden -mx-4 border-t border-border/60 sm:-mx-6">
            <div className="flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none sm:px-6">
              <Link
                href="/products"
                className="shrink-0 rounded-sm border border-border px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Tudo
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?categoryId=${category.id}`}
                  className="shrink-0 rounded-sm border border-border px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <ul className="flex flex-col gap-1">
              <li>
                <Link href="/" className="block rounded-sm px-3 py-2 text-xs font-medium uppercase tracking-[0.15em] hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                  Início
                </Link>
              </li>
              <li>
                <Link href="/products" className="block rounded-sm px-3 py-2 text-xs font-medium uppercase tracking-[0.15em] hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                  Produtos
                </Link>
              </li>
            </ul>

            {/* Categorias — mobile */}
            {hasCategories && (
              <div className="mt-3 border-t pt-3">
                <p className="px-3 pb-2 text-[0.6rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Categorias
                </p>
                <ul className="grid grid-cols-2 gap-1">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products?categoryId=${category.id}`}
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] capitalize hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-sm border bg-muted">
                          {category.url && (
                            <Image src={category.url} alt={category.name} fill sizes="28px" className="object-cover" />
                          )}
                        </div>
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                      <ShieldCheck className="h-4 w-4" /> Painel Admin
                    </Link>
                  )}
                  <Link href="/orders" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                    <Package className="h-4 w-4" /> Meus Pedidos
                  </Link>
                  <Link href="/account-user" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4" /> Minha Conta
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full rounded-sm border border-border px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.15em] hover:bg-muted">Entrar</button>
                  </Link>
                  <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full rounded-sm bg-foreground px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.15em] text-background hover:bg-foreground/90">Cadastrar</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
