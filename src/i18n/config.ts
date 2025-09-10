// src/i18n/config.ts

// Objeto de configuración centralizada para internacionalización (i18n).
// Define los locales soportados, el locale por defecto y utilidades asociadas.
export const i18nConfig = {
  // Conjunto de locales soportados por la aplicación.
  // El sufijo `as const` transforma el array en una tupla de literales inmutables,
  // lo que permite a TypeScript inferir los valores exactos ("en" | "es") en lugar de `string`.
  locales: ['en', 'es'] as const,

  // Locale predeterminado de la aplicación.
  // Se utilizará cuando el usuario no especifique un idioma o este no sea válido.
  defaultLocale: 'es',

  // Getter computado que devuelve los locales soportados en formato string,
  // separados por el carácter `|`. Útil para construir expresiones regulares dinámicas.
  // Ejemplo: "en|es"
  get lngs() {
    return this.locales.join('|');
  },
} as const; // `as const` aplicado al objeto garantiza que todas sus propiedades sean readonly.

// Exporta este tipo específico para usar en layout
export type LocalesType = typeof i18nConfig.locales;
export type Locale = LocalesType[number]; // Esto será 'en' | 'es'

// Función auxiliar (type guard) para validar si un string corresponde a un `Locale` soportado.
// Si retorna `true`, TypeScript refina automáticamente el tipo de `value` a `Locale`.
// Esto asegura mayor seguridad en tiempo de compilación y evita validaciones manuales repetitivas.
export function isLocale(value: string): value is Locale {
  return (i18nConfig.locales as readonly string[]).includes(value);
}