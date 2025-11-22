/**
 * UBICACIÓN: src/presentation/features/editor/components/RichTextEditor/extensions/PasteHandlerExtension.ts
 * 
 * Extensión TipTap para pegar SIEMPRE sin formato (solo texto plano)
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const PasteHandlerExtension = Extension.create({
  name: 'pasteHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('pasteHandler'),
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain');

            if (text) {
              // Prevenir el comportamiento por defecto
              event.preventDefault();

              // Insertar solo el texto plano
              const { state, dispatch } = view;
              const { tr } = state;

              tr.insertText(text);
              dispatch(tr);

              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});