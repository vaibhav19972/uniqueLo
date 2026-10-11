# 04 — Universe Theming System

> Visual targets: `sketches/design-renders/chatgpt-v2/` files `03` (portals) + `08a/b/c` (full-bleed landings) — local-only, gitignored.

## Architecture (locked): one skeleton, N skins

- Layout components are theme-agnostic. All universe expression flows through **CSS custom properties** scoped by `[data-universe]` + `[data-vibe]` on `<html>`.
- Token source of truth: `universes.theme_tokens` jsonb (§03) → codegen or hand-mirror into `src/styles/universes.css`. Never hardcode universe colors in components.
- First-paint rule: theme attributes set from route before render. No flash of neutral inside a universe.
- Checkout/account/admin surfaces ignore universe attributes (always neutral).

## Universe bibles

### Animeverse (`animeverse`)
Palette: indigo `#1b2340` · sakura `#f4a7c3` · neon cyan `#59e3ff` · ivory product zones `#f7f5f0`.
Motifs: sakura petals, speed lines, halftone dots, torii silhouettes (original-drawn).
Type: bold condensed display + kana-style micro-accents (decorative glyphs, never real words).
Texture: subtle manga screentone at ≤6% opacity. Default vibe: expressive.

### Heroverse (`heroverse`)
Palette: hero red `#d7263d` · royal blue `#1d4ed8` · burst yellow `#ffd23f` · paper `#faf6ee`.
Motifs: Ben-Day dots, action lines, badge frames ("NEW ISSUE DROP"), diagonal cape-flow compositions.
Type: extra-bold italic display. Product cards stay clean so garments pop against loud chrome.

### Itihaas (`itihaas`)
Palette: sandstone `#c89b6d` · maroon `#5c1a24` · peacock teal `#0f6f6a` · gold `#b98a2f`.
Motifs: Mughal arches (card frames + section dividers), jharokha windows, paisley jaal, miniature-painting borders.
Type: elegant serif with Devanagari-inspired flourishes. Texture: handmade-paper grain ≤5%.

## Vibe modifiers (× each universe)

> Registry: `src/data/vibes.json` (extensible — Oct 2026 decision; was "fixed 4").
> One JSON row + one `[data-vibe]` CSS block per vibe; featured vibes render
> as gateway cards, the rest behind "More styles". Adding vibe #8 = no
> component changes.

| Vibe | Rule | Featured |
| :--- | :--- | :--- |
| `minimal` | Universe reduced to monochrome line-art + one accent token. Max 2 colors on screen. | ✅ |
| `clean` | Ivory-dominant; universe motifs only in dividers and tags. Default for PDP buy panels. | ✅ |
| `aesthetic` | Full palette + texture + editorial grain. Default for universe heroes. | ✅ |
| `expressive` | Maximalist: motif-dense backgrounds, animated-feel dividers, bold type. Never on checkout-adjacent UI. | ✅ |
| `noir` | Monochrome: accent-2 collapses to ink, texture 0, single-accent screen. | — |
| `pearl` | Soft-luminous: accent-2 follows accent, texture ≤0.02, lifted surfaces. | — |
| `gilded` | Champagne restraint: accent-2 → `--brand-gold`, texture 0.03, metallic linework only. | — |

Vibe is a user-facing filter (`?vibe=`), persisted per session. Default vibe per surface: heroes → aesthetic; grids → clean; PDP → clean with aesthetic lore block.

**Contrast rule (launch-blocking):** champagne-family hexes fail 4.5:1 as body text on light surfaces — gold-family text on light zones uses `--brand-gold-deep` / `text-gold-deep`; gold CTAs use `text-on-gold` (→ `--u-on-accent` inside themed scopes). Re-run the §08 contrast gate for every universe × vibe after any token change.

## Token contract (minimum set per universe)

`--u-bg, --u-surface, --u-ink, --u-accent, --u-accent-2, --u-divider (motif SVG url), --u-card-frame (none|arch|badge|torii), --u-texture (url+opacity), --u-display-font`. Vibe modifiers override subsets only.

## Decisions locked

1. Theming = CSS custom properties from `theme_tokens`; no per-universe components.
2. PDP buy panel and checkout are always clean/neutral regardless of vibe.
3. Every universe ships all 7 vibe modifiers at launch (registry-driven token subsets, not extra work). *(Relaxed from 4 → 7, Oct 2026.)*
4. Whole-site theming (Oct 2026): `Layout.tsx` sets `[data-universe]` on `<html>` for `/universes/:slug` + product pages (derived from the product's universe); all other routes stay neutral. Header/footer follow via scoped semantic-token remaps in `universes.css`; themed zones opt in via `data-u-zone`. Components never hardcode universe colors — they keep using `bg-cream`/`text-ink`/`bg-gold` and the scopes remap them.
5. Shell palette (Oct 2026): warm browns retired. Graphite `#111116` + champagne `#c2a878` (+ `--brand-gold-deep #7a6234` for gold text on light surfaces, `--on-gold` for text on gold fills). Itihaas goes Ivory Darbar; Heroverse goes cinematic charcoal/crimson/champagne.
