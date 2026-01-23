// ============================================
// src/presentation/features/translations/hooks/useClientTranslations.ts
// ============================================

'use client';
import { useTranslations } from 'next-intl';

/**
 * Hook simplificado que usa next-intl
 * Las traducciones ya vienen desde Supabase vía i18n/request.ts
 */
export function useClientTranslations(namespace: string) {
  const t = useTranslations(namespace);
  
  return { t };
}