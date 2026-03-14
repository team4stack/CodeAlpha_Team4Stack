# Project Scan Plan

## Goal
Perform a full working scan of the codebase, understand current logic, and identify structural improvements and cleanup opportunities.

## Scope
- Backend: Express + TypeScript modules, routes, services, controllers, shared auth/users.
- Frontend: Next.js App Router pages, modules, components, contexts, auth, API client, utilities.
- Config: Supabase setup, environment variables, security utilities.
- Docs: High-level architecture and flow references (excluding README files on request).

## Approach
1. Enumerate all non-node_modules files and identify main entry points.
2. Read core backend entry + module patterns to understand API surface.
3. Read core frontend layout/providers/contexts to understand app state, auth, and routing.
4. Trace critical flows: auth (user/admin), courses/admissions/progress/quiz, landing, stackstore, team, superadmin.
5. Note duplication, legacy remnants, or conflicts between modules.
6. Summarize findings and propose cleanup/refactor steps.

## Deliverables
- Structural assessment: professional vs. cleanup-needed areas.
- List of duplicates or legacy files to consolidate/remove.
- Suggested next steps for cleanup and hardening.
