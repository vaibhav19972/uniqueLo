# 07 — Image Pipeline

> Goal: 6 consistent, non-repetitive images per SKU in fixed slots. Pipeline lives in `tools/catalog-image-harness/`; generation runs through the Custom GPT / Gemini Gem workflow (no paid API currently).

## The 6-slot contract (fixed order, every SKU)

| Idx | Slot | Source |
| :--- | :--- | :--- |
| 0 | hero-front (ghost-mannequin, studio) | generate |
| 1 | on-model-full (face away, neutral pose) | generate |
| 2 | flat-lay (max 2 props, rotation set) | generate |
| 3 | **embroidery-macro (MANDATORY, tack-sharp stitches)** | generate, human-review gate |
| 4 | placement-detail (resolved from motif placement → neckline/cuff/back/hem) | generate |
| 5 | lifestyle-atelier or folded-packaging (alternates by SKU hash) | generate |

DB mapping: `product_images.sort_order` 0–5 = slots 0–5. Alt text per image mandatory.

## Inputs per SKU

- `front.jpg` + `back.jpg` reference photos (in `tools/catalog-image-harness/inputs/<sku>/`).
- Metadata line: `SKU | garment | color | fabric | technique (1 of 9) | motif + placement | bridal?`.
- Technique macro adapter: character sheet per technique (zardozi sparkle vs kantha matte etc.) maintained with the harness prompts.

## Anti-clone rotation

Same slot type at each index across SKUs, but model/pose/props/backdrop rotate via seeded sets (A/B/C from SKU hash; user-overridable). Catalog reviews check cross-SKU variety, not just per-SKU quality.

## Quality gates (human, per SKU)

1. Identity: same garment as refs (silhouette, color, motif placement).
2. Color truth vs physical garment.
3. Slot 3: individual stitches + thread twist visible and sharp — **reject and regenerate otherwise**.
4. Forbidden scan: no text, watermark, logo, deformed hands/faces.
5. Record pass/fail in harness manifest before images enter `product_images` seed.

## Decisions locked

1. 6 fixed slots; slot 3 has a human review gate — no exceptions.
2. References + metadata are the only inputs; prompts aim for identity, not novelty.
3. Generated images enter the catalog only via the manifest → seed flow (parity rule, §03).
