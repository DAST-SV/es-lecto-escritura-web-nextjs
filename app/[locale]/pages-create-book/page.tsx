"use client";

import React from "react";
import Link from "next/link";
import ImageGrid, { ImageItem } from "@/src/utils/imagenes/ImageGrid";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

const CreateBook: React.FC = () => {
  const acciones: ImageItem[] = [
    { src: "/Imagenes/create-libros/creatulibro.png", caption: "Crea tu libro", Json: "/es/interfaz-create-book" },
    { src: "/Imagenes/create-libros/editatuslibros.png", caption: "Edita tus libros", Json: "/es/edits-my-books" },
    { src: "/Imagenes/create-libros/papelera.png", caption: "Papelera", Json: "/es/delete-my-books" },
  ];

  const Banner: ImageItem[] = [
    { src: "/Imagenes/create-libros/Banner.png", caption: "Crea tu libro", Json: "/es/interfaz-create-book" },
  ];

  const guardarIdeas: ImageItem[] = [
    { src: "/Imagenes/create-libros/guardatusideas.png", caption: "Guarda tus ideas" },
    { src: "/Imagenes/create-libros/guardatusimagenes.png", caption: "Guarda tus imágenes" },
  ];

  return (
    <UnifiedLayout className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-300 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full opacity-20 blur-3xl translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-pink-300 rounded-full opacity-15 blur-3xl"></div>

      {/* Contenedor principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Encabezado con título */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block bg-white rounded-3xl shadow-2xl px-8 py-6 transform hover:scale-105 transition-all duration-300">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-2">
              ✨ Taller de Creación ✨
            </h1>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Donde tus historias cobran vida
            </p>
          </div>
        </div>

        {/* Banner superior con efecto card */}
        <div className="mb-10 sm:mb-16">
          <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 transform hover:shadow-3xl transition-all duration-300 border-4 border-purple-200">
            <ImageGrid
              images={Banner}
              shapeType={3}
              onClick={(img) =>
                window.location.href = `${img.Json?.toLowerCase().replace(/\s/g, "")}`
              }
            />
          </div>
        </div>

        {/* Sección de acciones principales */}
        <div className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-1 mb-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8">
              <h2 className="text-center text-2xl sm:text-3xl font-black text-gray-800 mb-3 flex items-center justify-center gap-3">
                <span className="text-3xl sm:text-4xl">🎨</span>
                <span>¿Qué quieres hacer hoy?</span>
                <span className="text-3xl sm:text-4xl">📚</span>
              </h2>
              <p className="text-center text-gray-600 text-sm sm:text-base mb-6">
                Elige una opción para comenzar tu aventura creativa
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {acciones.map((accion, index) => (
                  <div
                    key={index}
                    onClick={() => window.location.href = `${accion.Json?.toLowerCase().replace(/\s/g, "")}`}
                    className="group cursor-pointer"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-3 border-transparent hover:border-purple-300">
                      <div className="bg-white rounded-xl p-4 mb-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                        <img 
                          src={accion.src as string} 
                          alt={accion.caption}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                      <h3 className="text-center text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                        {accion.caption}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de ideas e imágenes */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-blue-200">
            <h2 className="text-center text-2xl sm:text-3xl font-black text-gray-800 mb-6 flex items-center justify-center gap-3">
              <span className="text-3xl">💡</span>
              <span>Tu Biblioteca Personal</span>
              <span className="text-3xl">🖼️</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {guardarIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-yellow-200"
                >
                  <div className="bg-white rounded-xl p-4 mb-4 shadow-md">
                    <img 
                      src={idea.src as string} 
                      alt={idea.caption}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <h3 className="text-center text-lg font-bold text-gray-800">
                    {idea.caption}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón de regreso mejorado */}
        <div className="flex justify-center">
          <Link href="/pages-my-books">
            <button className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-base sm:text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center gap-3 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative text-2xl">⬅</span>
              <span className="relative">Volver al menú de Lectoescritura</span>
            </button>
          </Link>
        </div>

        {/* Mensaje motivacional */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-2xl shadow-lg px-6 py-4">
            <p className="text-gray-700 text-sm sm:text-base font-medium">
              <span className="text-2xl mr-2">🌟</span>
              ¡Cada historia comienza con una idea maravillosa!
              <span className="text-2xl ml-2">🌟</span>
            </p>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default CreateBook;