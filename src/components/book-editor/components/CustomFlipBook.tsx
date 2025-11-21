'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, X, Home } from 'lucide-react';

interface Page {
  id: string;
  content: string;
  image?: string | null;
  background?: string | null;
}

interface CustomFlipBookProps {
  pages: Page[];
  bookTitle?: string;
  onClose?: () => void;
  showCover?: boolean;
}

const PageContent = React.forwardRef<HTMLDivElement, { 
  page?: Page; 
  pageNumber?: number;
  isFirstPage?: boolean;
  isLastPage?: boolean;
}>(({ page, pageNumber, isFirstPage, isLastPage }, ref) => {
  
  if (!page) return <div ref={ref} className="flip-page-wrapper"></div>;

  return (
    <div ref={ref} className={`flip-page-wrapper ${isFirstPage ? 'first-page' : ''} ${isLastPage ? 'last-page' : ''}`}>
      
      {/* Fondo */}
      {page.background && !isFirstPage && !isLastPage && (
        <div 
          className="flip-page-background"
          style={{ backgroundImage: `url(${page.background})` }}
        />
      )}

      {/* ⭐ CONTENEDOR INTERNO */}
      <div className="flip-page-inner">
        <div 
          className="flip-page-content"
          dangerouslySetInnerHTML={{ __html: page.content || '<p></p>' }}
        />
      </div>

      {/* Número de página */}
      {pageNumber !== undefined && !isFirstPage && !isLastPage && (
        <div className="flip-page-number">{pageNumber}</div>
      )}
    </div>
  );
});

PageContent.displayName = 'PageContent';

export const CustomFlipBook: React.FC<CustomFlipBookProps> = ({
  pages,
  bookTitle = 'Mi Libro',
  onClose,
  showCover = true
}) => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setTotalPages(pages.length);
  }, [pages.length]);

  const getBookSize = () => {
    const width = Math.min(window.innerWidth * 0.4, 600);
    const height = width * 1.414;
    return { width, height };
  };

  const { width, height } = getBookSize();

  const goToPrevPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const goToNextPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const goToFirstPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flip(0);
  }, []);

  const handleFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  return (
    <div className="flipbook-container">
      <div className="flipbook-header">
        <div className="header-content">
          <div className="header-left">
            <h2 className="book-title-display">{bookTitle}</h2>
            <span className="page-indicator">
              {currentPage + 1} / {totalPages}
            </span>
          </div>

          <div className="header-right">
            <button onClick={goToFirstPage} className="control-btn" title="Ir al inicio">
              <Home size={18} />
            </button>
            {onClose && (
              <button onClick={onClose} className="control-btn close-btn" title="Cerrar">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flipbook-content">
        <div className="flipbook-wrapper">
          {/* @ts-ignore */}
          <HTMLFlipBook
            ref={bookRef}
            width={width}
            height={height}
            size="stretch"
            minWidth={300}
            maxWidth={800}
            minHeight={400}
            maxHeight={1200}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={handleFlip}
            className="flipbook"
            flippingTime={600}
            usePortrait={false}
            startZIndex={0}
            autoSize={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={50}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {pages.map((page, index) => (
              <PageContent
                key={page.id}
                page={page}
                pageNumber={index + 1}
                isFirstPage={index === 0}
                isLastPage={index === pages.length - 1}
              />
            ))}
          </HTMLFlipBook>

          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="nav-btn nav-prev"
            aria-label="Página anterior"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages - 1}
            className="nav-btn nav-next"
            aria-label="Página siguiente"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .flipbook-container {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
        }

        .flipbook-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .book-title-display {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .page-indicator {
          font-size: 0.875rem;
          color: #6b7280;
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          border-radius: 9999px;
        }

        .header-right {
          display: flex;
          gap: 0.5rem;
        }

        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
        }

        .control-btn:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .close-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .close-btn:hover {
          background: #fecaca;
        }

        .flipbook-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
        }

        .flipbook-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 50%;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }

        .nav-btn:hover:not(:disabled) {
          background: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .nav-prev {
          left: -4rem;
        }

        .nav-next {
          right: -4rem;
        }

        @media (max-width: 768px) {
          .nav-prev {
            left: 0.5rem;
          }
          .nav-next {
            right: 0.5rem;
          }
        }
      `}</style>

      {/* ⭐ ESTILOS CON PORCENTAJES - FONT-SIZE BASADO EN ALTURA */}
      <style jsx global>{`
        /* PÁGINA BASE */
        .flip-page-wrapper {
          background: white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        .flip-page-wrapper.first-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .flip-page-wrapper.last-page {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .flip-page-background {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0.3;
        }

        /* ⭐ CONTENEDOR INTERNO - 100% WIDTH Y HEIGHT */
        .flip-page-inner {
          width: 100%;
          height: 100%;
          padding: 12% 12%;
          box-sizing: border-box;
          display: block;
          overflow: hidden;
        }

        /* ⭐ CONTENIDO - 100% WIDTH Y HEIGHT */
        .flip-page-content {
          /* ⭐ 100% width y height */
          width: 100%;
          height: 100%;
          
          /* ⭐ Font-size basado en ALTURA (viewport height units) */
          font-size: 1.8vh;  /* ⭐ 1.8% de la altura del viewport */
          
          font-family: 'Times New Roman', serif;
          line-height: 1.5;
          color: #000;
          
          /* NO CENTRAR */
          text-align: left;
          
          /* Overflow */
          overflow: auto;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* ⭐ PORTADAS - SÍ CENTRADAS */
        .flip-page-wrapper.first-page .flip-page-inner,
        .flip-page-wrapper.last-page .flip-page-inner {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flip-page-wrapper.first-page .flip-page-content,
        .flip-page-wrapper.last-page .flip-page-content {
          color: white;
          text-align: center;
          overflow: visible;
        }

        .flip-page-wrapper.first-page .flip-page-content *,
        .flip-page-wrapper.last-page .flip-page-content * {
          color: white !important;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* ⭐ TIPOGRAFÍA - EM RELATIVO AL FONT-SIZE BASE */
        .flip-page-content p {
          margin-bottom: 0.5em;
          margin-top: 0;
        }

        .flip-page-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
          line-height: 1.2;
        }

        .flip-page-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
          line-height: 1.2;
        }

        .flip-page-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 1em;
          line-height: 1.2;
        }

        .flip-page-content h4 {
          font-size: 1em;
          font-weight: bold;
          margin-top: 1.33em;
          margin-bottom: 1.33em;
        }

        .flip-page-content h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin-top: 1.67em;
          margin-bottom: 1.67em;
        }

        .flip-page-content h6 {
          font-size: 0.67em;
          font-weight: bold;
          margin-top: 2.33em;
          margin-bottom: 2.33em;
        }

        /* LISTAS */
        .flip-page-content ul,
        .flip-page-content ol {
          padding-left: 1.5em;
          margin-bottom: 0.5em;
          margin-top: 0.5em;
        }

        .flip-page-content ul {
          list-style-type: disc;
        }

        .flip-page-content ul ul {
          list-style-type: circle;
        }

        .flip-page-content ul ul ul {
          list-style-type: square;
        }

        .flip-page-content ol {
          list-style-type: decimal;
        }

        .flip-page-content ol ol {
          list-style-type: lower-alpha;
        }

        .flip-page-content ol ol ol {
          list-style-type: lower-roman;
        }

        .flip-page-content li {
          margin-bottom: 0.25em;
        }

        .flip-page-content li > p {
          margin: 0;
        }

        /* FORMATO */
        .flip-page-content strong,
        .flip-page-content b {
          font-weight: bold;
        }

        .flip-page-content em,
        .flip-page-content i {
          font-style: italic;
        }

        .flip-page-content u {
          text-decoration: underline;
        }

        .flip-page-content s,
        .flip-page-content strike {
          text-decoration: line-through;
        }

        .flip-page-content mark {
          background-color: #ffff00;
          padding: 0.1em 0.2em;
          border-radius: 2px;
        }

        /* BLOCKQUOTE Y CODE */
        .flip-page-content blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          color: #666;
          font-style: italic;
          margin-top: 1em;
          margin-bottom: 1em;
        }

        .flip-page-content code {
          background-color: #f5f5f5;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #c7254e;
        }

        .flip-page-content pre {
          background-color: #f5f5f5;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
          margin-top: 1em;
          margin-bottom: 1em;
          border: 1px solid #ddd;
        }

        .flip-page-content pre code {
          background: none;
          padding: 0;
          color: inherit;
        }

        .flip-page-content hr {
          border: none;
          border-top: 2px solid #ddd;
          margin: 2em 0;
        }

        /* IMÁGENES */
        .flip-page-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
          display: block;
        }

        /* NÚMERO DE PÁGINA */
        .flip-page-number {
          position: absolute;
          bottom: 8%;
          right: 10%;
          font-size: 1.2vh;
          color: #9ca3af;
          font-family: Georgia, serif;
        }

        .flip-page-wrapper.first-page .flip-page-number,
        .flip-page-wrapper.last-page .flip-page-number {
          color: rgba(255, 255, 255, 0.7);
        }

        /* ⭐ RESPONSIVE - Ajustar font-size según tamaño */
        @media (max-height: 600px) {
          .flip-page-content {
            font-size: 1.5vh;
          }
          .flip-page-number {
            font-size: 1vh;
          }
        }

        @media (min-height: 900px) {
          .flip-page-content {
            font-size: 2vh;
          }
          .flip-page-number {
            font-size: 1.4vh;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomFlipBook;