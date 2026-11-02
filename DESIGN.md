---
name: UniqueLo
description: "An unbleached-cotton catalogue of hand-embroidered garments, priced as plain as a fabric label."
colors:
  cotton: "#f4efe4"
  paper: "#fbf8f1"
  panel: "#ebe4d5"
  panel-raised: "#e2d9c7"
  indigo-ink: "#141a2e"
  ink-muted: "#5f5747"
  stone: "#ddd4c3"
  stone-strong: "#c6bba6"
  warm-gray: "#9b9283"
  madder: "#a4322a"
  madder-hover: "#8f2a22"
  madder-soft: "rgba(164, 50, 42, 0.09)"
  on-madder: "#ffffff"
  signal-error: "#a4322a"
  signal-success: "#2f6247"
  night-canvas: "#0f1216"
  night-paper: "#171c23"
  night-panel: "#1e242d"
  night-ink: "#f2ece0"
  night-ink-muted: "#c9c2b4"
  night-stone: "#2a313b"
  night-madder: "#e8705f"
  anime-sakura: "#9c2f5a"
  hero-crimson: "#a52a20"
  itihaas-wine: "#7a2331"
typography:
  display:
    fontFamily: "Archivo, Geist, system-ui, sans-serif"
    fontVariation: "'wght' 650, 'wdth' 78"
    fontSize: "clamp(2.25rem, 5.2vw, 4.75rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.028em"
  hero:
    fontFamily: "Archivo, Geist, system-ui, sans-serif"
    fontVariation: "'wght' 650, 'wdth' 78"
    fontSize: "clamp(2.5rem, 5.4vw, 5rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.028em"
  title:
    fontFamily: "Archivo, Geist, system-ui, sans-serif"
    fontVariation: "'wght' 650, 'wdth' 78"
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  body-small:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, Geist, system-ui, sans-serif"
    fontVariation: "'wght' 600, 'wdth' 62"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.16em"
  price:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.01em"
rounded:
  none: "0"
  control: "4px"
  cart: "14px"
spacing:
  hair: "0.25rem"
  tight: "0.5rem"
  snug: "0.75rem"
  base: "1rem"
  block: "1.5rem"
  band: "2rem"
  section: "3rem"
  section-lg: "4rem"
  chapter: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.indigo-ink}"
    textColor: "{colors.cotton}"
    rounded: "{rounded.control}"
    padding: "0 1.5rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.madder}"
    textColor: "{colors.on-madder}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.indigo-ink}"
    rounded: "{colors.none}"
    padding: "0 1.25rem"
    height: "3rem"
  size-chip:
    backgroundColor: "transparent"
    textColor: "{colors.indigo-ink}"
    rounded: "{rounded.none}"
    padding: "0 0.75rem"
    height: "2.75rem"
  size-chip-selected:
    backgroundColor: "{colors.indigo-ink}"
    textColor: "{colors.cotton}"
  card-product:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.indigo-ink}"
    rounded: "{rounded.none}"
  input:
    backgroundColor: "{colors.cotton}"
    textColor: "{colors.indigo-ink}"
    rounded: "{rounded.none}"
    padding: "0 0.75rem"
    height: "2.75rem"
  tab-segment:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.none}"
    padding: "0 1rem"
    height: "2.75rem"
  tab-segment-selected:
    backgroundColor: "{colors.indigo-ink}"
    textColor: "{colors.cotton}"
---

# Design System: UniqueLo

## Overview

**Creative North Star: "The Loom Card"**

The catalogue is the composition. UniqueLo sells hand-embroidered garments between ₹899 and ₹1,899 to buyers who arrive from Instagram on a mid-range Android in daylight, so the storefront is built like a woven index rather than a campaign: unbleached cotton ground, a dense grid of garments each carrying its real price, hairline rules doing all the separating, and one dyed-indigo band allowed to interrupt the whole page for the craft story. Nothing rests on a shadow; nothing floats in a card.

The palette is cloth, not luxury. The ground is unbleached cotton, the foreground is dyed indigo rather than black, and there is exactly one saturated colour — madder red — which marks action and price and never decoration. Universes appear as horizon bands you enter, each with its own accent hue and its name written out, so colour is never the only signal. The dark mode is the dyeworks: the same structure at night, an equal rather than a flagship.

Typography is the label on the garment. Archivo's width axis does the shouting — condensed display lines at 78% width for headings, 62% for tracked-out labels — while Geist carries reading text, and Geist Mono is reserved for prices so the digits line up down a grid. The retired Playfair/melodrama serif voice, the gold-and-terracotta accent set, and the 20px portal cards are the anti-reference this world was built against.

**Key Characteristics:**
- Unbleached cotton canvas (`#f4efe4`), paper surfaces (`#fbf8f1`), dyed-indigo ink (`#141a2e`) — never pure black or pure white.
- One saturated colour: madder red (`#a4322a`), for primary actions, price emphasis, and nothing else.
- Condensed Archivo display at 78% width; Geist for reading; Geist Mono for every price and count.
- Square corners everywhere except controls (4px) and the bag (14px), which PRODUCT.md names as the only rounded surface.
- Hairline loom rules (1px `--color-stone`) carry the entire layout; resting shadows do not exist.
- Photography sits directly on paper with no frame, scrim, or overlay — garment first, label beneath.

## Colors

Cloth and dye: five warm neutrals, one indigo foreground, and a single madder accent that is the only saturated value in the system.

### Primary
- **Madder** (`#a4322a`, hover `#8f2a22`): primary actions, links on hover, price emphasis, the one word in a headline that must be read first. 5.97:1 on cotton — AA at every size. It is also the badge colour for a genuine markdown; today no variant carries `compare_at_price_cents`, so no card prints one. `catalogMrp()` in `src/lib/pricing.ts` is the single gate: it returns nothing for an absent, expired, or lower reference price rather than inventing a discount.
- **Madder Soft** (`rgba(164, 50, 42, 0.09)`): the tint behind an applied state or a quiet notice. Never a background for body text.

### Neutral
- **Cotton** (`#f4efe4`): the page ground on every route. Light mode is the canonical surface.
- **Paper** (`#fbf8f1`): cards, drawers, menus, and every plate a photograph sits on. One step lighter than the ground, never white.
- **Panel** (`#ebe4d5`): nested surface — the terms strip, segmented control troughs, inset blocks.
- **Panel Raised** (`#e2d9c7`): hover fill on a panel.
- **Dyed Indigo** (`#141a2e`): all primary foreground text and the ink fill of primary buttons. Deliberately a blue-black rather than `#000`.
- **Secondary Ink** (`#5f5747`): body copy, metadata, captions. 6.23:1 on cotton.
- **Stone** (`#ddd4c3`) / **Stone Strong** (`#c6bba6`): hairlines, dividers, and emphasised borders respectively. The whole layout is these two values at 1px.
- **Warm Gray** (`#9b9283`): placeholders and disabled states only.

### Secondary (universe accents)
Each universe owns one hue family and only the accent moves; canvas, paper, and ink stay with the mode. All are contrast-checked on cotton, paper, and panel.
- **Animeverse Sakura** (`#9c2f5a`, dark `#f08cb2`): Animeverse blocks and portals.
- **Heroverse Crimson** (`#a52a20`, dark `#f4776a`): Heroverse blocks and portals.
- **Itihaas Wine** (`#7a2331`, dark `#e7909e`): Itihaas blocks and portals.

### Named Rules
**The One Saturated Colour Rule.** Madder is the only saturated colour in the base system. If a surface needs a second hue, it is a universe block — and then the hue comes from that universe's accent, not from invention.

**The Colour Is Never The Only Signal Rule.** Every universe band, sale state, and stock state prints its name in words beside the colour. A buyer on a scratched phone screen in daylight must never have to infer meaning from hue alone.

**The Dyed-Not-Black Rule.** Foreground is `#141a2e`, never `#000`; canvas is `#f4efe4`, never `#fff`. Pure values make cotton look like paper and indigo look like plastic.

## Typography

**Display Font:** Archivo variable (wght 100–900, wdth 62–125%), self-hosted
**Body Font:** Geist (with system-ui fallback)
**Price/Mono Font:** Geist Mono, used only for money and counts

**Character:** One grotesque family does the display work at two widths and two weights — condensed and heavy for headings, very condensed and tracked-out for labels. The effect is garment labelling: the name of the thing, the fibre, the size, the price, all legible from arm's length.

### Hierarchy
- **Hero** (Archivo 650 @ 78% width, `clamp(2.5rem, 5.4vw, 5rem)`, 1.02, −0.028em): the first-viewport brand line only.
- **Display** (Archivo 650 @ 78%, `clamp(2.25rem, 5.2vw, 4.75rem)`): section headings and the craft band's statement.
- **Title** (Archivo 650 @ 78%, `1.5rem`–`1.75rem`): product names, drawer headings, band subtitles.
- **Body** (Geist 400, `1rem`/1.7): reading copy, max 62–68ch. Product prose drops to `0.8125rem`/1.6 in dense panels.
- **Label** (Archivo 600 @ 62%, `0.72rem`, uppercase, +0.16em): the `loom-label` class. Every field name, tab, and metadata row.
- **Price** (Geist Mono 500, tabular-nums): the `loom-price` class. Every rupee figure and every count, so decimal positions align down a column.

### Named Rules
**The Two-Width Rule.** Display type gets its power from Archivo's width axis, not from a second family. 78% for headings, 62% for labels, and no other display widths.

**The Serif Is Retired Rule.** Playfair Display and every serif voice are gone as a design decision. `--font-serif` still resolves — to Archivo — so legacy call sites degrade to a real face rather than a missing one, but no new surface may name a serif.

**The Mono-For-Money Rule.** Prices, counts, and figures are Geist Mono with `font-variant-numeric: tabular-nums`. Body copy and headings are never mono.

## Layout

One centred container, `max-width: 90rem`, with stepped padding (1rem → 1.5rem → 3rem). The base rhythm is a band model: each section is `border-b border-stone` separated from the next, `py-12 lg:py-16`, with the hero and the craft band taking full height or full width.

The storefront's atom is a ruled row or a bare grid cell, never a boxed card. Product grids run 4 across at `lg`, 2 on mobile, with `gap-x-4 gap-y-8` — tight horizontally because photographs of garments need adjacency, loose vertically because each carries a name and price beneath. Two-column reading layouts use `minmax(0, 1fr)` pairs so text never forces a photograph wide.

Mobile is the design target, not the degraded variant: 44px minimum on every control, horizontal tab rows that scroll rather than wrap, and no element whose meaning depends on hover.

## Elevation & Depth

Flat, by construction. Depth is carried by tonal layering — cotton, paper, panel — and by 1px stone rules. There are no resting shadows anywhere in the system; a card is a photograph on paper, not a box floating above a ground.

Shadows exist as a *response* only: the bag and dialogs get `--shadow-lg` / `--shadow-float` while open, and nothing else does. The tags `--shadow-sm` and `--shadow-md` survive in tokens for legacy call sites and for focus-free overlays, not as a design vocabulary.

### Named Rules
**The No Resting Shadow Rule.** A surface at rest is flat and delineated by a hairline or a tonal step. If a component needs a shadow to read as a component, the component is wrong.

**The One Dark Band Rule.** Exactly one section per page inverts to `bg-ink`. On the home page that is the craft story; on a product page the only dark fill is a sold-out or selected chip. Inversion is attention, and attention is not free.

## Shapes

Square. `--radius-none` is the default for every card, chip, plate, tab, table, and image. `4px` exists for controls — buttons, inputs, segmented tabs — and `14px` exists only for the bag drawer, which PRODUCT.md names as the sole rounded surface in the product.

Borders are 1px and always `--color-stone`, rising to `--color-stone-strong` when a control must read as interactive. Photographs are never rounded, never clipped to a circle, never given a gradient scrim. Images that must preserve the whole garment use `object-contain` on a paper ground; only editorial plates crop.

### Named Rules
**The Square Rule.** Corners are 0 everywhere except controls (4px) and the bag (14px). A rounded product card is a different product.

**The No-Scrim Rule.** Text never sits on a photograph behind a gradient. If a caption belongs with an image, it sits beneath it on paper at the label size.

**The Empty Cell Rule.** A surface renders a plate only when there is a real photograph for it. A gradient stand-in, a flat local file, or a garment cropped below the size at which it reads is worse than no plate: it teaches the buyer that this catalogue shows empty boxes. `src/lib/imagery.ts` names the known gradient assets; a missing plate is omitted, labelled, or replaced by type, never filled.

## Components

### Buttons
- **Shape:** 4px radius, square-cornered by the family's standards; 48px minimum height, never below 44px.
- **Primary:** indigo-ink fill, cotton text, `uppercase` at label size with +0.12em tracking; hover moves to madder, which is the only colour change a button makes.
- **Outline:** transparent ground, 1px stone-strong border; hover darkens the border to ink. Used for the second action in a pair, never as a substitute for primary.
- **Text link:** underline at `text-underline-offset: 0.2em`, decoration in stone-strong, rising to currentColor on hover.
- **Disabled:** stone-strong fill with cotton text, no opacity fade on primary actions.

### Chips / Size Selectors
- **Style:** square, 44px tall, 1px stone-strong border on paper. The selected chip is the ink fill with cotton text — a solid block, not a tint or a ring.
- **Sold out:** stone border, muted ink, line-through label, `disabled`, no hover.
- **Segmented tabs** follow the same grammar: adjacent square cells sharing borders, selected cell filled ink.

### Cards / Containers
- **Corner:** 0. **Background:** paper for the plate; the ground itself for the text beneath. **Border:** none — the plate's tonal step is the delineation. **Shadow:** none at rest.
- **Internal rhythm:** photograph, then 12px, then name at 13–14px, then the technique-and-presence label, then the price in mono. Four lines, no badges, no floating controls beyond two 44px corner targets.
- **Hover:** the photograph cross-fades to its macro detail over 500ms. Nothing moves, scales, or lifts.

### The Ruled Index (the second layout, for anything that is a list of kinds)
The card is the atom for garments. Everything else — worlds, presence levels, techniques, the catalogue's garment table, the tabs on `/new-featured`, the per-piece record on a technique page — is a ruled row, because a grid of fourteen equal cards says every world is worth the same attention and every technique has the same stock.

- **Structure:** an `<ol>` or `<dl>` with `border-t border-stone`, one `border-b` per row, no cell borders and no zebra fill.
- **Columns:** mono ordinal, then name at 1.5rem `loom-display`, then a reading column of 12.5–14px Geist, then a right-aligned mono/`loom-label` column carrying the live count, the pace, or the price.
- **Mobile:** the ordinal and name stay on one line; every following column spans the full width beneath it (`col-span-*`), so nothing is squeezed into a 3.5rem track and no cell wraps to four lines.
- **Numbers are live.** A count is computed from the catalogue at render, never typed. A kind with zero pieces says "Not in stock" and links to its own record rather than rendering an empty door.
- **No plate on an index row.** Cropping a garment-on-cream photograph to 3.5rem yields an empty-looking cell; the technique's photograph belongs on its own page at hero scale. `/worlds`, `/styles` and `/our-craft` are type-only indexes; the horizon tint is the only imagery they carry.
- **The horizon rule** belongs to world rows only: a flat 7% tint of the world's own accent across the row (`color-mix(in srgb, var(--color-accent) 7%, transparent)`), plus a 3px rule at full strength along the row's bottom edge. The rule is the carrier — three wine-family accents are indistinguishable at 7% but distinct at full strength on 3px. No left border, no ordinal numeral: a coloured border-left on a list item is a refused pattern, and the world's name in words already does the naming.

### Inputs / Fields
- **Style:** square, cotton ground, 1px stone border, Geist at `13px`, 44px minimum height.
- **Focus:** border goes to ink. Never a glow, never a coloured ring on the field itself.
- **Error:** madder text at `12px` beneath the field with `role="alert"`; the field border turns madder.

### Notifications

- **Shape:** square, ink ground, 1px `border-stone`, `--shadow-float` — a toast is a floating element over unknown ground, which is the one place DESIGN.md allows a shadow, and it uses the float tier rather than a decorative `2xl`.
- **Content:** the title in `loom-label` (tracked uppercase), the body at 12.5px in cream at 75%, a 16×3px rule at the left whose colour carries the state (success green, accent, or stone) — a drawn rule, never a glyph character.
- **Behaviour:** one action at most, as an underlined 44px target; dismiss is a 44px icon button. `role="status"`, so it is announced.
- **Why it is documented:** it is the only element that appears over every surface, so it is the one component that can contradict the world from anywhere.

### Navigation
- **Masthead:** a terms strip in panel at 11px, then a 68px bar: condensed wordmark, five tracked-out uppercase labels, four 18px icons. Hover opens a ruled panel of ink-on-paper rows — no shadow, no rounded corner, no gold.
- **Active state:** a 1px ink underline on the label. No pill, no background change.
- **Mobile:** the same five destinations as ruled accordion rows at display size; the drawer is full-height on cotton and scrolls.

### The Bag (signature, and the only rounded surface)
- **Shape:** 14px radius, paper ground, full column on mobile and 27rem wide above `sm`.
- **Head:** "Bag" at display size with the piece count in mono beside it.
- **Carriage meter:** one sentence and a 1px rule that fills to the free-carriage threshold — no gradient bar, no milestone tiers.
- **Totals:** a `<dl>` of label/value rows with every number in mono, ending in the total at 17px. Nothing is computed in the drawer: every figure is the server's quote.
- **Checkout:** one full-width ink button at 52px; disabled until a quote exists, so the buyer can never proceed with an unpriced bag.

## Do's and Don'ts

### Do:
- **Do** set every price and count in `loom-price` (Geist Mono, tabular) so figures align in a column.
- **Do** separate sections with 1px `border-stone` and a `py-12 lg:py-16` rhythm rather than with cards, shadows, or background changes.
- **Do** keep the dark theme a structural equal: same components, same rules, `[data-mode='dark']` values only.
- **Do** state a claim only when a catalogue field or the pricing function backs it; otherwise omit it and say nothing.
- **Do** carry `aria-pressed` on toggles, `aria-label` on icon buttons, and 44px minimum on every target.
- **Do** let one section per page invert to ink, and let that be the craft story.

### Don't:
- **Don't** reintroduce a serif display voice, gold/zari accents, terracotta, or 16–20px portal cards. That world is the anti-reference this system replaced.
- **Don't** put text on a photograph behind a scrim, and don't crop a garment to a fixed portrait frame — the catalogue's photographs range from 0.77 to 1.11 in aspect.
- **Don't** fabricate scarcity, ratings, review counts, artisan names, shipping thresholds, or return windows. Where a value is missing (`artisan_hours` is null on 28 of 29 products) render nothing or say "recorded on the certificate".
- **Don't** add resting shadows, rounded product cards, or hover lift-and-scale. Interaction on a card is the macro cross-fade and nothing else.
- **Don't** add a marquee, a scrolling announcement ticker, or any continuously animating chrome: the target device is a mid-range Android, and the catalogue is the composition.
- **Don't** use pure black, pure white, or a second saturated hue outside a universe block.
