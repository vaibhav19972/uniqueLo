import React, { useCallback, useState } from 'react';
import { useAuthStore } from '../../stores/auth';
import { useDialogFocus } from '../../hooks/useDialogFocus';

/**
 * Email-only account modal — Streetwear D2C Revamp
 *
 * Clean white ground, bold display typography, modern inputs,
 * streamlined sign in & create account flows.
 */
export const AuthModal: React.FC = () => {
  const isOpen = useAuthStore((s) => s.isOpen);
  const user = useAuthStore((s) => s.user);
  const mode = useAuthStore((s) => s.mode);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const openModal = useAuthStore((s) => s.openModal);
  const closeModal = useAuthStore((s) => s.closeModal);
  const openAccountDrawer = useAuthStore((s) => s.openAccountDrawer);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // If user is already logged in, never show the auth modal; route directly to account drawer
  React.useEffect(() => {
    if (isOpen && user) {
      closeModal();
      openAccountDrawer();
    }
  }, [isOpen, user, closeModal, openAccountDrawer]);

  const handleClose = useCallback(() => {
    setPassword('');
    setShowPassword(false);
    setResetSent(false);
    clearError();
    closeModal();
  }, [clearError, closeModal]);

  React.useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setShowPassword(false);
      setResetSent(false);
      clearError();
    }
  }, [isOpen, clearError]);

  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, handleClose);

  if (!isOpen || user) return null;

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
    <div className="fixed inset-0 z-[350] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <button
        aria-label="Close account dialog"
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-default transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 w-full sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl bg-white border border-neutral-200 shadow-2xl max-h-[92vh] overflow-y-auto focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-200">
          <div>
            <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
              UNIQUELO MEMBER
            </span>
            <h2 id="auth-modal-title" className="font-display text-xl font-black uppercase tracking-tight text-neutral-900 mt-1.5">
              {isSignup ? 'Join The Inner Circle' : 'Welcome Back'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-xs text-neutral-500 leading-relaxed mb-5">
            {isSignup
              ? 'Get early drop alerts, save shipping addresses, track deliveries, and sync your pieces across devices.'
              : 'Sign in to track orders, access member pricing, and sync your saved pieces.'}
          </p>

          {status === 'awaiting_confirmation' ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 mb-4">
              <p className="text-xs font-bold text-emerald-950 mb-1">Check your inbox ✉️</p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                We sent a confirmation link to <strong className="text-emerald-950">{email}</strong>. Open it to activate your account, then sign in.
              </p>
              <button
                type="button"
                onClick={() => {
                  useAuthStore.setState({ status: 'idle' });
                  openModal('signin');
                }}
                className="mt-3 text-xs font-black uppercase tracking-wider text-emerald-900 hover:underline"
              >
                Go to Sign In →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label htmlFor="auth-name" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Your Full Name <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
                    placeholder="e.g. Kabir Roy"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Email Address
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
                  className="h-11 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Password
                  </label>
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[11px] font-bold text-neutral-500 hover:text-black underline transition-colors"
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
                    className="h-11 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3.5 pr-14 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
                    placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-0 top-0 h-full px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500 hover:text-black"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {isSignup && password.length > 0 && password.length < 8 && (
                  <p className="text-[11px] font-medium text-red-600 mt-1.5">
                    Password must be at least 8 characters long.
                  </p>
                )}
              </div>

              {resetSent && (
                <div className="rounded-lg bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                  Password reset link sent! Check your inbox.
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className={`rounded-lg p-3 text-xs leading-relaxed border ${
                    error.isMailerLimit
                      ? 'border-amber-200 bg-amber-50 text-amber-900'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {error.isMailerLimit && (
                    <span className="block font-black mb-0.5 uppercase tracking-wider text-[10px]">Notice</span>
                  )}
                  {error.message}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-black text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
              >
                {busy ? 'Please wait…' : isSignup ? 'Create Account →' : 'Sign In →'}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-600">
              {isSignup ? 'Already have an account?' : 'New to UniqueLo?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-bold text-black underline underline-offset-2 hover:text-red-600 transition-colors"
              >
                {isSignup ? 'Sign in' : 'Create an account'}
              </button>
            </p>

            <p className="mt-3 text-[11px] text-neutral-400">
              No account required. Guests can track orders with their Order ID and Email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
