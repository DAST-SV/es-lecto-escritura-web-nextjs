// ============================================
// app/[locale]/admin/role-language-access/page.tsx
// Admin Page: Role Language Access
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { useRoleLanguageAccess } from '@/src/presentation/features/role-language-access/hooks/useRoleLanguageAccess';
import { RoleLanguageAccessList, CreateRoleLanguageAccessForm } from '@/src/presentation/features/role-language-access/components';
import { RoleLanguageAccess } from '@/src/core/domain/entities/RoleLanguageAccess';
import { CreateRoleLanguageAccessDTO } from '@/src/core/domain/repositories/IRoleLanguageAccessRepository';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Globe, Languages, CheckCircle, XCircle } from 'lucide-react';

export default function RoleLanguageAccessPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { accesses, loading, error, createAccess, deleteAccess, activateAccess, deactivateAccess, refresh } = useRoleLanguageAccess();
  const [showForm, setShowForm] = useState(false);
  const [roles, setRoles] = useState<Array<{ name: string; displayName: string }>>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data: rolesData } = await supabase.schema('app').from('roles').select('name, display_name').eq('is_active', true);
      if (rolesData) setRoles(rolesData.map((r: any) => ({ name: r.name, displayName: r.display_name })));
    };
    init();
  }, []);

  const handleCreate = async (data: CreateRoleLanguageAccessDTO) => {
    try {
      await createAccess(data);
      setShowForm(false);
      alert('Language access granted successfully!');
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (access: RoleLanguageAccess) => {
    if (!confirm(`Remove ${access.getLanguageDisplay()} access for ${access.getRoleDisplay()}?`)) return;
    try {
      await deleteAccess(access.id);
      alert('Language access removed!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (access: RoleLanguageAccess) => {
    try {
      if (access.isAccessActive()) {
        await deactivateAccess(access.id);
        alert('Language access deactivated!');
      } else {
        await activateAccess(access.id);
        alert('Language access activated!');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const activeAccesses = accesses.filter((a) => a.isAccessActive());
  const inactiveAccesses = accesses.filter((a) => !a.isAccessActive());

  // Group by language
  const languageCounts = accesses
    .filter((a) => a.isAccessActive())
    .reduce((acc, access) => {
      acc[access.languageCode] = (acc[access.languageCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Languages className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Role Language Access</h1>
                <p className="text-slate-600 mt-1">Configure which languages each role can access</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200 text-blue-700">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6" />
                <div>
                  <p className="text-sm font-medium opacity-80">Total Access</p>
                  <p className="text-3xl font-bold">{accesses.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-700">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <p className="text-sm font-medium opacity-80">Active</p>
                  <p className="text-3xl font-bold">{activeAccesses.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-gray-50 border-gray-200 text-gray-700">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6" />
                <div>
                  <p className="text-sm font-medium opacity-80">Inactive</p>
                  <p className="text-3xl font-bold">{inactiveAccesses.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-purple-50 border-purple-200 text-purple-700">
              <div className="flex items-center gap-3">
                <Languages className="w-6 h-6" />
                <div>
                  <p className="text-sm font-medium opacity-80">Languages</p>
                  <p className="text-3xl font-bold">{Object.keys(languageCounts).length}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={refresh} className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold">
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : showForm ? (
            <div className="max-w-2xl mx-auto">
              <CreateRoleLanguageAccessForm
                roles={roles}
                currentUserId={currentUserId}
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </div>
          ) : (
            <RoleLanguageAccessList
              accesses={accesses}
              loading={loading}
              onOpenCreate={() => setShowForm(true)}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
