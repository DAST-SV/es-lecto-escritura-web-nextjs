// ============================================
// src/presentation/features/user-route-permissions/components/UserPermissionsList.tsx
// ============================================

'use client';

import React, { useState, useMemo } from 'react';
import { UserRoutePermission } from '@/src/core/domain/entities/UserRoutePermission';
import { UserPermissionCard } from './UserPermissionCard';
import { Search, Plus } from 'lucide-react';

interface UserPermissionsListProps {
  permissions: UserRoutePermission[];
  loading?: boolean;
  onOpenCreate?: () => void;
  onDelete?: (permission: UserRoutePermission) => void;
}

export function UserPermissionsList({ permissions, loading, onOpenCreate, onDelete }: UserPermissionsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return permissions.filter(p =>
      p.getUserDisplay().toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.getRouteDisplay().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [permissions, searchTerm]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Route Permissions ({filtered.length})</h2>
        {onOpenCreate && (
          <button onClick={onOpenCreate} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Create Permission
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-12 pr-4 py-3 border-2 rounded-lg" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-600">{searchTerm ? 'No permissions match your search' : 'No permissions created yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <UserPermissionCard key={p.id} permission={p} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}
