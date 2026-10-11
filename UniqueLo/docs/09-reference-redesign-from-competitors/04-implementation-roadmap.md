# 04 — Implementation Roadmap (Reference Redesign)

> Phased build plan for adopting file-03 items. Phase gates follow
> `docs/05-phases` conventions: each task ships only with `tsc`, `vite build`,
> `oxlint` green + reduced-motion + 44px-target checks.

## Phase R1 — PDP trust uplift (1–2 sprints, frontend-only)

| # | Task | Touches | Acceptance |
|---|---|---|---|
| R1.1 | Back-in-stock `Join the dispatch` on sold-out sizes + toast + Supabase `restock_requests` insert | `ProductDetail.tsx`, `QuickViewModal.tsx`, `lib/data.ts` | Disabled pill becomes actionable; invalid email rejected; honest "small batch" copy; no fake "only X left" when qty unknown |
| R1.2 | Inline return/inspection summary under trust row | `ProductDetail.tsx` | One line, 14-day promise, no 30-day inflation |
| R1.3 | Share button (native share → copy-link → WhatsApp) | `ProductDetail.tsx` | Works without JS share API; copies absolute URL; line-icon, no emoji |
| R1.4 | Dual-unit size chart audit | `SizeGuideModal.tsx` | India + Intl + in/cm + garment-measured note present |
| R1.5 | Empty/404 recovery rail (4 archival pieces) | `NotFound.tsx`, `Shop.tsx` | Zero-result and 404 both show shoppable rail |

## Phase R2 — Set-selling & craft credit (2 sprints)

| # | Task | Touches | Acceptance |
|---|---|---|---|
| R2.1 | "Worn as a set" strip (same-universe 3-piece, add-set) | `ProductDetail.tsx`, `lib/data.ts` | Set total honest; per-piece stock clamped; universe link preserved |
| R2.2 | "Hands Behind This Piece" artisan strip → technique page | `ProductDetail.tsx`, `AtelierTechnique.tsx` | Cluster + technique + hours, no invented artisan names |
| R2.3 | Sticky mobile buy-bar audit (price + size + CTA) | `ProductDetail.tsx` | Bar appears only after buy-box scrolls out; 60fps; reduced-motion safe |

## Phase R3 — Retention, gated (needs backend + ops sign-off; NOT P0)

| # | Task | Depends on | Acceptance |
|---|---|---|---|
| R3.1 | Collector Circle proposal (early access + bespoke priority, no %OFF theatre) | Supabase tier/role, universe-drop calendar | Doc-first: pricing, perks, honest copy; no build until approved |
| R3.2 | Atelier tiers ledger (hours-collected → monogram credits) | Wallet tables, checkout hook | Capped redemption, 1pt=₹1 clarity, no dark patterns |
| R3.3 | Concierge channel (WhatsApp/post-purchase care) | Ops staffing | Footer-level only; never sticky banner |

## Non-goals (logged rejections)

Licensed IP capsules · site-wide %OFF stickers · app-cashback banners ·
pun-voice rewrite · fake urgency counters. Revisit only if positioning changes
in `PRODUCT.md` + `STAR_GOAL.md`.

## Verification checklist (per task)

- [ ] `npx tsc -b` · `npm run build` · `npx oxlint` — 0 errors
- [ ] Tokens only (`tokens.css`), no hard-coded hex; serif/sans roles intact
- [ ] `prefers-reduced-motion` respected; transform/opacity-only animation
- [ ] 44px targets; keyboard + screen-reader labels on new buttons
- [ ] Stock/review/price honesty: no fabricated counts (PRODUCT.md factual-honesty rule)
