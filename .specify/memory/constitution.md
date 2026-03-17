<!--
SYNC IMPACT REPORT
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: none (initial version)
Added sections: Core Principles (I–VI), Technology Stack, Development Workflow, Governance
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md   ✅ already compatible (generic Constitution Check gate)
  - .specify/templates/spec-template.md   ✅ already compatible
  - .specify/templates/tasks-template.md  ✅ already compatible
  - .specify/templates/constitution-template.md ✅ source template unchanged
Follow-up TODOs: none
-->

# Product Monorepo Constitution

## Core Principles

### I. Clean Architecture (NON-NEGOTIABLE)

The backend MUST follow strict Clean Architecture with an inward dependency flow:
`Product.Api` → `Product.Application` → `Product.Domain`; `Product.Infrastructure`
is wired in via interfaces at the composition root (`Program.cs`) only.

- `Product.Domain` MUST have zero dependencies on other layers or external packages.
- `Product.Application` MUST depend only on `Product.Domain`; it defines interfaces
  that Infrastructure implements.
- `Product.Infrastructure` MUST implement Application interfaces; it MUST NOT be
  referenced by Application or Domain.
- `Product.Api` (composition root) is the only layer permitted to reference all
  layers for DI registration.
- Cross-layer leakage (e.g., domain entities returned directly from API responses)
  is prohibited; DTOs MUST be used at the API boundary.

### II. Feature-Based Frontend Structure

The frontend MUST be organised by business domain (feature), not by technical layer.

- Each feature folder (`src/features/<name>/`) MUST be self-contained and include
  its own `components/`, `hooks/`, `services/`, `types/`, and `utils/` sub-folders
  as needed.
- Shared utilities and UI primitives belong in `src/shared/` or `src/components/ui/`
  respectively; they MUST NOT contain feature-specific business logic.
- New features MUST be added as independent modules under `src/features/`; direct
  cross-feature imports are prohibited — use shared abstractions instead.

### III. Domain-Enforced Business Rules

Business invariants MUST be encoded in `Product.Domain` entities and enforced via
factory methods and domain methods, not in service or API layers.

- Domain entities MUST expose factory methods (e.g., `Product.Create(...)`) that
  validate all invariants at construction time and throw on violation.
- Known invariants that MUST always hold: price ≥ 10; stock ≥ 0; stock adjustments
  require a positive quantity; discounts are in the range 0–50% and MUST NOT reduce
  price below 10; product name is required.
- Frontend Zod validation schemas MUST mirror backend domain rules to provide early
  client-side feedback. Divergence between client and server validation is a defect
  and MUST be resolved in the same PR.

### IV. Contract-First API Design

The backend API MUST be fully documented via OpenAPI/Swagger before or alongside
implementation. DTOs define the only supported contract between backend and frontend.

- All controller actions MUST declare `[ProducesResponseType]` attributes covering
  every HTTP status code they can return.
- Swagger/OpenAPI documentation (available at `/swagger`) MUST remain accurate and
  up-to-date at all times.
- Breaking changes to existing endpoints (removal, renamed fields, changed types)
  MUST be coordinated across backend and frontend and handled via API versioning or
  backward-compatible additions.
- Internal domain entities MUST NOT be exposed directly in API responses; DTOs
  (e.g., `ProductDto`, `CreateProductDto`, `UpdateProductDto`) MUST mediate all
  data transfer.

### V. Type Safety Throughout

The codebase MUST be strongly typed end-to-end. No dynamic or untyped boundaries
are permitted.

- Frontend: TypeScript strict mode MUST be enabled. Usage of `any` is prohibited
  except in explicitly justified test utilities or auto-generated code.
- Backend: C# strong typing MUST be maintained; `dynamic` and untyped `object`
  parameters are prohibited in public APIs.
- All API response shapes consumed by the frontend MUST have corresponding
  TypeScript type definitions under `src/features/<name>/types/`.
- Zod schema types MUST be inferred (`z.infer<typeof schema>`) rather than
  duplicated manually.

### VI. Observability & Error Handling

Failures MUST be predictable, loggable, and surfaced clearly to all consumers.

- Backend: All controller actions MUST use `ILogger` for structured logging of
  key operations and errors. Error responses MUST use consistent shapes — HTTP 400
  and 404 with `ProblemDetails`; HTTP 500 with `{ error: "..." }` bodies.
- Frontend: The shared Axios client (`src/shared/api/client.ts`) MUST remain the
  single HTTP entry-point. All API errors MUST flow through its response
  interceptor; raw catch-and-ignore patterns in hooks or components are prohibited.
- Unhandled rejections MUST be caught at the appropriate boundary: TanStack Query
  error state for data-fetching operations; try/catch in controllers for
  synchronous exceptions.

## Technology Stack

The following technology choices are mandated for this monorepo. New technologies
or major version upgrades MUST be proposed as a constitution amendment.

### Backend

- **Runtime**: .NET 10 (C#)
- **Framework**: ASP.NET Core Web API
- **Architecture**: Clean Architecture (see Principle I)
- **API Docs**: Swagger/OpenAPI via Swashbuckle

### Frontend

- **Language**: TypeScript (strict mode)
- **Framework**: React 19 + Vite
- **Routing**: React Router v7
- **Server State**: TanStack Query
- **Forms & Validation**: React Hook Form + Zod
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **HTTP**: Axios (via shared `apiClient`)
- **Path Alias**: `@/` → `src/`

## Development Workflow

- **Branching**: Feature branches from `main`; branch names MUST follow the
  `###-feature-name` convention.
- **Code Review**: All changes MUST pass a pull request review before merging.
  Reviewers MUST verify adherence to all six Core Principles.
- **Validation Gate**: Before merging, the backend MUST build cleanly
  (`dotnet build`) and the frontend MUST pass linting (`npm run lint`) and build
  (`npm run build`) without errors.
- **Business Rules Sync**: Any change to a domain business rule MUST be accompanied
  by a corresponding update to the matching frontend Zod schema in the same PR.
- **API Contract Changes**: Changes to DTOs or endpoint signatures MUST update
  Swagger annotations and TypeScript types atomically in the same commit.

## Governance

This constitution supersedes all other practices, coding standards, and informal
agreements within this repository. Amendments require:

1. A written proposal documenting the change, rationale, and migration plan.
2. Review and approval by at least one other contributor.
3. A version bump following semantic versioning:
   - **MAJOR**: Removal or redefinition of a Core Principle.
   - **MINOR**: Addition of a new principle or material expansion of guidance.
   - **PATCH**: Clarifications, wording fixes, or non-semantic refinements.
4. All dependent templates (plan, spec, tasks) MUST be reviewed for consistency
   after any MAJOR or MINOR amendment.

All PRs and reviews MUST verify compliance with the Core Principles. Complexity
beyond what the current feature requires MUST be justified in the PR description.

**Version**: 1.0.0 | **Ratified**: 2026-03-15 | **Last Amended**: 2026-03-15
