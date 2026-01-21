// ============================================
// src/presentation/features/translation-namespaces/components/DeleteNamespaceModal.tsx
// ============================================

import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals';

interface DeleteNamespaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  namespace: TranslationNamespace | null;
}

export function DeleteNamespaceModal({ isOpen, onClose, onDelete, namespace }: DeleteNamespaceModalProps) {
  if (!namespace) return null;

  const handleConfirm = async () => {
    await onDelete(namespace.id);
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Namespace"
      itemName={namespace.name}
      itemDetails={[
        { label: 'Slug', value: namespace.slug },
        { label: 'Nombre', value: namespace.name },
        { label: 'Descripción', value: namespace.description || 'Sin descripción' },
        { label: 'Traducciones', value: `${namespace.translationCount || 0}` },
        { label: 'Estado', value: namespace.isActive ? 'Activo' : 'Inactivo' },
      ]}
      showHardDeleteOption={false}
    />
  );
}