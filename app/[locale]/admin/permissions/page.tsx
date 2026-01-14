// ============================================
// app/[locale]/admin/permissions/page.tsx
// ============================================

import UserPermissionsPage from '@/src/presentation/pages/admin/permissions/UserPermissionsPage';

export default function UserPermissionsRoute() {
  return <UserPermissionsPage />;
}

export const metadata = {
  title: 'Permisos de Usuarios - Admin',
  description: 'Gestión de permisos individuales GRANT/DENY',
};