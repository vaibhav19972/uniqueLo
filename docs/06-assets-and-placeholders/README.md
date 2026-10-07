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

Update `products.json` image `src` to the real path once it exists. Until then, point `src` to the placeholder.

**Current state (Phase 6 audit):** the catalog's image paths point directly to real
files in `public/images/products/`, `public/images/categories/`, and
`public/images/campaigns/` — but those files are tonal placeholder blocks generated
per the spec in §4. The placeholder twins in `public/images/placeholders/` exist only
as broken-link fallbacks for the shared `Image` component. The naming-rule example
above pre-dates the actual catalog slugs.

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

- `--color-cream` #f6f4ef
- `--color-paper` #ffffff
- `--color-ink` #1a1a1a
- `--color-stone` #e5e2dc
- `--color-warm-gray` #9f9c96
- `--color-accent` #c06b52 (use sparingly, e.g., hero campaign blocks)

### Example Placeholder Spec

A hero placeholder is a 1920×1080 image:
- Background: vertical gradient from `#e5e2dc` (top) to `#9f9c96` (bottom).
- Subtle 2% noise overlay.
- No text, no logo, no UI.

---

## 5. Asset Registry

Use this table to track real assets as they arrive. Update it when a file is swapped.

| Type | Slug / Name | Current Path | Status | Real Asset Owner | Notes |
|------|-------------|--------------|--------|------------------|-------|
| Hero | home-hero | `/images/campaigns/hero.jpg` | placeholder | TBD | Needs campaign video or image |
| Category | outerwear | `/images/categories/outerwear.jpg` | placeholder | TBD | |
| Category | knitwear | `/images/categories/knitwear.jpg` | placeholder | TBD | |
| Category | tops | `/images/categories/tops.jpg` | placeholder | TBD | |
| Category | bottoms | `/images/categories/bottoms.jpg` | placeholder | TBD | |
| Category | accessories | `/images/categories/accessories.jpg` | placeholder | TBD | |
| Product | botanical-silk-embroidered-jacket | `/images/products/botanical-silk-jacket-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | celestial-zardozi-wool-coat | `/images/products/celestial-zardozi-coat-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | kantha-quilted-chore-jacket | `/images/products/kantha-chore-jacket-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | flora-crewel-cashmere-cardigan | `/images/products/crewel-cashmere-cardigan-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | french-knot-merino-turtleneck | `/images/products/french-knot-turtleneck-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | atelier-monogram-poplin-shirt | `/images/products/monogram-poplin-shirt-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | vine-embroidered-heavyweight-tee | `/images/products/vine-heavyweight-tee-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | selvedge-sashiko-embroidered-denim | `/images/products/sashiko-selvedge-denim-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | pleated-silk-zari-wool-trousers | `/images/products/pleated-zari-trousers-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | heritage-flora-embroidered-silk-scarf | `/images/products/embroidered-silk-scarf-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | artisanal-needlework-canvas-tote | `/images/products/needlework-canvas-tote-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Product | nocturne-velvet-crewel-vest | `/images/products/nocturne-velvet-vest-{1,2}.jpg` | placeholder | TBD | Front + macro detail |
| Editorial | atelier-craft | `/images/campaigns/atelier-craft.jpg` | placeholder | TBD | EditorialSplit secondary frame |
| Editorial | editorial-split | `/images/campaigns/editorial-split.jpg` | placeholder | TBD | EditorialSplit primary frame |
| Lookbook | lookbook 01–03 | `/images/campaigns/lookbook-0{1,2,3}.jpg` | placeholder | TBD | Lookbook carousel |

> All paths verified to exist on disk (Phase 6 audit). Every product slug in
> `products.json` maps to real files for both silhouette + macro views.

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

