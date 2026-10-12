---
title: Route Map
type: reference
updated: 2026-10-12
sources: [src/app/routes.tsx]
links: ["[[catalog-spine]]", "[[universe-theming]]", "[[cart-flow]]"]
---

# Route Map

10 routes (verified from `src/app/routes.tsx` and live-curl 200s, 2026-10-12), all
heavy pages lazy-loaded with Suspense — route code-splitting (improvement #7 in
audit.md):

| Path | Page | Notes |
|---|---|---|
| `/` | Home | gateways + bestsellers; see [[mood-vibe-taxonomy]] |
| `/shop` | Shop | `filterProducts()` faceting |
| `/universes/:universeSlug` | Universe | sets `data-universe` — see [[universe-theming]] |
| `/men`, `/women` | Gender storefronts | gender-faceted shop |
| `/product/:slug` | PDP | craft provenance, JSON-LD, sticky buy bar |
| `/atelier` | Craft story | technique index |
| `/atelier/:techniqueSlug` | Technique detail | 9 techniques incl. `sashiko-selvedge` |
| `/admin` | Catalog Studio | Supabase product/variant editor; auth-gated in prod |
| `*` | NotFound | SPA fallback (`_redirects` / `vercel.json`) |

**Serving:** SPA on Vercel + Netlify `_redirects` + nginx (`nginx.conf`) /
docker-compose for the self-hosted path (docs/DEPLOYMENT.md).

**Bundle note (2026-10-12):** `index` chunk 694 kB (gzip 199 kB) — over Vite's 600 kB
advisory. Lazy loading already splits Shop/PDP/Admin (~40–60 kB each); the main chunk
is vendor-heavy (motion 187 kB + react 105 kB + index 694 kB includes home
components). Candidate: manualChunks split of `motion` + home-page composition — low
urgency, advisory only.

## Changelog
- 2026-10-12 — created; live route check (all 200) + lazy imports verified.