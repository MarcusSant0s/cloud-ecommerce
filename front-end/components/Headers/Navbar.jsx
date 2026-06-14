'use client'
import { useState, useRef, useEffect } from "react"
import Link from "next/link";
import { Cart } from "@/components/cart"
import { useAuth } from "@/contexts/AuthContext";
import { User, Package, LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import useIsAdmin from "@/lib/useIsAdmin";

export default function Navbar() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { user, logout } = useAuth();
  const isAdmin = useIsAdmin();
   
  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text tracking-tight text-transparent">
              Loja
            </span>
          </Link>

          <nav className="hidden md:flex">
            <ul className="flex items-center gap-6">
              <li>
                <Link href="/" className="text-sm font-semibold text-primary transition-colors hover:text-primary">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Produtos
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Cart />

          {/* Auth — desktop */}
          <div className="hidden md:block">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* trigger */}
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition hover:bg-accent"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="max-w-[100px] truncate">{user.firstName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* dropdown */}
                {(dropdownOpen) && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border bg-popover p-1 shadow-md">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="text-xs text-muted-foreground">Conectado como</p>
                      <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent"
                      >
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        Painel Admin
                      </Link>
                    )}

                    <Link
                      href="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      Meus Pedidos
                    </Link>

                    <Link
                      href="/account-user"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Minha Conta
                    </Link>

                    <div className="border-t mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}



              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/sign-in">
                  <button className="h-8 rounded-md px-3 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground">
                    Entrar
                  </button>
                </Link>
                <Link href="/auth/sign-up">
                  <button className="h-8 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90">
                    Cadastrar
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition hover:bg-accent hover:text-accent-foreground md:hidden"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t py-4">
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="/products" className="block rounded-md px-3 py-2 text-base font-medium hover:bg-muted hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                Produtos
              </Link>
            </li>
            {user && (
              <>
                {isAdmin && (
                  <li>
                    <Link href="/admin" className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                      <ShieldCheck className="h-4 w-4" /> Painel Admin
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/orders" className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                    <Package className="h-4 w-4" /> Meus Pedidos
                  </Link>
                </li>
                <li>
                  <Link href="/account-user" className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4" /> Minha Conta
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t pt-4">
            {user ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            ) : (
              <>
                <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full rounded-md px-3 py-2 text-base font-medium hover:bg-muted/50">Entrar</button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full rounded-md bg-primary px-3 py-2 text-base font-medium text-primary-foreground hover:bg-primary/90">Cadastrar</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}