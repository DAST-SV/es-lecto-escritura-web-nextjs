// ============================================
// src/presentation/features/roles/components/RoleCard.tsx
// Component: Role Card
// ============================================

'use client';

import React from 'react';
import { Role } from '@/src/core/domain/entities/Role';
import { Shield, Edit2, Trash2, CheckCircle, XCircle, Lock } from 'lucide-react';

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  onToggleActive?: (role: Role) => void;
}

export function RoleCard({ role, onEdit, onDelete, onToggleActive }: RoleCardProps) {
  return (
    <div className={`
      p-6 rounded-xl border-2 transition-all
      ${role.isActive
        ? 'bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-lg'
        : 'bg-gray-50 border-gray-300 opacity-60'
      }
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${role.isSystemRole
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
              : 'bg-gradient-to-br from-blue-500 to-cyan-600'
            }
          `}>
            {role.isSystemRole ? (
              <Lock className="w-6 h-6 text-white" />
            ) : (
              <Shield className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {role.displayName}
              {role.isSystemRole && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                  System
                </span>
              )}
              {!role.isActive && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                  Inactive
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 font-mono">{role.name}</p>
          </div>
        </div>

        {/* Status Icon */}
        {role.isActive ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <XCircle className="w-6 h-6 text-red-500" />
        )}
      </div>

      {/* Description */}
      {role.description && (
        <p className="text-gray-700 mb-4 text-sm leading-relaxed">
          {role.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-xs font-medium text-blue-700">
            Level: {role.hierarchyLevel}
          </span>
        </div>
        <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="text-xs font-medium text-gray-700">
            Created: {role.createdAt.toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {onEdit && (
          <button
            onClick={() => onEdit(role)}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}

        {onToggleActive && (
          <button
            onClick={() => onToggleActive(role)}
            disabled={role.isSystemRole}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-colors
              ${role.isSystemRole
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : role.isActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }
            `}
          >
            {role.isActive ? 'Deactivate' : 'Activate'}
          </button>
        )}

        {onDelete && !role.isSystemRole && (
          <button
            onClick={() => onDelete(role)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
