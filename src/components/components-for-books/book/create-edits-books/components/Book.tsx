"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

// Importar hooks personalizados
import { useBookState } from "../hooks/useBookState";
import { useBookEditor } from "../hooks/useBookEditor";
import { useImageHandler } from "../hooks/useImageHandler";
import { useBookNavigation } from "../hooks/useBookNavigation";

// Importar componentes
import { BookControlPanel } from "./BookControlPanel";
import { BookViewer } from "./BookViewer";

// Importar servicios
import { saveBookJson, type BookMetadata } from "../services/bookService";

// Importar tipos
import type { page } from "@/src/typings/types-page-book/index";

interface BookProps {
  initialPages?: page[];
  title?: string;
  IdLibro?: string;
  // Agregar metadatos iniciales
  initialMetadata?: {
    selectedCategoria?: number | null;
    selectedGenero?: number | null;
    descripcion?: string;
    portada?: File | string | null; // Puede ser File o URL string
  };
}

export function Book({ initialPages, title, IdLibro, initialMetadata }: BookProps = {}) {
  // Referencias
  const bookRef = useRef<any>(null);

  // Estados de metadatos
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [selectedGenero, setSelectedGenero] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState<string>("");
  const [portada, setPortada] = useState<File | null>(
    initialMetadata?.portada instanceof File ? initialMetadata.portada : null
  );

  // Hooks personalizados
  const bookState = useBookState({ initialPages, title });

  const bookEditor = useBookEditor({
    pages: bookState.pages,
    currentPage: bookState.currentPage,
    setPages: bookState.setPages
  });

  const imageHandler = useImageHandler({
    pages: bookState.pages,
    currentPage: bookState.currentPage,
    setPages: bookState.setPages
  });

  const navigation = useBookNavigation({
    pages: bookState.pages,
    currentPage: bookState.currentPage,
    isFlipping: bookState.isFlipping,
    setCurrentPage: bookState.setCurrentPage,
    setIsFlipping: bookState.setIsFlipping,
    setEditingField: bookEditor.setEditingField,
    bookRef
  });

  // En tu componente Book.tsx, cambia esta línea:
  const handleSave = useCallback(async () => {
    console.log('📸 Portada actual:', portada ? portada.name : 'null');

    const metadata: BookMetadata = {
      selectedCategoria,
      selectedGenero,
      descripcion,
      portada
    };

    try {
      await saveBookJson(bookState.pages, metadata, IdLibro);
      console.log('✅ Guardado exitoso');
    } catch (error) {
      console.error("❌ Error en handleSave:", error);
    }
  }, [bookState.pages, selectedCategoria, selectedGenero, descripcion, portada, IdLibro]);

  // Handler para cambio de fondo con actualización de libro
  const handleBackgroundChangeWithRerender = useCallback((value: string) => {
    bookState.handleBackgroundChange(value);
  }, [bookState.handleBackgroundChange]);

  return (
    <UnifiedLayout>
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

        <Toaster position="bottom-center" />

        {/* Panel de Control */}
        <div className="w-full lg:w-96 max-w-md bg-white rounded-xl shadow-xl border border-gray-100 p-4 lg:p-6 h-fit max-h-screen overflow-y-auto">
          <BookControlPanel
            pages={bookState.pages}
            currentPage={bookState.currentPage}
            editingState={bookEditor}
            imageHandler={imageHandler}
            navigation={navigation}
            selectedCategoria={selectedCategoria}
            portada={portada}
            selectedGenero={selectedGenero}
            descripcion={descripcion}
            onCategoriaChange={setSelectedCategoria}
            onPortadaChange={setPortada}
            onGeneroChange={setSelectedGenero}
            onDescripcionChange={setDescripcion}
            onLayoutChange={bookState.handleLayoutChange}
            onFontChange={bookState.handleFontChange}
            onBackgroundChange={handleBackgroundChangeWithRerender}
            onTextColorChange={bookState.handleTextColorChange}
            onSave={handleSave}
            onAddPage={bookState.addPage}
            onDeletePage={bookState.deletePage}
          />
        </div>

        {/* Vista del libro */}
        <div className="w-full flex-1">
          <BookViewer
            pages={bookState.pages}
            currentPage={bookState.currentPage}
            isFlipping={bookState.isFlipping}
            bookKey={bookState.bookKey}
            bookRef={bookRef}
            onFlip={navigation.onFlip}
            onPageClick={navigation.goToPage}
          />
        </div>

      </div>

    </UnifiedLayout>
  );
};

