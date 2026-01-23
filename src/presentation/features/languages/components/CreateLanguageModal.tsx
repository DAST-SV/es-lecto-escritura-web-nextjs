// ============================================
// src/presentation/features/languages/components/CreateLanguageModal.tsx
// ============================================

import { EditModal } from '@/src/presentation/components/shared/Modals';

interface CreateLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

export function CreateLanguageModal({ isOpen, onClose, onCreate }: CreateLanguageModalProps) {
  const handleSubmit = async (formData: Record<string, any>) => {
    await onCreate({
      code: formData.code,
      name: formData.name,
      nativeName: formData.nativeName || null,
      flagEmoji: formData.flagEmoji || null,
      isDefault: formData.isDefault === 'true',
      isActive: formData.isActive === 'true',
      orderIndex: parseInt(formData.orderIndex) || 0,
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Nuevo Idioma"
      submitButtonText="Crear"
      submitButtonColor="blue"
      fields={[
        {
          name: 'code',
          label: 'Código',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'es, en, fr...',
        },
        {
          name: 'name',
          label: 'Nombre',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'Spanish, English...',
        },
        {
          name: 'nativeName',
          label: 'Nombre Nativo',
          type: 'text',
          value: '',
          placeholder: 'Español, English...',
        },
        {
          name: 'flagEmoji',
          label: 'Emoji de Bandera',
          type: 'text',
          value: '',
          placeholder: '🇪🇸, 🇬🇧, 🇫🇷...',
        },
        {
          name: 'orderIndex',
          label: 'Orden',
          type: 'number',
          value: '0',
          placeholder: '0, 1, 2...',
        },
        {
          name: 'isDefault',
          label: '¿Idioma por defecto?',
          type: 'select',
          value: 'false',
          options: [
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Sí' },
          ],
        },
        {
          name: 'isActive',
          label: 'Estado',
          type: 'select',
          value: 'true',
          options: [
            { value: 'true', label: 'Activo' },
            { value: 'false', label: 'Inactivo' },
          ],
        },
      ]}
    />
  );
}