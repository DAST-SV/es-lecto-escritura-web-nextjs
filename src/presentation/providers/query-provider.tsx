// src/presentation/providers/query-provider.tsx
// Provider de TanStack Query para la aplicación

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Configuración optimizada del QueryClient
 * - staleTime: Tiempo antes de que los datos se consideren obsoletos
 * - gcTime: Tiempo antes de que los datos se eliminen del caché (antes cacheTime)
 * - retry: Reintentos automáticos en caso de error
 * - refetchOnWindowFocus: Refetch al volver a la ventana
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Los datos se consideran frescos por 1 minuto
        staleTime: 60 * 1000,
        // Los datos se mantienen en caché por 5 minutos
        gcTime: 5 * 60 * 1000,
        // Reintentar 1 vez en caso de error
        retry: 1,
        // Delay exponencial entre reintentos
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // No refetch automático al volver a la ventana (mejor UX)
        refetchOnWindowFocus: false,
        // No refetch automático al reconectar
        refetchOnReconnect: true,
      },
      mutations: {
        // No reintentar mutaciones automáticamente
        retry: false,
      },
    },
  });
}

// Variable para almacenar el cliente en el navegador
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Servidor: siempre crear un nuevo cliente
    return makeQueryClient();
  } else {
    // Cliente: reutilizar el cliente existente o crear uno nuevo
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: QueryProviderProps) {
  // useState asegura que el cliente se cree una sola vez por componente
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}

export { getQueryClient };
