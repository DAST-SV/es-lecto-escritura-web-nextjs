// ============================================
// TranslateKeyModal.tsx
// ⭐ MODAL MÁS IMPORTANTE - Traducir múltiples idiomas
// ============================================

'use client';

import React, { useState } from 'react';
import { X, Languages, Plus, Trash2 } from 'lucide-react';
import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';

interface TranslateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranslate: (data: TranslateKeyData) => Promise<void>;
  availableKeys: TranslationKey[];
}

interface TranslateKeyData {
  namespaceSlug: string;
  translationKey: string;
  translations: Array<{
    languageCode: string;
    value: string;
  }>;
}

const AVAILABLE_LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export function TranslateKeyModal({ isOpen, onClose, onTranslate, availableKeys }: TranslateKeyModalProps) {
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [translations, setTranslations] = useState<Array<{ languageCode: string; value: string }>>([
    { languageCode: 'es', value: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedKey = availableKeys.find(k => k.id === selectedKeyId);

  const addLanguage = () => {
    const usedLanguages = new Set(translations.map(t => t.languageCode));
    const availableToAdd = AVAILABLE_LANGUAGES.find(lang => !usedLanguages.has(lang.code));
    
    if (availableToAdd) {
      setTranslations([...translations, { languageCode: availableToAdd.code, value: '' }]);
    }
  };

  const removeLanguage = (index: number) => {
    if (translations.length > 1) {
      setTranslations(translations.filter((_, i) => i !== index));
    }
  };

  const updateLanguage = (index: number, languageCode: string) => {
    const newTranslations = [...translations];
    newTranslations[index] = { ...newTranslations[index], languageCode };
    setTranslations(newTranslations);
  };

  const updateValue = (index: number, value: string) => {
    const newTranslations = [...translations];
    newTranslations[index] = { ...newTranslations[index], value };
    setTranslations(newTranslations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedKeyId) {
      alert('Selecciona una clave');
      return;
    }

    if (!selectedKey) {
      alert('Error: clave no encontrada');
      return;
    }

    const validTranslations = translations.filter(t => t.value.trim());
    if (validTranslations.length === 0) {
      alert('Agrega al menos una traducción');
      return;
    }

    setIsSubmitting(true);
    try {
      await onTranslate({
        namespaceSlug: selectedKey.namespaceSlug,
        translationKey: selectedKey.keyName,
        translations: validTranslations,
      });

      // Reset
      setSelectedKeyId('');
      setTranslations([{ languageCode: 'es', value: '' }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const usedLanguages = new Set(translations.map(t => t.languageCode));
  const canAddMore = usedLanguages.size < AVAILABLE_LANGUAGES.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Languages size={28} className="text-blue-600" />
              Traducir Clave
            </h2>
            <p className="text-gray-600 mt-1">Traduce una clave a múltiples idiomas simultáneamente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar Clave */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Clave *
              </label>
              <select
                value={selectedKeyId}
                onChange={(e) => setSelectedKeyId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Selecciona una clave --</option>
                {availableKeys.map(key => (
                  <option key={key.id} value={key.id}>
                    {key.namespaceSlug}.{key.keyName}
                  </option>
                ))}
              </select>
              {selectedKey && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  📝 {selectedKey.description || 'Sin descripción'}
                </p>
              )}
            </div>

            {/* Traducciones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Traducciones *
                </label>
                <button
                  type="button"
                  onClick={addLanguage}
                  disabled={!canAddMore}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                  Agregar idioma
                </button>
              </div>

              <div className="space-y-3">
                {translations.map((translation, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                    {/* Selector de idioma */}
                    <div className="w-48">
                      <select
                        value={translation.languageCode}
                        onChange={(e) => updateLanguage(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {AVAILABLE_LANGUAGES.map(lang => (
                          <option 
                            key={lang.code} 
                            value={lang.code}
                            disabled={usedLanguages.has(lang.code) && translation.languageCode !== lang.code}
                          >
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Input de traducción */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={translation.value}
                        onChange={(e) => updateValue(index, e.target.value)}
                        placeholder="Escribe la traducción..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Botón eliminar */}
                    {translations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar idioma"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-2 text-sm text-gray-500">
                💡 Puedes agregar traducciones para {AVAILABLE_LANGUAGES.length} idiomas diferentes
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedKeyId}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/30"
              >
                {isSubmitting ? 'Guardando...' : `Crear ${translations.filter(t => t.value).length} Traducción(es)`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}