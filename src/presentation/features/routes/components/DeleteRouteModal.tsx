// ============================================
// src/presentation/features/routes/components/DeleteRouteModal.tsx
// Modal: Eliminar ruta
// ============================================

import { Route } from '@/src/core/domain/entities/Route';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals';

interface DeleteRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string, hardDelete: boolean) => Promise<void>;
  route: Route | null;
}

export function DeleteRouteModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  route 
}: DeleteRouteModalProps) {
  if (!route) return null;

  const handleConfirm = async (hardDelete: boolean) => {
    await onDelete(route.id, hardDelete);
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Ruta"
      itemName={route.displayName}
      itemDetails={[
        { label: 'Pathname', value: route.pathname },
        { label: 'Público', value: route.isPublic ? 'Sí' : 'No' },
        { label: 'Permisos', value: route.requiresPermissions.length > 0 ? route.requiresPermissions.join(', ') : 'Ninguno' },
        { label: 'En menú', value: route.showInMenu ? 'Sí' : 'No' },
      ]}
      showHardDeleteOption={true}
    />
  );
}