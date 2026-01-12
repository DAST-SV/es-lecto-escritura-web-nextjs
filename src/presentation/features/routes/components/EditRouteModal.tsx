// ============================================
// src/presentation/features/routes/components/EditRouteModal.tsx
// ✅ CORREGIDO: Solo campos que existen en Route
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
    const translations = [];
    
    if (formData.translationEs) {
      translations.push({
        languageCode: 'es',
        translatedPath: formData.translationEs,
        translatedName: formData.translationEsName || formData.displayName,
      });
    }
    
    if (formData.translationEn) {
      translations.push({
        languageCode: 'en',
        translatedPath: formData.translationEn,
        translatedName: formData.translationEnName || formData.displayName,
      });
    }
    
    if (formData.translationFr) {
      translations.push({
        languageCode: 'fr',
        translatedPath: formData.translationFr,
        translatedName: formData.translationFrName || formData.displayName,
      });
    }

    await onUpdate(route.id, {
      pathname: formData.pathname,
      displayName: formData.displayName,
      description: formData.description || null,
      isActive: formData.isActive === 'true',
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
          label: 'Pathname (ruta física)',
          type: 'text',
          value: route.pathname,
          required: true,
          placeholder: '/library',
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
          name: 'isActive',
          label: 'Estado',
          type: 'select',
          value: route.isActive ? 'true' : 'false',
          options: [
            { value: 'true', label: 'Activa' },
            { value: 'false', label: 'Inactiva' },
          ],
        },
        // Traducciones ES
        {
          name: 'translationEs',
          label: '🇪🇸 Ruta en Español',
          type: 'text',
          value: esTranslation?.translatedPath || '',
          placeholder: '/biblioteca',
        },
        {
          name: 'translationEsName',
          label: '🇪🇸 Nombre en Español',
          type: 'text',
          value: esTranslation?.translatedName || '',
          placeholder: 'Biblioteca',
        },
        // Traducciones EN
        {
          name: 'translationEn',
          label: '🇺🇸 Ruta en Inglés',
          type: 'text',
          value: enTranslation?.translatedPath || '',
          placeholder: '/library',
        },
        {
          name: 'translationEnName',
          label: '🇺🇸 Nombre en Inglés',
          type: 'text',
          value: enTranslation?.translatedName || '',
          placeholder: 'Library',
        },
        // Traducciones FR
        {
          name: 'translationFr',
          label: '🇫🇷 Ruta en Francés',
          type: 'text',
          value: frTranslation?.translatedPath || '',
          placeholder: '/bibliotheque',
        },
        {
          name: 'translationFrName',
          label: '🇫🇷 Nombre en Francés',
          type: 'text',
          value: frTranslation?.translatedName || '',
          placeholder: 'Bibliothèque',
        },
      ]}
    />
  );
}