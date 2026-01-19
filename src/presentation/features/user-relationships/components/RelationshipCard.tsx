// ============================================
// src/presentation/features/user-relationships/components/RelationshipCard.tsx
// Card component for displaying a single relationship
// ============================================

'use client';

import { useState } from 'react';
import { UserRelationship } from '@/src/core/domain/entities/UserRelationship';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface RelationshipCardProps {
  relationship: UserRelationship;
  currentUserId: string;
  onApprove?: (relationshipId: string) => void;
  onRemove?: (relationshipId: string) => void;
}

export function RelationshipCard({
  relationship,
  currentUserId,
  onApprove,
  onRemove,
}: RelationshipCardProps) {
  const { t, loading: loadingTranslations } = useSupabaseTranslations('admin.user_relationships');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!onApprove || isProcessing) return;
    setIsProcessing(true);
    try {
      await onApprove(relationship.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove || isProcessing) return;
    setIsProcessing(true);
    try {
      await onRemove(relationship.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header with status badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${relationship.getRelationshipTypeBadgeColor()}`}>
            {relationship.getRelationshipTypeLabel()}
          </span>
        </div>
        <div>
          {relationship.isPending() ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {loadingTranslations ? 'Pendiente' : t('status.pending')}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {loadingTranslations ? 'Aprobado' : t('status.approved')}
            </span>
          )}
        </div>
      </div>

      {/* Relationship details */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
            {loadingTranslations ? 'Usuario Padre' : t('fields.parent_user')}
          </p>
          <p className="text-sm font-medium text-gray-900">{relationship.parentUserName}</p>
          <p className="text-xs text-gray-500">{relationship.parentUserEmail}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
            {loadingTranslations ? 'Usuario Hijo' : t('fields.child_user')}
          </p>
          <p className="text-sm font-medium text-gray-900">{relationship.childUserName}</p>
          <p className="text-xs text-gray-500">{relationship.childUserEmail}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="border-t border-gray-100 pt-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <p className="font-medium">{loadingTranslations ? 'Creado' : t('fields.created_at')}</p>
            <p>{new Date(relationship.createdAt).toLocaleDateString()}</p>
          </div>
          {relationship.approvedAt && (
            <div>
              <p className="font-medium">{loadingTranslations ? 'Aprobado' : t('fields.approved_at')}</p>
              <p>{new Date(relationship.approvedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!showDeleteConfirm ? (
        <div className="flex gap-2">
          {relationship.isPending() && onApprove && (
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (loadingTranslations ? 'Aprobando...' : t('actions.approving')) : (loadingTranslations ? 'Aprobar' : t('actions.approve'))}
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingTranslations ? 'Remover' : t('actions.remove')}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800 mb-3 font-medium">
            {loadingTranslations ? '¿Está seguro de que desea remover esta relación?' : t('confirm.remove_message')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRemove}
              disabled={isProcessing}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (loadingTranslations ? 'Removiendo...' : t('confirm.removing')) : (loadingTranslations ? 'Sí, remover' : t('confirm.yes_remove'))}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isProcessing}
              className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingTranslations ? 'Cancelar' : t('confirm.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
