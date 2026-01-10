// ============================================
// src/presentation/features/auth/utils/clientHelpers.ts
// ============================================
"use client";

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories/SupabaseAuthRepository';
import { GetCurrentUser } from '@/src/core/application/use-cases/auth/GetCurrentUser';
import { CheckAuthentication } from '@/src/core/application/use-cases/auth/CheckAuthentication';
import type { User } from '@supabase/supabase-js';

/**
 * Obtener usuario actual en Client Component
 * Aquí SÍ usamos casos de uso
 */
export async function getCurrentUserClient(): Promise<User | null> {
  const supabase = createClient(); // ✅ Cliente browser
  const repository = new SupabaseAuthRepository(supabase); // ✅ Inyectar
  const useCase = new GetCurrentUser(repository);
  return await useCase.execute();
}

/**
 * Verificar si hay usuario autenticado en Client Component
 */
export async function isAuthenticatedClient(): Promise<boolean> {
  const supabase = createClient(); // ✅ Cliente browser
  const repository = new SupabaseAuthRepository(supabase); // ✅ Inyectar
  const useCase = new CheckAuthentication(repository);
  return await useCase.execute();
}