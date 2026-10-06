import React, { useState } from 'react';
import { Link } from 'react-router';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-ink text-cream pt-20 pb-12 border-t border-stone/20">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-stone/15">
          {/* Brand Manifesto & Atelier Mission */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-block">
              <span className="font-serif text-3xl tracking-widest uppercase text-cream hover:text-accent transition-colors">
                UNIQUELO
              </span>
              <p className="text-[10px] tracking-[0.3em] text-warm-gray uppercase mt-1">
                Atelier for Digital Needlecraft & Couture Textiles
              </p>
            </Link>
            <p className="text-sm text-stone leading-relaxed font-sans max-w-md font-light">
              Where haute-couture hand embroidery meets state-of-the-art digital aesthetics. 
              Each garment honors centuries of Zardozi, Kantha, and silk-floss needlework 
              crafted in limited editions by master craftspeople.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 text-[11px] uppercase tracking-widest text-accent border border-accent/40 rounded-full">
                100% GOTS & Heirloom Sourced
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-stone">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-stone/80">
              <li>
                <Link to="/" className="hover:text-cream transition-colors">
                  Atelier Manifesto
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-cream transition-colors">
                  The Full Edit
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-cream transition-colors">
                  Outerwear & Coats
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-cream transition-colors">
                  Bespoke Monograms
                </Link>
              </li>
            </ul>
          </div>

          {/* Provenance & Craft */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-stone">
              Techniques
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-stone/80">
              <li className="hover:text-cream cursor-default transition-colors">
                Hand Zardozi Wirework
              </li>
              <li className="hover:text-cream cursor-default transition-colors">
                Bengal Kantha Quilt
              </li>
              <li className="hover:text-cream cursor-default transition-colors">
                Jacobean Crewel Wool
              </li>
              <li className="hover:text-cream cursor-default transition-colors">
                24K Metallic Zari Inlay
              </li>
            </ul>
          </div>

          {/* Newsletter Dispatch */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-stone">
              The Atelier Journal
            </h4>
            <p className="text-xs text-stone/80 leading-relaxed font-light">
              Receive private invitations to seasonal trunk shows and limited needlework releases.
            </p>
            {subscribed ? (
              <p className="text-xs text-accent font-medium tracking-wide">
                Thank you for subscribing to the UniqueLo Gazette.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-paper/5 border border-stone/30 px-3.5 py-2.5 text-xs text-cream placeholder-stone/40 focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="submit"
                    className="mt-2 w-full bg-accent text-cream hover:bg-accent/90 transition-colors py-2 text-xs font-medium uppercase tracking-widest cursor-pointer"
                  >
                    Join Dispatch
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone/50 space-y-4 sm:space-y-0 font-light">
          <p>© 2026 UniqueLo Haute Needlecraft. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-stone transition-colors cursor-pointer">
              Privacy Protocol
            </span>
            <span className="hover:text-stone transition-colors cursor-pointer">
              Terms of Atelier
            </span>
            <span className="hover:text-stone transition-colors cursor-pointer">
              Artisan Transparency
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
