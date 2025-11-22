/**
 * UBICACIÓN: src/infrastructure/di/providers.ts
 */

'use client';

import React, { createContext, useContext } from 'react';
import { container, DIContainer } from './container';

const DIContext = createContext<DIContainer | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
  return (
    <DIContext.Provider value={container}>
      {children}
    </DIContext.Provider>
  );
}

export function useDI(): DIContainer {
  const context = useContext(DIContext);
  if (!context) {
    throw new Error('useDI debe ser usado dentro de un DIProvider');
  }
  return context;
}

export function useSaveBook() {
  const di = useDI();
  return di.getSaveBookUseCase();
}

export function useLoadBook() {
  const di = useDI();
  return di.getLoadBookUseCase();
}

export function useBookRepository() {
  const di = useDI();
  return di.getBookRepository();
}

export function useStorageService() {
  const di = useDI();
  return di.getStorageService();
}