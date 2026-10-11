# 03 — Data Model

> Mirrors `supabase/schema.sql`. Existing tables are quoted verbatim; **§B** proposes the only allowed deltas for the universe build. `src/data/products.json` must stay in parity with seed data until the async migration seam (`07-backend`) is cut over.

## §A — Existing tables (do not redesign)

- **`categories`** (`slug` PK, name, label, description, image, order_num) → repurposed: rows become the 3 universes. `slug ∈ {animeverse, heroverse, itihaas}`.
- **`products`** (`slug` PK, name, subtitle, description, `category_slug` → universe, tags, featured, customizable, material[], care[], fit, batch_number/total, craft_region/cluster, fabric_gsm) → add-nothing; lore lives in §B tables.
- **`variants`** (`sku` PK, product_slug FK, color, color_hex, size, `price_cents`, `compare_at_price_cents`, status ∈ in-stock/low-stock/out-of-stock, quantity).
- **`product_images`** (product_slug FK, src, alt, color, `sort_order`) → `sort_order 0–5` maps to the 6 image slots (§07). Alt text mandatory.
- **`embroidery_details`** (product_slug FK unique, technique, technique_label, artisan_hours, placement[], thread_composition, motif_story, macro_image_src/alt).
- **`reviews`**, **`newsletter_subscribers`**, **`orders`** (customer_name/email, status, subtotal/discount/shipping/total_cents, coupon_code, gift_note, shipping_address jsonb), **`order_items`** (order FK, product_slug, variant_sku, snapshot name/color/size/price, quantity, customization jsonb).
- RLS: public read on catalog/review tables; public insert on newsletter/reviews/orders/order_items. No public update/delete.

## §B — Proposed deltas (universe build only)

1. **`universes`** (new): `slug` PK, name, tagline, lore (short), `theme_tokens` jsonb (see §04), emblem_src, `drop_cadence` text, `is_active` bool. Seed: 3 rows.
   - Alternative (no new table): keep universes in `categories` + a `universe_meta` jsonb column. Prefer the new table: lore + tokens deserve columns, not JSON soup.
2. **`products.universe_slug`** (new, FK → universes, not null after backfill): replaces semantic use of `category_slug` for universes; garment type moves to a `garment_type` text column (new, indexed, free vocabulary — new types need no migration).
2b. **`products.gender`** (new, text ∈ {`men`, `women`, `unisex`}, default `unisex`, indexed): drives `/men` + `/women` routes and the gender facet. Matching rule: `unisex` matches both.
2c. **`products.is_mock`** (new, bool, default false): storefront queries filter `is_mock = true` during the mock phase. The original 13 rows stay (`is_mock = false`, hidden) until real catalog lands — deprecate by flag, never by deletion.
2d. **`products.vibes`** (new, text[] default '{}'): style-axis discovery hints from `src/data/vibes.json` slugs. Powers the "Explore by Style" gateway counts and entry filtering only — rendering never reads it.
2e. **`products.moods`** (new, text[] default '{}', 1–3 entries, validated against `src/data/moods.json` slugs): buyer-intent tags powering the "Explore by Mood" gateway + mood facet. Curated per product; never auto-derived from universe. (Mock catalog backfilled Oct 2026; `supabase/schema.sql` + `seed.sql` delta pending the migration pass.)
3. **`motifs`** (new): `id` uuid PK, universe_slug FK, name, meaning (1–2 lines, buyer-facing lore), `symbol_notes` (design guidance for renders), `ip_cleared` bool default false. **Insert rule: `ip_cleared` must be true before any product references the motif.**
4. **`products.motif_id`** (new, nullable FK → motifs): links product → lore. PDP "story behind this motif" block renders from here.
5. **`drops`** (new): `id` uuid PK, universe_slug FK, title, `starts_at`, `ends_at`, hero_src, `is_live` generated or maintained. Powers the countdown + "New Issue" mechanics.
6. **`orders.payment_method`** (new, text ∈ {upi, card, cod}, not null after backfill) + **`orders.payment_state`** (∈ {pending, paid, failed, refunded}, default `pending`; COD orders go `pending` → `paid` on delivery confirmation via admin).
7. Indexes: `products(universe_slug)`, `products(garment_type)`, `motifs(universe_slug)`, `drops(universe_slug, starts_at)`.

## §C — Integrity rules

1. Every product: exactly one universe, one gender, ≥1 in-stock variant, exactly 6 images (`sort_order` 0–5), one embroidery_details row (nullable only for non-embroidered SKUs like plain lowers), `motif_id` set with `ip_cleared = true` when embroidered.
2. Prices: integer paise only; `compare_at_price_cents` required when showing a discount; never invent strikethroughs. **All render prices/names/counts are mock seed** (`is_mock`), swappable without UI changes.
3. Stock: `quantity` is source of truth for clamping; `status` derivation (`0 → out-of-stock`, `≤3 → low-stock`) applies at migration seeding. **Note:** current code stores `status` explicitly (no derivation in `data.ts` — see docs/07 §6); the migration must either implement this derivation in seed/mapping code or revise this rule.
4. Snapshots: order_items freeze name/price at purchase; later catalog edits must not rewrite history.
5. Seed parity: any catalog change lands in **both** the active seed file and `seed.sql` until migration. The deprecated `products.json` (original 13) is frozen — no edits, no parity duty.
6. Copy honesty: generic surfaces say "embroidery / threadwork", never "hand-". The `handcrafted` boolean (product-level, default false; Supabase: add column at the backend pass) gates the per-product "Handcrafted" tag on cards + PDP. Mock rule (≥30 embroidery-hours) is a placeholder — re-verify per SKU at cutover.

## Decisions locked

1. Universes get their own table; garment type becomes a facet column.
2. Motif lore is relational with an `ip_cleared` gate.
3. Payment method + state are order columns, not JSON.
4. Stock status derivation is the migration target (see §C.3 note — current code stores `status` explicitly); implement derivation at migration or revise.
