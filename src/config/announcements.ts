/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UNIQUE LO — ANNOUNCEMENT BAR CONFIGURATION & PRIORITY LIST
 * ─────────────────────────────────────────────────────────────────────────────
 * Flexible announcement system supporting continuous running marquee tickers,
 * live flashing beacon badges, spotlight rotator mode, and dynamic priority.
 *
 * Ordered by flexible priority from top (Priority 1 = highest precedence).
 */

export type AnnouncementBadgeStyle =
  | 'emerald'
  | 'cyan'
  | 'amber'
  | 'crimson'
  | 'purple'
  | 'gold'
  | 'default';

export type AnnouncementIconType =
  | 'lightning'
  | 'truck'
  | 'shield'
  | 'tracking'
  | 'craft'
  | 'gift'
  | 'flame'
  | 'hourglass';

export interface AnnouncementItem {
  id: string;
  text: string;
  /**
   * Numerical priority: 1 is the highest top-level priority, followed by 2, 3, etc.
   * Items are sorted ascending by priority so the top-priority items appear first.
   */
  priority: number;
  badge: string;
  badgeStyle: AnnouncementBadgeStyle;
  /**
   * If true, enables live flashing / pulsing beacon or glowing border effect.
   */
  isFlashing?: boolean;
  flashingStyle?: 'beacon' | 'badge' | 'urgent' | 'shimmer';
  beaconColor?: string;
  icon?: AnnouncementIconType;
  link?: string;
  highlightWords?: string;
  ariaLabel?: string;
}

export interface AnnouncementConfig {
  /**
   * Marquee run cycle duration in seconds (smaller = faster scroll).
   */
  speedSeconds: number;
  /**
   * Whether hovering pauses the running ticker marquee.
   */
  pauseOnHover: boolean;
  /**
   * Transition interval for single-item spotlight mode in ms.
   */
  spotlightIntervalMs: number;
  /**
   * Default active mode: 'marquee' (running ticker) or 'spotlight' (rotating flashcard).
   */
  defaultMode: 'marquee' | 'spotlight';
  /**
   * Initial priority filter threshold: 'all' to show all 8 items, or number for max priority.
   */
  priorityFilter: 'all' | 'top-priority';
}

export const ANNOUNCEMENT_CONFIG: AnnouncementConfig = {
  speedSeconds: 32,
  pauseOnHover: true,
  spotlightIntervalMs: 4500,
  defaultMode: 'marquee',
  priorityFilter: 'all',
};

/**
 * 8 Core Announcements requested by user, ordered with flexible priority from top:
 * 1. FREE SHIPPING!! ON ORDERS ABOVE ₹999
 * 2. COD AVAILABLE! PAN INDIA!!
 * 3. SECURE CHECKOUT. A SEAMLESS EXPERIENCE.
 * 4. TRACK YOUR ORDER AT EVERY STEP.
 * 5. MADE TO BE WORN. DESIGNED TO BE KEPT.
 * 6. YOUR FIRST ORDER, WITH A EXTRA GIFT
 * 7. NEW ARRIVALS. FRESH DESIGNS. EXPLORE!!.
 * 8. LIMITED DROP. WHEN IT'S GONE, IT'S GONE.
 */
export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'free-shipping-999',
    text: 'FREE SHIPPING!! ON ORDERS ABOVE ₹999',
    priority: 1, // Highest top priority
    badge: '⚡ FLASH DEAL',
    badgeStyle: 'emerald',
    isFlashing: true,
    flashingStyle: 'badge',
    beaconColor: '#10b981',
    icon: 'lightning',
    link: '/shop',
    highlightWords: 'ABOVE ₹999',
    ariaLabel: 'Free Shipping on orders above 999 Rupees',
  },
  {
    id: 'cod-pan-india',
    text: 'COD AVAILABLE! PAN INDIA!!',
    priority: 2,
    badge: '📦 ZERO RISK',
    badgeStyle: 'cyan',
    isFlashing: true,
    flashingStyle: 'beacon',
    beaconColor: '#06b6d4',
    icon: 'truck',
    link: '/shop',
    highlightWords: 'PAN INDIA!!',
    ariaLabel: 'Cash on Delivery available across Pan India',
  },
  {
    id: 'secure-checkout',
    text: 'SECURE CHECKOUT. A SEAMLESS EXPERIENCE.',
    priority: 3,
    badge: '🔒 100% SECURE',
    badgeStyle: 'default',
    isFlashing: false,
    icon: 'shield',
    link: '/shop',
    ariaLabel: 'Secure encrypted checkout and seamless shopping experience',
  },
  {
    id: 'order-tracking',
    text: 'TRACK YOUR ORDER AT EVERY STEP.',
    priority: 4,
    badge: '📍 LIVE RADAR',
    badgeStyle: 'cyan',
    isFlashing: true,
    flashingStyle: 'beacon',
    beaconColor: '#38bdf8',
    icon: 'tracking',
    link: '/shop',
    ariaLabel: 'Real time order tracking at every single step',
  },
  {
    id: 'made-to-be-worn',
    text: 'MADE TO BE WORN. DESIGNED TO BE KEPT.',
    priority: 5,
    badge: '✦ ATELIER CRAFT',
    badgeStyle: 'gold',
    isFlashing: false,
    icon: 'craft',
    link: '/our-craft',
    ariaLabel: 'Made to be worn, designed to be kept. Luxury atelier craftsmanship.',
  },
  {
    id: 'first-order-gift',
    text: 'YOUR FIRST ORDER, WITH A EXTRA GIFT',
    priority: 6,
    badge: '🎁 WELCOME PERK',
    badgeStyle: 'purple',
    isFlashing: true,
    flashingStyle: 'badge',
    beaconColor: '#c084fc',
    icon: 'gift',
    link: '/#atelier-list',
    highlightWords: 'EXTRA GIFT',
    ariaLabel: 'Your first order comes with an exclusive extra gift',
  },
  {
    id: 'new-arrivals',
    text: 'NEW ARRIVALS. FRESH DESIGNS. EXPLORE!!.',
    priority: 7,
    badge: '🔥 HOT DROP',
    badgeStyle: 'amber',
    isFlashing: true,
    flashingStyle: 'badge',
    beaconColor: '#f59e0b',
    icon: 'flame',
    link: '/new-featured',
    highlightWords: 'EXPLORE!!.',
    ariaLabel: 'Explore new arrivals and fresh designs',
  },
  {
    id: 'limited-drop',
    text: "LIMITED DROP. WHEN IT'S GONE, IT'S GONE.",
    priority: 8,
    badge: '⏳ RARE PIECES',
    badgeStyle: 'crimson',
    isFlashing: true,
    flashingStyle: 'urgent',
    beaconColor: '#f43f5e',
    icon: 'hourglass',
    link: '/collections',
    highlightWords: "GONE, IT'S GONE.",
    ariaLabel: "Limited drop edition: when it is gone, it is gone",
  },
];

/**
 * Returns announcements sorted by flexible priority from top (1, 2, 3...)
 * and optionally filtered by priority threshold.
 */
export function getPrioritizedAnnouncements(
  items: AnnouncementItem[] = DEFAULT_ANNOUNCEMENTS,
  filter: 'all' | 'top-priority' = 'all'
): AnnouncementItem[] {
  const sorted = [...items].sort((a, b) => a.priority - b.priority);
  if (filter === 'top-priority') {
    // Top 4 priority tier
    return sorted.filter((item) => item.priority <= 4);
  }
  return sorted;
}
