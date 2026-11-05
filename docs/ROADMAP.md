# Bleuprint product roadmap

## Objective
Help engineers move from an early hardware idea to a traceable, reviewable engineering starting point. Generated artifacts are drafts, never certification or safety approval.

## Stage 0 — Secure the prototype
- [x] Add shared authentication and project-ownership verification to project-scoped API routes.
- [x] Scope project reads, updates, and deletes to the authenticated owner.
- [x] Validate request bodies and bound chat and generation prompt lengths in updated routes.
- [ ] Verify Supabase Row Level Security (RLS) for every user-owned table.
- [ ] Test cross-account isolation and unauthenticated API access.
- [ ] Resolve TypeScript and ESLint issues, then stop suppressing build failures.

## Stage 1 — Reliable development and deployment
- [ ] Confirm the canonical database schema and migration history.
- [ ] Create separate development, staging, and production environments.
- [ ] Add CI for linting, type-checking, production builds, and dependency scanning.
- [ ] Add error monitoring, structured logs, a health endpoint, and deployment smoke tests.

## Stage 2 — Dependable core workflow
- [ ] Validate Gemini output with strict schemas before persistence.
- [ ] Make generation recoverable after partial failures and persist generation status.
- [ ] Add rate limits, timeouts, quotas, and AI spend monitoring.
- [ ] Fix CSV escaping and enforce version-aware artifact retrieval.

## Stage 3 — Engineering-grade outputs
- [ ] Compile and validate generated OpenSCAD in an isolated worker.
- [ ] Add firmware target selection and compile checks.
- [ ] Track BOM manufacturer, part number, source, datasheet, price source, and verification date.
- [ ] Add units, ranges, constraint dependencies, and an artifact change history.

## Stage 4 — Pilot
- [ ] Test with a small group of hardware engineers.
- [ ] Start with narrow use cases such as sensor devices, simple IoT enclosures, and robotics subsystems.
- [ ] Measure time to first useful PRD, revision effort, artifact acceptance, and failure rates.

## Non-goals for the first release
- Autonomous certification or safety approval.
- Claims that generated firmware is production-grade.
- Automatic purchasing or supplier commitments.
- Replacing engineering review, simulation, or physical testing.
