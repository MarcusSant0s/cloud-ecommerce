"use client";

import Link from "next/link";
import { Package, Tag, ShoppingBag, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/primitives/card";

const SECTIONS = [
  {
    href: "/admin/products",
    icon: Package,
    title: "Produtos",
    description: "Crie, edite e exclua produtos e gerencie suas imagens.",
  },
  {
    href: "/admin/categories",
    icon: Tag,
    title: "Categorias",
    description: "Gerencie as categorias de produtos e suas imagens de capa.",
  },
  {
    href: "/admin/orders",
    icon: ShoppingBag,
    title: "Pedidos",
    description: "Veja todos os pedidos e atualize seus status.",
  },
  {
    href: "/admin/users",
    icon: Users,
    title: "Usuários",
    description: "Liste todos os usuários e gerencie seus papéis.",
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Painel</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Bem-vindo ao painel administrativo. Selecione uma seção para gerenciar.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href}>
            <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <Icon size={20} className="text-primary" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
