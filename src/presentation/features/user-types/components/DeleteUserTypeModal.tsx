// ============================================
// src/presentation/features/user-types/components/DeleteUserTypeModal.tsx
// ✅ USANDO COMPONENTE REUTILIZABLE
// ============================================

import { UserType } from '@/src/core/domain/entities/UserType';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals';

interface DeleteUserTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number, hardDelete: boolean) => Promise<void>;
  userType: UserType | null;
}

export function DeleteUserTypeModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  userType 
}: DeleteUserTypeModalProps) {
  if (!userType) return null;

  const handleConfirm = async (hardDelete: boolean) => {
    await onDelete(userType.id, hardDelete);
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Tipo de Usuario"
      itemName={userType.name}
      itemDetails={[
        { label: 'ID', value: `#${userType.id}` },
        { label: 'Descripción', value: userType.description || 'Sin descripción' },
      ]}
      showHardDeleteOption={true}
    />
  );
}