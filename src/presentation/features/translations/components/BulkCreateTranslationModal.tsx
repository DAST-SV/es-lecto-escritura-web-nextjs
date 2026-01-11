// ============================================
// src/presentation/features/translations/components/BulkCreateTranslationModal.tsx
// Modal: Crear traducciones en lote (COLOR CORREGIDO)
// ============================================

import { EditModal } from '@/src/presentation/components/shared/Modals';

interface BulkCreateTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

export function BulkCreateTranslationModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: BulkCreateTranslationModalProps) {
  const handleSubmit = async (formData: Record<string, any>) => {
    const translations = [];
    
    if (formData.valueEs) {
      translations.push({
        languageCode: 'es',
        value: formData.valueEs,
      });
    }
    
    if (formData.valueEn) {
      translations.push({
        languageCode: 'en',
        value: formData.valueEn,
      });
    }
    
    if (formData.valueFr) {
      translations.push({
        languageCode: 'fr',
        value: formData.valueFr,
      });
    }

    await onCreate({
      namespaceSlug: formData.namespaceSlug,
      translationKey: formData.translationKey,
      translations,
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Crear Traducciones (Lote)"
      submitButtonText="Crear Todas"
      submitButtonColor="blue"
      fields={[
        {
          name: 'namespaceSlug',
          label: 'Namespace',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'common',
        },
        {
          name: 'translationKey',
          label: 'Clave',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'welcome',
        },
        {
          name: 'valueEs',
          label: 'Español',
          type: 'textarea',
          value: '',
          rows: 2,
          placeholder: 'Texto en español...',
        },
        {
          name: 'valueEn',
          label: 'English',
          type: 'textarea',
          value: '',
          rows: 2,
          placeholder: 'English text...',
        },
        {
          name: 'valueFr',
          label: 'Français',
          type: 'textarea',
          value: '',
          rows: 2,
          placeholder: 'Texte français...',
        },
      ]}
    />
  );
}