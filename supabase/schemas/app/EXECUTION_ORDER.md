# Schema APP - Orden de Ejecucion

## 1. Inicializacion
```
auth/00_init.sql
```

## 2. Enums
```
auth/enums/user_role.sql
auth/enums/oauth_provider.sql
organizations/enums/organization_type.sql
organizations/enums/membership_status.sql
permissions/enums/permission_type.sql
```

## 3. Types
```
auth/types/language_code.sql
```

## 4. Funciones Base (helpers para triggers)
```
auth/functions/set_updated_at.sql
```

## 5. Tablas Base (sin FK complejas)
```
auth/tables/roles.sql
organizations/tables/organizations.sql
translations/schema/00_tables.sql
routes/tables/routes.sql
```

## 6. Tablas con FK simples (sin RLS que use funciones)
```
auth/tables/user_profiles.sql
auth/tables/user_roles.sql
```

## 7. Funciones de Permisos (necesarias para RLS de tablas siguientes)
```
auth/functions/has_role.sql
auth/functions/is_super_admin.sql
auth/functions/get_user_primary_role.sql
organizations/functions/is_org_admin.sql
organizations/functions/get_user_organizations.sql
```

## 8. Tablas con FK y RLS que usan funciones
```
organizations/tables/organization_members.sql
organizations/tables/user_relationships.sql
routes/tables/route_translations.sql
```

## 7. Funciones de utilidad (necesarias para RLS)
```
auth/functions/get_user_primary_role.sql
auth/functions/has_role.sql
auth/functions/is_super_admin.sql
```

## 8. Tablas con FK y RLS que usan funciones
```
permissions/tables/route_permissions.sql
permissions/tables/user_route_permissions.sql
role_language_access/tables/role_language_access.sql
```

## 9. Funciones adicionales
```
organizations/functions/is_org_admin.sql
organizations/functions/get_user_organizations.sql
permissions/functions/can_access_route.sql
permissions/functions/search_users.sql
translations/data/00_helper_function.sql
```

## 10. Triggers
```
auth/triggers/set_updated_at.sql
auth/triggers/handle_new_user.sql
translations/schema/01_triggers.sql
```

## 11. Views
```
organizations/views/v_organization_active_members.sql
organizations/views/v_organization_stats.sql
```

## 12. RLS adicionales
```
auth/rls/roles_policies.sql
auth/rls/user_profiles_policies.sql
auth/rls/user_roles_policies.sql
organizations/rls/organizations_policies.sql
organizations/rls/organization_members_policies.sql
organizations/rls/user_relationships_policies.sql
translations/schema/02_rls.sql
admin/rls/admin_policies.sql
```

## 13. Datos
```
translations/schema/03_initial_data.sql
routes/data.sql
routes/data_explorar.sql
permissions/data.sql
# permissions/rbac_data.sql  # INCOMPATIBLE - NO EJECUTAR (ver SIMULATION_REPORT.md)
role_language_access/data.sql
translations/data/auth/01_forms.sql
translations/data/auth/02_login.sql
translations/data/auth/03_register.sql
translations/data/auth/04_roles.sql
translations/data/auth/05_providers.sql
translations/data/auth/06_errors.sql
translations/data/auth/07_messages.sql
translations/data/navigation.sql
translations/data/common.sql
translations/data/errors.sql
translations/data/home_page.sql
translations/data/books.sql
translations/data/books_user_pages.sql
translations/data/admin_dashboard.sql
translations/data/complete_system.sql
```

## 14. Admin (opcional)
```
admin/setup/assign_super_admin.sql
admin/setup/complete_admin_access.sql
```

## 15. Storage (opcional)
```
storage/00_init.sql
storage/buckets/public_images.sql
```

---

## Notas de Dependencias

### Grafo de dependencias criticas:

```
1. auth/00_init.sql (schema + extensions)
   |
   +-- 2. Enums (user_role, permission_type, etc.)
   |       |
   |       +-- 5. roles.sql (usa user_role)
   |               |
   |               +-- 6. user_roles.sql (FK a roles)
   |                       |
   |                       +-- 7. has_role() (consulta user_roles)
   |                               |
   |                               +-- 7. is_super_admin() (usa has_role)
   |                                       |
   |                                       +-- 8. route_permissions.sql (RLS usa is_super_admin)
   |                                       +-- 8. user_route_permissions.sql (RLS usa is_super_admin)
   |                                       +-- 8. role_language_access.sql (RLS usa is_super_admin)
```

### Regla clave:
Las funciones `has_role()` e `is_super_admin()` DEBEN crearse ANTES de las tablas que las usan en sus politicas RLS.
