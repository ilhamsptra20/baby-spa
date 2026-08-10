import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
    mutations: {
      retry: 1,
    },
  },
};

export function createQueryClient() {
  return new QueryClient(queryClientConfig);
}
