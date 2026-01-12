// ============================================
// src/presentation/features/routes/components/DeleteRouteModal.tsx
// ✅ CORREGIDO: Sin propiedades que no existen
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
        { label: 'Estado', value: route.isActive ? 'Activa' : 'Inactiva' },
        { label: 'Descripción', value: route.description || 'Sin descripción' },
        { label: 'Traducciones', value: `${route.translations.length} idiomas` },
      ]}
      showHardDeleteOption={true}
    />
  );
}