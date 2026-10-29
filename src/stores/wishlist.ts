import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  savedSlugs: string[];
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  clearWishlist: () => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      savedSlugs: [],
      isOpen: false,
      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),
      toggleWishlist: (slug) => {
        set((state) => {
          const exists = state.savedSlugs.includes(slug);
          if (exists) {
            return { savedSlugs: state.savedSlugs.filter((s) => s !== slug) };
          }
          return { savedSlugs: [...state.savedSlugs, slug] };
        });
      },
      isWishlisted: (slug) => get().savedSlugs.includes(slug),
      clearWishlist: () => set({ savedSlugs: [] }),
      count: () => get().savedSlugs.length,
    }),
    {
      name: 'uniquelo-wishlist-storage',
    }
  )
);
