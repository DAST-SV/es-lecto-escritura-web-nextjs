// ============================================
// src/presentation/features/translation-categories/components/DeleteCategoryModal.tsx
// ============================================

import { TranslationCategory } from '@/src/core/domain/entities/TranslationCategory';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  category: TranslationCategory | null;
}

export function DeleteCategoryModal({ isOpen, onClose, onDelete, category }: DeleteCategoryModalProps) {
  if (!category) return null;

  const handleConfirm = async () => {
    await onDelete(category.id);
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Categoría"
      itemName={category.name}
      itemDetails={[
        { label: 'Nombre', value: category.name },
        { label: 'Slug', value: category.slug },
        { label: 'Descripción', value: category.description || 'Sin descripción' },
        { label: 'Estado', value: category.isActive ? 'Activo' : 'Inactivo' },
      ]}
      showHardDeleteOption={false}
    />
  );
}