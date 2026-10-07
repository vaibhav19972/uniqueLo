import React, { useState, useEffect } from 'react';
import { subscribeNewsletter } from '../../lib/data';
import { useToastStore } from '../../stores/toast';

export const WelcomePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    const isDismissed = localStorage.getItem('uniquelo_welcome_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('uniquelo_welcome_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('submitting');
    const res = await subscribeNewsletter(email);
    setStatus('success');
    showToast({
      title: 'Privilege Access Granted',
      description: res.message,
      type: 'accent',
    });
    setTimeout(() => {
      handleDismiss();
    }, 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('ATELIER10');
    setCopied(true);
    showToast({
      title: 'Code Copied: ATELIER10',
      description: 'Applied 10% privilege savings at checkout.',
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[450] flex items-center justify-center p-4">
      {/* Frosted Backdrop */}
      <div
        onClick={handleDismiss}
        className="fixed inset-0 bg-ink/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-cream border border-stone/80 shadow-2xl rounded-sm overflow-hidden z-10 p-8 sm:p-10 animate-in zoom-in-95 duration-300">
        {/* Needlework Frame Accent */}
        <div className="absolute inset-2 border border-dashed border-stone/60 pointer-events-none" />

        <button
          onClick={handleDismiss}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-ink-muted hover:text-ink text-sm p-1.5 transition-colors z-20"
        >
          ✕
        </button>

        <div className="relative z-10 text-center">
          <span className="inline-block text-[10px] font-sans tracking-[0.3em] uppercase text-accent font-medium bg-accent/10 px-3 py-1 mb-3">
            Atelier Private Invitation
          </span>

          <h3 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight font-normal">
            Heirloom Needlecraft
          </h3>

          <p className="text-xs sm:text-sm text-ink-muted mt-3 font-light leading-relaxed max-w-sm mx-auto">
            Enroll in private editions and receive <span className="font-medium text-ink">10% privilege savings</span> on your initial bespoke or permanent collection order.
          </p>

          {/* Promo Code Badge */}
          <div className="my-6 p-4 bg-paper border border-stone flex items-center justify-between max-w-xs mx-auto">
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-ink-muted text-left">
                Privilege Code
              </span>
              <span className="font-serif text-lg text-ink font-medium tracking-wider">
                ATELIER10
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-[10px] uppercase font-sans tracking-widest bg-ink text-cream px-3 py-1.5 hover:bg-accent transition-colors"
            >
              {copied ? 'Copied ✓' : 'Copy Code'}
            </button>
          </div>

          {/* Email Subscription Form */}
          {status !== 'success' ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for private drops"
                className="flex-1 bg-paper border border-stone px-4 py-2.5 text-xs text-ink placeholder:text-warm-gray focus:outline-accent"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-accent hover:bg-accent-hover text-paper text-xs uppercase tracking-widest px-5 py-2.5 transition-colors font-medium whitespace-nowrap"
              >
                {status === 'submitting' ? 'Enrolling...' : 'Unlock 10%'}
              </button>
            </form>
          ) : (
            <p className="text-xs text-success font-medium tracking-wide">
              ✦ Privilege code applied. Welcome to the Atelier Circle.
            </p>
          )}

          <p className="text-[10px] text-ink-muted/80 mt-4 tracking-wider">
            Zero spam. Only rare needlework capsules and lookbooks.
          </p>
        </div>
      </div>
    </div>
  );
};
