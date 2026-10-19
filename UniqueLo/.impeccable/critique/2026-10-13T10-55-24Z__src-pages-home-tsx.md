---
target: my website (homepage)
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/apple/MySpace/UniqueLo/src/pages/Home.tsx"
target_fingerprint: "sha256:d4a30bb466185064cfdd69901f9cb8892297f1003fc64cc73e4618c433621dfa"
target_path: /Users/apple/MySpace/UniqueLo/src/pages/Home.tsx
timestamp: 2026-10-13T10-55-24Z
slug: src-pages-home-tsx
---
Method: dual-agent (A: manual-design-review · B: detector-cli) — DEGRADED single-context fallback, see header
Target: src/pages/Home.tsx (UniqueLo homepage — 8-section Persuade surface)
Mode: Persuade

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Hero auto-rotates every 5.5s with no pause, progress, or aria-live; dots only |
| 2 | Match System / Real World | 2 | Universes / Edits / Atelier Bag / Atelier List jargon with no inline definition |
| 3 | User Control and Freedom | 2 | No carousel pause/stop; Escape exists but no undo, no filter clear on Home |
| 4 | Consistency and Standards | 3 | Strong tokens, but 3 tilt/glow portal personalities + price mismatch default vs current |
| 5 | Error Prevention | 2 | Newsletter no inline validation; empty search submits and navigates |
| 6 | Recognition Rather Than Recall | 2 | Icon-only header rail; Quick View hover-only; Edits cards no visible affordance |
| 7 | Flexibility and Efficiency | 2 | No shortcuts/bulk; search overlay desktop-only; rail arrows desktop-only |
| 8 | Aesthetic and Minimalist Design | 3 | Quiet-luxury base strong, but 5 identical MarketingHeaders + 11 trust claims |
| 9 | Error Recovery | 2 | Global toasts only, not near field; newsletter failure wipes context |
| 10 | Help and Documentation | 1 | Size Guide / Shipping / Returns / FAQs are dead spans; Account is toast stub |
| **Total** | | **21/40** | **Acceptable (50-52% band: significant improvements needed)** |

## Design Specificity Verdict

**LLM assessment**: Authored, not interchangeable — but diluted. The quiet-luxury atelier base (cream #f7f5f0, hairline stone, one-serif Playfair + Satoshi caps, earned-lift shadows, intensity meter, craft provenance) plus chameleonic `[data-universe]` theming and per-universe portal personalities (Animeverse torii lean -2deg sakura ring, Heroverse +1.5deg gold burst, Itihaas darbar sway) is genuinely UniqueLo. No generic SaaS could wear this unchanged. Missed opportunity: the same 6 tonal placeholder campaign images recycle across Hero, EditsGateway, CraftStory, UGCWall, Newsletter — the "worlds" read as one beige world. Five identical MarketingHeader blocks (gold eyebrow + display serif + italic sub + right link) flatten the hierarchy the system worked to earn. Stickers ("Sakura drop 桜", "New issue ★ POW", "Darbar festive ॥") fight quiet-luxury.

**Deterministic scan**: `impeccable detect --json src/components/home src/components/layout src/pages/Home.tsx` → 92 findings, all `design-system-font-size / advisory`. Breakdown: CartDrawer 17, UniversePortals 11, BestsellerCard 10, CraftStory 7, Footer 7, Header 7, others scattered. No errors, no blocking a11y/perf anti-patterns. These are type-ramp advisories (11px, 13px, 9px, 22px etc. off DESIGN.md's 4-step ramp) — largely false positives for a system that intentionally uses Satoshi caps micro-labels at 9-11px. Do not chase them blindly; the real type issue is hierarchy repetition, not ramp compliance. Target-only scan (`src/pages/Home.tsx`) was clean `[]` because Home is pure composition — evidence lives in children.

**Visual overlays**: No browser injection was performed in this run — no `[Human]` tab overlays exist. Reason: no browser automation tool exposed in this session, so live-server + detect.js injection was skipped. Fallback signal is code inspection + CLI scan above.

## Overall Impression

Gut: the atelier is beautiful, the bazaar is exhausting. One viewport (hero) asks 5 things at once; one page tells the trust story 3 times (TrustStrip 4-up, Bestsellers TRUST 3-up, Footer craft strip 4-up = 11 claims) and the section story 5 times (same header anatomy). Biggest opportunity: cut one full screen of repetition and the homepage goes from Acceptable to Good without a single new component.

## What's Working

1. **Two-layer world holds.** Neutral cream base + `[data-universe]` ambient scope (Layout.tsx removes attribute off-universe, checkout stays neutral) is the right architecture. Token-only theming, ink CTA vs gold CTA split, Champagne Rule (`text-gold-deep`, `text-on-gold`) show craft.
2. **Commerce ergonomics are honest.** BestsellerCard computes %OFF from catalog, clamps to in-stock sizes, defaults to first available, aria-pressed on sizes/wishlist, 44px targets, stock-clamped add with toasts. No fabricated scarcity in card logic.
3. **Motion intent is considered.** Earned-lift (border rest, shadow+translate together on hover), card-width rail stepping with snap-proximity, horizontal-rail guard handing vertical back to Lenis, Escape to close menus/search. Foundation for 60-120fps luxury is there.

## Priority Issues

### [P1] The same header 5 times + trust 3 times = no hierarchy
**What**: MarketingHeader (eyebrow/title/italic sub/right link) repeats for Edits, Universes, Craft, Bestsellers, UGC. TrustStrip + Bestsellers TRUST + Footer craft strip repeat embroidery/dyes/returns.
**Why it matters**: Cognitive load checklist fails 5/8 (single focus, hierarchy, one-thing-at-a-time, minimal choices, progressive disclosure) → high load. Users skim past the portals that actually sell universes.
**Fix**: Keep MarketingHeader for 2 sections max (Universes, Bestsellers). Demote others to compact rule + title. Merge 3 trust strips into 1 (keep TrustStrip under hero, delete Bestsellers TRUST, keep Footer strip only). Cut ~400px of beige reassurance.
**Suggested command**: /impeccable distill

### [P1] Hero carousel moves without permission
**What**: UniverseHero.tsx auto-advances every 5.5s via setInterval, effect deps include validIndex so timer resets irregularly, no pause/play, no swipe, no `prefersReducedMotion` check (Header has it, Hero doesn't), no aria-live/announcement.
**Why it matters**: Motion-sensitive users trapped; screen-reader users get silent context swaps; tabs + 2 CTAs + dots + badge = 6 competing actions in first viewport.
**Fix**: Add pause on hover/focus + explicit pause button, respect prefers-reduced-motion (static first slide), add aria-live polite + slide counter "1/3", make timer dep list.length only. Keyboard ArrowLeft/Right already exists — keep.
**Suggested command**: /impeccable audit

### [P1] Promises that go nowhere break luxury trust
**What**: Footer CARE_LINKS, COMPANY_LINKS, legal links are `<span>` dead ends. Socials link to `#atelier-list`. Wishlist toast says "Explore Collections page" but routes to /shop. UGCWall SAMPLE_STATS (10,000+, 4.8/5) and CraftStory artisan quote render as fact with disclosure only in code comments + alt text. Bestsellers TRUST says "Free shipping on all orders above ₹29,050" — likely threshold bug that reads as absurd.
**Why it matters**: Violates PRODUCT.md "Factual Honesty" + DESIGN.md "Don't fabricate". High-stakes moment (shipping/returns/social proof) with no recovery = P1 support ticket generator.
**Fix**: Convert dead spans to real routes or remove until P5; add visible "Sample stories" microcopy + wire aggregates or drop numbers; fix shipping threshold to real value; align toast copy to destination; point socials to real handles or remove circle stubs.
**Suggested command**: /impeccable harden

### [P2] Quick-buy is hover-only — touch users never see it
**What**: BestsellerCard.tsx Quick View capsule is `opacity-0 translate-y-2 pointer-events-none` until `group-hover`. On touch there's no hover, so size chips + Add to Cart are undiscoverable. Header search/account/wishlist/cart rail is `hidden md:flex`; mobile Search link drops the query and just goes to /shop. Rail arrows `hidden sm:flex`.
**Why it matters**: 60%+ fashion traffic is mobile (Casey). Primary action (size + add) requires PDP detour on phone = extra steps, lost conversion.
**Fix**: On coarse pointers render size + Add inline below info (or persistent "Quick add" button); keep hover capsule as enhancement. Enable mobile search overlay (reuse desktop form). Keep rail arrows hidden but ensure swipe hint + edge fade on mobile.
**Suggested command**: /impeccable adapt

## Persona Red Flags

**Jordan (First-Timer — anime tee buyer)**: Lands, sees "Universes / Edits / Atelier List / Atelier Bag" with no definitions. EditsGateway cards ("Everyday, Statement, Heritage…") reuse same beige images, counts show "0 Styles" for some edits — looks broken. Icon-only header (magnifier, person, heart, bag) has no text labels; first action not clear in 5s. Will hesitate at hero tabs (Anime/Heroes/History pipe-separated, gold underline only) and abandon to Shop without context.
**Casey (Distracted Mobile — one-thumb, 3G)**: Hero min-h 580px pushes CTAs below fold at 360px; primary Shop CTA + Our Craft CTA stacked but badge hidden (`hidden sm:flex`). Bestseller rail cards fixed 270px, Quick View unreachable, size selection requires precise taps on 32px-high chips (below 44px floor). Gets interrupted, returns — carousel has advanced twice, no state memory. Footer 30 links + 4 trust tiles = endless scroll past the buy.
**Riley (Stress Tester — edge pusher)**: Refreshes mid-carousel → index resets to 0, no deep-link to universe. Submits newsletter with "a@b" → native email validation only, no inline brand error; failure toast "Please try again" wipes email. Searches "" → navigates to /shop with empty query, no empty-state guidance. Opens product with 0 variants in an edit → count "0 Styles" card still clickable to filtered empty Shop. Adds sold-out size → toast only, no waitlist.

## Minor Observations

- Bestseller ribbon uses 🔥 emoji — violates "drawn SVGs only, no emoji icons" + Champagne-adjacent noise. Swap to drawn flame or drop.
- Price shown is `defaultVariant.priceCents` but Add uses `currentVariant.priceCents` — size-dependent pricing displays stale total in card footer.
- Footer `PAYMENTS` (UPI/VISA/MC/RuPay/AMEX/COD) as paper pills on coal is honest and well-resolved — keep pattern.
- AnnouncementBar + hide-on-scroll header (`-translate-y-full` past 100px) is smooth, but hides cart/search at the moment of decision on long pages.
- Detector font-size advisories (92×) are noise — DESIGN.md ramp needs 9-15px micro-label steps added rather than 92 edits.
- All imagery `loading=lazy` except hero first slide eager — correct; but 6 campaign JPGs recycled 14× across sections reads as placeholder loop. One real shoot beats any token tweak.

## Questions to Consider

- What if the homepage had one trust strip instead of three — which single proof would you keep?
- Does "Edits" need to be shoppable taxonomy on Home, or could it live only in Shop filters until counts are non-zero?
- What would a confident hero look like if it never auto-rotated — which universe earns the first static frame?
