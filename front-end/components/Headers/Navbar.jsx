'use client'
import { useState } from "react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text tracking-tight text-transparent">
              Loja
            </span>
          </a>

          <nav className="hidden md:flex">
            <ul className="flex items-center gap-6">
              <li>
                <a
                  href="/"
                  className="text-sm font-semibold text-primary transition-colors hover:text-primary"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Products
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <div className="relative">
            <button
              type="button"
              aria-label="Open cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-xs transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>

              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-primary-foreground">
                3
              </span>
            </button>
          </div>

          {/* Auth buttons (desktop) */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <a href="/auth/sign-in">
                <button className="h-8 rounded-md px-3 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground">
                  Log in
                </button>
              </a>

              <a href="/auth/sign-up">
                <button className="h-8 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90">
                  Sign up
                </button>
              </a>
            </div>
          </div>

          {/* Mobile menu */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition hover:bg-accent hover:text-accent-foreground md:hidden"
              onClick={() => setMobileMenuOpen(prev => !prev)}          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
        </div>

      </div>

{/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <ul className="flex flex-col gap-4">
             <li>
                <a
                  href="/products"
                  className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </a>
              </li>
            </ul>

            <div className="mt-6 flex flex-col gap-2">
              <a href="/auth/sign-in">
                <button className="w-full rounded-md px-3 py-2 text-base font-medium
                  hover:bg-muted/50">
                  Log in
                </button>
              </a>

              <a href="/auth/sign-up">
                <button className="w-full  rounded-md bg-primary px-3 py-2 text-base font-medium
                  text-primary-foreground
                  hover:bg-primary/90">
                  Sign up
                </button>
              </a>
            </div>
          </div>
        )}



    </div>
  )
}