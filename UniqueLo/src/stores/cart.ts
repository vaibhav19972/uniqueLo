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
    customization?: CartCustomization
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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

      addItem: (productSlug, variantSku, quantity = 1, customization) => {
        const id = generateCartItemId(productSlug, variantSku, customization);
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === id);
          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
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
                quantity,
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

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
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
