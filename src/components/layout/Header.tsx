import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { useWishlistStore } from '../../stores/wishlist';
import { useFiltersStore } from '../../stores/filters';
import { useAuthStore } from '../../stores/auth';
import { useUniverses, useExpressions, useGarments } from '../../hooks/useCatalog';
import { prefersReducedMotion } from '../../lib/motion';
import { AnnouncementBar } from './AnnouncementBar';

type NavMenuKey = 'worlds' | 'styles' | 'clothing' | 'new-featured' | 'our-craft' | null;

export const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeMenu, setActiveMenu] = useState<NavMenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<NavMenuKey>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.count());
  const openWishlist = useWishlistStore((state) => state.openWishlist);
  const setSearchQuery = useFiltersStore((state) => state.setSearchQuery);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openModal);
  const openAccountDrawer = useAuthStore((state) => state.openAccountDrawer);

  const { data: universes } = useUniverses();
  const { data: expressions } = useExpressions();
  const { data: garments } = useGarments();

  // Focus the overlay input whenever it opens.
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchQuery(searchValue.trim());
    setSearchOpen(false);
    if (location.pathname !== '/shop') navigate('/shop');
  };

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

  // Close menus on Escape or route change
  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeMenu = () => setActiveMenu(null);

  const handleWishlistClick = () => {
    openWishlist();
  };

  // Active path helpers
  const isWorldsActive = location.pathname.startsWith('/worlds') || location.pathname.startsWith('/universes');
  const isStylesActive = location.pathname.startsWith('/styles') || location.pathname.startsWith('/expression');
  const isClothingActive = location.pathname.startsWith('/clothing') || location.pathname.startsWith('/garments') || location.pathname === '/shop';
  const isNewActive = location.pathname.startsWith('/new-featured');
  const isCraftActive = location.pathname.startsWith('/our-craft') || location.pathname.startsWith('/atelier');

  // Garment highlights for dropdown (tops & main silhouettes)
  const coreGarments = (garments ?? []).slice(0, 6);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 bg-cream/90 backdrop-blur-md border-b border-stone/60 transition-transform duration-500 ease-base ${
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
        <div className="flex-1 md:flex-initial min-w-0 md:mr-8 lg:mr-12">
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 tracking-tight focus-visible:outline-accent"
            aria-label="UniqueLo home"
          >
            <span aria-hidden="true" className="text-gold-deep text-lg leading-none">✳</span>
            <span className="font-serif text-2xl sm:text-3xl text-ink font-bold transition-colors group-hover:text-accent">
              UniqueLo
            </span>
          </Link>
        </div>

        {/* Center: Primary Navigation (Spec Section 2) */}
        <nav aria-label="Primary" className="hidden md:flex items-center space-x-6 lg:space-x-8">
          
          {/* 1. WORLDS */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMenu('worlds')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/worlds"
              onClick={closeMenu}
              className={`relative py-1 text-sm lg:text-base font-normal transition-colors hover:text-ink inline-flex items-center gap-1 ${
                isWorldsActive ? 'text-ink font-semibold' : 'text-ink-muted'
              }`}
            >
              Worlds
              <svg className={`w-3.5 h-3.5 transition-transform ${activeMenu === 'worlds' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              {isWorldsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
              )}
            </Link>

            {activeMenu === 'worlds' && (
              <div className="absolute top-full left-0 pt-3 w-80">
                <div className="bg-paper border border-stone/70 shadow-2xl py-2 animate-in fade-in duration-200">
                  <div className="px-5 py-2 border-b border-stone/40">
                    <span className="text-xs uppercase font-sans tracking-eyebrow text-accent font-medium">
                      Thematic Collections
                    </span>
                  </div>
                  {(universes ?? []).map((u) => (
                    <Link
                      key={u.slug}
                      to={`/worlds/${u.slug}`}
                      onClick={closeMenu}
                      className="block px-5 py-3 hover:bg-cream transition-colors group"
                    >
                      <span className="block font-serif text-lg text-ink group-hover:text-accent transition-colors">
                        {u.name}
                      </span>
                      <span className="block text-xs text-ink-muted mt-0.5 line-clamp-1">
                        {u.tagline}
                      </span>
                    </Link>
                  ))}
                  {/* Cosmic & Mythos teaser */}
                  <div className="px-5 py-3 border-t border-stone/40 opacity-70 bg-cream/40">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base text-ink">Cosmic & Mythos</span>
                      <span className="text-xs uppercase tracking-widest text-accent font-medium bg-accent/10 px-2 py-0.5">
                        Coming Soon
                      </span>
                    </div>
                    <span className="block text-xs text-ink-muted mt-0.5">
                      Celestial folklore & cosmic legends
                    </span>
                  </div>
                  <Link
                    to="/worlds"
                    onClick={closeMenu}
                    className="block px-5 py-3 border-t border-stone/60 text-xs font-serif text-ink-muted hover:text-ink hover:bg-cream transition-colors"
                  >
                    All Worlds →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 2. STYLES (Signature System) */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMenu('styles')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/styles"
              onClick={closeMenu}
              className={`relative py-1 text-sm lg:text-base font-normal transition-colors hover:text-ink inline-flex items-center gap-1 ${
                isStylesActive ? 'text-ink font-semibold' : 'text-ink-muted'
              }`}
            >
              Styles
              <svg className={`w-3.5 h-3.5 transition-transform ${activeMenu === 'styles' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              {isStylesActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
              )}
            </Link>

            {activeMenu === 'styles' && (
              <div className="absolute top-full left-0 pt-3 w-88">
                <div className="bg-paper border border-stone/70 shadow-2xl py-2 animate-in fade-in duration-200">
                  <div className="px-5 py-2 border-b border-stone/40">
                    <span className="text-xs uppercase font-sans tracking-eyebrow text-accent font-medium">
                      Embroidery Style & Density (1–5)
                    </span>
                  </div>
                  {(expressions ?? []).map((exp) => (
                    <Link
                      key={exp.slug}
                      to={`/styles/${exp.slug}`}
                      onClick={closeMenu}
                      className="block px-5 py-2.5 hover:bg-cream transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-base text-ink group-hover:text-accent transition-colors">
                          {exp.name}
                        </span>
                        <span className="text-xs font-sans uppercase tracking-widest text-ink-muted">
                          Level {exp.score}
                        </span>
                      </div>
                      <span className="block text-xs text-ink-muted mt-0.5 line-clamp-1">
                        {exp.tagline}
                      </span>
                    </Link>
                  ))}
                  <Link
                    to="/styles"
                    onClick={closeMenu}
                    className="block px-5 py-3 border-t border-stone/60 text-xs font-serif text-ink-muted hover:text-ink hover:bg-cream transition-colors"
                  >
                    Explore All Styles →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. CLOTHING */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMenu('clothing')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/clothing"
              onClick={closeMenu}
              className={`relative py-1 text-sm lg:text-base font-normal transition-colors hover:text-ink inline-flex items-center gap-1 ${
                isClothingActive ? 'text-ink font-semibold' : 'text-ink-muted'
              }`}
            >
              Clothing
              <svg className={`w-3.5 h-3.5 transition-transform ${activeMenu === 'clothing' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              {isClothingActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
              )}
            </Link>

            {activeMenu === 'clothing' && (
              <div className="absolute top-full left-0 pt-3 w-72">
                <div className="bg-paper border border-stone/70 shadow-2xl py-2 animate-in fade-in duration-200">
                  <div className="px-5 py-2 border-b border-stone/40">
                    <span className="text-xs uppercase font-sans tracking-eyebrow text-accent font-medium">
                      Shop by Garment Type
                    </span>
                  </div>
                  {coreGarments.map((g) => (
                    <Link
                      key={g.slug}
                      to={`/clothing/${g.slug}`}
                      onClick={closeMenu}
                      className="block px-5 py-2.5 hover:bg-cream transition-colors group"
                    >
                      <span className="block font-serif text-base text-ink group-hover:text-accent transition-colors">
                        {g.name}
                      </span>
                      <span className="block text-xs text-ink-muted mt-0.5 line-clamp-1">
                        {g.description}
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-stone/60">
                    <Link
                      to="/clothing"
                      onClick={closeMenu}
                      className="block px-5 py-2.5 text-xs font-serif text-ink hover:text-accent hover:bg-cream transition-colors"
                    >
                      All Garments →
                    </Link>
                    <Link
                      to="/shop"
                      onClick={closeMenu}
                      className="block px-5 py-2.5 bg-cream/80 text-xs font-sans font-medium uppercase tracking-wider text-ink hover:text-accent transition-colors"
                    >
                      Shop All Catalog →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. NEW & FEATURED */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMenu('new-featured')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/new-featured"
              onClick={closeMenu}
              className={`relative py-1 text-sm lg:text-base font-normal transition-colors hover:text-ink inline-flex items-center gap-1 ${
                isNewActive ? 'text-ink font-semibold' : 'text-ink-muted'
              }`}
            >
              New & Featured
              <svg className={`w-3.5 h-3.5 transition-transform ${activeMenu === 'new-featured' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              {isNewActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
              )}
            </Link>

            {activeMenu === 'new-featured' && (
              <div className="absolute top-full left-0 pt-3 w-72">
                <div className="bg-paper border border-stone/70 shadow-2xl py-2 animate-in fade-in duration-200">
                  <div className="px-5 py-2 border-b border-stone/40">
                    <span className="text-xs uppercase font-sans tracking-eyebrow text-accent font-medium">
                      Curated Editions
                    </span>
                  </div>
                  <Link
                    to="/new-featured/new-arrivals"
                    onClick={closeMenu}
                    className="block px-5 py-2.5 hover:bg-cream transition-colors group"
                  >
                    <span className="block font-serif text-base text-ink group-hover:text-accent transition-colors">
                      New Arrivals
                    </span>
                    <span className="block text-xs text-ink-muted mt-0.5">
                      Fresh threadwork from our atelier
                    </span>
                  </Link>
                  <Link
                    to="/new-featured/bestsellers"
                    onClick={closeMenu}
                    className="block px-5 py-2.5 hover:bg-cream transition-colors group"
                  >
                    <span className="block font-serif text-base text-ink group-hover:text-accent transition-colors">
                      Bestsellers
                    </span>
                    <span className="block text-xs text-ink-muted mt-0.5">
                      Most coveted garments in the archive
                    </span>
                  </Link>
                  <Link
                    to="/new-featured/limited-editions"
                    onClick={closeMenu}
                    className="block px-5 py-2.5 hover:bg-cream transition-colors group"
                  >
                    <span className="block font-serif text-base text-ink group-hover:text-accent transition-colors">
                      Limited Editions
                    </span>
                    <span className="block text-xs text-ink-muted mt-0.5">
                      Hand-numbered, small batch runs
                    </span>
                  </Link>
                  <Link
                    to="/collections"
                    onClick={closeMenu}
                    className="block px-5 py-2.5 hover:bg-cream transition-colors group"
                  >
                    <span className="block font-serif text-base text-ink group-hover:text-accent transition-colors">
                      Collections (Seasonal Drops)
                    </span>
                    <span className="block text-xs text-ink-muted mt-0.5">
                      Themed capsules across universes & garments
                    </span>
                  </Link>
                  <Link
                    to="/new-featured"
                    onClick={closeMenu}
                    className="block px-5 py-3 border-t border-stone/60 text-xs font-serif text-ink-muted hover:text-ink hover:bg-cream transition-colors"
                  >
                    All Featured Pieces →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 5. OUR CRAFT */}
          <Link
            to="/our-craft"
            className={`relative py-1 text-sm lg:text-base font-normal transition-colors hover:text-ink ${
              isCraftActive ? 'text-ink font-semibold' : 'text-ink-muted'
            }`}
          >
            Our Craft
            {isCraftActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent animate-in fade-in duration-300" />
            )}
          </Link>
        </nav>

        {/* Right: Utility actions */}
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-label={searchOpen ? 'Close search' : 'Search the collection'}
            className="flex p-2 text-ink hover:text-accent transition-colors min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
          </button>

          {/* Account: sign-in trigger when signed out, account panel when signed in */}
          <button
            onClick={() => (user ? openAccountDrawer() : openAuthModal('signin'))}
            aria-label={user ? 'Open account panel' : 'Sign in to your account'}
            className="relative flex p-2 text-ink hover:text-accent transition-colors min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0" />
            </svg>
            {user && (
              <span className="absolute bottom-1 sm:bottom-1.5 right-1 sm:right-1.5 w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            aria-label={`Wishlist with ${wishlistCount} items`}
            className="flex group relative items-center p-2 text-ink hover:text-accent transition-colors focus-visible:outline-accent min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-4 h-4 rounded-full bg-accent text-white text-xs font-sans font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag */}
          <button
            onClick={openCart}
            aria-label={`Cart with ${totalItems} items`}
            className="relative flex items-center p-2 text-ink hover:text-accent transition-colors min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-4 h-4 rounded-full bg-accent text-white text-xs font-sans font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanding search overlay - Works on both mobile & desktop */}
      {searchOpen && (
        <div className="border-t border-stone/60 bg-cream animate-in fade-in duration-200">
          <form
            onSubmit={submitSearch}
            role="search"
            className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3"
          >
            <svg className="w-5 h-5 shrink-0 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search anime, heroes, stitches, garments…"
              aria-label="Search the collection"
              className="flex-1 bg-transparent font-serif text-sm sm:text-lg text-ink placeholder:text-ink-muted/70 focus:outline-none min-h-[40px] sm:min-h-[44px] min-w-0"
            />
            <button
              type="submit"
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-panel-raised text-white text-xs sm:text-xs uppercase tracking-label hover:bg-gold hover:text-on-gold transition-colors min-h-[40px] sm:min-h-[44px] shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="p-1.5 sm:p-2 text-ink-muted hover:text-ink min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px] flex items-center justify-center shrink-0"
            >
              ✕
            </button>
          </form>
        </div>
      )}

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <nav aria-label="Mobile" className="md:hidden bg-cream border-t border-stone/60 px-4 py-4 space-y-2 max-h-[85vh] overflow-y-auto">
          {/* Worlds Accordion */}
          <div className="border-b border-stone/40 pb-2">
            <button
              onClick={() => setMobileExpandedSection(mobileExpandedSection === 'worlds' ? null : 'worlds')}
              className="w-full py-2.5 flex items-center justify-between text-left"
            >
              <span className="font-serif text-2xl text-ink">Worlds</span>
              <span className="text-sm font-sans">{mobileExpandedSection === 'worlds' ? '–' : '+'}</span>
            </button>
            {mobileExpandedSection === 'worlds' && (
              <div className="pl-3 py-1 space-y-2">
                {(universes ?? []).map((u) => (
                  <Link
                    key={u.slug}
                    to={`/worlds/${u.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1 text-sm font-serif text-ink"
                  >
                    {u.name}
                  </Link>
                ))}
                <Link
                  to="/worlds"
                  onClick={() => setMobileOpen(false)}
                  className="block py-1 text-xs uppercase tracking-wider text-accent font-medium"
                >
                  All Worlds →
                </Link>
              </div>
            )}
          </div>

          {/* Styles Accordion */}
          <div className="border-b border-stone/40 pb-2">
            <button
              onClick={() => setMobileExpandedSection(mobileExpandedSection === 'styles' ? null : 'styles')}
              className="w-full py-2.5 flex items-center justify-between text-left"
            >
              <span className="font-serif text-2xl text-ink">Styles</span>
              <span className="text-sm font-sans">{mobileExpandedSection === 'styles' ? '–' : '+'}</span>
            </button>
            {mobileExpandedSection === 'styles' && (
              <div className="pl-3 py-1 space-y-2">
                {(expressions ?? []).map((exp) => (
                  <Link
                    key={exp.slug}
                    to={`/styles/${exp.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1 text-sm font-serif text-ink"
                  >
                    Level {exp.score}: {exp.name}
                  </Link>
                ))}
                <Link
                  to="/styles"
                  onClick={() => setMobileOpen(false)}
                  className="block py-1 text-xs uppercase tracking-wider text-accent font-medium"
                >
                  All Styles →
                </Link>
              </div>
            )}
          </div>

          {/* Clothing Accordion */}
          <div className="border-b border-stone/40 pb-2">
            <button
              onClick={() => setMobileExpandedSection(mobileExpandedSection === 'clothing' ? null : 'clothing')}
              className="w-full py-2.5 flex items-center justify-between text-left"
            >
              <span className="font-serif text-2xl text-ink">Clothing</span>
              <span className="text-sm font-sans">{mobileExpandedSection === 'clothing' ? '–' : '+'}</span>
            </button>
            {mobileExpandedSection === 'clothing' && (
              <div className="pl-3 py-1 space-y-2">
                {coreGarments.map((g) => (
                  <Link
                    key={g.slug}
                    to={`/clothing/${g.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1 text-sm font-serif text-ink"
                  >
                    {g.name}
                  </Link>
                ))}
                <Link
                  to="/clothing"
                  onClick={() => setMobileOpen(false)}
                  className="block py-1 text-xs uppercase tracking-wider text-accent font-medium"
                >
                  All Garments →
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="block py-1 text-xs uppercase tracking-wider text-ink font-semibold"
                >
                  Shop All Catalog →
                </Link>
              </div>
            )}
          </div>

          {/* New & Featured */}
          <div className="border-b border-stone/40 pb-2">
            <Link
              to="/new-featured"
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 font-serif text-2xl text-ink"
            >
              New & Featured
            </Link>
          </div>

          {/* Collections */}
          <div className="border-b border-stone/40 pb-2">
            <Link
              to="/collections"
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 font-serif text-2xl text-ink"
            >
              Collections
            </Link>
          </div>

          {/* Our Craft */}
          <div className="border-b border-stone/40 pb-2">
            <Link
              to="/our-craft"
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 font-serif text-2xl text-ink"
            >
              Our Craft
            </Link>
          </div>

          {/* Account Section in Mobile Menu */}
          <div className="border-b border-stone/40 pb-3 pt-2">
            {user ? (
              <div className="bg-paper border border-stone/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-accent font-medium block">Atelier Account</span>
                    <p className="font-serif text-base text-ink truncate mt-0.5">
                      {(user.user_metadata?.full_name as string | undefined)?.trim() || user.email?.split('@')[0] || 'Customer'}
                    </p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" aria-label="Signed in" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone/30">
                  <Link
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-2 px-2 text-xs font-mono tracking-wider uppercase text-ink border border-stone/60 hover:bg-cream transition-colors"
                  >
                    My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openAccountDrawer();
                    }}
                    className="text-center py-2 px-2 text-xs font-mono tracking-wider uppercase text-ink border border-stone/60 hover:bg-cream transition-colors cursor-pointer"
                  >
                    Addresses
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-paper border border-stone/60 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs uppercase tracking-wider text-ink-muted block">Atelier Account</span>
                  <p className="text-xs text-ink mt-0.5">Sign in to sync pieces & track orders</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openAuthModal('signin');
                  }}
                  className="px-3.5 py-2 bg-panel-raised text-white hover:bg-gold hover:text-ink text-xs font-mono uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="flex-1 text-center px-2 py-3 text-xs uppercase tracking-label text-ink border border-stone"
            >
              Search
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleWishlistClick();
              }}
              className="flex-1 px-2 py-3 text-xs uppercase tracking-label text-ink border border-stone"
            >
              Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
