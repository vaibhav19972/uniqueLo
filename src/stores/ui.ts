import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../lib/data';

export type GenderTab = 'WOMEN' | 'MEN' | 'ACCESSORIES';

interface UIState {
  isMobileMenuOpen: boolean;
  activeGenderTab: GenderTab;
  isSearchOverlayOpen: boolean;
  quickViewProduct: Product | null;
  isAppBannerDismissed: boolean;
  isAnnouncementDismissed: boolean;

  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setActiveGenderTab: (tab: GenderTab) => void;
  setSearchOverlayOpen: (open: boolean) => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  dismissAppBanner: () => void;
  resetAppBanner: () => void;
  dismissAnnouncement: () => void;
  resetAnnouncement: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isMobileMenuOpen: false,
      activeGenderTab: 'MEN',
      isSearchOverlayOpen: false,
      quickViewProduct: null,
      isAppBannerDismissed: false,
      isAnnouncementDismissed: false,

      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setActiveGenderTab: (tab) => set({ activeGenderTab: tab }),
      setSearchOverlayOpen: (open) => set({ isSearchOverlayOpen: open }),
      openQuickView: (product) => set({ quickViewProduct: product }),
      closeQuickView: () => set({ quickViewProduct: null }),
      dismissAppBanner: () => set({ isAppBannerDismissed: true }),
      resetAppBanner: () => set({ isAppBannerDismissed: false }),
      dismissAnnouncement: () => set({ isAnnouncementDismissed: true }),
      resetAnnouncement: () => set({ isAnnouncementDismissed: false }),
    }),
    {
      name: 'uniquelo_bonkers_ui_state',
      partialize: (state) => ({
        isAppBannerDismissed: state.isAppBannerDismissed,
        isAnnouncementDismissed: state.isAnnouncementDismissed,
        activeGenderTab: state.activeGenderTab,
      }),
    }
  )
);
