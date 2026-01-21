// ============================================
// src/presentation/features/translation-keys/components/EditKeyModal.tsx
// ✅ MEJORADO: Select de Categoría + Validaciones
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Loader2 } from 'lucide-react';
import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { useCategoriesManager } from '@/src/presentation/features/translation-categories/hooks/useCategoriesManager';

interface EditKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateKeyData) => Promise<void>;
  translationKey: TranslationKey | null;
}

interface UpdateKeyData {
  keyName?: string;
  categoryId?: string;
  description?: string;
  context?: string;
  defaultValue?: string;
  isActive?: boolean;
}

export function EditKeyModal({ isOpen, onClose, onUpdate, translationKey }: EditKeyModalProps) {
  const { categories, loading: loadingCategories } = useCategoriesManager();
  
  const [formData, setFormData] = useState<UpdateKeyData>({
    keyName: '',
    categoryId: '',
    description: '',
    context: '',
    defaultValue: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && translationKey) {
      setFormData({
        keyName: translationKey.keyName,
        categoryId: translationKey.categoryId || '',
        description: translationKey.description || '',
        context: translationKey.context || '',
        defaultValue: translationKey.defaultValue || '',
        isActive: translationKey.isActive,
      });
    }
  }, [isOpen, translationKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!translationKey) {
      alert('No se ha seleccionado una clave');
      return;
    }

    if (!formData.keyName || !formData.keyName.trim()) {
      alert('El nombre de la clave es requerido');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(translationKey.id, {
        keyName: formData.keyName.trim(),
        categoryId: formData.categoryId || undefined,
        description: formData.description?.trim() || undefined,
        context: formData.context?.trim() || undefined,
        defaultValue: formData.defaultValue?.trim() || undefined,
        isActive: formData.isActive,
      });
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !translationKey) return null;

  if (loadingCategories) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-center h-40">
              <Loader2 size={32} className="animate-spin text-amber-600" />
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

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Key size={28} className="text-amber-600" />
              Editar Clave de Traducción
            </h2>
            <p className="text-gray-600 mt-1">Actualiza la información de la clave existente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Namespace (Solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Namespace <span className="text-gray-500 font-normal">(No editable)</span>
              </label>
              <input
                type="text"
                value={translationKey.namespaceSlug}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Nombre de la clave */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Clave *
              </label>
              <input
                type="text"
                value={formData.keyName}
                onChange={(e) => setFormData(prev => ({ ...prev, keyName: e.target.value }))}
                placeholder="welcome_message"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
                Full key: <span className="text-amber-600">{translationKey.namespaceSlug}.{formData.keyName}</span>
              </p>
            </div>

            {/* Selector de Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría <span className="text-gray-500 font-normal">(Opcional)</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">-- Sin categoría --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mensaje de bienvenida mostrado en la página principal..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* Contexto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contexto
              </label>
              <input
                type="text"
                value={formData.context}
                onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                placeholder="Navbar, Login page, Dashboard header..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Valor por defecto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor por Defecto
              </label>
              <input
                type="text"
                value={formData.defaultValue}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                placeholder="Welcome!"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            {/* Info de traducciones */}
            {translationKey.translationCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 Esta clave tiene <strong>{translationKey.translationCount}</strong> traducción(es) asociada(s)
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.keyName}
                className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-amber-600/30 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Actualizando...
                  </span>
                ) : (
                  'Actualizar Clave'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}