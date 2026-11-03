import React, { useState } from 'react';
import { Link } from 'react-router';

interface FooterSection {
  title: string;
  links: { label: string; to: string }[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'SHOP',
    links: [
      { label: 'BEST SELLERS', to: '/shop?sort=bestseller' },
      { label: 'NEW ARRIVALS', to: '/shop?sort=new' },
      { label: 'Styles & Edits Studio', to: '/styles' },
      { label: 'Oversized T-Shirts', to: '/shop?category=tops&fit=oversized' },
      { label: 'Hoodies & Sweatshirts', to: '/shop?category=outerwear&type=hoodie' },
      { label: 'Cargos & Parachutes', to: '/shop?category=bottoms&type=cargo' },
      { label: 'Statement Caps (₹799)', to: '/shop?category=accessories&type=cap' },
      { label: 'Special Prices', to: '/shop?sale=true' },
    ],
  },
  {
    title: 'TRENDING DROPS',
    links: [
      { label: 'Curated Drops & Capsules', to: '/collections' },
      { label: 'Culture Corner Collab', to: '/shop?universe=itihaas' },
      { label: 'Animeverse Drop 02', to: '/shop?universe=animeverse' },
      { label: 'Heroverse Legacy', to: '/shop?universe=heroverse' },
      { label: 'The Knit Edit', to: '/shop?type=knit' },
      { label: 'Acid Wash Heavyweights', to: '/shop?wash=acid' },
      { label: 'Co-Ord Sets', to: '/shop?type=coord' },
    ],
  },
  {
    title: 'CUSTOMER CARE',
    links: [
      { label: 'Track Order', to: '/orders' },
      { label: 'Returns & Exchange Policy', to: '/orders' },
      { label: 'FAQs & Help', to: '/our-craft' },
      { label: 'WhatsApp Concierge', to: 'https://wa.me/' },
      { label: 'Stores Near Me', to: '/shop' },
      { label: 'Offers & Promo Codes', to: '/shop' },
    ],
  },
  {
    title: 'ABOUT UNIQUELO',
    links: [
      { label: 'Our Story & Culture', to: '/our-craft' },
      { label: 'Embroidery Techniques', to: '/our-craft' },
      { label: 'Heavyweight Indian Cotton', to: '/our-craft' },
      { label: 'Sustainability & Values', to: '/our-craft' },
      { label: 'Privacy Policy', to: '/' },
      { label: 'Terms & Conditions', to: '/' },
    ],
  },
];

export const Footer: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="w-full bg-black text-white pt-10 pb-8 border-t border-neutral-800">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Newsletter Block ── */}
        <div className="border-b border-neutral-800 pb-8 text-center sm:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                ★ WE&apos;VE GOT YOU COVERED ★
              </p>
              <h3 className="mt-1 font-display text-lg font-black uppercase tracking-tight text-white sm:text-xl">
                Beyond the Outfit: Get First Access
              </h3>
              <p className="mt-0.5 text-xs text-neutral-400 font-normal">
                Be the first to know about secret drops, Shark Tank codes &amp; VIP sales.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex max-w-md w-full gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="h-11 flex-1 rounded bg-neutral-900 border border-neutral-700 px-3.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded bg-white px-5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-neutral-200 active:scale-95"
              >
                {subscribed ? 'Joined ✓' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* ── 4 Collapsible Accordions (Mobile) / 4-Col Grid (Desktop) ── */}
        <div className="py-8 divide-y divide-neutral-800 md:divide-y-0 md:grid md:grid-cols-4 md:gap-8">
          {FOOTER_SECTIONS.map((section) => {
            const isOpen = openSection === section.title;
            return (
              <div key={section.title} className="py-3 md:py-0">
                {/* Mobile Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="flex min-h-[44px] w-full items-center justify-between text-left text-xs font-black uppercase tracking-wider text-white md:cursor-default"
                >
                  <span>{section.title}</span>
                  <span className="text-sm font-light text-neutral-400 md:hidden">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {/* Links List */}
                <ul
                  className={`mt-2 space-y-2 text-xs text-neutral-400 ${
                    isOpen ? 'block' : 'hidden md:block'
                  }`}
                >
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.to.startsWith('http') ? (
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="hover:text-white transition-colors block py-0.5"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── App Store & Play Store Experience Banner ── */}
        <div className="border-t border-neutral-800 pt-8 pb-4 text-center">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
            EXPERIENCE THE UNIQUELO APP
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="flex h-10 items-center justify-center rounded border border-neutral-700 bg-neutral-900 px-4 text-xs font-bold text-white shadow-xs">
               App Store
            </span>
            <span className="flex h-10 items-center justify-center rounded border border-neutral-700 bg-neutral-900 px-4 text-xs font-bold text-white shadow-xs">
              ▶ Google Play
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-neutral-500 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-white tracking-tight">UNIQUELO</span>
              <span>© 2026 UniqueLo Streetwear India. All Rights Reserved.</span>
            </div>
            <div className="flex gap-4">
              <a href="#instagram" className="hover:text-white">Instagram</a>
              <a href="#discord" className="hover:text-white">Community</a>
              <a href="#spotify" className="hover:text-white">Soundtrack</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
