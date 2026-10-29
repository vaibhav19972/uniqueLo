import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

/**
 * Saved pieces.
 *
 * Two sources of truth, one list:
 *   - local  (always) — `localStorage`, works signed out, survives offline
 *   - cloud  (optional) — `customer_wishlists`, for cross-device sync
 *
 * MERGE RULE (deliberate, documented because silent data loss is the risk):
 *   On sign-in, local ∪ cloud — a UNION, not a replace. Neither side deletes
 *   anything the other side saved. The merged set is pushed to the cloud once,
 *   then from that point on every toggle writes through to both.
 *
 *   Why union and not "server wins": a guest who saves 6 pieces and signs in
 *   would otherwise lose all 6 the first time they sign in on a new device.
 *   Why not "local wins": the same customer on their second device would wipe
 *   the cloud list. Union is the only rule that never destroys data.
 *
 *   Toggling OFF removes from both, so removal is still possible — the union
 *   applies to merging, not to intent.
 */

interface WishlistState {
  savedSlugs: string[];
  isOpen: boolean;
  syncing: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  clearWishlist: () => void;
  count: () => number;
  /** Merge local + cloud on sign-in, then push the union up. */
  syncOnSignIn: (userId: string) => Promise<void>;
  /** Wipe local state on sign-out (cloud copy is retained). */
  resetLocal: () => void;
}

async function fetchRemote(userId: string): Promise<string[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('customer_wishlists')
    .select('product_slug')
    .eq('user_id', userId);
  if (error) {
    console.warn('[UniqueLo] wishlist fetch failed:', error.message);
    return null;
  }
  return (data ?? []).map((r) => r.product_slug as string);
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      savedSlugs: [],
      isOpen: false,
      syncing: false,

      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),

      toggleWishlist: (slug) => {
        const wasSaved = get().savedSlugs.includes(slug);
        set((state) => ({
          savedSlugs: wasSaved
            ? state.savedSlugs.filter((s) => s !== slug)
            : [...state.savedSlugs, slug],
        }));

        // Write through when signed in. Fire-and-forget: the local list is the
        // UI source of truth, so a failed sync must not block the interaction.
        if (supabase) {
          void (async () => {
            const { data } = await supabase.auth.getUser();
            const uid = data.user?.id;
            if (!uid) return;
            if (wasSaved) {
              await supabase.from('customer_wishlists').delete().eq('user_id', uid).eq('product_slug', slug);
            } else {
              await supabase
                .from('customer_wishlists')
                .upsert({ user_id: uid, product_slug: slug }, { onConflict: 'user_id,product_slug' });
            }
          })();
        }
      },

      isWishlisted: (slug) => get().savedSlugs.includes(slug),
      clearWishlist: () => set({ savedSlugs: [] }),
      count: () => get().savedSlugs.length,

      syncOnSignIn: async (userId) => {
        if (!supabase) return;
        set({ syncing: true });
        try {
          const remote = await fetchRemote(userId);
          if (remote === null) return;

          const local = get().savedSlugs;
          const merged = Array.from(new Set([...local, ...remote]));

          set({ savedSlugs: merged });

          // Push anything the cloud does not have yet. Upsert is idempotent and
          // the PK is (user_id, product_slug), so a re-run cannot duplicate.
          const missing = merged.filter((s) => !remote.includes(s));
          if (missing.length > 0) {
            const { error } = await supabase
              .from('customer_wishlists')
              .upsert(
                missing.map((slug) => ({ user_id: userId, product_slug: slug })),
                { onConflict: 'user_id,product_slug' },
              );
            if (error) console.warn('[UniqueLo] wishlist merge push failed:', error.message);
          }
        } finally {
          set({ syncing: false });
        }
      },

      resetLocal: () => set({ savedSlugs: [], isOpen: false }),
    }),
    {
      name: 'uniquelo-wishlist-storage',
      // `syncing` is transient UI state and must never be persisted.
      partialize: (state) => ({ savedSlugs: state.savedSlugs }),
    },
  ),
);
