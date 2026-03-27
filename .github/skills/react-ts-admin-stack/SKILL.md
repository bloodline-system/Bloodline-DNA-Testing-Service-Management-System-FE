---
name: React TS App Workflow (Router + Axios + Tailwind + Zustand + Zod)
description: Use this skill when building or extending a React + TypeScript feature in this repository with react-router, axios, lucide-react, tailwindcss, tailwindcss-animate, zustand, zod, react-hook-form, @hookform/resolvers, and sonner.
---

# React TS App Workflow Skill

## Outcome

Produce production-ready React + TypeScript features with consistent architecture, validated forms, typed API access, predictable state, and clean UI behavior.

## Stack Assumptions

- React + TypeScript + Vite
- Routing: react-router
- API client: axios
- Icons: lucide-react
- Styling: tailwindcss + @tailwindcss/vite + tailwindcss-animate
- State: zustand
- Validation: zod + react-hook-form + @hookform/resolvers
- Toasts: sonner

## Use This Skill For

- New page/feature scaffolding
- CRUD forms with server integration
- Route and layout setup
- Global/client state with optimistic UI
- Error handling and UX polish

## Workflow

1. Confirm feature scope.

- Inputs: business goal, route path, success/failure behaviors, required API endpoints.
- Output: short implementation checklist with files to create/change.

2. Create or update route structure.

- Add route entries and layout nesting with react-router.
- Keep route modules focused: page container in route file, heavy UI in components.
- Add loading and not-found handling for route boundaries.

3. Define data contracts first.

- Create zod schemas for request and response payloads.
- Infer TS types from schemas (`z.infer`) instead of duplicating interfaces.
- Separate transport schema from UI form schema when they differ.

4. Implement API layer with axios.

- Centralize axios instance (base URL, timeout, interceptors if needed).
- Add typed API functions per domain (`getX`, `createX`, `updateX`, `deleteX`).
- Normalize API errors into a predictable shape for UI handling.

5. Build state stores with zustand only where needed.

- Keep local component state local.
- Use zustand for shared/cross-route state or cache-like state.
- Expose clear actions and selectors; avoid leaking internal state details.

6. Build forms with react-hook-form + zodResolver.

- Validate with zod at form boundary.
- Map backend validation errors into field-level errors when possible.
- Disable submit while pending and prevent duplicate submissions.

7. Implement UI with Tailwind utilities and reusable classes.

- Prefer utility classes in JSX for one-off styles.
- Add reusable component classes in `src/index.css` via `@layer components` when repeated.
- Use `tailwindcss-animate` for purposeful transitions only (loading, enter/exit, feedback).
- Use lucide-react icons consistently for affordances and status hints.

8. Add user feedback with sonner.

- Success toast on completed actions.
- Error toast with actionable text.
- Avoid noisy toasts for silent background refreshes.

9. Finish with quality checks.

- Run lint/build.
- Verify responsive behavior and keyboard accessibility.
- Verify empty/loading/error/success states.
- Confirm no `any` leaks and no dead code.

## Decision Rules

- Use zustand if multiple distant components share mutable state.
- Keep API calls in service modules, not directly in presentational components.
- Parse untrusted API payloads with zod before committing to state.
- Prefer route-level data fetching when the page depends on URL params.
- Use optimistic update only when rollback path is defined.

## Done Criteria

- Route wired and reachable.
- API contract typed and validated with zod.
- Form validation and submission states handled.
- Toast feedback for success and error flows.
- Loading/empty/error/success UI states implemented.
- `npm run lint` and `npm run build` pass.

## File Conventions

- `src/routes/*`: route modules and route-level composition.
- `src/features/<feature>/api.ts`: axios calls.
- `src/features/<feature>/schema.ts`: zod schemas and inferred types.
- `src/features/<feature>/store.ts`: zustand store (only if needed).
- `src/features/<feature>/components/*`: presentational and form components.
- `src/index.css`: shared Tailwind component classes.

## Example Prompts

- "Build Patients list page with search and pagination using this skill."
- "Create CreatePatient form with zod + react-hook-form and axios submit."
- "Refactor this feature to move API and schema into feature modules using the skill workflow."
- "Add optimistic status toggle with zustand and rollback on API failure."
