import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { useWishlistStore } from '../../stores/wishlist';
import { useToastStore } from '../../stores/toast';
import { useUniverses } from '../../hooks/useCatalog';
import { prefersReducedMotion } from '../../lib/motion';
import { AnnouncementBar } from './AnnouncementBar';

export const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [universesOpen, setUniversesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.count());
  const showToast = useToastStore((state) => state.showToast);
  const { data: universes } = useUniverses();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 40) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Men', path: '/men' },
    { name: 'Women', path: '/women' },
    { name: 'New Arrivals', path: '/shop' },
    { name: 'Our Craft', path: '/atelier' },
  ];

  const isUniversesActive = location.pathname.startsWith('/universes');

  // Close the Universes menu on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUniversesOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeUniverses = () => setUniversesOpen(false);

  const handleWishlistClick = () => {
    if (wishlistCount === 0) {
      showToast({
        title: 'Your Wishlist is Empty',
        description: 'Tap the heart icon on any garment card to bookmark your desired pieces.',
        type: 'info',
      });
    } else {
      showToast({
        title: `Wishlist: ${wishlistCount} Pieces Saved`,
        description: 'Explore the Collections page to review and add them to your Atelier Bag.',
        actionLabel: 'Go to Collections',
        onAction: () => {
          window.location.href = '/shop';
        },
        type: 'accent',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[200] bg-cream/90 backdrop-blur-md border-b border-stone/60 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <AnnouncementBar />

      <div className="max-w-[var(--container-max)] mx-auto h-[var(--header-height)] px-4 sm:px-6 lg:px-12 flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden p-2 -ml-2 text-ink min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        {/* Left: Brand Wordmark */}
        <div className="flex-1 min-w-0">
          <Link
            to="/"
            className="group inline-flex flex-col tracking-tight focus-visible:outline-accent"
          >
            <span className="font-serif text-2xl sm:text-3xl text-ink font-normal transition-colors group-hover:text-accent flex items-center gap-1.5">
              <span>UniqueLo</span>
            </span>
            <span className="hidden sm:block text-[9px] font-sans tracking-[0.2em] text-ink-muted uppercase -mt-0.5">
              Hand-Embroidered Essentials • Made in India
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav aria-label="Primary" className="hidden md:flex items-center space-x-8 lg:space-x-10">
          {/* Universes dropdown — options rendered from data, never hardcoded */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setUniversesOpen(true)}
            onMouseLeave={() => setUniversesOpen(false)}
          >
            <button
              onClick={() => setUniversesOpen((v) => !v)}
              aria-expanded={universesOpen}
              aria-haspopup="true"
              className={`relative py-1 text-xs lg:text-sm uppercase tracking-[0.18em] font-medium transition-colors hover:text-ink inline-flex items-center gap-1.5 ${
                isUniversesActive ? 'text-ink font-semibold' : 'text-ink-muted'
              }`}
            >
              Universes
              <svg className={`w-3.5 h-3.5 transition-transform ${universesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              {isUniversesActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
              )}
            </button>

            {universesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-72">
                <div className="bg-paper border border-stone/70 shadow-xl py-2">
                  {(universes ?? []).map((u) => (
                    <Link
                      key={u.slug}
                      to={`/universes/${u.slug}`}
                      onClick={closeUniverses}
                      className="block px-5 py-3 hover:bg-cream transition-colors"
                    >
                      <span className="block font-serif text-lg text-ink">{u.name}</span>
                      <span className="block text-[11px] text-ink-muted mt-0.5">{u.tagline}</span>
                    </Link>
                  ))}
                  <Link
                    to="/shop"
                    onClick={closeUniverses}
                    className="block px-5 py-3 border-t border-stone/60 text-xs uppercase tracking-widest text-ink-muted hover:text-ink hover:bg-cream transition-colors"
                  >
                    All universes →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1 text-xs lg:text-sm uppercase tracking-[0.18em] font-medium transition-colors hover:text-ink ${
                  isActive ? 'text-ink font-semibold' : 'text-ink-muted'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent animate-in fade-in duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Account, Wishlist & Cart */}
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          {/* Search */}
          <Link
            to="/shop"
            aria-label="Search the collection"
            className="hidden sm:flex p-2 text-ink hover:text-accent transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
          </Link>

          {/* Account (stub — honest toast until accounts launch) */}
          <button
            onClick={() =>
              showToast({
                title: 'Atelier Accounts Are Coming Soon',
                description: 'Join the Atelier List below and we will invite you first.',
                type: 'info',
              })
            }
            aria-label="Account"
            className="hidden sm:flex p-2 text-ink hover:text-accent transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0" />
            </svg>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            aria-label={`Wishlist with ${wishlistCount} items`}
            className="hidden sm:flex group relative items-center space-x-1.5 p-2 text-ink hover:text-accent transition-colors focus-visible:outline-accent"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              fill={wishlistCount > 0 ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {wishlistCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] font-medium rounded-full bg-accent/90 text-paper">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            aria-label={`Cart with ${totalItems} items`}
            className="group relative hidden sm:flex items-center space-x-2.5 p-2 text-ink hover:text-accent transition-colors focus-visible:outline-accent"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-105"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-xs uppercase font-sans tracking-widest hidden sm:inline-block">
              Bag
            </span>
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full transition-all duration-300 ${
                totalItems > 0
                  ? 'bg-accent text-paper scale-100'
                  : 'bg-stone/80 text-ink-muted scale-95'
              }`}
            >
              {totalItems}
            </span>
          </button>

          {/* Mobile bag link — text variant reads better at 360–390px than an icon */}
          <button
            onClick={openCart}
            aria-label={`Cart with ${totalItems} items`}
            className="inline-flex sm:hidden items-center gap-2 px-3 py-2 text-xs uppercase tracking-widest text-ink border border-stone min-h-[44px]"
          >
            Bag · {totalItems}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav aria-label="Mobile" className="md:hidden bg-cream border-t border-stone/60 px-4 py-3 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.25em] text-ink-muted px-2 pt-1">Universes</p>
          {(universes ?? []).map((u) => (
            <Link
              key={u.slug}
              to={`/universes/${u.slug}`}
              onClick={() => setMobileOpen(false)}
              className="block px-2 py-3 font-serif text-2xl text-ink border-b border-stone/40"
            >
              {u.slug === 'itihaas' ? 'Itihas' : u.name}
            </Link>
          ))}
          {[
            { name: 'Men', path: '/men' },
            { name: 'Women', path: '/women' },
            { name: 'New Arrivals', path: '/shop' },
            { name: 'Our Craft', path: '/atelier' },
          ].map((l) => (
            <Link
              key={l.path + l.name}
              to={l.path}
              onClick={() => setMobileOpen(false)}
              className="block px-2 py-3 text-sm uppercase tracking-[0.18em] text-ink border-b border-stone/40"
            >
              {l.name}
            </Link>
          ))}
          <div className="flex items-center gap-2 px-2 py-3">
            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center px-2 py-3 text-sm uppercase tracking-[0.18em] text-ink border border-stone"
            >
              Search
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleWishlistClick();
              }}
              className="flex-1 px-2 py-3 text-sm uppercase tracking-[0.18em] text-ink border border-stone"
            >
              Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
