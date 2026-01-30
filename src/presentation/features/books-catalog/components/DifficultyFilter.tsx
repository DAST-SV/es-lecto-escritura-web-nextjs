// src/presentation/features/books-catalog/components/DifficultyFilter.tsx
'use client';

import { useState } from 'react';
import type { DifficultyLevel } from '@/src/core/domain/entities/BookWithTranslations';

interface DifficultyFilterProps {
  selected?: DifficultyLevel;
  onChange: (difficulty: DifficultyLevel | undefined) => void;
}

const difficulties: { value: DifficultyLevel; label: string; color: string; description: string }[] = [
  { value: 'beginner', label: 'Principiante', color: 'green', description: '3-5 años' },
  { value: 'elementary', label: 'Elemental', color: 'blue', description: '6-8 años' },
  { value: 'intermediate', label: 'Intermedio', color: 'yellow', description: '9-11 años' },
  { value: 'advanced', label: 'Avanzado', color: 'red', description: '12+ años' }
];

export function DifficultyFilter({ selected, onChange }: DifficultyFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(undefined)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !selected
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Todos
      </button>

      {difficulties.map((diff) => (
        <button
          key={diff.value}
          onClick={() => onChange(diff.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected === diff.value
              ? `bg-${diff.color}-500 text-white`
              : `bg-${diff.color}-50 text-${diff.color}-700 hover:bg-${diff.color}-100`
          }`}
          title={diff.description}
        >
          {diff.label}
        </button>
      ))}
    </div>
  );
}
