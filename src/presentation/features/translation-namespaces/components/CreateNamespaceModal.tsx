// ============================================
// src/presentation/features/translation-namespaces/components/CreateNamespaceModal.tsx
// ============================================

import { EditModal } from '@/src/presentation/components/shared/Modals';

interface CreateNamespaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

export function CreateNamespaceModal({ isOpen, onClose, onCreate }: CreateNamespaceModalProps) {
  const handleSubmit = async (formData: Record<string, any>) => {
    await onCreate({
      slug: formData.slug,
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
      title="Nuevo Namespace"
      submitButtonText="Crear"
      submitButtonColor="blue"
      fields={[
        {
          name: 'slug',
          label: 'Slug',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'common, auth, admin...',
        },
        {
          name: 'name',
          label: 'Nombre',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'Common Translations, Authentication...',
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: '',
          rows: 3,
          placeholder: 'Descripción del namespace...',
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