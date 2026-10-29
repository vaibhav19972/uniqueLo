import React from 'react';
import { Outlet } from 'react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { WishlistDrawer } from '../components/layout/WishlistDrawer';
import { AccountDrawer } from '../components/auth/AccountDrawer';
import { CustomizerModal } from '../components/customizer/CustomizerModal';
import { QuickViewModal } from '../components/shop/QuickViewModal';
import { AuthModal } from '../components/auth/AuthModal';
import { ToastContainer } from '../components/ui/Toast';
import { useIsThemeV2 } from '../config/theme';
import { useAuthStore } from '../stores/auth';

/**
 * Unified site layout supporting both v1 (The Atelier) and v2 (Modern D2C Streetwear
 * with exact Gokwik-style cart bag from sketches/design system.png) via USE_THEME_V2.
 */
export const Layout: React.FC = () => {
  useIsThemeV2();

  // One auth subscription for the whole app. Without this, no component sees
  // session state and a refresh silently signs the customer out of the UI while
  // their token still exists.
  const initAuth = useAuthStore((s) => s.init);
  React.useEffect(() => initAuth(), [initAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink selection:bg-accent/20 selection:text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[500] focus:bg-ink focus:text-cream focus:px-4 focus:py-2 focus:rounded-sm"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1 pt-[calc(var(--header-height)+2.2rem)]">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <AccountDrawer />
      <AuthModal />
      <CustomizerModal />
      <QuickViewModal />
      <ToastContainer />
    </div>
  );
};
