"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { createClient } from "@/src/utils/supabase/client";
import { MultiValue, ActionMeta } from "react-select";

interface MultiSelectFromTableProps<T> {
  table: string;
  valueField: keyof T;
  labelField: keyof T;
  filterField?: keyof T;
  values?: (number | string)[];
  placeholder?: string;
  onChange?: (values: (number | string)[]) => void;
  maxItems?: number;
}

interface OptionType {
  value: number | string;
  label: string;
}

export default function MultiSelectFromTable<T>({
  table,
  valueField,
  labelField,
  filterField,
  values = [],
  placeholder = "Selecciona...",
  onChange,
  maxItems = 5
}: MultiSelectFromTableProps<T>) {
  const supabase = createClient();
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);

  // Cargar labels para los valores seleccionados
  useEffect(() => {
    if (!values.length) {
      setSelectedOptions([]);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from(table)
        .select(`${String(valueField)}, ${String(labelField)}`)
        .in(String(valueField), values);

      if (!error && data) {
        const options = data.map((item: any) => ({
          value: item[String(valueField)],
          label: item[String(labelField)],
        }));
        setSelectedOptions(options);
      }
    })();
  }, [values, table, valueField, labelField, supabase]);

  // Función para cargar opciones desde Supabase
  const loadOptions = async (inputValue: string) => {
    try {
      let query = supabase.from(table).select(`${String(valueField)}, ${String(labelField)}`);
      if (inputValue && filterField) {
        query = query.ilike(String(filterField), `%${inputValue}%`);
      }
      const { data, error } = await query.limit(50);
      if (error) throw error;

      // Filtrar opciones ya seleccionadas
      const availableOptions = (data || [])
        .filter((item: any) => !values.includes(item[String(valueField)]))
        .map((item: any) => ({
          value: item[String(valueField)],
          label: item[String(labelField)],
        }));

      return availableOptions;
    } catch (err: any) {
      console.error(`Error cargando opciones de ${table}:`, err.message);
      return [];
    }
  };

  const handleChange = (
    selected: MultiValue<OptionType>,
    _actionMeta: ActionMeta<OptionType>
  ) => {
    const newOptions = selected ? Array.from(selected) : [];
    setSelectedOptions(newOptions);

    if (onChange) {
      const newValues = newOptions.map(option => option.value);
      onChange(newValues);
    }
  };


  const removeItem = (valueToRemove: number | string) => {
    const newOptions = selectedOptions.filter(option => option.value !== valueToRemove);
    setSelectedOptions(newOptions);

    if (onChange) {
      const newValues = newOptions.map(option => option.value);
      onChange(newValues);
    }
  };

  const isMaxReached = selectedOptions.length >= maxItems;

  return (
    <div className="multi-select-container">
      {/* Elementos seleccionados */}
      {selectedOptions.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <div
                key={option.value}
                className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                <span>{option.label}</span>
                <button
                  onClick={() => removeItem(option.value)}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {isMaxReached && (
            <p className="text-xs text-gray-500 mt-1">
              Máximo {maxItems} elementos seleccionados
            </p>
          )}
        </div>
      )}

      {/* Selector */}
      {!isMaxReached && (
        <AsyncSelect
          isMulti
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onChange={handleChange}
          value={selectedOptions} // ahora sí usamos las opciones seleccionadas
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
          }}
        />
      )}
    </div>
  );
}