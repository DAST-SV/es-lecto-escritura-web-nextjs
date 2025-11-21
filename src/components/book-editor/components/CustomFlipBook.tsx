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

// ===========================
// COMPONENTE DE PÁGINA
// ===========================
const PageContent = React.forwardRef<HTMLDivElement, { 
  page?: Page; 
  pageNumber?: number;
  isFirstPage?: boolean;
  isLastPage?: boolean;
}>(({ page, pageNumber, isFirstPage, isLastPage }, ref) => {
  
  // Página vacía
  if (!page) return <div ref={ref} className="page-wrapper"></div>;

  return (
    <div ref={ref} className={`page-wrapper ${isFirstPage ? 'first-page' : ''} ${isLastPage ? 'last-page' : ''}`}>
      {/* Fondo */}
      {page.background && (
        <div 
          className="page-background"
          style={{ backgroundImage: `url(${page.background})` }}
        />
      )}

      {/* Contenido */}
      <div className="page-content">
        {/* Imagen */}
        {page.image && (
          <div className="page-image-container">
            <img
              src={page.image}
              alt="Ilustración"
              className="page-image"
            />
          </div>
        )}

        {/* Texto */}
        <div 
          className="page-text"
          dangerouslySetInnerHTML={{ __html: page.content || '<p></p>' }}
        />

        {/* Número de página (no mostrar en primera y última) */}
        {pageNumber !== undefined && !isFirstPage && !isLastPage && (
          <div className="page-number">{pageNumber}</div>
        )}
      </div>
    </div>
  );
});

PageContent.displayName = 'PageContent';

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
export const CustomFlipBook: React.FC<CustomFlipBookProps> = ({
  pages,
  bookTitle = 'Mi Libro',
  onClose,
  showCover = true
}) => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Calcular total de páginas
  useEffect(() => {
    // Total de páginas = todas las que vienen del editor
    setTotalPages(pages.length);
  }, [pages.length]);

  // Calcular dimensiones para 2 páginas
  const getBookSize = () => {
    const width = Math.min(window.innerWidth * 0.4, 600);
    const height = width * 1.414; // Ratio A4
    return { width, height };
  };

  const { width, height } = getBookSize();

  // Handlers
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
      {/* Header */}
      <div className="flipbook-header">
        <div className="header-content">
          <div className="header-left">
            <h2 className="book-title-display">{bookTitle}</h2>
            <span className="page-indicator">
              {currentPage + 1} / {totalPages}
            </span>
          </div>

          <div className="header-right">
            <button
              onClick={goToFirstPage}
              className="control-btn"
              title="Ir al inicio"
            >
              <Home size={18} />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="control-btn close-btn"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FlipBook */}
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
            {/* Todas las páginas vienen del WordEditor */}
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

          {/* Botones de navegación */}
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

      {/* Estilos */}
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

        .control-btn:active {
          transform: translateY(0);
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

          .book-title-display {
            font-size: 1rem;
          }
        }
      `}</style>

      {/* Estilos globales para las páginas */}
      <style jsx global>{`
        .page-wrapper {
          background: white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        /* Estilos especiales para primera página (portada) */
        .page-wrapper.first-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .page-wrapper.first-page .page-content {
          color: white;
        }

        .page-wrapper.first-page .page-text {
          color: white;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .page-wrapper.first-page .page-text h1,
        .page-wrapper.first-page .page-text h2,
        .page-wrapper.first-page .page-text h3 {
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* Estilos especiales para última página (contraportada) */
        .page-wrapper.last-page {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .page-wrapper.last-page .page-content {
          color: white;
        }

        .page-wrapper.last-page .page-text {
          color: white;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .page-wrapper.last-page .page-text h1,
        .page-wrapper.last-page .page-text h2,
        .page-wrapper.last-page .page-text h3 {
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .page-background {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0.3;
        }

        .page-content {
          position: relative;
          height: 100%;
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
        }

        .page-image-container {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .page-image {
          max-width: 100%;
          max-height: 250px;
          object-fit: contain;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .page-text {
          flex: 1;
          font-family: 'Times New Roman', serif;
          font-size: 16px;
          line-height: 1.6;
          color: #1f2937;
          overflow: hidden;
        }

        .page-text p {
          margin-bottom: 0.75em;
        }

        .page-text h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
          color: #111827;
        }

        .page-text h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          color: #1f2937;
        }

        .page-text h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.5em 0;
          color: #374151;
        }

        .page-text ul,
        .page-text ol {
          padding-left: 1.5em;
          margin-bottom: 0.75em;
        }

        .page-text strong {
          font-weight: bold;
        }

        .page-text em {
          font-style: italic;
        }

        .page-text u {
          text-decoration: underline;
        }

        .page-text blockquote {
          border-left: 4px solid #9ca3af;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
        }

        .page-number {
          position: absolute;
          bottom: 1.5rem;
          right: 2.5rem;
          font-size: 0.875rem;
          color: #9ca3af;
          font-family: Georgia, serif;
        }

        /* Portada */
        .page-cover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        /* Reverso de la portada */
        .page-cover-back {
          background: #ffffff;
          border-left: 2px solid #e5e7eb;
        }

        .cover-back-content {
          height: 100%;
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .cover-back-title {
          font-size: 1.75rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .cover-back-text {
          font-family: 'Times New Roman', serif;
          font-size: 1.125rem;
          line-height: 1.8;
          color: #4b5563;
          text-align: center;
        }

        .cover-back-text p {
          margin-bottom: 1rem;
        }

        /* Contraportada interior */
        .page-back-cover {
          background: #ffffff;
        }

        .back-cover-content {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }

        .back-cover-text {
          font-size: 2.5rem;
          color: #6b7280;
          font-family: Georgia, serif;
          font-style: italic;
        }

        /* Contraportada trasera */
        .page-back-cover-back {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .back-cover-back-ornament {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          opacity: 0.7;
        }

        .back-cover-back-title {
          font-size: 1.5rem;
          font-weight: 600;
          opacity: 0.9;
        }

        .cover-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          padding: 3rem;
        }

        .cover-title {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 2rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          line-height: 1.2;
        }

        .cover-decoration {
          width: 100px;
          height: 4px;
          background: white;
          margin: 1rem 0;
          border-radius: 2px;
        }

        .cover-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-top: 2rem;
        }

        .back-text {
          font-size: 2rem;
          opacity: 0.8;
        }

        /* Estilos comunes de portadas */
        .page-cover .cover-content,
        .page-back-cover-back .cover-content {
          color: white;
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 2rem 1.5rem;
          }

          .page-text {
            font-size: 14px;
          }

          .cover-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomFlipBook;