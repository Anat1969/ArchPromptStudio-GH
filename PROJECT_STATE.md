# PROJECT_STATE.md — ArchPrompt Studio

> Permanent working memory for this project. Read this first in every new task,
> then `git status` / `git diff`, then open only the relevant files.
> Update only when something material changes. Not a changelog.

## Purpose
ArchPrompt Studio — an app for architects/designers that synthesizes two visual
styles into a project, generates poetic descriptions and prompt-driven visual
boards (materials / colors / mood), rooms and building-type visuals. UI is
Hebrew / RTL. Exported from Base44 to become a standalone, GitHub-managed project.

## Stack
- Framework: React 18 + Vite 6
- Language: JavaScript (JSX) + a little TypeScript; type-check via `jsconfig.json`
- Styling: Tailwind CSS 3 + shadcn/ui (Radix primitives), `components.json`
- Routing: react-router-dom 6
- Data/query: @tanstack/react-query
- Package manager: npm (package-lock.json committed)
- Backend today: **Base44** (SDK `@base44/sdk`) — auth, database, file storage

## Architecture / important directories
- `src/api/base44Client.js` — single Base44 client instance
- `src/lib/app-params.js` — reads app_id / token / backend URL (env + URL params)
- `src/lib/AuthContext.jsx` — Base44 auth state
- `src/lib/storage.js` — project CRUD; maps DB record <-> internal shape (the data layer)
- `src/lib/promptEngine.js` — prompt/description generation logic
- `src/pages/` — Landing, Home, Gallery, WorkScreen, MagazineViewer, OAuthConsent
- `src/components/` — app components + `ui/` shadcn components
- `base44/` — Base44 app config + entity schemas (`Project`, `User`)

## Data model
Entity `Project` (Base44): name, number, poetic_description, inspiration_image (URL),
style_synthesis, visual_description, boards, rooms, building_types. See
`base44/entities/Project.jsonc` and the `fromDB`/`toDB` mappers in `storage.js`.

## Base44 dependencies (to reduce over time)
Classified for later migration off Base44:
- **Essential now**: auth (`base44.auth`), DB (`base44.entities.Project.*`),
  file upload (`base44.integrations.Core.UploadFile` in `InspirationUpload.jsx`,
  `PromptCard.jsx`).
- **Replaceable later**: DB -> Postgres/Supabase; storage -> Supabase Storage /
  R2 / S3; auth -> Supabase Auth or equivalent. `storage.js` is the seam that
  isolates the DB, so migration should start there.
- **Config-bound**: `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL` (env only).

## Storage strategy (target)
- GitHub: code + small static assets only.
- Database: project data / metadata.
- Object storage (Supabase Storage / Cloudflare R2 / S3): images & large files.
- Do NOT store user images as Base64 in the DB or in Git. Base44 upload URLs are
  the current image source — migrate to object storage before relying on them long term.

## Secrets
- No secrets in code (verified). Config comes from env vars.
- `.env` / `.env.*` are gitignored; `.env.example` documents the vars.

## Build / validation
- `npm install` → `npm run build` succeeds (outputs `./dist`).
- Build warns that `VITE_BASE44_APP_ID` isn't set — expected without a real `.env.local`.

## Known issues
- `npm run lint` reports 3 pre-existing unused-import errors (from the Base44
  export): `MigrateLocalStorage.jsx`, `Gallery.jsx`, `WorkScreen.jsx`.
  Kept as-is in the baseline commit; safe to auto-fix (`npm run lint:fix`).
- `npm audit` reports vulnerabilities in transitive deps — review before deploy.

## Do NOT delete / break
- Base44 auth/DB/storage wiring while it is still the live backend.
- `storage.js` data-shape mapping (DB <-> app) — other code depends on it.
- User images / inspiration image URLs.

## GitHub
- Remote (source of truth): https://github.com/Anat1969/ArchPromptStudio-GH.git
- Default branch: `main`.

## Current state
- Local folder is the active project; Base44 export lives here.
- Git initialized; baseline commit = pristine Base44 export + `.env.example` +
  this file, pushed to `main`. App builds. Ready for continued development from the repo.
