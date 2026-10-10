import React from 'react';
import { Link } from 'react-router';
import { useUniverses } from '../../hooks/useCatalog';

/**
 * Render target 07 (bottom): dark coal footer.
 * Universes column is data-driven (universes + fixed vibe entries + All Products).
 * Newsletter lives in the panel above — footer links to #atelier-list.
 */
const CRAFT_LINKS = [
  { label: 'Our Story', to: '/atelier' },
  { label: 'Meet the Artisans', to: '/atelier' },
  { label: 'Embroidery Techniques', to: '/atelier' },
  { label: 'Materials & Dyes', to: '/atelier' },
  { label: 'Behind the Scenes', to: '/atelier' },
  { label: 'Journal', to: '/shop' },
];

const CARE_LINKS = [
  'Size Guide',
  'Care Instructions',
  'Shipping & Delivery',
  'Returns & Exchanges',
  'Track Your Order',
  'FAQs',
];

const COMPANY_LINKS = [
  'About UniqueLo',
  'Sustainability',
  'Contact Us',
  'Collaborations',
  'Wholesale',
  'Atelier List',
  'Careers',
];

const SOCIALS = ['Instagram', 'YouTube', 'Pinterest', 'X', 'Discord'];

const PAYMENTS = ['UPI', 'VISA', 'Mastercard', 'RuPay', 'AMEX', 'COD'];

export const Footer: React.FC = () => {
  const { data: universes } = useUniverses();

  return (
    <footer className="bg-coal text-cream">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 pb-12 border-b border-cream/15">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="font-serif text-3xl text-cream">
              UniqueLo
            </Link>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mt-1">Wear the universe</p>
            <p className="text-sm text-cream/70 leading-relaxed mt-4 max-w-xs font-light">
              Indian stories, global universes — hand-embroidered for your everyday.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {/* Letter-mark circles: no brand-glyph asset source in repo; stub
                  links until real handles — revisit at P5 (logged deviation) */}
              {SOCIALS.map((s) => (
                <a
                  key={s}
                  href="#atelier-list"
                  aria-label={`UniqueLo on ${s}`}
                  title={s}
                  className="w-10 h-10 rounded-full border border-cream/25 flex items-center justify-center text-cream/80 hover:text-cream hover:border-cream/60 transition-colors text-xs font-sans"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Universes (data-driven) */}
          <nav aria-label="Universes">
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold">Universes</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/75 font-light">
              {(universes ?? []).map((u) => (
                <li key={u.slug}>
                  <Link to={`/universes/${u.slug}`} className="hover:text-cream transition-colors">
                    {u.slug === 'itihaas' ? 'Itihas' : u.name}
                  </Link>
                </li>
              ))}
              {['Aesthetic', 'Minimal', 'Expressive'].map((v) => (
                <li key={v}>
                  <Link to="/shop" className="hover:text-cream transition-colors">
                    {v}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="hover:text-cream transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </nav>

          {/* Craft */}
          <nav aria-label="Craft">
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold">Craft</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/75 font-light">
              {CRAFT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-cream transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Care */}
          <nav aria-label="Care">
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold">Care</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/75 font-light">
              {CARE_LINKS.map((l) => (
                <li key={l}>
                  <span className="hover:text-cream transition-colors cursor-pointer">{l}</span>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-gold">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/75 font-light">
              {COMPANY_LINKS.map((l) => (
                <li key={l}>
                  {l === 'Atelier List' ? (
                    <a href="#atelier-list" className="hover:text-cream transition-colors">
                      {l}
                    </a>
                  ) : (
                    <span className="hover:text-cream transition-colors cursor-pointer">{l}</span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* India craft strip — circled gold line-icons (render 07) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-b border-cream/15">
          {[
            {
              title: 'Proudly rooted in India',
              detail: 'We work with skilled artisans and traditional craft clusters to keep hand-embroidery alive.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.5 4-5.5 4-9s-1.5-6.5-4-9m0 18c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9M3.5 9h17M3.5 15h17" />,
            },
            {
              title: 'Hand-embroidered',
              detail: 'By skilled Indian artisans.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 20l3-3m2-2l9.5-9.5a1.5 1.5 0 00-2-2L7 13l-3 3m9-9l2 2M9 7l8 8" />,
            },
            {
              title: 'Natural dyes & fabrics',
              detail: 'Kinder to you, kinder to the planet.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21c-5 0-8-3-8-8 0-6 5-10 13-10 0 8-2 18-5 18zm0 0V9" />,
            },
            {
              title: '14-day home inspection',
              detail: 'Try it at home. Easy returns.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3l8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6l8-3zm-2.5 8.5l2 2 4-4" />,
            },
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center shrink-0 text-gold" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {b.icon}
                </svg>
              </span>
              <div>
                <p className="font-serif text-base text-cream">{b.title}</p>
                <p className="font-serif text-xs text-cream/60 mt-1">{b.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col lg:flex-row items-center justify-between gap-5 text-xs text-cream/55">
          <p>© 2026 UniqueLo. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
              <span key={l} className="hover:text-cream transition-colors cursor-pointer">
                {l}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted payments">
            <span className="mr-1 inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 11V7a5 5 0 0110 0v4M5 11h14v10H5V11zm7 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
              </svg>
              Secure Payments
            </span>
            {PAYMENTS.map((p) => (
              <span key={p} className="px-2 py-1 bg-paper/90 text-ink/75 text-[10px] rounded-sm">
                {p}
              </span>
            ))}
          </div>
          <p className="font-serif text-sm text-cream/80 text-center lg:text-right">
            Supporting Indian Craft Heritage
            <span className="block text-[11px] font-sans text-cream/50">Craft. Culture. Continuity.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
