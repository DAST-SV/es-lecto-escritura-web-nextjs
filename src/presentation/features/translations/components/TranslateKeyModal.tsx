// ============================================
// src/presentation/features/translations/components/TranslateKeyModal.tsx
// ✅ VERSION 2: Select de claves + Validaciones + Multi-idioma dinámico
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { X, Languages as LanguagesIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { useLanguages } from '@/src/presentation/hooks/useLanguages';

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

interface TranslationForm {
  languageCode: string;
  value: string;
}

export function TranslateKeyModal({ isOpen, onClose, onTranslate, availableKeys }: TranslateKeyModalProps) {
  const { languages, loading: loadingLanguages } = useLanguages();
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [translations, setTranslations] = useState<TranslationForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Inicializar con el idioma por defecto cuando se carguen los idiomas
  useEffect(() => {
    if (languages.length > 0 && translations.length === 0) {
      const defaultLang = languages.find(l => l.isDefault) || languages[0];
      setTranslations([{ languageCode: defaultLang.code, value: '' }]);
    }
  }, [languages]);

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedKeyId('');
      const defaultLang = languages.find(l => l.isDefault) || languages[0];
      setTranslations(defaultLang ? [{ languageCode: defaultLang.code, value: '' }] : []);
      setErrors([]);
    }
  }, [isOpen, languages]);

  const selectedKey = availableKeys.find(k => k.id === selectedKeyId);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!selectedKeyId) {
      newErrors.push('Debes seleccionar una clave');
    }

    const validTranslations = translations.filter(t => t.value.trim());
    if (validTranslations.length === 0) {
      newErrors.push('Debes agregar al menos una traducción con valor');
    }

    // Validar idiomas duplicados
    const languageCodes = translations.map(t => t.languageCode);
    const uniqueLanguages = new Set(languageCodes);
    if (languageCodes.length !== uniqueLanguages.size) {
      newErrors.push('No puedes tener traducciones duplicadas para el mismo idioma');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const addLanguage = () => {
    const usedLanguages = new Set(translations.map(t => t.languageCode));
    const availableToAdd = languages.find(lang => !usedLanguages.has(lang.code));

    if (availableToAdd) {
      setTranslations([...translations, { languageCode: availableToAdd.code, value: '' }]);
      setErrors([]);
    }
  };

  const removeLanguage = (index: number) => {
    if (translations.length > 1) {
      setTranslations(translations.filter((_, i) => i !== index));
      setErrors([]);
    }
  };

  const updateLanguage = (index: number, languageCode: string) => {
    const newTranslations = [...translations];
    newTranslations[index] = { ...newTranslations[index], languageCode };
    setTranslations(newTranslations);
    setErrors([]);
  };

  const updateValue = (index: number, value: string) => {
    const newTranslations = [...translations];
    newTranslations[index] = { ...newTranslations[index], value };
    setTranslations(newTranslations);
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedKey) {
      setErrors(['Error: clave no encontrada']);
      return;
    }

    const validTranslations = translations.filter(t => t.value.trim());

    setIsSubmitting(true);
    try {
      await onTranslate({
        namespaceSlug: selectedKey.namespaceSlug,
        translationKey: selectedKey.keyName,
        translations: validTranslations,
      });

      // Reset exitoso
      setSelectedKeyId('');
      const defaultLang = languages.find(l => l.isDefault) || languages[0];
      setTranslations([{ languageCode: defaultLang.code, value: '' }]);
      setErrors([]);
      
      onClose();
    } catch (error: any) {
      setErrors([error.message || 'Error al crear traducciones']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const usedLanguages = new Set(translations.map(t => t.languageCode));
  const canAddMore = usedLanguages.size < languages.length;
  const validTranslationsCount = translations.filter(t => t.value.trim()).length;

  if (!isOpen) return null;

  if (loadingLanguages) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8">
            <div className="flex items-center justify-center h-40">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LanguagesIcon size={28} className="text-blue-600" />
              Traducir Clave
            </h2>
            <p className="text-gray-600 mt-1">Traduce una clave a múltiples idiomas simultáneamente</p>
          </div>

          {/* Errores */}
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-2">❌ Errores de validación:</h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar Clave */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Clave *
              </label>
              <select
                value={selectedKeyId}
                onChange={(e) => {
                  setSelectedKeyId(e.target.value);
                  setErrors([]);
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Selecciona una clave --</option>
                {availableKeys.map(key => (
                  <option key={key.id} value={key.id}>
                    {key.namespaceSlug}.{key.keyName}
                    {key.categoryName && ` (${key.categoryName})`}
                  </option>
                ))}
              </select>
              {selectedKey && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900 mb-1">📝 {selectedKey.description || 'Sin descripción'}</p>
                  {selectedKey.context && (
                    <p className="text-gray-600">📍 Contexto: {selectedKey.context}</p>
                  )}
                  {selectedKey.defaultValue && (
                    <p className="text-gray-600 mt-1">💡 Valor por defecto: "{selectedKey.defaultValue}"</p>
                  )}
                  {selectedKey.translationCount > 0 && (
                    <p className="text-blue-600 mt-1">✅ Ya tiene {selectedKey.translationCount} traducción(es) existente(s)</p>
                  )}
                </div>
              )}
            </div>

            {/* Traducciones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Traducciones * <span className="text-gray-500 font-normal">({validTranslationsCount} completada{validTranslationsCount !== 1 ? 's' : ''})</span>
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
                {translations.map((translation, index) => {
                  const selectedLang = languages.find(l => l.code === translation.languageCode);
                  return (
                    <div key={index} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                      {/* Selector de idioma */}
                      <div className="w-48">
                        <select
                          value={translation.languageCode}
                          onChange={(e) => updateLanguage(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {languages.map(lang => (
                            <option
                              key={lang.code}
                              value={lang.code}
                              disabled={usedLanguages.has(lang.code) && translation.languageCode !== lang.code}
                            >
                              {lang.flagEmoji} {lang.displayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Input de traducción */}
                      <div className="flex-1">
                        <textarea
                          value={translation.value}
                          onChange={(e) => updateValue(index, e.target.value)}
                          placeholder={`Escribe la traducción en ${selectedLang?.displayName || 'este idioma'}...`}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        {translation.value.trim() && (
                          <p className="mt-1 text-xs text-green-600">✓ {translation.value.length} caracteres</p>
                        )}
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
                  );
                })}
              </div>

              <p className="mt-2 text-sm text-gray-500">
                💡 Puedes agregar traducciones para hasta {languages.length} idiomas diferentes. Las traducciones vacías serán ignoradas.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedKeyId || validTranslationsCount === 0}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/30"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  `Crear ${validTranslationsCount} Traducción${validTranslationsCount !== 1 ? 'es' : ''}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}