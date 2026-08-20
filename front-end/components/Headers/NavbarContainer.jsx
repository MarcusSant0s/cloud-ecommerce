import Navbar from "./Navbar";
import { fetchJson } from "@/lib/server-api";

// Server component: fetches the category list once (cached) and hands it to the
// client Navbar. A failed or slow fetch degrades to an empty menu instead of
// breaking the whole layout — this runs on every route, so it must never hang.
export default async function NavbarContainer() {
  const data = await fetchJson("/category/all-categories", {
    next: { revalidate: 60 },
  });
  return <Navbar categories={Array.isArray(data) ? data : []} />;
}
