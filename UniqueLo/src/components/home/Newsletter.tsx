import React, { useState } from 'react';
import { Button } from '../ui/Button';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-cream border-b border-stone/50 text-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <span className="text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
          Privileged Access
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-2">
          The Needlecraft Gazette
        </h2>

        <p className="mt-4 text-xs sm:text-sm text-ink-muted leading-relaxed font-light">
          Subscribe to receive quarterly monograph essays on historical embroidery techniques, 
          private salon viewings, and priority access to numbered capsule editions.
        </p>

        <div className="mt-8">
          {isSubmitted ? (
            <div className="p-4 bg-paper border border-stone/60 inline-block text-xs text-accent font-medium tracking-wide">
              ✦ Your invitation request is received. Welcome to the UniqueLo Atelier.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full sm:flex-1 bg-paper border border-stone px-4 py-3 text-xs text-ink placeholder-ink-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto text-xs tracking-widest whitespace-nowrap"
              >
                Request Dispatch
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
