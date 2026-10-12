# Testing Strategy & Test-Case Plan

> **Owner:** Vaibhav · **Created:** 2026-10-12 · **Status:** Plan (nothing implemented yet)
> **Goal:** Guard the two biggest regression surfaces — the catalog data spine and the
> cart/checkout/customizer flows — with a layered test suite. Layer 1 catches logic bugs
> in milliseconds; Layer 2 catches what users actually experience.

**Related:** `../audit.md` (bug tracker) · `../docs/03-data-contracts/README.md` (type
contracts the unit tests assert against) · `../docs/07-backend/README.md` (Supabase
seam) · `[[kb/catalog-spine]]`, `[[kb/is-mock-guard-gap]]` in the KB.

---

## 1. Layer 1 — Unit & Integration (Vitest + React Testing Library)

The repo already builds with Vite 6 + TypeScript; Vitest reuses the exact same
transform pipeline, so no second toolchain. RTL renders components with the same
react-dom the app ships.

### Setup (one-time)

```bash
npm i -D vitest @testing-library/react @testing-library/user-event \
  @testing-library/dom jsdom @vitest/coverage-v8
```

**`vite.config.ts`** — add:

```ts
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.ts',
  include: ['src/**/*.{test,spec}.{ts,tsx}'],
},
```

**`src/test/setup.ts`**: `import '@testing-library/jest-dom/vitest'` + a `matchMedia`
stub (Lenis and GSAP both query it) + `lenis`/`gsap` mocks so scroll code never hangs
jsdom.

**`package.json`** — scripts: `"test": "vitest run"`, `"test:watch": "vitest"`,
`"test:coverage": "vitest run --coverage"`.

### Test cases (priority order)

**T1. `src/lib/data.ts` (pure data spine — highest value, all synchronous logic)**

| ID | Case | Asserts |
|---|---|---|
| T1.1 | Data integrity gate | Every mock product: slug unique; every variant has sku/color/size/price_cents; `technique` ∈ `CRAFT_TECHNIQUES`; every `vibe` ∈ `VIBES`; every `mood` ∈ mood registry; `image paths` resolve (join `public/`) — turns the manual parity audit (5 products/31 variants, 25 image paths) into a 5 ms failing test |
| T1.2 | `formatPrice` | INR grouping (`Intl.NumberFormat('en-IN')`), no decimals; non-negative; matches docs/03 contract |
| T1.3 | `filterProducts()` | Each `FilterState` dimension alone filters correctly (universe, gender, technique, vibe, mood, size, price); combinations AND together; empty state returns `[]` not throw |
| T1.4 | Catalog fallback precedence | With Supabase unset → mock catalog; with Supabase error → mock catalog; with rows lacking `universe_slug` → mock catalog (feature detection); **with `is_mock=true` rows → still filtered out (TDD for the `[[kb/is-mock-guard-gap]]` guard: write this test red first, then add the `.eq('is_mock', true)`)** |
| T1.5 | `createOrder()` payload | order + order_items shape matches `docs/03` CartItem/Order contract; price in paise; customization jsonb round-trips |

**T2. Zustand stores (`src/stores/`)**

| ID | Case | Asserts |
|---|---|---|
| T2.1 | `cart.ts` addItem/updateQuantity clamping | quantity never exceeds passed `maxQuantity`; removing last item empties store; totals recompute; regresses BUG-4 permanently |
| T2.2 | `cart.ts` sold-out rejection | adding a `status != 'in_stock'` variant is a no-op, not a silent add |
| T2.3 | `wishlist.ts`, `quickView.ts`, `toast.ts`, `filters.ts` | open/close/toast lifecycle, filter state round-trip |
| T2.4 | `customizer.ts` | monogram text + placement state shape matches CartItem.customization contract |

**T3. Components (RTL — smoke-level, not pixel-perfect)**

| ID | Case | Asserts |
|---|---|---|
| T3.1 | `CartDrawer` checkout modal | renders UPI/COD/Card options; disabled submit on empty form; calls `createOrder` mock on submit |
| T3.2 | `ProductDetail` | variant switch updates price/image; sold-out variant button disabled + aria-label; batch/artisan-hours only render when data present (regresses BUG-3) |
| T3.3 | `QuickViewModal`, `CartLineItem` | + increment disabled at max stock (regresses BUG-4 at component layer) |
| T3.4 | A11y spot checks | filter chips / size chips / swatches expose `aria-label` + `aria-pressed`/`aria-checked` (regresses BUG-8) |
| T3.5 | `Newsletter` | submit calls mock `subscribeNewsletter`; loading + error toast states (regresses BUG-2) |

**T4. Hooks (`src/hooks/`)**

| ID | Case | Asserts |
|---|---|---|
| T4.1 | `useCatalog` | wraps TanStack Query; loading/data/error states; mock fallback path |
| T4.2 | `useHorizontalRailGuard` | calls lenis `stop`/`start` at scroll edges (mock lenis instance) |

### Mocks & fixtures pattern

- Never hit the network in unit tests. Build a single `src/test/fixtures/catalog.ts`
  that loads `mock-products.json` and slices to 2 products / 4 variants per test.
- Mock `src/lib/supabase` at module boundary — stores and components must be testable
  without Supabase.
- Component tests get `QueryClientProvider` + `MemoryRouter` wrapper helpers in
  `src/test/helpers.tsx`.

---

## 2. Layer 2 — E2E (tester-army/e2e)

`e2e` runs natural-language-driven flows, then **replays recorded actions without
model calls** until the app changes — cheap on repeat runs. Web engine is Playwright
under the hood (Chromium/Firefox/WebKit).

### Setup (one-time)

```bash
npx e2e init          # choose web engine; write e2e.config.ts
npm i -D @e2e-dev/web # local browsers
```

**Model provider:** BYO key — the OpenRouter key already in Hermes secrets works; the
free-tier AIHubMix key is rate-limited (5 req/min) and risky inside test runs — avoid
unless replay mode covers everything.

In CI, prefer **replay-only mode** (no model calls) so GH Actions cost ₹0 and stays
deterministic; schedule one agent-mode run per week to relearn/catch app drift.

### Route → test-case map

| ID | Route | Natural-language goal | Deterministic assertion (locators) |
|---|---|---|---|
| T5.1 | `/` | Explore home end to end | MoodGateway + VibeGateway visible with counts; bestsellers rail scrolls horizontally; each rail edge stops (useHorizontalRailGuard) |
| T5.2 | `/shop` → filters | Filter by mood, then universe, then technique | grid count decreases per filter; combination ANDs; empty filter state shows empty-state CTA |
| T5.3 | `/product/:slug` | PDP journey | variant switch updates price + hero image; sold-out size has struck-through disabled chip; pincode checker shows estimate copy (BUG-7); JSON-LD present in `head` |
| T5.4 | PDP → `/shop` → cart | Add-to-cart → drawer | item appears with correct variant + price; increment clamps at max stock; sold-out variant cannot be added from PDP, QuickView, or drawer |
| T5.5 | Cart → checkout | Full mock checkout | UPI/COD/Card options render; order flow completes against mock `createOrder` (Supabase mock in dev); order confirmation state |
| T5.6 | Cart → customizer | Bespoke flow | CustomizerModal: monogram text + placement persist into cart line-item customization |
| T5.7 | `/universes/:slug` | Universe theming | `<html>` carries `data-universe="…"`; themed tokens differ per universe; neutral (no attribute) on cart/checkout zones (`data-u-zone` opt-in per `[[kb/universe-theming]]`) |
| T5.8 | `/men`, `/women` | Gender storefront | filtered grid; gender chips reflect active state |
| T5.9 | `/atelier`, `/atelier/:techniqueSlug` | Craft story | 9 technique cards; each technique routes to correct products (regresses BUG-1) |
| T5.10 | `/admin` | Catalog Studio | loads with Supabase env; variant matrix CRUD smoke; **auth: must be gated — no public data mutation without Supabase RLS (see Risk note)** |
| T5.11 | a11y & motion | global gates | keyboard traversal on PDP + drawer; `prefers-reduced-motion` collapses animations; touch targets ≥44 px |
| T5.12 | `/` → all 10 routes | route 200 + lazy chunk | each route loads without console errors (route code-splitting regression) |

### Mobile (later — separate `@e2e-dev/mobile` package)

iOS sim + Android emulator through agent-device, mirroring T5.4/T5.6 (cart + customizer
are the money flows). Defer until web E2E is stable — KMP rewrite may make this
obsolete, so don't over-invest.

### CI wiring (`@e2e-dev/github`)

- GH Actions on PR: unit tests (`vitest run`) always; E2E in replay mode against a
  `vite preview` build; results posted as PR comment.
- Weekly scheduled agent-mode run: full re-learn + drift report.

---

## 3. Risk register

| Risk | Mitigation |
|---|---|
| e2e agent runs burn model tokens on repeat | replay mode cached per test; only re-learn after UI changes |
| `/admin` is open in dev mock mode — an E2E run could write garbage to real Supabase | run E2E only against a throwaway Supabase project / local mock; never production creds in `VITE_SUPABASE_*` |
| GSAP/Lenis + jsdom flakiness | keep component tests to behavior assertions, not animation; mock `gsap`/`lenis` in setup |
| Big-bang test-writing stalls | ship T1.1–T1.4 first (pure functions, zero mocking); T2 next; components last |

---

## 4. First milestone (T-shippable in ~half a day)

1. Vitest installed + `data.ts` integrity gate (T1.1) — **this alone converts the
   parity audit from a manual checklist into a runnable test**.
2. `is_mock` guard TDD red-green (T1.4) + the code fix in `getProducts()`.
3. Cart store clamping tests (T2.1–T2.2).
4. e2e init + 3 smoke tests (T5.1, T5.4, T5.7).