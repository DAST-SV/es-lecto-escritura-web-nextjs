import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { createClient } from '@/src/utils/supabase/client';

interface SelectFromTableAsyncProps<T extends Record<string, any>> {
  table: string;
  valueField: keyof T;
  labelField: keyof T;
  filterField: keyof T;
  value: number | string | null;
  placeholder?: string;
  onChange: (value: number | string | null) => void;
  onLabelChange?: (label: string | null) => void; // ⭐ NUEVO
}

export default function SelectFromTableAsync<T extends Record<string, any>>({
  table,
  valueField,
  labelField,
  filterField,
  value,
  placeholder = 'Selecciona...',
  onChange,
  onLabelChange, // ⭐ NUEVO
}: SelectFromTableAsyncProps<T>) {
  const supabase = createClient();
  const [selectedOption, setSelectedOption] = useState<{ value: number | string; label: string } | null>(null);

  useEffect(() => {
    if (value) {
      loadSelectedOption();
    } else {
      setSelectedOption(null);
      if (onLabelChange) onLabelChange(null);
    }
  }, [value]);

  // ⭐ NUEVO: Notificar cambios en el label
  useEffect(() => {
    if (onLabelChange && selectedOption) {
      onLabelChange(selectedOption.label);
    }
  }, [selectedOption, onLabelChange]);

  const loadOptions = async (inputValue: string) => {
    try {
      let query = supabase.from(table).select('*');
      
      if (inputValue) {
        query = query.ilike(String(filterField), `%${inputValue}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item: T) => ({
        value: item[valueField] as number | string,
        label: String(item[labelField]),
      }));
    } catch (error) {
      console.error('Error cargando opciones:', error);
      return [];
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
      }
    } catch (error) {
      console.error('Error cargando valor seleccionado:', error);
    }
  };

  const handleChange = (selected: any) => {
    setSelectedOption(selected);
    onChange(selected ? selected.value : null);
  };

  return (
    <AsyncSelect
      instanceId={`select-single-${table}-${String(valueField)}`}
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isClearable
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
  );
}