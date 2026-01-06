/**
 * UBICACIÓN: src/presentation/features/books/components/Inputs/AutoresInput.tsx
 * ✅ Input para gestionar múltiples autores
 */

'use client';

import React from 'react';
import { Plus, X, User } from 'lucide-react';

interface AutoresInputProps {
  autores: string[];
  onChange: (autores: string[]) => void;
  maxAutores?: number;
}

export function AutoresInput({ 
  autores, 
  onChange, 
  maxAutores = 5 
}: AutoresInputProps) {
  
  const addAutor = () => {
    if (autores.length < maxAutores) {
      onChange([...autores, '']);
    }
  };

  const removeAutor = (idx: number) => {
    if (autores.length > 1) {
      onChange(autores.filter((_, i) => i !== idx));
    }
  };

  const updateAutor = (idx: number, value: string) => {
    const updated = [...autores];
    updated[idx] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">
          Autores <span className="text-red-500">*</span>
          <span className="ml-2 text-gray-500">({autores.length}/{maxAutores})</span>
        </label>
        {autores.length < maxAutores && (
          <button 
            onClick={addAutor}
            type="button"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Plus size={12} />
            Agregar
          </button>
        )}
      </div>

      <div className="space-y-2">
        {autores.map((autor, idx) => (
          <div key={idx} className="flex gap-2">
            <div className="relative flex-1">
              <User size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={autor} 
                onChange={(e) => updateAutor(idx, e.target.value)} 
                placeholder={`Autor ${idx + 1}`}
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {autores.length > 1 && (
              <button 
                onClick={() => removeAutor(idx)}
                type="button"
                className="px-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {autores.filter(a => a.trim()).length === 0 && (
        <p className="text-xs text-red-600">⚠️ Debe haber al menos un autor</p>
      )}
    </div>
  );
}