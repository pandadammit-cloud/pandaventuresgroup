# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal admin SPA for PandA Ventures Group. React 19 + TypeScript + Vite, deployed on Firebase Hosting. Public-facing routes show a coming-soon page; all real functionality is behind Google sign-in + email whitelist.

Two products tracked here: **DockBound** (cruise port guides) and **ForumJourney** (travel community forum).

## Commands

```bash
npm run dev       # local dev server (Vite HMR)
npm run build     # tsc -b && vite build → dist/
npm run lint      # oxlint (flat config in .oxlintrc.json)
npm run preview   # serve dist/ locally

# Deploy (hosting only)
firebase deploy --only hosting
```

No test runner is configured in package.json yet. There is a stub test file at `src/__tests__/platformcoreApi.test.ts` written for Vitest — Vitest is not installed. Do not add it without explicit direction.

## Environment Variables

Create a `.env.local` for development. All vars are `VITE_` prefixed and bundled at build time:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_ADMIN_EMAILS          # comma-separated list, e.g. amy@example.com,bob@example.com
VITE_PLATFORMCORE_API_URL  # base URL, no trailing slash
VITE_PLATFORMCORE_API_KEY  # Bearer token for PlatformCore REST API
```

## Auth Flow

- `src/lib/firebase.ts` exports `auth`, `provider` (GoogleAuthProvider), and `db` (Firestore).
- `LoginPage` calls `signInWithPopup` then navigates to `/platformcore/admin`.
- `AuthGuard` (`src/components/AuthGuard.tsx`) wraps protected routes. It checks `onAuthStateChanged` and then validates `user.email` against the `VITE_ADMIN_EMAILS` whitelist. Unauthorized or unauthenticated users are redirected to `/login`.

## Routes

| Path | Component | Guard |
|---|---|---|
| `/` | `ComingSoonPage` | public |
| `/login` | `LoginPage` | public |
| `/platformcore/admin` | `AdminPage` | AuthGuard |
| `/backlog` | `BacklogPage` | AuthGuard |
| `/platformcore`, `/dockbound`, `/forumjourney` | `ComingSoonPage` | public (stubs) |

All routes are lazy-loaded via `React.lazy` + `Suspense`.

## Key Pages

**`src/pages/platformcore/AdminPage.tsx`** — Tab shell with two tabs:
- `ContentHealthTab` — fetches all dock guides via `listDockGuides()`, shows aggregate stats (total, published %, stale count, avg score, V4 field coverage).
- `PortGuidesTab` — filterable table of dock guides; clicking a row fetches full detail via `getGuide('dock', entityId)` and renders a `DetailView` with collapsible section blocks.

**`src/pages/BacklogPage.tsx`** — Reads the Firestore `backlog` collection, groups items by product + section, renders a filterable table with KPI summary. Includes a "Seed with default items" button that batch-writes `BACKLOG` from `src/data/backlog.ts` when the collection is empty. History for each item is stored in a `history` subcollection (`backlog/{id}/history`) and loaded on demand.

## Firestore Structure

```
backlog/                       # collection
  {item.id}                    # document — shape: BacklogItem (src/data/backlog.ts)
    history/                   # subcollection
      {auto-id}                # document — shape: HistoryEntry
```

`BacklogItem` fields: `id`, `product` (`dockbound` | `forumjourney`), `section`, `title`, `description?`, `notes?`, `size?`, `userCategory` (`MVP` | `Later` | `Future`), `order`, `blockedReason?`, `status` (`open` | `in-progress` | `done`), `completionReason?`, `commitRef?`, `updatedAt?` (ISO 8601), `updatedBy?`.

`HistoryEntry` fields: `changedAt` (ISO 8601), `changedBy`, `changeNote?`, `snapshot` (BacklogItem minus `id`).

## External API — PlatformCore

`src/lib/platformcoreApi.ts` — thin wrapper around `fetch`. All requests use `Authorization: Bearer <VITE_PLATFORMCORE_API_KEY>`.

- `listDockGuides(status?)` → `GET /guides/dock[?status=...]`
- `getGuide(guideTypeId, entityId)` → `GET /guides/{guideTypeId}/{entityId}` (both URL-encoded)

## CSS / Design System

All tokens are CSS custom properties defined in `src/index.css` `:root`. Dark mode is handled via `@media (prefers-color-scheme: dark)` overriding the same vars — no separate dark stylesheet. No Tailwind. No CSS modules. Page-level styles live in `src/index.css`; no co-located `.module.css` files exist yet.

Brand colors: `--color-brand` (teal `#3d9b8f`), `--color-brand-navy` (`#1a2e5a`). Semantic pairs follow the global CLAUDE.md conventions.

## Lint

oxlint with `react` + `typescript` + `oxc` plugins. Rules: `react/rules-of-hooks: error`, `react/only-export-components: warn`. No ESLint.
