# Security notes

## Current baseline
Project-scoped API handlers now use a shared helper to authenticate the Supabase user and verify ownership of the requested project before accessing its records. Project reads, updates, and deletes are owner-scoped. Updated handlers validate request bodies and bound chat and generation input lengths.

## Remaining security work
1. Verify RLS is enabled and correctly configured for profiles, projects, constraints, artifacts, and chat_messages. API checks are defence in depth, not a substitute for database policies.
2. Keep SUPABASE_SERVICE_ROLE_KEY server-only. It bypasses RLS and must never enter browser bundles.
3. Add rate limits, quotas, request-size limits, timeouts, and spend monitoring to AI endpoints before public launch.
4. Treat model output as untrusted input and validate structure and numeric ranges before saving or rendering it.
5. Never execute generated CAD or firmware on the application server. Use isolated, resource-limited workers for compilation and simulation.
6. Define deletion, backup, and retention policies for prompts, chat history, projects, and generated artifacts.
7. Scan current files and Git history for secrets; rotate any exposed credentials. Run dependency and vulnerability scans.

## Environment variables
- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL.
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon/publishable key; access must be protected by RLS.
- GEMINI_API_KEY: server-side Google Gemini API key. Never prefix it with NEXT_PUBLIC_.
- SUPABASE_SERVICE_ROLE_KEY: privileged server-side key; leave unset unless a reviewed server-side feature needs it.

This document is not a security certification or a complete audit. Do not publish secrets, private user data, or confidential engineering files in public issues.
