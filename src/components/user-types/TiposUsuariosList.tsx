import React, { useState } from 'react';
import { Search, Download, FileText, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit2, Trash2, Plus, Menu, X } from 'lucide-react';

interface UserType {
  id_tipo_usuario: number;
  nombre: string;
  descripcion: string | null;
}

interface Props {
  tipos: UserType[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (tipo: UserType) => void;
  onOpenDeleteModal: (tipo: UserType) => void;
}

export default function TiposUsuariosList({ tipos, onOpenCreateModal, onOpenEditModal, onOpenDeleteModal }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Filtrado de datos
  const filteredData = tipos.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  
  // Crear filas vacías para completar la página
  const emptyRowsCount = itemsPerPage - currentData.length;
  const emptyRows = Array(emptyRowsCount).fill(null);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex-1 bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0 border-4 border-yellow-300">

      {/* Header compacto */}
      <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">

          {/* Búsqueda colapsable */}
          <div className="flex items-center gap-2 flex-1">
            {showSearch ? (
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  autoFocus
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-9 py-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all text-sm placeholder-slate-400 cursor-pointer"
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm('');
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 hover:bg-white rounded-lg transition-colors flex items-center gap-2 text-slate-600 border border-black cursor-pointer"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Buscar</span>
                </button>

                {/* Filtros adicionales - solo desktop */}
                <div className="hidden lg:flex items-center gap-3 ml-4">
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm border border-black">
                    <Filter className="w-3.5 h-3.5 text-slate-600" />
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-transparent font-medium text-teal-600 focus:outline-none cursor-pointer text-xs"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Contador compacto */}
                  <div className="text-xs font-medium text-slate-600">
                    <span className="text-teal-600">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</span> de <span className="text-teal-600">{filteredData.length}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {/* Botón menú móvil */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden p-2 bg-white rounded-lg border border-black hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <Menu className="w-4 h-4 text-slate-600" />
            </button>

            {/* Exportar - solo desktop */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 bg-white rounded-lg border border-black hover:shadow-md hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                title="Exportar"
              >
                <Download className="w-4 h-4 text-teal-600" />
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10 cursor-pointer"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-2xl overflow-hidden z-20 border border-black">
                    <button className="w-full px-3 py-2 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      <span>PDF</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <FileText className="w-3.5 h-3.5 text-green-600" />
                      <span>Excel</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>CSV</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Botón Nuevo */}
            <button
              onClick={onOpenCreateModal}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 active:scale-95 transition-all flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap border border-black cursor-pointer"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Panel de filtros móvil */}
        {showMobileFilters && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-black">
              <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent font-semibold text-teal-600 focus:outline-none cursor-pointer text-xs flex-1"
              >
                <option value={10}>10 registros</option>
                <option value={20}>20 registros</option>
                <option value={30}>30 registros</option>
                <option value={50}>50 registros</option>
                <option value={100}>100 registros</option>
              </select>
            </div>
            <div className="text-xs font-semibold text-slate-700 bg-slate-200/50 rounded-lg px-3 py-2">
              Mostrando <span className="text-teal-600">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</span> de <span className="text-teal-600">{filteredData.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabla compacta con scroll */}
      <div className="overflow-auto min-h-0">
        {/* Vista Desktop/Tablet */}
        <div className="hidden sm:block h-full overflow-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-slate-200 to-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-0.5 text-center font-bold text-slate-700 text-xs uppercase tracking-wide w-16 border border-gray-300">
                  ID
                </th>
                <th className="px-4 py-0.5 text-center font-bold text-slate-700 text-xs uppercase tracking-wide border border-gray-300">
                  Nombre
                </th>
                <th className="px-4 py-0.5 text-center font-bold text-slate-700 text-xs uppercase tracking-wide hidden md:table-cell border border-gray-300">
                  Descripción
                </th>
                <th className="px-4 py-0.5 text-center font-bold text-slate-700 text-xs uppercase tracking-wide w-24 border border-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                <>
                  {/* Filas con datos */}
                  {currentData.map((tipo) => (
                    <tr
                      key={tipo.id_tipo_usuario}
                      className="hover:bg-yellow-50 transition-colors bg-white"
                    >
                      <td className="px-4 py-1 font-semibold text-teal-600 text-xs text-center align-middle border border-gray-300">
                        {tipo.id_tipo_usuario}
                      </td>
                      <td className="px-4 py-1 font-semibold text-slate-800 text-xs text-center align-middle border border-gray-300">
                        <div>{tipo.nombre}</div>
                        <div className="md:hidden text-slate-600 text-xs mt-0.5 font-normal">{tipo.descripcion ?? 'Sin descripción'}</div>
                      </td>
                      <td className="px-4 py-1 text-slate-600 text-xs text-center align-middle hidden md:table-cell border border-gray-300">
                        {tipo.descripcion ?? 'Sin descripción'}
                      </td>
                      <td className="px-4 py-1 align-middle border border-gray-300">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => onOpenEditModal(tipo)}
                            className="p-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-md hover:shadow-md active:scale-95 transition-all cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(tipo)}
                            className="p-1.5 bg-gradient-to-r from-rose-400 to-red-500 text-white rounded-md hover:shadow-md active:scale-95 transition-all cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Filas vacías para completar */}
                  {emptyRows.map((_, index) => (
                    <tr key={`empty-${index}`} className="bg-white">
                      <td className="px-4 py-1 text-xs text-center align-middle border border-gray-300">
                        <span className="text-slate-300">—</span>
                      </td>
                      <td className="px-4 py-1 text-xs text-center align-middle border border-gray-300">
                        <span className="text-slate-300">—</span>
                      </td>
                      <td className="px-4 py-1 text-xs text-center align-middle hidden md:table-cell border border-gray-300">
                        <span className="text-slate-300">—</span>
                      </td>
                      <td className="px-4 py-1 align-middle border border-gray-300">
                        <div className="flex gap-1.5 justify-center opacity-0">
                          <div className="p-1.5 w-7 h-7"></div>
                          <div className="p-1.5 w-7 h-7"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center" style={{ height: `${itemsPerPage * 2.5}rem` }}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">🔍</div>
                      <p className="text-sm font-bold text-slate-400">No se encontraron resultados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Mobile - Cards compactas */}
        <div className="sm:hidden h-full overflow-auto p-2 space-y-2">
          {currentData.length > 0 ? (
            currentData.map((tipo) => (
              <div key={tipo.id_tipo_usuario} className="bg-white border-2 border-yellow-300 rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-teal-600 mb-0.5">#{tipo.id_tipo_usuario}</div>
                    <h3 className="font-bold text-slate-800 text-xs mb-0.5 break-words">{tipo.nombre}</h3>
                    <p className="text-xs text-slate-600 break-words">{tipo.descripcion ?? 'Sin descripción'}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpenEditModal(tipo)}
                    className="flex-1 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => onOpenDeleteModal(tipo)}
                    className="flex-1 py-1.5 bg-gradient-to-r from-rose-400 to-red-500 text-black rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-black cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm font-bold text-slate-400">No hay resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* Paginador compacto */}
      {totalPages > 0 && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-3 py-2 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">

            {/* Info de página */}
            <div className="text-xs font-semibold text-slate-700">
              <span className="text-teal-600">{currentPage}</span>/<span className="text-teal-600">{totalPages}</span>
            </div>

            {/* Controles centrales */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md bg-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all hover:bg-slate-50 border border-black cursor-pointer"
              >
                <ChevronsLeft className="w-3.5 h-3.5 text-black" />
              </button>

              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md bg-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all hover:bg-slate-50 border border-black cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-black" />
              </button>

              {/* Números de página - Solo desktop */}
              <div className="hidden md:flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-md font-bold transition-all text-xs border border-black cursor-pointer ${currentPage === pageNum
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                          : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm active:scale-95'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md bg-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all hover:bg-slate-50 border border-black cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 text-black" />
              </button>

              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md bg-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all hover:bg-slate-50 border border-black cursor-pointer"
              >
                <ChevronsRight className="w-3.5 h-3.5 text-black" />
              </button>
            </div>

            {/* Input ir a página */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-12 px-2 py-1 rounded-md border border-black text-center font-bold text-teal-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 text-xs cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}