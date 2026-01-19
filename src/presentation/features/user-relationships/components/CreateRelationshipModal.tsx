// ============================================
// src/presentation/features/user-relationships/components/CreateRelationshipModal.tsx
// Modal for creating a new user relationship
// ============================================

'use client';

import { useState } from 'react';
import { RelationshipType } from '@/src/core/domain/entities/UserRelationship';
import { CreateUserRelationshipDTO } from '@/src/core/application/use-cases/user-relationships';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface CreateRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (dto: CreateUserRelationshipDTO) => Promise<void>;
  currentUserId: string;
}

export function CreateRelationshipModal({
  isOpen,
  onClose,
  onCreate,
  currentUserId,
}: CreateRelationshipModalProps) {
  const { t, loading: loadingTranslations } = useSupabaseTranslations('admin.user_relationships');
  const [formData, setFormData] = useState<CreateUserRelationshipDTO>({
    parentUserId: currentUserId,
    childUserId: '',
    relationshipType: 'parent' as RelationshipType,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const relationshipTypes: { value: RelationshipType; label: string }[] = [
    { value: 'parent', label: 'Padre/Madre' },
    { value: 'tutor', label: 'Tutor' },
    { value: 'teacher', label: 'Profesor' },
    { value: 'guardian', label: 'Guardián' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onCreate(formData);
      // Reset form
      setFormData({
        parentUserId: currentUserId,
        childUserId: '',
        relationshipType: 'parent' as RelationshipType,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating relationship');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setFormData({
        parentUserId: currentUserId,
        childUserId: '',
        relationshipType: 'parent' as RelationshipType,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-white px-6 pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {loadingTranslations ? 'Crear Nueva Relación' : t('modal.create_title')}
              </h3>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Parent User ID */}
              <div>
                <label htmlFor="parentUserId" className="block text-sm font-medium text-gray-700 mb-1">
                  {loadingTranslations ? 'ID Usuario Padre' : t('modal.parent_user_id')}
                </label>
                <input
                  type="text"
                  id="parentUserId"
                  value={formData.parentUserId}
                  onChange={(e) => setFormData({ ...formData, parentUserId: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="UUID del usuario padre"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {loadingTranslations ? 'Usuario que crea la relación (padre, tutor, etc.)' : t('modal.parent_user_hint')}
                </p>
              </div>

              {/* Child User ID */}
              <div>
                <label htmlFor="childUserId" className="block text-sm font-medium text-gray-700 mb-1">
                  {loadingTranslations ? 'ID Usuario Hijo' : t('modal.child_user_id')}
                </label>
                <input
                  type="text"
                  id="childUserId"
                  value={formData.childUserId}
                  onChange={(e) => setFormData({ ...formData, childUserId: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="UUID del usuario hijo"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {loadingTranslations ? 'Usuario relacionado (estudiante, hijo, etc.)' : t('modal.child_user_hint')}
                </p>
              </div>

              {/* Relationship Type */}
              <div>
                <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-1">
                  {loadingTranslations ? 'Tipo de Relación' : t('modal.relationship_type')}
                </label>
                <select
                  id="relationshipType"
                  value={formData.relationshipType}
                  onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value as RelationshipType })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  {relationshipTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {loadingTranslations
                        ? 'La relación se creará en estado pendiente y requerirá aprobación.'
                        : t('modal.info_message')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingTranslations ? 'Cancelar' : t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.childUserId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? (loadingTranslations ? 'Creando...' : t('modal.creating'))
                    : (loadingTranslations ? 'Crear Relación' : t('modal.create'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
