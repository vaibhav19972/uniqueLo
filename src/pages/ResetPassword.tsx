import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '../stores/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/Button';

/**
 * Password-recovery landing page — the second half of the reset flow.
 *
 * Why this page has to exist: `resetPasswordForEmail` only *sends* a link. The
 * link carries a short-lived recovery session and drops the customer back on
 * the site; without a page that reacts to it and calls `updateUser`, the
 * customer is signed in but can never actually choose a new password.
 *
 * Flow detection is deliberately flow-agnostic. supabase-js is created with no
 * options (`lib/supabase.ts`), which means implicit flow with
 * `detectSessionInUrl` enabled: the client parses the URL fragment, establishes
 * a session and emits PASSWORD_RECOVERY. The store's generic
 * `onAuthStateChange` handler already captures that into `session` (Layout.tsx
 * keeps one subscription for the whole app). So rather than parsing the hash
 * ourselves — which would break the moment PKCE is enabled — this page simply
 * waits for `session` to appear. Both flows end in a store update.
 *
 * The grace timer matters: URL detection races the first render, so a naive
 * "no session ⇒ invalid" would flash an error at customers with perfectly good
 * links. We wait before accusing the link of being dead.
 */

const GRACE_MS = 3000;

type Phase = 'checking' | 'form' | 'done' | 'invalid';

/** True when the URL looks like it came from a recovery/confirmation email. */
function cameFromEmailLink(): boolean {
  if (typeof window === 'undefined') return false;
  const { hash, search } = window.location;
  return (
    /(?:access_token|refresh_token|type=recovery|error_description)=/.test(hash) ||
    /[?&](?:code|error|token_hash)=/.test(search)
  );
}

export const ResetPassword: React.FC = () => {
  const session = useAuthStore((s) => s.session);
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const clearError = useAuthStore((s) => s.clearError);
  const openModal = useAuthStore((s) => s.openModal);
  const storeError = useAuthStore((s) => s.error);

  // Captured once, before supabase-js consumes and rewrites the URL fragment.
  const [arrivedFromLink] = useState(cameFromEmailLink);
  const [phase, setPhase] = useState<Phase>(session ? 'form' : 'checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  // Give URL detection time to establish the session before declaring the link
  // invalid. Also resolves immediately the moment a session lands.
  useEffect(() => {
    if (phase !== 'checking') return;
    if (session) {
      setPhase('form');
      return;
    }
    const timer = window.setTimeout(() => {
      setPhase((current) => (current === 'checking' ? 'invalid' : current));
    }, GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, session]);

  // URL detection races the first render, so a session can land *after* the
  // grace timer has already declared the link dead. Promote from `invalid` too:
  // a session can only exist if the link was genuinely valid, and `form`/`done`
  // are excluded so this cannot loop.
  useEffect(() => {
    if (session && (phase === 'checking' || phase === 'invalid')) setPhase('form');
  }, [phase, session]);

  useEffect(() => () => clearError(), [clearError]);

  const emailValid = password.length >= 8;
  const canSubmit = emailValid && password === confirm && !busy;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      setLocalError(null);
      setBusy(true);
      try {
        const ok = await updatePassword(password);
        if (ok) {
          setPassword('');
          setConfirm('');
          setPhase('done');
        }
        // On failure the store holds the reason; it is rendered below.
      } finally {
        setBusy(false);
      }
    },
    [canSubmit, password, updatePassword]
  );

  const requestFreshLink = () => {
    openModal('signin');
  };

  const shell = (children: React.ReactNode) => (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[440px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">Atelier Account</p>
        {children}
      </div>
    </div>
  );

  if (!configured) {
    return shell(
      <>
        <h1 className="font-serif text-3xl text-ink mt-2">Accounts unavailable</h1>
        <p className="text-sm text-ink-muted mt-3 leading-relaxed">
          This build is not connected to the account database, so passwords cannot be reset here.
        </p>
        <Link to="/" className="inline-block mt-7">
          <Button variant="secondary" size="md">
            Back to the shop
          </Button>
        </Link>
      </>
    );
  }

  if (phase === 'checking') {
    return shell(
      <>
        <h1 className="font-serif text-3xl text-ink mt-2">Verifying your link</h1>
        <p className="text-sm text-ink-muted mt-3 leading-relaxed">
          One moment while we confirm this reset request.
        </p>
        <div className="mt-8 flex items-center gap-3 text-sm text-ink-muted">
          <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Checking…
        </div>
      </>
    );
  }

  if (phase === 'invalid') {
    return shell(
      <>
        <h1 className="font-serif text-3xl text-ink mt-2">This link is no longer valid</h1>
        <p className="text-sm text-ink-muted mt-3 leading-relaxed">
          Reset links expire quickly and can only be used once. Request a fresh one and open it on the same
          device, in this browser.
        </p>
        {arrivedFromLink && (
          <p className="text-[11px] text-warm-gray mt-3 leading-relaxed">
            If you opened this link on a different device or an in-app browser, copy it into your usual
            browser and try again.
          </p>
        )}
        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <Button variant="primary" size="md" onClick={requestFreshLink}>
            Request a new link
          </Button>
          <Link to="/">
            <Button variant="secondary" size="md" className="w-full">
              Back to the shop
            </Button>
          </Link>
        </div>
      </>
    );
  }

  if (phase === 'done') {
    return shell(
      <>
        <h1 className="font-serif text-3xl text-ink mt-2">Password updated</h1>
        <p className="text-sm text-ink-muted mt-3 leading-relaxed">
          You are signed in on this device. Use your new password next time you sign in.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <Link to="/orders">
            <Button variant="primary" size="md" className="w-full">
              View your orders
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="secondary" size="md" className="w-full">
              Continue shopping
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const message = localError ?? storeError?.message ?? null;

  return shell(
    <>
      <h1 className="font-serif text-3xl text-ink mt-2">Choose a new password</h1>
      <p className="text-sm text-ink-muted mt-3 leading-relaxed">
        Pick something at least 8 characters long that you have not used here before.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <label
            htmlFor="reset-password"
            className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1.5"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 pr-16 bg-paper border border-stone text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-ink transition-colors"
              placeholder="At least 8 characters"
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
          {password.length > 0 && password.length < 8 && (
            <p className="text-[11px] text-error mt-1.5">Use at least 8 characters.</p>
          )}
        </div>

        <div>
          <label
            htmlFor="reset-password-confirm"
            className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1.5"
          >
            Confirm new password
          </label>
          <input
            id="reset-password-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2.5 bg-paper border border-stone text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-ink transition-colors"
            placeholder="Type it again"
          />
          {confirm.length > 0 && password !== confirm && (
            <p className="text-[11px] text-error mt-1.5">Passwords do not match.</p>
          )}
        </div>

        {message && (
          <div role="alert" className="border border-error/40 bg-error/5 p-3 text-[12px] leading-relaxed text-error">
            {message}
          </div>
        )}

        <Button type="submit" variant="primary" size="md" disabled={!canSubmit} className="w-full">
          {busy ? 'Please wait…' : 'Update password'}
        </Button>
      </form>

      <p className="text-xs text-ink-muted text-center mt-5">
        Link expired?{' '}
        <button
          type="button"
          onClick={requestFreshLink}
          className="text-ink underline underline-offset-4 hover:text-accent transition-colors cursor-pointer"
        >
          Request a new one
        </button>
      </p>
    </>
  );
};
