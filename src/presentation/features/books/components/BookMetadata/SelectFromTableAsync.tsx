// src/presentation/features/books/components/BookMetadata/SelectFromTableAsync.tsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { Search, ChevronDown, Check, Loader2, X } from 'lucide-react';

interface SelectFromTableAsyncProps<T extends Record<string, any>> {
  table: string;
  valueField: keyof T;
  labelField: keyof T;
  filterField: keyof T;
  value: number | string | null;
  placeholder?: string;
  onChange: (value: number | string | null) => void;
  onLabelChange?: (label: string | null) => void;
  color?: 'indigo' | 'purple' | 'green' | 'blue';
}

export function SelectFromTableAsync<T extends Record<string, any>>({
  table,
  valueField,
  labelField,
  filterField,
  value,
  placeholder = 'Seleccionar...',
  onChange,
  onLabelChange,
  color = 'indigo',
}: SelectFromTableAsyncProps<T>) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<{ value: number | string; label: string }[]>([]);
  const [selectedOption, setSelectedOption] = useState<{ value: number | string; label: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const colorClasses = {
    indigo: {
      border: 'border-indigo-500',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      textDark: 'text-indigo-900',
      hover: 'hover:bg-indigo-50',
      chip: 'bg-indigo-100 border-indigo-300 text-indigo-700'
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      textDark: 'text-purple-900',
      hover: 'hover:bg-purple-50',
      chip: 'bg-purple-100 border-purple-300 text-purple-700'
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-600',
      textDark: 'text-green-900',
      hover: 'hover:bg-green-50',
      chip: 'bg-green-100 border-green-300 text-green-700'
    },
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      textDark: 'text-blue-900',
      hover: 'hover:bg-blue-50',
      chip: 'bg-blue-100 border-blue-300 text-blue-700'
    }
  };

  const colors = colorClasses[color];

  useEffect(() => {
    loadOptions('');
  }, [table]);

  useEffect(() => {
    if (value) {
      loadSelectedOption();
    } else {
      setSelectedOption(null);
      if (onLabelChange) onLabelChange(null);
    }
  }, [value]);

  const loadOptions = async (inputValue: string) => {
    setIsLoading(true);
    try {
      let query = supabase.from(table).select('*');
      
      if (inputValue) {
        query = query.ilike(String(filterField), `%${inputValue}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

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

  const loadSelectedOption = async () => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(String(valueField), value)
        .single();

      if (error) throw error;

      if (data) {
        const option = {
          value: data[valueField] as number | string,
          label: String(data[labelField]),
        };
        setSelectedOption(option);
        if (onLabelChange) onLabelChange(option.label);
      }
    } catch (error) {
      console.error('Error cargando valor seleccionado:', error);
      setSelectedOption(null);
      if (onLabelChange) onLabelChange(null);
    }
  };

  const selectOption = (option: { value: number | string; label: string }) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
    setSearch('');
    if (onLabelChange) onLabelChange(option.label);
  };

  const clearSelection = () => {
    setSelectedOption(null);
    onChange(null);
    if (onLabelChange) onLabelChange(null);
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
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 rounded-lg border-2 transition-all cursor-pointer
            ${isOpen 
              ? `${colors.border} bg-white` 
              : 'border-gray-300 hover:border-gray-400 bg-white'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
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
                    const isSelected = option.value === value;
                    return (
                      <div
                        key={option.value}
                        onClick={() => selectOption(option)}
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

      {/* Selected Chip */}
      {selectedOption && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${colors.chip} text-xs font-medium`}>
          <span>{selectedOption.label}</span>
          <button
            onClick={clearSelection}
            className="hover:bg-white/50 rounded-full p-0.5 transition-colors"
            title="Limpiar"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}