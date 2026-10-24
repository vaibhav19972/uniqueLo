# Web design references

Screenshots of the target storefront design, captured 2026-10-13. These are **visual
references, not shipped assets** — they show what the build should look like, and are not
imported by any component.

| Folder | Contents |
|---|---|
| `home/` | `home-section-1.png` … `home-section-8.png` — the homepage top to bottom, in order |
| `navigation/` | `left-topbar-menu-1.png` … `-3.png` — the left slide-out nav |
| `commerce/` | `bag.png`, `product-card-add-to-cart.png` |
| `newsletter/` | `newsletter-subscription.png` |

Notes:

- `home-section-1.png` was originally named `home setion 1.png` (typo in the source);
  renamed on import. Section order is the file number.
- Compare against `web/DESIGN.md` for tokens and type scale — where a screenshot and
  `DESIGN.md` disagree, `DESIGN.md` wins and the screenshot is stale.
- Nothing here is optimised for web delivery. Do not copy into `web/public/`.

> Footer note: these screenshots predate the audit correction recorded in `web/audit.md`
> (BUG-2) — the newsletter form is `Newsletter.tsx`, not a footer element.
