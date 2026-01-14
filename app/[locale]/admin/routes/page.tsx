// ============================================
// app/[locale]/admin/routes/page.tsx
// SERVER COMPONENT - Escanea rutas reales
// ============================================

import RoutesPage from '@/src/presentation/pages/admin/routes/RoutesPage';

export default function RoutesRoute() {
  return <RoutesPage />;
}

export const metadata = {
  title: 'Gestión de Rutas - Admin',
  description: 'Administración de rutas del sistema',
};