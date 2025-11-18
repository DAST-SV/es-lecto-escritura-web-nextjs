import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import { createClient } from '@/src/utils/supabase/client';

interface SelectFromTableAsyncProps<T extends Record<string, any>> {
  table: string;
  valueField: keyof T;
  labelField: keyof T;
  filterField: keyof T;
  value: number | string | null;
  placeholder?: string;
  onChange: (value: number | string | null) => void;
}

export default function SelectFromTableAsync<T extends Record<string, any>>({
  table,
  valueField,
  labelField,
  filterField,
  value,
  placeholder = 'Selecciona...',
  onChange,
}: SelectFromTableAsyncProps<T>) {
  const supabase = createClient();
  const [options, setOptions] = useState<{ value: number | string; label: string }[]>([]);
  const [selectedOption, setSelectedOption] = useState<{ value: number | string; label: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 FIX: Generar instanceId único y estable
  const instanceId = useMemo(() => {
    return `select-single-${table}-${String(valueField)}`;
  }, [table, valueField]);

  useEffect(() => {
    loadOptions();
  }, [table]);

  useEffect(() => {
    if (value !== null && value !== undefined) {
      loadSelectedOption();
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const loadOptions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from(table).select('*');

      if (error) throw error;

      const formattedOptions = (data || []).map((item: T) => ({
        value: item[valueField] as number | string,
        label: String(item[labelField]),
      }));

      setOptions(formattedOptions);
    } catch (error) {
      console.error('Error cargando opciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedOption = async () => {
    if (!value) return;

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(String(valueField), value)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedOption({
          value: data[valueField] as number | string,
          label: String(data[labelField]),
        });
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
    <div style={{ padding: '12px' }}>
      <Select
        instanceId={instanceId} // 🔥 FIX: ID estable
        value={selectedOption}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isClearable
        isLoading={isLoading}
        noOptionsMessage={() => 'No hay opciones'}
        loadingMessage={() => 'Cargando...'}
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: '8px',
            borderColor: '#d1d5db',
            minHeight: '42px',
            '&:hover': { borderColor: '#9ca3af' },
          }),
          placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
          }),
        }}
      />
    </div>
  );
}