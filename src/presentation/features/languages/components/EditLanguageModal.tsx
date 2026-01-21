// ============================================
// src/presentation/features/languages/components/EditLanguageModal.tsx
// ============================================

import { Language } from '@/src/core/domain/entities/Language';
import { EditModal } from '@/src/presentation/components/shared/Modals';

interface EditLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (code: string, data: any) => Promise<void>;
  language: Language | null;
}

export function EditLanguageModal({ isOpen, onClose, onUpdate, language }: EditLanguageModalProps) {
  if (!language) return null;

  const handleSubmit = async (formData: Record<string, any>) => {
    await onUpdate(language.code, {
      name: formData.name,
      nativeName: formData.nativeName || null,
      flagEmoji: formData.flagEmoji || null,
      isDefault: formData.isDefault === 'true',
      isActive: formData.isActive === 'true',
      orderIndex: parseInt(formData.orderIndex),
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Editar Idioma"
      submitButtonText="Actualizar"
      submitButtonColor="amber"
      fields={[
        {
          name: 'code',
          label: 'Código',
          type: 'text',
          value: language.code,
          disabled: true,
        },
        {
          name: 'name',
          label: 'Nombre',
          type: 'text',
          value: language.name,
          required: true,
        },
        {
          name: 'nativeName',
          label: 'Nombre Nativo',
          type: 'text',
          value: language.nativeName || '',
        },
        {
          name: 'flagEmoji',
          label: 'Emoji de Bandera',
          type: 'text',
          value: language.flagEmoji || '',
        },
        {
          name: 'orderIndex',
          label: 'Orden',
          type: 'number',
          value: language.orderIndex.toString(),
        },
        {
          name: 'isDefault',
          label: '¿Idioma por defecto?',
          type: 'select',
          value: language.isDefault ? 'true' : 'false',
          options: [
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Sí' },
          ],
        },
        {
          name: 'isActive',
          label: 'Estado',
          type: 'select',
          value: language.isActive ? 'true' : 'false',
          options: [
            { value: 'true', label: 'Activo' },
            { value: 'false', label: 'Inactivo' },
          ],
        },
      ]}
    />
  );
}