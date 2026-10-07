import React from 'react';
import { Outlet } from 'react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { CustomizerModal } from '../components/customizer/CustomizerModal';
import { QuickViewModal } from '../components/shop/QuickViewModal';
import { WelcomePopup } from '../components/ui/WelcomePopup';
import { ToastContainer } from '../components/ui/Toast';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink font-sans selection:bg-accent/20 selection:text-ink">
      <Header />
      <main className="flex-1 pt-[calc(var(--header-height)+2.2rem)]">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <CustomizerModal />
      <QuickViewModal />
      <WelcomePopup />
      <ToastContainer />
    </div>
  );
};
