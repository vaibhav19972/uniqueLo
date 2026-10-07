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
    <footer className="bg-ink text-cream pt-20 pb-12 border-t border-stone/20 relative overflow-hidden">
      {/* Oversized Editorial Brand Mark (Task S5.1) */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 select-none pointer-events-none mb-12 border-b border-stone/15 pb-8 overflow-hidden">
        <span className="font-serif text-5xl sm:text-7xl lg:text-9xl tracking-tight text-stone/15 block uppercase leading-none">
          UNIQUELO
        </span>
      </div>

      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-stone/15">
          {/* Brand Manifesto & Atelier Mission */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <Link to="/" className="inline-block">
                <span className="font-serif text-2xl sm:text-3xl tracking-widest uppercase text-cream hover:text-accent transition-colors">
                  UNIQUELO
                </span>
              </Link>
              <p className="text-[11px] tracking-[0.2em] text-accent uppercase font-medium mt-1">
                Hand-Embroidered Essentials • Made in India • Built to Last
              </p>
            </div>
            <p className="text-sm text-stone/80 leading-relaxed font-sans max-w-sm font-light">
              We reject flat synthetic prints and fleeting ceremony. UniqueLo constructs 
              heavyweight everyday essentials enriched with verifiable regional needlecraft 
              from artisan guilds across Jaipur, Lucknow, and Bengal.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-widest text-cream/90 bg-stone/10 border border-stone/30">
                100% GOTS Natural Cotton
              </span>
              <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-widest text-cream/90 bg-stone/10 border border-stone/30">
                Numbered Capsule Runs
              </span>
            </div>
          </div>

          {/* Column 1: Collections */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-stone">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs font-light text-stone/80">
              <li>
                <Link to="/shop" className="hover:text-cream transition-colors">
                  The Full Edit
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-cream transition-colors">
                  Tees & Heavyweight Knits
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-cream transition-colors">
                  Chore Coats & Overshirts
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-cream transition-colors">
                  Tailored Trousers
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-cream transition-colors">
                  Bespoke Monogramming
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Atelier Craft */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-stone">
              Craft Atelier
            </h4>
            <ul className="space-y-2.5 text-xs font-light text-stone/80">
              <li>
                <Link to="/atelier" className="hover:text-cream transition-colors text-accent">
                  The Craft Taxonomy →
                </Link>
              </li>
              <li>
                <Link to="/atelier/botanical-chain" className="hover:text-cream transition-colors">
                  Lucknow Chikankari
                </Link>
              </li>
              <li>
                <Link to="/atelier/zardozi" className="hover:text-cream transition-colors">
                  Jaipur Zardozi Guild
                </Link>
              </li>
              <li>
                <Link to="/atelier/kantha-quilt" className="hover:text-cream transition-colors">
                  Bengal Kantha Quilt
                </Link>
              </li>
              <li>
                <Link to="/atelier/crewel-needlework" className="hover:text-cream transition-colors">
                  Kashmir Crewel Wool
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Care & Dispatch */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-stone">
              Care & Service
            </h4>
            <ul className="space-y-2.5 text-xs font-light text-stone/80">
              <li className="hover:text-cream transition-colors cursor-default">
                Care for Heavyweight Cotton
              </li>
              <li className="hover:text-cream transition-colors cursor-default">
                Preserving Bullion Zari
              </li>
              <li className="hover:text-cream transition-colors cursor-default">
                Pan-India Express (24h Dispatch)
              </li>
              <li className="hover:text-cream transition-colors cursor-default">
                Cash on Delivery (COD)
              </li>
              <li className="hover:text-cream transition-colors cursor-default">
                Doorstep 7-Day Exchange
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Dispatch */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-stone">
              Atelier Dispatch
            </h4>
            <p className="text-xs text-stone/80 leading-relaxed font-light">
              Receive private notifications for limited edition drop numbers and craft archives.
            </p>
            {subscribed ? (
              <p className="text-xs text-accent font-medium tracking-wide">
                ✦ Your subscription is confirmed.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-paper/5 border border-stone/30 px-3 py-2 text-xs text-cream placeholder-stone/40 focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-accent text-cream hover:bg-accent-hover transition-colors py-2 text-[10px] font-medium uppercase tracking-widest cursor-pointer"
                >
                  Join Dispatch
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Indian Trust & Payment Strip (Task S5.1) */}
        <div className="py-8 border-b border-stone/15 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone/70">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-medium text-stone">
              Express Logistics:
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-paper/5 border border-stone/30 text-[10px] font-mono text-cream">
                BlueDart Air
              </span>
              <span className="px-2.5 py-1 bg-paper/5 border border-stone/30 text-[10px] font-mono text-cream">
                Delhivery Express
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-medium text-stone">
              Secure Checkout:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-paper/5 border border-stone/30 text-[10px] text-cream">
                UPI / GPay / PhonePe
              </span>
              <span className="px-2.5 py-1 bg-paper/5 border border-stone/30 text-[10px] text-cream">
                Cash on Delivery (COD)
              </span>
              <span className="px-2.5 py-1 bg-paper/5 border border-stone/30 text-[10px] text-cream">
                Visa • Mastercard • RuPay
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone/50 space-y-4 sm:space-y-0 font-light">
          <p>© 2026 UniqueLo. Hand-embroidered in India. Natural fibers. Small batches.</p>
          <div className="flex space-x-6">
            <span className="hover:text-stone transition-colors cursor-pointer">
              Privacy Protocol
            </span>
            <span className="hover:text-stone transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-stone transition-colors cursor-pointer">
              Artisan Wage Guarantee
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
