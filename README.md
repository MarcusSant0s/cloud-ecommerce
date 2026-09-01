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
| Database | PostgreSQL 16 (schema managed by Flyway) |
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

1. Copy `.env.example` to `.env` in the project root and fill it in (see [Environment Variables](#environment-variables)).
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

> The frontend expects the API at `http://localhost:8080` (see `front-end/.env.example`). Run the backend (and a Postgres instance) before starting it:
>
> ```bash
> docker compose -f docker-compose.local.yml up -d   # Postgres on :5432
> ```

### Database schema

The schema is owned by Flyway (`API/src/main/resources/db/migration`), not by Hibernate.
`ddl-auto` is `validate` in every profile, so the app refuses to start if the migrated
schema and the JPA entities have drifted apart.

- **Changing an entity?** Add a new `V<n>__description.sql` alongside it. Never edit
  an applied migration — Flyway checksums them and will fail on the next boot.
- **Existing database** created by the old `ddl-auto=update`? `baseline-on-migrate`
  stamps it at V1 rather than replaying the baseline against it, so no data is touched.

## Environment Variables

Defined in the root `.env` and consumed by `docker-compose.yml`:

| Variable | Description |
|----------|-------------|
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` | PostgreSQL connection settings |
| `JWT_SECRET_KEY` | Secret used to sign JWT tokens |
| `MP_ACCESS_TOKEN` | Mercado Pago access token |
| `MP_WEBHOOK_SECRET` | Mercado Pago webhook signing secret ("assinatura secreta") used to verify `POST /order/webhook`. Blank => signature check skipped (logs a warning). Required in prod for real payments. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials for S3 (region `sa-east-1`). These exact names are what the AWS SDK's default credential chain reads. |
| `EMAIL_ADMIN` / `PASSWORD_ADMIN` | Credentials for the auto-seeded admin user |
| `APP_BASE_URL` | Public HTTPS base URL (scheme + host, e.g. `https://ecommerce-marcus.duckdns.org`). Builds the frontend's `NEXT_PUBLIC_API_URL`, the MP webhook notification URL, and the MP back URLs. |
| `APP_SEED_DEMO_DATA` | `true` to seed the demo dataset (products, users, orders) on startup. Default `false`. Idempotent — skips if products already exist. |
| `PAYMENTS_DEMO_MODE` | `true` to skip Mercado Pago at checkout and simulate an approved payment (order marked PAID, stock decremented, cart cleared). Default `false`. Use on demos without a real MP token. |

> **Note:** never commit real secrets. Keep `.env` out of version control — copy `.env.example` and fill it in.

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

43 tests covering the auth layer (`AuthService`, `JwtService`, `JwtAuthFilter`), the
cart cleanup scheduler, user service, cart/order flow, Mercado Pago webhook validation,
and the shipping service. A JaCoCo coverage report is written to `API/target/site/jacoco`
by `mvn verify` and uploaded as a CI artifact.

CI also runs a **smoke job** that boots the packaged jar with the `prod` profile against a
real Postgres and asserts the migration applied, `/actuator/health` reports `UP`, and the
authorization rules answer 401/200/400 as expected. That is what catches a broken migration
or a bean that only fails to wire at runtime.

The frontend has no test suite configured.

## Operations

| Concern | Where |
|---------|-------|
| Health check | `GET /actuator/health` — used by the container healthcheck and the deploy gate. Blocked at nginx, so it is not reachable from the internet. |
| Rate limiting | nginx, per IP: 30 req/min on `/api/auth/` (login and register), 10 req/s elsewhere. Returns `429`. |
| Schema migrations | Flyway, on startup. See [Database schema](#database-schema). |
| Logs | `json-file` driver capped at 10MB x 3 per container, so a long-running box cannot fill its disk with logs. |
| Deploy | CI waits for `commerce-api` to report healthy before declaring success, and dumps the backend logs and fails the job if it does not. |
