# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Fandom Connoisseurs & Collectors:** Discerning fans of pop-culture aesthetics — anime icons and emotion, cosmic heroics, Indian royal heritage, and more — looking for elevated, high-taste, tactile apparel rather than cheap graphic tees or novelty merchandise.
- **Style-Conscious Shoppers:** Customers who navigate fashion through aesthetic intensity — seeking quiet daily-wear references (**Quiet**), clear measured storytelling (**Balanced**), or bold head-turning showcase garments (**Loud**).
- **Quality & Craft Enthusiasts:** Buyers who value texture, premium stitchwork, heavy-weight fabrics, and tangible garment details over disposable fast fashion.

## Product Purpose

- UniqueLo is an **India-first, mass-premium** embroidery e-commerce flagship (median ₹1,200–1,400, ceiling ₹3,000–4,000 — see `STAR_GOAL.md` §1) built as an **artisanal editorial base** with **Themed Micro-Stores** layered on top — immersive universe capsules (Animeverse, Heroverse, Itihaas; the set is intentionally open and extensible, including future creator collaborations). The Atelier is the neutral 4th door for products outside any universe.
- Success means delivering a chameleonic shopping experience where entering a theme immerses the customer in that universe's atmosphere (dynamic backgrounds, evocative colorways, interactive cues) while maintaining rock-solid, ultra-fast e-commerce ergonomics — and where every product, in or out of a universe, is genuine artisanal embroidery.

## Positioning

- **Where Craft Meets Cult Aesthetics:** Unlike mass-market graphic tee sites (e.g. Redbubble, generic merch stores) or single-franchise boutiques, UniqueLo positions fandom-adjacent fashion as **craft you can afford to own** — the same price conversation as India's leading pop-culture apparel brands, differentiated by real embroidery and original universes rather than licensed IP.
- **Original, Inspired-By Artwork Only:** Universes are expressed through **original artwork and atmospheres inspired by genres and aesthetics** (anime icons and emotion, cosmic heroics, Indian royal heritage), never through unlicensed trademarked IP. The universe roster is deliberately flexible — new capsules can be added without restructuring the product.
- **Intensity + Edits Taxonomy (2026-10-13):** Each piece answers one question per facet — Universe is where you are, garment type is what kind of thing, **Intensity (Quiet / Balanced / Loud)** is how loudly you wear it, craft technique is how it was made (provenance, 9 techniques), and **Edits** are curated shoppable collections by buyer intent (6 slugs in `src/data/edits.json`).
- **Unified Editorial Base, Themed Capsules:** Each universe is an artisanal capsule over a unified design base (The Atelier in v1, or Modern D2C Streetwear in v2 via `USE_THEME_V2`). Navigating between universes shifts editorial lore, ornament icons, and capsule collections without fragmenting the site's unified chrome, surface styling, or checkout.
- **Artisanal Core, Themed Capsules:** The base catalog is pure craft (zardozi, crewel, sashiko, aari — the atelier line); each universe adds its own themed capsule of embroidery rendered in those same techniques.

## Operating Context

- **Universe Micro-Store Navigation:** Browsing between distinct thematic capsules — Animeverse, Heroverse, Itihaas — plus the Atelier neutral door, with an intentionally extensible universe roster (future universes, creator collaborations) that can grow without redesign.
- **Intensity Filter Trio:** Effortless toggling between Quiet (tonal crests, discreet motifs), Balanced (clear story, held in measure), and Loud (full-panel artwork, rich textures, high-contrast storytelling). Products without an explicit value read as Balanced.
- **Edits Collections:** Curated shoppable collections by buyer intent (Everyday, Statement, Heritage, Festive & Gifting, Comfort, Collector), presented via the Edits gateway on Home.
- **Unified Design & Ambience:** Clean architectural canvas with crisp square geometry across all storefront sections, and rounded corners scoped exclusively to the Gokwik-style Cart Bag drawer.
- **Craft Provenance:** Craft technique (zari, sashiko, crewel, kantha… — 9 registered techniques) appears as product-level provenance detail, never as a primary browsing axis; the primary navigation axis is the universe.
- **Garment & Texture Inspection:** High-definition macro zoom on fabrics, embroidery reliefs, and variant swatches.
- **Frictionless Commerce:** Instant cart drawer opening, real-time stock-clamped inventory, and direct Supabase-backed order flows.

## Capabilities and Constraints

- **Technical Stack:** Vite + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + GSAP ScrollTrigger + Lenis smooth scroll + Supabase backend.
- **Dynamic Theming Engine:** Runtime theme and ambience manager capable of smoothly morphing background atmospheres, lighting, and palette accents per micro-store without layout thrashing or unmounts.
- **Extensible Universe Registry:** Universes are data-driven (not hard-coded routes), so new capsules, their palettes, and their atmospheres can be added configuration-first.
- **Performance Thresholds:** Sub-50ms interaction response, zero Cumulative Layout Shift (CLS), and stable 60–120 FPS transitions.
- **Factual Honesty:** Absolute integrity in stock counts, reviews, and garment specifications (no fabricated scarcity or false review metrics).
- **Legal Constraint:** No unlicensed trademarked IP (no official DC/Marvel/Wizarding-World marks, logos, or protected characters). Universe identities must be original aesthetic worlds (names, naming conventions, and artwork included) inspired by genre moods rather than specific franchises.

## Brand Commitments

- **Name:** UniqueLo.
- **Aura:** Cinematic, tactile, premium, and deeply atmospheric.
- **Design System Architecture:** Modular, reference-driven design system engineered to incorporate user-provided visual references for navigation, universe switchers, hero stages, product detail pages, and dynamic backgrounds.

## Evidence on Hand

- Fully operational React 19 + TypeScript + Vite codebase running locally on dev server.
- Catalog infrastructure: 13 curated products (121 variants) in `src/data/mock-products.json` (canonical storefront catalog, `isMock: true`; 5 Atelier / 3 Animeverse / 3 Heroverse / 2 Itihaas; intensity 5 Quiet / 4 Balanced / 4 Loud). Placeholders, category tiles, and campaign frames stay in-repo for owner updates. Supabase backend live for orders/newsletter (see docs/07).
- High-definition macro photography and garment assets in `public/images/` (products, categories, campaigns — placeholder tonal blocks pending the real shoot; see docs/06).
- Validated build pipeline: `tsc -b`, `vite build`, and `oxlint` all passing with 0 errors.

## Product Principles

1. **Fandom Aesthetics as Considered Design:** Treat genre moods with real design intent — original artwork, quality fabric, honest craft — rather than loud novelty slogans. Editorial sophistication is applied where it earns its cost, not everywhere.
2. **Atmospheric Immersion without Friction:** Themed environments should feel cinematic and alive, but core shopping mechanics (sizing, cart, pricing, checkout) must remain crystal clear and immediate.
3. **Aesthetic Polarity:** Provide clear, intentional navigation across design volume — from Quiet tone-on-tone pieces through Balanced storytelling to Loud show-stopping centerpieces.
4. **Performance is Trust:** Theme transitions, smooth scrolling, and interactive cards must stay smooth on a **mid-range Android over 4G** — not merely on a desktop Mac. Target sub-2s LCP; motion is confined to Home so PLP and PDP pay no scroll-tax.
5. **The Craft Never Dilutes:** Whatever universe a garment belongs to, it remains genuine artisanal embroidery with honest provenance — the theme changes the world, never the craft standard.

## Accessibility & Inclusion

- Dynamic themes must maintain strict WCAG AA contrast compliance across all ambient background shifts.
- Full `prefers-reduced-motion` support: users can enjoy ambient themes without disorienting motion effects.
- Semantic HTML and full keyboard accessibility for the universe switcher, product modals, and cart drawer.