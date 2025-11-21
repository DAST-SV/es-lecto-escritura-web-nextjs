import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

/**
 * Extensión para tamaño de fuente
 */
export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
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
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

/**
 * Extensión para familia de fuente
 */
export const FontFamily = Extension.create({
  name: 'fontFamily',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
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
      setFontFamily: (fontFamily: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily })
          .run();
      },
      unsetFontFamily: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

/**
 * Extensión para interlineado
 */
export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultLineHeight: '1.5',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight || attributes.lineHeight === this.options.defaultLineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ commands }) => {
        return this.options.types.every((type: string) =>
          commands.updateAttributes(type, { lineHeight })
        );
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every((type: string) =>
          commands.resetAttributes(type, 'lineHeight')
        );
      },
    };
  },
});

/**
 * Extensión para margen de párrafo
 */
export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',

  addOptions() {
    return {
      types: ['paragraph'],
      defaultSpacing: '0',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          paragraphSpacing: {
            default: this.options.defaultSpacing,
            parseHTML: element => element.style.marginBottom || this.options.defaultSpacing,
            renderHTML: attributes => {
              if (!attributes.paragraphSpacing || attributes.paragraphSpacing === this.options.defaultSpacing) {
                return {};
              }
              return {
                style: `margin-bottom: ${attributes.paragraphSpacing}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphSpacing: (spacing: string) => ({ commands }: any) => {
        return this.options.types.every((type: string) =>
          commands.updateAttributes(type, { paragraphSpacing: spacing })
        );
      },
      unsetParagraphSpacing: () => ({ commands }: any) => {
        return this.options.types.every((type: string) =>
          commands.resetAttributes(type, 'paragraphSpacing')
        );
      },
    } as any;
  },
});

/**
 * Extensión para indentación
 */
export const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      minLevel: 0,
      maxLevel: 8,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const indent = element.style.paddingLeft;
              return indent ? parseInt(indent) / 30 : 0;
            },
            renderHTML: attributes => {
              if (!attributes.indent || attributes.indent === 0) {
                return {};
              }
              return {
                style: `padding-left: ${attributes.indent * 30}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ commands, state }: any) => {
        const { selection } = state;
        const { $from } = selection;
        const node = $from.node();
        const currentIndent = node.attrs.indent || 0;
        
        if (currentIndent < this.options.maxLevel) {
          return commands.updateAttributes($from.node().type.name, {
            indent: currentIndent + 1
          });
        }
        return false;
      },
      outdent: () => ({ commands, state }: any) => {
        const { selection } = state;
        const { $from } = selection;
        const node = $from.node();
        const currentIndent = node.attrs.indent || 0;
        
        if (currentIndent > this.options.minLevel) {
          return commands.updateAttributes($from.node().type.name, {
            indent: currentIndent - 1
          });
        }
        return false;
      },
    } as any;
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // Usar chain para acceder a comandos personalizados
        return (this.editor.commands as any).indent?.() || false;
      },
      'Shift-Tab': () => {
        return (this.editor.commands as any).outdent?.() || false;
      },
    };
  },
});