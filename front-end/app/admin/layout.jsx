"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tag, ShoppingBag, Users, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/primitives/button";
import { Skeleton } from "@/primitives/skeleton";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

  const sidebarBody = (
    <>
      <div className="flex items-center justify-between border-b p-4">
        <span className="text-base font-bold">Admin Panel</span>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent md:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={logout}
        >
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r bg-card md:flex">
        {sidebarBody}
      </aside>

      {/* Mobile drawer + backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-xl transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarBody}
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent"
          >
            <Menu size={20} />
          </button>
          <span className="text-base font-bold">Admin Panel</span>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
