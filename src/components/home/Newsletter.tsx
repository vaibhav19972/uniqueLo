import React, { useState } from 'react';
import { subscribeNewsletter } from '../../lib/data';
import { useToastStore } from '../../stores/toast';
import { CtaButton } from '../ui/Cta';

/**
 * Render target 07 (top): Join the Atelier List.
 * Wiring preserved (subscribeNewsletter + toasts); layout rebuilt to render.
 */
const BENEFITS = [
  { title: 'Exclusive drops & early access' },
  { title: 'Stories from our artisans' },
  { title: 'Members-only offers & events' },
];

export const Newsletter: React.FC = () => {
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
      showToast({ title: 'Subscribed', description: res.message, type: 'success' });
    } catch {
      showToast({ title: 'Subscription failed', description: 'Please try again.', type: 'info' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="atelier-list" aria-labelledby="nl-heading" className="bg-cream border-t border-stone/60">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-[11px] font-sans uppercase tracking-[0.28em] text-gold">
            Join the Atelier List
          </p>
          <h2 id="nl-heading" className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight leading-[1.05]">
            Get 10% Off Your First Universe Order.
          </h2>
          <p className="text-[15px] sm:text-base text-ink-muted mt-4 font-light max-w-md">
            Early access to new drops, behind-the-scenes craft stories and members-only offers.
          </p>

          {isSubmitted ? (
            <p className="mt-7 p-4 bg-paper border border-stone/60 inline-block font-serif text-lg text-ink">
              ✦ You are on the List. Your 10% welcome code is on its way.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-lg">
              <label htmlFor="nl-email" className="sr-only">
                Email address
              </label>
              <input
                id="nl-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-paper border border-stone px-5 py-3.5 text-[15px] text-ink placeholder-ink-muted/60 focus:outline-none focus:border-gold transition-colors min-h-[52px]"
              />
              <CtaButton type="submit" disabled={isLoading} className="disabled:opacity-60">
                {isLoading ? 'Joining…' : 'Join the Atelier List'} <span aria-hidden="true">→</span>
              </CtaButton>
            </form>
          )}

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-lg">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex items-start gap-2.5 text-[13px] text-ink">
                <span aria-hidden="true" className="text-gold font-serif text-lg leading-none">✦</span>
                {b.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden lg:block">
          <div className="aspect-[4/3] overflow-hidden bg-stone/30 border border-stone/60">
            <img
              src="/images/campaigns/editorial-split.jpg"
              alt="Embroidered crane textile with atelier welcome note (placeholder)"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-paper border border-stone/60 shadow-xl px-6 py-5 max-w-[240px] rotate-[-2deg]">
            <p className="font-serif italic text-lg text-ink leading-snug">A more meaningful wardrobe awaits.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
