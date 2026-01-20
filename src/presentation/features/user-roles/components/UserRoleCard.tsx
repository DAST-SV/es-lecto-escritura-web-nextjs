// ============================================
// src/presentation/features/user-roles/components/UserRoleCard.tsx
// Component: UserRole Card
// ============================================

'use client';

import React from 'react';
import { UserRole } from '@/src/core/domain/entities/UserRole';
import { Shield, User, XCircle, Trash2 } from 'lucide-react';

interface UserRoleCardProps {
  userRole: UserRole;
  onRevoke?: (userRole: UserRole) => void;
  onDelete?: (userRole: UserRole) => void;
}

export function UserRoleCard({ userRole, onRevoke, onDelete }: UserRoleCardProps) {
  return (
    <div className={`p-4 rounded-lg border-2 ${userRole.isAssignmentActive() ? 'bg-white border-indigo-200' : 'bg-gray-50 border-gray-300 opacity-70'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-semibold text-gray-900">{userRole.getUserDisplay()}</p>
            <p className="text-xs text-gray-500">{userRole.userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span className="font-medium text-indigo-700">{userRole.getRoleDisplay()}</span>
        </div>
      </div>

      {userRole.notes && <p className="text-sm text-gray-600 mb-2">{userRole.notes}</p>}

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Assigned: {userRole.createdAt.toLocaleDateString()}</span>
        {userRole.revokedAt && <span className="text-red-600">Revoked: {userRole.revokedAt.toLocaleDateString()}</span>}
      </div>

      <div className="flex gap-2">
        {onRevoke && userRole.canBeRevoked() && (
          <button onClick={() => onRevoke(userRole)} className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1">
            <XCircle className="w-4 h-4" /> Revoke
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(userRole)} className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
