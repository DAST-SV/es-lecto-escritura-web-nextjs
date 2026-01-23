// ============================================
// app/[locale]/admin/translation-keys/page.tsx
// ✅ CORREGIDO: Tipos explícitos
// ============================================

'use client';

import React, { useState } from 'react';
import { useTranslationKeys } from '@/src/presentation/features/translation-keys/hooks/useTranslationKeys';
import {
  CreateKeyModal,
  EditKeyModal,
  DeleteKeyModal,
} from '@/src/presentation/features/translation-keys/components';
import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { Loader2, AlertCircle, Plus, Search, Filter, Edit2, Trash2, Key } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function TranslationKeysPage() {
  const {
    keys,
    loading,
    error,
    createKey,
    updateKey,
    deleteKey,
    refresh,
  } = useTranslationKeys();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<TranslationKey | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenEdit = (key: TranslationKey) => {
    setSelectedKey(key);
    setShowEditModal(true);
  };

  const handleOpenDelete = (key: TranslationKey) => {
    setSelectedKey(key);
    setShowDeleteModal(true);
  };

  // ✅ CORRECCIÓN: Tipo explícito para data
  const handleCreate = async (data: {
    namespaceSlug: string;
    keyName: string;
    categoryId?: string;
    description?: string;
    context?: string;
    defaultValue?: string;
    isSystemKey?: boolean;
  }) => {
    try {
      await createKey(data);
      toast.success('Clave creada exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear clave');
      throw err;
    }
  };

  // ✅ CORRECCIÓN: Tipo explícito para data
  const handleUpdate = async (id: string, data: {
    keyName?: string;
    categoryId?: string;
    description?: string;
    context?: string;
    defaultValue?: string;
    isActive?: boolean;
  }) => {
    try {
      await updateKey(id, data);
      toast.success('Clave actualizada exitosamente');
      setShowEditModal(false);
      setSelectedKey(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar clave');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteKey(id);
      toast.success('Clave eliminada exitosamente');
      setShowDeleteModal(false);
      setSelectedKey(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar clave');
      throw err;
    }
  };

  const filteredKeys = keys.filter(key =>
    key.keyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.namespaceSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (key.description && key.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && keys.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando claves...</p>
        </div>
      </div>
    );
  }

  if (error && keys.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Claves de Traducción</h2>
          <p className="text-gray-600 mt-1">Gestiona las claves únicas del sistema</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nueva Clave
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar claves..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Namespace</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clave</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Traducciones</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredKeys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron claves
                </td>
              </tr>
            ) : (
              filteredKeys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                      {key.namespaceSlug}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Key size={14} className="text-gray-400" />
                      <code className="text-sm font-mono text-gray-900">{key.keyName}</code>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {key.categoryName ? (
                      <span className="text-sm text-gray-600">{key.categoryName}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Sin categoría</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{key.description || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {key.translationCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(key)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(key)}
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
      <CreateKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <EditKeyModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedKey(null);
        }}
        onUpdate={handleUpdate}
        translationKey={selectedKey}
      />

      <DeleteKeyModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedKey(null);
        }}
        onDelete={handleDelete}
        translationKey={selectedKey}
      />
    </div>
  );
}