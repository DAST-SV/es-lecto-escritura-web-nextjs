/**
 * UBICACIÓN: src/presentation/features/editor/extensions/FontSize.extension.ts
 * 
 * Extensión TipTap para tamaño de fuente usando REM (responsive)
 */

import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

export const FontSizeExtension = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
      defaultSize: '1rem', // 16px en navegadores estándar
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: this.options.defaultSize,
            parseHTML: element => {
              const fontSize = element.style.fontSize;
              // Convertir px a rem si es necesario (asumiendo 16px = 1rem)
              if (fontSize?.includes('px')) {
                const px = parseFloat(fontSize);
                return `${px / 16}rem`;
              }
              return fontSize || this.options.defaultSize;
            },
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: this.options.defaultSize })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// Tamaños predefinidos en REM (responsive)
export const FONT_SIZES = {
  'extra-small': '0.625rem',  // 10px
  'small': '0.75rem',         // 12px
  'normal': '0.875rem',       // 14px
  'medium': '1rem',           // 16px (base)
  'large': '1.125rem',        // 18px
  'extra-large': '1.25rem',   // 20px
  'huge': '1.5rem',           // 24px
  'massive': '2rem',          // 32px
} as const;

export type FontSizeKey = keyof typeof FONT_SIZES;