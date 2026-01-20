// ============================================
// src/presentation/features/route-permissions/components/PermissionsList.tsx
// Component: Permissions List
// ============================================

'use client';

import React, { useState, useMemo } from 'react';
import { RoutePermission } from '@/src/core/domain/entities/RoutePermission';
import { PermissionCard } from './PermissionCard';
import { Search, Plus } from 'lucide-react';

interface PermissionsListProps {
  permissions: RoutePermission[];
  loading?: boolean;
  onOpenCreate?: () => void;
  onDelete?: (permission: RoutePermission) => void;
}

export function PermissionsList({ permissions, loading, onOpenCreate, onDelete }: PermissionsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) =>
      p.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.roleDisplayName && p.roleDisplayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.routePath && p.routePath.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [permissions, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Route Permissions ({filteredPermissions.length})</h2>
        {onOpenCreate && (
          <button onClick={onOpenCreate} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Create Permission
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by role or route..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg"
        />
      </div>

      {filteredPermissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600">{searchTerm ? 'No permissions match your search' : 'No permissions created yet'}</p>
          {onOpenCreate && !searchTerm && (
            <button onClick={onOpenCreate} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Create First Permission</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPermissions.map((permission) => (
            <PermissionCard key={permission.id} permission={permission} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
