// ============================================
// app/[locale]/admin/user-relationships/page.tsx
// Admin page for managing user relationships
// ============================================

'use client';

import { useState } from 'react';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { useUserRelationships } from '@/src/presentation/features/user-relationships/hooks/useUserRelationships';
import {
  RelationshipsList,
  CreateRelationshipModal,
} from '@/src/presentation/features/user-relationships/components';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { useEffect, useState as useReactState } from 'react';

export default function UserRelationshipsPage() {
  const { t, loading: loadingTranslations } = useSupabaseTranslations('admin.user_relationships');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    relationships,
    pendingApprovals,
    loading,
    error,
    createRelationship,
    approveRelationship,
    removeRelationship,
    refresh,
  } = useUserRelationships();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const handleCreateRelationship = async (dto: any) => {
    await createRelationship(dto);
  };

  const handleApproveRelationship = async (relationshipId: string) => {
    if (!currentUserId) return;
    await approveRelationship(relationshipId, currentUserId);
  };

  const handleRemoveRelationship = async (relationshipId: string) => {
    if (!currentUserId) return;
    if (window.confirm(loadingTranslations ? '¿Está seguro de que desea remover esta relación?' : t('confirm.remove_message'))) {
      await removeRelationship(relationshipId, currentUserId);
    }
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                {loadingTranslations ? (
                  <>
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {t('page.title')}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                      {t('page.description')}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {loadingTranslations ? 'Crear Relación' : t('page.create_button')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Relationships */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {loadingTranslations ? 'Total Relaciones' : t('stats.total_relationships')}
                  </p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{relationships.length}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {loadingTranslations ? 'Pendientes de Aprobación' : t('stats.pending_approvals')}
                  </p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-gray-900">{pendingApprovals.length}</p>
                      {pendingApprovals.length > 0 && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {loadingTranslations ? 'Requiere atención' : t('stats.requires_attention')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Approved Relationships */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {loadingTranslations ? 'Relaciones Aprobadas' : t('stats.approved_relationships')}
                  </p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {relationships.filter(r => r.isApproved).length}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={refresh}
                    className="inline-flex text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    {loadingTranslations ? 'Reintentar' : t('error.retry')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Relationships List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <RelationshipsList
              relationships={relationships}
              loading={loading}
              currentUserId={currentUserId}
              onApprove={handleApproveRelationship}
              onRemove={handleRemoveRelationship}
            />
          </div>
        </div>
      </div>

      {/* Create Relationship Modal */}
      <CreateRelationshipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRelationship}
        currentUserId={currentUserId}
      />
    </RouteGuard>
  );
}
