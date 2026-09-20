# PROJECT_STATE.md — ArchPrompt Studio

> Permanent working memory for this project. Read this first in every new task,
> then `git status` / `git diff`, then open only the relevant files.
> Update only when something material changes. Not a changelog.

## Purpose
ArchPrompt Studio — an app for architects/designers that synthesizes two visual
styles into a project, generates poetic descriptions and prompt-driven visual
boards (materials / colors / mood), rooms and building-type visuals, and a
magazine view. UI is Hebrew / RTL. Originally exported from Base44; now a
standalone app hosted on Netlify with its own backend.

## Stack
- Framework: React 18 + Vite 6
- Language: JavaScript (JSX); type-check via `jsconfig.json`
- Styling: Tailwind CSS 3 + shadcn/ui (Radix), `components.json`
- Routing: react-router-dom 6
- Data/query: @tanstack/react-query
- Package manager: npm (package-lock.json committed)
- Backend: **Netlify Functions + Netlify Blobs** (no external DB, no Supabase)
- Auth: **none** — the app is open (product decision)

## Backend (Netlify-native)
- `netlify/functions/projects.mjs` — projects CRUD. All projects live in ONE
  Blobs index doc (store `projects`, key `all`) read with `consistency:'strong'`
  so writes are visible immediately (Blobs `list()` is only eventually consistent).
- `netlify/functions/upload.mjs` — POST raw image bytes -> Blobs store `images`;
  returns `{ file_url: "/api/images?key=..." }`.
- `netlify/functions/images.mjs` — GET `?key=` serves image bytes (strong read).
- `src/api/projectsClient.js` — frontend fetch client: `projectsClient.{list,create,update,delete}`
  + `uploadImage(file)`. Mirrors the old Base44 entity API so `lib/storage.js`
  barely changed.
- Routing: `netlify.toml` redirects `/api/*` -> `/.netlify/functions/:splat`,
  then SPA fallback `/* -> /index.html`.

## Data model
Project record (stored as-is in Blobs): name, number, poetic_description,
inspiration_image (URL), style_synthesis, visual_description, boards, rooms,
building_types, plus id/created_date/updated_date (server-assigned). `lib/storage.js`
maps DB record <-> internal app shape (`fromDB`/`toDB`) — the seam other code uses.

## Base44 status
- **Runtime no longer calls Base44.** Data, images and (removed) auth are all
  off Base44. Verified live: app loads with no login redirect; full CRUD works.
- Dead/unused files still in the tree (not imported anywhere, tree-shaken out):
  `src/api/base44Client.js`, `src/lib/AuthContext.jsx`, `src/lib/app-params.js`,
  `src/components/ProtectedRoute.jsx`, `src/components/UserNotRegisteredError.jsx`,
  `src/pages/OAuthConsent.jsx`. `@base44/sdk` + `@base44/vite-plugin` are still
  in package.json (the vite plugin also provides the dev `@/` alias + HMR — do
  NOT remove it without adding a resolve alias). Safe cleanup for later.
- `base44/` folder holds the original Base44 app config/entity schemas (reference).

## Data migration off Base44 (scripts)
Two-step, run by the user (Base44 read needs their token; import hits the public API):
1. `npm run export:base44` — backs up ALL projects + downloads ALL images from
   Base44 into `base44-export/` (gitignored). Needs `BASE44_TOKEN` (logged-in app,
   DevTools: `localStorage.getItem('base44_access_token')`); app id/url from `.env.local`.
2. `npm run import:netlify` — uploads the export's images to `/api/upload` and
   re-creates projects via `/api/projects` on the live site (default target
   https://archpromptstudio.netlify.app). No Netlify credentials needed. Guarded
   against double-import unless `IMPORT_FORCE=1`.
- Status: scripts written + validated (syntax, config, error paths). NOT yet run
  end-to-end (needs the user's Base44 token). Until run, the new store is empty.

## Deployment
- Host: **Netlify**, connected to the GitHub repo (auto-deploys on push to `main`).
- Live URL: https://archpromptstudio.netlify.app
- Config: `netlify.toml` (build `npm run build` -> `dist`, functions dir, redirects).
- Vite `base` is `/` (served from domain root).
- GitHub Pages was tried and abandoned (static-only, can't proxy `/api`); disabled.

## Magazine light/dark theme
- `MagazineViewer` has a sun/moon toggle (top bar) switching the whole magazine
  between dark and light/white; persisted in localStorage (`magazine_theme`),
  default dark. Implemented via CSS vars on `.mag-root[data-theme]` in `index.css`
  (HSL channels so Tailwind arbitrary values keep opacity), used across
  `MagazineViewer` + `MagazineSpread`.

## Local dev
- `npm run dev` (Vite) serves the UI but NOT the Netlify functions, so `/api/*`
  won't work locally under plain vite. For full local backend use `netlify dev`
  (netlify-cli is available via npx; needs `netlify login` + `netlify link`).
- `.env.local` still holds the Base44 app id/url (only used by the export script now).

## Secrets / privacy
- No secrets in code. `.env*` gitignored (except `.env.example`).
- `base44-export/` gitignored (user data — never commit to the public repo).
- Note: no auth + public URL = anyone with the link can read/write. Accepted by
  the user; a simple password gate can be added later if wanted.

## Build / validation
- `npm run build` succeeds; `npm run lint` clean (errors: 0).
- Live verified: `/api/projects` CRUD consistent; create-project UI flow works.

## Do NOT delete / break
- `netlify/functions/*` + `netlify.toml` redirects (the whole backend).
- `src/api/projectsClient.js` and `storage.js` `fromDB`/`toDB` mapping.
- The Blobs stores `projects` / `images` (live user data once populated).
- The `@base44/vite-plugin` in `vite.config.js` (provides dev `@/` alias) unless
  you add an explicit resolve alias.

## GitHub
- Remote (source of truth): https://github.com/Anat1969/ArchPromptStudio-GH.git
- Default branch: `main`.

## Current state
- Standalone app live on Netlify, own backend (Functions + Blobs), no Base44 at
  runtime, no auth, magazine light/dark toggle. Store currently empty.
- Remaining: user runs export+import to bring old Base44 content in; optional
  cleanup of dead Base44 files/deps; optional favicon localization (index.html
  still points to base44.com/logo_v2.svg).
