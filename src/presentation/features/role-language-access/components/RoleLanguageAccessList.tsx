// ============================================
// src/presentation/features/role-language-access/components/RoleLanguageAccessList.tsx
// ============================================

'use client';

import React, { useState, useMemo } from 'react';
import { RoleLanguageAccess } from '@/src/core/domain/entities/RoleLanguageAccess';
import { RoleLanguageAccessCard } from './RoleLanguageAccessCard';
import { Search, Plus, Filter } from 'lucide-react';

interface RoleLanguageAccessListProps {
  accesses: RoleLanguageAccess[];
  loading?: boolean;
  onOpenCreate?: () => void;
  onDelete?: (access: RoleLanguageAccess) => void;
  onToggleActive?: (access: RoleLanguageAccess) => void;
}

export function RoleLanguageAccessList({ accesses, loading, onOpenCreate, onDelete, onToggleActive }: RoleLanguageAccessListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  const filtered = useMemo(() => {
    return accesses.filter((access) => {
      const matchesSearch =
        access.getRoleDisplay().toLowerCase().includes(searchTerm.toLowerCase()) ||
        access.getLanguageDisplay().toLowerCase().includes(searchTerm.toLowerCase()) ||
        access.languageCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLanguage = filterLanguage === 'all' || access.languageCode === filterLanguage;

      const matchesActive =
        filterActive === 'all' ||
        (filterActive === 'active' && access.isAccessActive()) ||
        (filterActive === 'inactive' && !access.isAccessActive());

      return matchesSearch && matchesLanguage && matchesActive;
    });
  }, [accesses, searchTerm, filterLanguage, filterActive]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Role Language Access ({filtered.length})</h2>
        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Grant Access
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by role or language..."
            className="w-full pl-12 pr-4 py-3 border-2 rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="pl-10 pr-4 py-3 border-2 rounded-lg appearance-none bg-white"
            >
              <option value="all">All Languages</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 French</option>
              <option value="it">🇮🇹 Italian</option>
            </select>
          </div>

          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-3 border-2 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-600">
            {searchTerm || filterLanguage !== 'all' || filterActive !== 'all'
              ? 'No access records match your filters'
              : 'No language access granted yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((access) => (
            <RoleLanguageAccessCard
              key={access.id}
              access={access}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
