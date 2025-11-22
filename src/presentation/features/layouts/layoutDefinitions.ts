/**
 * Definiciones visuales de layouts
 * Contiene los SVG previews y metadata de cada layout
 */

export interface LayoutDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'text' | 'image' | 'mixed' | 'special';
  preview: string; // SVG string
  isSpecial?: boolean; // Para layouts como Portada
}

export const LAYOUT_DEFINITIONS: LayoutDefinition[] = [
  {
    id: 'TextCenterLayout',
    name: 'Solo Texto',
    description: 'Texto centrado, perfecto para narración',
    emoji: '📝',
    category: 'text',
    preview: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="30" width="80" height="8" rx="2" fill="#6366f1" opacity="0.8"/>
        <rect x="10" y="45" width="80" height="8" rx="2" fill="#6366f1" opacity="0.6"/>
        <rect x="10" y="60" width="60" height="8" rx="2" fill="#6366f1" opacity="0.4"/>
      </svg>
    `
  },
  {
    id: 'ImageFullLayout',
    name: 'Solo Imagen',
    description: 'Imagen a pantalla completa, ideal para ilustraciones grandes',
    emoji: '🖼️',
    category: 'image',
    preview: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="90" height="90" rx="4" fill="#10b981" opacity="0.3"/>
        <circle cx="30" cy="30" r="8" fill="#10b981" opacity="0.6"/>
        <path d="M 20 70 L 40 50 L 60 60 L 80 40" stroke="#10b981" stroke-width="3" fill="none" opacity="0.8"/>
        <circle cx="70" cy="25" r="5" fill="#fbbf24" opacity="0.8"/>
      </svg>
    `
  },
  {
    id: 'ImageLeftTextRightLayout',
    name: 'Imagen + Texto',
    description: 'Imagen a la izquierda, texto a la derecha',
    emoji: '🖼️📝',
    category: 'mixed',
    preview: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="40" height="80" rx="2" fill="#10b981" opacity="0.3"/>
        <circle cx="25" cy="40" r="6" fill="#10b981" opacity="0.6"/>
        <rect x="55" y="25" width="40" height="8" rx="2" fill="#6366f1" opacity="0.8"/>
        <rect x="55" y="40" width="40" height="8" rx="2" fill="#6366f1" opacity="0.6"/>
        <rect x="55" y="55" width="30" height="8" rx="2" fill="#6366f1" opacity="0.4"/>
      </svg>
    `
  },
  {
    id: 'TextLeftImageRightLayout',
    name: 'Texto + Imagen',
    description: 'Texto a la izquierda, imagen a la derecha',
    emoji: '📝🖼️',
    category: 'mixed',
    preview: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="25" width="40" height="8" rx="2" fill="#6366f1" opacity="0.8"/>
        <rect x="5" y="40" width="40" height="8" rx="2" fill="#6366f1" opacity="0.6"/>
        <rect x="5" y="55" width="30" height="8" rx="2" fill="#6366f1" opacity="0.4"/>
        <rect x="55" y="10" width="40" height="80" rx="2" fill="#10b981" opacity="0.3"/>
        <circle cx="75" cy="50" r="8" fill="#10b981" opacity="0.6"/>
      </svg>
    `
  },
  {
    id: 'SplitTopBottomLayout',
    name: 'Imagen Arriba',
    description: 'Imagen arriba, texto abajo, ideal para mostrar escenas',
    emoji: '🎨',
    category: 'mixed',
    preview: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="40" rx="2" fill="#10b981" opacity="0.3"/>
        <circle cx="35" cy="30" r="5" fill="#10b981" opacity="0.6"/>
        <rect x="10" y="60" width="80" height="8" rx="2" fill="#6366f1" opacity="0.8"/>
        <rect x="10" y="75" width="60" height="8" rx="2" fill="#6366f1" opacity="0.6"/>
      </svg>
    `
  },
  {
    id: 'SplitLayout',
    name: 'Dividido',
    description: 'Layout balanceado 50/50',
    emoji: '⚖️',
    category: 'mixed',
    preview: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="20" width="40" height="60" rx="2" fill="#10b981" opacity="0.3"/>
        <rect x="55" y="30" width="40" height="8" rx="2" fill="#6366f1" opacity="0.8"/>
        <rect x="55" y="45" width="40" height="8" rx="2" fill="#6366f1" opacity="0.6"/>
        <rect x="55" y="60" width="30" height="8" rx="2" fill="#6366f1" opacity="0.4"/>
      </svg>
    `
  },
  {
    id: 'CenterImageDownTextLayout',
    name: 'Imagen Centrada',
    description: 'Imagen centrada con texto abajo',
    emoji: '🎯',
    category: 'mixed',
    preview: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="15" width="50" height="45" rx="2" fill="#10b981" opacity="0.3"/>
        <circle cx="50" cy="35" r="8" fill="#10b981" opacity="0.6"/>
        <rect x="15" y="70" width="70" height="8" rx="2" fill="#6366f1" opacity="0.8"/>
        <rect x="20" y="85" width="60" height="6" rx="2" fill="#6366f1" opacity="0.6"/>
      </svg>
    `
  },
  {
    id: 'CoverLayout',
    name: 'Portada',
    description: 'Diseño especial para la portada del libro',
    emoji: '📖',
    category: 'special',
    isSpecial: true,
    preview: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="90" height="90" rx="4" fill="#f59e0b" opacity="0.2"/>
        <rect x="15" y="35" width="70" height="12" rx="2" fill="#f59e0b" opacity="0.8"/>
        <rect x="20" y="55" width="60" height="8" rx="2" fill="#f59e0b" opacity="0.6"/>
        <rect x="25" y="70" width="50" height="6" rx="1" fill="#f59e0b" opacity="0.4"/>
        <path d="M 50 15 L 55 25 L 65 27 L 57 35 L 59 45 L 50 40 L 41 45 L 43 35 L 35 27 L 45 25 Z" fill="#fbbf24" opacity="0.6"/>
      </svg>
    `
  },
];

// Helper para obtener layout por ID
export function getLayoutDefinition(id: string): LayoutDefinition | undefined {
  return LAYOUT_DEFINITIONS.find(layout => layout.id === id);
}

// Helper para filtrar por categoría
export function getLayoutsByCategory(category: LayoutDefinition['category']): LayoutDefinition[] {
  return LAYOUT_DEFINITIONS.filter(layout => layout.category === category);
}