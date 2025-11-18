import React, { useEffect, useState, useMemo } from 'react';
import AsyncSelect from 'react-select/async';
import { createClient } from '@/src/utils/supabase/client';

interface MultiSelectFromTableProps<T extends Record<string, any>> {
  table: string;
  valueField: keyof T;
  labelField: keyof T;
  filterField: keyof T;
  values: (number | string)[];
  placeholder?: string;
  onChange: (values: (number | string)[]) => void;
  maxItems?: number;
}

export default function MultiSelectFromTable<T extends Record<string, any>>({
  table,
  valueField,
  labelField,
  filterField,
  values,
  placeholder = 'Selecciona...',
  onChange,
  maxItems = 5,
}: MultiSelectFromTableProps<T>) {
  const supabase = createClient();
  const [options, setOptions] = useState<{ value: number | string; label: string }[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ value: number | string; label: string }[]>([]);

  // 🔥 FIX: Generar instanceId único y estable basado en la tabla y campo
  const instanceId = useMemo(() => {
    return `select-${table}-${String(valueField)}`;
  }, [table, valueField]);

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

  const loadOptions = async (inputValue: string) => {
    try {
      let query = supabase.from(table).select('*');
      
      if (inputValue) {
        query = query.ilike(String(filterField), `%${inputValue}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedOptions = (data || []).map((item: T) => ({
        value: item[valueField] as number | string,
        label: String(item[labelField]),
      }));

      setOptions(formattedOptions);
      return formattedOptions;
    } catch (error) {
      console.error('Error cargando opciones:', error);
      return [];
    }
  };

  const loadSelectedOptions = async () => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .in(String(valueField), values);

      if (error) throw error;

      const formatted = (data || []).map((item: T) => ({
        value: item[valueField] as number | string,
        label: String(item[labelField]),
      }));

      setSelectedOptions(formatted);
    } catch (error) {
      console.error('Error cargando valores seleccionados:', error);
    }
  };

  const handleChange = (selected: any) => {
    const selectedValues = (selected || []).map((opt: any) => opt.value);
    setSelectedOptions(selected || []);
    onChange(selectedValues);
  };

  const isMaxReached = selectedOptions.length >= maxItems;

  return (
    <div className="multi-select-container">
      {/* Selector */}
      {!isMaxReached && (
        <AsyncSelect
          instanceId={instanceId} // 🔥 FIX: ID estable
          isMulti
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          value={selectedOptions}
          onChange={handleChange}
          placeholder={placeholder}
          noOptionsMessage={() => 'No hay opciones'}
          loadingMessage={() => 'Cargando...'}
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: '8px',
              borderColor: '#d1d5db',
              '&:hover': { borderColor: '#9ca3af' },
            }),
          }}
        />
      )}

      {/* Mensaje de límite alcanzado */}
      {isMaxReached && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ Has alcanzado el máximo de {maxItems} elementos
        </div>
      )}

      {/* Lista de seleccionados */}
      {selectedOptions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{option.label}</span>
              <button
                onClick={() => {
                  const newSelected = selectedOptions.filter((o) => o.value !== option.value);
                  handleChange(newSelected);
                }}
                className="hover:text-red-600 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}