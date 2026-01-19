// ============================================
// app/[locale]/admin/page.tsx
// ✅ DASHBOARD PROFESIONAL - TODO con claves de traducción
// ============================================

'use client';

import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { AdminCard } from '@/src/presentation/features/admin/components';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

export default function AdminPage() {
  const { t: tDashboard, loading: loadingDashboard } = useSupabaseTranslations('admin.dashboard');
  const { t: tWorkflow, loading: loadingWorkflow } = useSupabaseTranslations('admin.dashboard.workflow');

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            {loadingDashboard ? (
              <>
                <div className="h-10 bg-gray-200 rounded w-2/3 mx-auto mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {tDashboard('title')}
                </h1>
                <p className="text-lg text-gray-600">
                  {tDashboard('subtitle')}
                </p>
              </>
            )}
          </div>

          {/* Flujo recomendado */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
            {loadingWorkflow ? (
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            ) : (
              <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                {tWorkflow('title')}
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {/* Preparación */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                {loadingWorkflow ? (
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                ) : (
                  <div className="font-bold text-blue-900 mb-2">
                    1️⃣ {tWorkflow('preparation.title')}
                  </div>
                )}
                <ul className="space-y-1 text-gray-700">
                  {loadingWorkflow ? (
                    <>
                      <li className="h-3 bg-gray-100 rounded w-full animate-pulse"></li>
                      <li className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></li>
                    </>
                  ) : (
                    <>
                      <li>• {tWorkflow('preparation.step1')}</li>
                      <li>• {tWorkflow('preparation.step2')}</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Configuración */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                {loadingWorkflow ? (
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                ) : (
                  <div className="font-bold text-green-900 mb-2">
                    2️⃣ {tWorkflow('configuration.title')}
                  </div>
                )}
                <ul className="space-y-1 text-gray-700">
                  {loadingWorkflow ? (
                    <>
                      <li className="h-3 bg-gray-100 rounded w-full animate-pulse"></li>
                      <li className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></li>
                    </>
                  ) : (
                    <>
                      <li>• {tWorkflow('configuration.step1')}</li>
                      <li>• {tWorkflow('configuration.step2')}</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Asignación */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                {loadingWorkflow ? (
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                ) : (
                  <div className="font-bold text-purple-900 mb-2">
                    3️⃣ {tWorkflow('assignment.title')}
                  </div>
                )}
                <ul className="space-y-1 text-gray-700">
                  {loadingWorkflow ? (
                    <>
                      <li className="h-3 bg-gray-100 rounded w-full animate-pulse"></li>
                      <li className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></li>
                    </>
                  ) : (
                    <>
                      <li>• {tWorkflow('assignment.step1')}</li>
                      <li>• {tWorkflow('assignment.step2')}</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Grid de Módulos RBAC - Workflow Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <AdminCard moduleKey="route_scanner" number="1" />
            <AdminCard moduleKey="route_translations" number="2" />
            <AdminCard moduleKey="roles" number="3" />
            <AdminCard moduleKey="role_permissions" number="4" />
            <AdminCard moduleKey="user_roles" number="5" />
            <AdminCard moduleKey="user_permissions" number="6" />
          </div>

          {/* Módulos de Sistema */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {tDashboard('system_modules.title') || 'Módulos de Sistema'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AdminCard moduleKey="organizations" />
              <AdminCard moduleKey="organization_members" />
              <AdminCard moduleKey="user_profiles" />
              <AdminCard moduleKey="user_types" />
              <AdminCard moduleKey="user_relationships" />
              <AdminCard moduleKey="role_language_access" />
            </div>
          </div>

          {/* Módulos de Contenido */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {tDashboard('content_modules.title') || 'Gestión de Contenido'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AdminCard moduleKey="books" />
              <AdminCard moduleKey="translations" />
              <AdminCard moduleKey="translation_keys" />
            </div>
          </div>

          {/* Herramientas Adicionales */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {tDashboard('tools.title') || 'Herramientas Adicionales'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AdminCard moduleKey="users" />
              <AdminCard moduleKey="audit" />
            </div>
          </div>

        </div>
      </div>
    </RouteGuard>
  );
}
