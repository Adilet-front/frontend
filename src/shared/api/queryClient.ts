/**
 * Единственный экземпляр QueryClient для React Query.
 * Один повтор при ошибке, без рефетча при фокусе окна.
 */
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
