"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

// Importar hooks personalizados
import { useBookState } from "../hooks/useBookState";
import { useImageHandler } from "../hooks/useImageHandler";
import { useBookNavigation } from "../hooks/useBookNavigation";

// Importar componentes
import { BookSidebar } from "./BookSidebar";

// Importar servicios
import { saveBookJson, type BookMetadata } from "../services/bookService";

// Importar tipos
import type { page } from "@/src/typings/types-page-book/index";

interface BookProps {
  initialPages?: page[];
  title?: string;
  IdLibro?: string;
  initialMetadata?: {
    selectedCategorias?: (number | string)[];
    selectedGeneros?: (number | string)[];
    selectedEtiquetas?: (number | string)[];
    selectedValores?: (number | string)[];
    selectedNivel?: number | null;
    autor?: string;
    descripcion?: string;
    titulo?: string;
    portada?: File | string | null;
    portadaUrl?: string | null;
  };
}

export function Book({ initialPages, title, IdLibro, initialMetadata }: BookProps = {}) {
  const bookRef = useRef<any>(null);

  // Estados de metadatos
  const [selectedCategorias, setSelectedCategorias] = useState<(number | string)[]>(
    initialMetadata?.selectedCategorias || []
  );
  const [selectedGeneros, setSelectedGeneros] = useState<(number | string)[]>(
    initialMetadata?.selectedGeneros || []
  );
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<(number | string)[]>(
    initialMetadata?.selectedEtiquetas || []
  );
  const [selectedValores, setSelectedValores] = useState<(number | string)[]>(
    initialMetadata?.selectedValores || []
  );
  const [selectedNivel, setSelectedNivel] = useState<number | null>(
    initialMetadata?.selectedNivel || null
  );
  const [autor, setAutor] = useState<string>(initialMetadata?.autor || "");
  const [descripcion, setDescripcion] = useState<string>(initialMetadata?.descripcion || "");
  const [titulo, setTitulo] = useState<string>(initialMetadata?.titulo || "");
  
  const [portada, setPortada] = useState<File | null>(
    initialMetadata?.portada instanceof File ? initialMetadata.portada : null
  );
  
  const [portadaUrl, setPortadaUrl] = useState<string | null>(
    initialMetadata?.portadaUrl || 
    (typeof initialMetadata?.portada === 'string' ? initialMetadata.portada : null)
  );

  // Hooks personalizados
  const bookState = useBookState({ initialPages, title });

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
    bookRef
  });

  // Handler para guardar
  const handleSave = useCallback(async () => {
    const metadata: BookMetadata = {
      selectedCategorias,
      selectedGeneros,
      selectedEtiquetas,
      selectedValores,
      selectedNivel,
      autor,
      descripcion,
      titulo,
      portada,
      portadaUrl,
    };

    try {
      await saveBookJson(bookState.pages, metadata, IdLibro);
      console.log('✅ Guardado exitoso');
    } catch (error) {
      console.error("❌ Error en handleSave:", error);
    }
  }, [
    bookState.pages, 
    selectedCategorias, 
    selectedGeneros, 
    selectedEtiquetas, 
    selectedValores,
    selectedNivel,
    autor, 
    descripcion, 
    titulo, 
    portada,
    portadaUrl,
    IdLibro
  ]);

  const handlePortadaChange = useCallback((file: File | null) => {
    setPortada(file);
    if (file) {
      setPortadaUrl(null);
    }
  }, []);

  const handleBackgroundChangeWithRerender = useCallback((value: string) => {
    bookState.handleBackgroundChange(value);
  }, [bookState.handleBackgroundChange]);

  return (
    <UnifiedLayout>
      <div className="h-screen bg-gray-50">
        <Toaster position="bottom-center" />

        <BookSidebar
          pages={bookState.pages}
          currentPage={bookState.currentPage}
          setPages={bookState.setPages}
          imageHandler={imageHandler}
          navigation={navigation}
          isFlipping={bookState.isFlipping}
          bookKey={bookState.bookKey}
          bookRef={bookRef}
          onFlip={navigation.onFlip}
          onPageClick={navigation.goToPage}
          selectedCategorias={selectedCategorias}
          selectedGeneros={selectedGeneros}
          selectedEtiquetas={selectedEtiquetas}
          selectedValores={selectedValores}
          selectedNivel={selectedNivel}
          autor={autor}
          descripcion={descripcion}
          titulo={titulo}
          portada={portada}
          portadaUrl={portadaUrl}
          onCategoriasChange={setSelectedCategorias}
          onGenerosChange={setSelectedGeneros}
          onEtiquetasChange={setSelectedEtiquetas}
          onValoresChange={setSelectedValores}
          onNivelChange={setSelectedNivel}
          onAutorChange={setAutor}
          onDescripcionChange={setDescripcion}
          onTituloChange={setTitulo}
          onPortadaChange={handlePortadaChange}
          onLayoutChange={bookState.handleLayoutChange}
          onBackgroundChange={handleBackgroundChangeWithRerender}
          onSave={handleSave}
          onAddPage={bookState.addPage}
          onDeletePage={bookState.deletePage}
        />
      </div>
    </UnifiedLayout>
  );
}