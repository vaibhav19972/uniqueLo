---
version: 1
slug: "src-pages-home-tsx"
primary_target: "src/pages/Home.tsx"
related_targets: ["src/pages/Shop.tsx","src/pages/ProductDetail.tsx"]
---

# Home — `/`

Mode: Persuade. Surface type: the storefront's front door, judged by one number — does a tier-2/tier-3 Android buyer start shopping in under 15 seconds.

## Audience and job

India-first, mass-premium embroidered apparel. Entry ₹699, median ₹1,200–1,400, ceiling ₹3,000–4,000. The buyer arrives from Instagram or WhatsApp on a mid-range Android over 4G, mostly in daylight, often with a screenshot of a design in hand. They are not shopping for "luxury"; they are deciding whether ₹1,199 of their money buys real embroidery from a brand that will actually deliver. Three questions, in order: *what is this*, *can I afford the thing I like*, *do I trust them with COD*.

## Proof and content on hand

29 products, 197 variants across four universes (Animeverse, Heroverse, Itihaas, The Atelier) plus Edits (6 intent collections) and 9 craft techniques. Real garment photography in `public/images/products/`. Nothing needs inventing; the job is arrangement.

## Constraints

- Legal: no licensed marks anywhere in imagery or copy. (The shipped catalog currently shows a swoosh on two products — that gets surfaced, not hidden.)
- Performance: sub-2s LCP on mid-range Android over 4G. Motion confined to Home.
- Factual honesty: no fabricated scarcity, ratings, or review counts.
- WCAG AA on every surface, full `prefers-reduced-motion`.
- 44px touch targets; mobile is the primary design target, not the degraded one.

## Chosen direction

Replacement world: **The Loom Card**. The catalog is the product, so the product is the composition. A dense woven index of garments whose card carries the facts an Indian D2C buyer actually weighs — the real price, the technique that justifies it, and a genuine markdown where the catalogue records one — set in a way that reads as a fabric label rather than a discount sticker.

*(Revised 2026-11-02: the original line promised a strike-through and a % on every card. No variant in the catalogue carries `compare_at_price_cents`, so there is no honest markdown to print. Rather than invent one, the card shows the price and the technique, and `catalogMrp()` renders the strike-through and badge only on a variant that genuinely records a live reference price — which today is none of them.)* Warm unbleached cotton ground in daylight, near-black only where it earns attention. Universes are colour fields you enter, not skins you switch.

## Verdicts on the roll's challengers

- **Torn billboard (declolage)** — competitive. Strongest colour discipline of the five; wins on identification, loses on clarity (a torn-away surface fights price legibility, which is the one thing this buyer must not have to decode). **Kept discipline: layered ground + the honest full-bleed type block.**
- **Mezzotint** — declined. Subtract-from-black is beautiful and wrong for a daylight, price-transparent storefront. **Kept discipline: one plate of real dark for the craft moment, nothing else.**
- **Split-flap concourse** — declined. Live-updating rows imply logistics, not apparel; the per-character cascade is motion budget the Home cannot afford on a ₹15k phone. **Kept discipline: the ruled row as a legitimate way to show a list, which replaces the card grid in two places.**
- **Hand-drawn zine** — declined. Marker warmth would undercut craft credibility at ₹1,399 and reads as a startup explaining itself. **Kept discipline: nothing — its looseness is the failure mode.**
- **Paper automata** — declined. A procession of folds puts motion ahead of the catalog. **Kept discipline: one figure in motion at a time, which becomes the rule for the whole page.**
- **Cyclorama** — competitive. The horizon band is the correct idea for universes (a place you enter, not a colour you apply), and the named cue state solves the "colour is never the only signal" problem across four universes. **Kept discipline: horizon band + named, text-equivalent state.**

## Direction contract

THESIS. The catalog is the page. This surface refuses the category default it was already wearing — a dark, over-scaled campaign hero, three identical product grids, and editorial eyebrows over every heading — in favour of a woven index whose every row is a garment at a real price, with one craft moment allowed to interrupt it.

OWN-WORLD. Unbleached cotton ground (`#f4efe4`) and a deep indigo ink (`#141a2e`) instead of black; a single madder red (`#a4322a`) as the only saturated action colour; garment photography on paper, never on chrome. One condensed grotesque for display, the existing Geist for reading, Geist Mono reserved for prices. Hairline loomed rules (1px, warm) do all the separating work — no resting shadows, no rounded card corners outside the cart. Card = photograph, price line, thread detail; nothing else.

STORY. *This is what the brand sells, here is what it costs, here is the one garment that proves the craft, here are the worlds you can enter, here is how to trust us.* In that order, and the buyer is in the shop by the third band.

FIRST VIEWPORT. Full-bleed cotton ground. Left column, 45%: the brand line set large in condensed caps ("HAND-EMBROIDERED IN INDIA"), one sentence at reading size naming the price band and the craft, and one primary action. Right column, 55%: a single hero garment shown whole, on the cotton ground, with its label — garment name, ₹ price, technique — as a real fabric label at its lower edge. No carousel, no dots, no dark scrim, no overlaid marketing headline, no caption claiming a crop or a treatment the asset does not have.

*(Revised 2026-11-02, twice. The original line promised the garment "cropped to show the embroidery relief, sitting directly on the ground". The catalogue's only hero-scale photographs are 420×530 product shots taken against a cool studio backdrop — cropping into one would show the backdrop's noise instead of the thread, and there is no macro or cut-out asset in the repository. The "sitting directly on the ground" claim is therefore withdrawn rather than half-kept: the plate is `contain` inside its own panel, and the panel is the cotton ground so the letterbox is invisible, but the photograph's own backdrop is still in the frame. Producing a relief crop or a backdropless cut-out is the asset task that restores the original line; until then the contract says what the render does. See `src/lib/imagery.ts` for the same rule applied to plates.)*

FORM. Grounded candidate 6 of 7 on my ordered list — the catalog-as-composition world, chosen over the campaign-image world (1) and the universe-first world (2). Seed key `e6f1ca0d`.

FINISH. unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
