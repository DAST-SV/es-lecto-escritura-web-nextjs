/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/PDFPreviewMode.tsx
 * ✅ CORREGIDO: Evita re-renders infinitos con FlipBook
 */

import React, { useMemo, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { Page } from '@/src/core/domain/types';
import { PreviewHeader } from './PreviewHeader';
import { usePreviewControls } from './usePreviewControls';
import '@/src/presentation/features/layouts/styles/book-shared.css';

interface PDFPreviewModeProps {
    pages: Page[];
    title: string;
    pdfDimensions: { width: number; height: number };
    isLoading: boolean;
    isSaveDisabled: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function PDFPreviewMode({
    pages,
    title,
    pdfDimensions,
    isLoading,
    isSaveDisabled,
    onClose,
    onSave,
}: PDFPreviewModeProps) {
    const {
        bookRef,
        showControls,
        isClient,
        isMobile,
        handleFlip,
    } = usePreviewControls({ pages, onClose });

    // ✅ Memoizar páginas para evitar recreación
    const memoizedPages = useMemo(() => {
        return pages.map((page, idx) => ({
            ...page,
            key: `page-${page.id}-${idx}`,
        }));
    }, [pages]);

    // ✅ Calcular dimensiones del libro
    const bookDimensions = useMemo(() => {
        if (!isClient) return { width: 400, height: 600 };

        const padding = 20;
        const availableHeight = window.innerHeight - padding * 2;
        const availableWidth = window.innerWidth - padding * 2;

        let displayWidth: number;
        let displayHeight: number;

        if (isMobile) {
            const scaleByHeight = availableHeight / pdfDimensions.height;
            const scaleByWidth = availableWidth / pdfDimensions.width;
            const scale = Math.min(scaleByHeight, scaleByWidth, 1);
            displayWidth = Math.round(pdfDimensions.width * scale);
            displayHeight = Math.round(pdfDimensions.height * scale);
        } else {
            const scaleByHeight = availableHeight / pdfDimensions.height;
            const scaleByWidth = (availableWidth / 2) / pdfDimensions.width;
            const scale = Math.min(scaleByHeight, scaleByWidth, 1);
            displayWidth = Math.round(pdfDimensions.width * scale);
            displayHeight = Math.round(pdfDimensions.height * scale);
        }

        return { width: displayWidth, height: displayHeight };
    }, [isClient, isMobile, pdfDimensions]);

    // ✅ Renderizar páginas del FlipBook
    const renderPages = useCallback(() => {
        return memoizedPages.map((page) => (
            <div className="demoPage" key={page.key}>
                {page.image && (
                    <img
                        src={page.image}
                        alt="Página"
                        className="w-full h-full object-fill pointer-events-none select-none"
                        draggable={false}
                    />
                )}
            </div>
        ));
    }, [memoizedPages]);

    if (!isClient) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col" style={{ zIndex: 9999 }}>
            <PreviewHeader
                title={title}
                totalPages={pages.length}
                isVisible={showControls}
                isLoading={isLoading}
                isSaveDisabled={isSaveDisabled}
                onClose={onClose}
                onSave={onSave}
            />

            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="relative">
                    <HTMLFlipBook
                        ref={bookRef}
                        width={bookDimensions.width}
                        height={bookDimensions.height}
                        size="fixed"
                        minWidth={bookDimensions.width}
                        maxWidth={bookDimensions.width}
                        minHeight={bookDimensions.height}
                        maxHeight={bookDimensions.height}
                        drawShadow={true}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        flippingTime={1000}
                        usePortrait={isMobile}
                        startZIndex={0}
                        autoSize={false}
                        startPage={0}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        showPageCorners={true}
                        disableFlipByClick={false}
                        onFlip={handleFlip}
                        className="demo-book"
                        style={{}}
                        mobileScrollSupport={false}
                    >
                        {renderPages()}
                    </HTMLFlipBook>
                </div>
            </div>
        </div>
    );
}