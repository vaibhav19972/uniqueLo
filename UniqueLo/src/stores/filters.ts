import { create } from 'zustand';
import type { FilterState, SortKey, EmbroideryTechnique, Gender, IntensityLevel, ExpressionSlug, ExpressionScore, ArtStyleSlug, EditSlug } from '../lib/data';

interface FiltersStore {
  filters: FilterState;
  setCategory: (categorySlug: string) => void;
  setUniverse: (universeSlug: string | 'all') => void;
  setGender: (gender: Gender | 'all') => void;
  setIntensity: (intensity: IntensityLevel | 'all') => void;
  setExpressionSlug: (expressionSlug: ExpressionSlug | 'all') => void;
  setExpressionScore: (expressionScore: ExpressionScore | 'all') => void;
  setCharacter: (characterId: string | 'all') => void;
  setCollectionSlug: (collectionSlug: string | 'all') => void;
  setArtStyle: (artStyle: ArtStyleSlug | 'all') => void;
  setEdit: (edit: EditSlug | 'all') => void;
  setGarmentTypes: (garmentTypes: string[]) => void;
  toggleGarmentType: (garmentType: string) => void;
  toggleColor: (color: string) => void;
  toggleSize: (size: string) => void;
  toggleTechnique: (technique: EmbroideryTechnique) => void;
  setPriceMax: (priceMax?: number) => void;
  setSearchQuery: (query: string) => void;
  setSort: (sort: SortKey) => void;
  resetFilters: () => void;
}

const initialFilters: FilterState = {
  categorySlug: 'all',
  universeSlug: 'all',
  gender: 'all',
  garmentTypes: [],
  intensity: 'all',
  expressionSlug: 'all',
  expressionScore: 'all',
  characterId: 'all',
  collectionSlug: 'all',
  artStyleSlug: 'all',
  edit: 'all',
  colors: [],
  sizes: [],
  techniques: [],
  priceMax: undefined,
  searchQuery: '',
  sort: 'newest',
};

export const useFiltersStore = create<FiltersStore>((set) => ({
  filters: initialFilters,

  setCategory: (categorySlug) =>
    set((state) => ({
      filters: { ...state.filters, categorySlug },
    })),

  setUniverse: (universeSlug) =>
    set((state) => ({
      filters: { ...state.filters, universeSlug },
    })),

  setGender: (gender) =>
    set((state) => ({
      filters: { ...state.filters, gender },
    })),

  setIntensity: (intensity) =>
    set((state) => ({
      filters: { ...state.filters, intensity },
    })),

  setExpressionSlug: (expressionSlug) =>
    set((state) => ({
      filters: { ...state.filters, expressionSlug },
    })),

  setExpressionScore: (expressionScore) =>
    set((state) => ({
      filters: { ...state.filters, expressionScore },
    })),

  setCharacter: (characterId) =>
    set((state) => ({
      filters: { ...state.filters, characterId },
    })),

  setCollectionSlug: (collectionSlug) =>
    set((state) => ({
      filters: { ...state.filters, collectionSlug, artStyleSlug: collectionSlug },
    })),

  setArtStyle: (artStyleSlug) =>
    set((state) => ({
      filters: { ...state.filters, collectionSlug: artStyleSlug, artStyleSlug },
    })),

  setEdit: (edit) =>
    set((state) => ({
      filters: { ...state.filters, edit },
    })),

  setGarmentTypes: (garmentTypes) =>
    set((state) => ({
      filters: { ...state.filters, garmentTypes },
    })),

  toggleGarmentType: (garmentType) =>
    set((state) => {
      const current = state.filters.garmentTypes ?? [];
      const exists = current.includes(garmentType);
      const next = exists ? current.filter((g) => g !== garmentType) : [...current, garmentType];
      return { filters: { ...state.filters, garmentTypes: next } };
    }),

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
        ? state.filters.sizes.filter((c) => c !== size)
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

  setSearchQuery: (searchQuery) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery },
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
