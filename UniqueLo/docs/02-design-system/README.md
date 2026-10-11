# 02 — Design System

> **Source of truth for look & feel.**  
> Every agent must use the tokens below. No hex codes, no magic numbers, no one-off `style={{}}` values in components.

---

## 1. Brand Direction: "Refined Editorial Minimal"

A premium, quiet palette inspired by Aesop and Bottega Veneta: generous whitespace, warm neutrals, and one restrained accent. Type is confident and large. Imagery is the hero; UI gets out of the way.

This is the default direction. If the brand pivots to bold/editorial or streetwear later, update this file first, then rebuild `tokens.css` and the components.

---

## 2. Tokens File

Copy the block below into `src/styles/tokens.css`. It is the only place where design values are authored.

```css
/* src/styles/tokens.css */
:root {
  /* ─────────────────────────────────────
     Colors (Elevated & Playful Luxury Palette)
     ───────────────────────────────────── */
  --color-cream:        #f7f5f0; /* refined atelier canvas */
  --color-paper:        #ffffff; /* cards, drawer, menus */
  --color-ink:          #141414; /* deep obsidian text */
  --color-ink-muted:    #686560; /* secondary text */
  --color-stone:        #e5e1d8; /* borders, dividers */
  --color-warm-gray:    #9e9b94; /* placeholders, disabled */

  /* Playful Haute Needlecraft Accents */
  --color-accent:          #d95d39; /* vibrant burnt terracotta — CTAs, hover focus */
  --color-accent-hover:    #b84624;
  --color-saffron:         #e69526; /* marigold thread accent */
  --color-gold-zari:       #cba043; /* 24K bullion gold wire */
  --color-pistachio:       #315e45; /* botanical needlework olive */
  --color-pistachio-light: #e8f0eb;
  --color-riviera:         #1c2b3d; /* midnight indigo */
  --color-blush:           #fbf1ec; /* soft silk petal blush */
  --color-parchment:       #faf8f5;

  --color-error:        #c9372d;
  --color-success:      #2f6b3a;

  /* ─────────────────────────────────────
     Typography
     ───────────────────────────────────── */
  --font-sans:  'Satoshi', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'Playfair Display', 'Melodrama', Georgia, 'Times New Roman', serif;

  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  2rem;      /* 32px */
  --text-4xl:  2.5rem;    /* 40px */
  --text-5xl:  3.5rem;    /* 56px */
  --text-6xl:  5rem;      /* 80px */
  --text-hero: clamp(3rem, 8vw, 9rem);

  --leading-tight:   1;
  --leading-snug:    1.15;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;

  --tracking-tight:  -0.04em;
  --tracking-normal: 0;
  --tracking-wide:    0.05em;
  --tracking-loose:   0.12em;

  /* Render-era treatments (chatgpt-v2 targets) */
  --tracking-eyebrow: 0.22em;  /* tracked-out caps micro-labels */
  --tracking-label:   0.15em;  /* caps card titles (ANIMEVERSE…) */
  --leading-display:  1.02;   /* tight hero/section display leading */
  --text-display:     clamp(3.5rem, 7.5vw, 8.75rem);  /* ~110–120px hero @1536w */
  --text-display-lg:  clamp(2.75rem, 5vw, 4.5rem);    /* ~64–70px section titles */

  /* ─────────────────────────────────────
     Spacing (matches Tailwind v4 scale)
     ───────────────────────────────────── */
  --spacing-0:  0;
  --spacing-1:  0.25rem;   /* 4px  */
  --spacing-2:  0.5rem;    /* 8px  */
  --spacing-3:  0.75rem;   /* 12px */
  --spacing-4:  1rem;      /* 16px */
  --spacing-5:  1.5rem;    /* 24px */
  --spacing-6:  2rem;      /* 32px */
  --spacing-8:  3rem;      /* 48px */
  --spacing-10: 4rem;      /* 64px */
  --spacing-12: 6rem;      /* 96px */
  --spacing-16: 8rem;      /* 128px */
  --spacing-20: 12rem;     /* 192px */

  --section-gap: var(--spacing-16);

  /* ─────────────────────────────────────
     Layout
     ───────────────────────────────────── */
  --container-max: 90rem;          /* 1440px */
  --container-padding: 1rem;       /* mobile  */
  --container-padding-md: 1.5rem;  /* >=768px */
  --container-padding-lg: 2rem;    /* >=1024px */
  --container-padding-xl: 3rem;    /* >=1280px */

  --header-height: 4.5rem; /* 72px */
  --drawer-width: 28rem;   /* 448px */

  /* ─────────────────────────────────────
     Radius
     ───────────────────────────────────── */
  --radius-none: 0;
  --radius-sm:   0.125rem;
  --radius-md:   0.25rem;
  --radius-lg:   0.5rem;
  --radius-xl:   1rem;
  --radius-full: 9999px;

  /* ─────────────────────────────────────
     Shadows & Depth
     ───────────────────────────────────── */
  --shadow-sm:   0 1px 2px rgba(20, 20, 20, 0.04);
  --shadow-md:   0 6px 16px rgba(20, 20, 20, 0.06);
  --shadow-lg:   0 16px 48px rgba(20, 20, 20, 0.09);
  --shadow-float: 0 28px 70px rgba(20, 20, 20, 0.14);

  --shadow-glow-gold:        0 0 25px rgba(203, 160, 67, 0.28);
  --shadow-glow-terracotta:  0 0 25px rgba(217, 93, 57, 0.25);

  /* ─────────────────────────────────────
     Z-Index
     ───────────────────────────────────── */
  --z-base:     0;
  --z-above:    10;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-drawer:   300;
  --z-modal:    400;
  --z-toast:    500;
}

/* High-contrast / dark mode can be added later by overriding tokens.
   Phase 1 ships in light mode only. */
```

---

## 3. Font Strategy

> **Render-era update (anti-gravity-design-rework):** the chatgpt-v2 renders
> are typographically *serif-forward* — one high-contrast display serif carries
> display, nav, body and CTAs; sans survives only as tracked-out caps
> eyebrows/micro-labels. The families below were swapped to match.
> Deviations remain logged in `sketches/design-renders/chatgpt-v2/README.md`.

### Primary: Playfair Display (serif)
- Use for: ALL editorial + functional text — hero/section display, nav links,
  body copy, buttons, prices, product names.
- File: `Playfair-Display-Variable.woff2` (wght 400–900) +
  `Playfair-Display-VariableItalic.woff2` (true italic — poetic taglines,
  e.g. render 2 mood taglines). Self-hosted in `public/fonts/`.
- Fallback: Melodrama (display-only, no italic cut) → Georgia.

### Functional accent: Satoshi (sans)
- Use ONLY for: tracked-out caps eyebrows/micro-labels (`--tracking-eyebrow`,
  `--tracking-label`), e.g. "THREADS ACROSS WORLDS", "ANIMEVERSE".
- File: `Satoshi-Variable.woff2` (300–900). Self-hosted.
- Fallback: Inter → system-ui.

### Loading Rule
- Self-hosted in `public/fonts/`, declared in `src/styles/fonts.css`
  (imported via `globals.css`), `font-display: swap`. Plain `format('woff2')`
  syntax; variable axes engaged via the `font-weight: <min> <max>` descriptor.
- If the computed font on a page is a fallback, that's a bug — usually fonts
  not loaded, never "Inter/Georgia as an intentional choice".

---

## 4. Type Scale Rules

| Token | Use |
|-------|-----|
| `--text-hero` | Home hero headline |
| `--text-6xl` | Full-bleed editorial statement |
| `--text-5xl` | Lookbook title |
| `--text-4xl` | Shop page headline |
| `--text-3xl` | Section headline, footer brand |
| `--text-2xl` | Editorial sub-headline |
| `--text-xl`  | Product name, mega-menu category |
| `--text-lg`  | Intro paragraph, filter labels |
| `--text-base`| Body, prices, nav links |
| `--text-sm`  | Captions, metadata, badges |
| `--text-xs`  | Legal, tags, tertiary labels |

### Leading Defaults
- Headlines: `--leading-snug`
- Body: `--leading-relaxed`
- UI labels / prices: `--leading-normal`
- Large display: `--leading-tight`

### Tracking Defaults
- Headlines: `--tracking-tight`
- Tracked-out caps eyebrows / micro-labels: `--tracking-eyebrow` (0.22em) / `--tracking-label` (0.15em) — Satoshi only (§3)
- Other all-caps labels: `--tracking-wide` or `--tracking-loose`
- Body / nav: `--tracking-normal` (serif-forward system — Playfair carries body, nav, CTAs; see §12.1)

---

## 5. Color Rules

| Token | Use |
|-------|-----|
| `--color-cream` | page background, newsletter section |
| `--color-paper` | cards, cart drawer, menus, inputs |
| `--color-ink` | primary text, primary button fill, footer background |
| `--color-ink-muted` | secondary text, placeholders, strikethrough |
| `--color-stone` | borders, dividers, subtle backgrounds |
| `--color-warm-gray` | disabled, empty image blocks |
| `--color-accent` | quick-add hover, active filters, focus ring, sale banner |
| `--color-error` | form errors, cart errors |
| `--color-success` | toast confirmations |

### Surface Pairings
- Page background: `bg-cream`
- Cards / drawers: `bg-paper`
- Primary button: `bg-ink text-cream`
- Secondary button: `bg-transparent border-ink text-ink`
- Hover on secondary: `bg-ink text-cream`
- Footer: `bg-ink text-cream`

---

## 6. Spacing Rules

- **Page side padding:** `var(--container-padding)` responsive.
- **Section vertical gaps:** `var(--section-gap)` (128px) between major sections.
- **Card grids:** gap `var(--spacing-4)` mobile, `var(--spacing-6)` desktop.
- **Component internal padding:** prefer `--spacing-4`, `--spacing-5`, `--spacing-6`.
- **Nav links / buttons:** padding `--spacing-4` horizontal, `--spacing-3` vertical.
- **Drawer padding:** `--spacing-6` internal.

---

## 7. Layout Rules

- **Max container width:** `var(--container-max)` (1440px), centered with auto margins.
- **Header height:** `var(--header-height)` (72px). All scroll padding and pinned-section offsets must use this token.
- **Drawer width:** `var(--drawer-width)` (448px) from the right edge.
- **Breakpoints:** Tailwind defaults (`sm:640 md:768 lg:1024 xl:1280 2xl:1536`).
- **Grid defaults:**
  - Product grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` with gap `--spacing-6`.
  - Editorial split: `grid-cols-1 lg:grid-cols-2`.
  - Category strip: horizontal scroll on mobile, equal-width grid on desktop.

---

## 8. Component Primitive Rules

### Button
- Height: `2.75rem` (44px) for standard, `3.25rem` (52px) for large.
- Padding: `0 var(--spacing-6)`.
- Radius: `--radius-none` (fashion sites usually square buttons) or `--radius-sm` for subtle.
- Font: `--font-serif` (serif-forward system — Playfair carries nav, body, CTAs; Satoshi reserved for tracked-out caps eyebrows/micro-labels, see §3 + §12.1), `--text-sm`, `--tracking-wide`, uppercase optional for CTAs.
- Transition: `color, background-color, border-color, transform` over `--duration-normal` with `--ease-out-expo` (see motion doc).

### Input
- Height: `2.75rem`.
- Border: `1px solid var(--color-stone)`.
- Background: `var(--color-paper)`.
- Focus ring: `2px solid var(--color-accent)` offset `2px`.
- Radius: `--radius-none`.

### Image Container
- Aspect ratios: `3/4` for product cards, `4/5` for editorial, `16/9` for lookbook, `9/16` for hero mobile / campaign.
- Overflow hidden, object-cover.
- Lazy-load + blur-up via the shared `Image` component.

### Card
- No border-radius or `--radius-sm`.
- No shadow on cards; floating layers (drawer, menu) use `--shadow-lg` / `--shadow-float`.
- Image swap on hover via opacity crossfade of two stacked images.

---

## 9. Tailwind v4 Mapping

Tailwind v4 reads theme values from CSS custom properties. In `src/styles/globals.css`, map the tokens above using `@theme`. Example:

```css
@import "tailwindcss";
@theme {
  /* colors */
  --color-cream:        var(--color-cream);
  --color-paper:        var(--color-paper);
  --color-ink:          var(--color-ink);
  --color-ink-muted:    var(--color-ink-muted);
  --color-stone:        var(--color-stone);
  --color-warm-gray:    var(--color-warm-gray);
  --color-accent:       var(--color-accent);
  --color-error:        var(--color-error);
  --color-success:      var(--color-success);

  /* fonts */
  --font-sans:  var(--font-sans);
  --font-serif: var(--font-serif);

  /* spacing */
  --spacing-section: var(--section-gap);
  --spacing-header:  var(--header-height);
  --spacing-drawer:  var(--drawer-width);
}
```

Keep the default Tailwind scale for utilities that are not explicitly overridden (e.g., `w-4`, `p-2`). Add custom tokens only when a semantic name is needed.

---

## 10. Accessibility Rules

- Minimum body text size: `var(--text-base)` (16px).
- Minimum interactive target size: `44px`.
- Focus ring color: `var(--color-accent)`.
- Never rely on color alone for state. Pair with text, underline, or icon.
- Respect `prefers-reduced-motion` for all transitions and animations (see motion doc).

---

## 11. What Agents Must Not Do

- Hard-code hex/rgb/hsl values outside `tokens.css`.
- Use `!important` on utility classes.
- Use `style={{}}` for layout/dimensions unless for GSAP scrub-driven transforms.
- Add new font families or weights without updating this file and loading the assets.
- Invent new breakpoints or container widths.

---

## 12. Anti-Generic Art Direction (Phase 6 enforcement)

These rules exist to keep the site looking *designed*, not generated. They are
checkable in code review, and every new component must pass them.

### 12.1 Typography discipline
- **The brand fonts are Playfair Display (serif) and Satoshi (sans) — self-hosted in `public/fonts/`.**
  Melodrama/Inter/Georgia are fallback stacks only, never intentional choices. If the
  computed font on a page is a fallback, that's a bug (usually: fonts not loaded).
- **Playfair Display (serif) carries display AND functional text** (nav, body,
  CTAs — chatgpt-v2 render language). Satoshi (sans) is reserved for
  tracked-out caps eyebrows/micro-labels. Sans appearing on body/nav/buttons
  is a render-era regression.
- Never center long-form paragraphs. Editorial text is left-aligned with a max
  measure of ~65 characters.
- Avoid `font-weight` jumps between adjacent elements (e.g., 400 → 700 mid-UI);
  step through the loaded weights.

### 12.2 Color restraint
- **One accent moment per viewport.** The terracotta accent appears at most once
  per screenful (a CTA, an underline, a price tag) — never as section backgrounds,
  gradients, or borders en masse.
- Do not introduce new colors for states/success/warning beyond the token set.
- Photography carries the color of the site; UI stays neutral (cream/ink/stone).

### 12.3 Layout & shadow discipline
- **Asymmetric, type-led compositions over card grids.** If a section reads as
  "3 equal cards in a row," redesign it: offset columns, oversized numerals,
  hairline dividers, varying image ratios.
- Shadows only on true floating layers (drawer, modal, sticky header on scroll).
  Cards sit flat; separation comes from whitespace and hairlines (`--color-stone`).
- Full-bleed imagery is allowed to touch viewport edges; UI containers never
  exceed `--container-max`.
- Section rhythm alternates: full-width editorial → contained grid → full-bleed.
  Two consecutive same-shape sections is a smell.

### 12.4 Motion restraint
- Motion reveals content (masks, fades on scroll entry); it never decorates
  (pulsing badges, floating blobs, parallax on everything).
- One signature scroll interaction per page (e.g., pinned lookbook), not five.

### 12.5 Content & imagery voice
- No emoji in UI, and no stock-photo-looking imagery inside editorial sections.
- Microcopy is short, declarative, and brand-voiced ("Cut for movement",
  not "Sign up for our amazing newsletter!").
- Generated placeholder images are acceptable only during build phases and must
  be tracked in `docs/06-assets-and-placeholders` with replacement intent.

