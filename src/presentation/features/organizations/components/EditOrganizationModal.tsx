// ============================================
// src/presentation/features/organizations/components/EditOrganizationModal.tsx
// ✅ USANDO COMPONENTE REUTILIZABLE
// ============================================

import { Organization, organizationTypeLabels } from '@/src/core/domain/entities/Organization';
import { EditModal } from '@/src/presentation/components/shared/Modals';

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  organization: Organization | null;
  userId: string;
}

export function EditOrganizationModal({ 
  isOpen, 
  onClose, 
  onUpdate, 
  organization,
  userId 
}: EditOrganizationModalProps) {
  if (!organization) return null;

  const handleSubmit = async (formData: Record<string, any>) => {
    await onUpdate(organization.id, {
      name: formData.name,
      description: formData.description || null,
      email: formData.email || null,
      phone: formData.phone || null,
      website: formData.website || null,
      isActive: formData.isActive,
    });
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Editar Organización"
      submitButtonText="Actualizar"
      submitButtonColor="amber"
      fields={[
        {
          name: 'id',
          label: 'ID',
          type: 'text',
          value: organization.id,
          disabled: true,
        },
        {
          name: 'type',
          label: 'Tipo',
          type: 'text',
          value: organizationTypeLabels[organization.organizationType],
          disabled: true,
        },
        {
          name: 'name',
          label: 'Nombre',
          type: 'text',
          value: organization.name,
          required: true,
          minLength: 3,
          maxLength: 200,
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: organization.description || '',
          rows: 3,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          value: organization.email || '',
        },
        {
          name: 'phone',
          label: 'Teléfono',
          type: 'tel',
          value: organization.phone || '',
        },
        {
          name: 'website',
          label: 'Sitio Web',
          type: 'url',
          value: organization.website || '',
          placeholder: 'https://...',
        },
        {
          name: 'isActive',
          label: 'Estado',
          type: 'checkbox',
          value: organization.isActive,
          placeholder: 'Organización activa',
        },
      ]}
    />
  );
}