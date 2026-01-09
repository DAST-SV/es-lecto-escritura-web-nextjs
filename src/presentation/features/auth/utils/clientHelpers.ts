// ============================================
// src/presentation/features/auth/utils/clientHelpers.ts
// Helpers para usar en Client Components
// ============================================
"use client";

import { SupabaseAuthRepository } from '@/src/infrastructure/repositories/SupabaseAuthRepository';
import { GetCurrentUser } from '@/src/core/application/use-cases/auth/GetCurrentUser';
import type { User } from '@supabase/supabase-js';

/**
 * Obtener usuario actual en Client Component
 * Aquí SÍ usamos casos de uso
 */
export async function getCurrentUserClient(): Promise<User | null> {
  const repository = new SupabaseAuthRepository();
  const useCase = new GetCurrentUser(repository);
  return await useCase.execute();
}

/**
 * Verificar si hay usuario autenticado en Client Component
 */
export async function isAuthenticatedClient(): Promise<boolean> {
  const user = await getCurrentUserClient();
  return user !== null;
}