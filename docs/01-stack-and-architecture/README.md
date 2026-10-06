# 01 — Stack & Architecture

> **Source of truth for technical decisions.**  
> Any agent that touches code must read this first. If a decision here conflicts with an implementation, this document wins.

---

## 1. Goal

Build a state-of-the-art embroidered clothing e-commerce experience — from editorial storytelling to seamless checkout — in alignment with [STAR_GOAL.md](../../STAR_GOAL.md). The platform leverages patterns proven by the competition (Bode, Story mfg., Bottega Veneta, SSENSE): editorial heroes, premium Lenis scroll motion, clean product grids, macro-stitch inspection image-swap cards, animated filtering by embroidery technique, and a polished atelier cart drawer. This phase has no backend; products live in typed JSON behind a thin data-access layer that can be swapped for Shopify Storefront API or Supabase later without touching UI code.

---

## 2. Concern Table

| Concern | Pick | Reason |
|--------|------|--------|
| Build tool | **Vite + React 19 + TypeScript** | Fast dev server, simple config, fewer hallucinated configs than Next.js for local models. |
| Routing | **React Router v7 (library mode)** | Two main routes now (`/`, `/shop`), room for `/product/:id` and `/cart` later. |
| Styling | **Tailwind CSS v4 + CSS variables** | Utility speed + token-based palette/type/spacing keeps every agent consistent. |
| Scroll animation | **GSAP + ScrollTrigger** | Industry standard for pinned sections, parallax, and scrubbed reveals. |
| Smooth scroll | **Lenis** | The "premium inertia" feel used by award-winning fashion sites. |
| Page / UI motion | **Motion (Framer Motion)** | Route transitions, layout animations, hover states, cart drawer. |
| State | **Zustand** | Tiny, un-opinionated; perfect for cart and filters. |
| Data | **typed JSON files + `lib/data.ts`** | No DB until accounts, real inventory, checkout, or auth are needed. |

---

## 3. Folder Structure

```text
UniqueLo/
├── docs/                       ← THIS FOLDER — source of truth
│   ├── 01-stack-and-architecture/
│   ├── 02-design-system/
│   ├── 03-data-contracts/
│   ├── 04-motion-system/
│   ├── 05-phases/
│   └── 06-assets-and-placeholders/
├── public/
│   ├── images/
│   │   ├── products/           ← product imagery keyed by product.slug
│   │   ├── campaigns/          ← hero / lookbook / editorial imagery
│   │   └── placeholders/       ← generated tonal blocks while assets are pending
│   └── fonts/                  ← self-hosted fonts only (no FOUT)
├── src/
│   ├── app/                    ← router, layout shell, page transitions
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── Layout.tsx
│   ├── styles/
│   │   ├── tokens.css          ← CSS variables for colors, type, spacing, easing
│   │   └── globals.css         ← base + Tailwind imports + reduced-motion
│   ├── lib/
│   │   ├── data.ts             ← data-access layer (queries / filters / cart helpers)
│   │   ├── motion.ts           ← shared easings, variants, stagger helpers
│   │   └── lenis.ts            ← Lenis init + React Router integration
│   ├── data/
│   │   ├── products.json       ← canonical product dataset
│   │   └── categories.json     ← canonical category dataset
│   ├── stores/
│   │   ├── cart.ts             ← Zustand cart store
│   │   └── filters.ts          ← Zustand shop filters store
│   ├── components/
│   │   ├── layout/             ← Header, Footer, MegaMenu, CartDrawer
│   │   ├── ui/                 ← Button, Image (lazy + blur-up), Cursor, Marquee
│   │   ├── home/               ← Hero, CategoryStrip, FeaturedProducts, EditorialSplit, Lookbook, Newsletter
│   │   └── shop/               ← CategoryTabs, FilterBar, ProductGrid, ProductCard
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── Shop.tsx
│   └── main.tsx                ← Vite entry
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 4. Dependency Versions (Pinned)

Do not bump these without updating this file and re-verifying the build.

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.5.0",
    "gsap": "^3.12.7",
    "@gsap/react": "^2.1.2",
    "lenis": "^1.3.1",
    "motion": "^12.7.4",
    "zustand": "^5.0.3",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.2.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.3",
    "vite": "^6.3.1",
    "tailwindcss": "^4.1.4",
    "@tailwindcss/vite": "^4.1.4"
  }
}
```

---

## 5. Upgrade Path

- **Backend later?** Only replace `src/lib/data.ts`. Shopify Storefront API is preferred for clothing because it handles inventory, variants, and checkout out of the box. Supabase is the fallback for custom auth + inventory.
- **SEO / SSR later?** Components carry over cleanly to Next.js App Router once the routing/data layer is adapted. Do not optimize for SEO now.
- **Database later?** Add only when real inventory, checkout persistence, or auth is required.

---

## 6. Reference Sites & What to Borrow

| Site | What to borrow |
|------|----------------|
| Aesop, Bottega Veneta | Restraint, generous whitespace, refined typography, editorial pacing. |
| Acne Studios, COS | Clean product grid, second image on hover, minimal card chrome. |
| Jacquemus, Kith | Full-bleed campaign heroes, bold scroll storytelling, large type. |
| SSENSE | Category navigation clarity, filter bar behavior, staggered grid reveals. |
| Zara | Lookbook-style full-screen imagery, fast feel. |
| Apple | Pinned scroll sequences that reveal content step by step. |

---

## 7. Architectural Rules

1. **No UI file imports JSON directly.** All data access goes through `src/lib/data.ts`.
2. **No hard-coded colors/spacing/easing outside tokens.** Tokens live in `src/styles/tokens.css`.
3. **One easing family + one duration scale.** See `docs/04-motion-system/README.md`.
4. **All motion respects `prefers-reduced-motion`.** See `docs/04-motion-system/README.md`.
5. **Images are lazy-loaded and blur-up.** Use the shared `Image` component in `src/components/ui/Image.tsx`.
6. **Atomic phases.** See `docs/05-phases/README.md`. Each phase ends with `npm run build` and a checklist.
7. **No new dependencies without ADR.** If an agent wants to add a package, write a short note in `docs/01-stack-and-architecture/adr/` and get approval.

---

## 8. Risks & Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-06 | Vite + React + TS instead of Next.js | Faster local-model iteration; migration path documented. |
| 2026-10-06 | No database in Phase 1 | Avoid over-engineering before product, checkout, or auth exist. |
| 2026-10-06 | Products in JSON, accessed via `lib/data.ts` | Keeps UI decoupled so backend swap only touches one file. |
| 2026-10-06 | Tailwind v4 + CSS variables | Native CSS variables are first-class and avoid plugin complexity. |
| 2026-10-06 | Self-hosted fonts | Avoids FOUT and external dependency in production. |

