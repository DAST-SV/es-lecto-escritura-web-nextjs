// ============================================
// src/presentation/features/translation-categories/components/EditCategoryModal.tsx
// ============================================

import { TranslationCategory } from '@/src/core/domain/entities/TranslationCategory';
import { EditModal } from '@/src/presentation/components/shared/Modals';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  category: TranslationCategory | null;
}

export function EditCategoryModal({ isOpen, onClose, onUpdate, category }: EditCategoryModalProps) {
  if (!category) return null;

  const handleSubmit = async (formData: Record<string, any>) => {
    await onUpdate(category.id, {
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
      title="Editar Categoría"
      submitButtonText="Actualizar"
      submitButtonColor="amber"
      fields={[
        {
          name: 'name',
          label: 'Nombre',
          type: 'text',
          value: category.name,
          required: true,
        },
        {
          name: 'slug',
          label: 'Slug',
          type: 'text',
          value: category.slug,
          required: true,
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: category.description || '',
          rows: 3,
        },
        {
          name: 'isActive',
          label: 'Estado',
          type: 'select',
          value: category.isActive ? 'true' : 'false',
          options: [
            { value: 'true', label: 'Activo' },
            { value: 'false', label: 'Inactivo' },
          ],
        },
      ]}
    />
  );
}