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
}

export function Book({ initialPages, title, IdLibro }: BookProps = {}) {
  // Referencias
  const bookRef = useRef<any>(null);

  // Estados de metadatos
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [selectedGenero, setSelectedGenero] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState<string>("");

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

  // Handler para guardar el libro
  const handleSave = useCallback(async () => {
    const metadata: BookMetadata = {
      selectedCategoria,
      selectedGenero,
      descripcion
    };

    try {
      await saveBookJson(bookState.pages, metadata, IdLibro);
    } catch (error) {
      // El error ya se maneja en el servicio
      console.error("Error en handleSave:", error);
    }
  }, [bookState.pages, selectedCategoria, selectedGenero, descripcion, IdLibro]);

  // Handler para cambio de fondo con actualización de libro
  const handleBackgroundChangeWithRerender = useCallback((value: string) => {
    bookState.handleBackgroundChange(value);
  }, [bookState.handleBackgroundChange]);

return (
  <UnifiedLayout>
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Toaster position="bottom-center" />
      
      {/* Panel de Control */}
      <BookControlPanel
        pages={bookState.pages}
        currentPage={bookState.currentPage}
        editingState={bookEditor}
        imageHandler={imageHandler}
        navigation={navigation}
        selectedCategoria={selectedCategoria}
        selectedGenero={selectedGenero}
        descripcion={descripcion}
        onCategoriaChange={setSelectedCategoria}
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

      {/* Vista del libro */}
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
  </UnifiedLayout>
);
};

