// ============================================
// app/[locale]/admin/languages/page.tsx
// ✅ CRUD COMPLETO: Gestión de Idiomas
// ============================================

'use client';

import React, { useState } from 'react';
import { useLanguagesManager } from '@/src/presentation/features/languages/hooks/useLanguagesManager';
import {
  CreateLanguageModal,
  EditLanguageModal,
  DeleteLanguageModal,
} from '@/src/presentation/features/languages/components';
import { Language } from '@/src/core/domain/entities/Language';
import { Loader2, AlertCircle, Plus, Search, Edit2, Trash2, Globe } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function LanguagesPage() {
  const {
    languages,
    loading,
    error,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    refresh,
  } = useLanguagesManager();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenEdit = (language: Language) => {
    setSelectedLanguage(language);
    setShowEditModal(true);
  };

  const handleOpenDelete = (language: Language) => {
    setSelectedLanguage(language);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createLanguage(data);
      toast.success('Idioma creado exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear idioma');
      throw err;
    }
  };

  const handleUpdate = async (code: string, data: any) => {
    try {
      await updateLanguage(code, data);
      toast.success('Idioma actualizado exitosamente');
      setShowEditModal(false);
      setSelectedLanguage(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar idioma');
      throw err;
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await deleteLanguage(code);
      toast.success('Idioma eliminado exitosamente');
      setShowDeleteModal(false);
      setSelectedLanguage(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar idioma');
      throw err;
    }
  };

  const filteredLanguages = languages.filter(lang =>
    lang.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lang.nativeName && lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && languages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando idiomas...</p>
        </div>
      </div>
    );
  }

  if (error && languages.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Idiomas</h2>
          <p className="text-gray-600 mt-1">Gestiona los idiomas disponibles en el sistema</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo Idioma
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar idiomas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Nativo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Bandera</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Por Defecto</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLanguages.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron idiomas
                </td>
              </tr>
            ) : (
              filteredLanguages.map((language) => (
                <tr key={language.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono font-semibold">
                      {language.code.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{language.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{language.nativeName || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-2xl">{language.flagEmoji || '🏳️'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {language.isDefault ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✓ Por Defecto
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {language.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(language)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(language)}
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
      <CreateLanguageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <EditLanguageModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLanguage(null);
        }}
        onUpdate={handleUpdate}
        language={selectedLanguage}
      />

      <DeleteLanguageModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedLanguage(null);
        }}
        onDelete={handleDelete}
        language={selectedLanguage}
      />
    </div>
  );
}