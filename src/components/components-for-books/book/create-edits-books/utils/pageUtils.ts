import type { page } from '@/src/typings/types-page-book/index';

/**
 * Crea páginas por defecto para un libro nuevo
 */
export const createDefaultPages = (title?: string): page[] => [
  {
    id: 'page-1',
    layout: 'CoverLayout',
    title: title || "Mi Libro Interactivo",
    text: "Una historia maravillosa comienza aquí...",
    image: null,
    background: null,
  },
  {
    id: 'page-2',
    layout: 'TextLeftImageRightLayout',
    title: "Capítulo 1",
    text: "Érase una vez en un reino muy lejano, donde las historias cobran vida...",
    image: null,
    background: null,
  },
];

/**
 * Valida y normaliza una página recibida desde props o API
 */
export const validateAndNormalizePage = (inputPage: any, index: number): page => {
  return {
    id: inputPage.id || `page-${index + 1}`,
    layout: inputPage.layout || 'FullpageLayout',
    title: inputPage.title || `Página ${index + 1}`,
    text: inputPage.text || 'Contenido de la página...',
    image: inputPage.image || null,
    file: null, // Los archivos no se pasan como props iniciales
    background: inputPage.background || null,
    backgroundFile: null, // Los archivos de fondo tampoco
  };
};

/**
 * Genera un ID único para una página nueva
 */
export const generatePageId = (): string => {
  return `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Crea una página en blanco con valores por defecto
 */
export const createBlankPage = (pageNumber: number): page => {
  return {
    id: generatePageId(),
    layout: 'FullpageLayout',
    title: `Página ${pageNumber}`,
    text: `Continúa tu historia aquí...`,
    image: null,
    background: null,
  };
};

/**
 * Duplica una página existente con nuevo ID
 */
export const duplicatePage = (sourcePage: page, newPageNumber: number): page => {
  return {
    ...sourcePage,
    id: generatePageId(),
    title: `${sourcePage.title} (Copia)`,
    // No copiamos archivos blob - solo las configuraciones
    file: null,
    backgroundFile: null
  };
};

/**
 * Valida si una página tiene contenido mínimo
 */
export const isPageComplete = (page: page): boolean => {
  const hasTitle = page.title && page.title.trim().length > 0;
  const hasText = page.text && page.text.trim().length > 0;
  const hasContent = hasTitle || hasText || page.image != null;
  
  return hasContent;
};

/**
 * Obtiene estadísticas básicas de un conjunto de páginas
 */
export const getBookStatistics = (pages: page[]) => {
  const totalPages = pages.length;
  const pagesWithImages = pages.filter(p => p.image).length;
  const pagesWithBackground = pages.filter(p => p.background).length;
  const completedPages = pages.filter(isPageComplete).length;
  const totalCharacters = pages.reduce((total, p) => 
    total + (p.title?.length || 0) + (p.text?.length || 0), 0
  );

  return {
    totalPages,
    pagesWithImages,
    pagesWithBackground,
    completedPages,
    totalCharacters,
    completionRate: Math.round((completedPages / totalPages) * 100)
  };
};

/**
 * Limpia recursos blob de una página
 */
export const cleanupPageResources = (page: page): void => {
  if (page.image && page.image.startsWith('blob:')) {
    URL.revokeObjectURL(page.image);
  }
  if (page.background && typeof page.background === 'string' && page.background.startsWith('blob:')) {
    URL.revokeObjectURL(page.background);
  }
};

/**
 * Limpia recursos blob de múltiples páginas
 */
export const cleanupPagesResources = (pages: page[]): void => {
  pages.forEach(cleanupPageResources);
};

/**
 * Busca páginas por texto en título o contenido
 */
export const searchPagesBy = (pages: page[], searchTerm: string): page[] => {
  if (!searchTerm.trim()) return pages;
  
  const term = searchTerm.toLowerCase();
  return pages.filter(page => {
    const titleMatch = page.title?.toLowerCase().includes(term);
    const textMatch = page.text?.toLowerCase().includes(term);
    return titleMatch || textMatch;
  });
};

/**
 * Ordena páginas por diferentes criterios
 */
export const sortPagesBy = (pages: page[], criteria: 'title' | 'length' | 'created'): page[] => {
  const sortedPages = [...pages];
  
  switch (criteria) {
    case 'title':
      return sortedPages.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    
    case 'length':
      return sortedPages.sort((a, b) => {
        const aLength = (a.title?.length || 0) + (a.text?.length || 0);
        const bLength = (b.title?.length || 0) + (b.text?.length || 0);
        return bLength - aLength; // Descendente
      });
    
    case 'created':
      return sortedPages.sort((a, b) => {
        // Asumir que IDs más nuevos tienen timestamps más altos
        const aTime = a.id.includes('-') ? parseInt(a.id.split('-')[1]) || 0 : 0;
        const bTime = b.id.includes('-') ? parseInt(b.id.split('-')[1]) || 0 : 0;
        return bTime - aTime; // Más nuevos primero
      });
    
    default:
      return sortedPages;
  }
};