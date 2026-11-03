import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useUIStore } from '../../stores/ui';
import { useCartStore } from '../../stores/cart';
import { useWishlistStore } from '../../stores/wishlist';
import { useAuthStore } from '../../stores/auth';
import { useFiltersStore } from '../../stores/filters';

const PLACEHOLDERS = [
  'Search uniquelo',
  'Search for Oversized Hoodie',
  'Search for Cargo Pants',
  'Search for Graphic Tees',
  'Search for Anime Drops',
  'Search for Silk Scarves',
];

type NavMenuKey = 'men' | 'women' | 'clothing' | 'worlds' | 'styles' | null;

export const StickyGlassHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [activeMenu, setActiveMenu] = useState<NavMenuKey>(null);
  const [scrollY, setScrollY] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const showSearch = isScrolled || !isHome;

  const isAnnouncementDismissed = useUIStore((state) => state.isAnnouncementDismissed);
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const cartCount = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistStore((state) => state.count());
  const openWishlist = useWishlistStore((state) => state.openWishlist);
  const closeWishlist = useWishlistStore((state) => state.closeWishlist);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openModal);
  const openAccountDrawer = useAuthStore((state) => state.openAccountDrawer);
  const closeAccountDrawer = useAuthStore((state) => state.closeAccountDrawer);
  const setSearchQuery = useFiltersStore((state) => state.setSearchQuery);

  const handleOpenAccount = () => {
    closeCart();
    closeWishlist();
    if (user) {
      openAccountDrawer();
    } else {
      openAuthModal('signin');
    }
  };

  const handleOpenWishlist = () => {
    closeAccountDrawer();
    closeCart();
    openWishlist();
  };

  const handleOpenCart = () => {
    closeAccountDrawer();
    closeWishlist();
    openCart();
  };

  // Scroll detection: header tracks announcement bar, then locks at top-0 & turns solid white
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      if (y > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header dynamic top offset: sits right under announcement bar (36px), slides up to 0 as user scrolls
  const headerTop = isAnnouncementDismissed ? 0 : Math.max(0, 36 - scrollY);

  // Cleanup hover timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Cycling animated search placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setSearchQuery(searchValue.trim());
    navigate(`/shop?q=${encodeURIComponent(searchValue.trim())}`);
  };

  const handleMenuEnter = (key: NavMenuKey) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveMenu(key);
  };

  const handleMenuLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  const closeDropdown = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveMenu(null);
  };

  return (
    <header
      style={{ top: `${headerTop}px` }}
      className={`fixed left-0 right-0 z-40 w-full transition-[background-color,border-color,box-shadow,color] duration-300 ${
        isScrolled || !isHome
          ? 'bg-white text-black shadow-sm border-b border-[#E5E5E5]'
          : 'bg-transparent text-white border-b border-transparent shadow-none'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* ── ROW 1: Mobile Header Top Row (or Single Row on Desktop) ── */}
        <div className="flex h-14 items-center justify-between px-4 lg:h-18 lg:px-8">
          {/* Left: Hamburger Button + Desktop Nav with Hover Dropdowns */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Open mobile navigation menu"
              className={`flex h-11 w-11 items-center justify-center -ml-2 rounded-lg transition-colors active:scale-95 lg:hidden ${
                isScrolled || !isHome ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Desktop Navigation Links with Hover Submenus */}
            <nav className="hidden lg:flex items-center gap-6 font-bold text-xs uppercase tracking-widest relative">
              {/* MEN DROPDOWN */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMenuEnter('men')}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  to="/men"
                  onClick={closeDropdown}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors py-2"
                >
                  <span>Men</span>
                  <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {activeMenu === 'men' && (
                  <div
                    className="absolute top-full left-0 z-50 w-64 pt-1"
                    onMouseEnter={() => handleMenuEnter('men')}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xl text-black">
                      <div className="border-b border-neutral-100 pb-2 mb-2">
                        <Link
                          to="/men"
                          onClick={closeDropdown}
                          className="flex items-center justify-between text-xs font-black uppercase text-black hover:text-red-600"
                        >
                          <span>All Men&apos;s Collection</span>
                          <span>→</span>
                        </Link>
                      </div>
                      <div className="space-y-1 text-xs">
                        <Link
                          to="/shop?gender=men&category=tops"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Tops &amp; Box Tees
                        </Link>
                        <Link
                          to="/shop?gender=men&category=outerwear"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Outerwear &amp; Hoodies
                        </Link>
                        <Link
                          to="/shop?gender=men&category=bottoms"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Bottoms &amp; Trousers
                        </Link>
                        <Link
                          to="/shop?gender=men&category=knitwear"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Knitwear &amp; Vests
                        </Link>
                        <Link
                          to="/shop?category=accessories"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Accessories &amp; Totes
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* WOMEN DROPDOWN */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMenuEnter('women')}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  to="/women"
                  onClick={closeDropdown}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors py-2"
                >
                  <span>Women</span>
                  <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {activeMenu === 'women' && (
                  <div
                    className="absolute top-full left-0 z-50 w-64 pt-1"
                    onMouseEnter={() => handleMenuEnter('women')}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xl text-black">
                      <div className="border-b border-neutral-100 pb-2 mb-2">
                        <Link
                          to="/women"
                          onClick={closeDropdown}
                          className="flex items-center justify-between text-xs font-black uppercase text-black hover:text-red-600"
                        >
                          <span>All Women&apos;s Collection</span>
                          <span>→</span>
                        </Link>
                      </div>
                      <div className="space-y-1 text-xs">
                        <Link
                          to="/shop?gender=women&category=tops"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Embroidered Tops
                        </Link>
                        <Link
                          to="/shop?gender=women&category=knitwear"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Cardigans &amp; Knitwear
                        </Link>
                        <Link
                          to="/shop?gender=women&category=bottoms"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Wide-Leg Bottoms
                        </Link>
                        <Link
                          to="/shop?gender=women&category=outerwear"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Outerwear &amp; Capes
                        </Link>
                        <Link
                          to="/shop?category=accessories"
                          onClick={closeDropdown}
                          className="block rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Silk Scarves &amp; Totes
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CLOTHING DROPDOWN */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMenuEnter('clothing')}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  to="/clothing"
                  onClick={closeDropdown}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors py-2"
                >
                  <span>Clothing</span>
                  <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {activeMenu === 'clothing' && (
                  <div
                    className="absolute top-full left-0 z-50 w-64 pt-1"
                    onMouseEnter={() => handleMenuEnter('clothing')}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xl text-black">
                      <div className="border-b border-neutral-100 pb-2 mb-2">
                        <Link
                          to="/clothing"
                          onClick={closeDropdown}
                          className="flex items-center justify-between text-xs font-black uppercase text-black hover:text-red-600"
                        >
                          <span>Explore All Silhouettes</span>
                          <span>→</span>
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <Link
                          to="/clothing/hoodie"
                          onClick={closeDropdown}
                          className="rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Hoodies
                        </Link>
                        <Link
                          to="/clothing/tee"
                          onClick={closeDropdown}
                          className="rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Tees
                        </Link>
                        <Link
                          to="/clothing/jacket"
                          onClick={closeDropdown}
                          className="rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Jackets
                        </Link>
                        <Link
                          to="/clothing/shirt"
                          onClick={closeDropdown}
                          className="rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Shirts
                        </Link>
                        <Link
                          to="/clothing/cardigan"
                          onClick={closeDropdown}
                          className="rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Cardigans
                        </Link>
                        <Link
                          to="/clothing/trousers"
                          onClick={closeDropdown}
                          className="rounded px-2 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          Trousers
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* WORLDS DROPDOWN */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMenuEnter('worlds')}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  to="/worlds"
                  onClick={closeDropdown}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors py-2"
                >
                  <span>Worlds</span>
                  <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {activeMenu === 'worlds' && (
                  <div
                    className="absolute top-full left-0 z-50 w-72 pt-1"
                    onMouseEnter={() => handleMenuEnter('worlds')}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xl text-black">
                      <div className="border-b border-neutral-100 pb-2 mb-2">
                        <Link
                          to="/worlds"
                          onClick={closeDropdown}
                          className="flex items-center justify-between text-xs font-black uppercase text-black hover:text-red-600"
                        >
                          <span>Explore All 4 Worlds</span>
                          <span>→</span>
                        </Link>
                      </div>
                      <div className="space-y-1 text-xs">
                        <Link
                          to="/worlds/itihaas"
                          onClick={closeDropdown}
                          className="block rounded px-2.5 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          <span className="font-bold text-neutral-900 block">Itihaas</span>
                          <span className="text-[11px] text-neutral-500">Ancient courtyards &amp; gold zari embroidery</span>
                        </Link>
                        <Link
                          to="/worlds/animeverse"
                          onClick={closeDropdown}
                          className="block rounded px-2.5 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          <span className="font-bold text-neutral-900 block">Animeverse</span>
                          <span className="text-[11px] text-neutral-500">Shonen intensity &amp; high-density threadwork</span>
                        </Link>
                        <Link
                          to="/worlds/heroverse"
                          onClick={closeDropdown}
                          className="block rounded px-2.5 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          <span className="font-bold text-neutral-900 block">Heroverse</span>
                          <span className="text-[11px] text-neutral-500">Processional heraldry &amp; metallic relief</span>
                        </Link>
                        <Link
                          to="/atelier"
                          onClick={closeDropdown}
                          className="block rounded px-2.5 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                        >
                          <span className="font-bold text-neutral-900 block">Atelier</span>
                          <span className="text-[11px] text-neutral-500">Unadorned heavyweight Indian cotton</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STYLES & EDITS DROPDOWN */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMenuEnter('styles')}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  to="/styles"
                  onClick={closeDropdown}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors py-2"
                >
                  <span>Styles &amp; Edits</span>
                  <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {activeMenu === 'styles' && (
                  <div
                    className="absolute top-full left-0 z-50 w-80 pt-1"
                    onMouseEnter={() => handleMenuEnter('styles')}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="rounded-lg border border-neutral-200 bg-white p-3.5 shadow-2xl text-black">
                      <div className="border-b border-neutral-100 pb-2 mb-2 flex items-center justify-between">
                        <Link
                          to="/styles"
                          onClick={closeDropdown}
                          className="text-xs font-black uppercase text-black hover:text-red-600 flex items-center gap-1.5"
                        >
                          <span>✦ Presence &amp; Edits Studio</span>
                          <span>→</span>
                        </Link>
                        <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                          5 TIERS
                        </span>
                      </div>

                      <div className="mb-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                          Expression Volumes
                        </p>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <Link
                            to="/styles/whisper"
                            onClick={closeDropdown}
                            className="flex items-center justify-between rounded px-2 py-1 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-neutral-400">01</span>
                              <span className="font-semibold text-neutral-900">Whisper</span>
                            </span>
                            <span className="text-[10px] text-neutral-500">Tonal collar &amp; cuffs</span>
                          </Link>
                          <Link
                            to="/styles/subtle"
                            onClick={closeDropdown}
                            className="flex items-center justify-between rounded px-2 py-1 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-neutral-400">02</span>
                              <span className="font-semibold text-neutral-900">Subtle</span>
                            </span>
                            <span className="text-[10px] text-neutral-500">Chest insignia</span>
                          </Link>
                          <Link
                            to="/styles/statement"
                            onClick={closeDropdown}
                            className="flex items-center justify-between rounded px-2 py-1 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-neutral-400">03</span>
                              <span className="font-semibold text-neutral-900">Statement</span>
                            </span>
                            <span className="text-[10px] text-neutral-500">Center back canvas</span>
                          </Link>
                          <Link
                            to="/styles/bold"
                            onClick={closeDropdown}
                            className="flex items-center justify-between rounded px-2 py-1 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-neutral-400">04</span>
                              <span className="font-semibold text-neutral-900">Bold</span>
                            </span>
                            <span className="text-[10px] text-neutral-500">Multi-panel density</span>
                          </Link>
                          <Link
                            to="/styles/maximalist"
                            onClick={closeDropdown}
                            className="flex items-center justify-between rounded px-2 py-1 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-red-600">05</span>
                              <span className="font-semibold text-neutral-900">Maximalist</span>
                            </span>
                            <span className="text-[10px] text-neutral-500">All-over relief</span>
                          </Link>
                        </div>
                      </div>

                      <div className="border-t border-neutral-100 pt-2 flex items-center justify-between text-[11px]">
                        <Link
                          to="/collections"
                          onClick={closeDropdown}
                          className="font-bold text-neutral-800 hover:text-red-600"
                        >
                          Curated Drops &amp; Capsules →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Center: Stacked Bold Wordmark Logo */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center text-center select-none"
          >
            <span
              className={`font-display text-xl font-black uppercase tracking-tight leading-none transition-colors ${
                isScrolled || !isHome ? 'text-black' : 'text-white'
              }`}
            >
              UNIQUELO
            </span>
            <span
              className={`text-[8.5px] font-black uppercase tracking-[0.28em] leading-tight transition-colors ${
                isScrolled || !isHome ? 'text-neutral-500' : 'text-white/80'
              }`}
            >
              STREETWEAR
            </span>
          </Link>

          {/* Right: Search (Desktop) + Utility Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Exposed Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className={`relative hidden lg:block transition-all duration-300 ease-out ${
                showSearch
                  ? 'w-64 opacity-100 pointer-events-auto overflow-visible'
                  : 'w-0 opacity-0 pointer-events-none overflow-hidden -mr-2'
              }`}
            >
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                className={`h-9 w-full rounded-full pl-3.5 pr-8 text-xs font-medium transition-all outline-none ${
                  isScrolled || !isHome
                    ? 'bg-neutral-100 text-black placeholder-neutral-500 border border-neutral-300 focus:bg-white focus:border-black'
                    : 'bg-white/20 text-white placeholder-white/80 border border-white/40 backdrop-blur-md focus:bg-black/60'
                }`}
              />
              <button
                type="submit"
                aria-label="Search"
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
                  isScrolled || !isHome ? 'text-neutral-700' : 'text-white'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </form>

            {/* Account Icon (Desktop & Mobile) */}
            <button
              type="button"
              onClick={handleOpenAccount}
              aria-label={user ? `Account (${user.email})` : 'Account / Sign In'}
              title={user ? `Account (${user.email})` : 'Sign In'}
              className={`relative flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                isScrolled || !isHome ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {user && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {/* Wishlist Heart Icon */}
            <button
              type="button"
              onClick={handleOpenWishlist}
              aria-label="Wishlist"
              className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                isScrolled || !isHome ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </button>

            {/* Shopping Bag Icon with Numeric Badge */}
            <button
              type="button"
              onClick={handleOpenCart}
              aria-label={`Shopping Bag (${cartCount} items)`}
              className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors -mr-2 ${
                isScrolled || !isHome ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-black shadow-xs ${
                      isScrolled || !isHome
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* ── ROW 2: Mobile Exposed Search Bar (Expands smoothly on scroll) ── */}
        <div
          className={`block lg:hidden px-4 transition-all duration-300 ease-out transform ${
            showSearch
              ? 'max-h-16 opacity-100 scale-100 pb-2.5 pt-0.5 overflow-visible pointer-events-auto'
              : 'max-h-0 opacity-0 scale-95 pb-0 pt-0 overflow-hidden pointer-events-none'
          }`}
        >
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              className={`h-10 w-full rounded-full pl-4 pr-10 text-xs font-semibold tracking-wide transition-all outline-none ${
                isScrolled || !isHome
                  ? 'bg-neutral-100 text-black placeholder-neutral-500 border border-neutral-300 focus:bg-white focus:border-black'
                  : 'bg-white/20 text-white placeholder-white/85 border border-white/50 backdrop-blur-md focus:bg-black/60'
              }`}
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            >
              <svg
                className={`h-4 w-4 ${isScrolled || !isHome ? 'text-neutral-700' : 'text-white'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};
