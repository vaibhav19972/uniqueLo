# 01 — Vision & Scope

## Vision (one paragraph)

UniqueLo becomes the flagship store for hand-embroidered apparel organized as **themed universes** — Animeverse, Heroverse, Itihaas — each a fully reskinned world, filtered by four **vibe super-categories** (Aesthetic, Clean, Minimal, Expressive). One layout skeleton, N skins. Every product carries its motif's lore; craft proof (macro stitches, artisan hours) sits beside every price.

## Target buyers

1. **Fandom buyers** (18–34): buy meaning + identity; respond to drops, lore, UGC.
2. **Craft-luxury buyers** (28–55): buy provenance + quality; respond to artisan hours, natural dyes, inspection policy.
3. **Gift buyers**: respond to packaging, gift notes, festive drops.

## The three-axis taxonomy (locked)

- **Axis 1 — Universe** (extensible set, exactly 3 at launch): `animeverse`, `heroverse`, `itihaas`.
  A product belongs to exactly one universe. Adding a 4th universe later = one `universes` row + tokens; no component changes.
- **Axis 2 — Vibe** (extensible registry, 7 at launch): `aesthetic`, `clean`, `minimal`, `expressive` (featured) + `noir`, `pearl`, `gilded` (behind "More styles").
  Registry: `src/data/vibes.json` — one JSON row + one `[data-vibe]` CSS block per vibe, zero component changes. Featured vibes render as homepage gateway cards; the rest sit in the expandable "More styles" row. Vibe is a presentation filter, not a product attribute. Products carry an optional `vibes[]` **discovery hint** used only for gateway counts and entry filtering — rendering never reads it.
  *(Decision overturned Oct 2026: was "fixed 4". Extensible per owner directive.)*
- **Axis 2b — Mood** (buyer-intent families, 6 at launch, extensible): `everyday`, `statement`, `heritage`, `festive-gifting` (featured) + `comfort`, `collector`.
  Registry: `src/data/moods.json`. Products carry 1–3 `moods[]` tags. Moods answer "why am I shopping"; vibes answer "how loud should the page render". The two axes are labeled distinctly on the homepage ("Explore by Style" vs "Explore by Mood") so buyers never see one taxonomy under two names. Mood tags are curated, never auto-derived from universe (Heritage≈Itihaas is a coincidence, not a rule).
- **Axis 3 — Gender** (`men | women | unisex`): header links Men / Women are first-class routes (`/men`, `/women`) over the shared grid. `unisex` products appear under **both**. Gender is a product attribute (`products.gender`), filterable and URL-synced like any facet.
- **Garment types** (hoodie, tee, jacket, cap, tote…) are facets, never routes — new types need no IA changes.

## Non-goals (explicitly out of scope for this build)

- Real anime/superhero IP or licensed artwork (legal — see below).
- Multi-currency, international shipping, multi-language.
- Marketplace / multi-seller, custom tailoring measurements, AR try-on.
- Native apps. Mobile web responsive only.

## Legal constraint (blocks launch if violated)

Original-inspired motifs only. No trademarked characters, logos, names, or distinctive costume elements on garments, renders, lore copy, or marketing. Universe names must not collide with existing franchises. Review every motif + name against this rule before it enters `03-data-model.md` lore fields.

## Success metrics (post-launch, for reference)

- Universe landing → PDP click-through ≥ 25%.
- PDP macro-image engagement (zoom/hover) correlates with add-to-bag.
- UGC submissions ≥ 20/month by month 3.
- Build gates: `tsc --noEmit` clean, `npm run build` green, Lighthouse ≥ 90 on all templates.

## Decisions locked

1. 3 universes (extensible) × 7 vibes (extensible registry) × 6 moods (extensible registry) × gender (men/women/unisex), one layout skeleton. *(Vibe count relaxed from fixed-4 Oct 2026; registries live in `src/data/vibes.json` + `src/data/moods.json`.)*
2. Garment types and future categories are facets, not nav.
3. INR-only, India-only.
4. IP-originality rule is launch-blocking.
5. **Outlets, not data:** all render content (names, prices, counts, faces) is mock seed. Components must render empty/large/changed catalogs without edits.
6. Old 13-product `products.json` deleted as stale (2026-10-12); launch catalog = curated render mock SKUs.
