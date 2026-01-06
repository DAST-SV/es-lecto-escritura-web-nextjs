/**
 * UBICACIÓN: src/presentation/features/books/components/Inputs/PersonajesInput.tsx
 * ✅ Input para gestionar múltiples personajes
 */

'use client';

import React from 'react';
import { Plus, X, Users } from 'lucide-react';

interface PersonajesInputProps {
  personajes: string[];
  onChange: (personajes: string[]) => void;
  maxPersonajes?: number;
}

export function PersonajesInput({ 
  personajes, 
  onChange, 
  maxPersonajes = 10 
}: PersonajesInputProps) {
  
  const addPersonaje = () => {
    if (personajes.length < maxPersonajes) {
      onChange([...personajes, '']);
    }
  };

  const removePersonaje = (idx: number) => {
    onChange(personajes.filter((_, i) => i !== idx));
  };

  const updatePersonaje = (idx: number, value: string) => {
    const updated = [...personajes];
    updated[idx] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">
          Personajes (opcional)
          <span className="ml-2 text-gray-500">({personajes.length}/{maxPersonajes})</span>
        </label>
        {personajes.length < maxPersonajes && (
          <button 
            onClick={addPersonaje}
            type="button"
            className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            <Plus size={12} />
            Agregar
          </button>
        )}
      </div>

      {personajes.length > 0 ? (
        <div className="space-y-2">
          {personajes.map((personaje, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="relative flex-1">
                <Users size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={personaje} 
                  onChange={(e) => updatePersonaje(idx, e.target.value)} 
                  placeholder={`Personaje ${idx + 1}`}
                  className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                />
              </div>
              <button 
                onClick={() => removePersonaje(idx)}
                type="button"
                className="px-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-400">Sin personajes agregados</p>
        </div>
      )}
    </div>
  );
}