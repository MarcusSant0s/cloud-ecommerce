# Backend to an e-commerce platform with authentication, product management and Mercado Pago integration

## Overview
- REST API
- Handles user, products, categories, carts, payments;
- Focus on performance, architecture, resilience and fault tolerance;

## Features
- Authentication & Authorization (JWT-based)
- Product & Category Management
- Cart Persistence 
- Cart Consistency Handling

## Architecture
- Controller layer (HTTP)
- Service layer (Business rules)
- Repository layer (Data access)

## Performance Considerations
* Avoided N+1 query problems using JPA fetch strategies and joins.
* Pagination implemented on listing endpoints to prevent large payloads.

##  Security Practices
* Passwords hashed using BCrypt before persistence.
* JWT-based authentication with expiration and refresh token strategy.
* Role-based access control (RBAC) for protected endpoints.


##  Cloud & Infrastructure Notes
- Object storage integration using Amazon S3 for product images.
- Dedicated IAM user following the principle of least privilege (restricted access only to required resources).
- Environment variables used for sensitive configuration (.env).

## Endpoints

> **Auth legend:** `Public` = no token required · `JWT` = any authenticated user · `Admin` = `ADMIN` role required

### Auth — `/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT + refresh token |

### Users — `/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users` | Admin | List all users |
| GET | `/users/me` | JWT | Get the authenticated user's profile |
| PUT | `/users/UpdateMe` | JWT | Update the authenticated user's profile |

### Products — `/product`
| Method | Path                                  | Auth   | Description                             |
|--------|---------------------------------------|--------|-----------------------------------------|
| GET    | `/product`                            | Public | List products (paginated, filterable)   |
| GET    | `/product/{id}`                       | Public | Get a product by ID                     |
| POST   | `/product`                            | Admin  | Create a product                        |
| PUT    | `/product/{id}`                       | Admin  | Update a product                        |
| DELETE | `/product/{id}`                       | Admin  | Delete a product                        |
| POST   | `/product/{id}/images`                | Admin  | Upload and attach an image to a product |
| GET     | `/product/product-images/{id}` | Public | Get product images                      |

> **GET /product** query params: `categoryId`, `name`, `minPrice`, `maxPrice`, `inStock`, plus standard Spring `Pageable` params (`page`, `size`, `sort`).

### Categories — `/category`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/category/all-categories` | Public | List all categories |
| GET | `/category/find-category` | Public | Find a category by ID |
| POST | `/category` | Admin | Create a category (multipart: `name` + `File`) |
| PUT | `/category/{category_id}` | Admin | Update a category (multipart: `name` + optional `File`) |
| DELETE | `/category/{id}` | Admin | Delete a category |

### Cart — `/cart`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cart/{userId}` | JWT | Get the active cart for a user |
| POST | `/cart/{userId}/add` | JWT | Add an item (`productId`, `quantity` as query params) |
| PATCH | `/cart/{userId}/item/{idCartItem}` | JWT | Update item quantity (`isIncrement` query param) |
| DELETE | `/cart/{userId}/item/{idCartItem}` | JWT | Remove a specific item from the cart |
| DELETE | `/cart/{userId}` | JWT | Clear the entire cart |

### Orders — `/order`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/order/{userId}` | JWT | Create a checkout and get the Mercado Pago URL |
| GET | `/order` | JWT | List orders for the authenticated user (paginated) |
| PATCH | `/order` | JWT | Change order status (`orderId`, `orderStatus` as query params) |
| POST | `/order/webhook` | Public | Mercado Pago payment webhook |

### Images — `/images`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/images/{id}/set-main` | JWT | Set an image as the main product image |
| DELETE | `/images/{id}` | JWT | Delete a product image |

### Files — `/files`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/files/upload` | JWT | Upload a file to S3 |

---

## Future Improvements
- **Cart Consistency Handling**  
  Detect unavailable products when users revisit their cart and notify them through the UI  
  (planned implementation via `CartService#getOrCreateCart`)
- Implement caching strategy (e.g., Redis) to improve performance
- Introduce event-driven architecture (e.g., Kafka) for better scalability