"use client";

import React from "react";
import Link from "next/link";
import { BookPlus, Edit, Trash2, Lightbulb, Image, Star, Sparkles, ArrowLeft } from "lucide-react";
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
    <UnifiedLayout className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      
      {/* ✨ Decoraciones de fondo animadas */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Nubes flotantes */}
        <div className="absolute top-10 left-[-10%] w-60 h-32 bg-white rounded-full blur-2xl opacity-40 animate-cloud" />
        <div className="absolute top-1/4 right-[-10%] w-80 h-40 bg-white rounded-full blur-3xl opacity-30 animate-cloud-slow" />
        <div className="absolute bottom-20 left-[20%] w-64 h-36 bg-white rounded-full blur-2xl opacity-40 animate-cloud" />

        {/* Estrellas parpadeantes */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["#38bdf8", "#60a5fa", "#93c5fd", "#7dd3fc", "#bfdbfe"][i % 5],
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 animate-bounce">
            <div className="bg-white rounded-full p-6 shadow-2xl">
              <BookPlus size={64} className="text-sky-500" />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-blue-700 mb-4 drop-shadow-lg" 
              style={{ textShadow: '4px 4px 0px rgba(255,255,255,0.5)' }}>
            ✨ Taller de Creación ✨
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="text-yellow-400 animate-spin" size={24} style={{ animationDuration: '3s' }} />
            <div className="h-2 w-32 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 rounded-full" />
            <Star className="text-yellow-400 animate-spin" size={24} style={{ animationDuration: '3s' }} />
          </div>

          <p className="text-xl sm:text-2xl text-blue-600 font-bold">
            🌈 Donde tus historias cobran vida 🌈
          </p>
        </div>

        {/* Banner superior */}
        <div className="mb-12 sm:mb-16">
          <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 transform hover:shadow-3xl transition-all duration-300 border-4 border-sky-200">
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
          <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-3xl shadow-2xl p-1 mb-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8">
              <h2 className="text-center text-3xl sm:text-4xl font-black text-blue-700 mb-3"
                  style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.5)' }}>
                🎨 ¿Qué quieres hacer hoy? 📚
              </h2>
              <p className="text-center text-blue-600 text-base sm:text-lg font-bold mb-8">
                ¡Elige una opción y comienza tu aventura!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {acciones.map((accion, index) => {
                  const icons = [
                    <BookPlus size={40} className="text-sky-600" />,
                    <Edit size={40} className="text-cyan-600" />,
                    <Trash2 size={40} className="text-blue-600" />
                  ];
                  const gradients = [
                    "from-sky-100 to-blue-100",
                    "from-cyan-100 to-teal-100",
                    "from-blue-100 to-indigo-100"
                  ];

                  return (
                    <div
                      key={index}
                      onClick={() => window.location.href = `${accion.Json?.toLowerCase().replace(/\s/g, "")}`}
                      className="group cursor-pointer"
                    >
                      <div className={`bg-gradient-to-br ${gradients[index]} rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-300 border-4 border-transparent hover:border-sky-300`}>
                        <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                          <div className="mb-4">
                            {icons[index]}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 mb-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                          <img 
                            src={accion.src as string} 
                            alt={accion.caption}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                        <h3 className="text-center text-xl font-black text-gray-800 group-hover:text-sky-600 transition-colors duration-300">
                          {accion.caption}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de ideas e imágenes */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-cyan-200">
            <h2 className="text-center text-3xl sm:text-4xl font-black text-blue-700 mb-8"
                style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.5)' }}>
              💡 Tu Biblioteca Personal 🖼️
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {guardarIdeas.map((idea, index) => {
                const icons = [
                  <Lightbulb size={48} className="text-yellow-500" />,
                  <Image size={48} className="text-blue-500" />
                ];
                const gradients = [
                  "from-yellow-100 to-amber-100",
                  "from-sky-100 to-cyan-100"
                ];
                const borders = [
                  "border-yellow-300",
                  "border-sky-300"
                ];

                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${gradients[index]} rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 ${borders[index]}`}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="bg-white rounded-full p-4 shadow-lg">
                        {icons[index]}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 mb-4 shadow-md">
                      <img 
                        src={idea.src as string} 
                        alt={idea.caption}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <h3 className="text-center text-xl font-black text-gray-800">
                      {idea.caption}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="flex justify-center mb-8">
          <Link href="/pages-my-books">
            <button className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 text-white text-2xl font-black rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-110 hover:-translate-y-2"
                    style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
              <ArrowLeft size={28} />
              ⬅️ Volver al menú
            </button>
          </Link>
        </div>

        {/* Mensaje motivacional */}
        <div className="text-center">
          <div className="inline-block bg-white rounded-3xl shadow-xl px-8 py-6 border-4 border-sky-200 transform hover:scale-105 transition-all duration-300">
            <p className="text-blue-700 text-lg sm:text-xl font-black flex items-center gap-3">
              <Sparkles className="text-yellow-400" size={32} />
              ¡Cada historia comienza con una idea maravillosa!
              <Sparkles className="text-yellow-400" size={32} />
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes cloud {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(30px); }
        }
        @keyframes cloud-slow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
        }
        .animate-cloud {
          animation: cloud 20s ease-in-out infinite;
        }
        .animate-cloud-slow {
          animation: cloud-slow 30s ease-in-out infinite;
        }
      `}</style>
    </UnifiedLayout>
  );
};

export default CreateBook;