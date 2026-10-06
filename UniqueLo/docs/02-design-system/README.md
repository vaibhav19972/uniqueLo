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
     Colors
     ───────────────────────────────────── */
  --color-cream:        #f6f4ef; /* page background */
  --color-paper:        #ffffff; /* cards, drawer, menus */
  --color-ink:          #1a1a1a; /* primary text, buttons */
  --color-ink-muted:    #6b6b6b; /* secondary text */
  --color-stone:        #e5e2dc; /* borders, dividers */
  --color-warm-gray:    #9f9c96; /* placeholders, disabled */
  --color-accent:       #c06b52; /* CTAs, hover focus */
  --color-error:        #c9372d;
  --color-success:      #2f6b3a;

  /* ─────────────────────────────────────
     Typography
     ───────────────────────────────────── */
  --font-sans:  'Satoshi', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'Melodrama', 'Playfair Display', Georgia, 'Times New Roman', serif;

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
  --leading-normal:  1.5;
  --leading-relaxed: 1.7;

  --tracking-tight:  -0.04em;
  --tracking-normal: 0;
  --tracking-wide:   0.05em;
  --tracking-loose:  0.12em;

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
     Shadows (only for floating layers)
     ───────────────────────────────────── */
  --shadow-sm:   0 1px 2px rgba(26, 26, 26, 0.04);
  --shadow-md:   0 4px 12px rgba(26, 26, 26, 0.06);
  --shadow-lg:   0 12px 40px rgba(26, 26, 26, 0.08);
  --shadow-float: 0 24px 60px rgba(26, 26, 26, 0.12);

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
  --z-cursor:   900;
}

/* High-contrast / dark mode can be added later by overriding tokens.
   Phase 1 ships in light mode only. */
```

---

## 3. Font Strategy

### Primary: Satoshi (sans)
- Use for: UI, body, buttons, nav, product names, prices.
- Weights loaded: 400, 500, 700.
- Fallback: Inter → system-ui.

### Editorial: Melodrama (serif)
- Use for: hero headlines, editorial captions, lookbook callouts, section labels.
- Weights loaded: 400, 500.
- Fallback: Playfair Display (Google) → Georgia.

### Loading Rule
- **Target:** self-host font files in `public/fonts/` with `font-display: swap`.
- **Placeholder while assets are pending:** use the documented fallback stack. Do not block rendering on web fonts.
- Update `src/styles/globals.css` with `@font-face` rules once files are available.

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
- All-caps labels: `--tracking-wide` or `--tracking-loose`
- Body / nav: `--tracking-normal`

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
- Font: `--font-sans`, `--text-sm`, `--tracking-wide`, uppercase optional for CTAs.
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

