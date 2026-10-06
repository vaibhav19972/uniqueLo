import { create } from 'zustand';
import type { FilterState, SortKey, EmbroideryTechnique } from '../lib/data';

interface FiltersStore {
  filters: FilterState;
  setCategory: (categorySlug: string) => void;
  toggleColor: (color: string) => void;
  toggleSize: (size: string) => void;
  toggleTechnique: (technique: EmbroideryTechnique) => void;
  setPriceMax: (priceMax?: number) => void;
  setSort: (sort: SortKey) => void;
  resetFilters: () => void;
}

const initialFilters: FilterState = {
  categorySlug: 'all',
  colors: [],
  sizes: [],
  techniques: [],
  priceMax: undefined,
  sort: 'newest',
};

export const useFiltersStore = create<FiltersStore>((set) => ({
  filters: initialFilters,

  setCategory: (categorySlug) =>
    set((state) => ({
      filters: { ...state.filters, categorySlug },
    })),

  toggleColor: (color) =>
    set((state) => {
      const exists = state.filters.colors.includes(color);
      const next = exists
        ? state.filters.colors.filter((c) => c !== color)
        : [...state.filters.colors, color];
      return { filters: { ...state.filters, colors: next } };
    }),

  toggleSize: (size) =>
    set((state) => {
      const exists = state.filters.sizes.includes(size);
      const next = exists
        ? state.filters.sizes.filter((s) => s !== size)
        : [...state.filters.sizes, size];
      return { filters: { ...state.filters, sizes: next } };
    }),

  toggleTechnique: (technique) =>
    set((state) => {
      const current = state.filters.techniques ?? [];
      const exists = current.includes(technique);
      const next = exists
        ? current.filter((t) => t !== technique)
        : [...current, technique];
      return { filters: { ...state.filters, techniques: next } };
    }),

  setPriceMax: (priceMax) =>
    set((state) => ({
      filters: { ...state.filters, priceMax },
    })),

  setSort: (sort) =>
    set((state) => ({
      filters: { ...state.filters, sort },
    })),

  resetFilters: () =>
    set(() => ({
      filters: initialFilters,
    })),
}));
