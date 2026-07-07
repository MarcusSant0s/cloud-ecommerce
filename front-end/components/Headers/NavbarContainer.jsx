import Navbar from "./Navbar";

// Server component: fetches the category list once (cached) and hands it to the
// client Navbar. A failed fetch degrades to an empty menu instead of breaking
// the whole layout.
async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/category/all-categories`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function NavbarContainer() {
  const categories = await getCategories();
  return <Navbar categories={categories} />;
}
