/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ANNOUNCEMENT STRIP — the facts a first-time buyer needs before they shop
 * ─────────────────────────────────────────────────────────────────────────────
 * This file used to hold eight promotional messages, every one of which made a
 * claim the business cannot back:
 *
 *   "1ST ANNIVERSARY LAUNCH OFFER! 50% OFF ON ALL ARTICLES"  — no catalogue-wide
 *       discount exists. `compare_at_price_cents` is null on all 197 variants.
 *   "FREE SHIPPING!! ON ORDERS ABOVE ₹999"                   — the live shipping
 *       rule (`20261101_checkout_pricing.sql`) is ₹99 flat, waived above ₹1,499.
 *   "YOUR FIRST ORDER, WITH A EXTRA GIFT"                    — there is no gift.
 *   "LIMITED DROP. WHEN IT'S GONE, IT'S GONE."               — fabricated scarcity,
 *       which PRODUCT.md rules out by name.
 *
 * Repeating them every 32 seconds above a sticky header is the most-seen copy on
 * the site, so those were the most-seen false claims on it.
 *
 * What replaces them is the dispatch, payment and return terms — the three
 * things an India-first D2C buyer actually scans a header for, and all three
 * readable from `shipping_rules` and the product rows.
 *
 * There is no marquee. A permanent CSS animation across the top of every page
 * costs a compositor layer and continuous frames on the mid-range Android the
 * brief names as the target, and it makes the strip the loudest moving thing on
 * a page whose whole thesis is that the catalogue is the composition.
 */

export type AnnouncementItem = {
  id: string;
  text: string;
  /** Optional second line or qualifier. Rendered at the same reading size. */
  detail?: string;
  link?: string;
  ariaLabel?: string;
};

/** Terms shown in the header strip. Change them here; nothing else hardcodes them. */
export const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'dispatch',
    text: 'Dispatch 4–7 days',
    link: '/our-craft',
    ariaLabel: 'Orders dispatch from the workshop in 4 to 7 days',
  },
  {
    id: 'cod',
    text: 'Cash on delivery, pan-India',
    ariaLabel: 'Cash on delivery is available across India',
  },
  {
    id: 'returns',
    text: '7-day returns',
    ariaLabel: 'Seven day return window on every piece',
  },
  {
    id: 'carriage',
    text: '₹99 carriage, free above ₹1,499',
    ariaLabel: 'Carriage is 99 rupees, waived on orders above 1,499 rupees',
  },
];

/** Kept for callers that want the first item only. */
export const DEFAULT_ANNOUNCEMENTS = ANNOUNCEMENTS;
