/**
 * UBICACIÓN: src/infrastructure/di/providers.ts
 * 
 * Providers de React Context para inyección de dependencias
 */

'use client';

import React, { createContext, useContext } from 'react';
import { container, DIContainer } from './container';

// Contexto para el contenedor DI
const DIContext = createContext<DIContainer>(container);

/**
 * Provider de Inyección de Dependencias
 * Envuelve la aplicación para proporcionar acceso al contenedor DI
 */
export function DIProvider({ children }: { children: React.ReactNode }) {
  return (
    <DIContext.Provider value={container}>
      {children}
    </DIContext.Provider>
  );
}

/**
 * Hook para acceder al contenedor de inyección de dependencias
 */
export function useDI(): DIContainer {
  const context = useContext(DIContext);
  if (!context) {
    throw new Error('useDI debe ser usado dentro de un DIProvider');
  }
  return context;
}

/**
 * Hook para obtener el caso de uso SaveBook
 */
export function useSaveBook() {
  const di = useDI();
  return di.getSaveBookUseCase();
}

/**
 * Hook para obtener el caso de uso LoadBook
 */
export function useLoadBook() {
  const di = useDI();
  return di.getLoadBookUseCase();
}

/**
 * Hook para obtener el repositorio de libros
 */
export function useBookRepository() {
  const di = useDI();
  return di.getBookRepository();
}

/**
 * Hook para obtener el servicio de storage
 */
export function useStorageService() {
  const di = useDI();
  return di.getStorageService();
}