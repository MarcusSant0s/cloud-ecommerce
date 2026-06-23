# Cloud E-commerce

A full-stack e-commerce platform with JWT authentication, product & cart management, region-based shipping, and Mercado Pago payments. The whole stack runs behind Nginx and is orchestrated with Docker Compose.

## Architecture

```
                ┌─────────────────────────────┐
   Browser ───▶ │  Nginx (:80)                │
                │   /      → frontend          │
                │   /api/  → backend (rewrite) │
                └──────────┬──────────┬────────┘
                           │          │
                  ┌────────▼───┐  ┌───▼─────────────┐
                  │ Frontend   │  │ Backend         │
                  │ Next.js 16 │  │ Spring Boot 4   │
                  │ (:3000)    │  │ (:8080)         │
                  └────────────┘  └───┬─────────────┘
                                      │
                          ┌───────────┼───────────┐
                          │           │           │
                   ┌──────▼────┐ ┌────▼────┐ ┌────▼────────┐
                   │ Postgres  │ │ AWS S3  │ │ Mercado Pago│
                   │ 16        │ │ images  │ │ payments    │
                   └───────────┘ └─────────┘ └─────────────┘
```

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | Next.js 16 (App Router), React 19, TailwindCSS v4, Radix UI, Framer Motion, Axios |
| Backend  | Spring Boot 4, Java 21, Spring Security (JWT), Spring Data JPA |
| Database | PostgreSQL 16 |
| Storage  | AWS S3 (product images) |
| Payments | Mercado Pago SDK |
| Infra    | Docker Compose, Nginx (reverse proxy) |

## Features

- **Authentication & Authorization** — JWT-based, with role support and an auto-seeded admin user.
- **Product & Category Management** — CRUD with multipart image upload to S3 and a main-image selector.
- **Cart** — server-side persistence, consistency handling, and scheduled cleanup of abandoned carts.
- **Region-based Shipping** — flat rates per Brazilian macro-region resolved from the CEP.
- **Orders & Checkout** — order flow integrated with Mercado Pago, including a payment webhook.

## Project Structure

```
.
├── API/                    # Spring Boot backend
│   └── src/main/java/com/project/API/
│       ├── auth/           # login / register
│       ├── user/           # users, addresses, roles, admin seeder
│       ├── product/        # products + multipart image upload
│       ├── productImage/   # product image management
│       ├── category/       # categories
│       ├── cart/           # cart, items, cleanup scheduler
│       ├── order/          # checkout, orders, MP webhook
│       ├── shipping/       # region-based shipping quotes
│       ├── jwt/            # JWT filter & service
│       ├── config/         # Security, S3, Mercado Pago config
│       └── seeder/         # data seeding
├── front-end/              # Next.js storefront (see front-end/CLAUDE.md)
├── docker-compose.yml      # full stack (postgres + backend + frontend + nginx)
├── docker-compose.local.yml
└── nginx.conf              # reverse proxy config
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- (For local dev) Java 21 + Maven, Node.js 18+

### Run the full stack with Docker

1. Create a `.env` file in the project root (see [Environment Variables](#environment-variables)).
2. Build and start everything:

   ```bash
   docker compose up --build
   ```

3. The app is available at **http://localhost** (Nginx proxies the frontend at `/` and the API at `/api/`).

### Local development

**Backend** (defaults to the `local` profile, runs on `:8080`):

```bash
cd API
./mvnw spring-boot:run
```

**Frontend** (runs on `:3000`):

```bash
cd front-end
npm install
npm run dev
```

> The frontend expects the API at `http://localhost:8080`. Run the backend (and a Postgres instance) before starting it.

## Environment Variables

Defined in the root `.env` and consumed by `docker-compose.yml`:

| Variable | Description |
|----------|-------------|
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` | PostgreSQL connection settings |
| `JWT_SECRET_KEY` | Secret used to sign JWT tokens |
| `MP_ACCESS_TOKEN` | Mercado Pago access token |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_KEY` | AWS credentials for S3 (region `sa-east-1`) |
| `EMAIL_ADMIN` / `PASSWORD_ADMIN` | Credentials for the auto-seeded admin user |
| `EC2_PUBLIC_IP` | Public host used to build the frontend's `NEXT_PUBLIC_API_URL` |

> **Note:** never commit real secrets. Keep `.env` out of version control.

## API Overview

Base path is proxied under `/api/` in production; direct on `:8080` in development.

| Resource   | Endpoints |
|------------|-----------|
| Auth       | `POST /auth/register`, `POST /auth/login` |
| Users      | `GET /users`, `GET /users/me`, `PUT /users/UpdateMe` |
| Products   | `GET /product`, `GET /product/{id}`, `POST /product`, `PUT /product/{id}`, `DELETE /product/{id}`, `POST /product/{id}/images` |
| Categories | `GET /category/all-categories`, `GET /category/find-category`, `POST /category`, `PUT /category/{id}`, `DELETE /category/{id}` |
| Cart       | `GET /cart/{userId}`, `POST /cart/{userId}/add`, `PATCH /cart/{userId}/item/{itemId}`, `DELETE /cart/{userId}/item/{itemId}`, `DELETE /cart/{userId}` |
| Orders     | `POST /order/checkout`, `GET /order`, `GET /order/all`, `PATCH /order/{orderId}/status`, `POST /order/webhook` |
| Shipping   | `GET /shipping/quote` |
| Images     | `PATCH /images/{id}/set-main`, `DELETE /images/{id}` |

## Tests

```bash
cd API
./mvnw test
```

The backend includes tests for the cart cleanup scheduler, user service, cart/order flow, and shipping service. The frontend has no test suite configured.
