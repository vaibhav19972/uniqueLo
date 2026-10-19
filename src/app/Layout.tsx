import React from 'react';
import { Outlet } from 'react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { CustomizerModal } from '../components/customizer/CustomizerModal';
import { QuickViewModal } from '../components/shop/QuickViewModal';
import { ToastContainer } from '../components/ui/Toast';

/**
 * Unified site theme: The Atelier quiet-luxury design system now applies
 * uniformly across the entire site including universes. Chrome (header/footer)
 * and content surfaces maintain constant elevated luxury.
 */
export const Layout: React.FC = () => {

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
      <CustomizerModal />
      <QuickViewModal />
      <ToastContainer />
    </div>
  );
};
