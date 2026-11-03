import React, { useMemo } from 'react';
import { Outlet, useParams, useLocation } from 'react-router';
import { AnnouncementBar } from '../components/layout/AnnouncementBar';
import { StickyGlassHeader } from '../components/layout/StickyGlassHeader';
import { MobileNavigationDrawer } from '../components/layout/MobileNavigationDrawer';
import { FloatingWidgets } from '../components/layout/FloatingWidgets';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { WishlistDrawer } from '../components/layout/WishlistDrawer';
import { AccountDrawer } from '../components/auth/AccountDrawer';
import { CustomizerModal } from '../components/customizer/CustomizerModal';
import { SelectOptionsModal } from '../components/shop/SelectOptionsModal';
import { QuickViewModal } from '../components/shop/QuickViewModal';
import { QuickAddModal } from '../components/shop/QuickAddModal';
import { AuthModal } from '../components/auth/AuthModal';
import { ToastContainer } from '../components/ui/Toast';
import { universeAccent, useThemeBoot } from '../config/theme';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';

export const Layout: React.FC = () => {
  useThemeBoot();

  const { universeSlug } = useParams<{ universeSlug?: string }>();
  const accent = useMemo(() => universeAccent(universeSlug), [universeSlug]);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAnnouncementDismissed = useUIStore((s) => s.isAnnouncementDismissed);

  const initAuth = useAuthStore((s) => s.init);
  React.useEffect(() => initAuth(), [initAuth]);

  const mainPaddingTop = isHome
    ? 'pt-0'
    : isAnnouncementDismissed
      ? 'pt-[104px] lg:pt-[72px]'
      : 'pt-[140px] lg:pt-[108px]';

  return (
    <div
      data-accent={accent}
      className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-200 selection:text-black overflow-x-hidden"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:rounded-sm"
      >
        Skip to content
      </a>

      {/* ── Top Stack ── */}
      <AnnouncementBar />
      <StickyGlassHeader />

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`flex-1 w-full ${mainPaddingTop}`}
      >
        <Outlet />
      </main>

      {/* ── Colophon & Modals ── */}
      <Footer />

      {/* Mobile-First Navigation Drawer */}
      <MobileNavigationDrawer />

      {/* Quick-Add Size Bottom Sheet (Bonkers 1:1 SELECT OPTIONS modal) */}
      <SelectOptionsModal />

      {/* Persistent Floating Widgets (Bottom-Left Chat + Desktop QR) */}
      <FloatingWidgets />

      {/* Cart & Secondary Drawers */}
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
