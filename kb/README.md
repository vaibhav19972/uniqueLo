# UniqueLo Knowledge Base

> **Memory graph** for the UniqueLo codebase, in Karpathy's llm-wiki format.
> Every page: YAML frontmatter + body + ≥2 `[[wikilinks]]`. Cross-checks live here,
> single-source-of-truth specs live in `../docs/`. Update `index.md` and `add-entry.md`
> whenever you touch this directory.

## Pages

| Page | Summary |
|---|---|
| [[catalog-spine]] | The whole storefront data pipeline |
| [[catalog-fallback-gate]] | The precedence chain + universe-schema feature detection |
| [[is-mock-guard-gap]] | **open bug** — `getProducts()` doesn't filter `is_mock = true` |
| [[universe-theming]] | Whole-site universe theming & token remaps |
| [[mood-vibe-taxonomy]] | Two-axis discovery (vibes × moods), gateway components |
| [[legacy-catalog-frozen]] | Why `products.json`/legacy `seed.sql` exist but never render |
| [[cart-flow]] | Stock clamping, checkout, orders seam |
| [[audit-trail]] | Reconciliation bug → remediation → what's still open |
| [[route-map]] | 10 lazy routes and what they mean |

## Conventions

- **Frontmatter is required** (title, type, updated, links, sources). `tags` can be
  freeform here — this KB is small enough to not need a taxonomy gate.
- `sources` = files (paths relative to repo root) or docs sections, never prose.
- One fact-cluster per page; if a page exceeds ~150 lines, split.
- Append-only changelog in the `## Changelog` of each page.
- Contradictions: mark `contested: true` and add both claims with dates.