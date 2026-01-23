// ============================================
// src/presentation/features/route-permissions/components/PermissionCard.tsx
// Component: Permission Card
// ============================================

'use client';

import React from 'react';
import { RoutePermission } from '@/src/core/domain/entities/RoutePermission';
import { Shield, Route, Globe, Trash2 } from 'lucide-react';

interface PermissionCardProps {
  permission: RoutePermission;
  onDelete?: (permission: RoutePermission) => void;
}

export function PermissionCard({ permission, onDelete }: PermissionCardProps) {
  return (
    <div className={`p-4 rounded-lg border-2 ${permission.isActive ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-300 opacity-60'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-gray-900">{permission.roleDisplayName || permission.roleName}</span>
        </div>
        {permission.appliesToAllLanguages() ? (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">ALL</span>
        ) : (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">{permission.languageCode?.toUpperCase()}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Route className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">{permission.routePath || permission.routeName || permission.routeId}</span>
      </div>

      {onDelete && (
        <button onClick={() => onDelete(permission)} className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      )}
    </div>
  );
}
