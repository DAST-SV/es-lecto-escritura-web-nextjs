// ============================================
// app/[locale]/admin/role-permissions/page.tsx
// ============================================

import RolePermissionsPage from '@/src/presentation/pages/admin/role-permissions/RolePermissionsPage';

export default function RolePermissionsRoute() {
  return <RolePermissionsPage />;
}

export const metadata = {
  title: 'Permisos por Rol - Admin',
  description: 'Matriz de permisos Roles × Rutas',
};