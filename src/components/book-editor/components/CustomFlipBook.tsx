'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Minimize2 } from 'lucide-react';

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
      
      {page.background && !isFirstPage && !isLastPage && (
        <div 
          className="flip-page-background"
          style={{ backgroundImage: `url(${page.background})` }}
        />
      )}

      <div className="flip-page-inner">
        <div 
          className="flip-page-content"
          dangerouslySetInnerHTML={{ __html: page.content || '<p></p>' }}
        />
      </div>

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
    const height = window.innerHeight * 0.90; // 90% de altura (5% arriba y 5% abajo)
    const width = height * 0.707; // Proporción A4
    return { width, height };
  };

  const { width, height } = getBookSize();

  const goToPrevPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const goToNextPage = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const handleFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  return (
    <div className="flipbook-container">
      {/* Botón minimalista para salir de pantalla completa */}
      {onClose && (
        <button onClick={onClose} className="floating-close-btn" title="Salir de modo lectura">
          <Minimize2 size={20} />
        </button>
      )}

      <div className="flipbook-content">
        <div className="flipbook-wrapper">
          <HTMLFlipBook
            ref={bookRef}
            width={width}
            height={height}
            size="stretch"
            minWidth={400}
            maxWidth={2000}
            minHeight={600}
            maxHeight={4000}
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
            style={{}}
            startPage={0}
            drawShadow={true}
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
          background: #f5f1e8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0;
          overflow: hidden;
        }

        .floating-close-btn {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          color: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
        }

        .floating-close-btn:hover {
          background: rgba(0, 0, 0, 0.08);
          color: rgba(0, 0, 0, 0.6);
          border-color: rgba(0, 0, 0, 0.1);
        }

        .flipbook-content {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 0;
          margin: 0;
        }

        .flipbook-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100%;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 0.375rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
          color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
        }

        .nav-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.08);
          color: rgba(0, 0, 0, 0.7);
          transform: translateY(-50%);
          border-color: rgba(0, 0, 0, 0.1);
        }

        .nav-btn:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .nav-prev {
          left: 2rem;
        }

        .nav-next {
          right: 2rem;
        }

        @media (max-width: 768px) {
          .floating-close-btn {
            top: 0.75rem;
            right: 0.75rem;
            width: 2.25rem;
            height: 2.25rem;
          }

          .nav-btn {
            width: 2.5rem;
            height: 2.5rem;
          }

          .nav-prev {
            left: 0.75rem;
          }
          .nav-next {
            right: 0.75rem;
          }
        }
      `}</style>

      {/* Estilos globales para páginas */}
      <style jsx global>{`
        .flip-page-wrapper {
          background: #fefdfb;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        }

        .flip-page-wrapper.first-page {
          background: linear-gradient(135deg, #8b7355 0%, #6b5744 100%);
        }

        .flip-page-wrapper.last-page {
          background: linear-gradient(135deg, #6b5744 0%, #8b7355 100%);
        }

        .flip-page-background {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0.3;
        }

        .flip-page-inner {
          width: 100%;
          height: 100%;
          padding: 8% 10%;
          box-sizing: border-box;
          display: block;
          overflow: hidden;
        }

        /* ⭐ TEXTO OPTIMIZADO PARA LECTURA ⭐ */
        .flip-page-content {
          width: 100%;
          height: 100%;
          
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 2.2vh;
          line-height: 1.6;
          color: #2d2d2d;
          
          text-align: left !important;
          
          overflow: auto;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* ⭐ FORZAR TODOS LOS ELEMENTOS A LA IZQUIERDA ⭐ */
        .flip-page-content * {
          text-align: inherit !important;
        }

        /* PORTADAS - SÍ CENTRADAS */
        .flip-page-wrapper.first-page .flip-page-inner,
        .flip-page-wrapper.last-page .flip-page-inner {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flip-page-wrapper.first-page .flip-page-content,
        .flip-page-wrapper.last-page .flip-page-content {
          color: white;
          text-align: center !important;
          overflow: visible;
        }

        .flip-page-wrapper.first-page .flip-page-content *,
        .flip-page-wrapper.last-page .flip-page-content * {
          color: white !important;
          text-align: center !important;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* TIPOGRAFÍA */
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

        .flip-page-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
          display: block;
        }

        .flip-page-number {
          position: absolute;
          bottom: 5%;
          right: 10%;
          font-size: 1.8vh;
          color: #a0a0a0;
          font-family: Georgia, serif;
        }

        .flip-page-wrapper.first-page .flip-page-number,
        .flip-page-wrapper.last-page .flip-page-number {
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </div>
  );
};

export default CustomFlipBook;