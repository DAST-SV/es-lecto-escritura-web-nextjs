// ============================================
// src/presentation/components/shared/DataTable.tsx
// ✅ CON SELECCIÓN MÚLTIPLE Y 100VH PERFECTO
// ============================================

'use client';

import React, { useState, ReactNode } from 'react';
import { Search, Edit2, Trash2, Plus, Filter, ChevronLeft, ChevronRight, RefreshCw, Archive, ArchiveRestore, CheckSquare, Square } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface CustomAction<T> {
  label: string | ((item: T) => string);
  onClick: (item: T) => void;
  icon?: string | ((item: T) => string);
  show?: (item: T) => boolean;
  className?: string;
}

export interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onSearch?: (term: string) => T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRestore?: (item: T) => void;
  onBulkRestore?: (items: T[]) => void;
  onBulkDelete?: (items: T[]) => void;
  onCreate?: () => void;
  getItemKey: (item: T) => string | number;
  isDeleted?: (item: T) => boolean;
  showTrash?: boolean;
  /** Control externo del estado de la papelera (opcional) */
  showingTrash?: boolean;
  /** Callback cuando se cambia la vista de papelera (opcional) */
  onToggleTrash?: () => void;
  /** Acciones personalizadas por fila */
  customActions?: CustomAction<T>[];
  itemsPerPageOptions?: number[];
  emptyMessage?: string;
  createButtonText?: string;
}

export function DataTable<T>({
  title,
  data,
  columns,
  onSearch,
  onEdit,
  onDelete,
  onRestore,
  onBulkRestore,
  onBulkDelete,
  onCreate,
  getItemKey,
  isDeleted = () => false,
  showTrash = true,
  showingTrash: externalShowingTrash,
  onToggleTrash,
  customActions = [],
  itemsPerPageOptions = [10, 20, 50],
  emptyMessage = 'No se encontraron resultados',
  createButtonText = 'Nuevo',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [internalViewingTrash, setInternalViewingTrash] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

  // Usar control externo si se proporciona, sino usar interno
  const viewingTrash = externalShowingTrash !== undefined ? externalShowingTrash : internalViewingTrash;
  const setViewingTrash = onToggleTrash || (() => setInternalViewingTrash(!internalViewingTrash));

  // Filtrar por búsqueda
  const searchedData = onSearch 
    ? onSearch(searchTerm)
    : data;

  // Filtrar por papelera
  const filteredData = viewingTrash
    ? searchedData.filter(isDeleted)
    : searchedData.filter(item => !isDeleted(item));

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const toggleTrashView = () => {
    if (onToggleTrash) {
      onToggleTrash();
    } else {
      setInternalViewingTrash(!internalViewingTrash);
    }
    setCurrentPage(1);
    setSelectedItems(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === currentData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentData.map(item => getItemKey(item))));
    }
  };

  const toggleSelectItem = (key: string | number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkRestore = () => {
    if (onBulkRestore && selectedItems.size > 0) {
      const itemsToRestore = filteredData.filter(item => 
        selectedItems.has(getItemKey(item))
      );
      onBulkRestore(itemsToRestore);
      setSelectedItems(new Set());
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedItems.size > 0) {
      const itemsToDelete = filteredData.filter(item => 
        selectedItems.has(getItemKey(item))
      );
      onBulkDelete(itemsToDelete);
      setSelectedItems(new Set());
    }
  };

  const allSelected = currentData.length > 0 && selectedItems.size === currentData.length;

  return (
    <div className="flex flex-col h-full border-4 border-yellow-300 rounded-xl shadow-xl bg-white overflow-hidden">
      
      {/* Header - Altura fija */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-100 to-gray-100 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-xl font-bold text-slate-800 whitespace-nowrap">{title}</h1>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:border-teal-400 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-black">
              <Filter className="w-3.5 h-3.5 text-slate-600" />
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="bg-transparent text-xs font-medium text-teal-600 focus:outline-none cursor-pointer"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewingTrash && selectedItems.size > 0 && (
              <>
                <button
                  onClick={handleBulkRestore}
                  className="px-3 py-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm border border-black"
                >
                  <ArchiveRestore className="w-4 h-4" />
                  Restaurar ({selectedItems.size})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm border border-black"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar ({selectedItems.size})
                </button>
              </>
            )}
            
            {showTrash && (
              <button
                onClick={toggleTrashView}
                className={`px-3 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm border border-black ${
                  viewingTrash
                    ? 'bg-gradient-to-r from-slate-500 to-gray-500 text-white'
                    : 'bg-white text-slate-700'
                }`}
              >
                {viewingTrash ? <RefreshCw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                {viewingTrash ? 'Ver Activos' : 'Papelera'}
              </button>
            )}
            
            {onCreate && !viewingTrash && (
              <button
                onClick={onCreate}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm border border-black whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                {createButtonText}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table - Ocupa todo el espacio disponible */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-r from-slate-200 to-gray-200 sticky top-0 z-10">
            <tr>
              {viewingTrash && (
                <th className="px-4 py-2 border border-gray-300 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center w-full"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-2 font-bold text-slate-700 text-xs uppercase border border-gray-300 ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-2 text-center font-bold text-slate-700 text-xs uppercase border border-gray-300 w-24">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item) => {
                const deleted = isDeleted(item);
                const itemKey = getItemKey(item);
                const isSelected = selectedItems.has(itemKey);
                
                return (
                  <tr 
                    key={itemKey}
                    className={`transition-colors ${
                      deleted 
                        ? isSelected ? 'bg-red-200' : 'bg-red-50 hover:bg-red-100'
                        : 'bg-white hover:bg-yellow-50'
                    }`}
                  >
                    {viewingTrash && (
                      <td className="px-4 py-2 border border-gray-300">
                        <button
                          onClick={() => toggleSelectItem(itemKey)}
                          className="flex items-center justify-center w-full"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-2 text-xs border border-gray-300 ${
                          column.align === 'center' ? 'text-center' : 
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {column.render(item)}
                      </td>
                    ))}
                    <td className="px-4 py-2 border border-gray-300">
                      <div className="flex gap-1.5 justify-center">
                        {deleted ? (
                          onRestore && (
                            <button
                              onClick={() => onRestore(item)}
                              className="p-1.5 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-md hover:shadow-md transition-all"
                              title="Restaurar"
                            >
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : (
                          <>
                            {/* Custom Actions */}
                            {customActions.map((action, idx) => {
                              const shouldShow = action.show ? action.show(item) : true;
                              if (!shouldShow) return null;
                              const label = typeof action.label === 'function' ? action.label(item) : action.label;
                              const icon = typeof action.icon === 'function' ? action.icon(item) : action.icon;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => action.onClick(item)}
                                  className={action.className || "p-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-md hover:shadow-md transition-all text-xs"}
                                  title={label}
                                >
                                  {icon ? <span>{icon}</span> : label}
                                </button>
                              );
                            })}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="p-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-md hover:shadow-md transition-all"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(item)}
                                className="p-1.5 bg-gradient-to-r from-rose-400 to-red-500 text-white rounded-md hover:shadow-md transition-all"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 1 + (viewingTrash ? 1 : 0)} className="h-full">
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="text-5xl mb-3">
                      {viewingTrash ? '🗑️' : '🔍'}
                    </div>
                    <p className="text-base font-bold text-slate-400">
                      {viewingTrash ? 'Papelera vacía' : emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Altura fija */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Página <span className="text-teal-600">{currentPage}</span> de <span className="text-teal-600">{totalPages}</span>
              {' · '}
              <span className="text-slate-500">
                {filteredData.length} {viewingTrash ? 'eliminados' : 'registros'}
              </span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md bg-white border border-black hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md bg-white border border-black hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}