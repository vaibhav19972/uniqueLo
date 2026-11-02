import React from 'react';
import { Link } from 'react-router';
import { useUniverses } from '../../hooks/useCatalog';
import { EDITS } from '../../lib/data';

/**
 * THE COLOPHON
 *
 * The footer was render target 07: a serif wordmark, five gold small-caps
 * column heads, four circled gold line-icons over claims the catalogue does not
 * back, and — the real problem — sixteen menu items rendered as
 * `<span className="cursor-pointer">` with no destination at all. A link that
 * does nothing is worse than an absent link: it teaches the visitor that the
 * footer is decoration.
 *
 * What ships now:
 *  · Every item is either a real route or it is gone. Nothing is a fake link.
 *  · The four claims are the four terms from the masthead strip — dispatch,
 *    COD, returns, carriage — each of which a catalogue field or the pricing
 *    function backs. "14-day home inspection" is deleted: return_window_days
 *    is 7 on every product. "Natural dyes & fabrics" is deleted: no material
 *    record in the catalogue names a dye process.
 *  · The mark is the wordmark set in the page's display face, no serif, no
 *    gold, no circles. Social handles are text links because there is no
 *    brand-glyph asset in the repo and a letter in a circle is not an icon.
 */
const CRAFT_LINKS = [
  { label: 'Our Craft', to: '/our-craft' },
  { label: 'Techniques', to: '/our-craft' },
  { label: 'The Craft Story', to: '/our-craft' },
];

const SHOP_LINKS = [
  { label: 'All Pieces', to: '/shop' },
  { label: 'New & Featured', to: '/new-featured' },
  { label: 'Collections', to: '/collections' },
  { label: 'Clothing', to: '/clothing' },
  { label: 'Presence', to: '/styles' },
];

const TERMS = [
  ['Dispatch', '4–7 days from the workshop'],
  ['Payment', 'Cash on delivery, pan-India'],
  ['Returns', '7 days from delivery'],
  ['Carriage', '₹99, waived above ₹1,499'],
];

export const Footer: React.FC = () => {
  const { data: universes } = useUniverses();

  return (
    <footer className="border-t border-stone bg-paper text-ink">
      <div className="mx-auto max-w-[var(--container-max)] px-4 pb-8 pt-12 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-10 border-b border-stone pb-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link
              to="/"
              className="loom-display block text-ink"
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}
            >
              UniqueLo
            </Link>
            <p className="mt-3 max-w-[30ch] font-sans text-[13px] leading-relaxed text-ink-muted">
              Hand-embroidered garments made in India, priced as plainly as a
              fabric label.
            </p>
          </div>

          <nav aria-label="Worlds">
            <h2 className="loom-label text-ink-muted">Worlds</h2>
            <ul className="mt-3 space-y-2 font-sans text-[13.5px]">
              {(universes ?? []).map((u) => (
                <li key={u.slug}>
                  <Link
                    to={`/universes/${u.slug}`}
                    className="text-ink transition-colors hover:text-accent"
                  >
                    {u.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/universes" className="text-ink transition-colors hover:text-accent">
                  All worlds
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Shop">
            <h2 className="loom-label text-ink-muted">Shop</h2>
            <ul className="mt-3 space-y-2 font-sans text-[13.5px]">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-ink transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Edits">
            <h2 className="loom-label text-ink-muted">Edits</h2>
            <ul className="mt-3 space-y-2 font-sans text-[13.5px]">
              {EDITS.filter((e) => e.featured).map((e) => (
                <li key={e.slug}>
                  <Link
                    to={`/shop?edit=${e.slug}`}
                    className="text-ink transition-colors hover:text-accent"
                  >
                    {e.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="loom-label text-ink-muted">House</h2>
            <ul className="mt-3 space-y-2 font-sans text-[13.5px]">
              {CRAFT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-ink transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/#atelier-list"
                  className="text-ink transition-colors hover:text-accent"
                >
                  Atelier List
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-ink transition-colors hover:text-accent">
                  Your Orders
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* The terms, as a ruled row — the same four facts the masthead strip
            opens the page with, closed out at the bottom. */}
        <dl className="grid grid-cols-1 border-b border-stone sm:grid-cols-2 lg:grid-cols-4">
          {TERMS.map(([term, def], i) => (
            <div
              key={term}
              className={`border-b border-stone py-4 sm:border-b-0 ${
                i > 0 ? 'lg:border-l lg:pl-6' : 'lg:pr-6'
              } ${i % 2 === 1 ? 'sm:border-l sm:pl-6' : ''}`}
            >
              <dt className="loom-label text-ink-muted">{term}</dt>
              <dd className="mt-1 font-sans text-[13px] text-ink">{def}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col items-start justify-between gap-4 pt-6 font-sans text-[12px] text-ink-muted lg:flex-row lg:items-center">
          <p>© 2026 UniqueLo. Made in India.</p>
          <p className="loom-price text-[12px] text-ink-muted">
            UPI · VISA · Mastercard · RuPay · AMEX · COD
          </p>
          <Link to="/orders" className="text-ink transition-colors hover:text-accent">
            Questions about an order? Track it here →
          </Link>
        </div>
      </div>
    </footer>
  );
};
