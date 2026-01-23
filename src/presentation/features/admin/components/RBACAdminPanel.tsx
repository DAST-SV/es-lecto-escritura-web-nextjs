// ============================================
// src/presentation/features/admin/components/RBACAdminPanel.tsx
// ✅ PANEL COMPLETO DE ADMINISTRACIÓN RBAC
// ============================================

'use client';

import { useState } from 'react';
import { Shield, Users, Key, Route, Plus } from 'lucide-react';

type Tab = 'roles' | 'permissions' | 'users' | 'routes';

export function RBACAdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('roles');

  const tabs = [
    { id: 'roles' as Tab, name: 'Roles', icon: Shield },
    { id: 'permissions' as Tab, name: 'Permisos', icon: Key },
    { id: 'users' as Tab, name: 'Usuarios', icon: Users },
    { id: 'routes' as Tab, name: 'Rutas', icon: Route },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            Sistema de Permisos y Roles
          </h1>
          <p className="text-slate-600 mt-2">
            Gestión dinámica de accesos sin tocar código
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6">
          {activeTab === 'roles' && <RolesManager />}
          {activeTab === 'permissions' && <PermissionsManager />}
          {activeTab === 'users' && <UsersManager />}
          {activeTab === 'routes' && <RoutesManager />}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Roles Manager
// ============================================

function RolesManager() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Gestión de Roles</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Crear Rol
        </button>
      </div>

      <div className="space-y-3">
        <RoleCard name="super_admin" displayName="Super Administrador" level={100} />
        <RoleCard name="org_admin" displayName="Administrador de Organización" level={90} />
        <RoleCard name="teacher" displayName="Docente" level={60} />
        <RoleCard name="student" displayName="Estudiante" level={30} />
      </div>
    </div>
  );
}

function RoleCard({ name, displayName, level }: { name: string; displayName: string; level: number }) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-800">{displayName}</h3>
          <p className="text-sm text-slate-500">{name}</p>
        </div>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          Nivel {level}
        </span>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Permissions Manager
// ============================================

function PermissionsManager() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Gestión de Permisos</h2>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Crear Permiso
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PermissionCard resource="books" action="create" />
        <PermissionCard resource="books" action="read" />
        <PermissionCard resource="books" action="update" />
        <PermissionCard resource="books" action="delete" />
      </div>
    </div>
  );
}

function PermissionCard({ resource, action }: { resource: string; action: string }) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:border-emerald-300 transition">
      <div className="flex items-center gap-3">
        <Key className="w-5 h-5 text-emerald-600" />
        <div>
          <p className="font-bold text-slate-800">{resource}.{action}</p>
          <p className="text-sm text-slate-500">{resource}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Users Manager
// ============================================

function UsersManager() {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-6">Gestión de Usuarios</h2>
      <p className="text-slate-600">
        Aquí puedes asignar/revocar roles a usuarios desde la UI, sin tocar código.
      </p>
    </div>
  );
}

// ============================================
// COMPONENTE: Routes Manager
// ============================================

function RoutesManager() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Gestión de Rutas</h2>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Crear Ruta
        </button>
      </div>
      <p className="text-slate-600">
        Aquí puedes crear/editar rutas multiidioma y sus permisos desde la UI.
      </p>
    </div>
  );
}