import Link from "next/link"

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/all-categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

const Footer = async () => {
  const categories = await getCategories();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <Link className="flex items-center gap-2" href="/">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                Loja
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Sua loja completa de tecnologia. Produtos premium com preços competitivos e entrega rápida.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Loja</h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="text-muted-foreground hover:text-foreground" href="/products">Todos os Produtos</Link></li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link className="text-muted-foreground hover:text-foreground" href={`/products?categoryId=${category.id}`}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Loja. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
