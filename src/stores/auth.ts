import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useWishlistStore } from './wishlist';

export interface CustomerAddress {
  id: string;
  label: string | null;
  is_default: boolean;
  recipient_name: string;
  phone: string;
  address_line: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
}

/**
 * Email-only auth (OTP/SMS deferred). Email+password rather than magic link
 * because the project has no custom SMTP yet: Supabase's built-in mailer only
 * delivers to organisation team addresses, so a magic-link flow would fail
 * silently for real customers. Password sign-in needs no email at send time.
 *
 * `mailer_autoconfirm` is false on the project, which means a sign-up must
 * click a confirmation link before it can sign in. That email has the same
 * SMTP limitation. HONEST BEHAVIOUR: surface it, never pretend success.
 */
export type AuthStatus = 'idle' | 'loading' | 'awaiting_confirmation' | 'error';

export interface AuthError {
  code: string;
  message: string;
  /** True when the failure is the missing-SMTP limitation, not the user's fault. */
  isMailerLimit: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  error: AuthError | null;
  addresses: CustomerAddress[];
  isAdmin: boolean;
  isOpen: boolean;
  mode: 'signin' | 'signup';
  isAccountDrawerOpen: boolean;

  init: () => () => void;
  openModal: (mode?: 'signin' | 'signup') => void;
  closeModal: () => void;
  openAccountDrawer: () => void;
  closeAccountDrawer: () => void;

  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;

  loadAddresses: () => Promise<void>;
  saveAddress: (input: Omit<CustomerAddress, 'id' | 'is_default'> & { is_default?: boolean }) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  clearError: () => void;
}

function toAuthError(raw: unknown): AuthError {
  const message =
    (typeof raw === 'object' && raw !== null && 'message' in raw && String((raw as { message: unknown }).message)) ||
    'Something went wrong. Please try again.';
  const code =
    (typeof raw === 'object' && raw !== null && 'code' in raw && String((raw as { code: unknown }).code)) || 'unknown';

  // Supabase's built-in mailer refuses non-team addresses with this code.
  const isMailerLimit =
    code === 'email_address_not_authorized' ||
    /email_address_not_authorized|only send|not authorized/i.test(message);

  return {
    code,
    isMailerLimit,
    message: isMailerLimit
      ? 'This site cannot send confirmation email yet. Sign-in works, but new accounts need the owner to finish email setup (custom SMTP).'
      : message,
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  status: 'idle',
  error: null,
  addresses: [],
  isAdmin: false,
  isOpen: false,
  mode: 'signin',
  isAccountDrawerOpen: false,

  init: () => {
    if (!isSupabaseConfigured() || !supabase) return () => {};

    const client = supabase;

    client.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null });
      if (session) {
        void get().loadAddresses();
        void useWishlistStore.getState().syncOnSignIn(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null });
      if (session) {
        void get().loadAddresses();
        // SIGNED_IN also fires on token refresh; syncOnSignIn is idempotent
        // (union + upsert) so re-running it costs one read and changes nothing.
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          void useWishlistStore.getState().syncOnSignIn(session.user.id);
        }
      } else {
        set({ addresses: [], isAdmin: false });
        if (event === 'SIGNED_OUT') useWishlistStore.getState().resetLocal();
      }
    });

    return () => subscription.unsubscribe();
  },

  openModal: (mode = 'signin') => set({ isOpen: true, mode, error: null }),
  closeModal: () => set({ isOpen: false, error: null }),
  openAccountDrawer: () => set({ isAccountDrawerOpen: true }),
  closeAccountDrawer: () => set({ isAccountDrawerOpen: false }),
  clearError: () => set({ error: null }),

  signIn: async (email, password) => {
    if (!supabase) {
      set({ error: { code: 'not_configured', message: 'Accounts are unavailable: database not configured.', isMailerLimit: false } });
      return false;
    }
    set({ status: 'loading', error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      set({ status: 'error', error: toAuthError(error) });
      return false;
    }
    set({ status: 'idle', session: data.session, user: data.user, isOpen: false });
    void get().loadAddresses();
    return true;
  },

  signUp: async (email, password, fullName) => {
    if (!supabase) {
      set({ error: { code: 'not_configured', message: 'Accounts are unavailable: database not configured.', isMailerLimit: false } });
      return false;
    }
    set({ status: 'loading', error: null });
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    });

    if (error) {
      set({ status: 'error', error: toAuthError(error) });
      return false;
    }

    // No session + a user means "confirmation email sent, must click it".
    if (!data.session && data.user) {
      set({ status: 'awaiting_confirmation', error: null });
      return true;
    }

    set({ status: 'idle', session: data.session, user: data.user, isOpen: false });
    void get().loadAddresses();
    return true;
  },

  signOut: async () => {
    set({ isAccountDrawerOpen: false });
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null, session: null, addresses: [], isAdmin: false, status: 'idle', error: null });
  },

  resetPassword: async (email) => {
    if (!supabase) return false;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) {
      set({ error: toAuthError(error) });
      return false;
    }
    return true;
  },

  loadAddresses: async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      // A signed-in user reading an empty table is normal; a real error is not.
      if (error.code !== 'PGRST116') console.warn('[UniqueLo] addresses:', error.message);
      return;
    }
    set({ addresses: (data ?? []) as CustomerAddress[] });
  },

  saveAddress: async (input) => {
    if (!supabase || !get().user) return false;

    // One default per user is enforced by a partial unique index. Clear the
    // previous default first, or the insert fails with 23505.
    if (input.is_default) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', get().user!.id)
        .eq('is_default', true);
    }

    const { error } = await supabase.from('customer_addresses').insert({
      user_id: get().user!.id,
      label: input.label,
      is_default: input.is_default ?? false,
      recipient_name: input.recipient_name,
      phone: input.phone,
      address_line: input.address_line,
      landmark: input.landmark,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
    });

    if (error) {
      set({ error: toAuthError(error) });
      return false;
    }
    await get().loadAddresses();
    return true;
  },

  deleteAddress: async (id) => {
    if (!supabase) return false;
    const { error } = await supabase.from('customer_addresses').delete().eq('id', id);
    if (error) {
      set({ error: toAuthError(error) });
      return false;
    }
    await get().loadAddresses();
    return true;
  },
}));
