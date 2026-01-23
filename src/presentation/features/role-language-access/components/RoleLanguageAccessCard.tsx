// ============================================
// src/presentation/features/role-language-access/components/RoleLanguageAccessCard.tsx
// ============================================

'use client';

import React from 'react';
import { RoleLanguageAccess } from '@/src/core/domain/entities/RoleLanguageAccess';
import { Shield, Globe, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface RoleLanguageAccessCardProps {
  access: RoleLanguageAccess;
  onDelete?: (access: RoleLanguageAccess) => void;
  onToggleActive?: (access: RoleLanguageAccess) => void;
}

export function RoleLanguageAccessCard({ access, onDelete, onToggleActive }: RoleLanguageAccessCardProps) {
  return (
    <div className={`p-4 rounded-lg border-2 ${access.isAccessActive() ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-300'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-sm">{access.getRoleDisplay()}</span>
        </div>
        {access.isAccessActive() ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <XCircle className="w-4 h-4 text-red-600" />
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-2xl">{access.getLanguageFlag()}</span>
        <span className="text-sm font-medium text-gray-700">{access.getLanguageDisplay()}</span>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        <p>Language: <span className="font-mono font-semibold">{access.languageCode.toUpperCase()}</span></p>
        <p>Created: {access.createdAt.toLocaleDateString()}</p>
      </div>

      <div className="flex gap-2">
        {onToggleActive && (
          <button
            onClick={() => onToggleActive(access)}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
              access.isAccessActive()
                ? 'bg-gray-500 hover:bg-gray-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {access.isAccessActive() ? 'Deactivate' : 'Activate'}
          </button>
        )}
        {onDelete && access.canBeDeleted() && (
          <button
            onClick={() => onDelete(access)}
            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
