// ============================================
// src/presentation/features/translations/components/CreateTranslationModal.tsx
// Modal: Crear nueva traducción (SIN helperText)
// ============================================

import { EditModal } from '@/src/presentation/components/shared/Modals';

interface CreateTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

export function CreateTranslationModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: CreateTranslationModalProps) {
  const handleSubmit = async (formData: Record<string, any>) => {
    await onCreate({
      namespaceSlug: formData.namespaceSlug,
      translationKey: formData.translationKey,
      languageCode: formData.languageCode,
      value: formData.value,
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Nueva Traducción"
      submitButtonText="Crear"
      submitButtonColor="blue"
      fields={[
        {
          name: 'namespaceSlug',
          label: 'Namespace (categoría)',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'common, auth, errors...',
        },
        {
          name: 'translationKey',
          label: 'Clave (identificador único)',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'welcome, login.title...',
        },
        {
          name: 'languageCode',
          label: 'Idioma',
          type: 'select',
          value: 'es',
          required: true,
          options: [
            { value: 'es', label: 'Español (es)' },
            { value: 'en', label: 'English (en)' },
            { value: 'fr', label: 'Français (fr)' },
          ],
        },
        {
          name: 'value',
          label: 'Valor',
          type: 'textarea',
          value: '',
          required: true,
          rows: 3,
          placeholder: 'Texto traducido...',
        },
      ]}
    />
  );
}