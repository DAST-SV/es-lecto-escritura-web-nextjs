# 🚀 Configuración del Sistema de Autenticación - ES Lecto Escritura

Esta guía te ayudará a configurar completamente el sistema de autenticación con roles, organizaciones y OAuth providers.

## 📋 Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Configuración Rápida](#configuración-rápida)
3. [Configuración Detallada](#configuración-detallada)
4. [OAuth Providers](#oauth-providers)
5. [Roles y Permisos](#roles-y-permisos)
6. [Verificación](#verificación)
7. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos

- Node.js 18+
- Una cuenta de [Supabase](https://supabase.com)
- Git

---

## Configuración Rápida

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd es-lecto-escritura-web-nextjs
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[TU-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[TU-ANON-KEY]
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=[TU-SERVICE-ROLE-KEY]

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **⚠️ Importante:** Obtén estas credenciales desde tu proyecto Supabase:
> - Ve a **Settings** > **API**
> - Copia el **Project URL** y las **API Keys**

### 4. Configurar Base de Datos en Supabase

1. Ve a tu proyecto Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido de: `supabase/schemas/app/01_app.sql`
4. Haz clic en **RUN**
5. Espera que se complete (verás "Setup completado exitosamente")

### 5. Configurar OAuth Providers (Opcional)

Sigue la guía detallada en: [`supabase/OAUTH_SETUP.md`](./supabase/OAUTH_SETUP.md)

Providers disponibles:
- ✅ Google
- ✅ Facebook
- ✅ GitHub
- ✅ Apple
- ✅ Microsoft (Azure)

### 6. Iniciar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Configuración Detallada

### Estructura del Sistema de Autenticación

El sistema está construido con **Clean Architecture** y soporta:

1. **Autenticación manual** (Email + Password)
2. **OAuth Providers** (Google, Facebook, GitHub, Apple, Microsoft)
3. **Sistema de Roles** (Super Admin, School, Teacher, Parent, Student, Individual)
4. **Organizaciones** (Escuelas, Familias, Grupos, Bibliotecas)
5. **Relaciones entre usuarios** (Padre-Hijo, Maestro-Estudiante, etc.)

### Roles Disponibles

| Rol | Descripción | Nivel de Jerarquía |
|-----|-------------|-------------------|
| `super_admin` | Administrador de la plataforma | 100 |
| `school` | Administrador de escuela | 80 |
| `teacher` | Maestro/Docente | 50 |
| `parent` | Padre/Madre/Tutor | 30 |
| `student` | Estudiante | 10 |
| `individual` | Usuario individual | 10 |

### Tipos de Organizaciones

| Tipo | Descripción |
|------|-------------|
| `school` | Escuela/Colegio/Universidad |
| `family` | Familia o hogar |
| `group` | Grupo de estudio |
| `library` | Biblioteca |
| `individual` | Usuario individual (sin organización) |

### Flujo de Registro

1. **Usuario selecciona rol** → Estudiante, Maestro, Padre, Escuela, Individual
2. **Usuario completa formulario** → Nombre, Email, Contraseña
3. **Sistema crea cuenta** → Supabase Auth
4. **Trigger automático** → Crea perfil en `app.user_profiles`
5. **Asigna rol** → Inserta en `app.user_roles`
6. **Envía email de confirmación** → Usuario debe confirmar email

### Flujo de Login

1. **Email + Password** o **OAuth Provider**
2. **Supabase Auth valida credenciales**
3. **Sistema verifica roles y permisos**
4. **Redirecciona a `/library`** (o ruta especificada)

---

## OAuth Providers

### Configuración General

Todos los OAuth providers requieren:
1. Crear una aplicación en el proveedor
2. Obtener **Client ID** y **Client Secret**
3. Configurar **Redirect URIs**
4. Habilitar en Supabase Dashboard

### Redirect URI de Supabase

```
https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
```

### Guía Completa

Ver: [`supabase/OAUTH_SETUP.md`](./supabase/OAUTH_SETUP.md)

---

## Roles y Permisos

### Asignar Rol Manualmente

```sql
-- Asignar rol de maestro a un usuario
INSERT INTO app.user_roles (user_id, role_id, is_active)
SELECT
  '[USER_ID]'::uuid,
  id,
  true
FROM app.roles
WHERE name = 'teacher';
```

### Verificar roles de un usuario

```sql
SELECT
  u.email,
  r.name as role,
  r.display_name,
  ur.is_active,
  ur.assigned_at
FROM app.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
JOIN app.roles r ON ur.role_id = r.id
WHERE u.email = 'usuario@ejemplo.com';
```

### Crear Super Admin

```sql
-- Reemplaza con el email del super admin
INSERT INTO app.user_roles (user_id, role_id, is_active)
SELECT
  u.id,
  r.id,
  true
FROM auth.users u
CROSS JOIN app.roles r
WHERE u.email = 'admin@tudominio.com'
  AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id, organization_id) DO UPDATE
SET is_active = true;
```

---

## Verificación

### 1. Verificar instalación de SQL

```sql
-- Ver tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'app'
ORDER BY table_name;

-- Ver roles disponibles
SELECT name, display_name, hierarchy_level
FROM app.roles
ORDER BY hierarchy_level DESC;

-- Ver funciones creadas
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'app'
ORDER BY routine_name;
```

### 2. Probar registro

1. Ve a `http://localhost:3000/auth/register`
2. Selecciona un rol
3. Completa el formulario
4. Verifica que llegue el email de confirmación
5. Confirma el email
6. Inicia sesión

### 3. Probar login

1. Ve a `http://localhost:3000/auth/login`
2. Ingresa email y contraseña
3. Deberías ser redirigido a `/library`

### 4. Probar OAuth (si configurado)

1. Ve a `http://localhost:3000/auth/login`
2. Haz clic en un botón de OAuth (Google, Facebook, etc.)
3. Autoriza en el proveedor
4. Deberías volver autenticado

### 5. Verificar perfil creado

```sql
-- Ver perfil creado
SELECT
  up.display_name,
  up.full_name,
  up.oauth_provider,
  up.created_at,
  u.email
FROM app.user_profiles up
JOIN auth.users u ON up.user_id = u.id
ORDER BY up.created_at DESC
LIMIT 10;
```

---

## Solución de Problemas

### ❌ Error: "relation app.roles does not exist"

**Causa:** No ejecutaste el script SQL de setup.

**Solución:**
1. Ve a Supabase SQL Editor
2. Ejecuta: `supabase/schemas/app/01_app.sql`
3. Verifica que se complete sin errores

### ❌ Error: "User already registered"

**Causa:** Ya existe un usuario con ese email.

**Solución:**
1. Usa otro email, o
2. Elimina el usuario existente desde Supabase Dashboard > Authentication > Users

### ❌ Error: "Redirect URI mismatch" (OAuth)

**Causa:** La URI de redirección no coincide.

**Solución:**
1. Verifica que agregaste exactamente:
   ```
   https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
   ```
2. Espera 5-10 minutos después de guardar cambios en el proveedor OAuth

### ❌ Error: "Invalid credentials"

**Causa:** Email o contraseña incorrectos, o email no confirmado.

**Solución:**
1. Verifica el email y contraseña
2. Revisa si confirmaste el email
3. Revisa la bandeja de spam

### ❌ No se crea el perfil automáticamente

**Causa:** El trigger no está funcionando.

**Solución:**
1. Verifica que el trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Si no existe, ejecuta nuevamente el script de setup

### ❌ OAuth providers no aparecen

**Causa:** Providers no habilitados en Supabase.

**Solución:**
1. Ve a Supabase Dashboard > Authentication > Providers
2. Habilita cada provider y configura Client ID/Secret
3. Guarda cambios

---

## Arquitectura del Código

### Estructura de Carpetas

```
src/
├── core/
│   ├── domain/              # Entidades y tipos
│   │   ├── types/
│   │   └── repositories/
│   └── application/         # Casos de uso
│       └── use-cases/
│           └── auth/
│               ├── Login.ts
│               ├── Signup.ts
│               └── LoginWithProvider.ts
├── infrastructure/
│   ├── config/              # Configuración Supabase
│   └── repositories/        # Implementaciones
│       └── auth/
│           └── SupabaseAuthRepository.ts
└── presentation/
    ├── actions/             # Server Actions
    │   └── auth.actions.ts
    └── features/
        └── auth/
            ├── components/  # Componentes UI
            └── hooks/       # Hooks personalizados
```

### Flujo de Datos

```
[UI Component]
    ↓
[Server Action (auth.actions.ts)]
    ↓
[Use Case (Login.ts)]
    ↓
[Repository (SupabaseAuthRepository.ts)]
    ↓
[Supabase Auth API]
    ↓
[Database Triggers]
    ↓
[app.user_profiles, app.user_roles]
```

---

## Scripts Útiles

### Limpiar todos los usuarios (CUIDADO)

```sql
-- ⚠️ Esto borra TODOS los usuarios y sus datos
DELETE FROM app.user_relationships;
DELETE FROM app.organization_members;
DELETE FROM app.user_roles;
DELETE FROM app.user_profiles;
-- Luego elimina desde Supabase Dashboard > Authentication > Users
```

### Ver usuarios recientes

```sql
SELECT
  u.email,
  up.display_name,
  up.created_at,
  up.oauth_provider,
  (
    SELECT string_agg(r.name::text, ', ')
    FROM app.user_roles ur
    JOIN app.roles r ON ur.role_id = r.id
    WHERE ur.user_id = u.id AND ur.is_active = true
  ) as roles
FROM auth.users u
LEFT JOIN app.user_profiles up ON u.id = up.user_id
ORDER BY u.created_at DESC
LIMIT 20;
```

### Actualizar rol de un usuario

```sql
UPDATE app.user_roles
SET is_active = false
WHERE user_id = '[USER_ID]';

INSERT INTO app.user_roles (user_id, role_id, is_active)
SELECT
  '[USER_ID]'::uuid,
  id,
  true
FROM app.roles
WHERE name = 'teacher';
```

---

## Siguientes Pasos

1. ✅ Configurar OAuth providers
2. ✅ Crear tu primer super admin
3. ✅ Probar el flujo de registro y login
4. ⬜ Implementar recuperación de contraseña
5. ⬜ Implementar cambio de contraseña
6. ⬜ Implementar actualización de perfil
7. ⬜ Implementar gestión de organizaciones
8. ⬜ Implementar invitaciones a organizaciones
9. ⬜ Implementar relaciones entre usuarios

---

## Recursos

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next-Intl](https://next-intl-docs.vercel.app/)
- [Framer Motion](https://www.framer.com/motion/)

---

## Soporte

Si tienes problemas:
1. Revisa esta guía completa
2. Revisa la guía de OAuth: `supabase/OAUTH_SETUP.md`
3. Revisa los logs de Supabase: Dashboard > Authentication > Logs
4. Revisa la consola del navegador (F12)

---

**Última actualización:** 2026-01-22
