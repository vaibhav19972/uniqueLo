# 05 — Build Phases

> **Source of truth for execution order.**  > Work in phases. Each phase is a set of atomic task cards. Every phase ends with `npm run build` and a checklist.

---

## 1. Phase Summary

| Phase | Goal | Deliverable |
|-------|------|-------------|
| **0** | Scaffold Vite project, install pinned deps, configure Tailwind v4 + TS | `npm run dev` works, empty white page loads |
| **1** | Tokens, layout shell, data layer, shared primitives | Static scaffold + header/footer + data access works |
| **2** | Home page sections | Full home page with hero, categories, featured, editorial, lookbook, newsletter |
| **3** | Shop page + filtering | Shop grid, tabs, filters, animated layout, quick-add |
| **4** | Cart + drawer + route transitions | Cart store, drawer UI, add/remove, subtotal |
| **5** | Polish + QA + build optimization | Reduced motion pass, Lighthouse, responsive audit, prod build passes |
| **6** | Identity & brand experience pass | Real Satoshi + Melodrama self-hosted fonts, anti-generic rules, PDP/Atelier/Journal design per `.hermes/plans/2026-10-07_133000-design-plan-v2.md` |
| **7** | Async data layer | `data.ts` becomes async (TanStack Query), JSON dev seed, storefront UX unchanged, hooks for product/categories/techniques |
| **8** | Backend (Strapi v5) | Content types modeled (Product/Variant/Category/Article/CraftTechnique), catalog seeded, `data.ts` swaps to REST |
| **9** | Editor dashboard | Editor role (articles + prices), product upload with craft/region fields, category management, inventory per variant |

---

## 2. Phase Rules

1. **Do not start a phase until the previous phase passes its checklist.**
2. **One component per task card.** No vague "build the home page" tasks.
3. **Acceptance criteria are non-negotiable.** If a check fails, fix it before moving on.
4. **Every phase ends with `npm run build`.** No exceptions.
5. **Agents must read the relevant docs before writing code:**
   - `docs/01-stack-and-architecture/README.md`
   - `docs/02-design-system/README.md`
   - `docs/03-data-contracts/README.md`
   - `docs/04-motion-system/README.md`
   - This file

---

## 3. Phase 0 — Project Scaffold

### Goal
A working Vite + React + TS project with Tailwind v4 configured and the empty app rendering a styled placeholder.

### Task Cards

#### P0.1 — Initialize Vite project
- **File:** project root
- **Command:** `npm create vite@latest . -- --template react-ts`
- **Acceptance:**
  - [ ] `package.json` exists with React 19 + TS.
  - [ ] `vite.config.ts` exists.
  - [ ] `npm install` succeeds.
  - [ ] `npm run dev` starts without errors.

#### P0.2 — Install pinned dependencies
- **File:** `package.json`
- **Command:** add the dependency block from `docs/01-stack-and-architecture/README.md`.
- **Acceptance:**
  - [ ] All pinned deps installed.
  - [ ] `node_modules/.bin/vite` exists.
  - [ ] `npm run build` succeeds.

#### P0.3 — Configure Tailwind v4
- **Files:** `src/styles/tokens.css`, `src/styles/globals.css`, `vite.config.ts`, `tailwind.config.ts`
- **Acceptance:**
  - [ ] `src/styles/tokens.css` contains the full token block from `docs/02-design-system/README.md`.
  - [ ] `src/styles/globals.css` imports Tailwind v4 and maps tokens via `@theme`.
  - [ ] `vite.config.ts` uses `@tailwindcss/vite` plugin.
  - [ ] A test element styled with `bg-cream text-ink` renders correctly.

#### P0.4 — Set up router shell
- **Files:** `src/app/routes.tsx`, `src/app/App.tsx`, `src/app/Layout.tsx`, `src/main.tsx`
- **Acceptance:**
  - [ ] `/` renders a placeholder "Home".
  - [ ] `/shop` renders a placeholder "Shop".
  - [ ] Navigation between routes works.

---

## 4. Phase 1 — Tokens, Layout, Data Layer, Primitives

This is the first real implementation phase. Complete everything below before moving on.

### Task Cards

#### P1.1 — Finalize tokens and global styles
- **Files:** `src/styles/tokens.css`, `src/styles/globals.css`, `src/lib/motion.ts`
- **Acceptance:**
  - [ ] All tokens from `docs/02-design-system/README.md` exist in `tokens.css`.
  - [ ] All motion tokens from `docs/04-motion-system/README.md` exist in `tokens.css`.
  - [ ] `globals.css` sets body background to `--color-cream` and text to `--color-ink`.
  - [ ] Reduced-motion CSS reset exists in `globals.css`.

#### P1.2 — Shared motion helpers
- **File:** `src/lib/motion.ts`
- **Acceptance:**
  - [ ] `EASING`, `DURATION`, `transitions`, and `variants` exported exactly as documented.
  - [ ] `prefersReducedMotion()` utility exported.
  - [ ] No component invents its own easing values.

#### P1.3 — Lenis setup
- **File:** `src/lib/lenis.ts`, `src/main.tsx`, `src/app/App.tsx`
- **Acceptance:**
  - [ ] Lenis initializes on app start (unless reduced motion).
  - [ ] Route change scrolls to top.
  - [ ] ScrollTrigger is wired to Lenis updates.

#### P1.4 — Data contracts and JSON seed
- **Files:** `src/lib/data.ts`, `src/data/products.json`, `src/data/categories.json`
- **Acceptance:**
  - [ ] All types from `docs/03-data-contracts/README.md` defined and exported.
  - [ ] `getProducts`, `getCategories`, `getFeaturedProducts`, `getAllColors`, `getAllSizes`, `getMaxPriceCents`, `filterProducts`, `formatPrice`, `getDefaultVariant`, `getCartLine` all implemented.
  - [ ] `products.json` has 12–20 valid products with all required fields.
  - [ ] `categories.json` has 6 categories including `all`.
  - [ ] All JSON schema checks pass (see `docs/03-data-contracts/README.md`).

#### P1.5 — Zustand stores
- **Files:** `src/stores/cart.ts`, `src/stores/filters.ts`
- **Acceptance:**
  - [ ] `cart.ts` exposes `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `totalItems`, `subtotalCents`.
  - [ ] `filters.ts` exposes `filters` matching `FilterState` and `setCategory`, `toggleColor`, `toggleSize`, `setPriceMax`, `setSort`, `resetFilters`.
  - [ ] Both stores persist to `localStorage` (optional but recommended).

#### P1.6 — UI primitives
- **Files:** `src/components/ui/Button.tsx`, `src/components/ui/Image.tsx`
- **Props:**
  - `Button`: `variant?: 'primary' | 'secondary' | 'ghost'`, `size?: 'sm' | 'md' | 'lg'`, `children`, `...rest`.
  - `Image`: `src`, `alt`, `aspectRatio?: string`, `className?`, `lazy?: boolean`, `placeholderColor?`.
- **Acceptance:**
  - [ ] Button variants match design-system rules.
  - [ ] Image lazy-loads and shows a blur-up placeholder.
  - [ ] Image accepts a container aspect ratio.

#### P1.7 — Header component
- **File:** `src/components/layout/Header.tsx`
- **Props:** none
- **Acceptance:**
  - [ ] Fixed or sticky at top, height `--header-height`.
  - [ ] Logo left, nav center (Home, Shop), cart icon right.
  - [ ] Header hides on scroll down, reveals on scroll up (transform only).
  - [ ] Reduced motion disables the hide/reveal animation.

#### P1.8 — Footer component
- **File:** `src/components/layout/Footer.tsx`
- **Props:** none
- **Acceptance:**
  - [ ] Dark surface (`bg-ink text-cream`).
  - [ ] Newsletter input + button, links columns, brand logo.
  - [ ] Responsive grid.

#### P1.9 — Layout shell with transitions
- **File:** `src/app/Layout.tsx`
- **Acceptance:**
  - [ ] Header and Footer wrap `Outlet`.
  - [ ] Page content has top padding for sticky header.
  - [ ] Optional page fade on route change.

#### P1.10 — Phase 1 verification
- **Command:** `npm run build`
- **Checklist:**
  - [ ] Build passes with zero TypeScript errors.
  - [ ] No console errors in dev.
  - [ ] Home placeholder and Shop placeholder render within layout.
  - [ ] Header, Footer, Button, Image are visually recognizable.
  - [ ] `prefers-reduced-motion: reduce` disables smooth scroll and header animation.
  - [ ] Data helpers return correct counts and prices.

---

## 5. Phase 2 — Home Page Sections

### Goal
Implement every section on the Home page using the primitives, data layer, and motion system.

### Sections (one per task card)

| ID | Component | File | Key behavior |
|----|-----------|------|--------------|
| P2.1 | Hero | `src/components/home/Hero.tsx` | Full-bleed video/image, masked headline reveal |
| P2.2 | CategoryStrip | `src/components/home/CategoryStrip.tsx` | Horizontal scroll on mobile, grid on desktop, category cards with image |
| P2.3 | FeaturedProducts | `src/components/home/FeaturedProducts.tsx` | Horizontal-scroll pinned section with GSAP |
| P2.4 | EditorialSplit | `src/components/home/EditorialSplit.tsx` | Two-column image + text, parallax |
| P2.5 | Lookbook | `src/components/home/Lookbook.tsx` | Full-bleed panels, scroll-driven reveals |
| P2.6 | Newsletter | `src/components/home/Newsletter.tsx` | Inline signup section (also duplicated in footer) |
| P2.7 | Home page assembly | `src/pages/Home.tsx` | Compose all sections |

### Phase 2 Verification

- [ ] `npm run build` passes.
- [ ] All sections render in order.
- [ ] Hero headline reveal plays on load.
- [ ] Featured section pins and scrolls horizontally.
- [ ] Reduced motion collapses all animations.

---

## 6. Phase 3 — Shop Page

### Goal
Full shop grid with category tabs, filters, product cards, and animated layout changes.

### Sections (one per task card)

| ID | Component | File | Key behavior |
|----|-----------|------|--------------|
| P3.1 | CategoryTabs | `src/components/shop/CategoryTabs.tsx` | Animated underline via Motion layoutId |
| P3.2 | FilterBar | `src/components/shop/FilterBar.tsx` | Color swatches, size chips, price slider, sort dropdown |
| P3.3 | ProductCard | `src/components/shop/ProductCard.tsx` | Image swap on hover, quick-add button |
| P3.4 | ProductGrid | `src/components/shop/ProductGrid.tsx` | Staggered layout animation on filter change |
| P3.5 | Shop page assembly | `src/pages/Shop.tsx` | Compose tabs, filters, grid |

### Phase 3 Verification

- [ ] `npm run build` passes.
- [ ] Tabs animate the underline.
- [ ] Filters update the URL query string (optional but nice).
- [ ] Grid animates when filters change.
- [ ] Hover swaps product image and reveals quick-add.
- [ ] Quick-add adds the default variant to cart.

---

## 7. Phase 4 — Cart + Drawer

### Goal
A polished cart drawer with add/remove/update, subtotal, and route transitions.

### Task Cards

| ID | Component | File | Key behavior |
|----|-----------|------|--------------|
| P4.1 | CartDrawer | `src/components/layout/CartDrawer.tsx` | Slide from right, backdrop, close on escape |
| P4.2 | CartLineItem | `src/components/layout/CartLineItem.tsx` | Image, name, variant, qty, remove |
| P4.3 | Cart icon + count | `src/components/layout/Header.tsx` | Update existing header |
| P4.4 | Route transitions | `src/app/Layout.tsx` | AnimatePresence fade between pages |

### Phase 4 Verification

- [ ] `npm run build` passes.
- [ ] Drawer opens from header icon and quick-add.
- [ ] Quantity updates change subtotal.
- [ ] Remove animates item out.
- [ ] Cart count updates globally.

---

## 8. Phase 5 — Polish + QA

### Goal
Production-ready build with accessibility, performance, and responsive passes.

### Task Cards

| ID | Task | Acceptance |
|----|------|------------|
| P5.1 | Responsive audit | All breakpoints look intentional; no overflow or broken grids. |
| P5.2 | Reduced-motion audit | No animation runs when `prefers-reduced-motion: reduce` is on. |
| P5.3 | Image audit | All images lazy-load; alt text complete; placeholders replaced or documented. |
| P5.4 | Accessibility audit | Keyboard navigation works; focus rings visible; color contrast passes. |
| P5.5 | Lighthouse / build | `npm run build` passes; target 90+ performance by optimizing images and splitting bundles. |
| P5.6 | README update | `README.md` contains setup, dev, build, and phase links. |

---

## 9. Phase 6 — Identity & Anti-Generic Pass

### Goal
Remove every "template/AI-generated" signal so the storefront reads as an
art-directed brand site, not a generated one. The detailed brand experience
plan is in `.hermes/plans/2026-10-07_133000-design-plan-v2.md` and should be
treated as the active design direction for Phases 6+.

### Task Cards

| ID | Task | Acceptance |
|----|------|------------|
| P6.1 | Self-host brand fonts | `public/fonts/` contains Satoshi (variable or 400/500/700) + Melodrama woff2; `fonts.css` with `@font-face` + `font-display: swap`; index.html Google Fonts link removed; no FOUT flash of fallback serif. |
| P6.2 | Enforce art-direction rules | `docs/02-design-system` anti-generic rules section exists and components comply. |
| P6.3 | Placeholder audit | Every script-generated image is either replaced or explicitly documented in `docs/06-assets-and-placeholders` with replacement intent. |

### Phase 6 Verification

- [ ] `npm run build` passes.
- [ ] DevTools network shows fonts served locally (no `fonts.googleapis.com` request).
- [ ] Computed font-family on `body` is Satoshi; on editorial headings is Melodrama.

---

## 10. Phase 7 — Async Data Layer

### Goal
Prepare the seam for Strapi: `src/lib/data.ts` exports become async, cached via
TanStack Query, with JSON files demoted to dev seed data. Storefront UX unchanged.

### Task Cards

| ID | Task | Acceptance |
|----|------|------------|
| P7.1 | Add TanStack Query | QueryClientProvider in `src/app/App.tsx`; `@tanstack/react-query` installed. |
| P7.2 | Async `data.ts` | All getters return Promises; JSON import paths kept as dev fallback when `VITE_API_URL` unset. |
| P7.3 | Query hooks | `src/hooks/useCatalog.ts` with `useProducts`, `useProduct(slug)`, `useCategories` consuming `data.ts`. |
| P7.4 | Migrate consumers | Shop/Home/ProductGrid/etc. use hooks; loading + error states styled per design system. |

### Phase 7 Verification

- [ ] `npm run build` passes.
- [ ] With no backend running, storefront renders identically from seed JSON.
- [ ] No component imports `../data/products.json` directly.

---

## 11. Phase 8 — Supabase Backend & Vercel Deployability (Completed & Aligned)

### Goal
Align with the production stack demonstrated in TMS: Deploy the storefront to **Vercel** with client-side SPA routing (`vercel.json`), connect data layer to **Supabase** (managed PostgreSQL with instant REST API, RLS policies, and tables for products, categories, variants, embroidery, reviews, newsletter subscribers, and orders), and provide production Docker configuration (`Dockerfile` + `docker-compose.prod.yml`) for self-hosted server deployment.

### Task Cards

| ID | Task | Acceptance | Status |
|----|------|------------|:---:|
| P8.1 | Supabase Client & Schema | `src/lib/supabase.ts`, `supabase/schema.sql`, `supabase/seed.sql` created with RLS. | ✅ Done |
| P8.2 | Async Data Layer with Supabase | `data.ts` queries Supabase when keys present, with seamless fallback to seed JSON. | ✅ Done |
| P8.3 | Vercel Deployment Configuration | `vercel.json` configured with SPA rewrites and edge immutable caching. | ✅ Done |
| P8.4 | Production Server Docker Stack | Multi-stage `Dockerfile`, `nginx.conf`, and `docker-compose.prod.yml` ready for VPS. | ✅ Done |
| P8.5 | State-of-the-Art Luxury Brand Parity | Full PDP (`/product/:slug`), 3x Macro Stitch Loupe, Quick View modal, coupon discounts, cart upsells, wishlist, announcements marquee, and size guide modal. | ✅ Done |

### Phase 8 Verification

- [x] `npm run build` passes with 0 TypeScript/bundler errors.
- [x] `npm run lint` passes with 0 oxlint warnings/errors.
- [x] Storefront runs offline or with zero config using bundled seed JSON, and connects immediately when `VITE_SUPABASE_URL` is set.
- [x] Complete deployment guide written in `docs/DEPLOYMENT.md`.

---

## 12. Phase 9 — Editor Dashboard

### Goal
Non-developer workflow: an Editor logs into `/admin` and can manage articles,
edit prices, upload products with variants, and manage categories + inventory.

### Task Cards

| ID | Task | Acceptance |
|----|------|------------|
| P9.1 | Editor role | Custom Strapi role: full CRUD on Article; update-only on Product (price/featured fields); publish rights; no settings/delete access. |
| P9.2 | Product upload flow | Editor creates a product in admin: images to media library, variants with price/quantity, category assignment, embroidery details. |
| P9.3 | Inventory workflow | Editor adjusts variant `quantity`; storefront stock status (in/low/out) reflects it. |
| P9.4 | Article workflow | Editor drafts, previews, publishes an Atelier Journal article; storefront Journal route renders it. |
| P9.5 | Journal route | `/journal` + `/journal/:slug` frontend routes reading Article data via `data.ts`. |

### Phase 9 Verification

- [ ] `npm run build` passes.
- [ ] Editor account can log in, publish an article, edit a price, and upload a product — without touching code.
- [ ] Admin (Super Admin) can delete products and manage roles; Editor cannot.

---

## 13. How to Assign Work to Other Agents

When another agent joins, give it:

1. The current phase number.
2. The exact task card ID(s).
3. A one-line context: "We are on Phase 1. Read docs/01-04 and docs/05, then implement P1.4 and P1.5."
4. The acceptance checklist from the task card.
5. The rule: **run `npm run build` before finishing**.

Agents should not skip phases or invent new architecture. If they discover a conflict, they must update the relevant doc first and return for confirmation.

