// ============================================
// src/presentation/features/translations/components/DeleteTranslationModal.tsx
// Modal: Eliminar traducción
// ============================================

import { Translation } from '@/src/core/domain/entities/Translation';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals';

interface DeleteTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  translation: Translation | null;
}

export function DeleteTranslationModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  translation 
}: DeleteTranslationModalProps) {
  if (!translation) return null;

  const handleConfirm = async () => {
    await onDelete(translation.id);
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Traducción"
      itemName={translation.getFullKey()}
      itemDetails={[
        { label: 'Namespace', value: translation.namespaceSlug },
        { label: 'Clave', value: translation.translationKey },
        { label: 'Idioma', value: translation.languageCode.toUpperCase() },
        { label: 'Valor', value: translation.value },
      ]}
      showHardDeleteOption={false}
    />
  );
}