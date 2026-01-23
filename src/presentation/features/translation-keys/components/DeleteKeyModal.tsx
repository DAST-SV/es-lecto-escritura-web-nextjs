// ============================================
// src/presentation/features/translation-keys/components/DeleteKeyModal.tsx
// ============================================

import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals';

interface DeleteKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  translationKey: TranslationKey | null;
}

export function DeleteKeyModal({ isOpen, onClose, onDelete, translationKey }: DeleteKeyModalProps) {
  if (!translationKey) return null;

  const handleConfirm = async () => {
    await onDelete(translationKey.id);
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Clave de Traducción"
      itemName={`${translationKey.namespaceSlug}.${translationKey.keyName}`}
      itemDetails={[
        { label: 'Namespace', value: translationKey.namespaceSlug },
        { label: 'Clave', value: translationKey.keyName },
        { label: 'Descripción', value: translationKey.description || 'Sin descripción' },
        { label: 'Traducciones', value: `${translationKey.translationCount || 0}` },
      ]}
      showHardDeleteOption={false}
    />
  );
}