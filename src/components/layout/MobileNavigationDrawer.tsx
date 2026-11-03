import React from 'react';
import { Link } from 'react-router';
import { useUIStore, type GenderTab } from '../../stores/ui';
import { useAuthStore } from '../../stores/auth';

interface CategoryItem {
  name: string;
  href: string;
  badge?: string;
}

const MEN_CATEGORIES: CategoryItem[] = [
  { name: "All Men's Pieces", href: '/men', badge: 'VIEW ALL' },
  { name: 'Tops & Shirts', href: '/shop?gender=men&category=tops', badge: 'POPULAR' },
  { name: 'Outerwear & Hoodies', href: '/shop?gender=men&category=outerwear' },
  { name: 'Bottoms & Trousers', href: '/shop?gender=men&category=bottoms' },
  { name: 'Knitwear & Vests', href: '/shop?gender=men&category=knitwear' },
  { name: 'Accessories & Totes', href: '/shop?category=accessories' },
];

const WOMEN_CATEGORIES: CategoryItem[] = [
  { name: "All Women's Pieces", href: '/women', badge: 'VIEW ALL' },
  { name: 'Embroidered Tops', href: '/shop?gender=women&category=tops', badge: 'POPULAR' },
  { name: 'Cardigans & Knitwear', href: '/shop?gender=women&category=knitwear', badge: 'HOT' },
  { name: 'Bottoms & Trousers', href: '/shop?gender=women&category=bottoms' },
  { name: 'Outerwear & Capes', href: '/shop?gender=women&category=outerwear' },
  { name: 'Silk Scarves & Totes', href: '/shop?category=accessories' },
];

const WORLDS_CATEGORIES: CategoryItem[] = [
  { name: 'Itihaas (Heritage Court)', href: '/worlds/itihaas', badge: 'LORE' },
  { name: 'Animeverse (Shonen Line)', href: '/worlds/animeverse', badge: 'DROP' },
  { name: 'Heroverse (Legacy Line)', href: '/worlds/heroverse' },
  { name: 'Atelier (Core Line)', href: '/atelier' },
  { name: 'Explore All Worlds', href: '/worlds', badge: 'VIEW' },
];

export const MobileNavigationDrawer: React.FC = () => {
  const isOpen = useUIStore((state) => state.isMobileMenuOpen);
  const setOpen = useUIStore((state) => state.setMobileMenuOpen);
  const activeTab = useUIStore((state) => state.activeGenderTab);
  const setActiveTab = useUIStore((state) => state.setActiveGenderTab);
  const openAuthModal = useAuthStore((state) => state.openModal);

  if (!isOpen) return null;

  const currentCategories =
    activeTab === 'WOMEN'
      ? WOMEN_CATEGORIES
      : activeTab === 'MEN'
        ? MEN_CATEGORIES
        : WORLDS_CATEGORIES;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-[86vw] max-w-[360px] flex-col bg-white text-neutral-900 shadow-2xl">
        {/* Header Bar */}
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-black tracking-tight text-neutral-900">
              UNIQUELO
            </span>
            <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              STREETWEAR
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-11 w-11 items-center justify-center -mr-2 text-neutral-500 hover:text-black"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 3-Segmented Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-neutral-200 bg-neutral-50 text-center font-bold text-xs uppercase tracking-wider">
          {(['MEN', 'WOMEN', 'ACCESSORIES'] as GenderTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative flex h-12 items-center justify-center transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-white text-black font-black'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                {tab === 'ACCESSORIES' ? 'WORLDS' : tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-neutral-100 no-scrollbar">
          {/* Main Category List */}
          <div className="py-2 space-y-0.5">
            {currentCategories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] items-center justify-between py-2 text-[13px] font-bold uppercase tracking-tight text-neutral-800 hover:text-black active:bg-neutral-50"
              >
                <span>{cat.name}</span>
                {cat.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider ${
                      cat.badge === 'HOT'
                        ? 'bg-red-600 text-white'
                        : cat.badge === 'VIEW ALL' || cat.badge === 'POPULAR'
                          ? 'bg-black text-white'
                          : 'bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Hub Links */}
          <div className="py-3 space-y-1">
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center justify-between py-1 text-xs font-black uppercase tracking-wider text-black"
            >
              <span>Browse All Pieces</span>
              <span>→</span>
            </Link>
            <Link
              to="/new-featured"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:text-black"
            >
              <span>New &amp; Featured Drops</span>
              <span>★</span>
            </Link>
            <Link
              to="/our-craft"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:text-black"
            >
              <span>Our Craft &amp; Provenance</span>
              <span>🧵</span>
            </Link>
          </div>

          {/* In-Drawer Campaign Promo Card */}
          <div className="py-3">
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="block overflow-hidden rounded-xl bg-black p-3.5 text-white transition hover:opacity-95"
            >
              <span className="inline-block rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                UNIQUELO DROP
              </span>
              <p className="mt-1.5 text-xs font-black uppercase tracking-wide">
                100% HEAVYWEIGHT COMBED COTTON
              </p>
              <p className="text-[11px] text-neutral-400">
                Handcrafted embroidery on 400 GSM Indian cotton.
              </p>
            </Link>
          </div>
        </div>

        {/* Bottom Sticky Utility Bar */}
        <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-neutral-800">
            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-xs border border-neutral-200"
            >
              <span>📦</span>
              <span>Track Order</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openAuthModal('signin');
              }}
              className="flex min-h-[44px] items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-xs border border-neutral-200"
            >
              <span>👤</span>
              <span>Account / Login</span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
            <span>🇮🇳 INR ₹ (India)</span>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-700 hover:underline"
            >
              WhatsApp Concierge →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
