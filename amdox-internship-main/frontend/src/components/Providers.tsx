'use client';

// Apollo removed — we use a simple fetch-based REST client (src/lib/api.ts)
// Keeping QueryClient for any future react-query usage

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
