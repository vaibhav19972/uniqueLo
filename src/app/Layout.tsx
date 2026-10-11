import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { CustomizerModal } from '../components/customizer/CustomizerModal';
import { QuickViewModal } from '../components/shop/QuickViewModal';
import { ToastContainer } from '../components/ui/Toast';
import { useProducts } from '../hooks/useCatalog';

/**
 * Universe theming root (docs/08 §04): sets [data-universe] on <html> for
 * universe landings and for product pages (derived from the product's
 * universe). Every other route — home, shop, checkout, account — stays
 * neutral because the attribute is removed. Chrome (header/footer) and
 * themed zones follow via scoped token remaps in universes.css.
 */
const useUniverseTheme = () => {
  const location = useLocation();
  const { data: products } = useProducts();

  useEffect(() => {
    const html = document.documentElement;
    let slug: string | null = null;

    const universeMatch = location.pathname.match(/^\/universes\/([\w-]+)/);
    if (universeMatch) {
      slug = universeMatch[1];
    } else {
      const productMatch = location.pathname.match(/^\/product\/([\w-]+)/);
      if (productMatch) {
        slug =
          products?.find((p) => p.slug === productMatch[1])?.universeSlug ?? null;
      }
    }

    if (slug) html.setAttribute('data-universe', slug);
    else html.removeAttribute('data-universe');
    return () => html.removeAttribute('data-universe');
  }, [location.pathname, products]);
};

export const Layout: React.FC = () => {
  useUniverseTheme();

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink selection:bg-accent/20 selection:text-ink">
      <Header />
      <main className="flex-1 pt-[calc(var(--header-height)+2.2rem)]">
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
