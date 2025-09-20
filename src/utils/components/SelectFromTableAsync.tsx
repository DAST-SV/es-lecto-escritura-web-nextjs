"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { createClient } from "@/src/utils/supabase/client";

interface SelectFromTableAsyncProps<T> {
  table: string;
  valueField: keyof T;
  labelField: keyof T;
  filterField?: keyof T;
  value?: number | string | null;
  placeholder?: string;
  onChange?: (value: number | string | null) => void;
}

export default function SelectFromTableAsync<T>({
  table,
  valueField,
  labelField,
  filterField,
  value,
  placeholder = "Selecciona...",
  onChange,
}: SelectFromTableAsyncProps<T>) {
  const supabase = createClient();
  const [selectedOption, setSelectedOption] = useState<{ value: any; label: string } | null>(null);

  // Cuando cambia `value`, obtenemos el label desde la BD
  useEffect(() => {
    if (!value) {
      setSelectedOption(null);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from(table)
        .select(`${String(valueField)}, ${String(labelField)}`)
        .eq(String(valueField), value)
        .maybeSingle();

      if (!error && data) {
        const d = data as any;
        setSelectedOption({
          value: d[String(valueField)],
          label: d[String(labelField)],
        });
      }
    })();
  }, [value, table, valueField, labelField, supabase]);

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
        value: item[String(valueField)],
        label: item[String(labelField)],
      }));
    } catch (err: any) {
      console.error(`Error cargando opciones de ${table}:`, err.message);
      return [];
    }
  };

  return (
    <div style={{ padding: "12px" }}>
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        onChange={(selected) => {
          setSelectedOption(selected);
          onChange && onChange(selected ? selected.value : null);
        }}
        value={selectedOption}
        placeholder={placeholder}
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: "12px",
            padding: "6px 10px",
            fontSize: "16px",
            backgroundColor: "#fff3cd",
            borderColor: "#ffcc80",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            ":hover": { borderColor: "#ffb74d" },
          }),
          menu: (base) => ({
            ...base,
            borderRadius: "12px",
            marginTop: "6px",
            backgroundColor: "#fff9e6",
          }),
          option: (base, state) => ({
            ...base,
            fontSize: "15px",
            padding: "10px",
            backgroundColor: state.isSelected
              ? "#ffe082"
              : state.isFocused
              ? "#fff3cd"
              : "#fff9e6",
            color: "#333",
            cursor: "pointer",
          }),
          placeholder: (base) => ({
            ...base,
            color: "#666",
            fontStyle: "italic",
          }),
          singleValue: (base) => ({
            ...base,
            fontWeight: "bold",
            color: "#444",
          }),
        }}
      />
    </div>
  );
}
