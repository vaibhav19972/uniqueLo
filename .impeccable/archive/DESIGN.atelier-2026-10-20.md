---
name: UniqueLo
description: "Where haute couture meets cult aesthetics — quiet-luxury atelier base with chameleonic themed micro-stores."
colors:
  canvas-cream: "#f7f5f0"
  card-paper: "#ffffff"
  ink-obsidian: "#141414"
  ink-muted-warm: "#686560"
  hairline-stone: "#e5e1d8"
  placeholder-warm-gray: "#9e9b94"
  accent-terracotta: "#d95d39"
  accent-terracotta-hover: "#b84624"
  saffron-marigold: "#e69526"
  bullion-gold: "#cba043"
  botanical-pistachio: "#315e45"
  midnight-indigo: "#1c2b3d"
  silk-blush: "#fbf1ec"
  parchment: "#faf8f5"
  signal-error: "#c9372d"
  signal-success: "#2f6b3a"
  anime-deep: "#7a1f23"
  hero-crimson: "#c0392b"
  itihaas-bronze: "#5d3a1a"
  champagne: "#d4af37"
  ivory: "#f6efe3"
  coal-glass: "#201c18"
  stone-deep: "#ded8cf"
typography:
  display:
    fontFamily: "'Playfair Display', 'Melodrama', Georgia, serif"
    fontSize: "clamp(3.5rem, 7.5vw, 8.75rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  section-title:
    fontFamily: "'Playfair Display', 'Melodrama', Georgia, serif"
    fontSize: "clamp(2.75rem, 5vw, 4.5rem)"
    fontWeight: 500
  body:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.7
  label:
    fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif"
    fontSize: "0.75rem"
    textTransform: "uppercase"
    letterSpacing: "0.22em"
    fontWeight: 500
rounded:
  none: "0"
  subtle: "2px"
  standard: "4px"
  soft: "8px"
  card: "16px"
  portal: "20px"
  pill: "9999px"
spacing:
  section: "8rem"
  component: "1.5rem"
  tight: "0.5rem"
components:
  button-primary:
    backgroundColor: "{colors.ink-obsidian}"
    textColor: "{colors.card-paper}"
    rounded: "{rounded.standard}"
    padding: "12px 28px"
  button-ghost:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.ink-obsidian}"
    rounded: "{rounded.standard}"
    padding: "12px 28px"
  chip-filter:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.ink-obsidian}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  card-product:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.ink-obsidian}"
    rounded: "{rounded.subtle}"
  universe-gold-cta:
    backgroundColor: "{colors.bullion-gold}"
    textColor: "{colors.canvas-cream}"
    rounded: "{rounded.standard}"
    padding: "12px 28px"
---

# Design System: UniqueLo

## Overview

**Creative North Star: "The Quiet-Luxury Atelier"** — unified quiet-luxury editorial house matching "The Atelier" aesthetic across the entire website and all universes.

Following the design system unification, all universes (Animeverse, Heroverse, Itihaas, The Atelier) share the quiet-luxury cream-and-paper aesthetic of **The Atelier** card and portal system. Universes no longer switch the global chrome, header, or hero into dark saturated color themes. Instead, every page, universe, and character experience sits on the unified cream ground (`#f7f5f0`), white paper surfaces (`#ffffff`), obsidian ink typography (`#141414`), warm muted ink (`#686560`), hairline stone rules (`#e5e1d8`), and signature obsidian button styling (`bg-ink text-cream hover:bg-ink/90`).

Facet UI follows one doctrine: each filter answers exactly one question — *Universe* is where you are, *garment chips* are what kind of thing, the **Intensity trio (Quiet · Balanced · Loud)** is how loudly you wear it, *craft techniques* are how it was made (provenance, never a primary axis).

**Key characteristics:**
- Cream editorial canvas (`#f7f5f0`), white paper surfaces (`#ffffff`), hairline stone rules (`#e5e1d8`).
- One serif carries the editorial and display voice (Playfair Display); Satoshi exists only as tracked-out caps micro-labels.
- Unified card architecture modeled on "The Atelier" portal: rounded `rounded-[20px]`, hairline border `border-stone/60`, elegant media header with subtle gradient overlay, text-ink display headings with `group-hover:italic` transition, hairline rule divider, and obsidian primary action button (`bg-ink text-cream hover:bg-ink/90`).
- Consistent interactive facet chips: active states use obsidian fill with cream text (`bg-ink text-cream font-medium`), inactive states use paper ground with stone border (`bg-paper text-ink border-stone hover:border-ink`).

## Colors

The palette is a warm, tailored luxury set: a calm cream ground family, an obsidian ink pair, burnt-terracotta action accents, and craft-metaphor accents (bullion gold, marigold saffron, botanical pistachio) used with restraint.

### Primary
- **Obsidian Ink** (#141414): body, headings, and signature primary buttons (`bg-ink text-cream`).
- **Burnt Terracotta** (#d95d39, hover #b84624): active tab accents, focus rings, wishlist highlights.
- **Bullion Gold** (#cba043): metallic zari thread highlights and intensity level meters.

### Neutral
- **Canvas Cream** (#f7f5f0): page ground across all routes and universe pages.
- **Card Paper** (#ffffff): cards, drawers, hero banners, and filter chips; always delineated by hairline stone borders.
- **Warm Stone** (#e5e1d8): hairline borders, dividers, and placeholder grounds.
- **Parchment** (#faf8f5): lore panels and secondary tiles; a half-step between cream and paper.
- **Universe Identity Tokens:** portal emblems, artwork previews, and subtle accents render with quiet luxury on neutral ground without overriding the global chrome.

**The Champagne Rule.** Gold (#cba043) is never body text on light surfaces — on light grounds it appears only with `text-gold-deep` contrast tokens or as fills carrying `text-on-gold`. The 2026-10-11 contrast sweep enforces this.

## Typography

**Display Font:** Playfair Display variable (400–900, true italic) with Melodrama fallback
**Body Font:** Playfair Display (the serif carries editorial AND functional text)
**Label Font:** Satoshi variable — tracked-out caps eyebrows, micro-labels, counts, and facet chips ONLY

**Character:** A single voice carrying both poetry and commerce — display sizes go huge and tight-tracked, functional text stays small, light, and airy. The sans is invisible glue, not a second voice.

### Hierarchy
- **Display** (600, clamp(3.5rem→8.75rem), 1.02 lh, −0.04em): hero headlines and universe portals; may be uppercase in caps-mode universes (Animeverse) or two-tone sentence case (Heroverse/Itihaas).
- **Section Title** (500, clamp(2.75rem→4.5rem)): lore headings, collection titles.
- **Body** (300, 1rem/1.7): descriptions, lore, PDP copy.
- **Label** (Satoshi 500, 0.75rem, uppercase, +0.22em): eyebrows, badges, counts, filter chips. Smaller instances use +0.15em.

**The One-Serif Rule.** Never introduce a second editorial face; new "voices" come from weight, size, case, or italic — not family swaps. (Recorded from build: fonts.css routes ALL editorial/functional text through Playfair; Satoshi is caps-only. This supersedes the older two-family intent in the index.html comment.)

## Layout

Single centered container, max 90rem (1440px), with stepped horizontal padding (1rem → 3rem from mobile to ≥1280px). Vertical rhythm: 4rem–8rem py sections, `--section-gap` 8rem between majors. Grids collapse 4→2→1 (portal cards, edit cards) or 3→2→1 (lore tiles); product grids run 4-col desktop → 2-col mobile. Mobile keeps ≥44px touch targets on every chip, swatch, and stepper; PDP gains a sticky quick-buy bar.

## Elevation & Depth

Flat-by-default with tonal layering: cards sit on paper against cream, delineated by 1px stone hairline. Shadows exist only as a *response* to state or focus.

### Shadow Vocabulary
- **Ambient** (`0 6px 16px rgba(20,20,20,.06)`): hover lift on cards — paired with −translate-y-1.
- **Focus/Float** (`0 28px 70px rgba(20,20,20,.14)`): focused portal cards and drawers.
- **Universe glow** (gold/terracotta 25px halo at ≤.28 alpha): focused universe card identity only, never ambient.

**The Earned-Lift Rule.** Rest state: border only. Shadow + translate + scale arrive together as one interaction response. No resting shadows on cards.

## Shapes

Square-edged editorial boxes (0–2px radius) for cards and images; fully-round pills (9999px) exclusively for facet chips and stickers; standard 4px for buttons and inputs; portal cards round at 20px. Color swatches and social marks are the only circles. Dividers are 1px stone — the torn-paper clip-path divider is a themed-zone ornament (universe heroes), not part of the base system.

## Components

### Buttons
- **Shape:** sharp corners (4px), serif label, generous padding (12px 28px)
- **Primary:** ink fill (#141414) with paper text — the quiet commerce choice
- **Universe gold:** bullion-gold fill with cream text in themed zones (auto-swaps per universe)
- **Ghost:** paper bg, ink text, stone border; hover darkens border to ink
- **Focus:** outline terracotta; never remove without replacement

### Facet Chips (intensity / garment / edit)
- **Style:** pill, paper bg, stone border, Satoshi-caps 11px
- **Selected:** ink fill + cream text (base) or gold fill + on-gold text (themed), `aria-pressed` always set
- **Intensity trio:** Quiet · Balanced · Loud as equal pills with tagline tooltips; selected via exact-match, no partial states

### Intensity Meter (signature component)
- **Style:** three 3px segments (#cba043 filled vs stone/50) + Satoshi-caps label, `title`/`aria-label` carry the level
- **Where:** every product card (compact) and the PDP provenance strip (wider segments); pure metadata — never a rating

### Cards / Containers
- **Corner:** 2px; **Background:** white paper; **Border:** 1px stone (darker + ring on hover)
- **Hover lift:** translate-y + ambient shadow + 500ms ease-out-quart (exponential, never bounce)
- **Internal padding:** 16–20px info body under 3/4 aspect media

### Inputs / Fields
- **Style:** square (4px), paper bg, stone border, 12px type
- **Focus:** terracotta border; placeholders in warm gray
- **Search icon:** drawn 1.5px-stroke SVG, never a unicode glyph

## Do's and Don'ts

### Do:
- **Do** theme through tokens only: new universes = one JSON row + one `[data-universe]` CSS scope, zero component edits.
- **Do** keep facet answers orthogonal — one question per filter (world / garment / intensity / craft / edit).
- **Do** carry `aria-pressed` on every chip, `aria-label` on every icon button, and 44px minimum touch targets.

### Don't:
- **Don't** use gold as text on light grounds (see Champagne Rule) or gold CTAs without the paired on-gold text token.
- **Don't** fabricate scarcity, ratings, or provenance — every number renders strictly from catalog data or not at all.
- **Don't** add Google Fonts or icon-font/emoji icons — self-hosted faces and drawn SVGs only.
- **Don't** let universe theming leak into checkout/account surfaces (neutral by construction).

---

# Design System v2: Modern D2C Streetwear & Gokwik Bag

A complete modernization of UniqueLo's frontend inspired by contemporary D2C streetwear interfaces and the Gokwik-style interactive checkout bag documented in `sketches/design system.png`.

## Toggle Architecture & Feature Flag

The design system v2 is controlled by a single top-level flag in `src/config/theme.ts`:

```typescript
// src/config/theme.ts
export const USE_THEME_V2 = true; // Toggle between false (v1: The Atelier) and true (v2: Modern D2C Streetwear)
```

The system automatically synchronizes:
1. `html[data-theme="v2"]` attribute and `.theme-v2` CSS class on `document.documentElement`.
2. Responsive CSS token remappings in `src/styles/tokens.css`.
3. Global typography adaptation in `src/styles/globals.css` (remapping all `.font-serif` to `var(--font-sans)` for crisp neo-grotesque readability).
4. Dual-mode React component implementations across Navigation, Cart Bag, Hero, Portals, and PDP.

## Color Tokens (v2)

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--color-canvas-slate` | `#f0f2f5` | Cool architectural slate canvas background |
| `--color-card-pure` | `#ffffff` | Crisp high-contrast surface for cards and drawer |
| `--color-ink-deep` | `#111827` | High-contrast deep obsidian text and CTA background |
| `--color-emerald-accent` | `#059669` | Primary discount badges, savings counters, and coupon tags |
| `--color-emerald-surface` | `#e6f7ef` | Soft mint backgrounds for applied coupons and milestone bars |
| `--color-border-hairline` | `#e5e7eb` | Subtle neutral dividers and borders |
| `--color-stepper-bg` | `#f3f4f6` | Quantity stepper background matching the design system |
| `--color-gokwik-checkout` | `#111827` | Sticky instant checkout bar with payment icons |

## Typography (v2)
- **Primary & Display Voice:** Neo-Grotesque Sans-Serif (`Satoshi` / `Inter`, system fallback).
- Headings: Bold, tight letter-spacing (`-0.02em`), uppercase labels (`tracking-widest`).
- Body: 14–16px crisp sans with 1.5 line height.

## Corner Radius Scope Rule
- **Cart Bag Only:** Rounded corner behavior (`rounded-2xl`, `rounded-xl`, `rounded-full`) is strictly confined to the Cart Bag drawer and its line items matching `sketches/design system.png`.
- **Rest of Website:** Retains clean architectural square rectangles for product cards, homepage components, and storefront sections to maintain the unified site aesthetic.

## The Cart Bag (Exact Match to `sketches/design system.png`)

When `USE_THEME_V2 = true`, clicking the Bag trigger opens the Gokwik-style cart drawer with:
1. **Top Announcement Bar:** Black strip (`#111827`) with `⚡ Get 10% off with code HUSTLE10`.
2. **Multi-Milestone Discount Tracker:**
   - Milestone 1: ₹500 (Unlocks 10% OFF + Free Shipping)
   - Milestone 2: ₹5,999 (Unlocks 15% OFF)
   - Milestone 3: ₹9,999 (Unlocks 20% OFF)
   - Real-time animated progress bar (`bg-emerald-600`) with dynamic callout (`Add ₹X more to get...`).
3. **Product Line Items:**
   - 3:4 tall aspect-ratio image thumbnail.
   - Garment title and quick size dropdown selector (`[ M ⌄ ]`) allowing in-cart variant switching.
   - Price row: Bold black price + strikethrough original price + bold emerald `(XX% OFF)` tag.
   - Pill stepper (`#f3f4f6`) with trash can delete icon when quantity is 1.
4. **Coupons & Offers Card:**
   - Clean dashed voucher pill with quick-apply `HUSTLE10` button.
   - Interactive slide-over offers modal previewing all 12 platform promotions (`HUSTLE10`, `GOBONKERS15`, `BONKERS20`, `PREPAID5`, `FREESHIP`, etc.).
5. **Cross-Sell Drawer:** "You may also like..." curated add-on garment carousel with single-click quick add.
6. **Floating Savings Banner:** Sticky emerald ribbon displaying `You are saving ₹X on this order!`.
7. **Instant Checkout Bar:**
   - Full-width black button with total payable price and arrow.
   - Subtext: *100% Verified Order • Instant Checkout*.
   - Accepted payment trust badges: UPI (GPay/PhonePe), Visa, Mastercard, Netbanking, COD.