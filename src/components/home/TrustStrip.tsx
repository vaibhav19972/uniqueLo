import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts, useCraftTechniques } from '../../hooks/useCatalog';
import { useReveal } from '../../hooks/useReveal';

/**
 * THE RECEIPT BAND
 *
 * This was four icon-and-slogan tiles — "Signature Embroidery / Slow fashion,
 * lasting details", "Premium Fabrics / Comfort that stays", "Made in India",
 * "Thoughtful Drops / Limited pieces, more meaning". None of it is checkable,
 * all of it is the same sentence every D2C store writes, and it sat directly
 * under a hero that had already said the real version of it.
 *
 * What replaces it: the four numbers a buyer uses to decide whether this shop
 * is substantial. Each one is counted from the live catalogue at render time,
 * so it cannot drift from what the rest of the page claims.
 */
export const TrustStrip: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: products } = useProducts();
  const { data: techniques } = useCraftTechniques();

  const facts = useMemo(() => {
    const list = products ?? [];
    if (list.length === 0) return [];

    const weights = list
      .map((p) => Number.parseInt(p.fabricGsm ?? '', 10))
      .filter((n) => Number.isFinite(n) && n >= 100);

    const techniqueCount = (techniques ?? []).length;

    // Dispatch window, read from the product rows rather than stated by hand.
    const mins = list.map((p) => p.deliveryDaysMin).filter((n): n is number => n != null);
    const maxs = list.map((p) => p.deliveryDaysMax).filter((n): n is number => n != null);
    const dispatch =
      mins.length > 0 && maxs.length > 0
        ? `${Math.min(...mins)}–${Math.max(...maxs)} days`
        : '—';

    return [
      {
        value: String(list.length),
        label: 'Pieces in the catalogue',
        to: '/shop',
      },
      {
        value: techniqueCount > 0 ? String(techniqueCount) : '—',
        label: 'Named embroidery techniques',
        to: '/our-craft',
      },
      {
        value:
          weights.length > 0
            ? `${Math.min(...weights)}–${Math.max(...weights)}`
            : '—',
        label: 'Fabric weight, GSM',
        to: '/our-craft',
      },
      {
        value: dispatch,
        label: 'From order to dispatch',
        to: '/our-craft',
      },
    ];
  }, [products, techniques]);

  if (facts.length === 0) return null;

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream"
      aria-label="The catalogue in numbers"
    >
      <dl className="mx-auto grid max-w-[var(--container-max)] grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-12">
        {facts.map((fact, i) => (
          <div
            key={fact.label}
            className={`py-4 pr-4 sm:py-5 ${
              i % 2 === 1 ? 'border-l border-stone pl-4 sm:pl-5' : ''
            } ${i >= 2 ? 'border-t border-stone lg:border-t-0' : ''} ${
              i === 2 ? 'lg:border-l lg:pl-5' : ''
            }`}
          >
            <dd className="loom-price text-xl leading-none text-ink sm:text-2xl">{fact.value}</dd>
            <dt className="mt-1.5 font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <Link to={fact.to} className="transition-colors hover:text-ink">
                {fact.label}
              </Link>
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
};
