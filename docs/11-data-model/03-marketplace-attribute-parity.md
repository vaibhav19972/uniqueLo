# 03 — Marketplace attribute parity: what Myntra and Ajio carry, and what we adopted

> Researched 2026-10-24 from Myntra and Ajio catalogue QC documentation and
> seller attribute matrices. Sources at the bottom. **The design conclusion is
> not "copy their fields" — it is "copy their structure".**

## The finding that shaped the design

Both marketplaces validate **mandatory attributes per article type, not
globally**. A tee requires neck, sleeve, pattern, length, occasion, wash care. A
scarf requires none of the garment-shape attributes. Footwear requires upper
material, sole, heel height, toe shape.

| Platform | Evidence |
|---|---|
| Myntra | "The article type controls many mandatory attributes. Selecting the wrong article type can trigger irrelevant fields." Core matrix: T-shirts = Fabric, Fit, Neck, Sleeve, Pattern, Length, Occasion, Wash Care, Size, Color; Dresses add Neckline and Lining |
| Ajio | "Required fields vary by article type. Common fields include neck type, sleeve length, pattern, fit, closure, rise, occasion, sole material, heel height, dimensions, capacity, package contents, and care instructions" |

Both also reject on the same non-negotiable legal set: **country of origin** and
**manufacturer / packer / importer** declarations.

## Why we did NOT add 30 columns

The obvious reading is "add the missing columns." That is precisely what produced
the original problem: 29 product columns of free text, several invented, and a
migration needed every time a garment type appeared. Myntra's own docs warn that
the attribute set changes as categories change — a column-per-attribute schema
cannot keep up without constant DDL.

So the schema copies their **structure**:

```
attribute_definitions   ← the contract (which attribute is required for which garment)
products.attributes     ← jsonb values, one column, unlimited attributes
products_validate_attributes()  ← trigger that enforces the contract
```

**Adding a garment type is an INSERT, not an ALTER.** That directly answers "so
we don't need to update it again and again."

Registry seeded with 14 attributes across 9 garment types:

| Group | Attributes |
|---|---|
| Style | `pattern`, `neck_type`, `sleeve_length`, `closure`, `length`, `rise`, `occasion`, `hemline`, `lining` |
| Fabric | `fabric_composition`, `fabric_weight_gsm`, `transparency`, `stretch` |
| Care | `iron_care` |

Deliberately **not** in the registry: `country_of_origin`, `manufacturer`,
`packer`, `wash_care`. Those already exist as first-class columns
(`country_of_origin`, `manufacturer_name`, `manufacturer_address`, `packed_by`,
`care`). Boundary rule: an attribute goes in `attributes` jsonb **only if it has
no dedicated column** — otherwise there are two places to fill and two to forget.

## What else the research surfaced that we were missing

| Field | Platform rationale | Adopted as |
|---|---|---|
| **Style code** | Ajio: "A style code should identify the intended product design or family. Reusing it for unrelated products, sizes or packs creates conflicts" — an explicit QC rejection | `products.style_code`, UNIQUE |
| **Barcode / EAN per variant** | Both: "Do not reuse one barcode across sizes or colours" | `variants.barcode`, UNIQUE, nullable |
| **Fit notes + model height + model worn size** | The "how it sits" line that reduces size-driven returns; both platforms require a validated size chart alongside | `fit_notes`, `model_height_cm`, `model_worn_size` |
| **Package dimensions** | Carriers bill volumetric weight; `weight_grams` alone mis-prices anything bulky | `package_length_mm/width_mm/height_mm` |
| **Rise** | Mandatory for bottoms on both platforms | registry, `applies_to: [pants]` |

## What we do NOT need

Researched and rejected, with reasons — this matters as much as what we added:

| Field | Why not |
|---|---|
| `season` / `collection_season` | Myntra uses it for merchandising campaigns. We run 3 universes, not seasonal buys. Add when there is a buying calendar. |
| `sole`, `heel_height`, `toe_shape` | Footwear attributes. We do not make footwear. |
| `capacity`, `package_contents`, `dimensions` (product, not package) | Non-apparel. |
| `lining` for tees/scarves | The registry allows it, but no garment type requires it — so it is available without being mandatory. |
| Separate `brand` column | Single-brand store. A brand field would always contain the same value. |
| `seller_name` / `seller_sku` | We are the seller. Adding these is marketplace-broker modelling. |
| `fit` as an enum | Already exists as a free `fit` text column; `fit_notes` covers the prose. Do not duplicate. |
| Supplier names / GSTIN **on the product** | Owner decision 2026-10-24: no supplier naming. Legal disclosure is `manufacturer_name`/`packed_by`, which is a declaration, not a vendor graph. The `suppliers` table was dropped from the migration for this reason. |

## Verified behaviour

All tested against Postgres 16.15 with the real schema + migration:

| Test | Result |
|---|---|
| tee, no attributes | rejected — lists all missing |
| tee, missing `neck_type` only | rejected — names `neck_type` |
| tee, `pattern: "tie-dye"` | rejected — not in allowed options |
| tee, complete + valid | accepted |
| scarf, minimal attributes | accepted — correctly needs no neck/sleeve |
| pants, no `rise` | rejected |
| pants, with `rise` | accepted |
| duplicate `style_code` | rejected |
| two products with NULL `style_code` | accepted (nulls don't collide) |
| duplicate `barcode` across sizes | rejected |
| NULL `barcode` | accepted (unscanned variants) |

## Owner decisions applied (2026-10-24)

| Decision | Implementation |
|---|---|
| COD on every SKU | `cod_available boolean not null default true` — a column, not a constant, so a per-SKU opt-out never needs a migration |
| Delivery per garment | `delivery_days_min/max` per product row |
| 7-day returns | `return_window_days smallint not null default 7`; `0` still means non-returnable for made-to-order |
| No supplier naming | `suppliers`/`product_suppliers` dropped; legal declarations are columns |

## Sources

- Myntra catalogue QC errors — digicommerce.in/blog/myntra-catalogue-qc-errors
- Category attribute matrix — ecomsarthi.com/seller/marketplaces/myntra
- Ajio listing QC errors — digicommerce.in/blog/ajio-listing-qc-errors-solutions
- Ajio seller guide (attribute templates) — streamoid.com/resources/guide/ajio-seller-guide

These are seller-side QC guides, not official platform schemas. They are
authoritative on *which attributes get rejected*, which is what we needed; they
are not a guarantee of current validation rules, which change.
