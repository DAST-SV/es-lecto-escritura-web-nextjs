// ============================================
// src/presentation/features/routes/components/EditRouteModal.tsx
// Modal: Editar ruta existente
// ============================================

import { Route } from '@/src/core/domain/entities/Route';
import { EditModal } from '@/src/presentation/components/shared/Modals';

interface EditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  route: Route | null;
}

export function EditRouteModal({ 
  isOpen, 
  onClose, 
  onUpdate, 
  route 
}: EditRouteModalProps) {
  if (!route) return null;

  const handleSubmit = async (formData: Record<string, any>) => {
    const permissions = formData.requiresPermissions
      ? formData.requiresPermissions.split(',').map((p: string) => p.trim()).filter(Boolean)
      : [];

    const translations = [];
    
    if (formData.translationEs) {
      translations.push({
        languageCode: 'es',
        translatedPath: formData.translationEs,
        translatedName: formData.translationEsName || formData.displayName,
        translatedDescription: formData.description,
      });
    }
    
    if (formData.translationEn) {
      translations.push({
        languageCode: 'en',
        translatedPath: formData.translationEn,
        translatedName: formData.translationEnName || formData.displayName,
        translatedDescription: formData.description,
      });
    }
    
    if (formData.translationFr) {
      translations.push({
        languageCode: 'fr',
        translatedPath: formData.translationFr,
        translatedName: formData.translationFrName || formData.displayName,
        translatedDescription: formData.description,
      });
    }

    await onUpdate(route.id, {
      pathname: formData.pathname,
      displayName: formData.displayName,
      description: formData.description || null,
      icon: formData.icon || null,
      isPublic: formData.isPublic === 'true',
      requiresPermissions: permissions,
      requiresAllPermissions: true,
      showInMenu: formData.showInMenu === 'true',
      menuOrder: parseInt(formData.menuOrder) || 0,
      parentRouteId: null,
      translations,
    });
  };

  const esTranslation = route.getTranslation('es');
  const enTranslation = route.getTranslation('en');
  const frTranslation = route.getTranslation('fr');

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Editar Ruta"
      submitButtonText="Actualizar"
      submitButtonColor="amber"
      fields={[
        {
          name: 'pathname',
          label: 'Pathname (base)',
          type: 'text',
          value: route.pathname,
          required: true,
          placeholder: '/books',
        },
        {
          name: 'displayName',
          label: 'Nombre para mostrar',
          type: 'text',
          value: route.displayName,
          required: true,
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: route.description || '',
          rows: 2,
        },
        {
          name: 'icon',
          label: 'Icono (Lucide React)',
          type: 'text',
          value: route.icon || '',
          placeholder: 'BookOpen',
        },
        {
          name: 'isPublic',
          label: '¿Es pública?',
          type: 'select',
          value: route.isPublic ? 'true' : 'false',
          options: [
            { value: 'false', label: 'No (requiere login)' },
            { value: 'true', label: 'Sí (acceso público)' },
          ],
        },
        {
          name: 'requiresPermissions',
          label: 'Permisos requeridos',
          type: 'text',
          value: route.requiresPermissions.join(', '),
          placeholder: 'books.read, books.create',
        },
        {
          name: 'showInMenu',
          label: '¿Mostrar en menú?',
          type: 'select',
          value: route.showInMenu ? 'true' : 'false',
          options: [
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ],
        },
        {
          name: 'menuOrder',
          label: 'Orden en menú',
          type: 'number',
          value: route.menuOrder,
          min: 0,
        },
        // Traducciones
        {
          name: 'translationEs',
          label: 'Ruta en Español',
          type: 'text',
          value: esTranslation?.translatedPath || '',
          placeholder: '/libros',
        },
        {
          name: 'translationEsName',
          label: 'Nombre en Español',
          type: 'text',
          value: esTranslation?.translatedName || '',
          placeholder: 'Libros',
        },
        {
          name: 'translationEn',
          label: 'Ruta en Inglés',
          type: 'text',
          value: enTranslation?.translatedPath || '',
          placeholder: '/books',
        },
        {
          name: 'translationEnName',
          label: 'Nombre en Inglés',
          type: 'text',
          value: enTranslation?.translatedName || '',
          placeholder: 'Books',
        },
        {
          name: 'translationFr',
          label: 'Ruta en Francés',
          type: 'text',
          value: frTranslation?.translatedPath || '',
          placeholder: '/livres',
        },
        {
          name: 'translationFrName',
          label: 'Nombre en Francés',
          type: 'text',
          value: frTranslation?.translatedName || '',
          placeholder: 'Livres',
        },
      ]}
    />
  );
}