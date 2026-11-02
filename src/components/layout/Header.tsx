import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { useWishlistStore } from '../../stores/wishlist';
import { useFiltersStore } from '../../stores/filters';
import { useAuthStore } from '../../stores/auth';
import { useUniverses, useGarments, useExpressions } from '../../hooks/useCatalog';
import { EDITS, type EditSlug } from '../../lib/data';
import { prefersReducedMotion } from '../../lib/motion';
import { ThemeToggle } from '../ui/ThemeToggle';
import { AnnouncementBar } from './AnnouncementBar';
import { Logo } from '../ui/Logo';

type NavMenuKey = 'worlds' | 'styles' | 'clothing' | 'new-featured' | 'our-craft' | null;

/** Nav items in reading order. A storefront's first five destinations, no more. */
const NAV = [
  { key: 'worlds' as const, label: 'Worlds', to: '/worlds' },
  { key: 'styles' as const, label: 'Edits / Styles', to: '/styles' },
  { key: 'clothing' as const, label: 'Clothing', to: '/clothing' },
  { key: 'new-featured' as const, label: 'New', to: '/new-featured' },
  { key: 'our-craft' as const, label: 'The craft', to: '/our-craft' },
];

/**
 * THE MASTHEAD
 *
 * Two bands, both hairline-ruled, on the cotton ground. The wordmark is set in
 * the same condensed grotesque as every other display line on the site, so the
 * brand is part of the page rather than a logotype dropped onto it — the old
 * header set "UniqueLo" in a serif with a gold asterisk, which is the one
 * combination the replacement world rules out.
 *
 * Navigation is a row of labels, not a row of sentences. Each opens a ruled
 * panel of the things inside it — no shadow, no rounded corner, no gold.
 */
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
  const setEdit = useFiltersStore((state) => state.setEdit);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openModal);
  const openAccountDrawer = useAuthStore((state) => state.openAccountDrawer);

  const { data: universes } = useUniverses();
  const { data: expressions } = useExpressions();
  const { data: garments } = useGarments();

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
      const y = window.scrollY;
      if (y < 40) setIsVisible(true);
      else if (y > lastScrollY.current && y > 100) setIsVisible(false);
      else setIsVisible(true);
      lastScrollY.current = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const isActive = (key: string) => {
    const p = location.pathname;
    switch (key) {
      case 'worlds':
        return p.startsWith('/worlds') || p.startsWith('/universes');
      case 'styles':
        return p.startsWith('/styles') || p.startsWith('/expression') || (p === '/shop' && location.search.includes('edit='));
      case 'clothing':
        return p.startsWith('/clothing') || p.startsWith('/garments') || (p === '/shop' && !location.search.includes('edit='));
      case 'new-featured':
        return p.startsWith('/new-featured') || p.startsWith('/collections');
      case 'our-craft':
        return p.startsWith('/our-craft') || p.startsWith('/atelier');
      default:
        return false;
    }
  };

  const coreGarments = (garments ?? []).slice(0, 6);

  const panelBody = 'border border-stone bg-paper';
  const panelHead = 'border-b border-stone px-4 py-2';
  const rowLink = 'block px-4 py-2.5 transition-colors hover:bg-panel';
  const rowName = 'block font-sans text-[13px] font-medium text-ink transition-colors group-hover:text-accent';
  const rowMeta = 'mt-0.5 block font-sans text-[11px] text-ink-muted line-clamp-1';

  const navButton = (key: NavMenuKey, label: string, to: string, hasPanel: boolean) => {
    const active = isActive(key!);
    return (
      <div
        key={key}
        className="relative"
        onMouseEnter={() => setActiveMenu(hasPanel ? key : null)}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <Link
          to={to}
          onClick={closeMenu}
          aria-current={active ? 'page' : undefined}
          className={`relative flex h-[var(--header-height)] items-center gap-1.5 font-sans text-[12px] uppercase tracking-[0.12em] transition-colors ${
            active ? 'text-ink' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {label}
          {hasPanel && (
            <svg
              viewBox="0 0 12 12"
              aria-hidden="true"
              className={`h-2 w-2 transition-transform duration-200 ${
                activeMenu === key ? 'rotate-180' : ''
              }`}
            >
              <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}
          {active && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-ink" />}
        </Link>

        {hasPanel && activeMenu === key && (
          <div
            className={`absolute left-0 top-full pt-2 z-50 ${
              key === 'styles'
                ? 'w-[min(38rem,calc(100vw-2rem))]'
                : 'w-[min(22rem,calc(100vw-2rem))]'
            }`}
          >
            {key === 'worlds' && (
              <div className={panelBody}>
                <div className={panelHead}>
                  <span className="loom-label text-ink-muted">Worlds</span>
                </div>
                {(universes ?? []).map((u) => (
                  <Link key={u.slug} to={`/worlds/${u.slug}`} onClick={closeMenu} className={`group ${rowLink}`}>
                    <span className={rowName}>{u.name}</span>
                    <span className={rowMeta}>{u.tagline}</span>
                  </Link>
                ))}
                <Link
                  to="/worlds"
                  onClick={closeMenu}
                  className="block border-t border-stone px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-ink"
                >
                  All worlds →
                </Link>
              </div>
            )}

            {key === 'styles' && (
              <div className={panelBody}>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone">
                  {/* Left Column: Curated Edits */}
                  <div>
                    <div className={panelHead}>
                      <span className="loom-label text-ink-muted">Curated Edits (Mood & Intent)</span>
                    </div>
                    {EDITS.map((e) => (
                      <Link
                        key={e.slug}
                        to={`/shop?edit=${e.slug}`}
                        onClick={() => {
                          setEdit(e.slug as EditSlug);
                          closeMenu();
                        }}
                        className={`group ${rowLink}`}
                      >
                        <span className={rowName}>{e.title}</span>
                        <span className={rowMeta}>{e.tagline}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Right Column: Styles / Presence */}
                  <div>
                    <div className={panelHead}>
                      <span className="loom-label text-ink-muted">Presence (How Loudly It Wears)</span>
                    </div>
                    {(expressions ?? []).map((exp) => (
                      <Link
                        key={exp.slug}
                        to={`/styles/${exp.slug}`}
                        onClick={closeMenu}
                        className={`group ${rowLink}`}
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={rowName}>{exp.name}</span>
                          <span className="loom-price shrink-0 text-[11px] text-ink-muted">{exp.score}/5</span>
                        </span>
                        <span className={rowMeta}>{exp.tagline}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone px-4 py-2.5">
                  <Link
                    to="/styles"
                    onClick={closeMenu}
                    className="font-sans text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:text-accent font-medium"
                  >
                    All Edits & Styles Studio →
                  </Link>
                  <Link
                    to="/shop"
                    onClick={closeMenu}
                    className="font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-ink"
                  >
                    Open Catalogue →
                  </Link>
                </div>
              </div>
            )}

            {key === 'clothing' && (
              <div className={panelBody}>
                <div className={panelHead}>
                  <span className="loom-label text-ink-muted">By garment</span>
                </div>
                {coreGarments.map((g) => (
                  <Link key={g.slug} to={`/clothing/${g.slug}`} onClick={closeMenu} className={`group ${rowLink}`}>
                    <span className={rowName}>{g.name}</span>
                  </Link>
                ))}
                <Link
                  to="/clothing"
                  onClick={closeMenu}
                  className="block border-t border-stone px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-ink"
                >
                  Every garment →
                </Link>
                <Link
                  to="/shop"
                  onClick={closeMenu}
                  className="block border-t border-stone bg-panel px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:text-accent"
                >
                  The full collection →
                </Link>
              </div>
            )}

            {key === 'new-featured' && (
              <div className={panelBody}>
                <div className={panelHead}>
                  <span className="loom-label text-ink-muted">Recent</span>
                </div>
                {[
                  ['/new-featured/new-arrivals', 'New arrivals', 'The latest pieces added'],
                  ['/new-featured/limited-editions', 'Collector pieces', 'Handcrafted and collector-edited'],
                  ['/collections', 'Collections', 'Capsules across the worlds'],
                ].map(([to, name, meta]) => (
                  <Link key={to} to={to} onClick={closeMenu} className={`group ${rowLink}`}>
                    <span className={rowName}>{name}</span>
                    <span className={rowMeta}>{meta}</span>
                  </Link>
                ))}
                <Link
                  to="/new-featured"
                  onClick={closeMenu}
                  className="block border-t border-stone px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-ink"
                >
                  All featured →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[200] border-b border-stone bg-cream/95 backdrop-blur-md transition-transform duration-300 ease-[var(--ease-base)] ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <AnnouncementBar />

      <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--container-max)] items-center px-4 sm:px-6 lg:px-12">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="-ml-2 flex min-h-[44px] min-w-[44px] items-center justify-center text-ink md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            {mobileOpen ? (
              <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
            ) : (
              <path d="M4 8h16M4 16h16" strokeLinecap="round" />
            )}
          </svg>
        </button>

        {/* Brand Logo — Master horizontal emblem lockup */}
        <Link
          to="/"
          className="ml-1 mr-6 shrink-0 flex items-center text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:ml-0 lg:mr-10"
          aria-label="UniqueLo — home"
        >
          <Logo variant="horizontal" className="h-8 sm:h-9 w-auto text-ink transition-opacity hover:opacity-85" />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex lg:gap-9">
          {NAV.map((item) => navButton(item.key, item.label, item.to, item.key !== 'our-craft'))}
        </nav>

        {/* Utilities */}
        <div className="ml-auto flex items-center gap-0 sm:gap-0.5">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-label={searchOpen ? 'Close search' : 'Search the collection'}
            className="flex min-h-[44px] min-w-[40px] items-center justify-center text-ink transition-colors hover:text-accent sm:min-w-[44px]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => (user ? openAccountDrawer() : openAuthModal('signin'))}
            aria-label={user ? 'Open your account' : 'Sign in'}
            className="relative flex min-h-[44px] min-w-[40px] items-center justify-center text-ink transition-colors hover:text-accent sm:min-w-[44px]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="8" r="3.6" />
              <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
            </svg>
            {user && (
              <span className="absolute bottom-2 right-2 h-1 w-1 rounded-full bg-success" aria-hidden="true" />
            )}
          </button>

          <ThemeToggle />

          <button
            type="button"
            onClick={openWishlist}
            aria-label={`Saved pieces (${wishlistCount})`}
            className="relative flex min-h-[44px] min-w-[40px] items-center justify-center text-ink transition-colors hover:text-accent sm:min-w-[44px]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 20.5 4.9 13.6a4.5 4.5 0 0 1 6.4-6.3l.7.7.7-.7a4.5 4.5 0 0 1 6.4 6.3Z" strokeLinejoin="round" />
            </svg>
            {wishlistCount > 0 && (
              <span className="loom-price absolute right-1 top-2 text-[10px] leading-none text-accent">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Bag (${totalItems})`}
            className="relative ml-0.5 flex min-h-[44px] min-w-[40px] items-center justify-center text-ink transition-colors hover:text-accent sm:min-w-[44px]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 8h12l1 12H5L6 8Z" strokeLinejoin="round" />
              <path d="M9.5 8V6.5a2.5 2.5 0 0 1 5 0V8" strokeLinecap="round" />
            </svg>
            {totalItems > 0 && (
              <span className="loom-price absolute right-0.5 top-2 text-[10px] leading-none text-accent">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search — a ruled drawer, not a modal. */}
      {searchOpen && (
        <div className="border-t border-stone bg-cream">
          <form
            onSubmit={submitSearch}
            role="search"
            className="mx-auto flex max-w-[var(--container-max)] items-center gap-3 px-4 py-3 sm:px-6 lg:px-12"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search a garment, a technique, a world"
              aria-label="Search the collection"
              className="min-h-[44px] min-w-0 flex-1 bg-transparent font-sans text-[15px] text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex min-h-[44px] shrink-0 items-center bg-ink px-5 font-sans text-[11px] uppercase tracking-[0.14em] text-cream transition-colors hover:bg-accent"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Mobile drawer — the same five destinations, ruled, nothing hidden. */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="max-h-[calc(100svh-var(--header-height)-2rem)] overflow-y-auto border-t border-stone bg-cream px-4 pb-8 md:hidden"
        >
          {[
            {
              key: 'worlds' as const,
              label: 'Worlds',
              rows: (universes ?? []).map((u) => ({ to: `/worlds/${u.slug}`, name: u.name })),
              moreTo: '/worlds',
              moreLabel: 'All worlds',
            },
            {
              key: 'styles' as const,
              label: 'Edits / Styles',
              rows: [
                ...EDITS.map((e) => ({
                  to: `/shop?edit=${e.slug}`,
                  name: `Edit: ${e.title}`,
                  slug: e.slug,
                })),
                ...(expressions ?? []).map((e) => ({
                  to: `/styles/${e.slug}`,
                  name: `Presence: ${e.score}/5 — ${e.name}`,
                })),
              ],
              moreTo: '/styles',
              moreLabel: 'All edits & styles',
            },
            {
              key: 'clothing' as const,
              label: 'Clothing',
              rows: coreGarments.map((g) => ({ to: `/clothing/${g.slug}`, name: g.name })),
              moreTo: '/clothing',
              moreLabel: 'Every garment',
            },
          ].map((section) => (
            <div key={section.key} className="border-b border-stone">
              <button
                type="button"
                onClick={() =>
                  setMobileExpandedSection(mobileExpandedSection === section.key ? null : section.key)
                }
                aria-expanded={mobileExpandedSection === section.key}
                className="flex min-h-[56px] w-full items-center justify-between text-left"
              >
                <span className="loom-display text-xl text-ink">{section.label}</span>
                <span aria-hidden="true" className="relative h-3 w-3 shrink-0 text-ink-muted">
                  <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                  <span
                    className={`absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-opacity ${
                      mobileExpandedSection === section.key ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                </span>
              </button>
              {mobileExpandedSection === section.key && (
                <ul className="pb-3">
                  {section.rows.map((row) => (
                    <li key={row.to}>
                      <Link
                        to={row.to}
                        onClick={() => {
                          if ('slug' in row && row.slug) {
                            setEdit(row.slug as EditSlug);
                          }
                          setMobileOpen(false);
                        }}
                        className="block py-2.5 font-sans text-[14px] text-ink-muted transition-colors hover:text-ink"
                      >
                        {row.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to={section.moreTo}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 font-sans text-[11px] uppercase tracking-[0.14em] text-ink"
                    >
                      {section.moreLabel} →
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          ))}

          {[
            { to: '/new-featured', label: 'New' },
            { to: '/collections', label: 'Collections' },
            { to: '/our-craft', label: 'The craft' },
            { to: '/shop', label: 'The full collection' },
          ].map((row) => (
            <Link
              key={row.to}
              to={row.to}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[56px] items-center border-b border-stone"
            >
              <span className="loom-display text-xl text-ink">{row.label}</span>
            </Link>
          ))}

          <div className="mt-6 border border-stone bg-paper p-4">
            {user ? (
              <>
                <p className="font-sans text-[12px] text-ink-muted">Signed in as</p>
                <p className="mt-0.5 truncate font-sans text-[14px] font-medium text-ink">
                  {(user.user_metadata?.full_name as string | undefined)?.trim() ||
                    user.email?.split('@')[0] ||
                    'Customer'}
                </p>
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 inline-flex min-h-[44px] items-center border border-stone-strong px-4 font-sans text-[11px] uppercase tracking-[0.14em] text-ink"
                >
                  Your orders
                </Link>
              </>
            ) : (
              <>
                <p className="font-sans text-[13px] text-ink-muted">
                  Sign in to keep your bag and saved pieces across devices.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openAuthModal('signin');
                  }}
                  className="mt-3 inline-flex min-h-[44px] items-center bg-ink px-5 font-sans text-[11px] uppercase tracking-[0.14em] text-cream transition-colors hover:bg-accent"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};
