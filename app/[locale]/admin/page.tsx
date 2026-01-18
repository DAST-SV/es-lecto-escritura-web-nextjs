// app/[locale]/admin/page.tsx
// ✅ DASHBOARD CON ORDEN LÓGICO (6 MÓDULOS)

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
              Panel de Administración RBAC
            </h1>
            <p className="text-lg text-gray-600">
              Sistema de control de acceso basado en roles
            </p>
          </div>

          {/* Flujo recomendado */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Flujo Recomendado (Sigue este orden)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <div className="font-bold text-blue-900 mb-2">1️⃣ Preparación</div>
                <ul className="space-y-1 text-gray-700">
                  <li>• Escanear rutas del sistema</li>
                  <li>• Traducir rutas a idiomas</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                <div className="font-bold text-green-900 mb-2">2️⃣ Configuración</div>
                <ul className="space-y-1 text-gray-700">
                  <li>• Crear roles necesarios</li>
                  <li>• Asignar rutas a roles</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                <div className="font-bold text-purple-900 mb-2">3️⃣ Asignación</div>
                <ul className="space-y-1 text-gray-700">
                  <li>• Asignar roles a usuarios</li>
                  <li>• Permisos individuales</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Grid de Módulos EN ORDEN */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* MÓDULO 1 */}
            <AdminCard
              number="1"
              title="🔍 Escanear Rutas"
              description="Detecta automáticamente todas las rutas en app/[locale]/*/page.tsx"
              href="/admin/route-scanner"
              color="blue"
            />

            {/* MÓDULO 2 */}
            <AdminCard
              number="2"
              title="🌍 Traducir Rutas"
              description="Traduce rutas a ES, EN, FR, IT para rutas internacionales"
              href="/admin/route-translations"
              color="blue"
            />

            {/* MÓDULO 3 */}
            <AdminCard
              number="3"
              title="👥 Gestionar Roles"
              description="Crear, editar y administrar roles del sistema"
              href="/admin/roles"
              color="green"
            />

            {/* MÓDULO 4 */}
            <AdminCard
              number="4"
              title="🔐 Permisos por Rol"
              description="Asigna múltiples rutas a cada rol (define qué puede hacer cada cargo)"
              href="/admin/role-permissions"
              color="green"
            />

            {/* MÓDULO 5 */}
            <AdminCard
              number="5"
              title="👤 Asignar Roles a Usuarios"
              description="Busca usuarios y asígnales roles específicos"
              href="/admin/user-roles"
              color="purple"
            />

            {/* MÓDULO 6 */}
            <AdminCard
              number="6"
              title="⚡ Permisos Individuales"
              description="GRANT/DENY rutas específicas a usuarios (casos especiales)"
              href="/admin/user-permissions"
              color="purple"
            />

          </div>

          {/* Módulos adicionales */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Herramientas Adicionales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <AdminCard
                number=""
                title="🔍 Buscar Usuarios"
                description="Busca cualquier usuario por email y ve su información"
                href="/admin/users"
                color="gray"
              />

              <AdminCard
                number=""
                title="📚 Gestión de Libros"
                description="Administrar libros del sistema"
                href="/admin/books"
                color="gray"
              />

              <AdminCard
                number=""
                title="🔎 Auditoría"
                description="Registro de cambios y accesos del sistema"
                href="/admin/audit"
                color="gray"
              />

            </div>
          </div>

        </div>
      </div>
    </RouteGuard>
  );
}

// ============================================
// Componente AdminCard con colores
// ============================================

interface AdminCardProps {
  number: string;
  title: string;
  description: string;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'gray';
}

function AdminCard({ number, title, description, href, color }: AdminCardProps) {
  const colors = {
    blue: 'border-blue-200 hover:border-blue-400 bg-blue-50/50',
    green: 'border-green-200 hover:border-green-400 bg-green-50/50',
    purple: 'border-purple-200 hover:border-purple-400 bg-purple-50/50',
    gray: 'border-gray-200 hover:border-gray-400 bg-gray-50/50',
  };

  const badgeColors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <Link href={href}>
      <div className={`${colors[color]} bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 h-full`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {title}
          </h3>
          {number && (
            <span className={`${badgeColors[color]} text-sm font-bold px-3 py-1 rounded-full`}>
              {number}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-4">
          {description}
        </p>
        <div className="flex items-center text-indigo-600 text-sm font-medium">
          Abrir módulo
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}