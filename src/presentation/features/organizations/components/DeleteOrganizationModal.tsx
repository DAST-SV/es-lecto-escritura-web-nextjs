// ============================================
// src/presentation/features/organizations/components/DeleteOrganizationModal.tsx
// ✅ USANDO COMPONENTE REUTILIZABLE
// ============================================

import { Organization } from '@/src/core/domain/entities/Organization';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals';

interface DeleteOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string, hardDelete: boolean) => Promise<void>;
  organization: Organization | null;
  userId: string;
}

export function DeleteOrganizationModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  organization,
  userId 
}: DeleteOrganizationModalProps) {
  if (!organization) return null;

  const handleConfirm = async (hardDelete: boolean) => {
    await onDelete(organization.id, hardDelete);
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Organización"
      itemName={organization.name}
      itemDetails={[
        { label: 'Slug', value: `@${organization.slug}` },
      ]}
      showHardDeleteOption={true}
    />
  );
}