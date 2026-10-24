# UniqueLo Documentation Architecture

> **Master Index & Process Guidelines**
> Technical documentation, design systems, and execution blueprints for
> **UniqueLo** — an India-first, mass-premium embroidered apparel brand.

---

## 1. Project North Star

All documentation and technical work in this repository is governed by our primary vision document:
👉 **[STAR_GOAL.md](../STAR_GOAL.md)** — *North Star: pricing band, buyer tiers, ordered priorities, and engineering quality standards.*

Before making architectural, design, pricing, or algorithmic decisions, every
engineer and AI agent must review `STAR_GOAL.md`.

**Read it for the constraints, not the adjectives.** The revised version (2026-10-24)
replaced the original quiet-luxury framing, which had produced a catalog floor of
₹1,799 against a confirmed entry price of ₹699. The confirmed numbers:

| Constraint | Value |
|---|---|
| Entry | ₹699 |
| **Median** | **₹1,200–1,400** |
| Ceiling | ₹3,000–4,000 |
| Market | India, tiers 1–3 |

If a doc, mock or component implies a higher price band than that, the doc is
wrong — fix it in the same change.

**Also read, in order:** [`09/00 — Positioning reframe`](./09-reference-redesign-from-competitors/00-positioning-reframe.md)
(why the pivot happened, with measurements) and [`09/06 — Capture → schema
workflow`](./09-reference-redesign-from-competitors/06-capture-to-schema-workflow.md)
(how competitor screenshots become our schema).

---

## 2. Documentation Directory Map

| Section | Focus | Purpose |
| :--- | :--- | :--- |
| **[01 — Stack & Architecture](./01-stack-and-architecture/README.md)** | Technical Stack & Structure | Pinned dependencies (Vite 6, React 19, TS, Tailwind v4), folder hierarchy, decoupling rules, and headless upgrade paths. |
| **[02 — Design System](./02-design-system/README.md)** | "Mass-Premium Craft" | Color tokens, two shipping themes (`USE_THEME_V2`: sans-led D2C vs. v1 atelier halo), 8pt spacing grid, accessibility standards. |
| **[03 — Data Contracts](./03-data-contracts/README.md)** | Schemas & Data Layer | Pure data-access contracts (`src/lib/data.ts`), embroidery craft metadata, pricing in cents, and cart types. |
| **[04 — Motion System](./04-motion-system/README.md)** | Cinema-Grade Choreography | Lenis inertia scroll, GSAP ScrollTrigger pinning, Framer Motion UI transitions, and strict reduced-motion rules. |
| **[05 — Build Phases](./05-phases/README.md)** | Phase-Gated Execution | Atomic task cards (P0 through P9), acceptance criteria, build-verification checkpoints. Updated brand experience plan at `.hermes/plans/2026-10-07_133000-design-plan-v2.md`. |
| **[06 — Assets & Placeholders](./06-assets-and-placeholders/README.md)** | Visual Asset Pipeline | Tonal color block placeholders, aspect ratio rules, asset registry, and photography transition strategy. |
| **[07 — Backend & Admin](./07-backend/README.md)** | Supabase + Admin Studio | Slug-keyed Postgres schema + RLS (`schema.sql`), Vercel SPA deploy, the `/admin` Supabase Product Catalog Studio (variant matrix, SQL/JSON generators, `product-images` storage uploads), and the `data.ts` async migration seam. (Strapi plan superseded — see doc.) |
| **[08 — Universe Build](./08-universe-build/README.md)** | Themed-Universe Pre-Build Bible | Universes × vibes vision, navigation/IA, data-model deltas, theming tokens, page specs, commerce flow, image pipeline, SEO/a11y/perf gates, phase cards. Nothing builds until this section agrees. |
| **[09 — Reference Redesign](./09-reference-redesign-from-competitors/README.md)** | Competitor-Inspired Redesign Dock | The Souled Store teardown, article-presentation analysis, pick-and-place decisions, phased implementation roadmap. |
| **[10 — Testing](./10-testing/README.md)** | Test Strategy | Layer 1: Vitest + RTL unit/integration cases (data spine, stores, components) · Layer 2: [tester-army/e2e](https://github.com/tester-army/e2e) agent-driven E2E flows with replay caching + CI wiring. Not yet implemented — plan as of 2026-10-12. |
| **[11 — Data Model](./11-data-model/README.md)** | Product schema truth & bloat audit | Measured audit of the 29-column product contract: five redundant axes, invented provenance fields, a 22-column universes table, and the nine fields the ₹699–3,999 business actually needs but does not have. Read before changing any field. |

**In-repo knowledge graph:** `kb/` — interlinked memory-graph pages over the current
codebase state (catalog spine, fallback gate, universe theming, taxonomy, cart flow,
route map, audit trail). Read `kb/index.md` first when orienting on how the code
*actually* works vs. how the docs say it should.

---

## 3. The Core Business Domain: Embroidered Fashion, ₹699–₹3,999

Unlike generic apparel retailers, UniqueLo focuses on **original embroidery**
(silk floss needlework, hand zardozi, botanical chain stitching, bespoke
monograms) sold to **India-first, mass-premium buyers** — median ₹1,200–1,400,
not luxury.

All developers and agents must adhere to these domain requirements:

1. **Craft proof within a mobile budget.** Two-layer inspection (model silhouette
   → macro embroidery detail) on PDP. On cards it is a hover/tap state, not a
   permanent second image — one hero per SKU at ~2000px, served responsively, not
   a 4K zoom engine on every card.
2. **Craft provenance.** Product metadata must expose stitch technique, thread
   material, and where honestly known artisan hours. Never fabricate scarcity.
3. **Honest commerce outranks aesthetics.** COD availability, a real delivery
   date and a stated return window are **required in the data contract** and
   above the fold on PDP. These do not exist today; adding them is a P0.
4. **Tactile colourways.** Swatches and themes reflect natural dyes and metallic
   threads (Indigo, Ecru, Terracotta, Gilt Zari).
5. **Bespoke personalisation ready.** Cart and data contracts support monogram
   and placement, and personalised items are non-returnable — the preview must
   therefore be accurate, not decorative.

---

## 4. Engineering Standards & Quality Checklist

Every contribution must satisfy the following non-negotiable rules:
* [ ] Zero TypeScript errors (`tsc --noEmit`).
* [ ] No hardcoded colors or magic numbers; all styles consume `src/styles/tokens.css`.
* [ ] All data is queried exclusively through `src/lib/data.ts` (never direct JSON imports in UI).
* [ ] All animations respect `prefers-reduced-motion` and animate only `transform` and `opacity`.
* [ ] Every phase concludes with a successful `npm run build`.
