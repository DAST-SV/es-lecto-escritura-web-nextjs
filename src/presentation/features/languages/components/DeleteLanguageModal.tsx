// ============================================
// src/presentation/features/languages/components/DeleteLanguageModal.tsx
// ============================================

import { Language } from '@/src/core/domain/entities/Language';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals';

interface DeleteLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (code: string) => Promise<void>;
  language: Language | null;
}

export function DeleteLanguageModal({ isOpen, onClose, onDelete, language }: DeleteLanguageModalProps) {
  if (!language) return null;

  const handleConfirm = async () => {
    await onDelete(language.code);
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Idioma"
      itemName={language.displayWithFlag}
      itemDetails={[
        { label: 'Código', value: language.code },
        { label: 'Nombre', value: language.name },
        { label: 'Nombre Nativo', value: language.nativeName || 'N/A' },
        { label: 'Por Defecto', value: language.isDefault ? 'Sí' : 'No' },
        { label: 'Estado', value: language.isActive ? 'Activo' : 'Inactivo' },
      ]}
      showHardDeleteOption={false}
    />
  );
}