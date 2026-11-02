import { create } from 'zustand';
import type { Product } from '../lib/data';

interface QuickAddState {
  isOpen: boolean;
  product: Product | null;
  openQuickAdd: (product: Product) => void;
  closeQuickAdd: () => void;
}

export const useQuickAddStore = create<QuickAddState>((set) => ({
  isOpen: false,
  product: null,
  openQuickAdd: (product) => set({ isOpen: true, product }),
  closeQuickAdd: () => set({ isOpen: false, product: null }),
}));

