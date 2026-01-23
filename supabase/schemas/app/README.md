# 📁 Estructura Modular y Granular de Base de Datos

Esta carpeta contiene el esquema de base de datos organizado en **módulos independientes y granulares** para facilitar el mantenimiento, escalabilidad y claridad del código.

## 🎯 Estructura Completa

```
app/
├── auth/                           # 🔐 AUTENTICACIÓN
│   ├── 00_init.sql                 # Inicialización (schema, extensiones)
│   ├── enums/                      # Enumeraciones
│   │   ├── user_role.sql           # Roles del sistema
│   │   └── oauth_provider.sql      # Providers OAuth
│   ├── tables/                     # Tablas
│   │   ├── roles.sql               # Catálogo de roles (6 roles)
│   │   ├── user_profiles.sql       # Perfiles extendidos con OAuth
│   │   └── user_roles.sql          # Asignación de roles
│   ├── functions/                  # Funciones
│   │   ├── set_updated_at.sql      # Actualizar updated_at
│   │   ├── get_user_primary_role.sql  # Rol principal
│   │   └── has_role.sql            # Verificar rol
│   ├── triggers/                   # Triggers
│   │   ├── set_updated_at.sql      # Triggers updated_at
│   │   └── handle_new_user.sql     # Crear perfil auto
│   └── rls/                        # Row Level Security
│       ├── roles_policies.sql
│       ├── user_profiles_policies.sql
│       └── user_roles_policies.sql
│
├── organizations/                  # 🏢 ORGANIZACIONES
│   ├── enums/
│   │   ├── organization_type.sql   # Tipos de orgs
│   │   └── membership_status.sql   # Estados
│   ├── tables/
│   │   ├── organizations.sql       # Escuelas, familias
│   │   ├── organization_members.sql  # Miembros
│   │   └── user_relationships.sql  # Relaciones
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
├── translations/                   # 🌍 TRADUCCIONES
│   ├── schema/                     # Sistema i18n
│   │   ├── 00_tables.sql           # Tablas
│   │   ├── 01_triggers.sql         # Triggers
│   │   ├── 02_rls.sql              # RLS
│   │   └── 03_initial_data.sql     # Datos iniciales
│   └── data/                       # Traducciones
│       ├── 00_helper_function.sql
│       ├── auth/                   # Auth (61 traducciones)
│       │   ├── 01_forms.sql
│       │   ├── 02_login.sql
│       │   ├── 03_register.sql
│       │   ├── 04_roles.sql
│       │   ├── 05_providers.sql
│       │   ├── 06_errors.sql
│       │   └── 07_messages.sql
│       ├── navigation.sql          # 11 traducciones
│       ├── common.sql              # 14 traducciones
│       ├── errors.sql              # 4 traducciones
│       └── 99_cleanup.sql
│
└── legacy/                         # 📦 COMPATIBILIDAD
    └── user_types.sql              # Tabla legacy
```

---

## 📦 Descripción de Módulos

### 1. 🔐 AUTH (14 archivos)
Sistema completo de autenticación con roles y OAuth

**Archivos:** 00_init + 2 enums + 3 tables + 3 functions + 2 triggers + 3 rls = 14

**Contenido principal:**
- 6 roles: super_admin, school, teacher, parent, student, individual
- 5 providers OAuth: google, apple, facebook, azure, github
- Trigger automático de creación de perfiles

### 2. 🏢 ORGANIZATIONS (12 archivos)  
Organizaciones, miembros y relaciones

**Archivos:** 2 enums + 3 tables + 2 functions + 2 views + 3 rls = 12

**Contenido principal:**
- 5 tipos de organizaciones
- 4 estados de membresía
- Relaciones padre-hijo, maestro-estudiante

### 3. 🌍 TRANSLATIONS (15 archivos)
Sistema completo de traducciones

**Archivos:** 4 schema + 1 helper + 7 auth + 3 otros + 1 cleanup = 16 

**Contenido principal:**
- 3 idiomas: ES, EN, FR
- ~90 claves de traducción
- ~270 traducciones totales

### 4. 📦 LEGACY (1 archivo)
Compatibilidad con código antiguo

---

## 🚀 Instalación Rápida

```bash
psql -f supabase/SETUP_RAPIDO.sql
```

O copia/pega cada archivo en SQL Editor siguiendo el orden del script.

---

## ✅ Verificación

```sql
SELECT 'auth' as modulo, (SELECT COUNT(*) FROM app.roles) as total
UNION SELECT 'orgs', (SELECT COUNT(*) FROM app.organizations)
UNION SELECT 'translations', (SELECT COUNT(*) FROM app.translation_keys)
UNION SELECT 'legacy', (SELECT COUNT(*) FROM app.user_types);
```

**Esperado:** 6, 0, ~90, 5

---

## 🔍 Búsqueda Rápida

- **Enums de roles?** → `auth/enums/user_role.sql`
- **Tabla de perfiles?** → `auth/tables/user_profiles.sql`  
- **Trigger de nuevo usuario?** → `auth/triggers/handle_new_user.sql`
- **Traducciones de login?** → `translations/data/auth/02_login.sql`
- **Funciones de orgs?** → `organizations/functions/`
- **RLS de roles?** → `auth/rls/roles_policies.sql`

---

## 📊 Estadísticas

- **Módulos:** 4
- **Archivos SQL:** 42
- **Tablas:** 13
- **Funciones:** 8
- **Enums:** 4
- **Vistas:** 3
- **Traducciones:** ~270

---

## 🎨 Ventajas

✅ **Granular** - Cada componente en su archivo
✅ **Modular** - Por dominio funcional
✅ **Mantenible** - Fácil localizar código
✅ **Escalable** - Agregar sin romper
✅ **Documentado** - Comentarios en cada archivo

---

**Versión:** 4.0 - Estructura Granular
**Actualizado:** 2026-01-23
