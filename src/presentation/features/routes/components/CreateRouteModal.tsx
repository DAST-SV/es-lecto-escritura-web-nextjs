// ============================================
// src/presentation/features/routes/components/CreateRouteModal.tsx
// ✅ CORREGIDO: Solo campos necesarios
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

    await onCreate({
      pathname: formData.pathname,
      displayName: formData.displayName,
      description: formData.description || null,
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
          label: 'Pathname (ruta física)',
          type: 'text',
          value: '',
          required: true,
          placeholder: '/library (debe empezar con /)',
        },
        {
          name: 'displayName',
          label: 'Nombre para mostrar',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'Biblioteca',
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          value: '',
          rows: 2,
          placeholder: 'Descripción de la ruta',
        },
        // Traducciones ES
        {
          name: 'translationEs',
          label: '🇪🇸 Ruta en Español',
          type: 'text',
          value: '',
          placeholder: '/biblioteca',
        },
        {
          name: 'translationEsName',
          label: '🇪🇸 Nombre en Español',
          type: 'text',
          value: '',
          placeholder: 'Biblioteca',
        },
        // Traducciones EN
        {
          name: 'translationEn',
          label: '🇺🇸 Ruta en Inglés',
          type: 'text',
          value: '',
          placeholder: '/library',
        },
        {
          name: 'translationEnName',
          label: '🇺🇸 Nombre en Inglés',
          type: 'text',
          value: '',
          placeholder: 'Library',
        },
        // Traducciones FR
        {
          name: 'translationFr',
          label: '🇫🇷 Ruta en Francés',
          type: 'text',
          value: '',
          placeholder: '/bibliotheque',
        },
        {
          name: 'translationFrName',
          label: '🇫🇷 Nombre en Francés',
          type: 'text',
          value: '',
          placeholder: 'Bibliothèque',
        },
      ]}
    />
  );
}