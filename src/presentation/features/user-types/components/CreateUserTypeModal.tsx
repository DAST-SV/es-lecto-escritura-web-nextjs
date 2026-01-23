// ============================================
// src/presentation/features/user-types/components/CreateUserTypeModal.tsx
// ✅ USANDO COMPONENTE REUTILIZABLE
// ============================================

import { EditModal } from '@/src/presentation/components/shared/Modals';

interface CreateUserTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description: string | null }) => Promise<void>;
}

export function CreateUserTypeModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: CreateUserTypeModalProps) {
  const handleSubmit = async (formData: Record<string, any>) => {
    await onCreate({
      name: formData.name,
      description: formData.description || null,
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Nuevo Tipo de Usuario"
      submitButtonText="Crear"
      submitButtonColor="teal"
      fields={[
        {
          name: 'name',
          label: 'Nombre',
          type: 'text',
          value: '',
          required: true,
          minLength: 3,
          maxLength: 50,
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: '',
          rows: 3,
          maxLength: 500,
        },
      ]}
    />
  );
}