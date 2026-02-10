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

// Mapeo de tipo de catálogo a nombres de tabla y columnas disponibles
const catalogConfig: Record<CatalogType, {
  baseTable: string;
  translationTable: string;
  foreignKey: string;
  baseSelect: string;
  baseSelectSelected: string;
  hasOrderIndex: boolean;
  hasAgeLabel?: boolean;
  hasDescription?: boolean;
}> = {
  categories: {
    baseTable: 'categories',
    translationTable: 'category_translations',
    foreignKey: 'category_id',
    baseSelect: 'id, slug, color, icon, order_index',
    baseSelectSelected: 'id, slug, color, icon',
    hasOrderIndex: true,
  },
  genres: {
    baseTable: 'genres',
    translationTable: 'genre_translations',
    foreignKey: 'genre_id',
    baseSelect: 'id, slug, color, icon, order_index',
    baseSelectSelected: 'id, slug, color, icon',
    hasOrderIndex: true,
  },
  levels: {
    baseTable: 'levels',
    translationTable: 'level_translations',
    foreignKey: 'level_id',
    baseSelect: 'id, slug, color, icon, order_index',
    baseSelectSelected: 'id, slug, color, icon',
    hasOrderIndex: true,
    hasAgeLabel: true,
  },
  tags: {
    baseTable: 'tags',
    translationTable: 'tag_translations',
    foreignKey: 'tag_id',
    baseSelect: 'id, slug, color',
    baseSelectSelected: 'id, slug, color',
    hasOrderIndex: false,
    hasDescription: false,
  },
  values: {
    baseTable: 'values',
    translationTable: 'value_translations',
    foreignKey: 'value_id',
    baseSelect: 'id, slug, color, icon, order_index',
    baseSelectSelected: 'id, slug, color, icon',
    hasOrderIndex: true,
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
  const itemsPerPage = 9;

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
      let query = supabase
        .schema('books')
        .from(config.baseTable)
        .select(config.baseSelect, { count: 'exact' })
        .eq('is_active', true)
        .is('deleted_at', null);

      if (config.hasOrderIndex) {
        query = query.order('order_index');
      } else {
        query = query.order('slug');
      }

      query = query.range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      const { data: baseData, error: baseError, count } = await query as { data: any[] | null; error: any; count: number | null };

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

      // Construir select de traducciones según columnas disponibles
      let translationFields = `${config.foreignKey}, name`;
      if (config.hasDescription !== false) translationFields += ', description';
      if (config.hasAgeLabel) translationFields += ', age_label';

      const { data: translations, error: transError } = await supabase
        .schema('books')
        .from(config.translationTable)
        .select(translationFields)
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
        .select(config.baseSelectSelected)
        .in('id', selectedIds) as { data: any[] | null; error: any };

      if (!baseData) {
        setSelectedItems([]);
        return;
      }

      let translationFields2 = `${config.foreignKey}, name`;
      if (config.hasDescription !== false) translationFields2 += ', description';
      if (config.hasAgeLabel) translationFields2 += ', age_label';

      const { data: translations } = await supabase
        .schema('books')
        .from(config.translationTable)
        .select(translationFields2)
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
      <div className="text-center py-4">
        <p className="text-[11px] text-red-600 font-medium mb-1">Error al cargar</p>
        <p className="text-[10px] text-red-400 break-words mb-2">{errorMessage}</p>
        <button onClick={() => loadItems(search, currentPage)}
          className="px-3 py-1 text-[10px] bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  if (totalCount === 0 && !isLoading && !search) {
    return (
      <div className="text-center py-6">
        <p className="text-[11px] text-gray-400">No hay opciones disponibles</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Header: buscador + badge ── */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-100 focus:outline-none transition-all"
          />
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 ${colors.badge} rounded-lg text-[11px] font-bold hover:opacity-90 transition-opacity whitespace-nowrap`}
          >
            <Info size={11} />
            {selectedIds.length}{maxSelections !== 999 ? `/${maxSelections}` : ''}
          </button>
        )}
      </div>

      {/* ── Grid de items ── */}
      <div className="grid grid-cols-3 gap-1.5">
        {isLoading ? (
          <div className="col-span-3 text-center py-6">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto mb-1.5"></div>
            <p className="text-[10px] text-gray-400">Cargando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-3 text-center py-5 text-xs text-gray-400">
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
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all text-left leading-tight ${
                  isSelected
                    ? colors.selected
                    : canClick
                      ? colors.unselected
                      : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                }`}
              >
                <span className="block truncate font-medium">{item.name}</span>
                {item.ageLabel && (
                  <span className="block text-[9px] opacity-60 truncate">{item.ageLabel}</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* ── Paginación — siempre visible ── */}
      {!isLoading && totalCount > 0 && (
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-20 disabled:cursor-default rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="text-xs text-gray-500 font-medium">
            {currentPage} / {Math.max(totalPages, 1)}
            <span className="text-gray-400 ml-1">({totalCount})</span>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= Math.max(totalPages, 1)}
            className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-20 disabled:cursor-default rounded-lg hover:bg-gray-100 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ── Modal de seleccionados — overlay centrado ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <div>
                <h3 className="text-sm font-bold text-gray-800">{label}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {selectedItems.length} seleccionado{selectedItems.length !== 1 ? 's' : ''}{maxSelections !== 999 ? ` de ${maxSelections} máx.` : ''}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={15} className="text-gray-500" />
              </button>
            </div>

            {/* Lista */}
            <div className="p-3 max-h-[60vh] overflow-y-auto">
              {selectedItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Sin selección</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl border ${colors.selected}`}
                    >
                      <div className="flex-1 min-w-0 mr-1.5">
                        <span className="text-xs font-medium block truncate">{item.name}</span>
                        {item.ageLabel && <span className="text-[9px] opacity-70">{item.ageLabel}</span>}
                      </div>
                      <button
                        onClick={() => handleToggle(item.id)}
                        className="p-0.5 hover:bg-red-100 rounded-md transition-colors flex-shrink-0"
                      >
                        <X size={12} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
