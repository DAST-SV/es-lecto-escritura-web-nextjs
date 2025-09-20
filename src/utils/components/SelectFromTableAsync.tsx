"use client";

import React from "react";
import AsyncSelect from "react-select/async";
import { createClient } from "@/src/utils/supabase/client";

// Tipamos las props con un generic T para que el valueField y labelField sean dinámicos
interface SelectFromTableAsyncProps<T> {
  table: string;
  valueField: keyof T;       // columna usada como value
  labelField: keyof T;       // columna usada como label
  placeholder?: string;
  onChange?: (value: T[keyof T] | null) => void;
  value?: T[keyof T] | null;
  filterField?: keyof T;     // columna usada para búsqueda
}

export default function SelectFromTableAsync<T>({
  table,
  valueField,
  labelField,
  placeholder = "Selecciona una opción",
  onChange,
  value,
  filterField,
}: SelectFromTableAsyncProps<T>) {

    let supabase = createClient()
  // Función para cargar opciones desde Supabase
  const loadOptions = async (inputValue: string) => {
    try {
      let query = supabase.from(table).select(`${String(valueField)}, ${String(labelField)}`);
      if (inputValue && filterField) {
        query = query.ilike(String(filterField), `%${inputValue}%`);
      }
      const { data, error } = await query.limit(50);
      if (error) throw error;

      return (data || []).map((item: any) => ({
        value: item[valueField],
        label: item[labelField],
      }));
    } catch (err: any) {
      console.error(`Error cargando opciones de ${table}:`, err.message);
      return [];
    }
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      onChange={(selected) => onChange && onChange(selected ? selected.value : null)}
      value={value ? { value, label: value } : null}
      placeholder={placeholder}
    />
  );
}
