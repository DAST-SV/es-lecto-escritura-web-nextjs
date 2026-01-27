# 📁 Schema: App

Estructura modular y granular de base de datos para el sistema de la aplicación.

## 🎯 Estructura Completa

```
app/
├── auth/                              # 🔐 AUTENTICACIÓN
│   ├── 00_init.sql                    # Inicialización (schema, extensiones)
│   ├── enums/
│   │   ├── user_role.sql              # Roles del sistema
│   │   └── oauth_provider.sql         # Providers OAuth
│   ├── tables/
│   │   ├── roles.sql                  # Catálogo de roles (6 roles)
│   │   ├── user_profiles.sql          # Perfiles extendidos con OAuth
│   │   └── user_roles.sql             # Asignación de roles
│   ├── functions/
│   │   ├── set_updated_at.sql         # Actualizar updated_at
│   │   ├── get_user_primary_role.sql  # Rol principal
│   │   └── has_role.sql               # Verificar rol
│   ├── triggers/
│   │   ├── set_updated_at.sql         # Triggers updated_at
│   │   └── handle_new_user.sql        # Crear perfil auto
│   └── rls/
│       ├── roles_policies.sql
│       ├── user_profiles_policies.sql
│       └── user_roles_policies.sql
│
├── routes/                            # 🛤️ RUTAS DEL SISTEMA
│   ├── tables/
│   │   ├── routes.sql                 # Rutas físicas
│   │   └── route_translations.sql     # Traducciones de rutas
│   └── data.sql                       # Datos iniciales
│
├── permissions/                       # 🔒 PERMISOS
│   ├── tables/
│   │   ├── route_permissions.sql      # Permisos por rol
│   │   └── user_route_permissions.sql # Permisos individuales
│   ├── functions/
│   │   ├── can_access_route.sql       # Verificar acceso
│   │   └── search_users.sql           # Buscar usuarios
│   └── data.sql                       # Datos iniciales
│
├── role_language_access/              # 🌍 ACCESO POR IDIOMA
│   ├── tables/
│   │   └── role_language_access.sql   # Idiomas por rol
│   └── data.sql                       # Datos iniciales
│
├── organizations/                     # 🏢 ORGANIZACIONES
│   ├── enums/
│   │   ├── organization_type.sql      # Tipos de orgs
│   │   └── membership_status.sql      # Estados
│   ├── tables/
│   │   ├── organizations.sql          # Escuelas, familias
│   │   ├── organization_members.sql   # Miembros
│   │   └── user_relationships.sql     # Relaciones
│   ├── functions/
│   │   ├── is_org_admin.sql
│   │   └── get_user_organizations.sql
│   ├── views/
│   │   ├── v_organization_active_members.sql
│   │   └── v_organization_stats.sql
│   └── rls/
│       ├── organizations_policies.sql
│       ├── organization_members_policies.sql
│       └── user_relationships_policies.sql
│
├── translations/                      # 🌍 TRADUCCIONES
│   ├── schema/
│   │   ├── 00_tables.sql              # Tablas
│   │   ├── 01_triggers.sql            # Triggers
│   │   ├── 02_rls.sql                 # RLS
│   │   └── 03_initial_data.sql        # Datos iniciales
│   └── data/
│       ├── 00_helper_function.sql
│       ├── auth/                      # Traducciones de auth
│       │   ├── 01_forms.sql
│       │   ├── 02_login.sql
│       │   ├── 03_register.sql
│       │   ├── 04_roles.sql
│       │   ├── 05_providers.sql
│       │   ├── 06_errors.sql
│       │   └── 07_messages.sql
│       ├── navigation.sql             # Navegación
│       ├── common.sql                 # Común
│       ├── errors.sql                 # Errores
│       └── 99_cleanup.sql
│
├── admin/                             # ⚙️ ADMINISTRACIÓN
│   ├── setup/
│   │   ├── assign_super_admin.sql     # Asignar super_admin
│   │   └── complete_admin_access.sql  # Setup completo
│   └── rls/
│       └── admin_policies.sql         # Políticas admin
│
├── cleanup/                           # 🧹 LIMPIEZA
│   └── cleanup_all.sql                # Eliminar todo
│
└── legacy/                            # 📦 COMPATIBILIDAD
    └── user_types.sql                 # Tabla legacy
```

---

## 📦 Descripción de Módulos

### 1. 🔐 AUTH (14 archivos)
Sistema completo de autenticación con roles y OAuth.

**Contenido:**
- 6 roles: super_admin, admin, teacher, parent, student, guest
- 5 providers OAuth: google, apple, facebook, azure, github
- Trigger automático de creación de perfiles

### 2. 🛤️ ROUTES (3 archivos)
Gestión de rutas del sistema con traducciones multiidioma.

**Contenido:**
- Rutas físicas con metadata
- Traducciones por idioma (es, en, fr, it)
- Soporte para menús dinámicos

### 3. 🔒 PERMISSIONS (5 archivos)
Sistema de permisos granular.

**Contenido:**
- Permisos por rol (route_permissions)
- Permisos individuales (user_route_permissions)
- Función `can_access_route()` para verificar acceso
- Soporte para GRANT/DENY por idioma

### 4. 🌍 ROLE_LANGUAGE_ACCESS (2 archivos)
Control de acceso por idioma según rol.

### 5. 🏢 ORGANIZATIONS (12 archivos)
Organizaciones, miembros y relaciones.

**Contenido:**
- 5 tipos de organizaciones
- 4 estados de membresía
- Relaciones padre-hijo, maestro-estudiante

### 6. 🌍 TRANSLATIONS (16 archivos)
Sistema completo de traducciones dinámicas.

**Contenido:**
- 3 idiomas: ES, EN, FR
- ~90 claves de traducción
- ~270 traducciones totales

### 7. ⚙️ ADMIN (3 archivos)
Scripts de configuración administrativa.

### 8. 📦 LEGACY (1 archivo)
Compatibilidad con código antiguo.

---

## 🚀 Orden de Ejecución

```sql
-- 1. Auth (base)
\i auth/00_init.sql
\i auth/enums/*.sql
\i auth/tables/*.sql
\i auth/functions/*.sql
\i auth/triggers/*.sql
\i auth/rls/*.sql

-- 2. Routes
\i routes/tables/routes.sql
\i routes/tables/route_translations.sql
\i routes/data.sql

-- 3. Permissions
\i permissions/tables/route_permissions.sql
\i permissions/tables/user_route_permissions.sql
\i permissions/functions/can_access_route.sql
\i permissions/functions/search_users.sql
\i permissions/data.sql

-- 4. Role Language Access
\i role_language_access/tables/role_language_access.sql
\i role_language_access/data.sql

-- 5. Organizations
\i organizations/**/*.sql

-- 6. Translations
\i translations/schema/*.sql
\i translations/data/*.sql

-- 7. Admin
\i admin/rls/admin_policies.sql
```

---

## 📊 Estadísticas

| Módulo | Archivos |
|--------|----------|
| Auth | 14 |
| Routes | 3 |
| Permissions | 5 |
| Role Language Access | 2 |
| Organizations | 12 |
| Translations | 16 |
| Admin | 3 |
| Legacy | 1 |
| **Total** | **56** |

---

## 🔍 Búsqueda Rápida

- **Enums de roles?** → `auth/enums/user_role.sql`
- **Tabla de perfiles?** → `auth/tables/user_profiles.sql`
- **Trigger de nuevo usuario?** → `auth/triggers/handle_new_user.sql`
- **Traducciones de login?** → `translations/data/auth/02_login.sql`
- **Funciones de orgs?** → `organizations/functions/`
- **RLS de roles?** → `auth/rls/roles_policies.sql`
- **Verificar acceso a ruta?** → `permissions/functions/can_access_route.sql`
- **Permisos por idioma?** → `role_language_access/tables/role_language_access.sql`

---

## 🎨 Ventajas

✅ **Granular** - Cada componente en su archivo
✅ **Modular** - Por dominio funcional
✅ **Mantenible** - Fácil localizar código
✅ **Escalable** - Agregar sin romper
✅ **Documentado** - Comentarios en cada archivo

---

**Versión:** 5.0 - Estructura Granular Completa
**Actualizado:** 2026-01-27
