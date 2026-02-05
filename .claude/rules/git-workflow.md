# Git Workflow — Trunk-Based Development

## Philosophy
Integrate early, integrate often. Small changes, fast feedback, always-deployable main.

## Branch Strategy
- **`main`** — single source of truth, always deployable, auto-deploys to staging
- **No `develop` branch**. No long-lived feature branches. Trunk-based.
- Short-lived branches exist only for PRs (max 1 day)

## Branch Naming
```
feat/<scope>-<short-desc>    # New feature (lives < 1 day)
fix/<scope>-<short-desc>     # Bug fix
chore/<desc>                 # Maintenance
docs/<desc>                  # Documentation only
test/<desc>                  # Test additions/fixes
```

Examples: `feat/leads-scoring-api`, `fix/funnel-date-validation`

## Trunk-Based Rules
- Branch from `main`, merge back to `main` — no intermediate branches
- **Maximum branch lifetime: 1 day**. If a feature takes longer, use feature flags
- PRs must be **small and focused** — one logical change per PR
- Keep `main` green at all times — broken main blocks the entire team
- If main breaks, fixing it is the #1 priority for the team

## Conventional Commits
```
feat(scope): description     # New feature
fix(scope): description      # Bug fix
chore(scope): description    # Maintenance
docs(scope): description     # Documentation
test(scope): description     # Tests
refactor(scope): description # Restructuring
perf(scope): description     # Performance
ci(scope): description       # CI/CD changes
```

**Scope** matches bounded context: `projects`, `icp`, `offers`, `funnel`, `metrics`, `ai`, `auth`, `ui`, `infra`

## CI/CD Pipeline (runs on every PR and push to main)
1. **Lint** — ESLint + Prettier (fast, fails first)
2. **Type Check** — `tsc --noEmit`
3. **Unit Tests** — Vitest (domain + application)
4. **Integration Tests** — Vitest + test DB
5. **Build** — Next.js production build
6. **Deploy** — Auto-deploy to staging on merge to main

## Feature Flags
- Use feature flags for work-in-progress features merged to main
- Incomplete features are deployed but hidden behind flags
- Flags are removed once feature is fully shipped and validated
- This enables trunk-based dev without shipping half-baked features

## PR Requirements
- Passing CI pipeline (all 5 stages)
- Descriptive title (conventional commit format)
- Small scope — if the diff is large, split it
- Linked to user story or issue
- Code follows DoD checklist

## Release Strategy
- Every merge to main is a potential release
- Staging deploys automatically on every merge
- Production releases via manual promotion or scheduled cadence
- Tag releases: `v<major>.<minor>.<patch>` following semver
