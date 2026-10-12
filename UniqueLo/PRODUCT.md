# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Fandom Connoisseurs & Collectors:** Discerning fans of pop-culture aesthetics — superhero noir, wizarding academia, anime, and more — looking for elevated, high-taste, tactile apparel rather than cheap graphic tees or novelty merchandise.
- **Style-Conscious Shoppers:** Customers who navigate fashion through aesthetic intensity—seeking either understated, subtle daily-wear references (**Minimalist**) or bold, head-turning showcase garments (**Expressive**).
- **Quality & Craft Enthusiasts:** Buyers who value texture, premium stitchwork, heavy-weight fabrics, and tangible garment details over disposable fast fashion.

## Product Purpose

- UniqueLo is a luxury embroidery e-commerce flagship built as an **artisanal editorial base** (the quiet-luxury atelier) with **Themed Micro-Stores** layered on top — immersive universe capsules (e.g. noir-superhero, wizarding academia, anime — the set is intentionally open and extensible, including future creator collaborations).
- Success means delivering a chameleonic shopping experience where entering a theme immerses the customer in that universe's atmosphere (dynamic backgrounds, evocative colorways, interactive cues) while maintaining rock-solid, ultra-fast e-commerce ergonomics — and where every product, in or out of a universe, is genuine artisanal embroidery.

## Positioning

- **Where Haute Couture Meets Cult Aesthetics:** Unlike mass-market graphic tee sites (e.g. Redbubble, generic merch stores) or single-franchise boutiques, UniqueLo positions fandom-adjacent fashion as premium designer wear.
- **Original, Inspired-By Artwork Only:** Universes are expressed through **original artwork and atmospheres inspired by genres and aesthetics** (noir superheroics, wizarding academia, anime), never through unlicensed trademarked IP. The universe roster is deliberately flexible — new capsules (including anime and beyond) can be added without restructuring the product.
- **Dual Aesthetic Taxonomy:** Categorizes pieces by design intensity (Minimalist vs. Expressive) across thematic universes, allowing users to choose how loudly they wear their fandom.
- **Chameleonic Micro-Stores:** Each universe is a living micro-world over a quiet-luxury editorial base. Entering a theme dynamically shifts the ambient environment, background atmosphere, and design accents without breaking seamless single-page navigation or checkout.
- **Artisanal Core, Themed Capsules:** The base catalog is pure craft (zardozi, crewel, sashiko, aari — the atelier line); each universe adds its own themed capsule of embroidery rendered in those same techniques.

## Operating Context

- **Universe Micro-Store Navigation:** Browsing between distinct thematic capsules, with an intentionally extensible universe roster (future universes, anime themes, creator collaborations) that can grow without redesign.
- **Aesthetic Filter Spectrum:** Effortless toggling between Minimalist (subtle crests, tonal embroidery, discreet motifs) and Expressive (full-panel artwork, rich textures, high-contrast storytelling).
- **Dynamic Atmosphere Adaptation:** Switching themes triggers instantaneous visual transformation of ambient canvas, accent tokens, and sensory cues layered over the stable editorial base design.
- **Craft Provenance:** Within a capsule, craft technique (zari, sashiko, crewel, kantha…) appears as product-level provenance detail; the primary navigation axis is the universe.
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
- Catalog infrastructure: 5 curated products (31 variants) in `src/data/mock-products.json` (canonical storefront catalog, `isMock: true`; trimmed from 14 for local testing on 2026-10-12, Sakura fully dedicated). Placeholders, category tiles, and campaign frames stay in-repo for owner updates. Supabase backend live for orders/newsletter (see docs/07).
- High-definition macro photography and garment assets in `public/images/` (products, categories, campaigns — placeholder tonal blocks pending the real shoot; see docs/06).
- Validated build pipeline: `tsc -b`, `vite build`, and `oxlint` all passing with 0 errors.

## Product Principles

1. **Fandom Aesthetics as High Fashion:** Treat beloved genre moods with editorial sophistication—elevated typography, artisanal textures, and bespoke detailing over loud novelty slogans.
2. **Atmospheric Immersion without Friction:** Themed environments should feel cinematic and alive, but core shopping mechanics (sizing, cart, pricing, checkout) must remain crystal clear and immediate.
3. **Aesthetic Polarity:** Provide clear, intentional navigation across design volume—from quiet, tone-on-tone minimalism to expressive, show-stopping centerpieces.
4. **Performance is Luxury:** Theme transitions, smooth scrolling, and interactive cards must render at 60–120 FPS with zero lag or frame drops.
5. **The Craft Never Dilutes:** Whatever universe a garment belongs to, it remains genuine artisanal embroidery with honest provenance — the theme changes the world, never the craft standard.

## Accessibility & Inclusion

- Dynamic themes must maintain strict WCAG AA contrast compliance across all ambient background shifts.
- Full `prefers-reduced-motion` support: users can enjoy ambient themes without disorienting motion effects.
- Semantic HTML and full keyboard accessibility for the universe switcher, product modals, and cart drawer.