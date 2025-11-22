/**
 * UBICACIÓN: src/presentation/features/editor/extensions/FontFamily.extension.ts
 * 
 * Extensión TipTap para cambiar familia de fuente
 */

import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

export const FontFamilyExtension = Extension.create({
  name: 'fontFamily',

  addOptions() {
    return {
      types: ['textStyle'],
      defaultFamily: 'Arial, sans-serif',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: this.options.defaultFamily,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, '') || this.options.defaultFamily,
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {};
              }
              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily: string) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontFamily }).run();
        },
      unsetFontFamily:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontFamily: this.options.defaultFamily })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// Fuentes predefinidas amigables para niños
export const FONT_FAMILIES = {
  'Arial': 'Arial, sans-serif',
  'Comic Sans': '"Comic Sans MS", cursive',
  'Georgia': 'Georgia, serif',
  'Times New Roman': '"Times New Roman", serif',
  'Verdana': 'Verdana, sans-serif',
  'Courier New': '"Courier New", monospace',
  'Impact': 'Impact, fantasy',
  'Brush Script': '"Brush Script MT", cursive',
} as const;

export type FontFamilyKey = keyof typeof FONT_FAMILIES;