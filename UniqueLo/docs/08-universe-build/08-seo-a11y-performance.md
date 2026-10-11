# 08 — SEO, Accessibility & Performance

## SEO (per template)

- Title/meta per route; universe landings get lore-rich descriptions; PDP gets product-specific title + JSON-LD Product (INR, absolute image URLs, real availability).
- One H1 per page; clean slugs (`/universes/itihaas`, `/product/<slug>`); filter params canonicalized (noindex filtered URLs except curated ones).
- Sitemap includes universes + all products; images carry descriptive alt from DB.

## Accessibility (gates, not wishes)

- All interactive elements keyboard-reachable with visible focus; 44px minimum touch targets.
- Icon-only buttons labelled (`aria-label`); swatches/thumbnails use `aria-pressed`; accordions use `aria-expanded`; modals trap focus, label close, return focus on dismiss.
- Form errors associated with inputs + announced (`aria-live`); never color-only.
- Contrast: body text ≥ 4.5:1 **in every universe × vibe combo** — expressive themes must pass, not just neutral.
- `prefers-reduced-motion`: disable zoom lens, carousels auto-play, theme transitions.

## Performance budgets

- Lighthouse ≥ 90 (mobile) on home, universe landing, PDP.
- Route-level code-splitting (Shop/PDP/Atelier/Admin already lazy); images lazy below fold, `srcset` for gallery; JSON-LD inline, no render-blocking.
- No layout shift in gallery (fixed aspect slots) or theme swap (tokens pre-route).

## Decisions locked

1. Contrast gates apply to themed surfaces, no exemptions for expressive vibes.
2. Checkout flows must be fully operable keyboard-only (highest a11y priority).
3. Perf budgets are launch-blocking per template.
