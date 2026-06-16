# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

No test suite is configured. The backend API must be running at `http://localhost:8080` for the app to function.

## Architecture

This is a **Next.js 16 (App Router)** e-commerce storefront using React 19 and TailwindCSS v4.

### Path alias
`@/*` resolves to the project root (configured in `jsconfig.json`).

### Key directories

| Directory | Purpose |
|---|---|
| `app/` | Next.js routes (App Router) |
| `components/` | Feature-level components |
| `primitives/` | Low-level UI wrappers (Button, Card, Input, etc.) |
| `lib/` | Shared hooks: `use-cart.jsx`, `use-media-query.jsx`, `utils.js` |
| `contexts/` | `AuthContext.js` — JWT auth state |
| `services/api.js` | Axios instance pointed at `http://localhost:8080` |

### Data flow pattern

Server Components in `app/` fetch data directly (using axios or `fetch` with `next: { revalidate }`) and pass it as props to `"use client"` components. Client Components handle interactivity, cart operations, and auth-gated content.

### Auth

`contexts/AuthContext.js` manages JWT auth. On mount it reads `localStorage.getItem("token")`, sets it on `api.defaults.headers.common['Authorization']`, and calls `GET /users/me` to rehydrate the user. `login`, `register`, and `logout` are exposed via `useAuth()`. The token is stored in `localStorage` and injected onto the axios instance globally.

### Cart

`lib/use-cart.jsx` provides `CartProvider` and `useCart()`. Cart state lives server-side; the hook syncs via `GET /cart/:userId`. Mutations (`addItem`, `updateQuantity`, `removeItem`, `clearCart`) use **optimistic updates** — state updates immediately and rolls back on API error. Toast notifications are shown via `sonner`.

### Provider nesting (layout.js)

```
AuthProvider
  └── CartProvider   (needs user from AuthContext to fetch cart)
        └── Navbar + {children}
```
`Footer` is rendered outside providers.

### Primitives vs components

`primitives/` contains thin wrappers around Radix UI / Vaul (Button, Card, Input, Label, Separator, Sheet, Drawer, Skeleton, Badge, Avatar). These are the design system atoms. `components/` uses them to build product cards, cart UI, navbar, etc.

### Image sources

`next.config.mjs` allows remote images from `images.unsplash.com` and `cloud-commerce-stack.s3.sa-east-1.amazonaws.com`. Add new domains there if needed.

### API endpoints used

| Resource | Examples |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /users/me`, `PUT /users/UpdateMe` |
| Products | `GET /product`, `GET /product/:id` |
| Categories | `GET /category/all-categories` |
| Cart | `GET /cart/:userId`, `POST /cart/:userId/add`, `PATCH /cart/:userId/item/:itemId`, `DELETE /cart/:userId/item/:itemId`, `DELETE /cart/:userId` |
| Orders | `GET /order` |
