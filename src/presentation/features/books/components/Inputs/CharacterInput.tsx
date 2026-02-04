/**
 * UBICACIÓN: src/presentation/features/books/components/Inputs/CharacterInput.tsx
 * Componente para agregar personajes a un libro (lista editable)
 */

'use client';

import React, { useState } from 'react';
import { Plus, X, User, GripVertical, ChevronDown } from 'lucide-react';

export interface BookCharacter {
  id?: string;
  name: string;
  description?: string;
  role: 'main' | 'secondary' | 'supporting';
}

interface CharacterInputProps {
  characters: BookCharacter[];
  onChange: (characters: BookCharacter[]) => void;
  label?: string;
  maxCharacters?: number;
}

const roleLabels: Record<string, { es: string; color: string }> = {
  main: { es: 'Principal', color: 'bg-amber-100 text-amber-800' },
  secondary: { es: 'Secundario', color: 'bg-sky-100 text-sky-800' },
  supporting: { es: 'De apoyo', color: 'bg-gray-100 text-gray-700' },
};

export function CharacterInput({
  characters,
  onChange,
  label = 'Personajes',
  maxCharacters = 20
}: CharacterInputProps) {
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'main' | 'secondary' | 'supporting'>('main');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || characters.length >= maxCharacters) return;

    const newCharacter: BookCharacter = {
      name: newName.trim(),
      role: newRole,
    };

    onChange([...characters, newCharacter]);
    setNewName('');
    setNewRole('main');
  };

  const handleRemove = (index: number) => {
    const updated = characters.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(characters[index].name);
  };

  const handleSaveEdit = (index: number) => {
    if (!editValue.trim()) return;

    const updated = [...characters];
    updated[index] = { ...updated[index], name: editValue.trim() };
    onChange(updated);
    setEditingIndex(null);
    setEditValue('');
  };

  const handleChangeRole = (index: number, role: 'main' | 'secondary' | 'supporting') => {
    const updated = [...characters];
    updated[index] = { ...updated[index], role };
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...characters];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === characters.length - 1) return;
    const updated = [...characters];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="border-2 border-violet-200/60 rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <User size={13} />
          {label}
        </label>
        {characters.length > 0 && (
          <span className="text-[10px] text-gray-500 bg-violet-50 px-2 py-0.5 rounded-full">
            {characters.length}/{maxCharacters}
          </span>
        )}
      </div>

      {/* Lista de personajes */}
      {characters.length > 0 && (
        <div className="space-y-2 mb-3">
          {characters.map((char, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
            >
              {/* Grip para reordenar */}
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                  title="Mover arriba"
                >
                  <ChevronDown size={10} className="rotate-180" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === characters.length - 1}
                  className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                  title="Mover abajo"
                >
                  <ChevronDown size={10} />
                </button>
              </div>

              {/* Nombre */}
              <div className="flex-1 min-w-0">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveEdit(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(index);
                      if (e.key === 'Escape') setEditingIndex(null);
                    }}
                    autoFocus
                    className="w-full px-2 py-0.5 text-xs border border-violet-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-300"
                  />
                ) : (
                  <span
                    onClick={() => handleStartEdit(index)}
                    className="text-xs text-gray-900 font-medium cursor-pointer hover:text-violet-700 block truncate"
                    title="Clic para editar"
                  >
                    {index + 1}. {char.name}
                  </span>
                )}
              </div>

              {/* Selector de rol */}
              <select
                value={char.role}
                onChange={(e) => handleChangeRole(index, e.target.value as 'main' | 'secondary' | 'supporting')}
                className={`text-[10px] px-1.5 py-0.5 rounded border-0 cursor-pointer ${roleLabels[char.role].color}`}
              >
                <option value="main">Principal</option>
                <option value="secondary">Secundario</option>
                <option value="supporting">De apoyo</option>
              </select>

              {/* Botón eliminar */}
              <button
                onClick={() => handleRemove(index)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Eliminar personaje"
              >
                <X size={12} className="text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input para agregar nuevo */}
      {characters.length < maxCharacters && (
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nombre del personaje..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:border-violet-400 focus:ring-1 focus:ring-violet-200 focus:outline-none transition-all"
            />
          </div>

          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as 'main' | 'secondary' | 'supporting')}
            className="text-[10px] px-2 py-1.5 border border-gray-300 rounded-md focus:border-violet-400 focus:outline-none"
          >
            <option value="main">Principal</option>
            <option value="secondary">Secundario</option>
            <option value="supporting">De apoyo</option>
          </select>

          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="p-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Agregar personaje"
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      {/* Mensaje cuando está lleno */}
      {characters.length >= maxCharacters && (
        <p className="text-[10px] text-gray-500 text-center mt-2">
          Máximo de personajes alcanzado
        </p>
      )}

      {/* Hint */}
      {characters.length === 0 && (
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Agrega los personajes principales de tu historia
        </p>
      )}
    </div>
  );
}
