import React, { useState } from 'react';
import { subscribeNewsletter } from '../../lib/data';
import { useToastStore } from '../../stores/toast';
import { CtaButton } from '../ui/Cta';
import { useIsThemeV2 } from '../../config/theme';

/**
 * Render target 07 (top): Join the Atelier List (chatgpt-v2).
 * Wiring preserved (subscribeNewsletter + toasts); layout rebuilt to render:
 * left content, right photo dissolving into the cream canvas (no frame box).
 */
const BENEFITS = [
  {
    title: 'Exclusive drops & early access',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7m0 0c-1.5-2.5-4-3.5-5-2.5S7 7.5 12 7zm0 0c1.5-2.5 4-3.5 5-2.5S17 7.5 12 7z" />
    ),
  },
  {
    title: 'Stories from the atelier',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8m0-12.8l-2.8 2.8m-7.2 7.2l-2.8 2.8" />
    ),
  },
  {
    title: 'Members-only offers & events',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 002 2 2 2 0 01-2 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm6 0v2m6-2v2M7 13v0m4 0v0m4 0v0m-8 3v0m4 0v0m4 0v0" />
    ),
  },
];

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useToastStore((s) => s.showToast);
  const isV2 = useIsThemeV2();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;
    setIsLoading(true);
    try {
      const res = await subscribeNewsletter(email.trim());
      setIsSubmitted(true);
      setEmail('');
      showToast({ title: 'Subscribed', description: res.message, type: 'success' });
    } catch {
      showToast({ title: 'Subscription failed', description: 'Please try again.', type: 'info' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="atelier-list" aria-labelledby="nl-heading" className="bg-cream border-t border-stone/60 overflow-hidden">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center py-16 lg:py-24">
        {/* Copy + form */}
        <div>
          <p className="text-[12px] font-sans uppercase tracking-eyebrow font-medium text-gold-deep">
            {isV2 ? 'Insider Access' : 'Join the Atelier List'}
          </p>
          <h2
            id="nl-heading"
            className="font-serif font-medium text-ink mt-3 leading-display tracking-tight text-4xl sm:text-5xl"
          >
            {isV2 ? 'Get 10% Off Your First Drop.' : 'Get 10% Off Your First Universe Order.'}
          </h2>
          <p className="font-serif text-lg text-ink-muted mt-4 max-w-md">
            Early access to new drops, behind-the-scenes craft stories and members-only offers.
          </p>

          {isSubmitted ? (
            <p className="mt-7 inline-flex items-center gap-2.5 p-4 bg-parchment/70 font-serif text-lg text-ink rounded-xl">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
              </svg>
              You are on the List. Your 10% welcome code is on its way.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-lg">
              <label htmlFor="nl-email" className="sr-only">
                Email address
              </label>
              <div className="relative flex-1">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
                </svg>
                <input
                  id="nl-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full bg-paper border border-stone pl-12 pr-5 py-3.5 text-[15px] text-ink placeholder-ink-muted/60 focus:outline-none focus:border-gold-deep transition-colors min-h-[52px] ${
                    isV2 ? 'rounded-xl' : 'rounded-sm'
                  }`}
                />
              </div>
              <CtaButton
                type="submit"
                disabled={isLoading}
                className={`disabled:opacity-60 px-6 ${isV2 ? 'rounded-xl' : ''}`}
              >
                {isLoading ? 'Joining…' : isV2 ? 'Get 10% Off' : 'Join the Atelier List'} <span aria-hidden="true">→</span>
              </CtaButton>
            </form>
          )}

          {/* Benefits — gold line icons, serif labels, hairline-divided (render 07) */}
          <ul className="grid grid-cols-1 sm:grid-cols-3 mt-9 max-w-xl">
            {BENEFITS.map((b, i) => (
              <li
                key={b.title}
                className={`flex items-start gap-2.5 py-2.5 sm:py-0 sm:px-4 ${i > 0 ? 'border-t sm:border-t-0 sm:border-l border-stone/60' : 'sm:pl-0'} ${
                  i === 0 ? 'sm:pr-4' : ''
                }`}
              >
                <svg className="w-5 h-5 shrink-0 text-gold-deep mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {b.icon}
                </svg>
                <span className="font-serif text-[13px] leading-snug text-ink/85">{b.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Photo — left edge dissolves into the cream canvas (render 07) */}
        <div className="relative hidden lg:block">
          <div className="relative aspect-[4/3] bg-stone/30">
            <img
              src="/images/campaigns/editorial-split.jpg"
              alt="Embroidered crane textile with atelier welcome note (placeholder)"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cream to-transparent" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-paper shadow-lg px-6 py-5 max-w-[240px] rotate-[-2deg]">
            <p className="font-serif italic text-lg text-ink leading-snug">A more meaningful wardrobe awaits.</p>
          </div>
        </div>
      </div>
    </section>
  );
};