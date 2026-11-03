import React from 'react';
import { Link } from 'react-router';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        {/* Needlework Monogram Identifier */}
        <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-4">
          <span>✦</span>
          <span>404 // DROP EXCEPTION</span>
        </div>

        {/* Oversized Headline */}
        <div className="font-display text-8xl sm:text-9xl font-black uppercase tracking-tighter text-neutral-950 leading-none">
          404
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mt-2">
          Lost Thread in the Matrix
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          The needle has strayed beyond the garment border. The silhouette, archive drop, or craft dossier you are seeking cannot be located in this edition.
        </p>

        {/* Navigation CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 transition"
          >
            Return Home
          </Link>
          <Link
            to="/shop"
            className="inline-flex min-h-[44px] items-center rounded-xs border border-neutral-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:border-black transition"
          >
            Shop the Collection
          </Link>
          <Link
            to="/universes"
            className="inline-flex min-h-[44px] items-center rounded-xs border border-neutral-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:border-black transition"
          >
            Explore Worlds →
          </Link>
        </div>
      </div>

      <TrustBadgesPreFooter />
    </div>
  );
};
