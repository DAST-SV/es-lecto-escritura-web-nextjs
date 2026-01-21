// ============================================
// app/[locale]/admin/translation-categories/page.tsx
// ✅ CRUD COMPLETO: Gestión de Categorías de Traducción
// ============================================

'use client';

import React, { useState } from 'react';
import { useCategoriesManager } from '@/src/presentation/features/translation-categories/hooks/useCategoriesManager';
import {
  CreateCategoryModal,
  EditCategoryModal,
  DeleteCategoryModal,
} from '@/src/presentation/features/translation-categories/components';
import { TranslationCategory } from '@/src/core/domain/entities/TranslationCategory';
import { Loader2, AlertCircle, Plus, Search, Edit2, Trash2, Tag } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function TranslationCategoriesPage() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh,
  } = useCategoriesManager();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TranslationCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenEdit = (category: TranslationCategory) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleOpenDelete = (category: TranslationCategory) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createCategory(data);
      toast.success('Categoría creada exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear categoría');
      throw err;
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateCategory(id, data);
      toast.success('Categoría actualizada exitosamente');
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar categoría');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success('Categoría eliminada exitosamente');
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar categoría');
      throw err;
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Categorías de Traducción</h2>
          <p className="text-gray-600 mt-1">Organiza tus traducciones por categorías</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar categorías..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron categorías
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-mono">
                      {category.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{category.description || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {category.isActive ? (
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
                        onClick={() => handleOpenEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(category)}
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
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onUpdate={handleUpdate}
        category={selectedCategory}
      />

      <DeleteCategoryModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onDelete={handleDelete}
        category={selectedCategory}
      />
    </div>
  );
}