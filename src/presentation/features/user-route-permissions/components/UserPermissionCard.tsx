// ============================================
// src/presentation/features/user-route-permissions/components/UserPermissionCard.tsx
// ============================================

'use client';

import React from 'react';
import { UserRoutePermission } from '@/src/core/domain/entities/UserRoutePermission';
import { User, Route, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

interface UserPermissionCardProps {
  permission: UserRoutePermission;
  onDelete?: (permission: UserRoutePermission) => void;
}

export function UserPermissionCard({ permission, onDelete }: UserPermissionCardProps) {
  return (
    <div className={\`p-4 rounded-lg border-2 \${permission.isGrant() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}\`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="font-semibold text-sm">{permission.getUserDisplay()}</span>
        </div>
        <span className={\`px-2 py-1 text-xs font-bold rounded \${permission.isGrant() ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}\`}>
          {permission.permissionType}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Route className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">{permission.getRouteDisplay()}</span>
      </div>

      {permission.languageCode && (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded mb-2 inline-block">
          {permission.languageCode.toUpperCase()}
        </span>
      )}

      {permission.reason && <p className="text-xs text-gray-600 mb-2">{permission.reason}</p>}

      {permission.expiresAt && (
        <div className="flex items-center gap-1 text-xs text-amber-700 mb-2">
          <Clock className="w-3 h-3" />
          Expires: {permission.expiresAt.toLocaleDateString()}
        </div>
      )}

      {onDelete && (
        <button onClick={() => onDelete(permission)} className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium flex items-center justify-center gap-1">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      )}
    </div>
  );
}
