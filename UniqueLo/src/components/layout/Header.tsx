import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { prefersReducedMotion } from '../../lib/motion';

export const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  const totalItems = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 40) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[200] h-[var(--header-height)] bg-cream/85 backdrop-blur-md border-b border-stone/60 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-[var(--container-max)] mx-auto h-full px-4 sm:px-6 lg:px-12 flex items-center justify-between">
        {/* Left: Brand Wordmark */}
        <div className="flex-1">
          <Link
            to="/"
            className="group inline-flex flex-col tracking-tight focus-visible:outline-accent"
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-wider text-ink font-normal uppercase transition-colors group-hover:text-accent">
              UNIQUELO
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
                  isActive ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Cart Trigger */}
        <div className="flex-1 flex justify-end items-center space-x-5">
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
