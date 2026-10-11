import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartCustomization } from '../lib/data';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    productSlug: string,
    variantSku: string,
    quantity?: number,
    customization?: CartCustomization,
    maxQuantity?: number
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number, maxQuantity?: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

function generateCartItemId(
  productSlug: string,
  variantSku: string,
  customization?: CartCustomization
): string {
  if (!customization) {
    return `${productSlug}__${variantSku}`;
  }
  const customKey = `${customization.monogramText ?? ''}_${customization.threadColor ?? ''}_${customization.placement ?? ''}`;
  return `${productSlug}__${variantSku}__${customKey}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (productSlug, variantSku, quantity = 1, customization, maxQuantity) => {
        const id = generateCartItemId(productSlug, variantSku, customization);
        const safeQty = maxQuantity != null ? Math.min(Math.max(1, quantity), maxQuantity) : Math.max(1, quantity);
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === id);
          if (existingIndex > -1) {
            const newItems = [...state.items];
            const prev = newItems[existingIndex].quantity;
            const next = maxQuantity != null ? Math.min(prev + safeQty, maxQuantity) : prev + safeQty;
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: next,
            };
            return { items: newItems, isOpen: true };
          }
          return {
            items: [
              ...state.items,
              {
                id,
                productSlug,
                variantSku,
                quantity: safeQty,
                customization,
              },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity, maxQuantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const safeQty = maxQuantity != null ? Math.min(quantity, maxQuantity) : quantity;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: safeQty } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'uniquelo-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
