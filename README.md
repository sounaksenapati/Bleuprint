# Bleuprint

**An AI-assisted workspace for exploring hardware products — from an initial idea to an engineering starting point.**

Bleuprint is an experimental product workspace for turning a plain-language hardware concept into a structured product brief, a set of engineering constraints, and first-pass design artifacts.

## What the prototype explores

1. Describe a hardware product idea.
2. Generate a structured product requirements document (PRD).
3. Review mechanical, electrical, firmware, and cost constraints.
4. Generate draft OpenSCAD, C++ firmware, and a bill of materials (BOM).
5. Iterate through a project workspace and AI chat.

> **Engineering disclaimer:** AI-generated specifications, CAD, firmware, component selections, and cost estimates are unverified drafts. They must be reviewed, simulated, compiled, and tested by qualified engineers before being used to manufacture or operate hardware. Bleuprint does not provide certification or safety approval.

## Current status

- [x] Next.js application and workspace UI
- [x] Supabase authentication integration
- [x] Project creation and listing
- [x] Gemini-backed PRD, CAD, firmware, and BOM generation
- [x] Constraint versioning and artifact persistence
- [x] Project ownership checks added to project-scoped API routes
- [ ] Verify database schema and Row Level Security against a fresh Supabase project
- [ ] Add automated authorization and generation tests
- [ ] Validate AI outputs against strict schemas
- [ ] Compile/simulate generated CAD and firmware
- [ ] Deploy staging and complete end-to-end testing

See [the roadmap](docs/ROADMAP.md) and [security notes](docs/SECURITY.md).

## Tech stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS 4, Radix UI
- Supabase Auth and Postgres
- Google Gemini API
- Zustand
- Three.js / React Three Fiber, Recharts

## Run locally

### Prerequisites

- Node.js 20+
- npm
- A Supabase project
- A Google AI Studio API key with access to the configured Gemini model

### Install

```bash
npm install
cp .env.example .env.local
```

Fill in the Supabase URL, Supabase anon/publishable key, and Gemini API key in `.env.local`. Keep all real secrets out of Git.

### Database

The initial schema and Row Level Security policies for a **new** Supabase project are in `supabase/migrations/0001_initial_schema.sql`. Review the migration before applying it. Do not run it blindly against an existing database; first compare it with the current schema and migration history.

Enable email/password authentication in Supabase.

### Start

```bash
npm run dev
```

Open http://localhost:3000.

### Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Repository map

- `src/app` — pages, layouts, and API routes
- `src/components` — landing page, dashboard, and workspace UI
- `src/lib/ai` — Gemini client, prompts, and artifact generators
- `src/lib/constraint-engine` — constraint propagation
- `src/lib/supabase` — Supabase clients and project authorization
- `src/store` — workspace state
- `supabase/migrations` — database schema and RLS policies
- `docs` — roadmap and security notes

## Product principles

- **Engineer in the loop:** generated artifacts are drafts, not validated designs.
- **Traceability:** preserve the inputs and constraint versions behind every artifact.
- **Visible uncertainty:** distinguish assumptions, AI suggestions, sourced component data, and verified results.
- **Secure by default:** enforce authentication and ownership at both API and database layers.
- **Useful before broad:** prioritise a reliable end-to-end workflow over disconnected features.

## Contributing

Issues and thoughtful feedback are welcome. Describe the problem, proposed change, and how it was tested. Do not include credentials, personal data, or confidential engineering files in issues or commits.

## License

No open-source licence has been selected yet. Until a licence is added, the repository remains subject to default copyright rules; do not assume its contents are available for reuse.
