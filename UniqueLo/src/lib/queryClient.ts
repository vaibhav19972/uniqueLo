import { QueryClient } from '@tanstack/react-query';

/**
 * Shared catalog query client (Phase 7).
 * Singleton so non-hook modules (e.g. cart store on rehydrate) can
 * invalidate catalog queries via `queryClient.invalidateQueries(...)`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // catalog data is editor-managed, not realtime
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});