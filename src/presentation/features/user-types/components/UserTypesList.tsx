/**
 * ============================================
 * ARCHIVO 3: src/presentation/features/user-types/components/UserTypesList.tsx
 * ✅ Componente de lista (refactorizado)
 * ============================================
 */

import React, { useState } from 'react';
import { Search, Edit2, Trash2, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserType } from '@/src/core/domain/entities/UserType';

interface UserTypesListProps {
  userTypes: UserType[];
  onOpenCreate: () => void;
  onOpenEdit: (userType: UserType) => void;
  onOpenDelete: (userType: UserType) => void;
}

export function UserTypesList({
  userTypes,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
}: UserTypesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = userTypes.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex-1 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col border-4 border-yellow-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:border-teal-400 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-black">
              <Filter className="w-3.5 h-3.5 text-slate-600" />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-medium text-teal-600 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm border border-black"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-r from-slate-200 to-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-center font-bold text-slate-700 text-xs uppercase border border-gray-300 w-16">
                ID
              </th>
              <th className="px-4 py-2 text-center font-bold text-slate-700 text-xs uppercase border border-gray-300">
                Nombre
              </th>
              <th className="px-4 py-2 text-center font-bold text-slate-700 text-xs uppercase border border-gray-300">
                Descripción
              </th>
              <th className="px-4 py-2 text-center font-bold text-slate-700 text-xs uppercase border border-gray-300 w-24">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-yellow-50 transition-colors bg-white">
                  <td className="px-4 py-2 font-semibold text-teal-600 text-xs text-center border border-gray-300">
                    {tipo.id}
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-800 text-xs text-center border border-gray-300">
                    {tipo.nombre}
                  </td>
                  <td className="px-4 py-2 text-slate-600 text-xs text-center border border-gray-300">
                    {tipo.descripcion || 'Sin descripción'}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    <div className="flex gap-1.5 justify-center">
                      <button
                        onClick={() => onOpenEdit(tipo)}
                        className="p-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-md hover:shadow-md transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenDelete(tipo)}
                        className="p-1.5 bg-gradient-to-r from-rose-400 to-red-500 text-white rounded-md hover:shadow-md transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-sm font-bold text-slate-400">No se encontraron resultados</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Página <span className="text-teal-600">{currentPage}</span> de <span className="text-teal-600">{totalPages}</span>
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