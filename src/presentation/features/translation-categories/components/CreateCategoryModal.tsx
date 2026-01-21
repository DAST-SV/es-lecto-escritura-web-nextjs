// ============================================
// src/presentation/features/translation-categories/components/CreateCategoryModal.tsx
// ============================================

import { EditModal } from '@/src/presentation/components/shared/Modals';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

export function CreateCategoryModal({ isOpen, onClose, onCreate }: CreateCategoryModalProps) {
  const handleSubmit = async (formData: Record<string, any>) => {
    await onCreate({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      isActive: formData.isActive === 'true',
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Nueva Categoría"
      submitButtonText="Crear"
      submitButtonColor="blue"
      fields={[
        {
          name: 'name',
          label: 'Nombre',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'UI Elements, Forms, Messages...',
        },
        {
          name: 'slug',
          label: 'Slug',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'ui-elements, forms, messages...',
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: '',
          rows: 3,
          placeholder: 'Descripción de la categoría...',
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