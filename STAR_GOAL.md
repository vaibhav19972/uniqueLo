# UniqueLo — North Star

> **Status:** authoritative. Supersedes all earlier versions of this file.
> Revised 2026-10-24 to replace the original quiet-luxury framing, which was
> built on initial assumptions rather than confirmed constraints.
>
> **Priorities are ordered. Where two goals conflict, the lower number wins.**

---

## 0. What this document is for

Every agent and engineer reads this before making a design, pricing or
architecture decision. When this file and any other doc disagree, **this file
wins** — then fix the other doc in the same change.

### What changed, and why

The original version positioned UniqueLo against Bottega Veneta, Bode and SSENSE
and set targets (Lighthouse 98+, 120 FPS, macro-stitch inspection on every card)
appropriate to a luxury house. That framing produced a catalog floor of ₹1,799
and a median variant price of ₹3,999 — roughly **2–4× above the actual
business**.

The reference set was aspirational, not operational. It has been replaced. The
craft narrative survives; the luxury posture does not.

---

## 1. The business

**UniqueLo sells original embroidered apparel to India-first, mass-premium
buyers.** Not luxury. Not fast fashion. The band where craft is affordable enough
to be worn and expensive enough to be worth keeping.

| Constraint | Value | Status |
|---|---|---|
| Entry price | **₹699** | confirmed |
| Median price | **₹1,200–1,400** | confirmed |
| Ceiling | **₹3,000–4,000** | confirmed |
| Primary market | India | confirmed |
| Buyer | Tier 1, 2 and 3 | confirmed |
| Differentiator | Original embroidery + original universe storytelling | confirmed |
| Legal constraint | No unlicensed IP — inspired-by only | confirmed |

### The price ladder this implies

13 SKUs. This is the target shape of the catalog, not a wish list:

| Band | SKUs | Share | Role |
|---|---|---|---|
| ₹600–899 | 3 | 23% | Entry. First order, gifting, trial. |
| ₹900–1,399 | 4 | 31% | **Core. Where the median lives and most volume must come from.** |
| ₹1,400–1,999 | 2 | 15% | Step-up. Repeat buyer. |
| ₹2,000–2,999 | 2 | 15% | Premium. Statement pieces. |
| ₹3,000–4,000 | 2 | 15% | Halo. Craft showcase, low volume, brand credibility. |

Median across the ladder: **₹1,399**. 54% of SKUs sit inside ₹600–1,400.

> **The rule that matters most:** expression must exist at every price.
> `loud` (full-panel artwork) starts at **₹1,399**, not ₹3,499. A ₹699 tee with a
> quiet tonal crest and a ₹1,399 tee with full universe artwork are the same
> customer at different moments. If expression is only affordable at ₹3,500, the
> brand's whole pitch is priced away from the median buyer.

### What is *not* confirmed

Recorded honestly so no agent treats these as settled:

- **COGS and margin.** Nothing in the repo. The ladder above is a pricing
  intention, not a validated margin model. If ₹699 cannot carry real embroidery,
  the entry tier must be a genuinely different garment (print-on-demand, minimal
  stitch, accessory), not a cheaper cut of the same piece.
- **Tier mix.** "India-first" is a position, not yet a segmentation. No city
  targets, no tier-2/3 share, no AOV goal.
- **Return rate.** The most dangerous unknown at this price band. A 30% return
  rate on embroidered apparel destroys a ₹1,399 unit's margin.
- **Discount dependence.** Whether this business can hold price, or whether the
  Indian D2C market forces perpetual 40%-off framing. This decision changes the
  entire design.

---

## 2. The buyer

Three tiers, one checkout. They differ in what stops them, not in what they want.

| | Tier 1 — Metro | Tier 2 — Large town | Tier 3 — Everywhere else |
|---|---|---|---|
| **Cities** | Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune, Chennai | Jaipur, Indore, Lucknow, Chandigarh, Kochi, Coimbatore | Rest of India |
| **Price sensitivity** | Moderate | Moderate–high | High |
| **Wins the order** | Originality, fit, story, speed | Reviews, COD, returns | **Trust**, price clarity, COD, delivery certainty |
| **Kills the order** | Slow site, bad photography | No reviews, no COD | Prepaid-only, no return policy, vague delivery |
| **Device** | iPhone-heavy | Mixed | **Android, mid-range, 4G** |

### What this means for engineering

Tier 3 is the margin. It is also the tier that runs on a ₹15,000 Android phone on
patchy 4G. **A site that is beautiful on an M-series Mac and slow on that phone
has optimised for the wrong user.** Mobile Android performance is a P0
constraint, not a polish item.

The universal first-order blockers — **COD availability, a real delivery date, a
stated return window, visible review counts, WhatsApp support** — are absent from
the current build's data contract entirely. They outrank every visual decision.

---

## 3. Priorities

Ordered. When two conflict, the lower number wins.

1. **Trust before beauty.** A first-time tier-3 buyer must never wonder: is this
   real, will it come, can I return it, can I pay on delivery.
2. **Mobile Android performance.** Sub-2s LCP on a mid-range Android over 4G.
   The cleverest GSAP work is worthless if the PLP takes 6s to paint.
3. **Price clarity.** MRP, selling price, and honest compare-at on the card.
   Never a fabricated discount, never a countdown timer.
4. **Craft as the reason to pay.** The embroidery story justifies ₹1,399 over
   ₹799. It is the margin.
5. **Original universe storytelling.** The brand's emotional hook and what makes
   it not-a-generic-tee-site.
6. **Editorial polish.** Real, but last. A gorgeous site nobody trusts sells
   nothing.

---

## 4. Experience pillars

### Pillar 1 — Craft you can see (revised)

Embroidery is what justifies the price, so the product must prove it visually —
but **within a mobile performance budget**, not as a desktop showpiece.

- Two-state card: silhouette on model → macro embroidery detail on interaction.
- Macro zoom with a **capped budget**: one hero image per SKU at ~2000px, served
  responsively. Not a 4K pan-and-zoom engine on every card.
- Craft provenance on PDP (`fabricGsm`, `craftCluster`, `handcrafted` are already
  in the catalog and already rendered — keep and sharpen).
- `prefers-reduced-motion` is a hard requirement, not an enhancement.

### Pillar 2 — Personalisation that must pay for itself (revised)

Monogramming is a **margin tool**, not a toy. Each personalised order carries a
premium and is inherently non-returnable.

- Placement, thread colourway, motif.
- Live preview must be genuinely WYSIWYG — a preview that doesn't match the
  delivered stitch is a return, and returns are fatal at this band.
- Gate: only ship this when the preview can be trusted.

### Pillar 3 — Honest commerce (new — highest priority)

The trust surface that decides whether a tier-3 buyer completes at all.

- COD availability, stated on the PDP above the fold.
- A **real delivery date**, not "5–7 days".
- A stated return/exchange window with plain conditions.
- Visible review counts (the fields exist: `rating`, `reviewCount`, `soldCount`).
- WhatsApp support, not a contact form.
- Size guidance that assumes no tape measure.

### Pillar 4 — Universe storytelling

Animeverse, Heroverse, Itihaas, plus the neutral Atelier door. Data-driven and
extensible. Original artwork and atmospheres, **never unlicensed IP** — this is a
legal constraint as much as a brand one.

Note: 8 of 13 current products sit in a universe; 5 carry none. The Atelier door
is under-built relative to its share of the catalog.

### Pillar 5 — Fandom as a reason to buy

The intensity taxonomy (Quiet / Balanced / Loud) is the mechanism by which one
customer buys a ₹699 quiet tee today and a ₹1,399 loud one next month. It only
works if every intensity exists at an affordable price. Today it does not.

---

## 5. Removed from the goals

Explicitly retired, so they stop driving decisions:

| Retired | Why |
|---|---|
| Lighthouse 98–100 across all four categories | Vanity target. A 92 with fast LCP and working COD outsells a 100 nobody trusts. **Keep** the performance intent, drop the score. |
| CLS 0.000, INP <50ms, 120 FPS | Measurements from a luxury brief. Replaced by "sub-2s LCP on mid-range Android / 4G". |
| Aesop, Bottega, Bode, SSENSE as design references | Wrong price band and wrong market. |
| Playfair Display as the dominant typeface | Reads boutique-at-₹4,000. The `USE_THEME_V2` sans-led theme is the closer fit. |
| One accent per viewport / extreme whitespace | Restraint reads as *risky* to a tier-3 first-time buyer, not premium. |
| Lenis + GSAP scrubbed parallax as a site-wide system | Home page only. PLP and PDP must be instant. Motion is a luxury on the landing page, a tax on browsing. |

---

## 6. Non-negotiables

1. **No fabricated urgency.** No countdowns, no fake "only 2 left", no invented
   review counts. Stock, reviews and craft specs are truthful or absent.
2. **No unlicensed IP.** Inspired-by aesthetics only. No franchise marks, logos
   or protected characters.
3. **Prices in integer paise/cents.** Zero floating-point money.
4. **All data via `src/lib/data.ts`.** No component reads JSON directly.
5. **Every commit builds clean.** `npm run build` with zero type errors.
6. **No hardcoded design values.** Tokens only, via `src/styles/tokens.css`.

---

## 7. Honest state of the build

| Area | State |
|---|---|
| Web storefront | Built. React 19 + Vite + TS + Tailwind v4, 13 SKUs / 121 variants. |
| Backend | Supabase live — orders, newsletter, admin catalogue, RLS locked to authenticated admin. |
| Mobile | KMP Compose, Phase 3 design-complete, 47 tests, iOS target green. |
| Catalog price band | **Misaligned.** Currently ₹1,799–5,499, median ₹3,999. Target is ₹699–3,999, median ₹1,200–1,400. |
| Trust surfaces | **Missing.** No COD, delivery date, or return window in the contract. |
| Entry tier | **Missing.** No SKU below ₹1,799. |
| Photography | Placeholder tonal blocks. Not shot. |
| Payments | Undecided. |
| Test coverage | Layer 1 (Vitest+RTL) and Layer 2 (E2E) both unimplemented. |

The gap between "what is built" and "what this document says" is concentrated in
**pricing and trust**, not in code quality. The codebase is in good shape; the
catalog and the trust layer are the work.

---

## 8. What success looks like

Not a Lighthouse score. These:

- A tier-3 first-time buyer completes a COD order without hesitation.
- The median product sells at ₹1,399 and the customer does not feel overcharged.
- Returns stay low enough that a ₹1,399 unit is profitable.
- The embroidery is visibly the reason the price is what it is.
- The site is fast on a mid-range Android on 4G.

Everything else is in service of those five.
