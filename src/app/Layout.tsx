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
import { useTheme } from '../config/theme';
import { useAuthStore } from '../stores/auth';

/** Site shell: skip link, header, routed main, overlays, grain. */
export const Layout: React.FC = () => {
  useTheme();

  // One auth subscription for the whole app. Without this, no component sees
  // session state and a refresh silently signs the customer out of the UI while
  // their token still exists.
  const initAuth = useAuthStore((s) => s.init);
  React.useEffect(() => initAuth(), [initAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink selection:bg-accent/20 selection:text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-60 focus:bg-panel-raised focus:text-white focus:px-4 focus:py-2 focus:rounded-sm"
      >
        Skip to content
      </a>
      {/* Flat dark surfaces stay alive with grain, not gradients. Fixed,
          pointer-events-none, and below every interactive layer. */}
      <div className="grain-overlay" aria-hidden="true" />
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
