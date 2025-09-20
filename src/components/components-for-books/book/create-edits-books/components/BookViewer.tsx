import React from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { page,Page } from '@/src/typings/types-page-book/index';
import { PageRenderer } from "@/src/components/components-for-books/book/PageRenderer";
import type { LayoutType, backgroundstype, HtmlFontFamiliestype, textColorstype } from '@/src/typings/types-page-book/index';

interface PageRendererIndexProps {
  page: page;
  pageNumber: number;
}

// Conversor de `page` a `Page`
function convertPage(oldPage: page): Page {
    return {
        layout: oldPage.layout as LayoutType,
        title: oldPage.title,
        text: oldPage.text,
        image: oldPage.image ?? undefined,
        background: oldPage.background as backgroundstype,
        font: oldPage.font as HtmlFontFamiliestype,
        textColor: oldPage.textColor || undefined, // ← Agregar esta línea
        animation: undefined,
        audio: undefined,
        interactiveGame: undefined,
        items: [],
        border: undefined
    };
}

// ============= COMPONENTE RENDERIZADOR DE PÁGINA =============
const PageRendererIndex: React.FC<PageRendererIndexProps> = ({ page, pageNumber }) => {
    const Pagina = convertPage(page);
    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Overlay para mejorar legibilidad si hay imagen de fondo */}
            {page.background && page.background !== "blanco" && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "rgba(255, 255, 255, 0.1)" }}
                />
            )}

            {/* Contenido del layout sin colores forzados */}
            <div className="relative z-10 h-full">
                <PageRenderer page={Pagina} />
            </div>

            {/* Número de página */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-bold bg-black bg-opacity-70 text-white z-50">
                {pageNumber}
            </div>
        </div>
    );
};

interface BookViewerProps {
  pages: page[];
  currentPage: number;
  isFlipping: boolean;
  bookKey: number;
  bookRef: React.RefObject<any>;
  onFlip: (e: unknown) => void;
  onPageClick: (pageIndex: number) => void;
}

export const BookViewer: React.FC<BookViewerProps> = ({
  pages,
  currentPage,
  isFlipping,
  bookKey,
  bookRef,
  onFlip,
  onPageClick
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Libro */}
      <div className="bg-white rounded-xl shadow-2xl p-4">
        <HTMLFlipBook
          key={bookKey}
          width={400}
          height={600}
          className="shadow-2xl"
          style={{ borderRadius: '12px' }}
          ref={bookRef}
          onFlip={onFlip}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={false}
          startPage={Math.min(currentPage)}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={false}
          clickEventForward={false}
          useMouseEvents={true}
          swipeDistance={30}
          disableFlipByClick={false}
          size="stretch"
          minWidth={400}
          maxWidth={400}
          minHeight={600}
          maxHeight={600}
          showPageCorners={true}
        >
          {pages.map((page, index) => (
            <div key={page.id} className="bg-white">
              <PageRendererIndex page={page} pageNumber={index + 1} />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Indicadores de página */}
      <div className="mt-6 flex gap-2">
        {pages.map((_, index) => (
          <button
            key={index}
            onClick={() => onPageClick(index)}
            disabled={isFlipping}
            className={`h-3 rounded-full transition-all ${
              currentPage === index
                ? "bg-indigo-600 w-8"
                : "bg-gray-300 hover:bg-gray-400 w-3"
            }`}
            title={`Ir a página ${index + 1}`}
          />
        ))}
      </div>

      {/* Instrucciones */}
      <div className="mt-4 text-center text-sm text-gray-600 bg-white rounded-lg p-4 shadow max-w-md">
        <p className="font-semibold mb-2">💡 Instrucciones:</p>
        <ul className="text-left space-y-1">
          <li>• Selecciona diferentes layouts para cada página</li>
          <li>• Edita título y texto por separado</li>
          <li>• Agrega imágenes y fondos personalizados</li>
          <li>• Cambia la fuente de cada página</li>
          <li>• Navega con los botones o haciendo clic en las páginas</li>
        </ul>
      </div>
    </div>
  );
};