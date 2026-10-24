# 00 — Positioning Reframe: India-First Mass-Premium

> **Status: RESOLVED 2026-10-24.** The price band is now confirmed by the owner:
> **₹600–700 entry, ₹1,200–1,400 median, ₹3,000–4,000 ceiling.** §5's lead
> question is answered — read §5 first, then `STAR_GOAL.md` which now carries the
> corrected ladder. This file is retained as the record of *why* the pivot
> happened, not as an open question.

> **Read this before 01–05.** The competitor dock was opened assuming a
> quiet-luxury atelier. Measurement of the shipped catalog falsified that
> assumption. This file records the correction and re-scopes what competitor
> study is *for*.

## 1. What the code actually says

Measured from `src/data/mock-products.json` (13 products, 121 priced variants),
2026-10-24:

| Metric | Value |
|---|---|
| Price range | **₹1,799 – ₹5,499** |
| Median variant | **₹3,999** |
| Variants ₹4,000+ | 56 / 121 (46%) |
| Variants ₹1,500–1,999 | 5 / 121 (4%) |
| Variants **below ₹1,500** | **0** |
| Universe coverage | 9 products / 3 universes; 4 Atelier with no universe |
| Empty-price products | 4 (data gap, see §5) |

Owner's stated target band: **₹500 – ₹3,000**, with the bulk at ₹1,000–₹3,000.

**This is a 2–4× gap at every percentile.** Nothing in the catalog sits in the
₹500–1,500 zone where the owner says the business actually lives. There is no
product to sell a price-sensitive, tier-2/3 shopper today.

## 2. Why the gap exists

The stack was specified from the wrong reference set. `STAR_GOAL.md` names
*Bottega Veneta, Bode, Story mfg., SSENSE* and sets luxury KPIs (Lighthouse 98+,
120 FPS, macro stitch inspector). `docs/02` names *Aesop and Bottega Veneta*.
Those references produce:

- heavy-weight fabrics and real embroidery ⇒ high COGS ⇒ ₹3,500+ floor
- a `Playfair Display` serif editorial system ⇒ reads "boutique", not "value"
- generous negative space and one-accent restraint ⇒ slow, sparse PLPs
- **zero** device for the mechanics that actually convert in Indian D2C:
  coupon stacking, COD confidence, delivery-date promises, easy returns,
  size guidance at the tier-3 long tail

A ₹2,499 embroidered tee and a ₹499 tee are not the same business. The catalog
was built for the first; the owner is describing the second.

## 3. The buyer we are actually building for

India-first, mass-premium, three concurrent tiers:

| Tier | Cities | Price sensitivity | What wins the order |
|---|---|---|---|
| **Metro** | Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune, Chennai | Low–moderate | Design originality, fit, brand story, fast delivery |
| **Tier-2** | Jaipur, Indore, Lucknow, Chandigarh, Kochi, Coimbatore | Moderate | Reviews, COD, returns policy, festival/gifting framing |
| **Tier-3 / small town** | Rest of India | High | **Trust**, price clarity, COD, WhatsApp/UPI, delivery certainty |

Across all three, the non-negotiable trust surfaces are the same and they are
**not** in the current build: COD availability, a stated return window, a real
delivery date (not "5–7 days"), size help that assumes no measuring tape, and
support that answers on WhatsApp.

> **Design consequence:** restraint is affordable only after trust is established.
> A quiet page with no COD badge, no delivery date and no review count reads as
> *risky* to a tier-3 first-time buyer, not premium. Luxury minimalism is a
> conversion tax at this price point.

## 4. Revised design position

Keep the craft narrative — it is the real differentiator and it survives any
price band. Drop the luxury vocabulary.

| Dimension | Old (as built) | Reframed (India-first mass-premium) |
|---|---|---|
| Reference set | Bottega, Bode, SSENSE, Aesop | Nykaa Fashion (scale/discovery), Myntra (PLP/filters), Bewakoof/The Souled Store (price-band trust), Suta/Péro (craft story), The Pant Project (fit confidence) |
| Type | Playfair serif-dominant | Sans-dominant, one serif display accent — matches `USE_THEME_V2` streetwear theme already in the codebase |
| Density | Sparse, one accent/viewport | Denser PLP: 2-up mobile grid, price + rating on card, filter chips always visible |
| Price display | Editorial, understated | Explicit MRP + selling price + % off, honest compare-at only |
| Motion | Lenis + GSAP scrubbed parallax | Keep for Home only; PLP/PDP must be instant. Motion is a Home-page luxury, not a browsing cost |
| Trust | Assumed | Explicit: COD badge, return window, delivery date, review count, WhatsApp support |

`STAR_GOAL.md` and `docs/02` have been rewritten to match as of 2026-10-24 —
`STAR_GOAL.md` now carries the confirmed ₹600–1,400 median band and the corrected
ladder; `docs/02` opens with the mass-premium direction. Both keep the craft
narrative and drop the luxury posture.

## 5. Data gaps — and the one now resolved

**Resolved 2026-10-24 (owner):** the target band is **₹600–700 entry,
₹1,200–1,400 median, ₹3,000–4,000 ceiling**. The catalog's ₹1,799 floor is
therefore wrong by design intent, not just by accident. `STAR_GOAL.md` now
carries the corrected 13-SKU ladder (median ₹1,399, 54% of SKUs in ₹600–1,400).

Still open:

1. **COGS and margin.** Nothing in the repo. The ladder is a pricing intention,
   not a validated margin model. If ₹699 cannot carry real embroidery, the entry
   tier must be a **different garment** (print-on-demand, minimal stitch,
   accessory) — not a cheaper cut of the same piece. This is the single biggest
   unknown: it decides whether the entry tier is a manufacturing change or a
   pricing change.
2. **Tier mix.** "India-first" is a position, not yet a segmentation. No city
   targets, no tier-2/3 share, no AOV goal.
3. **Return rate.** The most dangerous unknown at this band — A 30% return rate on
   embroidered apparel destroys a ₹1,399 unit's margin, and personalised pieces
   are non-returnable by nature.
4. **Universe coverage is thin.** 8 products across 3 universes
   (animeverse 3, heroverse 3, itihaas 2); 5 Atelier products carry no
   `universeSlug` at all. Any universe-level discovery study is under-sampled.
5. **Intensity must be repriced, not just re-sorted.** Measured floor by
   intensity in the *current* catalog:

   | Intensity | n | Floor | Ceiling |
   |---|---|---|---|
   | quiet | 5 | ₹1,799 | ₹3,999 |
   | balanced | 4 | ₹1,999 | ₹4,699 |
   | **loud** | 4 | **₹3,499** | ₹5,499 |

   Nothing expressive exists below ₹3,499 today. The corrected ladder puts `loud`
   at **₹1,399**. That is the hardest single change in the catalog, because
   embroidery density is what the price is made of — a ₹1,399 loud piece needs a
   design decision (smaller placement, coarser motif, lighter yarn), not just a
   price edit.

## 6. What competitor study is now for

Not "make our app look like theirs." The instrument changes with the question:

| Question type | Right instrument | `rea` worth it? |
|---|---|---|
| IA, page anatomy, checkout order, filter model | Screenshots + walkthrough | No |
| Micro-copy, trust badges, delivery promise wording | Screenshots | No |
| **Discovery/search/filter state at 10k+ SKU scale** | Decompile or network analysis | **Yes** |
| Cart/checkout edge cases (coupon stacking, COD gating) | Decompile or intercepted traffic | **Yes** |
| Pricing display logic, tiered discount rules | Decompile | **Yes** |
| Visual/design language | **Screenshots only** | Never |

Screenshots answer structure and schema questions. Binaries answer *logic*
questions. Using a decompiler for design is expensive and yields almost nothing —
especially on iOS, where SwiftUI leaves no layout data in the binary.

## 7. Revised competitor roster

| Competitor | Study for | Tier cue | Not for |
|---|---|---|---|
| **Nykaa Fashion** | Catalogue scale, filters, brand aggregation, returns UX | Metro + tier-2 | Aesthetic |
| **Myntra** | PLP density, filter/sort model, size guidance, EOSS mechanics | All tiers | Aesthetic |
| **The Souled Store** | Price-band trust, fandom positioning, membership | All tiers | Aesthetic *(already docked as 01)* |
| **Bewakoof** | ₹499–999 entry tier, COD-first checkout, UGC | Tier-2/3 | Aesthetic |
| **Suta** | Craft story at accessible price — the closest true analogue | Metro + tier-2 | Scale mechanics |
| **Péro / Doodlage** | Craft narrative, sustainability framing | Metro | Price band |
| **The Pant Project** | Fit confidence, size guidance, returns | Metro | Craft |
| **Nike / Nykaa app** (owner-named) | Drop mechanics, membership, retention loops | — | Design, price band |

Nike is retained only for **drop/membership mechanics** — its design language and
price band are both wrong for this business. It is a logic reference, never a
visual one.

## 8. Recommended sequence

1. Fix the 5 unpriced products and settle the entry-tier question (§5.1–5.2).
2. Amend `STAR_GOAL.md` + `docs/02` to the mass-premium position, or explicitly
   decide to keep two product lines (Atelier luxury + entry tier).
3. Screenshot-led teardowns for Myntra, Nykaa Fashion, Bewakoof, Suta —
   structure and trust surfaces only. One file each, `05-…` onward.
4. Reserve `rea` for the four logic questions in §6 that screenshots cannot
   answer. One case per question, not one case per app.
