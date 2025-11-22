/**
 * UBICACIÓN: src/presentation/features/editor/extensions/PasteHandler.extension.ts
 * 
 * Extensión TipTap para pegar SIEMPRE sin formato (solo texto plano)
 * Sobrescribe completamente el comportamiento de pegado
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
          /**
           * Intercepta TODOS los eventos de pegado
           * y convierte el contenido a texto plano
           */
          handlePaste: (view, event, slice) => {
            // Prevenir comportamiento por defecto
            event.preventDefault();

            // Obtener solo el texto plano del clipboard
            const text = event.clipboardData?.getData('text/plain');

            if (!text) {
              return true; // No hay texto, ignorar
            }

            // Insertar el texto plano directamente
            const { state, dispatch } = view;
            const { tr, selection } = state;

            // Eliminar selección actual si existe
            if (!selection.empty) {
              tr.deleteSelection();
            }

            // Insertar texto plano
            tr.insertText(text, selection.from);

            dispatch(tr);

            return true; // Evento manejado
          },

          /**
           * También interceptar el "drop" de texto
           * para asegurar que sea texto plano
           */
          handleDrop: (view, event, slice, moved) => {
            if (moved) {
              return false; // Permitir mover texto interno
            }

            // Prevenir comportamiento por defecto
            event.preventDefault();

            const text = event.dataTransfer?.getData('text/plain');

            if (!text) {
              return true;
            }

            const { state, dispatch } = view;
            const { tr } = state;

            // Obtener posición del drop
            const pos = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            if (pos) {
              tr.insertText(text, pos.pos);
              dispatch(tr);
            }

            return true;
          },
        },
      }),
    ];
  },
});