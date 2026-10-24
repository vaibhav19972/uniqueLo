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

Update the image `src` in `src/data/mock-products.json` (the canonical catalog)
to the real path once it exists. Until then, point `src` to the placeholder.

**Current state (2026-10-12):** the storefront catalog is
`src/data/mock-products.json` (5 curated products, 31 variants;
`isMock: true`). Its image `src` paths point at real files in
`public/images/products/`, `public/images/categories/`, and
`public/images/placeholders/` (all referenced paths verified on disk,
2026-10-12). `sakura-ronin-hoodie` is fully dedicated (v1 spec-board crop);
the other 4 SKUs **reuse** atelier files plus category/placeholder frames
until their dedicated boards land. The old `src/data/products.json` (13
atelier SKUs) was deleted as stale — 24 unreferenced files in
`public/images/products/` went with it. Placeholders, category tiles, and
campaign frames stay in the repo by intent (owner-updated).

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

> **Curated catalog (2026-10-12).** The **storefront** registry is derived
> from `src/data/mock-products.json` (5 curated products, 31 variants) — SKUs
> not yet re-shot *reuse* atelier files plus category/placeholder frames, so
> they are listed with their effective 6-image sets, pending dedicated shoots
> via the All-in-One spec-board intake. The local `products.json` 13-SKU line
> was deleted as stale; its DB-side record lives on in `backend/seed.sql`.
> The JSON file is the source of truth for which images the catalog references
> — never regenerate this table from folder listings.

### Storefront (mock-products.json — 5 SKUs; Sakura dedicated, rest borrowed)

| Universe | Product (slug) | Effective image set | Dedicated assets? |
|---|---|---|---|
| Animeverse | sakura-ronin-hoodie | `sakura-ronin-hoodie-{1..6}.jpg` (cropped from v1 spec board, 2026-10-12) | ✅ dedicated |
| Animeverse | roaring-spirit-tee | sashiko-denim-2, french-knot-1, crewel-cardigan-1, nocturne-vest-1, monogram-shirt-1 + hero placeholder | ❌ pending shoot |
| Heroverse | ascendant-hoodie | french-knot-{1,2}, crewel-cardigan-2, kantha-jacket-1, sashiko-denim-1 + outerwear category frame | ❌ pending shoot |
| Heroverse | herald-cape-jacket | nocturne-vest-2, kantha-jacket-2, pleated-trousers-2, scarf-2, crewel-cardigan-1 + outerwear category frame | ❌ pending shoot |
| Itihaas | royal-procession-jacket | kantha-jacket-2, pleated-trousers-1, scarf-1, vine-tee-1, sashiko-denim-1 + knitwear category frame | ❌ pending shoot |

*(Effective sets above were derived from `mock-products.json` on 2026-10-12.
Verify against the JSON before relying on this snapshot.)*

### Retired atelier files (deleted 2026-10-12)

24 unreferenced files were removed from `public/images/products/` after an
assert-checked sweep (every deletion verified absent from the kept catalog):
junk-named captures (`112.jpg`, `1322.jpg`, `14.jpg`, `2123.jpg`, `54254.jpg`,
`Cream-01/02.png`, `botanical1/2.jpg`), oversized `.png` twins, and orphaned
pairs (`botanical-*`, `celestial-*`, `needlework-canvas-tote-*`,
`monogram-poplin-shirt-2.jpg`, `vine-heavyweight-tee-2.jpg`). Remaining
atelier files are all referenced by the kept 5 SKUs and are replaced as
dedicated boards land — never delete a file still listed in the table above
without updating the JSON first.

### Placeholders, categories, campaigns (kept in repo by intent)

| Type | Path | Status |
|------|------|--------|
| Hero / placeholders | `/images/placeholders/*` | placeholder — kept, owner-updated |
| Category | `/images/categories/<slug>.jpg` (5) | placeholder — kept, owner-updated |
| Campaigns / lookbook / editorial | `/images/campaigns/*` (hero, universe heroes, lookbook 01–03, editorial) | placeholder — kept, owner-updated |

> All storefront-referenced paths verified to exist on disk (2026-10-12 check:
> 5 products, 0 missing).

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
- [ ] At least 6 images per product exist (slots 0–5 per the 6-slot contract).
- [ ] All image `src` paths in `mock-products.json` and `categories.json` resolve to an existing file.
- [ ] Alt text is provided for every image.

