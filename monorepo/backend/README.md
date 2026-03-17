# Product API

REST API for products built with .NET using Clean Architecture.

Provides catalog CRUD and Swagger-documented endpoints for quick exploration.

## Architecture

Clean Architecture with a clear separation of concerns and inward dependency flow.

- Domain ([src/Product.Domain](src/Product.Domain)): core entities + business invariants (no dependencies)
- Application ([src/Product.Application](src/Product.Application)): use cases, DTOs, and interfaces (depends on Domain)
- Infrastructure ([src/Product.Infrastructure](src/Product.Infrastructure)): repository implementations + data seeding (implements Application interfaces)
- API ([src/Product.Api](src/Product.Api)): HTTP endpoints, DI wiring, Swagger/CORS (composition root)

Dependency direction: API → Application → Domain; Infrastructure is plugged in via interfaces and registered at startup.

## Prerequisites

- .NET SDK 10.0 or later

## Run

- From repo root run `dotnet run --project src/Product.Api/Product.Api.csproj`
- Swagger UI available at `/swagger`

## Scope

- CRUD for products and in-memory catalog
- Swagger/OpenAPI docs enabled

## Business Rules

- Product price minimum is 10
- Stock cannot go below zero; stock adjustments require positive quantities
- Products can be active/inactive
- Discounts are limited to 0–50% and cannot reduce price below 10
