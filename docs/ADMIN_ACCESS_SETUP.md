# 🔐 Setup de Acceso Admin - Guía Completa

Esta guía te ayudará a configurar acceso completo de **super_admin** a todos los módulos de administración.

## 📋 Tabla de Contenidos

- [Opción 1: Script Automático (Recomendado)](#opción-1-script-automático-recomendado)
- [Opción 2: SQL Manual](#opción-2-sql-manual)
- [Opción 3: Supabase Dashboard](#opción-3-supabase-dashboard)
- [Verificación](#verificación)
- [Módulos Disponibles](#módulos-disponibles)

---

## Opción 1: Script Automático (Recomendado)

### Requisitos

- Bash shell
- Conexión a tu base de datos Supabase
- Una de las siguientes:
  - Variable de entorno `SUPABASE_DB_URL` configurada
  - Archivo `.env.local` con `SUPABASE_DB_URL`
  - Supabase CLI instalado (`supabase` command)
  - Cliente `psql` instalado

### Pasos

1. **Ejecutar el script:**

```bash
cd /home/user/es-lecto-escritura-web-nextjs
./scripts/setup-admin-access.sh
```

2. **Ingresar tu email cuando se solicite:**

```
📧 Ingresa el email del usuario que será super_admin:
Email: tu_email@example.com
```

3. **Confirmar la operación:**

```
⚠️  Se asignará acceso completo de super_admin a: tu_email@example.com

¿Continuar? (y/n): y
```

4. **¡Listo!** El script:
   - ✅ Asignará rol de super_admin
   - ✅ Registrará todas las rutas de admin
   - ✅ Configurará permisos de acceso
   - ✅ Verificará que todo funcione

---

## Opción 2: SQL Manual

Si prefieres ejecutar el SQL manualmente o el script automático no funcionó:

### Método A: Usando psql

```bash
# 1. Editar el archivo SQL y cambiar el email
nano supabase/schemas/app/15_SETUP_ADMIN_ACCESO_COMPLETO.sql

# Buscar todas las apariciones de 'tu_email@example.com' y reemplazar con tu email

# 2. Ejecutar el script
psql $SUPABASE_DB_URL -f supabase/schemas/app/15_SETUP_ADMIN_ACCESO_COMPLETO.sql
```

### Método B: Usando Supabase CLI

```bash
# 1. Editar el archivo SQL (mismo paso que arriba)
nano supabase/schemas/app/15_SETUP_ADMIN_ACCESO_COMPLETO.sql

# 2. Ejecutar con CLI
supabase db execute --file supabase/schemas/app/15_SETUP_ADMIN_ACCESO_COMPLETO.sql
```

### Método C: Editor SQL de Supabase

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Abre el archivo `supabase/schemas/app/15_SETUP_ADMIN_ACCESO_COMPLETO.sql`
4. Busca y reemplaza **todas** las apariciones de `tu_email@example.com` con tu email real
5. Ejecuta el script completo (botón **Run**)

---

## Opción 3: Supabase Dashboard

Si prefieres hacerlo paso a paso manualmente:

### Paso 1: Encontrar tu User ID

```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'tu_email@example.com';
```

### Paso 2: Asignar rol super_admin

```sql
INSERT INTO app.user_roles (user_id, role_id, is_active, notes)
SELECT
  au.id,
  r.id,
  true,
  'Rol asignado manualmente'
FROM auth.users au
CROSS JOIN app.roles r
WHERE au.email = 'tu_email@example.com'
  AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id)
DO UPDATE SET
  is_active = true,
  revoked_at = NULL;
```

### Paso 3: Registrar rutas de admin

```sql
-- Ejecutar el bloque INSERT INTO app.routes del archivo
-- 15_SETUP_ADMIN_ACCESO_COMPLETO.sql (líneas 71-125)
```

### Paso 4: Configurar permisos

```sql
INSERT INTO app.route_permissions (route_id, role_id, permission_type, notes)
SELECT
  r.id,
  (SELECT id FROM app.roles WHERE name = 'super_admin'),
  'grant',
  'Acceso manual para super_admin'
FROM app.routes r
WHERE r.pathname LIKE '/admin%'
  AND r.deleted_at IS NULL
ON CONFLICT (route_id, role_id)
DO UPDATE SET
  permission_type = 'grant',
  revoked_at = NULL;
```

---

## Verificación

### 1. Verificar rol asignado

```sql
SELECT
  au.email,
  r.name as role_name,
  r.display_name,
  r.hierarchy_level,
  ur.is_active,
  ur.created_at
FROM app.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
JOIN app.roles r ON r.id = ur.role_id
WHERE au.email = 'tu_email@example.com'
  AND ur.revoked_at IS NULL;
```

**Resultado esperado:**
```
email                | role_name   | display_name  | hierarchy_level | is_active
---------------------|-------------|---------------|-----------------|----------
tu_email@example.com | super_admin | Super Admin   | 100             | true
```

### 2. Verificar permisos de rutas

```sql
SELECT COUNT(*) as rutas_con_acceso
FROM app.route_permissions rp
JOIN app.routes r ON r.id = rp.route_id
JOIN app.roles ro ON ro.id = rp.role_id
WHERE ro.name = 'super_admin'
  AND r.pathname LIKE '/admin%'
  AND rp.permission_type = 'grant';
```

**Resultado esperado:** Debería mostrar 20+ rutas con acceso

### 3. Probar acceso a rutas específicas

```sql
SELECT
  r.pathname,
  can_access_route(
    (SELECT id FROM auth.users WHERE email = 'tu_email@example.com'),
    r.pathname,
    'es'
  ) as tiene_acceso
FROM app.routes r
WHERE r.pathname IN (
  '/admin',
  '/admin/organizations',
  '/admin/languages',
  '/admin/roles',
  '/admin/translation-keys'
)
ORDER BY r.pathname;
```

**Resultado esperado:** Todas las rutas deberían tener `tiene_acceso = true`

### 4. Probar en la aplicación

1. Inicia sesión con tu cuenta: `http://localhost:3000/es/login`
2. Navega a: `http://localhost:3000/es/admin`
3. Deberías ver el dashboard con todas las secciones en el menú lateral
4. Prueba acceder a cada módulo:
   - ✅ Dashboard
   - ✅ Organizaciones
   - ✅ Idiomas
   - ✅ Roles
   - ✅ Sistema de Traducciones
   - ✅ Usuarios
   - ✅ etc.

---

## Módulos Disponibles

Una vez configurado el acceso, tendrás disponibles estos módulos:

### 📊 General
- **Dashboard** - `/admin` - Panel principal con estadísticas

### 🏢 Organizaciones
- **Organizaciones** - `/admin/organizations` - Gestión de organizaciones
- **Miembros de Organización** - `/admin/organization-members` - Gestión de miembros

### 👥 Usuarios
- **Usuarios** - `/admin/users` - Gestión de usuarios
- **Perfiles de Usuario** - `/admin/user-profiles` - Información extendida
- **Relaciones de Usuario** - `/admin/user-relationships` - Relaciones entre usuarios
- **Roles de Usuario** - `/admin/user-roles` - Asignación de roles

### 🛡️ Roles y Permisos
- **Roles** - `/admin/roles` - Gestión de roles
- **Permisos de Rol** - `/admin/role-permissions` - Permisos por rol
- **Permisos de Usuario** - `/admin/user-permissions` - Permisos específicos
- **Acceso por Rol e Idioma** - `/admin/role-language-access` - Control por idioma

### 🌐 Idiomas
- **Idiomas** - `/admin/languages` - Gestión de idiomas del sistema

### 🗣️ Sistema de Traducciones
- **Namespaces** - `/admin/translation-namespaces` - Espacios de nombres
- **Categorías** - `/admin/translation-categories` - Categorías de traducción
- **Claves de Traducción** - `/admin/translation-keys` - Gestión de claves
- **Traducciones** - `/admin/translations` - Gestión de traducciones

### 🛣️ Rutas
- **Rutas** - `/admin/routes` - Gestión de rutas del sistema
- **Permisos de Rutas** - `/admin/route-permissions` - Permisos de acceso
- **Permisos de Usuario por Ruta** - `/admin/user-route-permissions` - Permisos específicos
- **Escáner de Rutas** - `/admin/route-scanner` - Escanear y registrar rutas
- **Traducciones de Rutas** - `/admin/route-translations` - Traducciones de nombres

### 📋 Auditoría
- **Auditoría** - `/admin/audit` - Logs y auditoría del sistema

---

## Solución de Problemas

### ❌ Error: "Usuario no encontrado"

**Causa:** El email no existe en la base de datos.

**Solución:**
1. Verifica que el usuario esté registrado
2. Comprueba que el email esté escrito correctamente
3. Revisa la tabla `auth.users`:

```sql
SELECT email FROM auth.users;
```

### ❌ Error: "Rol super_admin no encontrado"

**Causa:** La tabla de roles no está inicializada.

**Solución:** Ejecuta primero el script de roles:

```bash
psql $SUPABASE_DB_URL -f supabase/schemas/app/02_TABLA_ROLES.sql
```

### ❌ Error: "Access denied" al intentar acceder a /admin

**Causas posibles:**
1. Las políticas RLS no están actualizadas
2. La función `can_access_route` no existe
3. Los permisos no se asignaron correctamente

**Solución:**

```bash
# 1. Actualizar políticas RLS
psql $SUPABASE_DB_URL -f supabase/schemas/app/12_ACTUALIZAR_POLITICAS_RLS.sql

# 2. Verificar función can_access_route
psql $SUPABASE_DB_URL -f supabase/schemas/app/09_FUNCION_CAN_ACCESS_ROUTE.sql

# 3. Re-ejecutar el script de setup
./scripts/setup-admin-access.sh
```

### ❌ El menú lateral no muestra todos los módulos

**Causa:** Falta actualizar el archivo `layout.tsx`

**Solución:** El layout ya está actualizado en el último commit. Haz pull de los cambios:

```bash
git pull origin claude/admin-module-unified-layout-3UZJR
```

---

## Contacto y Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de Supabase en el Dashboard
2. Verifica las políticas RLS en la sección "Authentication"
3. Comprueba que todas las migraciones se ejecutaron correctamente

---

## Seguridad

⚠️ **IMPORTANTE:**

- El rol **super_admin** tiene acceso completo a TODO el sistema
- Solo asigna este rol a usuarios de máxima confianza
- En producción, considera crear roles con permisos más limitados
- Revisa periódicamente quién tiene acceso de super_admin

```sql
-- Ver todos los super_admins
SELECT
  au.email,
  ur.created_at,
  ur.is_active
FROM app.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
JOIN app.roles r ON r.id = ur.role_id
WHERE r.name = 'super_admin'
  AND ur.revoked_at IS NULL;
```

---

## Licencia

Este proyecto utiliza el sistema de roles y permisos para controlar el acceso a diferentes módulos de administración.
