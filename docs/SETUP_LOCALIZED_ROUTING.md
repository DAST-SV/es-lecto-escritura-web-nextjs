# 🚀 Guía de Configuración - Sistema de Rutas Traducidas

## 📋 Descripción

Esta guía te ayudará a configurar el sistema de rutas traducidas con verificación de permisos en tu base de datos Supabase.

---

## ✅ Prerequisitos

- Acceso a tu proyecto de Supabase
- Esquema `app` ya creado (con las tablas `routes` y `route_translations`)
- Función `can_access_route()` ya implementada

---

## 🔧 Paso 0: Arreglar Constraint (PRIMERO - MUY IMPORTANTE)

### ⚠️ Este paso es OBLIGATORIO antes de insertar rutas

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de:
   ```
   supabase/migrations/00_FIX_ROUTES_CONSTRAINT.sql
   ```
5. Haz click en **Run**

**Por qué es necesario:**
- El constraint actual de `app.routes` no permite corchetes `[]`
- Las rutas dinámicas como `/books/[id]/edit` necesitan corchetes
- Este script actualiza el constraint para permitirlos

**Resultado esperado:**
```
✅ Constraint actualizado
✅ Test 1 pasado: Ruta simple
✅ Test 2 pasado: Ruta con [id]
✅ TODOS LOS TESTS PASARON
```

---

## 🔧 Paso 1: Ejecutar Script de Inserción

### Opción A: Desde el Dashboard de Supabase

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de:
   ```
   supabase/migrations/INSERT_ROUTE_KEYS_SYSTEM.sql
   ```
5. Haz click en **Run**

### Opción B: Desde la CLI de Supabase

```bash
# Si tienes Supabase CLI instalada
cd /home/user/es-lecto-escritura-web-nextjs
supabase db execute -f supabase/migrations/INSERT_ROUTE_KEYS_SYSTEM.sql
```

### Opción C: Desde tu cliente SQL favorito

```bash
# Conectarte a tu base de datos y ejecutar el script
psql "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]" -f supabase/migrations/INSERT_ROUTE_KEYS_SYSTEM.sql
```

---

## 🔍 Paso 2: Verificar la Instalación

Ejecuta el script de verificación para asegurarte de que todo se insertó correctamente:

1. Abre **SQL Editor** en Supabase Dashboard
2. Copia y pega el contenido de:
   ```
   supabase/migrations/VERIFY_ROUTE_KEYS_SYSTEM.sql
   ```
3. Haz click en **Run**

### Resultados Esperados

Deberías ver:

```
✅ RUTAS ACTIVAS
Total: 33 rutas

🌐 TRADUCCIONES POR IDIOMA
ES: 33 traducciones
EN: 33 traducciones
FR: 33 traducciones
IT: 33 traducciones

⚠️ RUTAS SIN TRADUCCIONES
(debe estar vacío)

✅ VERIFICACIÓN DE INTEGRIDAD
Rutas esperadas: 33
Rutas encontradas: 33
Rutas sin 4 traducciones: 0
✅ Todas las rutas están insertadas
✅ Todas las rutas tienen traducciones completas
```

---

## 🎯 Paso 3: Configurar Permisos (IMPORTANTE)

Las rutas están insertadas, pero **NECESITAS ASIGNAR PERMISOS** para que los usuarios puedan acceder.

### Script de Permisos Básicos

```sql
-- ========================================
-- PERMISOS BÁSICOS PARA EMPEZAR
-- ========================================

-- 1. SUPER_ADMIN tiene acceso a TODO
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'super_admin',
  r.id,
  NULL, -- NULL = todos los idiomas
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

-- 2. ADMIN tiene acceso a todo excepto algunas rutas críticas
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'admin',
  r.id,
  NULL,
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
  AND r.pathname NOT IN ('/admin/route-scanner', '/admin/user-roles')
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

-- 3. TEACHER tiene acceso a libros y navegación
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'teacher',
  r.id,
  NULL,
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
  AND (
    r.pathname LIKE '/books%'
    OR r.pathname IN ('/library', '/my-world', '/my-progress', '/organizations')
  )
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

-- 4. STUDENT tiene acceso limitado
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'student',
  r.id,
  NULL,
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
  AND r.pathname IN (
    '/library',
    '/my-world',
    '/my-progress',
    '/books',
    '/books/[id]/read',
    '/books/[id]/statistics'
  )
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

-- 5. GUEST tiene acceso mínimo
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'guest',
  r.id,
  NULL,
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
  AND r.pathname IN ('/library', '/books', '/books/[id]/read')
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

-- Verificar permisos insertados
SELECT
  role_name as "Rol",
  COUNT(*) as "Rutas con Acceso"
FROM app.route_permissions
WHERE is_active = TRUE
GROUP BY role_name
ORDER BY role_name;
```

**Ejecuta este script en Supabase SQL Editor** para configurar permisos básicos.

---

## 🎨 Paso 4: Usar en tu Aplicación

Ahora ya puedes usar el sistema en tus componentes React:

### Ejemplo 1: Link Simple

```tsx
import { LocalizedLink } from '@/src/presentation/routing';

export function MyComponent() {
  return (
    <LocalizedLink routeKey="admin.users">
      Admin Usuarios
    </LocalizedLink>
  );
}
```

### Ejemplo 2: Link con Permisos

```tsx
import { LocalizedLink } from '@/src/presentation/routing';

export function SecureLink() {
  return (
    <LocalizedLink
      routeKey="admin.users"
      checkAccess
      fallbackComponent={null}
    >
      Admin Usuarios
    </LocalizedLink>
  );
}
```

### Ejemplo 3: Menú de Navegación

```tsx
import { NavLink } from '@/src/presentation/routing';
import { usePathname } from 'next/navigation';

export function AdminMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4">
      <NavLink
        routeKey="admin.users"
        active={pathname.includes('/usuarios')}
        activeClassName="bg-blue-600 text-white px-4 py-2"
        inactiveClassName="text-gray-700 px-4 py-2"
      >
        Usuarios
      </NavLink>

      <NavLink
        routeKey="admin.roles"
        active={pathname.includes('/roles')}
        activeClassName="bg-blue-600 text-white px-4 py-2"
        inactiveClassName="text-gray-700 px-4 py-2"
      >
        Roles
      </NavLink>
    </nav>
  );
}
```

---

## 📊 Verificación Final

Para verificar que todo funciona:

1. **Inicia tu aplicación:**
   ```bash
   npm run dev
   ```

2. **Abre el navegador en diferentes idiomas:**
   - Español: `http://localhost:3000/es`
   - Inglés: `http://localhost:3000/en`
   - Francés: `http://localhost:3000/fr`
   - Italiano: `http://localhost:3000/it`

3. **Prueba navegar:**
   - `/es/admin/usuarios` → Debe funcionar
   - `/en/admin/users` → Debe funcionar
   - `/fr/admin/utilisateurs` → Debe funcionar

4. **Prueba con diferentes roles:**
   - Inicia sesión como `super_admin` → Debe ver todos los enlaces
   - Inicia sesión como `student` → Solo debe ver enlaces permitidos

---

## 🐛 Troubleshooting

### Problema: "Error: Route not found"

**Causa:** La ruta no está en la base de datos

**Solución:**
```sql
-- Verificar si la ruta existe
SELECT * FROM app.routes WHERE pathname = '/tu/ruta';

-- Si no existe, insertarla manualmente
SELECT insert_route_with_translations(
  '/tu/ruta',
  'Nombre de la Ruta',
  FALSE, -- is_public
  TRUE,  -- show_in_menu
  '/tu-ruta', '/your-route', '/ta-route', '/tua-rotta',
  'Nombre ES', 'Name EN', 'Nom FR', 'Nome IT'
);
```

### Problema: "El enlace no se muestra"

**Causa:** El usuario no tiene permisos

**Solución:**
```sql
-- Verificar permisos del usuario
SELECT
  r.pathname,
  rp.role_name,
  rp.language_code
FROM app.route_permissions rp
JOIN app.routes r ON r.id = rp.route_id
JOIN app.user_roles ur ON ur.role_name = rp.role_name
WHERE ur.user_id = 'USER_ID_AQUI'
  AND rp.is_active = TRUE;

-- Si falta el permiso, agregarlo:
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT 'NOMBRE_ROL', r.id, NULL, TRUE
FROM app.routes r
WHERE r.pathname = '/tu/ruta';
```

### Problema: "Traducción incorrecta"

**Causa:** Traducción mal configurada en BD

**Solución:**
```sql
-- Ver traducciones actuales
SELECT
  r.pathname,
  rt.language_code,
  rt.translated_path
FROM app.routes r
JOIN app.route_translations rt ON rt.route_id = r.id
WHERE r.pathname = '/tu/ruta';

-- Actualizar traducción
UPDATE app.route_translations
SET translated_path = '/nueva-traduccion'
WHERE route_id = (SELECT id FROM app.routes WHERE pathname = '/tu/ruta')
  AND language_code = 'es';
```

---

## 🔄 Agregar Nuevas Rutas

Cuando necesites agregar una nueva ruta:

### 1. Agregar a `route-keys.config.ts`

```typescript
export const ROUTE_KEYS = {
  // ... rutas existentes
  'mi.nueva.ruta': '/mi/nueva/ruta',
}
```

### 2. Crear página en Next.js

```typescript
// app/[locale]/mi/nueva/ruta/page.tsx
export default function MiNuevaRutaPage() {
  return <div>Mi Nueva Ruta</div>;
}
```

### 3. Insertar en base de datos

```sql
SELECT insert_route_with_translations(
  '/mi/nueva/ruta',
  'Mi Nueva Ruta',
  FALSE, -- is_public
  TRUE,  -- show_in_menu
  '/mi-nueva-ruta',       -- ES
  '/my-new-route',        -- EN
  '/ma-nouvelle-route',   -- FR
  '/mia-nuova-rotta',     -- IT
  'Mi Nueva Ruta',        -- Nombre ES
  'My New Route',         -- Nombre EN
  'Ma Nouvelle Route',    -- Nombre FR
  'Mia Nuova Rotta'       -- Nombre IT
);
```

### 4. Asignar permisos

```sql
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT 'admin', r.id, NULL, TRUE
FROM app.routes r
WHERE r.pathname = '/mi/nueva/ruta';
```

### 5. Usar en componentes

```tsx
<LocalizedLink routeKey="mi.nueva.ruta" checkAccess>
  Mi Nueva Ruta
</LocalizedLink>
```

---

## 📚 Recursos Adicionales

- **Documentación completa:** `docs/LOCALIZED_ROUTING_SYSTEM.md`
- **Ejemplos de uso:** `src/presentation/components/LocalizedLink.examples.tsx`
- **Configuración de rutas:** `src/infrastructure/config/route-keys.config.ts`

---

## ✅ Checklist de Instalación

- [ ] **PASO 0:** Ejecutar `00_FIX_ROUTES_CONSTRAINT.sql` (PRIMERO)
- [ ] Verificar que los tests del constraint pasaron
- [ ] **PASO 1:** Ejecutar `INSERT_ROUTE_KEYS_SYSTEM.sql`
- [ ] **PASO 2:** Ejecutar `VERIFY_ROUTE_KEYS_SYSTEM.sql`
- [ ] Verificar que hay 33 rutas insertadas
- [ ] Verificar que hay 132 traducciones (33 rutas x 4 idiomas)
- [ ] **PASO 3:** Configurar permisos básicos para cada rol
- [ ] Probar navegación en diferentes idiomas
- [ ] Probar con diferentes roles de usuario
- [ ] Limpiar cache del navegador si es necesario

---

**¡Ya estás listo para usar el sistema de rutas traducidas!** 🎉

Si tienes algún problema, revisa la sección de Troubleshooting o consulta la documentación completa.
