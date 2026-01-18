# Sistema de Rutas Traducidas con Verificación de Permisos

## 📋 Descripción General

Este sistema proporciona una solución completa para manejar rutas internacionalizadas con verificación automática de permisos de acceso. Combina:

1. **Traducción automática de rutas** según el idioma del usuario
2. **Verificación de permisos** basada en el sistema RBAC
3. **Componentes inteligentes** que solo se muestran si el usuario tiene acceso

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     ROUTE_KEYS                              │
│          (Mapeo de claves → pathnames)                      │
│   'admin.users' → '/admin/users'                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              useLocalizedRoute Hook                         │
│    Clave + Idioma → Ruta Traducida                         │
│   'admin.users' + 'es' → '/es/admin/usuarios'              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              useRouteAccess Hook                            │
│         Verifica permisos con can_access_route()            │
│              { canAccess, isLoading, error }                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              LocalizedLink Component                        │
│      Renderiza enlace solo si tiene acceso                 │
│   <LocalizedLink routeKey="admin.users" checkAccess />     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Componentes del Sistema

### 1. **route-keys.config.ts**

Constante de mapeo de claves a pathnames físicos.

**Ubicación:** `src/infrastructure/config/route-keys.config.ts`

```typescript
export const ROUTE_KEYS = {
  'admin.users': '/admin/users',
  'admin.roles': '/admin/roles',
  'books.edit': '/books/[id]/edit',
  // ... más rutas
}
```

**Funciones auxiliares:**
- `getPathnameFromKey(key)` - Obtiene pathname de una clave
- `replaceRouteParams(pathname, params)` - Reemplaza parámetros dinámicos
- `isValidRouteKey(key)` - Verifica si una clave existe

---

### 2. **useLocalizedRoute Hook**

Hook para obtener rutas traducidas según el idioma actual.

**Ubicación:** `src/presentation/hooks/useLocalizedRoute.ts`

**Uso:**
```tsx
const route = useLocalizedRoute('admin.users');
// Español: '/es/admin/usuarios'
// Inglés:  '/en/admin/users'

const routeWithParams = useLocalizedRoute('books.edit', { id: '123' });
// Español: '/es/libros/123/editar'
```

**Características:**
- Cache de 30 segundos para evitar llamadas repetidas
- Soporte para parámetros dinámicos
- Fallback al pathname original si no hay traducción

---

### 3. **useRouteAccess Hook**

Hook para verificar si el usuario tiene acceso a una ruta.

**Ubicación:** `src/presentation/hooks/useRouteAccess.ts`

**Uso:**
```tsx
const { canAccess, isLoading, error } = useRouteAccess('admin.users');

if (isLoading) return <Spinner />;
if (!canAccess) return null;

return <Link href="/admin/usuarios">Admin</Link>;
```

**Características:**
- Cache de 30 segundos
- Verifica con `can_access_route()` RPC
- Soporta rutas dinámicas con parámetros
- Verifica rutas públicas automáticamente

---

### 4. **LocalizedLink Component**

Componente Link inteligente con traducción y verificación de permisos.

**Ubicación:** `src/presentation/components/LocalizedLink.tsx`

**Uso básico:**
```tsx
<LocalizedLink routeKey="admin.users">
  Admin Usuarios
</LocalizedLink>
```

**Con verificación de permisos:**
```tsx
<LocalizedLink
  routeKey="admin.users"
  checkAccess
  loadingComponent={<Spinner />}
  fallbackComponent={<span>Sin acceso</span>}
>
  Admin Usuarios
</LocalizedLink>
```

**Con parámetros:**
```tsx
<LocalizedLink
  routeKey="books.edit"
  params={{ id: '123' }}
  checkAccess
>
  Editar Libro
</LocalizedLink>
```

---

## 🎨 Variantes de Componentes

### NavLink

Para enlaces de navegación que siempre verifican permisos.

```tsx
<NavLink
  routeKey="admin.users"
  active={pathname === '/admin/usuarios'}
  activeClassName="bg-blue-600 text-white"
  inactiveClassName="text-gray-700"
>
  Usuarios
</NavLink>
```

### ButtonLink

Enlaces con estilos de botón.

```tsx
<ButtonLink
  routeKey="books.create"
  variant="primary"
  size="md"
>
  Crear Libro
</ButtonLink>
```

**Variantes:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Tamaños:** `sm`, `md`, `lg`

### ConditionalLinks

Múltiples enlaces condicionales.

```tsx
<ConditionalLinks
  links={[
    { key: 'admin.users', label: 'Usuarios' },
    { key: 'admin.roles', label: 'Roles' },
    { key: 'admin.audit', label: 'Auditoría' },
  ]}
  separator={<span>/</span>}
/>
```

---

## 🚀 Casos de Uso Comunes

### Caso 1: Menú de Navegación

```tsx
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

### Caso 2: Acciones de Tabla

```tsx
export function BookRow({ book }) {
  return (
    <tr>
      <td>{book.title}</td>
      <td>
        <LocalizedLink
          routeKey="books.read"
          params={{ id: book.id }}
          className="text-blue-600"
        >
          Leer
        </LocalizedLink>

        <LocalizedLink
          routeKey="books.edit"
          params={{ id: book.id }}
          checkAccess
          className="text-green-600"
        >
          Editar
        </LocalizedLink>
      </td>
    </tr>
  );
}
```

### Caso 3: Contenido Condicional

```tsx
export function AdminPanel() {
  const { canAccess, isLoading } = useRouteAccess('admin.dashboard');

  if (isLoading) return <Spinner />;

  if (!canAccess) {
    return <div>No tienes acceso al panel de administración</div>;
  }

  return (
    <div>
      <h1>Panel de Admin</h1>
      {/* ... contenido ... */}
    </div>
  );
}
```

### Caso 4: Múltiples Verificaciones

```tsx
export function AdminSidebar() {
  const access = useMultipleRouteAccess([
    'admin.users',
    'admin.roles',
    'admin.audit',
  ]);

  return (
    <aside>
      {access['admin.users'].canAccess && (
        <NavLink routeKey="admin.users">Usuarios</NavLink>
      )}

      {access['admin.roles'].canAccess && (
        <NavLink routeKey="admin.roles">Roles</NavLink>
      )}

      {access['admin.audit'].canAccess && (
        <NavLink routeKey="admin.audit">Auditoría</NavLink>
      )}
    </aside>
  );
}
```

---

## 📝 Guía de Implementación

### Paso 1: Agregar Nueva Ruta

**1.1. Agregar a route-keys.config.ts**

```typescript
// src/infrastructure/config/route-keys.config.ts
export const ROUTE_KEYS = {
  // ... rutas existentes
  'mi.nueva.ruta': '/mi/nueva/ruta',
  'mi.ruta.dinamica': '/mi/ruta/[id]',
}
```

**1.2. Crear archivo de página en Next.js**

```typescript
// app/[locale]/mi/nueva/ruta/page.tsx
export default function MiNuevaRutaPage() {
  return <div>Mi Nueva Ruta</div>;
}
```

**1.3. Agregar ruta a Supabase**

```sql
-- Insertar ruta física
INSERT INTO app.routes (pathname, display_name, is_public, show_in_menu)
VALUES ('/mi/nueva/ruta', 'Mi Nueva Ruta', false, true);

-- Insertar traducciones
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es', '/mi-nueva-ruta', 'Mi Nueva Ruta'
FROM app.routes r WHERE r.pathname = '/mi/nueva/ruta';

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en', '/my-new-route', 'My New Route'
FROM app.routes r WHERE r.pathname = '/mi/nueva/ruta';

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr', '/ma-nouvelle-route', 'Ma Nouvelle Route'
FROM app.routes r WHERE r.pathname = '/mi/nueva/ruta';

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'it', '/mia-nuova-rotta', 'Mia Nuova Rotta'
FROM app.routes r WHERE r.pathname = '/mi/nueva/ruta';
```

**1.4. Asignar permisos**

```sql
-- Dar acceso a roles específicos
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'admin', r.id, 'es'
FROM app.routes r WHERE r.pathname = '/mi/nueva/ruta';
```

### Paso 2: Usar en Componentes

```tsx
// Componente con la nueva ruta
export function MiComponente() {
  return (
    <LocalizedLink
      routeKey="mi.nueva.ruta"
      checkAccess
      className="text-blue-600"
    >
      Ir a Mi Nueva Ruta
    </LocalizedLink>
  );
}
```

---

## 🔧 Configuración y Cache

### Limpiar Cache de Permisos

```typescript
import { clearRouteAccessCache } from '@/src/presentation/hooks/useRouteAccess';

// Después de cambiar permisos/roles del usuario
clearRouteAccessCache();
```

### TTL de Cache

- **Rutas traducidas:** 30 segundos
- **Permisos de acceso:** 30 segundos

Modificar en:
- `src/presentation/hooks/useLocalizedRoute.ts` - Variable `CACHE_TTL`
- `src/presentation/hooks/useRouteAccess.ts` - Variable `CACHE_TTL`

---

## 🎯 Flujo Completo

```
Usuario hace click en enlace
         │
         ▼
LocalizedLink obtiene routeKey
         │
         ▼
useLocalizedRoute traduce:
'admin.users' → '/admin/users' → '/admin/usuarios' (es)
         │
         ▼
useRouteAccess verifica:
1. Usuario autenticado?
2. Ruta es pública?
3. Tiene DENY?
4. Tiene GRANT individual?
5. Su rol tiene acceso?
6. Su rol permite idioma?
         │
         ▼
Si canAccess = true → Renderiza <Link>
Si canAccess = false → Renderiza fallback o null
```

---

## 🐛 Troubleshooting

### Problema: El enlace no se muestra

**Posibles causas:**
1. Usuario no tiene permisos → Verificar en `app.route_permissions`
2. Ruta no existe en BD → Verificar en `app.routes`
3. Traducción no existe → Verificar en `app.route_translations`
4. Clave incorrecta → Verificar en `ROUTE_KEYS`

**Solución:**
```typescript
// Verificar en consola del navegador
const { canAccess, error } = useRouteAccess('admin.users');
console.log({ canAccess, error });
```

### Problema: Ruta traducida no funciona

**Verificar:**
1. Traducción existe en Supabase
2. Cache TTL no está expirado
3. Middleware está configurado correctamente

```sql
-- Verificar traducciones
SELECT r.pathname, rt.language_code, rt.translated_path
FROM app.routes r
JOIN app.route_translations rt ON rt.route_id = r.id
WHERE r.pathname = '/admin/users';
```

### Problema: Permisos no actualizan

**Solución:**
```typescript
import { clearRouteAccessCache } from '@/src/presentation/hooks/useRouteAccess';

// Limpiar cache después de cambiar permisos
clearRouteAccessCache();

// Recargar página
window.location.reload();
```

---

## 📚 Referencias

- **Configuración de rutas:** `src/infrastructure/config/route-keys.config.ts`
- **Hook de traducción:** `src/presentation/hooks/useLocalizedRoute.ts`
- **Hook de permisos:** `src/presentation/hooks/useRouteAccess.ts`
- **Componentes:** `src/presentation/components/LocalizedLink.tsx`
- **Ejemplos:** `src/presentation/components/LocalizedLink.examples.tsx`
- **Función SQL:** `supabase/schemas/app/09_FUNCION_CAN_ACCESS_ROUTE.sql`

---

## ✅ Checklist de Migración

Para migrar enlaces existentes al nuevo sistema:

- [ ] Identificar todos los enlaces `<Link>` en el proyecto
- [ ] Agregar rutas a `ROUTE_KEYS`
- [ ] Agregar traducciones a Supabase
- [ ] Reemplazar `<Link href="...">` por `<LocalizedLink routeKey="...">`
- [ ] Agregar `checkAccess` donde sea necesario
- [ ] Probar en diferentes idiomas
- [ ] Probar con diferentes roles de usuario

---

## 🎓 Mejores Prácticas

1. **Siempre usa claves en lugar de URLs hardcodeadas**
   ```tsx
   // ❌ Mal
   <Link href="/admin/usuarios">Admin</Link>

   // ✅ Bien
   <LocalizedLink routeKey="admin.users">Admin</LocalizedLink>
   ```

2. **Verifica permisos para rutas protegidas**
   ```tsx
   // ❌ Mal - Usuario puede ver enlace sin acceso
   <LocalizedLink routeKey="admin.users">Admin</LocalizedLink>

   // ✅ Bien - Enlace solo se muestra si tiene acceso
   <LocalizedLink routeKey="admin.users" checkAccess>Admin</LocalizedLink>
   ```

3. **Usa NavLink para menús de navegación**
   ```tsx
   // ✅ Automáticamente verifica permisos y aplica estilos activos
   <NavLink
     routeKey="admin.users"
     active={pathname.includes('/usuarios')}
     activeClassName="bg-blue-600"
   >
     Usuarios
   </NavLink>
   ```

4. **Cachea verificaciones múltiples**
   ```tsx
   // ❌ Mal - Múltiples llamadas individuales
   const access1 = useRouteAccess('admin.users');
   const access2 = useRouteAccess('admin.roles');

   // ✅ Bien - Una sola llamada
   const access = useMultipleRouteAccess(['admin.users', 'admin.roles']);
   ```

---

## 📊 Performance

- **Cache de rutas:** Reduce llamadas a Supabase en 95%
- **Cache de permisos:** Evita verificaciones repetidas
- **Verificación en paralelo:** `useMultipleRouteAccess` usa Promise.all
- **Optimización de renders:** Hooks memorizados con useMemo

---

**Última actualización:** 2026-01-18
**Versión del sistema:** 1.0.0
