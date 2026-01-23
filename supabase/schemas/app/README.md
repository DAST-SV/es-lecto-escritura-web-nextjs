# 📁 Estructura Modular de Base de Datos

Esta carpeta contiene el esquema de base de datos organizado en **módulos independientes** para facilitar el mantenimiento y la claridad del código.

## 🎯 Estructura

```
app/
├── auth/                       # 🔐 Autenticación y usuarios
│   └── 01_auth_core.sql       # Roles, perfiles, OAuth, triggers
│
├── organizations/              # 🏢 Organizaciones y relaciones
│   └── 01_organizations.sql   # Orgs, miembros, relationships
│
├── translations/               # 🌍 Sistema de traducciones
│   ├── 01_translations_schema.sql   # Schema de i18n
│   └── 02_translations_inserts.sql  # Datos de traducciones
│
└── legacy/                     # 📦 Compatibilidad
    └── user_types.sql          # Tabla legacy
```

---

## 📦 Módulos

### 1. 🔐 Auth (Autenticación)
**Ubicación:** `auth/01_auth_core.sql`

**Contenido:**
- ✅ Enums: `user_role`, `oauth_provider`
- ✅ Tabla `roles` - Catálogo de roles del sistema
- ✅ Tabla `user_profiles` - Perfiles extendidos con OAuth
- ✅ Tabla `user_roles` - Asignación de roles
- ✅ Trigger `handle_new_user()` - Creación automática de perfiles
- ✅ Funciones: `get_user_primary_role()`, `has_role()`
- ✅ RLS completo para autenticación
- ✅ Datos iniciales: 6 roles

**Dependencias:** Ninguna

---

### 2. 🏢 Organizations (Organizaciones)
**Ubicación:** `organizations/01_organizations.sql`

**Contenido:**
- ✅ Enums: `organization_type`, `membership_status`
- ✅ Tabla `organizations` - Escuelas, familias, grupos
- ✅ Tabla `organization_members` - Miembros y permisos
- ✅ Tabla `user_relationships` - Relaciones padre-hijo, maestro-estudiante
- ✅ Funciones: `is_org_admin()`, `get_user_organizations()`
- ✅ Vistas: estadísticas de organizaciones
- ✅ RLS para organizaciones

**Dependencias:** `auth/01_auth_core.sql`

---

### 3. 🌍 Translations (Traducciones)
**Ubicación:** `translations/`

**Contenido:**
- ✅ `01_translations_schema.sql` - Sistema completo de i18n
  - Tablas: `languages`, `translation_namespaces`, `translation_keys`, `translations`
  - Soporte para múltiples idiomas (ES, EN, FR, etc.)
  - RLS para traducciones

- ✅ `02_translations_inserts.sql` - Datos iniciales
  - ~89 claves de traducción
  - ~267 traducciones (ES, EN, FR)
  - Namespaces: auth, navigation, common, errors

**Dependencias:** Ninguna (opcional)

---

### 4. 📦 Legacy (Compatibilidad)
**Ubicación:** `legacy/user_types.sql`

**Contenido:**
- ✅ Tabla `user_types` - Para compatibilidad con código antiguo
- ✅ Vista `v_active_user_types`
- ⚠️ **Nota:** Usar `app.roles` en código nuevo

**Dependencias:** Ninguna

---

## 🚀 Orden de Instalación

### Mínimo Requerido (Core):
```sql
-- 1. Autenticación (REQUERIDO)
\i auth/01_auth_core.sql

-- 2. Organizaciones (REQUERIDO)
\i organizations/01_organizations.sql

-- 3. Legacy (REQUERIDO para compatibilidad)
\i legacy/user_types.sql
```

### Opcional (Traducciones):
```sql
-- 4. Sistema de traducciones (opcional)
\i translations/01_translations_schema.sql

-- 5. Datos de traducciones (opcional)
\i translations/02_translations_inserts.sql
```

---

## 📝 Script de Setup Rápido

Usa: [`supabase/SETUP_RAPIDO.sql`](../../SETUP_RAPIDO.sql)

Este script ejecuta todos los módulos en el orden correcto.

---

## ✅ Verificación

Después de instalar todos los módulos, verifica:

```sql
-- Ver módulos instalados
SELECT
  'auth' as modulo,
  (SELECT COUNT(*) FROM app.roles) as elementos,
  'Roles del sistema' as descripcion
UNION ALL
SELECT
  'organizations',
  (SELECT COUNT(*) FROM app.organizations),
  'Organizaciones'
UNION ALL
SELECT
  'translations',
  (SELECT COUNT(*) FROM app.translation_keys WHERE 1=1),
  'Claves de traducción'
UNION ALL
SELECT
  'legacy',
  (SELECT COUNT(*) FROM app.user_types),
  'User types legacy';
```

**Resultado esperado:**
- auth: 6 roles
- organizations: 0 (se crean al usar la app)
- translations: 89 claves (si instalaste el módulo opcional)
- legacy: 5 user types

---

## 🔧 Mantenimiento

### Agregar nuevo módulo

1. Crea una carpeta: `app/nuevo_modulo/`
2. Crea el script: `app/nuevo_modulo/01_nuevo_modulo.sql`
3. Sigue la estructura de los módulos existentes:
   - Enums (si es necesario)
   - Tablas
   - Índices
   - Triggers
   - Funciones
   - RLS
   - Datos iniciales
   - Verificación
4. Actualiza `SETUP_RAPIDO.sql`
5. Actualiza este README

### Modificar módulo existente

1. Edita el archivo SQL del módulo
2. Si es un cambio mayor, crea una migración
3. Documenta los cambios en el commit

---

## 📚 Documentación

- **Setup completo:** [../../SETUP_AUTH.md](../../SETUP_AUTH.md)
- **OAuth providers:** [../../OAUTH_SETUP.md](../../OAUTH_SETUP.md)
- **Traducciones:** [../../../TRADUCCIONES_SUPABASE.md](../../../TRADUCCIONES_SUPABASE.md)

---

## 🎨 Ventajas de esta Estructura

✅ **Modular** - Cada funcionalidad en su módulo
✅ **Mantenible** - Fácil encontrar y actualizar código
✅ **Escalable** - Agregar nuevos módulos sin afectar existentes
✅ **Clara** - Organización lógica por dominio
✅ **Flexible** - Instalar solo los módulos necesarios
✅ **Testeable** - Probar módulos independientemente

---

**Última actualización:** 2026-01-23
**Versión:** 3.0 - Estructura Modular
