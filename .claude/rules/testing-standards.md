# Testing Standards — Shift-Left Testing

## Philosophy
Tests se escriben CON el código, no después. QA participa desde Discovery, no solo en Review. Calidad es responsabilidad de todos.

## Test Pyramid
- **Many** unit tests (domain logic, use cases, utilities) — fast, cheap, run always
- **Fewer** integration tests (API routes + DB, module boundaries) — slower, run on CI
- **Minimal** E2E tests (critical user flows only) — slow, run before deploy

## Shift-Left Practices
1. **QA in Discovery**: QA revisa acceptance criteria y escribe test cases ANTES de que se codifique
2. **TDD-friendly**: Domain logic should be written test-first when possible
3. **Tests with code**: Every PR that adds logic must include tests. No "test later" items.
4. **Failing test = blocked PR**: CI must pass before merge. No exceptions.

## Test Types & Locations

### Unit Tests (Vitest)
- **What**: Domain entities, value objects, use cases, utility functions
- **Where**: `tests/unit/` mirroring `src/` structure
- **Pattern**: Arrange-Act-Assert
- **Mocking**: Mock external dependencies via dependency injection
- **Speed**: < 1 second per test

### Integration Tests (Vitest)
- **What**: API routes with test DB, repository implementations, cross-module boundaries
- **Where**: `tests/integration/`
- **Database**: Test PostgreSQL instance, reset between suites
- **Speed**: Up to 5 seconds per test

### E2E Tests (Playwright)
- **What**: Critical user flows only (sign up → create lead → view dashboard)
- **Where**: `tests/e2e/`
- **Pattern**: Page Object Model
- **Speed**: Up to 30 seconds per flow

### Component Tests (Testing Library + Vitest)
- **What**: React component behavior (what the user sees and does)
- **Where**: Co-located as `*.test.tsx` next to component
- **Rule**: Test behavior, not implementation details

## Naming Convention
```typescript
describe('<Unit>', () => {
  it('should <expected behavior> when <condition>', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Coverage Thresholds
| Layer | Minimum |
|---|---|
| `domain/` | 80% |
| `application/` | 70% |
| `infrastructure/` | 60% |
| `shared/` | 90% |

## Test Data
- Factory functions — never hardcoded data
- Faker for realistic data generation
- Each factory generates valid data by default, with overrides
- Multi-tenant: every factory must generate data with explicit `tenantId`

## Multi-Tenant Testing
- Every data-access test verifies tenant isolation
- Test that Tenant A cannot access Tenant B's data
- Prisma middleware must be active in integration tests

## CI Integration
- Unit + component tests: run on every PR (fast feedback)
- Integration tests: run on every PR (with test DB)
- E2E tests: run before deploy to staging
- Coverage report on every PR — block if below thresholds
- Flaky tests are bugs — fix immediately, never skip

## DoD Test Checklist
- [ ] Unit tests for new domain/application logic
- [ ] Integration tests for new API endpoints
- [ ] Component tests for new UI components
- [ ] E2E test if it's a critical flow
- [ ] All existing tests still pass
- [ ] Coverage thresholds met
