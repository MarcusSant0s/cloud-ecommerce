'use client'
import { useState } from "react"
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import {Cart} from "@/components/cart"
import { Skeleton } from "@/primitives/skeleton";
import { useAuth } from "@/contexts/AuthContext";


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const {user, logout} = useAuth();

  const handleLogout = () => {
    logout();
  
  } 

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
           <Cart/>
          </div>

          {/* Auth buttons (desktop) */}
          <div className="hidden md:block">

          {user ? (
            <div className="flex items-center gap-2">
              <h3 className="text-3xl text-red-950">{user.firstName}</h3>
                <button
                onClick={handleLogout} 
                className="
                h-8 rounded-md bg-primary
                 px-3 text-sm font-medium 
                 text-primary-foreground 
                 shadow-xs transition 
                 hover:bg-primary/90
                 "
                 >
                  LogOut
                </button>
            
            </div>
          ):(

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
              )}
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