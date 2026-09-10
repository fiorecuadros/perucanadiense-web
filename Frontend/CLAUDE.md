# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Public portal + admin panel for **IESPP Privado "Peruano Canadiense"** (a licensed private teacher-training institute in Chiclayo, Peru). Angular 21, standalone components, signals, lazy-loaded routes. Language is Spanish, no i18n. Read `../PRODUCT.md` (repo root, one level above this folder) before touching public-facing content: it defines what data is real, what must be shown as "Próximamente", and the brand/legal commitments (regulator is MINEDU, never SUNEDU; no invented routes, PDFs, dates, or figures).

**There is a backend now.** `../Backend/` runs the API (Node + Express + MariaDB) and `environment.useRemoteApi` is `true` in dev: the public site and `/admin` read and write through HTTP, not `localStorage`. Start it with `npm run dev` in `../Backend/` before `npm start` here. Its plan, data model and contract live in `docs/plan-backend-cms.md`; its own README covers setup and verification. With the API down the app still renders: every hydrate falls back to the seed constants.

## Commands

```bash
npm start            # ng serve → http://localhost:4200
npm run build        # production build to /dist
npm run watch        # dev build, rebuild on change
npm test             # run unit tests (Angular's @angular/build:unit-test builder, Vitest + jsdom)
npx ng test --watch=false          # single non-watch run
npx prettier --write "src/**/*.{ts,html}"   # format (printWidth 100, single quotes)
npx ng generate component features/<name>   # scaffold (prefix: app)
```

There is no lint script and no ESLint config; formatting is Prettier only. `npm test` uses `tsconfig.spec.json` (the `test` target points to it; `tsconfig.app.json` excludes `*.spec.ts`). Specs live next to the code they cover.

## Architecture

### Two route trees, one app (`src/app/app.routes.ts`)
- **Public** — children of `PublicLayoutComponent` (`features/public-layout/`), which mounts `HeaderComponent`, `FooterComponent`, `FloatingWhatsappComponent` around a `<router-outlet>`. Every route is `loadComponent` (lazy) with a `title`.
- **Admin** — `/admin/login` (standalone) + `/admin/**` children of `AdminLayoutComponent`, protected by `authGuard` (`core/guards/auth.guard.ts`), which enforces a real session whenever `useRemoteApi` is on. It is a full CMS: nine content modules, plus dashboard, news, comunicados, personal, contactos/identidad, documentos, investigaciones, mesa de partes, reclamaciones, otras solicitudes and usuarios.
- `**` → `NoEncontradoComponent`.
- Router config: view transitions on, scroll-to-top on nav, `onSameUrlNavigation: 'reload'`.

### Data flow for the public site
Institutional data lives in `src/app/core/constants/*.constant.ts` (one per domain: `institution`, `programs`, `faculty`, `admission`, `becas`, `costos`, `estadisticas`, `horarios`, `inversiones`, `licenciamiento`, `inicio`). `InstitutionService` (`providedIn: 'root'`) wraps identity/programs/faculty in read-only signals plus `computed` selectors (`fidPrograms`, `technicalPrograms`, `authorities`, `whatsappUrl`, …). **The eight autogestionados modules (inicio, admisión, becas, costos, estadísticas, horarios, inversiones, licenciamiento) are read from stores, not from the constant.** The constant is only the seed. If a number in a guide disagrees with `institution.constant.ts`, the constant wins.

### Content stores (admin autogestión)
- `ContenidoStore` (`core/store/contenido.store.ts`) — one `persisted<T>(key, seed)` per module. Seed = `*_COPY`. `publicar()` writes to `localStorage` and, with the API on, `PUT`s the whole module object. Public visors bind `copy = store.value`.
- `DocumentosStore` — collection of `DocumentoInstitucional` (`core/models/documento.model.ts`), seed in `documentos.seed.ts`. `porModulo` / `porSeccion` (and `deSeccion`) filter `estado === 'publicado'` for the public site. Drafts stay in admin.
- `ArchivosStore` — with the API on, uploads go to `POST /archivos` (multipart field `file`) and the JSON keeps `/api/archivos/<uuid>`. Offline it falls back to IndexedDB `pc-admin-files` with `idb:<id>` refs resolved to object URLs. Either way, never put PDFs in `localStorage`.
- Every store already talks HTTP when `useRemoteApi` is on, through `PortalApi` (`core/api/portal.api.ts`); `PortalSync` hydrates them on entering the public layout and the admin layout. The routes are in `core/api/endpoints.ts` — that file plus `api.types.ts` is the contract the backend implements.
- "Restaurar original" calls the server (`POST /admin/contenido/:modulo/restaurar`, `POST /admin/documentos/restaurar/:modulo`); it must not just clear `localStorage`, or the change stays live for everyone else.

Admin UI for these eight lives in `admin/contenido/<modulo>/` with a shared schema editor (`admin/shared/`). The management panels (dashboard, contactos, documentos, investigaciones, mesa de partes, reclamaciones, solicitudes, usuarios) are wired to the API. Trámite inboxes share `admin/shared/bandeja-tramites/`: to add one, describe its columns, detail fields and states, and pass a loader and a saver.

When adding or editing copy for those eight pages, change the constant (seed) **and** expect the store to overlay local edits. Do not hardcode that copy in components.

### Feature component pattern
A page feature is a folder under `src/app/features/<name>/`. Larger pages (e.g. `inicio`, `admision`) are split into section sub-components under `<name>/components/<section>/` — the page component is a thin shell that just imports and composes the sections (see `features/inicio/inicio.component.ts`). Newer feature pages use `ChangeDetectionStrategy.OnPush`. Do not port the old template's duplicated monolithic CSS; keep section CSS with its section.

### Shared UI kit (`src/app/shared/ui/`)
shadcn/Spartan-inspired primitives (`button`, `badge`, `card`, `input`, `dialog`, `alert`), re-exported from `shared/ui/index.ts`. Buttons/inputs are **attribute directives** (`[appButton]`, selector prefix `app`) using `class-variance-authority` (`cva`) for variants + the `cn()` helper (`core/utils/cn.ts`, clsx + tailwind-merge). When adding a variant, edit the `cva` config in the directive.

### Styling
Tailwind 3 (`tailwind.config.js`, `darkMode: 'class'`) with the brand palette as named colors (`primary` `#FF6600`, `dark`, `minedu`, `stats`, `whatsapp`, …) and Poppins as the sans font. `src/styles.css` also defines the same palette as `--inst-*` CSS variables plus global resets and Quill overrides. Prefer Tailwind classes with the named colors; use `--inst-*` vars only where existing component CSS already does.

### Auth (admin only)
JWT in `sessionStorage` under `token`, plus the session user under `usuario` (`AuthService.usuario` / `esAdmin`). `authInterceptor` (`core/auth/auth.interceptor.ts`) attaches the bearer header and hard-redirects to `/admin/login` on 401 / "Token inválido" 403. `authGuard` (`core/guards/auth.guard.ts`) lets everything through only while `useRemoteApi` is `false`. There used to be a second guard at `core/auth/auth.guard.ts`; it was deleted — one guard, one place. API base URLs are in `src/environments/environment{,.prod}.ts`; `environment.prod.ts` still has `useRemoteApi: false` and must be flipped when the API is deployed.

### Assets
Static files served from `public/` (mapped to `/`). PDF rendering uses `ng2-pdf-viewer` / `pdfjs-dist`; `angular.json` copies the pdf.js worker, cmaps, and fonts into `/pdfjs/*` at build time (`/public/pdfjs/` is gitignored, copied in dev).

## Conventions

- **File naming is mixed.** Older code: `x.component.ts` exporting `XComponent`. Newer code (Angular 21 default schematics): `x.ts` exporting `X`. Match the surrounding folder rather than renaming.
- Standalone components everywhere; no NgModules. Use `inject()` over constructor injection (matches existing services).
- TypeScript is strict, plus `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `strictTemplates`. Indent 2 spaces, single quotes, final newline (`.editorconfig`).
- Comments and user-facing copy are in Spanish; keep it that way.
- `.vscode/mcp.json` registers the Angular CLI MCP server (`@angular/cli mcp`) — useful for Angular-version-accurate guidance.
