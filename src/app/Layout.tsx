import React, { useMemo } from 'react';
import { Outlet, useParams } from 'react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { WishlistDrawer } from '../components/layout/WishlistDrawer';
import { AccountDrawer } from '../components/auth/AccountDrawer';
import { CustomizerModal } from '../components/customizer/CustomizerModal';
import { QuickViewModal } from '../components/shop/QuickViewModal';
import { QuickAddModal } from '../components/shop/QuickAddModal';
import { AuthModal } from '../components/auth/AuthModal';
import { ToastContainer } from '../components/ui/Toast';
import { universeAccent, useThemeBoot } from '../config/theme';
import { useAuthStore } from '../stores/auth';

/**
 * Site shell.
 *
 * Two axes are applied here and nowhere else:
 *
 *   • colour mode (light / dark) — booted from config/theme, applied to <html>
 *   • accent scope              — derived from the route, applied to this
 *                                 wrapper, so a universe page colours its
 *                                 controls without touching a single component
 *
 * The accent scope is set as `data-accent`, which tokens.css reads to
 * re-point --color-accent. Everything inside — buttons, focus rings, badges,
 * hovers — follows automatically.
 */
export const Layout: React.FC = () => {
  useThemeBoot();

  // Universe accent follows the route. /universes/itihaas brands the page
  // with the darbar wine; every other route uses the house terracotta.
  const { universeSlug } = useParams<{ universeSlug?: string }>();
  const accent = useMemo(() => universeAccent(universeSlug), [universeSlug]);

  // One auth subscription for the whole app. Without this, no component sees
  // session state and a refresh silently signs the customer out of the UI while
  // their token still exists.
  const initAuth = useAuthStore((s) => s.init);
  React.useEffect(() => initAuth(), [initAuth]);

  return (
    <div
      data-accent={accent}
      className="min-h-screen flex flex-col bg-cream text-ink selection:bg-accent-soft selection:text-ink"
    >
      {/* Grain sits above the canvas but below all content. */}
      <div className="grain-overlay" aria-hidden="true" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-ink focus:text-cream focus:px-4 focus:py-2 focus:rounded-sm"
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
      <QuickAddModal />
      <ToastContainer />
    </div>
  );
};
