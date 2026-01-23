# 🌍 Sistema de Traducciones con Supabase

Este documento explica cómo funciona el sistema de traducciones dinámicas desde Supabase en ES Lecto Escritura.

## 📋 Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Configuración Inicial](#configuración-inicial)
3. [Uso en Componentes](#uso-en-componentes)
4. [Namespaces Disponibles](#namespaces-disponibles)
5. [Agregar Nuevas Traducciones](#agregar-nuevas-traducciones)
6. [Fallback a Messages](#fallback-a-messages)

---

## Arquitectura

El sistema de traducciones utiliza **Supabase** como fuente principal de verdad para todas las traducciones de la aplicación.

### Estructura de Base de Datos

```
app.languages
├── code (es, en, fr)
├── name
├── native_name
└── flag_emoji

app.translation_namespaces
├── slug (auth, navigation, common, errors)
├── name
└── description

app.translation_categories
├── slug (ui-components, forms, navigation, actions, errors)
├── name
└── description

app.translation_keys
├── namespace_slug (referencia a namespace)
├── key_name (ej: "form.email_label")
├── category_id (referencia a category)
└── description

app.translations
├── translation_key_id (referencia a key)
├── language_code (referencia a language)
├── value (texto traducido)
└── is_verified
```

### Flujo de Datos

```
┌──────────────────────────────────────────────────┐
│         Componente React                         │
│  useSupabaseTranslations('auth')                 │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│         GetTranslationsUseCase                   │
│  (Clean Architecture - Caso de Uso)              │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│    SupabaseTranslationRepository                 │
│  (Infraestructura - Implementación)              │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│         Supabase PostgreSQL                      │
│                                                  │
│  SELECT tk.key_name, t.value                     │
│  FROM app.translation_keys tk                    │
│  JOIN app.translations t                         │
│    ON tk.id = t.translation_key_id               │
│  WHERE tk.namespace_slug = 'auth'                │
│    AND t.language_code = 'es'                    │
└──────────────────────────────────────────────────┘
```

---

## Configuración Inicial

### 1. Ejecutar Scripts SQL

Primero, asegúrate de ejecutar los scripts en orden:

```sql
-- 1. Sistema de traducciones completo
\i supabase/schemas/app/14_SISTEMA_TRADUCCIONES_COMPLETO.sql

-- 2. Inserts de traducciones
\i supabase/schemas/auth/01_INSERTS_TRADUCCIONES_COMPLETAS.sql
```

O en Supabase SQL Editor:
1. Copia el contenido de `14_SISTEMA_TRADUCCIONES_COMPLETO.sql`
2. Pégalo y ejecuta (RUN)
3. Copia el contenido de `01_INSERTS_TRADUCCIONES_COMPLETAS.sql`
4. Pégalo y ejecuta (RUN)

### 2. Verificar Instalación

```sql
-- Ver namespaces disponibles
SELECT slug, name, description
FROM app.translation_namespaces
ORDER BY slug;

-- Ver cantidad de claves por namespace
SELECT
    namespace_slug,
    COUNT(*) as total_keys
FROM app.translation_keys
GROUP BY namespace_slug
ORDER BY namespace_slug;

-- Ver cantidad de traducciones por idioma
SELECT
    language_code,
    COUNT(*) as total_translations
FROM app.translations
GROUP BY language_code
ORDER BY language_code;
```

**Resultado esperado:**
- 5 namespaces: auth, common, errors, navigation, admin
- ~89 claves de traducción
- ~267 traducciones totales (89 claves x 3 idiomas)

---

## Uso en Componentes

### Componente Client-Side

```tsx
'use client';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks';

export function LoginButton() {
  const { t, loading, locale } = useSupabaseTranslations('auth');

  if (loading) return <div>Loading...</div>;

  return (
    <button>
      {t('form.login_button')}
    </button>
  );
}
```

### Múltiples Namespaces

```tsx
'use client';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks';

export function MyComponent() {
  const auth = useSupabaseTranslations('auth');
  const nav = useSupabaseTranslations('navigation');
  const common = useSupabaseTranslations('common');

  return (
    <div>
      <h1>{auth.t('login.title')}</h1>
      <nav>
        <a href="/">{nav.t('home')}</a>
        <a href="/login">{nav.t('login')}</a>
      </nav>
      <button>{common.t('save')}</button>
    </div>
  );
}
```

### Con Caché

El hook `useSupabaseTranslations` **incluye caché automático** en memoria. Las traducciones se cargan una sola vez por namespace + idioma y se reutilizan en toda la aplicación.

```tsx
// Primera carga: consulta a Supabase
const auth = useSupabaseTranslations('auth');

// Segunda carga en otro componente: usa caché
const auth2 = useSupabaseTranslations('auth'); // ⚡ Instantáneo
```

---

## Namespaces Disponibles

### `auth` - Autenticación

Claves disponibles:

```typescript
// Formularios
'form.email_label'
'form.email_placeholder'
'form.password_label'
'form.password_placeholder'
'form.remember_me'
'form.forgot_password'
'form.login_button'
'form.login_button_loading'
'form.connect_with'
'form.or_use_email'

// Login
'login.title'
'login.subtitle'
'login.no_account'
'login.register_link'

// Register
'register.title'
'register.subtitle'
'register.name_label'
'register.name_placeholder'
'register.confirm_password_label'
'register.confirm_password_placeholder'
'register.role_label'
'register.role_description'
'register.register_button'
'register.register_button_loading'
'register.already_have_account'
'register.login_link'
'register.terms_acceptance'
'register.terms_link'
'register.privacy_link'
'register.and'

// Roles
'roles.student.name'
'roles.student.description'
'roles.teacher.name'
'roles.teacher.description'
'roles.parent.name'
'roles.parent.description'
'roles.school.name'
'roles.school.description'
'roles.individual.name'
'roles.individual.description'

// Providers
'providers.google'
'providers.facebook'
'providers.github'
'providers.apple'
'providers.microsoft'

// Errores
'errors.invalid_credentials'
'errors.email_not_confirmed'
'errors.user_not_found'
'errors.invalid_email'
'errors.weak_password'
'errors.password_mismatch'
'errors.email_already_registered'
'errors.role_required'
'errors.name_required'
'errors.terms_required'
'errors.oauth_error'

// Mensajes
'messages.login_success'
'messages.register_success'
'messages.logout_success'
'messages.check_email'
'messages.check_email_description'
```

### `navigation` - Navegación

Claves disponibles:

```typescript
'home'
'login'
'register'
'logout'
'profile'
'settings'
'library'
'my_world'
'my_progress'
'about'
'virtual_tour'
```

### `common` - Comunes

Claves disponibles:

```typescript
'save'
'cancel'
'delete'
'edit'
'submit'
'loading'
'search'
'close'
'back'
'next'
'previous'
'confirm'
'yes'
'no'
```

### `errors` - Errores

Claves disponibles:

```typescript
'required_field'
'invalid_format'
'generic_error'
'network_error'
```

---

## Agregar Nuevas Traducciones

### Opción 1: Via SQL

```sql
-- 1. Crear la clave
INSERT INTO app.translation_keys (namespace_slug, key_name, category_id, description, is_system_key)
VALUES ('common', 'welcome_message',
        (SELECT id FROM app.translation_categories WHERE slug = 'ui-components'),
        'Mensaje de bienvenida',
        false);

-- 2. Obtener el ID de la clave
DO $$
DECLARE
    v_key_id UUID;
BEGIN
    SELECT id INTO v_key_id
    FROM app.translation_keys
    WHERE namespace_slug = 'common' AND key_name = 'welcome_message';

    -- 3. Insertar traducciones
    INSERT INTO app.translations (translation_key_id, language_code, value, is_verified) VALUES
        (v_key_id, 'es', 'Bienvenido a la plataforma', true),
        (v_key_id, 'en', 'Welcome to the platform', true),
        (v_key_id, 'fr', 'Bienvenue sur la plateforme', true);
END $$;
```

### Opción 2: Via Función Helper (más fácil)

Crea una función helper en tu proyecto:

```sql
CREATE OR REPLACE FUNCTION add_translation(
    p_namespace VARCHAR,
    p_key VARCHAR,
    p_es TEXT,
    p_en TEXT,
    p_fr TEXT
) RETURNS VOID AS $$
DECLARE
    v_key_id UUID;
BEGIN
    -- Insertar/actualizar clave
    INSERT INTO app.translation_keys (namespace_slug, key_name, is_system_key)
    VALUES (p_namespace, p_key, false)
    ON CONFLICT (namespace_slug, key_name) DO NOTHING
    RETURNING id INTO v_key_id;

    -- Si ya existía, obtener el ID
    IF v_key_id IS NULL THEN
        SELECT id INTO v_key_id
        FROM app.translation_keys
        WHERE namespace_slug = p_namespace AND key_name = p_key;
    END IF;

    -- Insertar traducciones
    INSERT INTO app.translations (translation_key_id, language_code, value)
    VALUES (v_key_id, 'es', p_es)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

    INSERT INTO app.translations (translation_key_id, language_code, value)
    VALUES (v_key_id, 'en', p_en)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

    INSERT INTO app.translations (translation_key_id, language_code, value)
    VALUES (v_key_id, 'fr', p_fr)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;
END;
$$ LANGUAGE plpgsql;

-- Usar la función
SELECT add_translation('common', 'welcome_message',
    'Bienvenido a la plataforma',
    'Welcome to the platform',
    'Bienvenue sur la plateforme'
);
```

### Opción 3: Via Admin Panel (TODO)

En el futuro, se creará un panel de administración para gestionar traducciones desde la UI.

---

## Fallback a Messages

El sistema usa **next-intl messages** como **fallback** cuando Supabase no responde o falla.

### request.ts

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing.config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // ⚠️ Fallback cuando Supabase no responde
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
```

### Cuándo usar Messages vs Supabase

| Característica | Messages (next-intl) | Supabase |
|---------------|---------------------|----------|
| **Velocidad** | ⚡ Muy rápido (build time) | 🐢 Network request |
| **Caché** | ✅ Automático (bundled) | ✅ Manual (en memoria) |
| **Actualización** | ❌ Requiere rebuild | ✅ Tiempo real |
| **Gestión** | ❌ Solo desarrolladores | ✅ Panel admin |
| **Fallback** | ✅ Siempre disponible | ⚠️ Depende de red |

**Recomendación:**
- Usa **Supabase** para traducciones que cambian frecuentemente (contenido dinámico, textos de usuario)
- Usa **Messages** como fallback y para contenido estático que no cambia

---

## Ejemplo Completo

### Página de Login

```tsx
'use client';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks';
import { useTranslations } from 'next-intl'; // Fallback

export default function LoginPage() {
  const { t: tAuth, loading } = useSupabaseTranslations('auth');
  const { t: tNav } = useSupabaseTranslations('navigation');
  const tFallback = useTranslations('auth'); // Fallback

  // Mientras carga, usar fallback
  const t = loading ? tFallback : tAuth;

  return (
    <div>
      <h1>{t('login.title')}</h1>
      <p>{t('login.subtitle')}</p>

      <form>
        <label>{t('form.email_label')}</label>
        <input placeholder={t('form.email_placeholder')} />

        <label>{t('form.password_label')}</label>
        <input
          type="password"
          placeholder={t('form.password_placeholder')}
        />

        <button>{t('form.login_button')}</button>
      </form>

      <nav>
        <a href="/">{tNav('home')}</a>
        <a href="/register">{tNav('register')}</a>
      </nav>
    </div>
  );
}
```

---

## Scripts de Utilidad

### Ver todas las traducciones de un namespace

```sql
SELECT
    tk.key_name,
    t.language_code,
    t.value
FROM app.translation_keys tk
JOIN app.translations t ON tk.id = t.translation_key_id
WHERE tk.namespace_slug = 'auth'
ORDER BY tk.key_name, t.language_code;
```

### Buscar traducciones por texto

```sql
SELECT
    tk.namespace_slug,
    tk.key_name,
    t.language_code,
    t.value
FROM app.translation_keys tk
JOIN app.translations t ON tk.id = t.translation_key_id
WHERE t.value ILIKE '%bienvenido%'
ORDER BY tk.namespace_slug, tk.key_name;
```

### Encontrar traducciones faltantes

```sql
-- Claves que no tienen traducción en todos los idiomas
SELECT
    tk.namespace_slug,
    tk.key_name,
    COUNT(DISTINCT t.language_code) as idiomas_traducidos
FROM app.translation_keys tk
LEFT JOIN app.translations t ON tk.id = t.translation_key_id
GROUP BY tk.id, tk.namespace_slug, tk.key_name
HAVING COUNT(DISTINCT t.language_code) < (SELECT COUNT(*) FROM app.languages WHERE is_active = true)
ORDER BY tk.namespace_slug, tk.key_name;
```

### Actualizar una traducción

```sql
UPDATE app.translations
SET value = 'Nuevo valor',
    is_verified = true,
    updated_at = NOW()
WHERE translation_key_id = (
    SELECT id FROM app.translation_keys
    WHERE namespace_slug = 'auth' AND key_name = 'login.title'
)
AND language_code = 'es';
```

---

## Próximos Pasos

1. ✅ Sistema de traducciones configurado
2. ✅ Claves básicas insertadas (auth, navigation, common, errors)
3. ⬜ Crear panel de administración para gestionar traducciones
4. ⬜ Implementar sincronización con Crowdin/Lokalise
5. ⬜ Agregar traducciones para más idiomas (pt, de, it, etc.)
6. ⬜ Implementar versionado de traducciones
7. ⬜ Agregar traducciones para todo el contenido educativo

---

## Recursos

- [Hook useSupabaseTranslations](/src/presentation/features/translations/hooks/useSupabaseTranslations.ts)
- [Schema SQL](/supabase/schemas/app/14_SISTEMA_TRADUCCIONES_COMPLETO.sql)
- [Inserts SQL](/supabase/schemas/auth/01_INSERTS_TRADUCCIONES_COMPLETAS.sql)
- [Next-Intl Docs](https://next-intl-docs.vercel.app/)

---

**Última actualización:** 2026-01-22
