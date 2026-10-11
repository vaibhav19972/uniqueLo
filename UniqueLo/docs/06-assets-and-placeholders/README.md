# 06 — Assets & Placeholder Strategy

> **Source of truth for imagery while real fashion photography is pending.**  > Keep the website functional and premium-looking from day one with a single, swappable placeholder system.

---

## 1. The Problem

Local models cannot generate credible fashion photography. High-quality assets will arrive later (photoshoot, brand assets, licensed stock). Until then, the site must not look broken or amateur.

---

## 2. Strategy: Tonal Blocks + Asset Registry

Use **neutral tonal blocks** generated from the brand palette as placeholders. They preserve layout, aspect ratio, and color harmony without pretending to be real photos.

When real assets arrive, replace the generated files in `public/images/*` and update the **Asset Registry** below. No code changes are needed because image paths are driven by JSON and tokens.

---

## 3. Folder Layout

```text
public/
└── images/
    ├── placeholders/           ← generated tonal blocks
    │   ├── hero.jpg
    │   ├── campaign-01.jpg
    │   ├── campaign-02.jpg
    │   ├── editorial-01.jpg
    │   ├── editorial-02.jpg
    │   ├── lookbook-01.jpg
    │   ├── lookbook-02.jpg
    │   ├── lookbook-03.jpg
    │   ├── category-outerwear.jpg
    │   ├── category-knitwear.jpg
    │   ├── category-tops.jpg
    │   ├── category-bottoms.jpg
    │   ├── category-accessories.jpg
    │   ├── product-01-a.jpg
    │   ├── product-01-b.jpg
    │   └── ...
    ├── products/                 ← real product images (Phase 3+)
    ├── campaigns/              ← real hero / lookbook / editorial (Phase 3+)
    └── categories/               ← real category images (Phase 3+)
```

### Placeholder Naming Rule

Each placeholder filename matches the **future real asset path** so the swap is a file replacement, not a code update.

Example:
- Placeholder: `public/images/placeholders/product-cashmere-robe-coat-1.jpg`
- Real asset: `public/images/products/cashmere-robe-coat-1.jpg`

Update the image `src` in `src/data/mock-products.json` (the canonical catalog;
`products.json` is frozen — do not point it at new assets) to the real path once it exists. Until then, point `src` to the placeholder.

**Current state (2026-10-11):** the storefront catalog is
`src/data/mock-products.json` (14 render-mock SKUs; `isMock: true`). Its image
`src` paths point at real files in `public/images/products/`,
`public/images/categories/`, and `public/images/placeholders/` — tonal
placeholder blocks generated per §4 (all 26 referenced paths verified on
disk, 2026-10-11). Mock SKUs **reuse** imagery from the legacy atelier line
(e.g. `sakura-ronin-hoodie` renders with `vine-heavyweight-tee-*` files) —
every mock product will need dedicated `product-<slug>-{1,2}.jpg` pairs at
the P5 campaign shoot. The deprecated `src/data/products.json` (13 atelier
SKUs) keeps its dedicated pairs below.

---

## 4. Generating Placeholders

Placeholders are generated images (via a script, image tool, or manual creation). They should follow these rules:

| Asset Type | Dimensions | Color | Texture |
|------------|-----------|-------|---------|
| Hero / campaign | 1920×1080 (16:9) or 1080×1920 (9:16 mobile) | `--color-stone` to `--color-ink` gradient | subtle noise, no text |
| Editorial split | 1200×1500 (4:5) | warm gray gradient | fine film grain |
| Lookbook | 1920×1080 (16:9) | `--color-cream` to `--color-warm-gray` | minimal |
| Category cards | 800×1000 (4:5) | mid-tone from the palette | clean |
| Product card default | 900×1200 (3:4) | `--color-stone` base, `--color-ink` overlay | soft shadow |
| Product card hover | 900×1200 (3:4) | slightly darker or accent-tinted | same |

### Color Distribution

Use only these colors for placeholders:

- `--color-cream` #f7f5f0
- `--color-paper` #ffffff
- `--color-ink` #141414
- `--color-stone` #e5e1d8
- `--color-warm-gray` #9e9b94
- `--color-accent` #d95d39 (use sparingly, e.g., hero campaign blocks)

### Example Placeholder Spec

A hero placeholder is a 1920×1080 image:
- Background: vertical gradient from `#e5e2dc` (top) to `#9f9c96` (bottom).
- Subtle 2% noise overlay.
- No text, no logo, no UI.

---

## 5. Asset Registry

Use this table to track real assets as they arrive. Update it when a file is swapped.

> **Two catalogs, two registries (2026-10-11).** The **storefront** registry is
> derived from `src/data/mock-products.json` (14 render-mock SKUs) — those SKUs
> currently *reuse* files from the legacy atelier set below, so they are listed
> with their effective file pairs, pending dedicated shoots. The **legacy**
> registry covers the deprecated `products.json` 13-SKU atelier line (dedicated
> pairs on disk, non-serving). The JSON files are the source of truth for
> which images each catalog references — never regenerate this table from
> folder listings.

### Storefront (mock-products.json — 14 SKUs, image pairs borrowed from atelier assets)

| Universe | Product (slug) | Effective image pair | Dedicated assets? |
|---|---|---|---|
| Animeverse | sakura-ronin-hoodie | `vine-heavyweight-tee-{1,2}.jpg` | ❌ pending shoot |
| Animeverse | roaring-spirit-tee | `vine-heavyweight-tee-{1,2}.jpg` | ❌ pending shoot |
| Animeverse | koi-no-yume-sweatshirt | `crewel-cashmere-cardigan-{1,2}.jpg` | ❌ pending shoot |
| Animeverse | oni-spirit-jacket | `nocturne-velvet-vest-{1,2}.jpg` | ❌ pending shoot |
| Animeverse | tsuki-crane-sweatshirt | `embroidered-silk-scarf-{1,2}.jpg` | ❌ pending shoot |
| Animeverse | koi-no-yume-tee | `pleated-zari-trousers-{1,2}.jpg` | ❌ pending shoot |
| Animeverse | tech-cargo-pants | `pleated-zari-trousers-{1,2}.jpg` | ❌ pending shoot |
| Animeverse | samurai-cap | `monogram-poplin-shirt-{1,2}.jpg` | ❌ pending shoot |
| Animeverse | red-sun-tote | `needlework-canvas-tote-{1,2}.jpg` | ❌ pending shoot |
| Heroverse | ascendant-hoodie | `vine-heavyweight-tee-{1,2}.jpg` | ❌ pending shoot |
| Heroverse | guardian-stripe-tee | `sashiko-selvedge-denim-{1,2}.jpg` | ❌ pending shoot |
| Heroverse | herald-cape-jacket | `botanical-silk-jacket-{1,2}.jpg` | ❌ pending shoot |
| Itihaas | royal-procession-jacket | `kantha-chore-jacket-{1,2}.jpg` | ❌ pending shoot |
| Itihaas | arch-jaal-kurta | `french-knot-turtleneck-{1,2}.jpg` | ❌ pending shoot |

*(Effective pairs above were derived from `mock-products.json` on 2026-10-11;
several SKUs cycle through more than two borrowed images. Verify against the
JSON before relying on this snapshot.)*

### Legacy atelier line (products.json — deprecated, non-serving)

| Type | Slug / Name | Current Path | Status |
|------|-------------|--------------|--------|
| Hero | home-hero | `/images/campaigns/hero.jpg` | placeholder |
| Category | outerwear / knitwear / tops / bottoms / accessories | `/images/categories/<slug>.jpg` | placeholder |
| Product | botanical-silk-embroidered-jacket | `/images/products/botanical-silk-jacket-{1,2}.jpg` | placeholder |
| Product | celestial-zardozi-wool-coat | `/images/products/celestial-zardozi-coat-{1,2}.jpg` | placeholder |
| Product | kantha-quilted-chore-jacket | `/images/products/kantha-chore-jacket-{1,2}.jpg` | placeholder |
| Product | flora-crewel-cashmere-cardigan | `/images/products/crewel-cashmere-cardigan-{1,2}.jpg` | placeholder |
| Product | french-knot-merino-turtleneck | `/images/products/french-knot-turtleneck-{1,2}.jpg` | placeholder |
| Product | atelier-monogram-poplin-shirt | `/images/products/monogram-poplin-shirt-{1,2}.jpg` | placeholder |
| Product | vine-embroidered-heavyweight-tee | `/images/products/vine-heavyweight-tee-{1,2}.jpg` | placeholder |
| Product | selvedge-sashiko-embroidered-denim | `/images/products/sashiko-selvedge-denim-{1,2}.jpg` | placeholder |
| Product | pleated-silk-zari-wool-trousers | `/images/products/pleated-zari-trousers-{1,2}.jpg` | placeholder |
| Product | heritage-flora-embroidered-silk-scarf | `/images/products/embroidered-silk-scarf-{1,2}.jpg` | placeholder |
| Product | artisanal-needlework-canvas-tote | `/images/products/needlework-canvas-tote-{1,2}.jpg` | placeholder |
| Product | nocturne-velvet-crewel-vest | `/images/products/nocturne-velvet-vest-{1,2}.jpg` | placeholder |
| Editorial | atelier-craft | `/images/campaigns/atelier-craft.jpg` | placeholder |
| Editorial | editorial-split | `/images/campaigns/editorial-split.jpg` | placeholder |
| Lookbook | lookbook 01–03 | `/images/campaigns/lookbook-0{1,2,3}.jpg` | placeholder |

> All storefront-referenced paths verified to exist on disk (2026-10-11 check:
> 26 unique paths across `mock-products.json`, 0 missing).

> **Cleanup candidates (do not delete without a grep):** unused oversized
> `.png` twins in `public/images/products/` (~0.2–2.7MB each) and junk-named
> files (`112.jpg`, `1322.jpg`, `14.jpg`, `2123.jpg`, `54254.jpg`,
> `Cream-01/02.png`, `botanical1/2.jpg`). Grep `src/` and `docs/` for each
> filename before removal.

---

## 6. Generating Placeholders with a Script

When ready, create `scripts/generate-placeholders.ts` or a small Node script that uses `sharp` or `canvas` to generate all blocks from the token colors. This keeps placeholders consistent and reproducible.

Suggested command:

```bash
npm install -D sharp
node scripts/generate-placeholders.js
```

Until then, agents can create a few hand-made placeholder images or use simple gradients. The goal is **not perfection** — it is a non-broken, tonal layout.

---

## 7. Alt Text Rule

Every image in JSON must have `alt` text. Placeholder alt text should describe what the real image will be, e.g.:

```json
{
  "src": "/images/products/cashmere-robe-coat-1.jpg",
  "alt": "Cashmere Robe Coat — Black — front view on model"
}
```

Do not use "placeholder" or "image" as alt text.

---

## 8. What Agents Must Do

1. Build components assuming real imagery exists.
2. Use the JSON-driven paths and the shared `Image` component.
3. Generate or create a matching placeholder if an asset is missing.
4. Update this registry when an asset is replaced.
5. Never ship broken image links. If an image is missing, fall back to a tonal block from `public/images/placeholders/`.

---

## 9. Placeholder Checklist for Phase 1

- [ ] `public/images/placeholders/` folder exists.
- [ ] At least one hero placeholder exists.
- [ ] At least one placeholder per category exists.
- [ ] At least 2 placeholder images per product exist (default + hover).
- [ ] All image `src` paths in `products.json` and `categories.json` resolve to an existing file.
- [ ] Alt text is provided for every image.

