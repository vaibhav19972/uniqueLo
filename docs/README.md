# UniqueLo Documentation Architecture

> **Master Index & Process Guidelines**  
> Technical documentation, design systems, and execution blueprints for **UniqueLo** — the state-of-the-art digital flagship for luxury embroidered apparel.

---

## 1. Project North Star

All documentation and technical work in this repository is governed by our primary vision document:
👉 **[STAR_GOAL.md](../STAR_GOAL.md)** — *North Star Vision, Competitive Benchmarking, and Engineering Quality Standards.*

Before making architectural, design, or algorithmic decisions, every engineer and AI agent must review `STAR_GOAL.md` to ensure alignment with our standard of craftsmanship.

---

## 2. Documentation Directory Map

| Section | Focus | Purpose |
| :--- | :--- | :--- |
| **[01 — Stack & Architecture](./01-stack-and-architecture/README.md)** | Technical Stack & Structure | Pinned dependencies (Vite 6, React 19, TS, Tailwind v4), folder hierarchy, decoupling rules, and headless upgrade paths. |
| **[02 — Design System](./02-design-system/README.md)** | "Refined Editorial Minimal" | Color tokens, typography scale (Satoshi × Melodrama), surface hierarchy, 8pt spacing grid, and accessibility standards. |
| **[03 — Data Contracts](./03-data-contracts/README.md)** | Schemas & Data Layer | Pure data-access contracts (`src/lib/data.ts`), embroidery craft metadata, pricing in cents, and cart types. |
| **[04 — Motion System](./04-motion-system/README.md)** | Cinema-Grade Choreography | Lenis inertia scroll, GSAP ScrollTrigger pinning, Framer Motion UI transitions, and strict reduced-motion rules. |
| **[05 — Build Phases](./05-phases/README.md)** | Phase-Gated Execution | Atomic task cards (P0 through P9), acceptance criteria, build-verification checkpoints. Updated brand experience plan at `.hermes/plans/2026-10-07_133000-design-plan-v2.md`. |
| **[06 — Assets & Placeholders](./06-assets-and-placeholders/README.md)** | Visual Asset Pipeline | Tonal color block placeholders, aspect ratio rules, asset registry, and photography transition strategy. |
| **[07 — Backend & Admin](./07-backend/README.md)** | Strapi v5 & Admin Roles | Content types mirroring `data.ts` (Product/Variant/Category/Article/CraftTechnique), Editor role (articles + prices), product upload with craft/region fields, inventory per variant, and the `data.ts` async migration seam. |

---

## 3. The Core Business Domain: Embroidered Fashion

Unlike generic apparel retailers, UniqueLo focuses on **high-craft embroidered clothing** (silk floss needlework, hand zardozi, botanical chain stitching, and bespoke monograms). 

All developers and agents must adhere to these domain requirements:
1. **Macro Stitch Inspection:** Every product card and presentation must support two-layer inspection (model silhouette on default, macro embroidery detail on hover/interaction).
2. **Craft Provenance:** Product metadata must expose stitch technique, artisan hours, and thread material.
3. **Tactile Colorways:** Swatches and themes reflect natural dyes and metallic threads (Indigo, Ecru, Terracotta, Gilt Zari).
4. **Bespoke Personalization Ready:** Cart and data contracts support custom monogramming and placement configurations.

---

## 4. Engineering Standards & Quality Checklist

Every contribution must satisfy the following non-negotiable rules:
* [ ] Zero TypeScript errors (`tsc --noEmit`).
* [ ] No hardcoded colors or magic numbers; all styles consume `src/styles/tokens.css`.
* [ ] All data is queried exclusively through `src/lib/data.ts` (never direct JSON imports in UI).
* [ ] All animations respect `prefers-reduced-motion` and animate only `transform` and `opacity`.
* [ ] Every phase concludes with a successful `npm run build`.
