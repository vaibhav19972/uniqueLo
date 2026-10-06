import { create } from 'zustand';
import type { Product } from '../lib/data';

interface CustomizerState {
  isOpen: boolean;
  product: Product | null;
  text: string;
  placement: string;
  threadColor: string;
  threadHex: string;
  style: string;
  openCustomizer: (product: Product) => void;
  closeCustomizer: () => void;
  setText: (text: string) => void;
  setPlacement: (placement: string) => void;
  setThreadColor: (colorName: string, hex: string) => void;
  setStyle: (style: string) => void;
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  isOpen: false,
  product: null,
  text: 'UL',
  placement: 'Left Chest',
  threadColor: '24K Gold Zari',
  threadHex: '#d4af37',
  style: 'Serif Monogram',

  openCustomizer: (product) =>
    set({
      isOpen: true,
      product,
      text: 'UL',
      placement: 'Left Chest',
      threadColor: '24K Gold Zari',
      threadHex: '#d4af37',
      style: 'Serif Monogram',
    }),

  closeCustomizer: () => set({ isOpen: false, product: null }),
  setText: (text) => set({ text: text.toUpperCase().slice(0, 5) }),
  setPlacement: (placement) => set({ placement }),
  setThreadColor: (threadColor, threadHex) => set({ threadColor, threadHex }),
  setStyle: (style) => set({ style }),
}));
