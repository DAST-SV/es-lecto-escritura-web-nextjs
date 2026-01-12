// ============================================
// src/presentation/features/translations/components/EditTranslationModal.tsx
// Modal: Editar traducción existente
// ============================================

import { Translation } from '@/src/core/domain/entities/Translation';
import { EditModal } from '@/src/presentation/components/shared/Modals';

interface EditTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  translation: Translation | null;
}

export function EditTranslationModal({ 
  isOpen, 
  onClose, 
  onUpdate, 
  translation 
}: EditTranslationModalProps) {
  if (!translation) return null;

  const handleSubmit = async (formData: Record<string, any>) => {
    await onUpdate(translation.id, {
      value: formData.value,
      isActive: formData.isActive === 'true',
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Editar Traducción"
      submitButtonText="Actualizar"
      submitButtonColor="amber"
      fields={[
        {
          name: 'namespaceSlug',
          label: 'Namespace',
          type: 'text',
          value: translation.namespaceSlug,
          disabled: true,
        },
        {
          name: 'keyName',
          label: 'Clave',
          type: 'text',
          value: translation.keyName,
          disabled: true,
        },
        {
          name: 'languageCode',
          label: 'Idioma',
          type: 'text',
          value: translation.languageCode.toUpperCase(),
          disabled: true,
        },
        {
          name: 'value',
          label: 'Valor',
          type: 'textarea',
          value: translation.value,
          required: true,
          rows: 3,
        },
        {
          name: 'isActive',
          label: 'Estado',
          type: 'select',
          value: translation.isActive ? 'true' : 'false',
          options: [
            { value: 'true', label: 'Activo' },
            { value: 'false', label: 'Inactivo' },
          ],
        },
      ]}
    />
  );
}