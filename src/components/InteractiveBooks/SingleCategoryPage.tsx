'use client';

import React, { useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ArrowLeft, Clock, Star, Lock, BookOpen, X, Play, Pause, RotateCcw } from 'lucide-react';

// 📌 Tipos compatibles con tu estructura existente
interface AgeLevel {
  id: string;
  name: string;
  ageRange: string;
  description: string;
}

interface ContentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  levels?: AgeLevel[];
}

interface BookPage {
  content: string;
  image?: string;
  title: string;
  isLocked?: boolean;
  backgroundColor?: string;
  textSize?: 'small' | 'medium' | 'large';
  audioUrl?: string;
}

interface Book {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPremium: boolean;
  coverImage: string;
  coverColor: string;
  pages: BookPage[];
  ageRange: string;
  level: string;
  category: string;
}

interface Level extends AgeLevel {
  color: string;
  bgColor: string;
  textSize: 'small' | 'medium' | 'large';
  features: string[];
}

interface SingleCategoryPageProps {
  category: ContentCategory;
}

// 🎨 Configuración por niveles
const levelConfig: Level[] = [
  {
    id: 'preschool',
    name: 'Preescolar',
    ageRange: '3-5 años',
    description: 'Cuentos simples con ilustraciones grandes y palabras básicas',
    color: 'from-green-400 to-lime-500',
    bgColor: 'from-green-100 to-lime-100',
    textSize: 'large',
    features: ['Texto muy grande', 'Muchas imágenes', 'Palabras simples', 'Colores brillantes']
  },
  {
    id: 'elementary',
    name: 'Primaria',
    ageRange: '6-8 años',
    description: 'Historias más elaboradas que desarrollan la comprensión lectora',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'from-blue-100 to-cyan-100',
    textSize: 'medium',
    features: ['Oraciones completas', 'Más texto', 'Vocabulario ampliado', 'Conceptos básicos']
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    ageRange: '9-12 años',
    description: 'Cuentos complejos que desafían la imaginación y pensamiento crítico',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'from-purple-100 to-pink-100',
    textSize: 'small',
    features: ['Párrafos largos', 'Tramas complejas', 'Vocabulario avanzado', 'Moralejas profundas']
  }
];

// 📚 Datos de libros organizados por nivel
const booksByLevel: { [key: string]: Book[] } = {
  preschool: [
    {
      id: '1',
      title: '🐸 La Ranita Saltarina',
      description: '¡Hop, hop! Acompaña a Rita en su gran aventura por el estanque.',
      duration: '5 min',
      difficulty: 'easy',
      isPremium: false,
      coverImage: '🐸',
      coverColor: 'from-green-400 via-lime-400 to-green-500',
      ageRange: '3-5 años',
      level: 'preschool',
      category: 'Animales',
      pages: [
        {
          content: 'Rita es una ranita verde.',
          image: '🐸',
          title: 'Rita la Ranita',
          backgroundColor: 'bg-gradient-to-br from-green-100 to-lime-100',
          textSize: 'large'
        },
        {
          content: 'Le gusta saltar muy alto.',
          image: '🌿',
          title: 'Rita Salta',
          backgroundColor: 'bg-gradient-to-br from-blue-100 to-green-100',
          textSize: 'large'
        },
        {
          content: '¡Hop, hop, hop por el jardín!',
          image: '🌻',
          title: '¡Hop, Hop!',
          backgroundColor: 'bg-gradient-to-br from-yellow-100 to-green-100',
          textSize: 'large'
        },
        {
          content: '🔒 ¡Más aventuras esperan!',
          image: '🔒',
          title: 'Contenido Premium',
          isLocked: true,
          backgroundColor: 'bg-gradient-to-br from-pink-100 to-red-100',
          textSize: 'large'
        }
      ]
    },
    {
      id: '2',
      title: '🌞 El Sol Sonriente',
      description: 'El sol nos cuenta por qué está tan feliz cada mañana.',
      duration: '7 min',
      difficulty: 'easy',
      isPremium: false,
      coverImage: '🌞',
      coverColor: 'from-yellow-400 via-orange-400 to-red-400',
      ageRange: '3-5 años',
      level: 'preschool',
      category: 'Naturaleza',
      pages: [
        {
          content: 'El sol despierta muy temprano.',
          image: '🌅',
          title: 'Buenos Días',
          backgroundColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
          textSize: 'large'
        },
        {
          content: 'Sonríe a todos los niños.',
          image: '😊',
          title: 'Una Gran Sonrisa',
          backgroundColor: 'bg-gradient-to-br from-orange-100 to-pink-100',
          textSize: 'large'
        }
      ]
    }
  ],
  elementary: [
    {
      id: '3',
      title: '🐲 La Aventura del Dragón Azul',
      description: 'Un dragón mágico que ayuda a los niños en un reino lejano.',
      duration: '15 min',
      difficulty: 'medium',
      isPremium: false,
      coverImage: '🐲',
      coverColor: 'from-blue-400 via-purple-400 to-blue-600',
      ageRange: '6-8 años',
      level: 'elementary',
      category: 'Fantasía',
      pages: [
        {
          content: 'Había una vez un dragón azul que vivía en las montañas más altas del reino. Su nombre era Azulino y tenía un corazón muy bondadoso.',
          image: '🐉',
          title: 'El Dragón de las Montañas',
          backgroundColor: 'bg-gradient-to-br from-blue-100 to-purple-100',
          textSize: 'medium'
        },
        {
          content: 'Este dragón era diferente a todos los demás. Era amable, generoso y le encantaba ayudar a todos los que necesitaran su ayuda.',
          image: '🏔️',
          title: 'Un Dragón Especial',
          backgroundColor: 'bg-gradient-to-br from-green-100 to-blue-100',
          textSize: 'medium'
        },
        {
          content: 'Un día, los niños del pueblo necesitaron su ayuda para resolver un gran problema que había aparecido en su escuela.',
          image: '🏘️',
          title: 'El Pueblo Necesita Ayuda',
          backgroundColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
          textSize: 'medium'
        },
        {
          content: '🔒 ¡ÚNETE A NUESTRA AVENTURA PARA DESCUBRIR QUÉ PASÓ!',
          image: '🔒',
          title: 'Contenido Premium',
          isLocked: true,
          backgroundColor: 'bg-gradient-to-br from-pink-100 to-red-100',
          textSize: 'medium'
        }
      ]
    }
  ],
  intermediate: [
    {
      id: '4',
      title: '🏰 El Castillo de los Sueños Perdidos',
      description: 'Una aventura épica sobre el valor, la amistad y el poder de los sueños.',
      duration: '25 min',
      difficulty: 'hard',
      isPremium: true,
      coverImage: '🏰',
      coverColor: 'from-purple-400 via-pink-400 to-indigo-600',
      ageRange: '9-12 años',
      level: 'intermediate',
      category: 'Aventura',
      pages: [
        {
          content: 'En lo alto de una colina envuelta en niebla perpetua se alzaba un castillo que guardaba los secretos más profundos del reino. Sus torres tocaban las nubes y sus ventanas brillaban con una luz misteriosa que solo aparecía durante las noches sin luna.',
          image: '🏰',
          title: 'El Castillo Misterioso',
          backgroundColor: 'bg-gradient-to-br from-purple-100 to-indigo-100',
          textSize: 'small'
        },
        {
          content: 'La leyenda contaba que dentro de sus muros vivían todos los sueños que los niños habían perdido a lo largo de los años. Cada vez que un niño dejaba de creer en algo mágico, ese sueño viajaba hasta el castillo para esperar pacientemente el día de su regreso.',
          image: '✨',
          title: 'La Leyenda de los Sueños',
          backgroundColor: 'bg-gradient-to-br from-pink-100 to-purple-100',
          textSize: 'small'
        }
      ]
    }
  ]
};

// 🎨 Estilos de texto por nivel
const textStyles = {
  large: 'text-4xl leading-relaxed font-black',
  medium: 'text-2xl leading-relaxed font-bold',
  small: 'text-lg leading-relaxed font-semibold'
};

const difficultyColors = {
  easy: 'bg-green-200 text-green-900 border-green-300',
  medium: 'bg-yellow-200 text-yellow-900 border-yellow-300',
  hard: 'bg-red-200 text-red-900 border-red-300'
};

const difficultyText = {
  easy: 'Fácil',
  medium: 'Intermedio',
  hard: 'Difícil'
};

// 📖 Modal del libro mejorado
const BookModal: React.FC<{ book: Book | null; isOpen: boolean; onClose: () => void }> = ({ book, isOpen, onClose }) => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  if (!isOpen || !book) return null;

  const level = levelConfig.find(l => l.id === book.level);
  const textStyle = textStyles[level?.textSize || 'medium'];

  const onFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  const nextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const resetBook = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flip(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden relative border-8 border-yellow-300 shadow-2xl">
        
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b-4 border-yellow-200 bg-white/80">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${difficultyColors[book.difficulty]}`}>
              {level?.name} • {book.ageRange}
            </div>
            <div className="text-2xl font-black text-gray-800">{book.title}</div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Controles de audio */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition"
              title={isPlaying ? 'Pausar narración' : 'Reproducir narración'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={resetBook}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition"
              title="Reiniciar libro"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition"
              title="Cerrar libro"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Indicador de progreso */}
        <div className="px-6 py-2 bg-white/60">
          <div className="flex justify-between items-center text-sm font-bold text-gray-700">
            <span>Página {currentPage + 1} de {book.pages.length}</span>
            <div className="flex gap-1">
              {book.pages.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentPage ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentPage + 1) / book.pages.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flipbook */}
        <div className="flex justify-center items-center p-8">
          <HTMLFlipBook
            ref={bookRef}
            width={450}
            height={600}
            size="fixed"
            minWidth={315}
            maxWidth={1000}
            minHeight={400}
            maxHeight={1533}
            showCover={true}
            drawShadow={true}
            flippingTime={800}
            usePortrait={true}
            startZIndex={0}
            startPage={0}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            autoSize={false}
            maxShadowOpacity={0.8}
            mobileScrollSupport={true}
            className="shadow-2xl"
            style={{}}
            onFlip={onFlip}
          >
            {book.pages.map((page, index) => (
              <div
                key={index}
                className={`${page.backgroundColor || 'bg-white'} p-8 h-full flex flex-col items-center justify-center text-center border-4 border-yellow-200 rounded-lg`}
              >
                {page.isLocked ? (
                  <>
                    <div className="text-8xl mb-8 animate-bounce">{page.image}</div>
                    <h3 className="text-2xl font-black text-red-600 mb-6">{page.content}</h3>
                    <p className="text-lg text-gray-700 mb-8 max-w-sm">
                      Para continuar leyendo esta increíble historia, únete a nuestra familia de lectores.
                    </p>
                    <div className="flex flex-col gap-4 w-full max-w-sm">
                      <button className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                        🎉 Ver Planes
                      </button>
                      <button className="border-4 border-blue-400 text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transform hover:scale-105 transition-all">
                        🚀 Prueba Gratis
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-8xl mb-6 animate-pulse">{page.image}</div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">{page.title}</h3>
                    <p className={`text-gray-700 ${textStyle} text-center max-w-md leading-relaxed`}>
                      {page.content}
                    </p>
                  </>
                )}
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {/* Controles de navegación */}
        <div className="flex justify-center items-center gap-6 p-6 bg-white/80 border-t-4 border-yellow-200">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full font-bold disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:transform-none"
          >
            ← Anterior
          </button>
          
          <div className="bg-white px-6 py-3 rounded-full shadow-lg border-2 border-purple-200">
            <span className="text-purple-600 font-bold">
              {currentPage + 1} / {book.pages.length}
            </span>
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage === book.pages.length - 1}
            className="px-8 py-3 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-full font-bold disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:transform-none"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
};

// 📕 Card de libro mejorada
const BookCard: React.FC<{ book: Book; onRead: (book: Book) => void }> = ({ book, onRead }) => {
  const level = levelConfig.find(l => l.id === book.level);
  
  return (
    <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-105 border-4 border-yellow-200 transform hover:-rotate-1">
      
      {/* Portada */}
      <div className="relative h-64 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${book.coverColor} flex items-center justify-center`}>
          <span className="text-9xl transform group-hover:scale-110 transition-transform duration-500">
            {book.coverImage}
          </span>
        </div>
        
        {/* Overlay con botón de lectura */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <button
              onClick={() => onRead(book)}
              className="bg-white bg-opacity-95 text-gray-800 rounded-full p-5 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
            >
              <BookOpen className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Badges */}
        {book.isPremium && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-2 rounded-full shadow-lg animate-pulse">
            <Lock className="w-5 h-5" />
          </div>
        )}
        
        <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold border-2 ${difficultyColors[book.difficulty]} shadow-lg`}>
          {level?.name}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 bg-gradient-to-br from-white to-yellow-50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{book.coverImage}</span>
          <h3 className="text-xl font-black text-gray-800 group-hover:text-purple-600 transition-colors">
            {book.title}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-4 text-base leading-relaxed">
          {book.description}
        </p>

        {/* Info adicional */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-purple-600 text-sm bg-purple-100 px-3 py-1 rounded-full font-bold">
            <Clock className="w-4 h-4" />
            <span>{book.duration}</span>
          </div>
          <div className="text-sm text-gray-500 font-semibold">
            👶 {book.ageRange}
          </div>
        </div>

        {/* Características del nivel */}
        <div className="mb-4">
          <div className={`text-xs text-gray-600 mb-2 font-bold`}>
            Perfecto para: {level?.description}
          </div>
          <div className="flex flex-wrap gap-1">
            {level?.features.slice(0, 2).map((feature, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Botón de lectura */}
        <button
          onClick={() => onRead(book)}
          className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-black py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
        >
          <BookOpen className="w-5 h-5" />
          ¡Leer Cuento! 📚
        </button>
      </div>
    </div>
  );
};

// 🌈 Componente principal
const ImprovedBookCategoryPage: React.FC<SingleCategoryPageProps> = ({ category: initialCategory }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('preschool');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Convertir ContentCategory a Category con niveles extendidos
  const enhancedLevels: Level[] = levelConfig.map(levelDef => {
    const existingLevel = initialCategory.levels?.find(l => l.id === levelDef.id);
    return existingLevel ? { ...levelDef, ...existingLevel } : levelDef;
  });

  const category = {
    name: initialCategory.name,
    description: initialCategory.description,
    icon: initialCategory.icon,
    color: initialCategory.color,
    bgGradient: initialCategory.bgGradient,
    levels: enhancedLevels
  };

  const handleReadBook = (book: Book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const selectedLevelData = category.levels.find(level => level.id === selectedLevel);
  const booksForLevel = booksByLevel[selectedLevel] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      
      {/* Botón volver */}
      <div className="px-6 md:px-16 pt-8">
        <button className="flex items-center gap-3 text-purple-600 hover:text-purple-800 transition-colors font-bold text-lg bg-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105">
          <ArrowLeft className="w-6 h-6" />
          🏠 Volver
        </button>
      </div>

      {/* Header */}
      <section className="py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="text-9xl mr-8 animate-bounce">{category.icon}</div>
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-800 mb-6">
                {category.name}
              </h1>
              <div className={`inline-block bg-gradient-to-r ${category.bgGradient} text-white px-8 py-4 rounded-full text-xl font-bold shadow-xl`}>
                ✨ Por Niveles de Edad ✨
              </div>
            </div>
          </div>
          <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-semibold">
            {category.description}
          </p>
        </div>
      </section>

      {/* Selector de niveles */}
      <section className="py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-800 mb-12">
            🎯 Elige tu Nivel de Lectura
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {category.levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`p-8 rounded-3xl transition-all duration-300 transform hover:scale-105 text-left border-4 ${
                  selectedLevel === level.id
                    ? `bg-gradient-to-br ${level.color} text-white shadow-2xl scale-105 border-yellow-300`
                    : 'bg-white text-gray-700 hover:bg-yellow-50 shadow-xl hover:shadow-2xl border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-black text-2xl mb-2">{level.name}</h3>
                    <div className={`text-sm font-bold px-4 py-2 rounded-full ${
                      selectedLevel === level.id 
                        ? 'bg-white bg-opacity-20' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      👶 {level.ageRange}
                    </div>
                  </div>
                  {selectedLevel === level.id && (
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <p className={`text-base font-semibold mb-4 ${selectedLevel === level.id ? 'opacity-90' : 'opacity-80'}`}>
                  {level.description}
                </p>
                
                {/* Características */}
                <div className="space-y-2">
                  {level.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${selectedLevel === level.id ? 'bg-white' : 'bg-gray-400'}`}></div>
                      <span className={selectedLevel === level.id ? 'opacity-90' : 'opacity-70'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Info del nivel seleccionado */}
          {selectedLevelData && (
            <div className="text-center mb-16">
              <div className={`inline-block bg-gradient-to-r ${selectedLevelData.color} text-white px-12 py-8 rounded-3xl shadow-2xl border-4 border-yellow-300`}>
                <h3 className="text-3xl font-black mb-3">
                  🌟 {selectedLevelData.name} 🌟
                </h3>
                <p className="text-xl opacity-90 font-bold mb-4">
                  Perfecto para niños de {selectedLevelData.ageRange}
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📖</div>
                    <div>Tamaño de texto: {selectedLevelData.textSize === 'large' ? 'Grande' : selectedLevelData.textSize === 'medium' ? 'Mediano' : 'Normal'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎨</div>
                    <div>{booksForLevel.length} cuentos disponibles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⏱️</div>
                    <div>Lecturas de 5-25 min</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grid de libros */}
      <section className="py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-800 mb-4">
            📚 Cuentos para {selectedLevelData?.name} 📚
          </h2>
          <p className="text-center text-xl text-gray-600 mb-12 font-semibold">
            Especialmente diseñados para niños de {selectedLevelData?.ageRange}
          </p>
          
          {booksForLevel.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
              {booksForLevel.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onRead={handleReadBook} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-8">📚</div>
              <h3 className="text-3xl font-black text-gray-700 mb-4">
                ¡Próximamente más cuentos!
              </h3>
              <p className="text-xl text-gray-600">
                Estamos preparando increíbles historias para este nivel.
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <div className={`bg-gradient-to-r ${category.bgGradient} text-white rounded-3xl p-12 md:p-16 shadow-2xl border-4 border-yellow-300`}>
              <h3 className="text-4xl md:text-5xl font-black mb-8">
                🎉 ¡Desbloquea Toda la Biblioteca! 🎉
              </h3>
              <p className="text-2xl mb-10 opacity-90 max-w-4xl mx-auto font-bold leading-relaxed">
                Accede a cientos de cuentos organizados por niveles, con funciones de narración, 
                seguimiento de progreso y experiencias interactivas adaptadas a cada edad.
              </p>
              
              {/* Beneficios por nivel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
                {category.levels.map((level) => (
                  <div key={level.id} className="bg-white bg-opacity-20 rounded-2xl p-6">
                    <h4 className="font-black text-xl mb-3">{level.name}</h4>
                    <div className="text-sm opacity-90">
                      <div>• Texto {level.textSize === 'large' ? 'extra grande' : level.textSize === 'medium' ? 'mediano' : 'optimizado'}</div>
                      <div>• {level.features[0]}</div>
                      <div>• Progreso adaptativo</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="bg-white text-gray-800 font-black text-2xl px-12 py-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  🌟 Ver Planes Premium
                </button>
                <button className="border-4 border-white text-white font-black text-2xl px-12 py-6 rounded-3xl hover:bg-white hover:text-gray-800 transition-all duration-300 transform hover:scale-105">
                  🚀 Prueba Gratis 7 Días
                </button>
              </div>
              
              {/* Garantía */}
              <div className="mt-8 text-lg opacity-90 font-semibold">
                ✅ Sin compromisos • ❌ Cancela cuando quieras • 🔒 100% Seguro
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal del libro */}
      <BookModal 
        book={selectedBook} 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setSelectedBook(null);
        }} 
      />
      
      {/* Footer con estadísticas */}
      <footer className="py-12 px-6 md:px-16 bg-white/80">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
              <div className="text-4xl font-black text-blue-600 mb-2">500+</div>
              <div className="text-gray-700 font-semibold">Cuentos Disponibles</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-100 to-lime-100 rounded-2xl">
              <div className="text-4xl font-black text-green-600 mb-2">3-12</div>
              <div className="text-gray-700 font-semibold">Años de Edad</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl">
              <div className="text-4xl font-black text-orange-600 mb-2">15K+</div>
              <div className="text-gray-700 font-semibold">Niños Leyendo</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl">
              <div className="text-4xl font-black text-pink-600 mb-2">4.9⭐</div>
              <div className="text-gray-700 font-semibold">Calificación</div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 font-semibold text-lg">
              🌈 Creando lectores felices desde 2020 • 💖 Hecho con amor para familias
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ImprovedBookCategoryPage;