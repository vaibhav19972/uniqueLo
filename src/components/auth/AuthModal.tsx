import React, { useCallback, useState } from 'react';
import { useAuthStore } from '../../stores/auth';
import { Button } from '../ui/Button';
import { useDialogFocus } from '../../hooks/useDialogFocus';

/**
 * Email-only account modal. Two modes: sign in, create account.
 *
 * Deliberately no OTP/SMS path — phone auth is deferred. See stores/auth.ts
 * for why password (not magic link) is the transport.
 */
export const AuthModal: React.FC = () => {
  const isOpen = useAuthStore((s) => s.isOpen);
  const mode = useAuthStore((s) => s.mode);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const openModal = useAuthStore((s) => s.openModal);
  const closeModal = useAuthStore((s) => s.closeModal);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleClose = useCallback(() => {
    setPassword('');
    setShowPassword(false);
    setResetSent(false);
    clearError();
    closeModal();
  }, [clearError, closeModal]);

  // A successful sign-in closes the modal from inside the store
  // (`set({ isOpen: false })`), which bypasses handleClose and leaves the
  // typed password sitting in component state. Clear it whenever the modal
  // is not open, regardless of which path closed it.
  React.useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setShowPassword(false);
      setResetSent(false);
      clearError();
    }
  }, [isOpen, clearError]);

  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, handleClose);

  if (!isOpen) return null;

  const isSignup = mode === 'signup';
  const busy = status === 'loading';
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = emailValid && password.length >= 8 && !busy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (isSignup) {
      await signUp(email, password, fullName.trim() || undefined);
    } else {
      await signIn(email, password);
    }
  };

  const switchMode = () => {
    setPassword('');
    setShowPassword(false);
    setResetSent(false);
    clearError();
    openModal(isSignup ? 'signin' : 'signup');
  };

  const handleReset = async () => {
    if (!emailValid) return;
    const ok = await resetPassword(email);
    if (ok) setResetSent(true);
  };

  return (
    <div className="fixed inset-0 z-[350] flex items-end sm:items-center justify-center">
      <button
        aria-label="Close account dialog"
        onClick={handleClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] cursor-default"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full sm:max-w-[420px] bg-paper border border-stone shadow-xl max-h-[92vh] overflow-y-auto focus:outline-none"
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-stone">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">Atelier Account</p>
            <h2 id="auth-modal-title" className="font-serif text-2xl text-ink mt-1">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-2 -mr-2 -mt-1 text-ink-muted hover:text-ink transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-ink-muted leading-relaxed mb-5">
            {isSignup
              ? 'Save addresses, keep your pieces across devices, and track every order.'
              : 'Sign in to track orders and keep your saved pieces in sync.'}
          </p>

          {status === 'awaiting_confirmation' ? (
            <div className="border border-stone bg-cream/60 p-4 mb-4">
              <p className="text-sm text-ink font-medium mb-1">Check your inbox</p>
              <p className="text-sm text-ink-muted leading-relaxed">
                We sent a confirmation link to <span className="text-ink">{email}</span>. Open it to activate the
                account, then sign in.
              </p>
              <button
                onClick={() => {
                  useAuthStore.setState({ status: 'idle' });
                  openModal('signin');
                }}
                className="mt-3 text-xs uppercase tracking-widest text-accent hover:text-accent-hover transition-colors cursor-pointer"
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label htmlFor="auth-name" className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1.5">
                    Name <span className="normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-paper border border-stone text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-ink transition-colors"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1.5">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  data-autofocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-paper border border-stone text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-ink transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label htmlFor="auth-password" className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Password
                  </label>
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-accent transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 pr-16 bg-paper border border-stone text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-ink transition-colors"
                    placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-0 top-0 h-full px-3 text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {isSignup && password.length > 0 && password.length < 8 && (
                  <p className="text-[11px] text-error mt-1.5">Use at least 8 characters.</p>
                )}
              </div>

              {resetSent && (
                <p className="text-[11px] text-success">If that email exists, a reset link is on its way.</p>
              )}

              {error && (
                <div
                  role="alert"
                  className={`border p-3 text-[12px] leading-relaxed ${
                    error.isMailerLimit ? 'border-saffron/60 bg-saffron/10 text-ink' : 'border-error/40 bg-error/5 text-error'
                  }`}
                >
                  {error.isMailerLimit && (
                    <span className="block font-medium mb-1 uppercase tracking-wider text-[10px]">Setup incomplete</span>
                  )}
                  {error.message}
                </div>
              )}

              <Button type="submit" variant="primary" size="md" disabled={!canSubmit} className="w-full">
                {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
              </Button>
            </form>
          )}

          <p className="text-xs text-ink-muted text-center mt-5">
            {isSignup ? 'Already have an account?' : 'New to UniqueLo?'}{' '}
            <button
              onClick={switchMode}
              className="text-ink underline underline-offset-4 hover:text-accent transition-colors cursor-pointer"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>

          <p className="text-[10px] text-warm-gray text-center mt-4 leading-relaxed">
            No account is required to checkout. Guests can order and track by order ID and email.
          </p>
        </div>
      </div>
    </div>
  );
};
