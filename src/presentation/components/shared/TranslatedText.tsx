// ============================================
// src/presentation/components/shared/TranslatedText.tsx
// Componente helper para textos con traducciones
// ============================================

'use client';

import React from 'react';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface TranslatedTextProps {
  /** Namespace de las traducciones (ej: 'auth', 'books', 'common') */
  namespace: string;
  /** Clave de la traducción (ej: 'login', 'save', 'cancel') */
  translationKey: string;
  /** Texto por defecto mientras carga o si falla */
  fallback?: string;
  /** Valores para interpolar (ej: {name: 'Juan'}) */
  values?: Record<string, string | number>;
  /** Clase CSS adicional */
  className?: string;
  /** Tag HTML (default: 'span') */
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * TranslatedText - Componente para textos traducidos desde DB
 *
 * Características:
 * - Carga traducción desde Supabase
 * - Muestra fallback mientras carga
 * - Soporta interpolación de variables
 * - Customizable tag HTML
 *
 * @example
 * ```tsx
 * <TranslatedText
 *   namespace="auth"
 *   translationKey="welcome_message"
 *   fallback="Bienvenido"
 *   values={{name: userName}}
 * />
 * ```
 */
export function TranslatedText({
  namespace,
  translationKey,
  fallback,
  values,
  className,
  as: Component = 'span',
}: TranslatedTextProps) {
  const { t, loading } = useSupabaseTranslations(namespace);

  if (loading && fallback) {
    return <Component className={className}>{fallback}</Component>;
  }

  let text = t(translationKey);

  // Si no encontró la traducción, usar fallback
  if (text.startsWith('[') && text.endsWith(']')) {
    text = fallback || translationKey;
  }

  // Interpolar valores si existen
  if (values) {
    Object.entries(values).forEach(([key, value]) => {
      text = text.replace(`{${key}}`, String(value));
    });
  }

  return <Component className={className}>{text}</Component>;
}

/**
 * T - Alias corto para TranslatedText (más conveniente)
 */
export const T = TranslatedText;

/**
 * useT - Hook que retorna función t del namespace
 * Más simple que usar useSupabaseTranslations directamente
 *
 * @example
 * ```tsx
 * const t = useT('auth');
 * <button>{t('login')}</button>
 * ```
 */
export function useT(namespace: string) {
  const { t, loading } = useSupabaseTranslations(namespace);
  return { t, loading };
}
