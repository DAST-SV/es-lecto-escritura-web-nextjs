// ============================================
// src/presentation/features/user-relationships/components/RelationshipsList.tsx
// List component with tabs for displaying relationships
// ============================================

'use client';

import { useState, useMemo } from 'react';
import { UserRelationship } from '@/src/core/domain/entities/UserRelationship';
import { RelationshipCard } from './RelationshipCard';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface RelationshipsListProps {
  relationships: UserRelationship[];
  loading?: boolean;
  currentUserId: string;
  onApprove?: (relationshipId: string) => void;
  onRemove?: (relationshipId: string) => void;
}

type TabType = 'all' | 'pending' | 'approved';

export function RelationshipsList({
  relationships,
  loading = false,
  currentUserId,
  onApprove,
  onRemove,
}: RelationshipsListProps) {
  const { t, loading: loadingTranslations } = useSupabaseTranslations('admin.user_relationships');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredRelationships = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return relationships.filter(r => r.isPending());
      case 'approved':
        return relationships.filter(r => r.isApproved);
      case 'all':
      default:
        return relationships;
    }
  }, [relationships, activeTab]);

  const counts = useMemo(() => ({
    all: relationships.length,
    pending: relationships.filter(r => r.isPending()).length,
    approved: relationships.filter(r => r.isApproved).length,
  }), [relationships]);

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: loadingTranslations ? 'Todas' : t('tabs.all'), count: counts.all },
    { key: 'pending', label: loadingTranslations ? 'Pendientes' : t('tabs.pending'), count: counts.pending },
    { key: 'approved', label: loadingTranslations ? 'Aprobadas' : t('tabs.approved'), count: counts.approved },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              <span
                className={`
                  ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
                  ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-900'
                  }
                `}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Empty State */}
      {filteredRelationships.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {loadingTranslations ? 'No hay relaciones' : t('empty.title')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'pending'
              ? (loadingTranslations ? 'No hay relaciones pendientes de aprobación.' : t('empty.no_pending'))
              : activeTab === 'approved'
              ? (loadingTranslations ? 'No hay relaciones aprobadas aún.' : t('empty.no_approved'))
              : (loadingTranslations ? 'Comienza creando una nueva relación.' : t('empty.get_started'))}
          </p>
        </div>
      )}

      {/* Relationships Grid */}
      {filteredRelationships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRelationships.map((relationship) => (
            <RelationshipCard
              key={relationship.id}
              relationship={relationship}
              currentUserId={currentUserId}
              onApprove={onApprove}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredRelationships.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500 text-center">
            {loadingTranslations ? 'Mostrando' : t('summary.showing')}{' '}
            <span className="font-medium text-gray-900">{filteredRelationships.length}</span>{' '}
            {activeTab === 'all'
              ? (loadingTranslations ? 'relaciones' : t('summary.relationships'))
              : activeTab === 'pending'
              ? (loadingTranslations ? 'relaciones pendientes' : t('summary.pending_relationships'))
              : (loadingTranslations ? 'relaciones aprobadas' : t('summary.approved_relationships'))}
          </p>
        </div>
      )}
    </div>
  );
}
