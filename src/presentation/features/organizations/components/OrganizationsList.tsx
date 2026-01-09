// ============================================
// src/presentation/features/organizations/components/OrganizationsList.tsx
// ✅ CORREGIDO: Importar desde entities
// ============================================

'use client';

import React, { useState } from 'react';
import { Search, Building2, Users, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import { 
  Organization, 
  OrganizationType,
  organizationTypeLabels 
} from '@/src/core/domain/entities/Organization';

interface OrganizationsListProps {
  organizations: Organization[];
  onOpenCreate: () => void;
  onOpenEdit: (org: Organization) => void;
  onOpenDelete: (org: Organization) => void;
  onViewMembers: (org: Organization) => void;
}

export function OrganizationsList({
  organizations,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onViewMembers,
}: OrganizationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<OrganizationType | 'all'>('all');

  const filteredData = organizations.filter(org => {
    const matchesSearch = 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || org.organizationType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-800">Organizaciones</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-indigo-200 bg-white focus:outline-none focus:border-indigo-400 text-sm"
              />
            </div>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as OrganizationType | 'all')}
              className="px-4 py-2 rounded-lg border border-indigo-200 bg-white text-sm font-medium text-indigo-700 focus:outline-none focus:border-indigo-400"
            >
              <option value="all">Todos los tipos</option>
              {(Object.entries(organizationTypeLabels) as [OrganizationType, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Create Button */}
            <button
              onClick={onOpenCreate}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Organización
            </button>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-400">
              {searchTerm || filterType !== 'all' 
                ? 'No se encontraron organizaciones' 
                : 'No hay organizaciones creadas'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onEdit={() => onOpenEdit(org)}
                onDelete={() => onOpenDelete(org)}
                onViewMembers={() => onViewMembers(org)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Organization Card Component
// ============================================

interface OrganizationCardProps {
  organization: Organization;
  onEdit: () => void;
  onDelete: () => void;
  onViewMembers: () => void;
}

function OrganizationCard({ organization, onEdit, onDelete, onViewMembers }: OrganizationCardProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-indigo-100 hover:border-indigo-300 transition-all p-4 shadow-sm hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-800 text-lg">{organization.name}</h3>
            {organization.isVerified && (
              <Shield className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <p className="text-xs text-slate-500">@{organization.slug}</p>
        </div>

        {/* Status Badge */}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          organization.isActive 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-slate-100 text-slate-500'
        }`}>
          {organization.isActive ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      {/* Type Badge */}
      <div className="mb-3">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
          {organizationTypeLabels[organization.organizationType]}
        </span>
      </div>

      {/* Description */}
      {organization.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {organization.description}
        </p>
      )}

      {/* Contact Info */}
      {(organization.email || organization.phone) && (
        <div className="space-y-1 mb-3 text-xs text-slate-500">
          {organization.email && <p>✉️ {organization.email}</p>}
          {organization.phone && <p>📞 {organization.phone}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={onViewMembers}
          className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
        >
          <Users className="w-3.5 h-3.5" />
          Miembros
        </button>
        <button
          onClick={onEdit}
          className="p-2 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}