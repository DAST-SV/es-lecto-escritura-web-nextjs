import React, { JSX } from 'react';
import { Check, Image as ImageIcon } from 'lucide-react';

type ImagePosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right'
  | 'center-left' 
  | 'center' 
  | 'center-right'
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right'
  | 'full';

interface PositionOption {
  id: ImagePosition;
  label: string;
  cssClasses: string;
  preview: JSX.Element;
}

const POSITIONS: PositionOption[] = [
  {
    id: 'top-left',
    label: 'Arriba Izquierda',
    cssClasses: 'justify-start items-start',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="5" y="5" width="35" height="35" rx="2" fill="#10b981" />
        <rect x="50" y="15" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
        <rect x="50" y="25" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'top-center',
    label: 'Arriba Centro',
    cssClasses: 'justify-center items-start',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="32.5" y="5" width="35" height="35" rx="2" fill="#10b981" />
        <rect x="20" y="50" width="60" height="5" rx="1" fill="#6366f1" opacity="0.3" />
        <rect x="25" y="60" width="50" height="5" rx="1" fill="#6366f1" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'top-right',
    label: 'Arriba Derecha',
    cssClasses: 'justify-end items-start',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="60" y="5" width="35" height="35" rx="2" fill="#10b981" />
        <rect x="5" y="15" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
        <rect x="5" y="25" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'center-left',
    label: 'Centro Izquierda',
    cssClasses: 'justify-start items-center',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="5" y="32.5" width="35" height="35" rx="2" fill="#10b981" />
        <rect x="50" y="40" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
        <rect x="50" y="50" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'center',
    label: 'Centro',
    cssClasses: 'justify-center items-center',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="32.5" y="32.5" width="35" height="35" rx="2" fill="#10b981" />
        <rect x="20" y="75" width="60" height="5" rx="1" fill="#6366f1" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'center-right',
    label: 'Centro Derecha',
    cssClasses: 'justify-end items-center',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="60" y="32.5" width="35" height="35" rx="2" fill="#10b981" />
        <rect x="5" y="40" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
        <rect x="5" y="50" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'bottom-left',
    label: 'Abajo Izquierda',
    cssClasses: 'justify-start items-end',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="5" y="60" width="35" height="35" rx="2" fill="#10b981" />
        <rect x="50" y="15" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
        <rect x="50" y="25" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'bottom-center',
    label: 'Abajo Centro',
    cssClasses: 'justify-center items-end',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="32.5" y="60" width="35" height="35" rx="2" fill="#10b981" />
        <rect x="20" y="15" width="60" height="5" rx="1" fill="#6366f1" opacity="0.3" />
        <rect x="25" y="25" width="50" height="5" rx="1" fill="#6366f1" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'bottom-right',
    label: 'Abajo Derecha',
    cssClasses: 'justify-end items-end',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="60" y="60" width="35" height="35" rx="2" fill="#10b981" />
        <rect x="5" y="15" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
        <rect x="5" y="25" width="45" height="5" rx="1" fill="#6366f1" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'full',
    label: 'Pantalla Completa',
    cssClasses: '',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="5" y="5" width="90" height="90" rx="2" fill="#10b981" opacity="0.5" />
        <circle cx="35" cy="35" r="8" fill="#fbbf24" />
        <path d="M 15 75 L 35 55 L 55 65 L 85 35" stroke="#fff" strokeWidth="3" fill="none" />
      </svg>
    )
  }
];

interface ImagePositionSelectorProps {
  currentPosition: ImagePosition;
  onPositionChange: (position: ImagePosition) => void;
  disabled?: boolean;
}

export function ImagePositionSelector({
  currentPosition,
  onPositionChange,
  disabled = false
}: ImagePositionSelectorProps) {
  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <ImageIcon size={16} className="text-green-600" />
          Posición de la imagen
        </h4>
        {disabled && (
          <span className="text-xs text-gray-500 italic">Sube una imagen primero</span>
        )}
      </div>

      {/* Grid de posiciones */}
      <div className="grid grid-cols-3 gap-2">
        {POSITIONS.map((position) => {
          const isSelected = currentPosition === position.id;
          
          return (
            <button
              key={position.id}
              onClick={() => onPositionChange(position.id)}
              disabled={disabled}
              className={`
                relative p-2 rounded-lg border-2 transition-all aspect-square
                ${isSelected 
                  ? 'border-green-600 bg-green-50 shadow-md ring-2 ring-green-200' 
                  : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                }
                disabled:cursor-not-allowed
              `}
              title={position.label}
            >
              {/* Preview visual */}
              <div className="w-full h-full">
                {position.preview}
              </div>

              {/* Check cuando seleccionado */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full p-0.5">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}

              {/* Label en hover */}
              <div className="absolute inset-x-0 -bottom-6 text-center">
                <span className="text-[10px] text-gray-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {position.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Label del seleccionado */}
      <div className="text-center">
        <span className="text-xs font-medium text-gray-700">
          {POSITIONS.find(p => p.id === currentPosition)?.label || 'Centro'}
        </span>
      </div>

      {/* Ayuda */}
      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-[10px] text-blue-800">
          💡 <strong>Tip:</strong> Haz clic en una posición para ver cómo quedará tu imagen
        </p>
      </div>
    </div>
  );
}

export type { ImagePosition };