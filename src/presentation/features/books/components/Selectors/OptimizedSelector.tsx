/**
 * UBICACIÓN: src/presentation/features/books/components/Selectors/OptimizedSelector.tsx
 * ✅ CORREGIDO: Sin scroll interno, máx 12 items visibles, borde en container principal
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';

export interface CatalogItem {
  id: number;
  name: string;
}

interface OptimizedSelectorProps {
  table: string;
  selectedIds: number[];
  onToggle: (id: number) => void;
  label: string;
  color: 'amber' | 'rose' | 'emerald' | 'sky' | 'orange';
  maxSelections?: number;
  required?: boolean;
}

const colorClasses = {
  amber: { 
    border: 'border-amber-200/60',
    selected: 'border-amber-400 bg-amber-50 text-amber-900 font-medium',
    unselected: 'border-gray-200 hover:border-amber-300 text-gray-700 hover:bg-gray-50',
    badge: 'bg-amber-500 text-white',
  },
  rose: { 
    border: 'border-rose-200/60',
    selected: 'border-rose-400 bg-rose-50 text-rose-900 font-medium',
    unselected: 'border-gray-200 hover:border-rose-300 text-gray-700 hover:bg-gray-50',
    badge: 'bg-rose-500 text-white',
  },
  emerald: { 
    border: 'border-emerald-200/60',
    selected: 'border-emerald-400 bg-emerald-50 text-emerald-900 font-medium',
    unselected: 'border-gray-200 hover:border-emerald-300 text-gray-700 hover:bg-gray-50',
    badge: 'bg-emerald-500 text-white',
  },
  sky: { 
    border: 'border-sky-200/60',
    selected: 'border-sky-400 bg-sky-50 text-sky-900 font-medium',
    unselected: 'border-gray-200 hover:border-sky-300 text-gray-700 hover:bg-gray-50',
    badge: 'bg-sky-500 text-white',
  },
  orange: { 
    border: 'border-orange-200/60',
    selected: 'border-orange-400 bg-orange-50 text-orange-900 font-medium',
    unselected: 'border-gray-200 hover:border-orange-300 text-gray-700 hover:bg-gray-50',
    badge: 'bg-orange-500 text-white',
  }
};

export function OptimizedSelector({ 
  table,
  selectedIds, 
  onToggle, 
  label, 
  color, 
  maxSelections = 999, 
  required = false
}: OptimizedSelectorProps) {
  const supabase = createClient();
  const colors = colorClasses[color];
  const itemsPerPage = 12; // ✅ FIJO: Siempre 12 items

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<CatalogItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const loadItems = async (searchTerm: string, page: number) => {
    setIsLoading(true);
    try {
      const rangeFrom = (page - 1) * itemsPerPage;
      const rangeTo = rangeFrom + itemsPerPage - 1;

      let query = supabase
        .from(table)
        .select('id, name', { count: 'exact' })
        .order('name');

      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      query = query.range(rangeFrom, rangeTo);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error cargando items:', error);
        return;
      }

      setItems(data || []);
      setTotalCount(count || 0);

    } catch (err) {
      console.error('❌ Error en loadItems:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedItems = async () => {
    if (selectedIds.length === 0) {
      setSelectedItems([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .select('id, name')
        .in('id', selectedIds);

      if (!error && data) {
        setSelectedItems(data);
      }
    } catch (err) {
      console.error('❌ Error cargando items seleccionados:', err);
    }
  };

  useEffect(() => {
    loadItems(search, currentPage);
  }, [table, search, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    loadSelectedItems();
  }, [selectedIds, table]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (totalCount === 0 && !isLoading && !search) {
    return (
      <div className={`border-2 ${colors.border} rounded-lg p-4 bg-white`}>
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No hay opciones disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ BORDE EN TODO EL CONTENEDOR */}
      <div className={`border-2 ${colors.border} rounded-lg p-4 bg-white`}>
        
        {/* Header con label y badge */}
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-1.5 px-2 py-1 ${colors.badge} rounded-full text-[10px] font-medium hover:opacity-90 transition-opacity`}
            >
              <Info size={10} />
              {selectedIds.length}
            </button>
          )}
        </div>

        {/* Buscador */}
        <div className="relative mb-3">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Buscar..." 
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:border-gray-400 focus:ring-1 focus:ring-gray-200 focus:outline-none transition-all"
          />
        </div>

        {/* ✅ Grid SIN SCROLL - Siempre 12 items o menos */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {isLoading ? (
            <div className="col-span-3 text-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mx-auto mb-2"></div>
              <p className="text-[10px] text-gray-500">Cargando...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="col-span-3 text-center py-6 text-xs text-gray-400">
              {search ? 'Sin resultados' : 'Sin opciones'}
            </div>
          ) : (
            items.map(item => {
              const isSelected = selectedIds.includes(item.id);
              const canClick = isSelected || selectedIds.length < maxSelections;
              
              return (
                <button 
                  key={item.id} 
                  onClick={() => canClick && onToggle(item.id)} 
                  disabled={!canClick}
                  className={`px-2.5 py-1.5 text-[11px] rounded-md border transition-all ${
                    isSelected 
                      ? colors.selected
                      : canClick 
                        ? colors.unselected
                        : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              );
            })
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-all"
            >
              <ChevronLeft size={12} />
            </button>
            
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <span className="text-[10px] text-gray-400">
                ({totalCount})
              </span>
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-all"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                {label} ({selectedItems.length})
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {selectedItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  Sin selección
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((item, idx) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <span className="text-xs text-gray-900 font-medium">
                        {idx + 1}. {item.name}
                      </span>
                      <button
                        onClick={() => onToggle(item.id)}
                        className="p-0.5 hover:bg-red-100 rounded transition-colors"
                        title="Quitar"
                      >
                        <X size={12} className="text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 rounded-b-xl">
              <p className="text-[10px] text-gray-600 text-center">
                {selectedItems.length} / {maxSelections}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}