// app/[locale]/admin/page.tsx

import Link from 'next/link';
import { RouteGuard } from '@/src/presentation/components/RouteGuard';

export default function AdminPage() {
  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-lg text-gray-600">
              Sistema de gestión de rutas, permisos y usuarios
            </p>
          </div>

          {/* Grid de Módulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Gestión de Rutas */}
            <AdminCard
              title="🗺️ Gestión de Rutas"
              description="Crear, editar y eliminar rutas del sistema"
              href="/admin/routes"
              badge="Script 03"
            />

            {/* 2. Traducciones */}
            <AdminCard
              title="🌍 Traducciones de Rutas"
              description="Traducir rutas a diferentes idiomas"
              href="/admin/route-translations"
              badge="Script 04"
            />

            {/* 3. Buscar Usuarios */}
            <AdminCard
              title="👤 Buscar Usuarios"
              description="Buscar usuarios por email y ver información"
              href="/admin/users"
              badge="Script 10"
            />

            {/* 4. Permisos por Rol */}
            <AdminCard
              title="🔐 Permisos por Rol"
              description="Asignar rutas a cada rol del sistema"
              href="/admin/role-permissions"
              badge="Script 06"
            />

            {/* 5. Asignar Roles */}
            <AdminCard
              title="👥 Asignar Roles"
              description="Asignar roles a usuarios específicos"
              href="/admin/user-roles"
              badge="Script 05"
            />

            {/* 6. Permisos Individuales */}
            <AdminCard
              title="⚡ Permisos Individuales"
              description="Dar o bloquear acceso específico (GRANT/DENY)"
              href="/admin/user-permissions"
              badge="Script 07"
            />
          </div>

          {/* Info */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ℹ️ Orden de Uso Recomendado
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Crear rutas en el sistema</li>
              <li>Traducir rutas a diferentes idiomas (opcional)</li>
              <li>Asignar rutas a roles (qué puede hacer cada cargo)</li>
              <li>Asignar roles a usuarios (qué cargo tiene cada persona)</li>
              <li>Permisos individuales (casos especiales: GRANT/DENY)</li>
            </ol>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}

interface AdminCardProps {
  title: string;
  description: string;
  href: string;
  badge: string;
}

function AdminCard({ title, description, href, badge }: AdminCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border border-gray-200 h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
            {badge}
          </span>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
        <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
          Abrir módulo
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}