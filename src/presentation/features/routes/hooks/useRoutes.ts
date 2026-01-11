// ============================================
// src/presentation/features/routes/hooks/useRoutes.ts
// Hook: Gestión de rutas (igual que useUserTypes)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Route, RouteTranslation } from '@/src/core/domain/entities/Route';
import { SupabaseRouteRepository } from '@/src/infrastructure/repositories/SupabaseRouteRepository';
import { CreateRouteDTO, UpdateRouteDTO } from '@/src/core/domain/repositories/RouteRepository';

const routeRepository = new SupabaseRouteRepository();

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar todas las rutas
   */
  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routeRepository.findAll();
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar rutas');
      console.error('Error loading routes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva ruta
   */
  const createRoute = useCallback(async (dto: CreateRouteDTO) => {
    try {
      const newRoute = await routeRepository.create(dto);
      setRoutes(prev => [...prev, newRoute]);
      return newRoute;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear ruta');
    }
  }, []);

  /**
   * Actualizar ruta
   */
  const updateRoute = useCallback(async (id: string, dto: UpdateRouteDTO) => {
    try {
      const updatedRoute = await routeRepository.update(id, dto);
      setRoutes(prev => prev.map(route => 
        route.id === id ? updatedRoute : route
      ));
      return updatedRoute;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar ruta');
    }
  }, []);

  /**
   * Eliminar ruta (soft delete)
   */
  const deleteRoute = useCallback(async (id: string) => {
    try {
      await routeRepository.delete(id);
      await loadRoutes(); // Recargar para mostrar como eliminada
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar ruta');
    }
  }, [loadRoutes]);

  /**
   * Restaurar ruta
   */
  const restoreRoute = useCallback(async (id: string) => {
    try {
      await routeRepository.restore(id);
      await loadRoutes(); // Recargar para actualizar estado
    } catch (err: any) {
      throw new Error(err.message || 'Error al restaurar ruta');
    }
  }, [loadRoutes]);

  /**
   * Eliminar ruta permanentemente
   */
  const hardDeleteRoute = useCallback(async (id: string) => {
    try {
      await routeRepository.hardDelete(id);
      setRoutes(prev => prev.filter(route => route.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar ruta permanentemente');
    }
  }, []);

  /**
   * Refrescar lista de rutas
   */
  const refresh = useCallback(() => {
    loadRoutes();
  }, [loadRoutes]);

  // Cargar al montar
  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  return {
    routes,
    loading,
    error,
    createRoute,
    updateRoute,
    deleteRoute,
    restoreRoute,
    hardDeleteRoute,
    refresh,
  };
}