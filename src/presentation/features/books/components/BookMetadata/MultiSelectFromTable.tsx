/**
 * UBICACIÓN: src/presentation/features/books/components/BookMetadata/MultiSelectFromTable.tsx
 * ✅ ACTUALIZADO: Funciona con las tablas del nuevo schema books.*
 */
import React, { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { Search, ChevronDown, X, Check, Loader2 } from 'lucide-react';

interface MultiSelectFromTableProps<T extends Record<string, any>> {
  table: string;
  valueField: keyof T;
  labelField: keyof T;
  filterField: keyof T;
  values: (number | string)[];
  placeholder?: string;
  onChange: (values: (number | string)[]) => void;
  onLabelsChange?: (labels: string[]) => void;
  maxItems?: number;
  color?: 'indigo' | 'purple' | 'green' | 'blue' | 'pink';
}

export function MultiSelectFromTable<T extends Record<string, any>>({
  table,
  valueField,
  labelField,
  filterField,
  values,
  placeholder = 'Seleccionar...',
  onChange,
  onLabelsChange,
  maxItems = 5,
  color = 'indigo',
}: MultiSelectFromTableProps<T>) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<{ value: number | string; label: string }[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ value: number | string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const colorClasses = {
    indigo: {
      border: 'border-indigo-500',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      textDark: 'text-indigo-900',
      hover: 'hover:bg-indigo-50',
      chip: 'bg-indigo-100 border-indigo-300 text-indigo-700',
      progress: 'bg-indigo-500'
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      textDark: 'text-purple-900',
      hover: 'hover:bg-purple-50',
      chip: 'bg-purple-100 border-purple-300 text-purple-700',
      progress: 'bg-purple-500'
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-600',
      textDark: 'text-green-900',
      hover: 'hover:bg-green-50',
      chip: 'bg-green-100 border-green-300 text-green-700',
      progress: 'bg-green-500'
    },
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      textDark: 'text-blue-900',
      hover: 'hover:bg-blue-50',
      chip: 'bg-blue-100 border-blue-300 text-blue-700',
      progress: 'bg-blue-500'
    },
    pink: {
      border: 'border-pink-500',
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      textDark: 'text-pink-900',
      hover: 'hover:bg-pink-50',
      chip: 'bg-pink-100 border-pink-300 text-pink-700',
      progress: 'bg-pink-500'
    }
  };

  const colors = colorClasses[color];
  const isMaxReached = selectedOptions.length >= maxItems;

  useEffect(() => {
    loadOptions('');
  }, [table]);

  useEffect(() => {
    if (values.length > 0) {
      loadSelectedOptions();
    } else {
      setSelectedOptions([]);
    }
  }, [values]);

  useEffect(() => {
    if (onLabelsChange) {
      const labels = selectedOptions.map(opt => opt.label);
      onLabelsChange(labels);
    }
  }, [selectedOptions, onLabelsChange]);

  const loadOptions = async (inputValue: string) => {
    setIsLoading(true);
    try {
      let query = supabase.from(table).select('*');
      
      if (inputValue) {
        query = query.ilike(String(filterField), `%${inputValue}%`);
      }

      const { data, error } = await query.limit(50);
      
      if (error) {
        console.error(`Error cargando opciones de ${table}:`, error);
        setOptions([]);
        return;
      }

      const formattedOptions = (data || []).map((item: T) => ({
        value: item[valueField] as number | string,
        label: String(item[labelField]),
      }));

      setOptions(formattedOptions);
    } catch (error) {
      console.error('Error cargando opciones:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedOptions = async () => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .in(String(valueField), values);

      if (error) {
        console.error('Error cargando valores seleccionados:', error);
        setSelectedOptions([]);
        return;
      }

      const formatted = (data || []).map((item: T) => ({
        value: item[valueField] as number | string,
        label: String(item[labelField]),
      }));

      setSelectedOptions(formatted);
    } catch (error) {
      console.error('Error cargando valores seleccionados:', error);
      setSelectedOptions([]);
    }
  };

  const toggleOption = (option: { value: number | string; label: string }) => {
    const isSelected = values.includes(option.value);
    
    if (isSelected) {
      const newValues = values.filter(v => v !== option.value);
      onChange(newValues);
    } else if (!isMaxReached) {
      const newValues = [...values, option.value];
      onChange(newValues);
      
      if (newValues.length >= maxItems) {
        setTimeout(() => {
          setIsOpen(false);
          setSearch('');
        }, 300);
      }
    }
  };

  const removeOption = (optionValue: number | string) => {
    const newValues = values.filter(v => v !== optionValue);
    onChange(newValues);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOptions(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Trigger */}
      <div className="relative">
        <div
          onClick={() => !isMaxReached && setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 rounded-lg border-2 transition-all
            ${isMaxReached 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : isOpen 
                ? `${colors.border} bg-white cursor-pointer` 
                : 'border-gray-300 hover:border-gray-400 bg-white cursor-pointer'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm ${selectedOptions.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
              {selectedOptions.length > 0 
                ? `${selectedOptions.length} seleccionado${selectedOptions.length > 1 ? 's' : ''}`
                : placeholder
              }
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${isMaxReached ? 'text-amber-700' : 'text-gray-500'}`}>
                {selectedOptions.length}/{maxItems}
              </span>
              {!isMaxReached && (
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
              )}
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && !isMaxReached && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center px-2 py-1.5 bg-white border border-gray-200 rounded-md">
                  <Search size={14} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="flex-1 outline-none text-sm"
                    autoFocus
                  />
                  {isLoading && <Loader2 size={14} className="text-gray-400 animate-spin ml-2" />}
                </div>
              </div>

              {/* Options */}
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    {isLoading ? 'Cargando...' : 'No hay resultados'}
                  </div>
                ) : (
                  filteredOptions.map(option => {
                    const isSelected = values.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        onClick={() => toggleOption(option)}
                        className={`
                          px-4 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between
                          ${isSelected 
                            ? `${colors.bg} ${colors.textDark} font-medium` 
                            : `hover:bg-gray-50 text-gray-700`
                          }
                        `}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check size={16} className={colors.text} strokeWidth={2.5} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Selected Chips */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map(option => (
            <div
              key={option.value}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${colors.chip} text-xs font-medium`}
            >
              <span>{option.label}</span>
              <button
                onClick={() => removeOption(option.value)}
                className="hover:bg-white/50 rounded-full p-0.5 transition-colors"
                title="Eliminar"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}