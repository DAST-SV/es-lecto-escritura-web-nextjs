# Guía de Setup - Base de Datos Nueva

Esta guía te indica el orden exacto para ejecutar los scripts SQL en una base de datos **NUEVA** de Supabase.

## Requisitos Previos

1. Tener una instancia de Supabase creada
2. Acceso al SQL Editor de Supabase
3. La base de datos debe estar vacía (o puedes limpiarla primero)

---

## Paso 0: Limpiar Base de Datos (Opcional)

Si necesitas limpiar la base de datos existente:

```sql
-- CUIDADO: Esto elimina TODO
-- Ejecutar: supabase/schemas/app/cleanup/cleanup_all.sql
```

---

## Paso 1: Esquemas y Extensiones Base

```sql
-- 1.1 Crear esquemas
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS books;

-- 1.2 Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda de texto
```

---

## Paso 2: Sistema de Autenticación (Schema: app)

Ejecutar en este orden:

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/auth/00_init.sql` | Inicialización del schema |
| 2 | `schemas/app/auth/enums/oauth_provider.sql` | Enum de proveedores OAuth |
| 3 | `schemas/app/auth/enums/user_role.sql` | Enum de roles de usuario |
| 4 | `schemas/app/auth/tables/roles.sql` | Tabla de roles |
| 5 | `schemas/app/auth/tables/user_profiles.sql` | Tabla de perfiles de usuario |
| 6 | `schemas/app/auth/tables/user_roles.sql` | Tabla de roles por usuario |
| 7 | `schemas/app/auth/functions/set_updated_at.sql` | Función para timestamps |
| 8 | `schemas/app/auth/functions/has_role.sql` | Función para verificar roles |
| 9 | `schemas/app/auth/functions/get_user_primary_role.sql` | Función para rol principal |
| 10 | `schemas/app/auth/triggers/set_updated_at.sql` | Trigger de timestamps |
| 11 | `schemas/app/auth/triggers/handle_new_user.sql` | Trigger para nuevos usuarios |
| 12 | `schemas/app/auth/rls/roles_policies.sql` | Políticas RLS de roles |
| 13 | `schemas/app/auth/rls/user_profiles_policies.sql` | Políticas RLS de perfiles |
| 14 | `schemas/app/auth/rls/user_roles_policies.sql` | Políticas RLS de user_roles |

---

## Paso 3: Sistema de Organizaciones (Schema: app)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/organizations/enums/organization_type.sql` | Tipos de organización |
| 2 | `schemas/app/organizations/enums/membership_status.sql` | Estados de membresía |
| 3 | `schemas/app/organizations/tables/organizations.sql` | Tabla de organizaciones |
| 4 | `schemas/app/organizations/tables/organization_members.sql` | Miembros de orgs |
| 5 | `schemas/app/organizations/tables/user_relationships.sql` | Relaciones entre usuarios |
| 6 | `schemas/app/organizations/functions/get_user_organizations.sql` | Función helper |
| 7 | `schemas/app/organizations/functions/is_org_admin.sql` | Verificar admin |
| 8 | `schemas/app/organizations/rls/organizations_policies.sql` | Políticas RLS |
| 9 | `schemas/app/organizations/rls/organization_members_policies.sql` | Políticas RLS |
| 10 | `schemas/app/organizations/rls/user_relationships_policies.sql` | Políticas RLS |
| 11 | `schemas/app/organizations/views/v_organization_active_members.sql` | Vista miembros activos |
| 12 | `schemas/app/organizations/views/v_organization_stats.sql` | Vista estadísticas |

---

## Paso 4: Sistema de Permisos (Schema: app)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/permissions/tables/route_permissions.sql` | Permisos de rutas |
| 2 | `schemas/app/permissions/tables/user_route_permissions.sql` | Permisos por usuario |
| 3 | `schemas/app/permissions/functions/can_access_route.sql` | Verificar acceso |
| 4 | `schemas/app/permissions/functions/search_users.sql` | Buscar usuarios |
| 5 | `schemas/app/permissions/data.sql` | Datos iniciales de permisos |
| 6 | `schemas/app/permissions/rbac_data.sql` | Datos RBAC |

---

## Paso 5: Sistema de Traducciones (Schema: app)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/translations/schema/00_tables.sql` | Tablas de traducción |
| 2 | `schemas/app/translations/schema/01_triggers.sql` | Triggers |
| 3 | `schemas/app/translations/schema/02_rls.sql` | Políticas RLS |
| 4 | `schemas/app/translations/schema/03_initial_data.sql` | Datos iniciales |
| 5 | `schemas/app/translations/data/00_helper_function.sql` | Función helper |
| 6 | `schemas/app/translations/data/common.sql` | Traducciones comunes |
| 7 | `schemas/app/translations/data/navigation.sql` | Traducciones navegación |
| 8 | `schemas/app/translations/data/errors.sql` | Traducciones errores |
| 9 | `schemas/app/translations/data/home_page.sql` | Traducciones home |
| 10 | `schemas/app/translations/data/auth/*.sql` | Traducciones auth (todos) |
| 11 | `schemas/app/translations/data/99_cleanup.sql` | Limpieza helper |

---

## Paso 6: Acceso a Idiomas por Rol (Schema: app)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/role_language_access/tables/role_language_access.sql` | Tabla |
| 2 | `schemas/app/role_language_access/data.sql` | Datos iniciales |

---

## Paso 7: Rutas y Navegación (Schema: app)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/routes/tables/routes.sql` | Tabla de rutas |
| 2 | `schemas/app/routes/tables/route_translations.sql` | Traducciones de rutas |
| 3 | `schemas/app/routes/data.sql` | Datos iniciales |

---

## Paso 8: Perfiles de Autor (Schema: app)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/authors/tables.sql` | Tablas de autores |

---

## Paso 9: Comunidades (Schema: app)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/communities/tables.sql` | Tablas de comunidades |

---

## Paso 10: Sistema de Libros - Base (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/00_init.sql` | Inicialización schema books |
| 2 | `schemas/books/catalogs/tables.sql` | Catálogos (tipos, niveles, categorías, etc.) |
| 3 | `schemas/books/catalogs/translations.sql` | Traducciones de catálogos |
| 4 | `schemas/books/tables/books.sql` | Tabla principal de libros |
| 5 | `schemas/books/tables/book_pages.sql` | Páginas de libros |
| 6 | `schemas/books/tables/book_authors.sql` | Autores de libros (legacy) |
| 7 | `schemas/books/tables/book_characters.sql` | Personajes |
| 8 | `schemas/books/tables/book_views.sql` | Vistas de libros |
| 9 | `schemas/books/tables/book_audit_logs.sql` | Logs de auditoría |

---

## Paso 11: Sistema de Libros - Relaciones (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/relations/all_relations.sql` | Todas las relaciones M:N |

---

## Paso 12: Sistema de Libros - Traducciones (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/translations/tables.sql` | Traducciones de libros |

---

## Paso 13: Sistema de Libros - Colaboradores (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/collaborators/tables.sql` | Colaboradores de libros |

---

## Paso 14: Sistema de Libros - Acceso (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/access/tables.sql` | Control de acceso a libros |

---

## Paso 15: Sistema de Libros - Reviews (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/reviews/tables.sql` | Ratings y reviews |

---

## Paso 16: Sistema de Libros - Analytics (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/analytics/tables.sql` | Tablas de analytics |
| 2 | `schemas/books/analytics/functions.sql` | Funciones de analytics |
| 3 | `schemas/books/analytics/rls.sql` | Políticas RLS |

---

## Paso 17: Sistema de Libros - Funciones (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/functions/update_updated_at.sql` | Función timestamps |
| 2 | `schemas/books/functions/audit_trigger.sql` | Trigger de auditoría |
| 3 | `schemas/books/functions/increment_views.sql` | Incrementar vistas |
| 4 | `schemas/books/functions/search_books.sql` | Búsqueda de libros |
| 5 | `schemas/books/functions/soft_delete_book.sql` | Eliminación suave |
| 6 | `schemas/books/functions/duplicate_book.sql` | Duplicar libro |
| 7 | `schemas/books/functions/validate_publishing.sql` | Validar publicación |
| 8 | `schemas/books/functions/cleanup_audit_logs.sql` | Limpiar logs |

---

## Paso 18: Sistema de Libros - Triggers (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/triggers/all_triggers.sql` | Todos los triggers |

---

## Paso 19: Sistema de Libros - Políticas RLS (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/rls/all_policies.sql` | Todas las políticas RLS |

---

## Paso 20: Sistema de Libros - Vistas (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/views/books_full_info.sql` | Vista completa de libros |
| 2 | `schemas/books/views/book_statistics.sql` | Vista de estadísticas |
| 3 | `schemas/books/expose/public_views.sql` | Vistas públicas |

---

## Paso 21: Sistema de Libros - Datos Iniciales (Schema: books)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/books/data.sql` | Datos iniciales (catálogos) |

---

## Paso 22: Storage Buckets

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/storage/00_init.sql` | Inicialización storage |
| 2 | `schemas/app/storage/buckets/public_images.sql` | Bucket imágenes públicas |
| 3 | `schemas/books/storage/buckets.sql` | Buckets de libros |

---

## Paso 23: Admin Setup

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `schemas/app/admin/rls/admin_policies.sql` | Políticas de admin |
| 2 | `schemas/app/admin/setup/assign_super_admin.sql` | Asignar super admin |
| 3 | `schemas/app/admin/setup/complete_admin_access.sql` | Completar acceso admin |

---

## Script de Ejecución Rápida (Opcional)

Si prefieres ejecutar todo de una vez, puedes usar:

```sql
-- Ejecutar: supabase/SETUP_RAPIDO.sql
-- Este archivo combina todos los scripts en orden correcto
```

---

## Verificación Post-Setup

Ejecuta estas consultas para verificar que todo está correcto:

```sql
-- Verificar schemas
SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('app', 'books');

-- Verificar tablas principales
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('app', 'books')
ORDER BY table_schema, table_name;

-- Verificar roles creados
SELECT * FROM app.roles;

-- Verificar idiomas
SELECT * FROM app.languages;

-- Verificar catálogos de libros
SELECT 'book_types' as catalog, count(*) FROM books.book_types
UNION ALL
SELECT 'book_levels', count(*) FROM books.book_levels
UNION ALL
SELECT 'book_categories', count(*) FROM books.book_categories
UNION ALL
SELECT 'book_genres', count(*) FROM books.book_genres
UNION ALL
SELECT 'book_values', count(*) FROM books.book_values;
```

---

## Notas Importantes

1. **RLS está habilitado** - Todas las tablas tienen Row Level Security activado
2. **Trigger de nuevos usuarios** - Al registrarse, se crea automáticamente el perfil y rol
3. **Textos de páginas** - El campo `book_pages.content` almacena el texto extraído para TTS
4. **Multi-idioma** - Los libros pueden tener traducciones en múltiples idiomas

---

## Troubleshooting

### Error: "relation already exists"
El script ya fue ejecutado. Puedes ignorar o limpiar la DB primero.

### Error: "permission denied"
Verifica que estás usando el usuario correcto con permisos de superusuario.

### Error: "schema does not exist"
Asegúrate de ejecutar el Paso 1 primero para crear los schemas.
