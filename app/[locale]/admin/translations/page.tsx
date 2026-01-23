// ============================================
// app/[locale]/admin/translations/page.tsx
// ✅ CORREGIDO: Usar createBulkTranslations
// ============================================

'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/src/presentation/features/translations/hooks/useTranslations';
import { useTranslationKeys } from '@/src/presentation/features/translation-keys/hooks/useTranslationKeys';
import {
  TranslateKeyModal,
  EditTranslationModal,
  DeleteTranslationModal,
} from '@/src/presentation/features/translations/components';
import { Translation } from '@/src/core/domain/entities/Translation';
import { Loader2, AlertCircle, Plus, Search, Languages, Edit2, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function TranslationsPage() {
  // ✅ CORRECCIÓN: Usar createBulkTranslations en lugar de createTranslations
  const { translations, loading, error, createBulkTranslations, updateTranslation, deleteTranslation, refresh } = useTranslations();
  const { keys } = useTranslationKeys();

  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  const handleOpenEdit = (translation: Translation) => {
    setSelectedTranslation(translation);
    setShowEditModal(true);
  };

  const handleOpenDelete = (translation: Translation) => {
    setSelectedTranslation(translation);
    setShowDeleteModal(true);
  };

  // ✅ CORRECCIÓN: Usar createBulkTranslations
  const handleTranslate = async (data: any) => {
    try {
      await createBulkTranslations(data);
      toast.success('Traducciones creadas exitosamente');
      setShowTranslateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear traducciones');
      throw err;
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateTranslation(id, data);
      toast.success('Traducción actualizada exitosamente');
      setShowEditModal(false);
      setSelectedTranslation(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar traducción');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTranslation(id);
      toast.success('Traducción eliminada exitosamente');
      setShowDeleteModal(false);
      setSelectedTranslation(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar traducción');
      throw err;
    }
  };

  const filteredTranslations = translations.filter(t => {
    const matchesSearch = 
      t.keyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.namespaceSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.value.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = filterLanguage === 'all' || t.languageCode === filterLanguage;
    
    return matchesSearch && matchesLanguage;
  });

  const languages = ['es', 'en', 'fr'];

  if (loading && translations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando traducciones...</p>
        </div>
      </div>
    );
  }

  if (error && translations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2>
        <p className="text-gray-600 mb-6 max-w-md text-center">{error}</p>
        <button onClick={refresh} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Traducciones</h2>
          <p className="text-gray-600 mt-1">Traduce claves a múltiples idiomas</p>
        </div>

        <button
          onClick={() => setShowTranslateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Traducir Clave
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar traducciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los idiomas</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Namespace</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clave</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Idioma</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Traducción</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTranslations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron traducciones
                </td>
              </tr>
            ) : (
              filteredTranslations.map((translation) => (
                <tr key={translation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                      {translation.namespaceSlug}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono text-gray-900">{translation.keyName}</code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Languages size={14} className="text-blue-500" />
                      <span className="font-semibold text-blue-600">{translation.languageCode.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-800">{translation.value}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {translation.isVerified ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✓ Verificado
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        ⏳ Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(translation)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(translation)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <TranslateKeyModal
        isOpen={showTranslateModal}
        onClose={() => setShowTranslateModal(false)}
        onTranslate={handleTranslate}
        availableKeys={keys}
      />

      <EditTranslationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTranslation(null);
        }}
        onUpdate={handleUpdate}
        translation={selectedTranslation}
      />

      <DeleteTranslationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTranslation(null);
        }}
        onDelete={handleDelete}
        translation={selectedTranslation}
      />
    </div>
  );
}