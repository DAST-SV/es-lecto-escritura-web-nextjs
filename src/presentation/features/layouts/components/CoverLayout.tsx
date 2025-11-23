import React from "react";
import type { Page } from "@/src/typings/types-page-book/index";

interface Props {
  page: Page;
}

export function CoverLayout({ page }: Props) {
  return (
    <div className="w-full h-full relative m-0 p-0" style={{ margin: 0, padding: 0 }}>
      {/* ✅ Imagen a pantalla completa SIN márgenes NI padding */}
      {page.image ? (
        <img
          src={page.image}
          alt="Portada"
          className="w-full h-full object-cover m-0 p-0"
          style={{ 
            display: 'block',
            margin: 0, 
            padding: 0,
            width: '100%',
            height: '100%'
          }}
        />
      ) : (
        // Placeholder si no hay imagen
        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center m-0 p-0">
          <div className="text-center text-white p-8">
            <p className="text-4xl mb-4">📖</p>
            <p className="text-xl font-bold">Sube tu portada</p>
            <p className="text-sm opacity-80 mt-2">La imagen cubrirá toda la página</p>
          </div>
        </div>
      )}
    </div>
  );
}