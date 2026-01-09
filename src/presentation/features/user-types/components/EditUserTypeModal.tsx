// ============================================
// src/presentation/features/user-types/components/EditUserTypeModal.tsx
// ✅ USANDO COMPONENTE REUTILIZABLE
// ============================================

import { UserType } from '@/src/core/domain/entities/UserType';
import { EditModal } from '@/src/presentation/components/shared/Modals';

interface EditUserTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: { name: string; description: string | null }) => Promise<void>;
  userType: UserType | null;
}

export function EditUserTypeModal({ 
  isOpen, 
  onClose, 
  onUpdate, 
  userType 
}: EditUserTypeModalProps) {
  if (!userType) return null;

  const handleSubmit = async (formData: Record<string, any>) => {
    await onUpdate(userType.id, {
      name: formData.name,
      description: formData.description || null,
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Editar Tipo de Usuario"
      submitButtonText="Actualizar"
      submitButtonColor="amber"
      fields={[
        {
          name: 'id',
          label: 'ID',
          type: 'number',
          value: userType.id,
          disabled: true,
        },
        {
          name: 'name',
          label: 'Nombre',
          type: 'text',
          value: userType.name,
          required: true,
          minLength: 3,
          maxLength: 50,
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: userType.description || '',
          rows: 3,
          maxLength: 500,
        },
      ]}
    />
  );
}