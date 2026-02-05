# Coding Standards

## TypeScript
- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` type — use `unknown` and narrow with type guards
- Named exports only (no default exports except Next.js pages/layouts)
- Interfaces for object shapes, types for unions/intersections/utility types
- Prefer `readonly` for immutable data
- Use `satisfies` operator for type-safe object literals

## Naming Conventions
- **Variables/functions**: camelCase (`leadScore`, `calculateScore`)
- **Components/types/interfaces**: PascalCase (`LeadCard`, `LeadScore`, `ILeadRepository`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE`)
- **Files**: kebab-case for utilities (`lead-utils.ts`), PascalCase for React components (`LeadCard.tsx`)
- **Directories**: kebab-case (`ai-insights/`, `lead-scoring/`)

## Import Order
1. React/Next.js imports
2. External library imports
3. `@/` internal absolute imports
4. Relative imports

Blank line between each group.

## React Patterns
- Server Components by default — add `'use client'` only when needed
- Composition over inheritance — use compound components for complex UI
- Props via interfaces, co-located with component
- All components accept `className` for composition
- No CSS-in-JS, no inline styles — TailwindCSS utility classes only
- Custom hooks for reusable stateful logic (`use<Name>` convention)

## Error Handling
- Custom error classes extending base `AppError`
- `Result<T, E>` pattern for domain operations (no exceptions in domain layer)
- `try/catch` only at boundaries (API routes, event handlers)
- Never swallow errors — always log or propagate

## Null Handling
- Prefer `undefined` over `null`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Avoid non-null assertions (`!`) — narrow types properly instead

## Validation
- Zod for all external data: API inputs, env vars, AI outputs, form data
- Validate at system boundaries, trust internal types

## Code Quality
- Maximum function length: ~30 lines — extract if longer
- No `console.log` in production code — use structured logger
- No magic numbers — extract to named constants
- Single responsibility per function/class/module
