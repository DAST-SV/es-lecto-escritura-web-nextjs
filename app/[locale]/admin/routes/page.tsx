// ============================================
// app/[locale]/admin/routes/page.tsx
// SERVER COMPONENT - Escanea rutas reales
// ============================================

import { scanSystemRoutes } from '@/src/lib/route-scanner';
import RoutesPageClient from './client';

export default function RoutesPage() {
  // Escanear rutas reales del sistema
  const systemRoutes = scanSystemRoutes();

  // Pasar al componente cliente
  return <RoutesPageClient systemRoutes={systemRoutes} />;
}