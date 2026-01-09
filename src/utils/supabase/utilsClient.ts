// ============================================
// src/utils/supabase/utilsClient.ts
// MIGRADO a arquitectura limpia
// ============================================
"use client";

import { SupabaseAuthRepository } from '@/src/infrastructure/repositories/SupabaseAuthRepository';
import { GetCurrentUser } from '@/src/core/application/use-cases/auth/GetCurrentUser';
import { CheckAuthentication } from '@/src/core/application/use-cases/auth/CheckAuthentication';
import type { User } from '@supabase/supabase-js';

/**
 * Obtener el usuario actual
 */
export async function getCurrentUser(): Promise<User | null> {
  const repository = new SupabaseAuthRepository();
  const useCase = new GetCurrentUser(repository);
  return await useCase.execute();
}

/**
 * Obtener el ID del usuario actual
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Obtener el email del usuario actual
 */
export async function getUserEmail(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.email || null;
}

/**
 * Verificar si hay un usuario autenticado
 */
export async function isLoggedIn(): Promise<boolean> {
  const repository = new SupabaseAuthRepository();
  const useCase = new CheckAuthentication(repository);
  return await useCase.execute();
}

/**
 * Obtener avatar del usuario
 */
export async function getUserAvatar(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.user_metadata?.avatar_url || null;
}

/**
 * Obtener nombre completo del usuario
 */
export async function getUserFullName(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.user_metadata?.full_name || user?.email || null;
}