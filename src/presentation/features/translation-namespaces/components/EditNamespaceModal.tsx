// ============================================
// src/presentation/features/translation-namespaces/components/EditNamespaceModal.tsx
// ============================================

import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';
import { EditModal } from '@/src/presentation/components/shared/Modals';

interface EditNamespaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  namespace: TranslationNamespace | null;
}

export function EditNamespaceModal({ isOpen, onClose, onUpdate, namespace }: EditNamespaceModalProps) {
  if (!namespace) return null;

  const handleSubmit = async (formData: Record<string, any>) => {
    await onUpdate(namespace.id, {
      name: formData.name,
      description: formData.description || null,
      isActive: formData.isActive === 'true',
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Editar Namespace"
      submitButtonText="Actualizar"
      submitButtonColor="amber"
      fields={[
        {
          name: 'slug',
          label: 'Slug',
          type: 'text',
          value: namespace.slug,
          disabled: true,
        },
        {
          name: 'name',
          label: 'Nombre',
          type: 'text',
          value: namespace.name,
          required: true,
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: namespace.description || '',
          rows: 3,
        },
        {
          name: 'isActive',
          label: 'Estado',
          type: 'select',
          value: namespace.isActive ? 'true' : 'false',
          options: [
            { value: 'true', label: 'Activo' },
            { value: 'false', label: 'Inactivo' },
          ],
        },
      ]}
    />
  );
}