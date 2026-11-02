import React, { useState } from 'react';
import { subscribeNewsletter } from '../../lib/data';
import { useToastStore } from '../../stores/toast';
import { useReveal } from '../../hooks/useReveal';

/**
 * THE ATELIER LIST
 *
 * What this band used to be: "Get 10% Off Your First Drop." over a gold
 * eyebrow, a rotated white card with a drop shadow, and a promise that "your
 * 10% welcome code is on its way." Three separate falsehoods, stacked:
 *
 *  · The project has no outbound mail, so no code was ever on its way. The
 *    subscribe path writes one row to `newsletter_subscribers` and returns.
 *  · The markup carried a `font-serif` heading, a `shadow-lg` card rotated
 *    −2°, a gradient scrim over the photograph and gold label type — every one
 *    of them a rule this design system retired.
 *  · The photograph was a hero campaign frame from another universe, captioned
 *    as an atelier welcome note.
 *
 * What it is now: the honest ask. A list that receives new pieces and the
 * technique notes when they publish, stated in one line, in the page's own
 * type register, with the field wired exactly as before. No discount, because
 * a discount nobody can deliver is a lie with a coupon attached.
 *
 * ATELIER10 is a real, live coupon (10% above ₹999) and it is named here
 * because it is checkable — the bag will price it. It is not tied to signing
 * up, so the band does not claim it is.
 */
export const Newsletter: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;
    setIsLoading(true);
    try {
      const res = await subscribeNewsletter(email.trim());
      setIsSubmitted(true);
      setEmail('');
      showToast({ title: 'On the list', description: res.message, type: 'success' });
    } catch {
      showToast({ title: 'Could not add you', description: 'Please try again.', type: 'info' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      id="atelier-list"
      aria-labelledby="nl-heading"
    >
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-12">
        <div>
          <h2
            id="nl-heading"
            className="loom-display text-ink"
            style={{ fontSize: 'var(--text-display-lg)' }}
          >
            The Atelier List
          </h2>
          <p className="mt-3 max-w-[46ch] font-sans text-[15px] leading-relaxed text-ink-muted">
            New pieces when they reach the workshop, and the technique notes as
            they are written. A few emails a season, nothing else.
          </p>

          {isSubmitted ? (
            <p
              className="mt-7 border border-stone bg-paper px-4 py-3.5 font-sans text-[14px] leading-relaxed text-ink"
              role="status"
            >
              You are on the list. Your address stays with us; it is not passed
              to anyone else.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex max-w-lg flex-col gap-2 sm:flex-row">
              <label htmlFor="nl-email" className="sr-only">
                Email address
              </label>
              <input
                id="nl-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-h-[48px] flex-1 border border-stone bg-paper px-3 font-sans text-[14px] text-ink placeholder:text-warm-gray focus:border-ink focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-ink px-6 font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-cream transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-stone-strong"
              >
                {isLoading ? 'Adding…' : 'Join the list'}
                <span aria-hidden="true">→</span>
              </button>
            </form>
          )}

          <dl className="mt-9 grid grid-cols-1 border-t border-stone sm:grid-cols-3">
            {[
              ['New pieces', 'First sight of a finished garment.'],
              ['Technique notes', 'One stitch, one region, at a time.'],
              ['No forwarding', 'Your address is never resold.'],
            ].map(([term, def], i) => (
              <div
                key={term}
                className={`border-b border-stone py-4 sm:border-b-0 sm:pb-0 ${
                  i > 0 ? 'sm:border-l sm:pl-5' : 'sm:pr-5'
                }`}
              >
                <dt className="loom-label text-ink">{term}</dt>
                <dd className="mt-1.5 font-sans text-[13px] leading-relaxed text-ink-muted">
                  {def}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 font-sans text-[12px] leading-relaxed text-ink-muted">
            Already shopping? <span className="loom-price text-ink">ATELIER10</span>{' '}
            takes 10% off any bag above ₹999 in the shop.
          </p>
        </div>

        {/* The plate: a working photograph of the craft, on paper, uncropped by
            any scrim. It sits at its own aspect rather than a fixed frame. */}
        <figure className="hidden self-center lg:block">
          <div className="bg-paper">
            <img
              src="/images/campaigns/craft-handwork.jpg"
              alt="Hands working gold thread into an embroidery frame"
              loading="lazy"
              className="block h-auto w-full object-cover"
            />
          </div>
          <figcaption className="mt-2.5 flex items-baseline justify-between gap-4 border-t border-stone pt-2.5">
            <span className="loom-label text-ink-muted">The workshop</span>
            <span className="font-sans text-[12px] text-ink-muted">
              12–34 hours a piece
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
};
