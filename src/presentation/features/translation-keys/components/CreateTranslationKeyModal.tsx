// ============================================
// CreateTranslationKeyModal.tsx
// Modal profesional para crear claves de traducción
// ============================================

'use client';

import React, { useState } from 'react';
import { X, Key, Loader2 } from 'lucide-react';
import { useTranslationNamespaces } from '@/src/presentation/hooks/useTranslationNamespaces';

interface CreateTranslationKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateKeyData) => Promise<void>;
}

interface CreateKeyData {
  namespaceSlug: string;
  keyName: string;
  description?: string;
  context?: string;
}

export function CreateTranslationKeyModal({ isOpen, onClose, onCreate }: CreateTranslationKeyModalProps) {
  const { namespaces, loading: loadingNamespaces } = useTranslationNamespaces();
  const [formData, setFormData] = useState<CreateKeyData>({
    namespaceSlug: '',
    keyName: '',
    description: '',
    context: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.namespaceSlug || !formData.keyName) {
      alert('Namespace y nombre de clave son requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(formData);

      // Reset
      setFormData({
        namespaceSlug: '',
        keyName: '',
        description: '',
        context: '',
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateKeyData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  if (loadingNamespaces) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
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

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Key size={28} className="text-blue-600" />
              Crear Clave de Traducción
            </h2>
            <p className="text-gray-600 mt-1">Define una nueva clave para ser traducida a múltiples idiomas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Selector de Namespace */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Namespace *
                <span className="text-gray-500 font-normal ml-1">(Módulo al que pertenece)</span>
              </label>
              <select
                value={formData.namespaceSlug}
                onChange={(e) => handleChange('namespaceSlug', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Selecciona un namespace --</option>
                {namespaces.map(ns => (
                  <option key={ns.id} value={ns.slug}>
                    {ns.name} ({ns.slug}) {ns.translationCount ? `- ${ns.translationCount} traducciones` : ''}
                  </option>
                ))}
              </select>
              {formData.namespaceSlug && (
                <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  📦 {namespaces.find(ns => ns.slug === formData.namespaceSlug)?.description || 'Sin descripción'}
                </p>
              )}
            </div>

            {/* Nombre de la clave */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Clave *
                <span className="text-gray-500 font-normal ml-1">(e.g., "welcome_message", "btn_submit")</span>
              </label>
              <input
                type="text"
                value={formData.keyName}
                onChange={(e) => handleChange('keyName', e.target.value)}
                placeholder="welcome_message"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.namespaceSlug && formData.keyName && (
                <p className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
                  Preview: <span className="text-blue-600">{formData.namespaceSlug}.{formData.keyName}</span>
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
                <span className="text-gray-500 font-normal ml-1">(Explica el propósito de esta clave)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mensaje de bienvenida mostrado en la página principal..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Contexto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contexto
                <span className="text-gray-500 font-normal ml-1">(Dónde se usa esta traducción)</span>
              </label>
              <input
                type="text"
                value={formData.context}
                onChange={(e) => handleChange('context', e.target.value)}
                placeholder="Navbar, Login page, Dashboard header..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
                disabled={isSubmitting || !formData.namespaceSlug || !formData.keyName}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/30 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Creando...
                  </span>
                ) : (
                  'Crear Clave'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
