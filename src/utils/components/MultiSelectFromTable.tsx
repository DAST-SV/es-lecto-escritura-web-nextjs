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
  onLabelsChange?: (labels: string[]) => void; // ⭐ NUEVO: Para exponer los nombres
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
  onLabelsChange, // ⭐ NUEVO
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

  // ⭐ NUEVO: Notificar cambios en los labels
  useEffect(() => {
    if (onLabelsChange) {
      const labels = selectedOptions.map(opt => opt.label);
      onLabelsChange(labels);
    }
  }, [selectedOptions, onLabelsChange]);

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
    const newSelected = selected || [];
    
    // 🔥 Validar que no se exceda el límite
    if (newSelected.length > maxItems) {
      // Si intenta agregar más del límite, no hacer nada
      return;
    }
    
    const selectedValues = newSelected.map((opt: any) => opt.value);
    setSelectedOptions(newSelected);
    onChange(selectedValues);
  };

  const isMaxReached = selectedOptions.length >= maxItems;

  return (
    <div className="multi-select-container">
      {/* Mensaje de límite alcanzado - ANTES del selector */}
      {isMaxReached && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
          <span>⚠️</span>
          <span>Máximo de {maxItems} elementos alcanzado. <strong>Quita elementos usando la × para agregar otros.</strong></span>
        </div>
      )}

      {/* Selector - SIEMPRE habilitado para poder quitar elementos */}
      <AsyncSelect
        instanceId={instanceId}
        isMulti
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={isMaxReached ? "Quita elementos para agregar otros" : placeholder}
        noOptionsMessage={() => isMaxReached ? 'Límite alcanzado - quita elementos primero' : 'No hay opciones'}
        loadingMessage={() => 'Cargando...'}
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: '8px',
            borderColor: isMaxReached ? '#fbbf24' : '#d1d5db',
            backgroundColor: isMaxReached ? '#fef3c7' : 'white',
            '&:hover': { borderColor: isMaxReached ? '#f59e0b' : '#9ca3af' },
          }),
        }}
      />
    </div>
  );
}