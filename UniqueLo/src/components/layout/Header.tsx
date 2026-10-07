import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { useWishlistStore } from '../../stores/wishlist';
import { useToastStore } from '../../stores/toast';
import { prefersReducedMotion } from '../../lib/motion';
import { AnnouncementBar } from './AnnouncementBar';

export const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  const totalItems = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.count());
  const showToast = useToastStore((state) => state.showToast);

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
    { name: 'Atelier', path: '/' },
    { name: 'Collections', path: '/shop' },
  ];

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
        {/* Left: Brand Wordmark */}
        <div className="flex-1">
          <Link
            to="/"
            className="group inline-flex flex-col tracking-tight focus-visible:outline-accent"
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-wider text-ink font-normal uppercase transition-colors group-hover:text-accent flex items-center gap-1.5">
              <span>UNIQUELO</span>
              <span className="text-accent text-sm animate-pulse">✦</span>
            </span>
            <span className="text-[9px] font-sans tracking-[0.25em] text-ink-muted uppercase -mt-1">
              HAUTE NEEDLECRAFT
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center space-x-8 sm:space-x-12">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1 text-xs sm:text-sm uppercase tracking-[0.18em] font-medium transition-colors hover:text-ink ${
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

        {/* Right: Wishlist & Cart Trigger */}
        <div className="flex-1 flex justify-end items-center space-x-3 sm:space-x-5">
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            aria-label={`Wishlist with ${wishlistCount} items`}
            className="group relative flex items-center space-x-1.5 p-2 text-ink hover:text-accent transition-colors focus-visible:outline-accent"
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
            className="group relative flex items-center space-x-2.5 p-2 text-ink hover:text-accent transition-colors focus-visible:outline-accent"
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
        </div>
      </div>
    </header>
  );
};
