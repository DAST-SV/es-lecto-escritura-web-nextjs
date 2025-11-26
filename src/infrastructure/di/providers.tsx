/**
 * UBICACIÓN: src/infrastructure/di/providers.tsx
 */

'use client';

import React, { createContext, useContext } from 'react';
import { container } from './container';

type ContainerType = typeof container;

const DIContext = createContext<ContainerType | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
  return (
    <DIContext.Provider value={container}>
      {children}
    </DIContext.Provider>
  );
}

export function useDI(): ContainerType {
  const context = useContext(DIContext);
  if (!context) {
    throw new Error('useDI debe ser usado dentro de un DIProvider');
  }
  return context;
}