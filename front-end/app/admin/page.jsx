"use client";

import Link from "next/link";
import { Package, Tag, ShoppingBag, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/primitives/card";

const SECTIONS = [
  {
    href: "/admin/products",
    icon: Package,
    title: "Products",
    description: "Create, edit, delete products and manage their images.",
  },
  {
    href: "/admin/categories",
    icon: Tag,
    title: "Categories",
    description: "Manage product categories and their cover images.",
  },
  {
    href: "/admin/orders",
    icon: ShoppingBag,
    title: "Orders",
    description: "View all orders and update their statuses.",
  },
  {
    href: "/admin/users",
    icon: Users,
    title: "Users",
    description: "List all users and manage their roles.",
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Welcome to the admin panel. Select a section to manage.
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
