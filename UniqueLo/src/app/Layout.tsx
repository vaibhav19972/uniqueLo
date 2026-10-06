import React from 'react';
import { Outlet } from 'react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { CustomizerModal } from '../components/customizer/CustomizerModal';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink font-sans selection:bg-accent/20 selection:text-ink">
      <Header />
      <main className="flex-1 pt-[var(--header-height)]">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <CustomizerModal />
    </div>
  );
};
