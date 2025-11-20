import React, { useState, useMemo } from 'react';
import {
  Eye,
  FileText,
  Heading,
  Layout,
  Image,
  Paintbrush,
  BookOpen,
  Tag,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Info,
  Star
} from 'lucide-react';

// Tipos
import type { page } from '@/src/typings/types-page-book/index';
import type { UseImageHandlerReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useImageHandler';
import type { UseBookNavigationReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useBookNavigation';

// Componentes
import { PageLayoutSelector } from '@/src/components/components-for-books/book/create-edits-books/components/PageLayoutSelector';
import { RichTitleEditor } from '@/src/components/components-for-books/book/create-edits-books/components/RichTitleEditor';
import { RichTextEditor } from '@/src/components/components-for-books/book/create-edits-books/components/RichTextEditor';
import { ImageControls } from '@/src/components/components-for-books/book/create-edits-books/components/ImageControls';
import { PortadaControls } from '@/src/components/components-for-books/book/create-edits-books/components/portadaControls';
import { BackgroundControls } from '@/src/components/components-for-books/book/create-edits-books/components/BackgroundControls';
import { BookMetadataForm } from '@/src/components/components-for-books/book/create-edits-books/components/BookMetadataForm';
import { BookViewer } from '@/src/components/components-for-books/book/create-edits-books/components/BookViewer';

interface BookSidebarProps {
  pages: page[];
  currentPage: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
  imageHandler: UseImageHandlerReturn;
  navigation: UseBookNavigationReturn;
  isFlipping: boolean;
  bookKey: number;
  bookRef: React.RefObject<any>;
  onFlip: (data: any) => void;
  onPageClick: (pageNumber: number) => void;
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedValores: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedNivel: number | null;
  autores: string[];
  descripcion: string;
  titulo: string;
  portada: File | null;
  portadaUrl?: string | null;
  onCategoriasChange: (values: (number | string)[]) => void;
  onGenerosChange: (values: (number | string)[]) => void;
  onEtiquetasChange: (values: (number | string)[]) => void;
  onValoresChange: (values: (number | string)[]) => void;
  onNivelChange: (value: number | null) => void;
  onAutoresChange: (value: string[]) => void;
  onDescripcionChange: (value: string) => void;
  onTituloChange: (value: string) => void;
  onPortadaChange: (value: File | null) => void;
  onLayoutChange: (layout: string) => void;
  onBackgroundChange: (value: string) => void;
  onSave: () => Promise<void>;
  onAddPage: () => void;
  onDeletePage: () => void;
}

export const BookSidebar: React.FC<BookSidebarProps> = ({
  pages,
  currentPage,
  setPages,
  imageHandler,
  navigation,
  isFlipping,
  bookKey,
  bookRef,
  onFlip,
  onPageClick,
  selectedCategorias,
  selectedGeneros,
  selectedValores,
  selectedEtiquetas,
  selectedNivel,
  autores,
  descripcion,
  titulo,
  portada,
  portadaUrl,
  onCategoriasChange,
  onGenerosChange,
  onValoresChange,
  onEtiquetasChange,
  onNivelChange,
  onAutoresChange,
  onDescripcionChange,
  onTituloChange,
  onPortadaChange,
  onLayoutChange,
  onBackgroundChange,
  onSave,
  onAddPage,
  onDeletePage,
}) => {
  const currentPageData = pages[currentPage];
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 DETECCIÓN DE CONTEXTO: ¿Es la portada?
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === pages.length - 1;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Componente para tarjetas de sección
  const SectionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    color?: string;
  }> = ({ title, description, icon, children, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600',
      indigo: 'from-indigo-500 to-indigo-600',
      teal: 'from-teal-500 to-teal-600',
      cyan: 'from-cyan-500 to-cyan-600'
    };

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
        <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} p-4 text-white`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm opacity-90">{description}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    );
  };

  // 🔥 PESTAÑAS CONTEXTUALES según la página actual
  const tabs = useMemo(() => {
    const baseTabs = [
      { 
        id: 'preview', 
        icon: Eye, 
        label: 'Vista Previa',
        shortLabel: 'Vista',
        color: 'indigo',
        description: 'Visualización del libro',
        showAlways: true
      }
    ];

    // Si es la PRIMERA PÁGINA (Portada)
    if (isFirstPage) {
      return [
        ...baseTabs,
        { 
          id: 'cover', 
          icon: BookOpen, 
          label: 'Portada',
          shortLabel: 'Portada',
          color: 'orange',
          description: 'Imagen de portada',
          showAlways: false
        },
        { 
          id: 'metadata', 
          icon: Tag, 
          label: 'Info Libro',
          shortLabel: 'Info',
          color: 'pink',
          description: 'Título, autor, categorías',
          showAlways: false
        },
        { 
          id: 'background', 
          icon: Paintbrush, 
          label: 'Fondo',
          shortLabel: 'Fondo',
          color: 'teal',
          description: 'Fondo decorativo',
          showAlways: false
        }
      ];
    }

    // Si es la ÚLTIMA PÁGINA (Contraportada/Fin)
    if (isLastPage) {
      return [
        ...baseTabs,
        { 
          id: 'title', 
          icon: Heading, 
          label: 'Título',
          shortLabel: 'Título',
          color: 'blue',
          description: 'Título de la página',
          showAlways: false
        },
        { 
          id: 'text', 
          icon: FileText, 
          label: 'Texto',
          shortLabel: 'Texto',
          color: 'cyan',
          description: 'Contenido de la página',
          showAlways: false
        },
        { 
          id: 'background', 
          icon: Paintbrush, 
          label: 'Fondo',
          shortLabel: 'Fondo',
          color: 'teal',
          description: 'Fondo decorativo',
          showAlways: false
        },
        { 
          id: 'metadata', 
          icon: Tag, 
          label: 'Info Libro',
          shortLabel: 'Info',
          color: 'pink',
          description: 'Metadatos del libro',
          showAlways: false
        }
      ];
    }

    // PÁGINAS NORMALES (contenido)
    return [
      ...baseTabs,
      { 
        id: 'title', 
        icon: Heading, 
        label: 'Título',
        shortLabel: 'Título',
        color: 'blue',
        description: 'Título de la página',
        showAlways: false
      },
      { 
        id: 'text', 
        icon: FileText, 
        label: 'Texto',
        shortLabel: 'Texto',
        color: 'cyan',
        description: 'Contenido de la página',
        showAlways: false
      },
      { 
        id: 'layout', 
        icon: Layout, 
        label: 'Diseño',
        shortLabel: 'Diseño',
        color: 'purple',
        description: 'Layout de elementos',
        showAlways: false
      },
      { 
        id: 'images', 
        icon: Image, 
        label: 'Imágenes',
        shortLabel: 'Imágenes',
        color: 'green',
        description: 'Imagen principal',
        showAlways: false
      },
      { 
        id: 'background', 
        icon: Paintbrush, 
        label: 'Fondos',
        shortLabel: 'Fondos',
        color: 'teal',
        description: 'Fondo decorativo',
        showAlways: false
      }
    ];
  }, [isFirstPage, isLastPage]);

  // Asegurar que activeTab sea válido para el contexto actual
  React.useEffect(() => {
    const validTabs = tabs.map(t => t.id);
    if (!validTabs.includes(activeTab)) {
      setActiveTab('preview');
    }
  }, [tabs, activeTab]);

  if (!currentPageData) return null;

  const canDeletePage = pages.length > 2;
  const HEADER_HEIGHT = 80;
  const TABS_HEIGHT = 70;
  const NAV_HEIGHT = 70;
  const FOOTER_HEIGHT = 80;
  const CONTENT_HEIGHT = `calc(100vh - ${HEADER_HEIGHT + TABS_HEIGHT + NAV_HEIGHT + FOOTER_HEIGHT}px)`;

  const currentTab = tabs.find(t => t.id === activeTab);

  // 🔥 Mensaje contextual según la página
  const getPageTypeMessage = () => {
    if (isFirstPage) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-300">
          <Star className="flex-shrink-0" size={18} />
          <span className="font-semibold">Página 1 - PORTADA</span>
        </div>
      );
    }
    if (isLastPage) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg border border-purple-300">
          <Star className="flex-shrink-0" size={18} />
          <span className="font-semibold">Última Página - FINAL/CONTRAPORTADA</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300">
        <FileText className="flex-shrink-0" size={18} />
        <span className="font-semibold">Página {currentPage + 1} - CONTENIDO</span>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">

      {/* HEADER */}
      <div 
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg"
        style={{ height: `${HEADER_HEIGHT}px` }}
      >
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Editor de Libros Infantiles</h1>
              <p className="text-sm opacity-90">Crea historias maravillosas página por página</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
              <div className="text-center">
                <div className="text-xs opacity-80 uppercase tracking-wide">Página Actual</div>
                <div className="text-3xl font-bold">{currentPage + 1}</div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
              <div className="text-center">
                <div className="text-xs opacity-80 uppercase tracking-wide">Total Páginas</div>
                <div className="text-3xl font-bold">{pages.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS - Contextuales */}
      <div 
        className="bg-white border-b-2 border-gray-200 shadow-sm overflow-x-auto"
        style={{ height: `${TABS_HEIGHT}px` }}
      >
        <div className="flex h-full min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const colorClasses = {
              indigo: 'bg-indigo-500 border-indigo-600',
              blue: 'bg-blue-500 border-blue-600',
              cyan: 'bg-cyan-500 border-cyan-600',
              purple: 'bg-purple-500 border-purple-600',
              green: 'bg-green-500 border-green-600',
              teal: 'bg-teal-500 border-teal-600',
              orange: 'bg-orange-500 border-orange-600',
              pink: 'bg-pink-500 border-pink-600'
            };

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative px-6 py-3 flex flex-col items-center justify-center gap-1
                  transition-all duration-200 min-w-[120px]
                  ${isActive 
                    ? `${colorClasses[tab.color as keyof typeof colorClasses]} text-white shadow-lg scale-105` 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={22} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-xs font-semibold">{tab.shortLabel}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* INFO BAR - Contextual */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-2 border-b border-gray-200 flex items-center justify-between text-sm">
        {getPageTypeMessage()}
        <div className="flex items-center gap-2 text-gray-700">
          <Info size={16} className="text-blue-500" />
          <span className="font-medium">Editando:</span>
          <span className="font-bold text-blue-600">{currentTab?.label}</span>
          <span className="text-gray-500">→</span>
          <span className="text-gray-600">{currentTab?.description}</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <div 
        className="bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm"
        style={{ height: `${NAV_HEIGHT}px` }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={navigation.prevPage}
            disabled={!navigation.canGoPrev}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>
          
          <div className="px-6 py-2.5 bg-gray-100 rounded-lg border-2 border-gray-300">
            <span className="text-sm text-gray-600 font-medium">
              Página <span className="text-xl font-bold text-gray-900">{currentPage + 1}</span> de <span className="text-lg font-semibold text-gray-900">{pages.length}</span>
            </span>
          </div>
          
          <button
            onClick={navigation.nextPage}
            disabled={!navigation.canGoNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
          >
            Siguiente
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddPage}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus size={20} />
            Agregar Página
          </button>
          
          {canDeletePage && (
            <button
              onClick={onDeletePage}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
            >
              <Trash2 size={20} />
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div 
        style={{ 
          height: CONTENT_HEIGHT, 
          minHeight: CONTENT_HEIGHT, 
          maxHeight: CONTENT_HEIGHT, 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        
        {/* VISTA PREVIA */}
        <div 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            visibility: activeTab === 'preview' ? 'visible' : 'hidden',
            opacity: activeTab === 'preview' ? 1 : 0,
            pointerEvents: activeTab === 'preview' ? 'auto' : 'none',
            transition: 'opacity 0.2s'
          }}
        >
          <BookViewer
            bookRef={bookRef}
            pages={pages}
            currentPage={currentPage}
            isFlipping={isFlipping}
            bookKey={bookKey}
            onFlip={onFlip}
            onPageClick={onPageClick}
          />
        </div>

        {/* TÍTULO */}
        <div 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            visibility: activeTab === 'title' ? 'visible' : 'hidden',
            opacity: activeTab === 'title' ? 1 : 0,
            pointerEvents: activeTab === 'title' ? 'auto' : 'none',
            overflow: 'auto', transition: 'opacity 0.2s'
          }}
        >
          <div className="max-w-5xl mx-auto p-8">
            <SectionCard
              title="Título de la Página"
              description="Escribe un título llamativo para esta página"
              icon={<Heading size={24} />}
              color="blue"
            >
              <RichTitleEditor
                value={pages[currentPage]?.title || ''}
                onChange={(html) => {
                  setPages(prev => {
                    const newPages = [...prev];
                    newPages[currentPage] = { ...newPages[currentPage], title: html };
                    return newPages;
                  });
                }}
                pageNumber={currentPage + 1}
              />
            </SectionCard>
          </div>
        </div>

        {/* TEXTO */}
        <div 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            visibility: activeTab === 'text' ? 'visible' : 'hidden',
            opacity: activeTab === 'text' ? 1 : 0,
            pointerEvents: activeTab === 'text' ? 'auto' : 'none',
            overflow: 'auto', transition: 'opacity 0.2s'
          }}
        >
          <div className="max-w-5xl mx-auto p-8">
            <SectionCard
              title="Contenido de la Página"
              description="Escribe la historia o texto principal de esta página"
              icon={<FileText size={24} />}
              color="cyan"
            >
              <RichTextEditor
                value={pages[currentPage]?.text || ''}
                onChange={(html) => {
                  setPages(prev => {
                    const newPages = [...prev];
                    newPages[currentPage] = { ...newPages[currentPage], text: html };
                    return newPages;
                  });
                }}
                pageNumber={currentPage + 1}
              />
            </SectionCard>
          </div>
        </div>

        {/* LAYOUT */}
        <div 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            visibility: activeTab === 'layout' ? 'visible' : 'hidden',
            opacity: activeTab === 'layout' ? 1 : 0,
            pointerEvents: activeTab === 'layout' ? 'auto' : 'none',
            overflow: 'auto', transition: 'opacity 0.2s'
          }}
        >
          <div className="max-w-5xl mx-auto p-8">
            <SectionCard
              title="Diseño de la Página"
              description="Elige cómo se distribuyen el título, texto e imagen"
              icon={<Layout size={24} />}
              color="purple"
            >
              <PageLayoutSelector
                currentLayout={currentPageData.layout}
                pageNumber={currentPage + 1}
                onLayoutChange={onLayoutChange}
              />
            </SectionCard>
          </div>
        </div>

        {/* IMÁGENES */}
        <div 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            visibility: activeTab === 'images' ? 'visible' : 'hidden',
            opacity: activeTab === 'images' ? 1 : 0,
            pointerEvents: activeTab === 'images' ? 'auto' : 'none',
            overflow: 'auto', transition: 'opacity 0.2s'
          }}
        >
          <div className="max-w-5xl mx-auto p-8">
            <SectionCard
              title="Imagen Principal de la Página"
              description="Sube una imagen que acompañe el contenido"
              icon={<Image size={24} />}
              color="green"
            >
              <ImageControls
                hasImage={!!currentPageData.image}
                pageNumber={currentPage + 1}
                onImageChange={imageHandler.handleImageChange}
                onRemoveImage={imageHandler.removeImage}
              />
            </SectionCard>
          </div>
        </div>

        {/* FONDOS */}
        <div 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            visibility: activeTab === 'background' ? 'visible' : 'hidden',
            opacity: activeTab === 'background' ? 1 : 0,
            pointerEvents: activeTab === 'background' ? 'auto' : 'none',
            overflow: 'auto', transition: 'opacity 0.2s'
          }}
        >
          <div className="max-w-5xl mx-auto p-8">
            <SectionCard
              title="Fondo de la Página"
              description="Elige o sube un fondo decorativo para esta página"
              icon={<Paintbrush size={24} />}
              color="teal"
            >
              <BackgroundControls
                currentBackground={currentPageData.background}
                hasBackground={!!currentPageData.background}
                pageNumber={currentPage + 1}
                onBackgroundChange={onBackgroundChange}
                onBackgroundFileChange={imageHandler.handleBackgroundFile}
                onRemoveBackground={imageHandler.removeBackground}
              />
            </SectionCard>
          </div>
        </div>

        {/* PORTADA - Solo en página 1 */}
        <div 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            visibility: activeTab === 'cover' ? 'visible' : 'hidden',
            opacity: activeTab === 'cover' ? 1 : 0,
            pointerEvents: activeTab === 'cover' ? 'auto' : 'none',
            overflow: 'auto', transition: 'opacity 0.2s'
          }}
        >
          <div className="max-w-5xl mx-auto p-8">
            <SectionCard
              title="Portada del Libro"
              description="Imagen principal que representa tu libro"
              icon={<BookOpen size={24} />}
              color="orange"
            >
              <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                <p className="text-sm text-orange-800">
                  <strong>💡 Tip:</strong> Esta es la primera página del libro. La portada aparecerá en las listas y catálogos.
                </p>
              </div>
              <PortadaControls 
                onImageChange={onPortadaChange}
                portada={portada}
                portadaUrl={portadaUrl} 
              />
            </SectionCard>
          </div>
        </div>

        {/* METADATOS */}
        <div 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            visibility: activeTab === 'metadata' ? 'visible' : 'hidden',
            opacity: activeTab === 'metadata' ? 1 : 0,
            pointerEvents: activeTab === 'metadata' ? 'auto' : 'none',
            overflow: 'auto', transition: 'opacity 0.2s'
          }}
        >
          <div className="max-w-5xl mx-auto p-8">
            <SectionCard
              title="Información del Libro"
              description="Datos generales, categorización y metadatos"
              icon={<Tag size={24} />}
              color="pink"
            >
              <div className="mb-4 p-4 bg-pink-50 border-l-4 border-pink-500 rounded">
                <p className="text-sm text-pink-800">
                  <strong>📚 Nota:</strong> Esta información se aplica al libro completo, no solo a esta página.
                </p>
              </div>
              <BookMetadataForm
                selectedCategorias={selectedCategorias}
                selectedGeneros={selectedGeneros}
                selectedEtiquetas={selectedEtiquetas}
                selectedValores={selectedValores}
                selectedNivel={selectedNivel}
                autores={autores}
                descripcion={descripcion}
                titulo={titulo}
                onCategoriasChange={onCategoriasChange}
                onGenerosChange={onGenerosChange}
                onEtiquetasChange={onEtiquetasChange}
                onValoresChange={onValoresChange}
                onNivelChange={onNivelChange}
                onAutoresChange={onAutoresChange}
                onDescripcionChange={onDescripcionChange}
                onTituloChange={onTituloChange}
                onSave={handleSave}
              />
            </SectionCard>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div 
        className="bg-white border-t-2 border-gray-200 px-6 flex items-center justify-center shadow-lg"
        style={{ height: `${FOOTER_HEIGHT}px` }}
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-xl hover:shadow-2xl px-10 py-4 disabled:opacity-60 disabled:cursor-not-allowed min-w-[350px] text-lg font-bold"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando Cambios...
            </>
          ) : (
            <>
              <Save size={24} />
              💾 Guardar Todos los Cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
};