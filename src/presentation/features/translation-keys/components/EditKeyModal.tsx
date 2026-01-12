// ============================================
// src/presentation/features/translation-keys/components/EditKeyModal.tsx
// ============================================

import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { EditModal } from '@/src/presentation/components/shared/Modals';

interface EditKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  translationKey: TranslationKey | null;
}

export function EditKeyModal({ isOpen, onClose, onUpdate, translationKey }: EditKeyModalProps) {
  if (!translationKey) return null;

  const handleSubmit = async (formData: Record<string, any>) => {
    await onUpdate(translationKey.id, {
      keyName: formData.keyName,
      categoryId: formData.categoryId || null,
      description: formData.description || null,
      context: formData.context || null,
      defaultValue: formData.defaultValue || null,
      isActive: formData.isActive === 'true',
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Editar Clave de Traducción"
      submitButtonText="Actualizar"
      submitButtonColor="amber"
      fields={[
        {
          name: 'namespaceSlug',
          label: 'Namespace',
          type: 'text',
          value: translationKey.namespaceSlug,
          disabled: true,
        },
        {
          name: 'keyName',
          label: 'Nombre de la clave',
          type: 'text',
          value: translationKey.keyName,
          required: true,
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: translationKey.description || '',
          rows: 2,
        },
        {
          name: 'context',
          label: 'Contexto',
          type: 'text',
          value: translationKey.context || '',
        },
        {
          name: 'defaultValue',
          label: 'Valor por defecto',
          type: 'text',
          value: translationKey.defaultValue || '',
        },
        {
          name: 'isActive',
          label: 'Estado',
          type: 'select',
          value: translationKey.isActive ? 'true' : 'false',
          options: [
            { value: 'true', label: 'Activo' },
            { value: 'false', label: 'Inactivo' },
          ],
        },
      ]}
    />
  );
}