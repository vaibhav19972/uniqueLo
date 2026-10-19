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

---

## All-in-One Spec-Board Intake (v1, 2026-10-12)

Owner-supplied shortcut: instead of six separate uploads, a **single spec-board
PNG** holding all six views in fixed placements is cropped into the six slots
by `src/lib/cropSpecBoard.ts` (canvas-based, zero new deps) or the Admin
Studio All-in-One mode, which uploads the six crops to the `product-images`
bucket and writes the URLs into SQL + JSON.

### v1 board geometry (measured off `Cherry Blossom Hoodie Spec Board.png`, 1312×1199)

- Grid: **3 columns × 2 rows**. Each cell = photo area + numbered label strip.
- Column photo bounds (x, px): `[3, 436]` · `[443, ~871]` (measured —
  the middle divider drifts left of the full-height-scan estimate) · `[931, 1308]`
  (vertical dividers and label strips excluded).
- Row photo bounds (y, px): top `[3, 554]` · bottom `[601, 1147]`
  (top label strip ≈555–600 and bottom label strip ≈1148–1198 are excluded;
  no divider line separates the top strip from the bottom photos, so the
  boundary is positional, not detected).
- Safety inset: 4px on every side (label/divider bleed guard).
- Reference fractions (of W/H) with inset applied at crop time:
  cols `[0.0023, 0.3323]` · `[0.3377, 0.664]` · `[0.7096, 0.9969]`;
  rows top `[0.0025, 0.4621]` · bottom `[0.5013, 0.9566]`.
  **Caution (learned 2026-10-12):** dividers drift between boards — the
  reference middle-column divider sits at x≈873 top / x≈862 bottom, well left
  of a full-height scan estimate. Fixed fractions ALONE bleed a white line +
  neighbor sliver into middle-column crops. The cropper therefore
  measures each board at runtime (`detectGeometry`) and uses these fractions
  as fallback priors only.
- Resulting crops ≈ 434×548px (aspect ≈ 0.79 — PDP renders `object-cover`
  at 3:4, so no distortion).

### Cell → slot mapping (identity: cell N → `sort_order` N−1)

| Cell | Board label | Slot | PDP role |
|---|---|---|---|
| 1 | Full front | 0 hero-front | Gallery, cards, recs |
| 2 | Full back | 1 on-model-full | Card hover, community strip |
| 3 | Three-quarter profile | 2 scale view | Detail strip "Premium fabric" |
| 4 | Hood / neckline detail | 3 embroidery-macro | Detail strip, motif-story band |
| 5 | Cuff / hem / sleeve macro | 4 placement-detail | Detail strip, community strip |
| 6 | Front embroidery / fabric macro | 5 macro/scale | Detail strip, community strip |

### Rules

1. The v1 template is **fixed-format**: 3×2 + label strips as measured. A board
   with a different grid is a new contract version (config flag in the
   cropper), never silent guessing.
2. Label-strip scan: crops are rejected if dark text pixels are detected in
   the bottom 8% band (label bleed check) — see `validateCrops()`.
3. Slot-3 human gate still applies: the macro crop must show individual
   stitches + thread twist, else regenerate the board.
4. Alt text per slot follows the templates in `SPEC_BOARD_SLOTS`
   (`<Product> — <colorway> — <slot description>`).
