import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] bg-cream flex items-center justify-center px-4 py-20">
      <div className="max-w-xl mx-auto text-center space-y-6">
        {/* Needlework Monogram Identifier */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper border border-stone text-[10px] uppercase tracking-[0.25em] text-accent font-medium">
          <span>✦</span>
          <span>404 // Archive Exception</span>
        </div>

        {/* Oversized Melodrama Headline */}
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-ink tracking-tight leading-none">
          Lost Thread.
        </h1>

        <div className="w-24 h-px bg-stone/80 mx-auto" />

        <p className="text-sm text-ink-muted font-light max-w-md mx-auto leading-relaxed">
          The needle has strayed beyond the fabric perimeter. The silhouette, archive dispatch, 
          or craft dossier you are seeking cannot be located in the current atelier catalogue.
        </p>

        {/* Navigation CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="md" className="w-full sm:w-auto text-xs tracking-widest uppercase">
              Return to Atelier
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="secondary" size="md" className="w-full sm:w-auto text-xs tracking-widest uppercase">
              The Full Edit
            </Button>
          </Link>
          <Link to="/atelier">
            <Button variant="ghost" size="md" className="w-full sm:w-auto text-xs tracking-widest uppercase">
              Craft Taxonomy →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
