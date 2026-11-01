import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/** TanStack Query provider with this app's default stale time and retry settings. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
