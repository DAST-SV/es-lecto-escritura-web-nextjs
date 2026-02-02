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
```

## 3. Types
```
auth/types/language_code.sql
```

## 4. Funciones Base
```
auth/functions/set_updated_at.sql
```

## 5. Tablas Base
```
auth/tables/roles.sql
organizations/tables/organizations.sql
translations/schema/00_tables.sql
routes/tables/routes.sql
```

## 6. Tablas con FK
```
auth/tables/user_profiles.sql
auth/tables/user_roles.sql
organizations/tables/organization_members.sql
organizations/tables/user_relationships.sql
routes/tables/route_translations.sql
permissions/tables/route_permissions.sql
permissions/tables/user_route_permissions.sql
role_language_access/tables/role_language_access.sql
```

## 7. Funciones
```
auth/functions/get_user_primary_role.sql
auth/functions/has_role.sql
auth/functions/is_super_admin.sql
organizations/functions/is_org_admin.sql
organizations/functions/get_user_organizations.sql
permissions/functions/can_access_route.sql
permissions/functions/search_users.sql
translations/data/00_helper_function.sql
```

## 8. Triggers
```
auth/triggers/set_updated_at.sql
auth/triggers/handle_new_user.sql
translations/schema/01_triggers.sql
```

## 9. Views
```
organizations/views/v_organization_active_members.sql
organizations/views/v_organization_stats.sql
```

## 10. RLS
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

## 11. Datos
```
translations/schema/03_initial_data.sql
routes/data.sql
routes/data_explorar.sql
permissions/data.sql
permissions/rbac_data.sql
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

## 12. Admin (opcional)
```
admin/setup/assign_super_admin.sql
admin/setup/complete_admin_access.sql
```

## 13. Storage (opcional)
```
storage/00_init.sql
storage/buckets/public_images.sql
```
