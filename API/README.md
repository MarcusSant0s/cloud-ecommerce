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

## Future Improvements
- **Cart Consistency Handling**  
  Detect unavailable products when users revisit their cart and notify them through the UI  
  (planned implementation via `CartService#getOrCreateCart`)
- Implement caching strategy (e.g., Redis) to improve performance
- Introduce event-driven architecture (e.g., Kafka) for better scalability