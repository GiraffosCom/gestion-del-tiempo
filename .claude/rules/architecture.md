# Architecture Rules — Hexagonal + DDD Pragmático

## Philosophy
Separar negocio de infraestructura. Testeable sin dependencias externas. Cambiar integraciones sin romper dominio. Pragmático: no sobre-abstraer donde no aporta valor.

## Hexagonal Architecture (Ports & Adapters)

Each bounded context module follows strict layering:

```
src/modules/<context>/
├── domain/          # Pure business logic (ZERO external dependencies)
│   ├── entities/    # Domain entities with behavior
│   ├── values/      # Value objects (immutable)
│   ├── events/      # Domain events
│   └── ports/       # Repository interfaces
├── application/     # Use cases & orchestration
│   ├── use-cases/   # Single-responsibility use cases
│   ├── dtos/        # Data transfer objects
│   └── ports/       # Application-level ports
└── infrastructure/  # External adapters
    ├── repositories/ # Prisma repository implementations
    ├── mappers/      # Domain ↔ Persistence mappers
    └── adapters/     # External service adapters
```

## Layer Rules

### Domain Layer
- ZERO imports from Prisma, Next.js, or any framework
- Entities encapsulate business rules and validation
- Value objects are immutable and compared by value
- Repository interfaces (ports) defined here, implemented in infrastructure
- Domain events for cross-context communication

### Application Layer
- Use cases have a single `execute()` method
- Orchestrate domain operations, never contain business logic
- Define DTOs for input/output across layer boundaries
- Depend on domain layer only (via ports)

### Infrastructure Layer
- Implements ports defined in domain/application layers
- Prisma repositories, API clients, message queue adapters
- Mappers translate between domain entities and persistence models
- Framework-specific code lives here (Next.js API routes, etc.)

## Bounded Contexts (DDD Pragmático)
- `projects` — GTM project lifecycle, workspace management
- `icp` — Ideal Customer Profile definition, segmentation
- `offers` — Product/service offer configuration, messaging
- `funnel` — GTM funnel stages, lead lifecycle, conversion tracking
- `metrics` — Analytics, dashboards, reporting, KPIs
- `ai-insights` — Lead scoring, content generation, predictions
- `users` — Authentication, authorization, tenant management

### Pragmatic DDD Rules
- Use full DDD (entities, value objects, events) for **core** contexts (funnel, icp, offers)
- Use simpler patterns (CRUD + services) for **supporting** contexts (users, metrics)
- Don't over-engineer: if a context has < 3 use cases, a flat module is fine
- Refactor toward deeper models as complexity grows — premature abstraction is waste

## Cross-Context Rules
- No direct imports between bounded contexts
- Communication via domain events only
- Shared kernel (`src/shared/`) for: base classes, common types, Result type, error classes
- If two contexts need the same data, use events to sync, not shared database queries

## Multi-Tenant Rules
- Every entity includes `tenantId` (NOT NULL, foreign key to Tenant)
- Every database query filters by `tenantId` — enforced via Prisma middleware
- Tenant context extracted from auth session at request boundary
- Cross-tenant data access is forbidden at all layers
- All tests must verify tenant isolation

## API Route Rules
- API routes are thin controllers: validate → extract context → call use case → format response
- No business logic in API routes
- Zod validation for all request bodies
- Standard error response format with error codes
- Pagination follows standard format (page, pageSize, total)

## Feature Flags
- Use feature flags for trunk-based development with incomplete features
- Flags live in a centralized config (environment variable or DB-based)
- Flag naming: `FF_<CONTEXT>_<FEATURE>` (e.g., `FF_FUNNEL_AI_SCORING`)
- Remove flags once feature is fully shipped and validated — flags are temporary
