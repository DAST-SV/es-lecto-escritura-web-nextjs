// ============================================
// src/presentation/features/routes/components/CreateRouteModal.tsx
// Modal: Crear nueva ruta (SIN helperText)
// ============================================

import { EditModal } from '@/src/presentation/components/shared/Modals';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

export function CreateRouteModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: CreateRouteModalProps) {
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

    await onCreate({
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

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Nueva Ruta"
      submitButtonText="Crear"
      submitButtonColor="blue"
      fields={[
        {
          name: 'pathname',
          label: 'Pathname (base)',
          type: 'text',
          value: '',
          required: true,
          placeholder: '/books (debe empezar con /)',
        },
        {
          name: 'displayName',
          label: 'Nombre para mostrar',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'Books',
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: '',
          rows: 2,
          placeholder: 'Descripción de la ruta',
        },
        {
          name: 'icon',
          label: 'Icono (Lucide)',
          type: 'text',
          value: '',
          placeholder: 'BookOpen, Users, Settings...',
        },
        {
          name: 'isPublic',
          label: '¿Es pública?',
          type: 'select',
          value: 'false',
          options: [
            { value: 'false', label: 'No (requiere login)' },
            { value: 'true', label: 'Sí (acceso público)' },
          ],
        },
        {
          name: 'requiresPermissions',
          label: 'Permisos requeridos (separados por comas)',
          type: 'text',
          value: '',
          placeholder: 'books.read, books.create',
        },
        {
          name: 'showInMenu',
          label: '¿Mostrar en menú?',
          type: 'select',
          value: 'true',
          options: [
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ],
        },
        {
          name: 'menuOrder',
          label: 'Orden en menú',
          type: 'number',
          value: 0,
          min: 0,
        },
        // Traducciones
        {
          name: 'translationEs',
          label: 'Ruta en Español',
          type: 'text',
          value: '',
          placeholder: '/libros',
        },
        {
          name: 'translationEsName',
          label: 'Nombre en Español',
          type: 'text',
          value: '',
          placeholder: 'Libros',
        },
        {
          name: 'translationEn',
          label: 'Ruta en Inglés',
          type: 'text',
          value: '',
          placeholder: '/books',
        },
        {
          name: 'translationEnName',
          label: 'Nombre en Inglés',
          type: 'text',
          value: '',
          placeholder: 'Books',
        },
        {
          name: 'translationFr',
          label: 'Ruta en Francés',
          type: 'text',
          value: '',
          placeholder: '/livres',
        },
        {
          name: 'translationFrName',
          label: 'Nombre en Francés',
          type: 'text',
          value: '',
          placeholder: 'Livres',
        },
      ]}
    />
  );
}