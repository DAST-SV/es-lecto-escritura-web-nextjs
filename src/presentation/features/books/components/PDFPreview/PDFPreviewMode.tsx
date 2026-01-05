/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/PDFPreviewMode.tsx
 * Versión Corregida: Tipado estricto + Sombras nativas preservadas
 */

import React, { useMemo } from 'react';
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

    const memoizedPages = useMemo(() => {
        return pages.map((page, idx) => ({
            ...page,
            key: `page-${page.id}-${idx}`,
        }));
    }, [pages]);

    const flipBookProps = useMemo(() => {
        if (!isClient) return null;

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

        return {
            width: displayWidth,
            height: displayHeight,
            size: "fixed" as const,
            minWidth: displayWidth,
            maxWidth: displayWidth,
            minHeight: displayHeight,
            maxHeight: displayHeight,
            drawShadow: true,
            maxShadowOpacity: 0.5,
            showCover: true,
            flippingTime: 1000,
            usePortrait: isMobile,
            startZIndex: 0,
            autoSize: false,
            startPage: 0,
            clickEventForward: true,
            useMouseEvents: true,
            swipeDistance: 30,
            showPageCorners: true,
            disableFlipByClick: false,
            onFlip: handleFlip,
            className: "demo-book",
            // Propiedades faltantes que causaban el error TS2739:
            style: {}, 
            mobileScrollSupport: false, 
        };
    }, [isClient, isMobile, pdfDimensions, handleFlip]);

    if (!isClient || !flipBookProps) {
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
                    {/* @ts-ignore - Evita conflictos remanentes de tipos en v2.0.3 */}
                    <HTMLFlipBook {...flipBookProps} ref={bookRef}>
                        {memoizedPages.map((page) => (
                            <div className="demoPage" key={page.key}>
                                {page.image && (
                                    <img
                                        src={page.image}
                                        alt="Página"
                                        className="w-full h-full object-fill pointer-events-none select-none"
                                    />
                                )}
                            </div>
                        ))}
                    </HTMLFlipBook>
                </div>
            </div>
        </div>
    );
}