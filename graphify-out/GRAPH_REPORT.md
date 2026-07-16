# Graph Report - .  (2026-07-12)

## Corpus Check
- Corpus is ~42,168 words - fits in a single context window. You may not need a graph.

## Summary
- 1195 nodes · 2342 edges · 101 communities (71 shown, 30 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 394 edges (avg confidence: 0.8)
- Token cost: 192,147 input · 0 output

## Community Hubs (Navigation)
- Cart Cleanup Scheduling
- Cart Entity & Controller
- Auth Controller & Service
- Order Response & Controller
- Exception Handling
- Product Controller & Update DTO
- User Entity & Seeding
- Security Config & JWT Filter
- S3 Config & Shipping Regions
- Create Product DTO
- User Admin Endpoints
- Storefront Layout & Navbar
- Product Image Management
- Product Entity & DTOs
- User Address Entity
- Frontend Runtime Dependencies
- Product Image Entity
- Product Service & Filtering
- Category Entity
- Design System & Brand Tokens
- shadcn Component Config
- File Upload Controller
- Frontend Dev Dependencies
- Data Seeding
- Docker Compose Orchestration
- API Architecture Docs
- Collection Entity
- User Role & Profile DTO
- Category Controller
- Orders Page UI
- Next.js App Router Architecture
- Maven Wrapper Script
- Category Service
- Category Repository
- Shipping Controller
- Mercado Pago Webhook Tests
- Auth & Security Concepts
- Resource Not Found Exception
- Frontend Package Manifest
- Payment Checkout Endpoints
- Cart Context Provider
- File DTO
- S3 Storage Service
- Admin Orders Page
- Mercado Pago Config
- Admin Seeder
- Admin Products Page
- File Icon Asset
- Spring Boot Entrypoint
- Application Context Test
- Cart Page UI
- Product Card & Section
- JS Path Aliases
- Guest Cart Merge DTOs
- Server Page Data Fetch
- Auth Context Provider
- Admin Categories Page
- Admin Layout Nav
- Admin Dashboard Page
- Admin Users Page
- Auth Route Layout
- Mock Homepage Data
- Home Page
- Product Detail Page
- Categories Section
- Footer Section
- Badge Primitive
- Button Primitive
- clsx Dependency
- framer-motion Dependency
- App System Config
- ESLint Config
- Next.js Config
- Next TypeScript Env
- react-dom Dependency
- PostCSS Config
- Axios API Client
- Maven Project Coordinates

## God Nodes (most connected - your core abstractions)
1. `Product` - 70 edges
2. `User` - 67 edges
3. `Order` - 49 edges
4. `Cart` - 35 edges
5. `Category` - 32 edges
6. `OrderItem` - 32 edges
7. `ProductImage` - 30 edges
8. `UserAdress` - 28 edges
9. `ResourceNotFoundException` - 26 edges
10. `CartItem` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Mercado Pago Integration (checkout + webhook)` --semantically_similar_to--> `Mercado Pago Checkout & Webhook`  [INFERRED] [semantically similar]
  API/README.md → README.md
- `Cart Consistency Handling` --semantically_similar_to--> `Server-side Cart Persistence & Cleanup`  [INFERRED] [semantically similar]
  API/README.md → README.md
- `Local-only Postgres (postgres-local, :5432)` --semantically_similar_to--> `postgres service (postgres-db)`  [INFERRED] [semantically similar]
  docker-compose.local.yml → docker-compose.yml
- `Airbnb Design System Analysis` --semantically_similar_to--> `Brenda Nunes Brand Identity System`  [INFERRED] [semantically similar]
  DESIGN.md → front-end/public/brand-identity.html
- `Rausch (#ff385c) — Single Brand Voltage` --semantically_similar_to--> `Rose / Gold / Off-White Palette`  [INFERRED] [semantically similar]
  DESIGN.md → front-end/public/brand-identity.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Four-service Docker Compose stack on one private network** — docker_compose_postgres_service, docker_compose_backend_service, docker_compose_frontend_service, docker_compose_nginx_service, docker_compose_internal_api_url [EXTRACTED 1.00]
- **End-to-end JWT authentication flow (backend policy + frontend state)** — readme_jwt_authentication, api_readme_jwt_auth, api_readme_rbac, api_readme_bcrypt_hashing, front_end_claude_authcontext, front_end_claude_api_service_axios [INFERRED 0.85]
- **Demo/portfolio mode: seeding, schema and payment-simulation toggles** — readme_seed_demo_data, readme_ddl_auto, readme_payments_demo_mode, docker_compose_backend_service, front_end_claude_remote_image_sources [INFERRED 0.85]

## Communities (101 total, 30 thin omitted)

### Community 0 - "Cart Cleanup Scheduling"
Cohesion: 0.06
Nodes (30): CartCleanupScheduler, Component, Transactional, CartRepository, CartStatus, ACTIVE, CHECKOUT, QuantityChecks (+22 more)

### Community 1 - "Cart Entity & Controller"
Cohesion: 0.05
Nodes (28): Cart, Entity, Table, CartController, DeleteMapping, PatchMapping, PostMapping, RequestMapping (+20 more)

### Community 2 - "Auth Controller & Service"
Cohesion: 0.06
Nodes (17): AuthController, PostMapping, RequestMapping, RestController, AuthService, BCryptPasswordEncoder, Service, AuthResponse (+9 more)

### Community 3 - "Order Response & Controller"
Cohesion: 0.06
Nodes (24): AdminOrderResponse, Customer, ShippingAddress, OrderResponse, GetMapping, Page, Pageable, PatchMapping (+16 more)

### Community 4 - "Exception Handling"
Cohesion: 0.07
Nodes (18): ApiError, BadCredentialsException, CartInconsistencyException, EmailAlreadyRegisteredException, GlobalExceptionHandler, ResponseEntity, InvalidWebhookSignatureException, OrderNotPayableException (+10 more)

### Community 5 - "Product Controller & Update DTO"
Cohesion: 0.10
Nodes (17): MultipartFile, UpdateProduct, DeleteMapping, GetMapping, MultipartFile, Page, Pageable, PostMapping (+9 more)

### Community 6 - "User Entity & Seeding"
Cohesion: 0.10
Nodes (9): Override, Entity, Override, PrePersist, Table, User, UserFactory, GrantedAuthority (+1 more)

### Community 7 - "Security Config & JWT Filter"
Cohesion: 0.11
Nodes (21): BCryptPasswordEncoder, Bean, Configuration, SecurityConfig, Component, Override, JwtAuthFilter, CustomUserDetailsService (+13 more)

### Community 8 - "S3 Config & Shipping Regions"
Cohesion: 0.12
Nodes (15): Bean, Configuration, S3Client, S3Config, ShippingQuote, Region, CENTRO_OESTE, NORTE_NORDESTE (+7 more)

### Community 10 - "User Admin Endpoints"
Cohesion: 0.13
Nodes (14): AllUsersRequest, UpdateUserRequest, PreAuthorize, PutMapping, RequestMapping, ResponseEntity, RestController, UserController (+6 more)

### Community 11 - "Storefront Layout & Navbar"
Cohesion: 0.10
Nodes (21): Brenda Nunes Storefront Brand Identity, create-next-app Default Scaffold Assets, Design System Iconography, cormorant, geistMono, geistSans, jost, metadata (+13 more)

### Community 12 - "Product Image Management"
Cohesion: 0.12
Nodes (12): DeleteMapping, PatchMapping, RequestMapping, ResponseEntity, RestController, ProductImageController, Modifying, Query (+4 more)

### Community 13 - "Product Entity & DTOs"
Cohesion: 0.21
Nodes (4): ProductPageResponseDTO, Entity, Table, Product

### Community 14 - "User Address Entity"
Cohesion: 0.12
Nodes (3): Entity, Table, UserAdress

### Community 15 - "Frontend Runtime Dependencies"
Cohesion: 0.10
Nodes (21): animejs, axios, class-variance-authority, dependencies, animejs, axios, class-variance-authority, geist (+13 more)

### Community 16 - "Product Image Entity"
Cohesion: 0.14
Nodes (4): Entity, Override, Table, ProductImage

### Community 17 - "Product Service & Filtering"
Cohesion: 0.19
Nodes (8): ProductFilterDTO, MultipartFile, Page, Pageable, Service, Transactional, ProductSpecification, Specification

### Community 18 - "Category Entity"
Cohesion: 0.14
Nodes (4): Category, Entity, Override, Table

### Community 19 - "Design System & Brand Tokens"
Cohesion: 0.15
Nodes (20): Airbnb Cereal VF Type Scale, Airbnb Design System Analysis, Photography-Led Visual Hierarchy, Photo-First Property Card, 64px Rating Display, Rausch (#ff385c) — Single Brand Voltage, Pill Search Bar + Rausch Search Orb, Single Elevation Tier (+12 more)

### Community 20 - "shadcn Component Config"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 21 - "File Upload Controller"
Cohesion: 0.19
Nodes (10): FileController, MultipartFile, PostMapping, RequestMapping, RestController, FileRepository, FileService, MultipartFile (+2 more)

### Community 22 - "Frontend Dev Dependencies"
Cohesion: 0.13
Nodes (15): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, tw-animate-css (+7 more)

### Community 23 - "Data Seeding"
Cohesion: 0.23
Nodes (6): CategoryRepository, DataSeeder, BCryptPasswordEncoder, Component, Override, ConditionalOnProperty

### Community 24 - "Docker Compose Orchestration"
Cohesion: 0.22
Nodes (14): backend service (commerce-api), frontend service (commerce-web), INTERNAL_API_URL (SSR split-horizon API base), Local-only Postgres (postgres-local, :5432), nginx service (commerce-nginx), postgres service (postgres-db), Full-Stack Docker Compose Orchestration, services/api.js Axios Instance (+6 more)

### Community 25 - "API Architecture Docs"
Cohesion: 0.15
Nodes (13): AWS S3 Config (region sa-east-1, bucket spring-s3-user), Multipart Upload Limits (10MB), Spring Boot Getting Started Reference, Maven Parent POM Overrides, E-commerce REST API, Dedicated IAM User (Least Privilege), Planned Event-Driven Architecture (Kafka), Controller / Service / Repository Layering (+5 more)

### Community 26 - "Collection Entity"
Cohesion: 0.17
Nodes (4): Collection, Entity, Override, Table

### Community 27 - "User Role & Profile DTO"
Cohesion: 0.17
Nodes (5): SingleUserRequest, Role, ADMIN, USER, GetMapping

### Community 28 - "Category Controller"
Cohesion: 0.24
Nodes (7): CategoryController, DeleteMapping, MultipartFile, PostMapping, PutMapping, ResponseEntity, RestController

### Community 29 - "Orders Page UI"
Cohesion: 0.20
Nodes (4): CURRENCY, DATE_FORMAT, OrderCard(), STATUS_CONFIG

### Community 30 - "Next.js App Router Architecture"
Cohesion: 0.21
Nodes (12): Allowed Remote Image Hosts (next.config.mjs), Server-Component Fetch / Client-Component Interactivity, Next.js App Router Storefront Architecture, create-next-app Bootstrap Notes, Cloud E-commerce Platform, JWT Authentication & Admin Seeding, Next.js 16 Storefront (:3000), Nginx Reverse Proxy (:80/:443) (+4 more)

### Community 33 - "Maven Wrapper Script"
Cohesion: 0.33
Nodes (6): mvnw script, clean(), die(), exec_maven(), set_java_home(), verbose()

### Community 34 - "Category Service"
Cohesion: 0.31
Nodes (4): CategoryService, MultipartFile, Service, Transactional

### Community 36 - "Shipping Controller"
Cohesion: 0.29
Nodes (4): GetMapping, RequestMapping, RestController, ShippingController

### Community 38 - "Auth & Security Concepts"
Cohesion: 0.25
Nodes (9): BCrypt Password Hashing, Cart Consistency Handling, JWT Auth with Refresh Token Strategy, Role-Based Access Control (RBAC), AuthContext (JWT auth state), Optimistic Cart Mutations with Rollback, Provider Nesting (AuthProvider > CartProvider > Navbar), useCart / CartProvider hook (+1 more)

### Community 39 - "Resource Not Found Exception"
Cohesion: 0.39
Nodes (3): ResourceNotFoundException, Override, ProductServiceImpl

### Community 40 - "Frontend Package Manifest"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 43 - "Cart Context Provider"
Cohesion: 0.29
Nodes (6): ProductPageClient(), CartContext, CartProvider(), useCart(), react, react

### Community 46 - "S3 Storage Service"
Cohesion: 0.48
Nodes (4): MultipartFile, S3Client, Service, S3StorageService

### Community 47 - "Admin Orders Page"
Cohesion: 0.38
Nodes (6): AdminOrders(), BRL, formatCep(), formatDate(), STATUS_VARIANT, STATUSES

### Community 48 - "Mercado Pago Config"
Cohesion: 0.47
Nodes (3): Configuration, MercadoPagoConfigClass, PostConstruct

### Community 49 - "Admin Seeder"
Cohesion: 0.60
Nodes (4): AdminSeeder, BCryptPasswordEncoder, Component, CommandLineRunner

### Community 50 - "Admin Products Page"
Cohesion: 0.33
Nodes (3): BRL, EMPTY_ERRORS, EMPTY_FORM

### Community 51 - "File Icon Asset"
Cohesion: 0.47
Nodes (6): Storefront Design System Iconography, Folded-Corner Document Glyph with Three Text Rules, File Document Icon (file.svg), Next.js create-next-app Default Public Asset, Next.js /public Static Asset Serving (/file.svg), Monochrome #666 Fill, evenodd, 16x16 Grid

### Community 52 - "Spring Boot Entrypoint"
Cohesion: 0.60
Nodes (3): ApiApplication, EnableScheduling, SpringBootApplication

### Community 53 - "Application Context Test"
Cohesion: 0.60
Nodes (3): ApiApplicationTests, Test, SpringBootTest

### Community 55 - "Product Card & Section"
Cohesion: 0.60
Nodes (3): ProductCard(), getProducts(), ProductSection()

### Community 56 - "JS Path Aliases"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, @/*, ./*

### Community 58 - "Server Page Data Fetch"
Cohesion: 0.67
Nodes (3): getJson(), metadata, Page()

## Ambiguous Edges - Review These
- `layout.js` → `Globe Icon (globe.svg)`  [AMBIGUOUS]
  front-end/public/globe.svg · relation: conceptually_related_to
- `File Document Icon (file.svg)` → `Storefront Design System Iconography`  [AMBIGUOUS]
  front-end/public/file.svg · relation: conceptually_related_to
- `Next.js Wordmark Logo (next.svg)` → `Front-end Design System / Brand Identity`  [AMBIGUOUS]
  front-end/public/next.svg · relation: conceptually_related_to
- `Vercel Logo Mark (vercel.svg)` → `Brenda Nunes Storefront Brand Identity`  [AMBIGUOUS]
  front-end/public/vercel.svg · relation: conceptually_related_to

## Knowledge Gaps
- **108 isolated node(s):** `com.project:API`, `ACTIVE`, `CHECKOUT`, `PENDING`, `PAID` (+103 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `layout.js` and `Globe Icon (globe.svg)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `File Document Icon (file.svg)` and `Storefront Design System Iconography`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Next.js Wordmark Logo (next.svg)` and `Front-end Design System / Brand Identity`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Vercel Logo Mark (vercel.svg)` and `Brenda Nunes Storefront Brand Identity`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `User` connect `User Entity & Seeding` to `Cart Cleanup Scheduling`, `Cart Entity & Controller`, `Order Response & Controller`, `Shipping Controller`, `Payment Checkout Endpoints`, `User Admin Endpoints`, `User Address Entity`, `Data Seeding`, `User Role & Profile DTO`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `Product` connect `Product Entity & DTOs` to `Cart Cleanup Scheduling`, `Cart Entity & Controller`, `Product Controller & Update DTO`, `Resource Not Found Exception`, `Create Product DTO`, `Product Image Management`, `Product Image Entity`, `Product Service & Filtering`, `Category Entity`, `File Upload Controller`, `Data Seeding`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `ResourceNotFoundException` connect `Resource Not Found Exception` to `Cart Cleanup Scheduling`, `Cart Entity & Controller`, `Category Service`, `Exception Handling`, `Create Product DTO`, `User Admin Endpoints`, `Product Image Management`, `Product Image Entity`, `Product Service & Filtering`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._