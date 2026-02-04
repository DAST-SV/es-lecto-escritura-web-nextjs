/**
 * UBICACIÓN: src/presentation/features/books/components/Selectors/CatalogSelector.tsx
 * Selector de catálogos con soporte multiidioma
 * Usa las tablas base + traducciones del schema books
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Search, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { getUserFriendlyError, logDetailedError } from '@/src/infrastructure/utils/error-formatter';

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  ageLabel?: string;
}

type CatalogType = 'categories' | 'genres' | 'levels' | 'tags' | 'values';

interface CatalogSelectorProps {
  catalogType: CatalogType;
  selectedIds: string[];
  onToggle: (id: string) => void;
  label: string;
  color: 'amber' | 'rose' | 'emerald' | 'sky' | 'orange' | 'violet' | 'indigo';
  maxSelections?: number;
  required?: boolean;
  singleSelect?: boolean;
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
  },
  violet: {
    border: 'border-violet-200/60',
    selected: 'border-violet-400 bg-violet-50 text-violet-900 font-medium',
    unselected: 'border-gray-200 hover:border-violet-300 text-gray-700 hover:bg-gray-50',
    badge: 'bg-violet-500 text-white',
  },
  indigo: {
    border: 'border-indigo-200/60',
    selected: 'border-indigo-400 bg-indigo-50 text-indigo-900 font-medium',
    unselected: 'border-gray-200 hover:border-indigo-300 text-gray-700 hover:bg-gray-50',
    badge: 'bg-indigo-500 text-white',
  }
};

// Mapeo de tipo de catálogo a nombres de tabla
const catalogConfig: Record<CatalogType, {
  baseTable: string;
  translationTable: string;
  foreignKey: string;
  hasAgeLabel?: boolean;
}> = {
  categories: {
    baseTable: 'categories',
    translationTable: 'category_translations',
    foreignKey: 'category_id'
  },
  genres: {
    baseTable: 'genres',
    translationTable: 'genre_translations',
    foreignKey: 'genre_id'
  },
  levels: {
    baseTable: 'levels',
    translationTable: 'level_translations',
    foreignKey: 'level_id',
    hasAgeLabel: true
  },
  tags: {
    baseTable: 'tags',
    translationTable: 'tag_translations',
    foreignKey: 'tag_id'
  },
  values: {
    baseTable: 'values',
    translationTable: 'value_translations',
    foreignKey: 'value_id'
  },
};

export function CatalogSelector({
  catalogType,
  selectedIds,
  onToggle,
  label,
  color,
  maxSelections = 999,
  required = false,
  singleSelect = false
}: CatalogSelectorProps) {
  const locale = useLocale();
  const supabase = createClient();
  const colors = colorClasses[color];
  const config = catalogConfig[catalogType];
  const itemsPerPage = 12;

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<CatalogItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const loadItems = useCallback(async (searchTerm: string, page: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Cargar datos base
      const { data: baseData, error: baseError, count } = await supabase
        .schema('books')
        .from(config.baseTable)
        .select('id, slug, color, icon, order_index', { count: 'exact' })
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('order_index')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (baseError) {
        logDetailedError(`CatalogSelector.loadItems - ${catalogType}`, baseError);
        setErrorMessage(getUserFriendlyError(baseError, `Error cargando ${label}`));
        return;
      }

      if (!baseData || baseData.length === 0) {
        setItems([]);
        setTotalCount(0);
        return;
      }

      // 2. Cargar traducciones para el idioma actual
      const ids = baseData.map(item => item.id);

      const translationSelect = config.hasAgeLabel
        ? `${config.foreignKey}, name, description, age_label`
        : `${config.foreignKey}, name, description`;

      const { data: translations, error: transError } = await supabase
        .schema('books')
        .from(config.translationTable)
        .select(translationSelect)
        .in(config.foreignKey, ids)
        .eq('language_code', locale);

      if (transError) {
        logDetailedError(`CatalogSelector.loadTranslations - ${catalogType}`, transError);
      }

      // 3. Crear mapa de traducciones
      const transMap = new Map<string, { name: string; description?: string; ageLabel?: string }>();
      if (translations) {
        translations.forEach((t: any) => {
          transMap.set(t[config.foreignKey], {
            name: t.name,
            description: t.description,
            ageLabel: t.age_label
          });
        });
      }

      // 4. Combinar datos base con traducciones
      let combinedItems: CatalogItem[] = baseData.map(item => {
        const trans = transMap.get(item.id);
        return {
          id: item.id,
          slug: item.slug,
          name: trans?.name || item.slug,
          description: trans?.description,
          color: item.color,
          icon: item.icon,
          ageLabel: trans?.ageLabel
        };
      });

      // 5. Filtrar por búsqueda si hay término
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        combinedItems = combinedItems.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.slug.toLowerCase().includes(searchLower)
        );
      }

      setItems(combinedItems);
      setTotalCount(count || combinedItems.length);

    } catch (err) {
      logDetailedError(`CatalogSelector.loadItems - ${catalogType}`, err);
      setErrorMessage(getUserFriendlyError(err, 'Error inesperado'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, config, catalogType, locale, label, itemsPerPage]);

  const loadSelectedItems = useCallback(async () => {
    if (selectedIds.length === 0) {
      setSelectedItems([]);
      return;
    }

    try {
      const { data: baseData } = await supabase
        .schema('books')
        .from(config.baseTable)
        .select('id, slug, color, icon')
        .in('id', selectedIds);

      if (!baseData) {
        setSelectedItems([]);
        return;
      }

      const translationSelect = config.hasAgeLabel
        ? `${config.foreignKey}, name, description, age_label`
        : `${config.foreignKey}, name, description`;

      const { data: translations } = await supabase
        .schema('books')
        .from(config.translationTable)
        .select(translationSelect)
        .in(config.foreignKey, selectedIds)
        .eq('language_code', locale);

      const transMap = new Map<string, { name: string; ageLabel?: string }>();
      if (translations) {
        translations.forEach((t: any) => {
          transMap.set(t[config.foreignKey], {
            name: t.name,
            ageLabel: t.age_label
          });
        });
      }

      const items = baseData.map(item => {
        const trans = transMap.get(item.id);
        return {
          id: item.id,
          slug: item.slug,
          name: trans?.name || item.slug,
          color: item.color,
          icon: item.icon,
          ageLabel: trans?.ageLabel
        };
      });

      setSelectedItems(items);
    } catch (err) {
      console.error('Error cargando items seleccionados:', err);
    }
  }, [supabase, config, selectedIds, locale]);

  useEffect(() => {
    loadItems(search, currentPage);
  }, [loadItems, search, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    loadSelectedItems();
  }, [loadSelectedItems]);

  const handleToggle = (id: string) => {
    if (singleSelect) {
      // En modo single select, siempre reemplazar
      onToggle(id);
    } else {
      onToggle(id);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (errorMessage) {
    return (
      <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
        <label className="text-xs font-semibold text-red-700 block mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-center py-4">
          <p className="text-xs text-red-600 font-medium mb-2">Error al cargar</p>
          <p className="text-[11px] text-red-500 break-words">{errorMessage}</p>
          <button
            onClick={() => loadItems(search, currentPage)}
            className="mt-3 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
      <div className={`border-2 ${colors.border} rounded-lg p-4 bg-white`}>
        {/* Header */}
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

        {/* Grid de items */}
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
                  onClick={() => canClick && handleToggle(item.id)}
                  disabled={!canClick}
                  title={item.description || item.name}
                  className={`px-2.5 py-1.5 text-[11px] rounded-md border transition-all text-left ${
                    isSelected
                      ? colors.selected
                      : canClick
                        ? colors.unselected
                        : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  <span className="block truncate">{item.name}</span>
                  {item.ageLabel && (
                    <span className="block text-[9px] opacity-70 mt-0.5">{item.ageLabel}</span>
                  )}
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

      {/* Modal de seleccionados */}
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
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-900 font-medium block truncate">
                          {idx + 1}. {item.name}
                        </span>
                        {item.ageLabel && (
                          <span className="text-[10px] text-gray-500">{item.ageLabel}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggle(item.id)}
                        className="p-0.5 hover:bg-red-100 rounded transition-colors ml-2"
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
                {selectedItems.length} / {maxSelections === 999 ? '∞' : maxSelections}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
