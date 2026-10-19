---
title: Audit Trail
type: doc-map
updated: 2026-10-12
sources: [audit.md, docs/07-backend/README.md, docs/03-data-contracts/README.md]
links: ["[[is-mock-guard-gap]]", "[[cart-flow]]", "[[universe-theming]]"]
---

# Audit Trail

`audit.md` at repo root is the tracker. Timeline:

- **2026-10-07** — initial audit (BUG-1…8: technique mislabel, dead newsletter
  forms, fabricated provenance fallbacks, cart stock unbounded, placeholder
  provenance, stale meta, pincode copy, a11y gaps). All marked RESOLVED by then.
- **2026-10-09/10** — verification snapshot (build/lint/routes/parity counts).
  Production-ready headline.
- **2026-10-11** — docs↔code reconciliation (findings A–F fixed, docs-only) +
  mood/vibe taxonomy + universe theming pass. `is_mock` guard gap surfaced as the
  one code-level open item — see [[is-mock-guard-gap]] (cart-flow was fine — BUG-4
  fixed earlier).
- **2026-10-12 (this audit)** — full refresh:
  - Re-verified live: `tsc -b` + `vite build` 0 errors (build 2.38s),
    oxlint 0 issues in `src/` (warnings only in `.agents/`), all 10 routes 200
    (vite preview + curl), 14/73 + 13/45 counts, 13/13 seed slugs, 26/26 mock
    image paths resolve, schema tables present, `moods[]` 14/14 covered.
  - **Stale claim found:** audit.md BUG-2 says *both* Newsletter **and Footer**
    forms persist emails — Footer no longer has a newsletter form at all (links
    only; the form lives in `Newsletter.tsx` alone, grep + source read
    2026-10-12). Wording needs updating, not the code.
  - **Still open:** `[[is-mock-guard-gap]]` (code), contrast-gate automated
    re-run (docs/08 gate), mood gateway imagery.

## Watch

audit.md's green headline ("Production Ready") is a snapshot, not a guarantee —
each new verification pass should re-run the toolchain rather than trust the
headline. This KB entry is where that gets checked first.

## Changelog
- 2026-10-12 — 2026-10-12 audit results appended; Footer/BUG-2 drift recorded.