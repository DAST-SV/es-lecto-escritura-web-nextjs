// ============================================
// src/presentation/features/translation-keys/components/CreateKeyModal.tsx
// ============================================

import { EditModal } from '@/src/presentation/components/shared/Modals';

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

export function CreateKeyModal({ isOpen, onClose, onCreate }: CreateKeyModalProps) {
  const handleSubmit = async (formData: Record<string, any>) => {
    await onCreate({
      namespaceSlug: formData.namespaceSlug,
      keyName: formData.keyName,
      categoryId: formData.categoryId || null,
      description: formData.description || null,
      context: formData.context || null,
      defaultValue: formData.defaultValue || null,
      isSystemKey: formData.isSystemKey === 'true',
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Nueva Clave de Traducción"
      submitButtonText="Crear"
      submitButtonColor="blue"
      fields={[
        {
          name: 'namespaceSlug',
          label: 'Namespace',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'common, auth, errors...',
        },
        {
          name: 'keyName',
          label: 'Nombre de la clave',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'welcome, login.title...',
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: '',
          rows: 2,
          placeholder: 'Descripción de la clave...',
        },
        {
          name: 'context',
          label: 'Contexto',
          type: 'text',
          value: '',
          placeholder: 'Contexto de uso...',
        },
        {
          name: 'defaultValue',
          label: 'Valor por defecto',
          type: 'text',
          value: '',
          placeholder: 'Valor por defecto...',
        },
        {
          name: 'isSystemKey',
          label: '¿Es clave del sistema?',
          type: 'select',
          value: 'false',
          options: [
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Sí' },
          ],
        },
      ]}
    />
  );
}