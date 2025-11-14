"use client";

import React from "react";
import Link from "next/link";
import { BookPlus, Edit, Trash2, Lightbulb, Image, ArrowLeft, Sparkles, LucideIcon } from "lucide-react";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

interface ImageItem {
  src: string;
  caption: string;
  Json?: string;
  icon?: LucideIcon;
  color?: "blue" | "green" | "yellow" | "red";
}

interface ColorClasses {
  bg: string;
  border: string;
  text: string;
  hover: string;
  icon: string;
}

const CreateBook: React.FC = () => {
  const acciones: ImageItem[] = [
    { 
      src: "/Imagenes/create-libros/creatulibro.png", 
      caption: "Crea tu libro", 
      Json: "/es/interfaz-create-book", 
      icon: BookPlus, 
      color: "green" 
    },
    { 
      src: "/Imagenes/create-libros/editatuslibros.png", 
      caption: "Edita tus libros", 
      Json: "/es/edits-my-books", 
      icon: Edit, 
      color: "blue" 
    },
    { 
      src: "/Imagenes/create-libros/papelera.png", 
      caption: "Papelera", 
      Json: "/es/delete-my-books", 
      icon: Trash2, 
      color: "red" 
    },
  ];

  const Banner: ImageItem[] = [
    { 
      src: "/Imagenes/create-libros/Banner.png", 
      caption: "Crea tu libro", 
      Json: "/es/interfaz-create-book" 
    },
  ];

  const guardarIdeas: ImageItem[] = [
    { 
      src: "/Imagenes/create-libros/guardatusideas.png", 
      caption: "Guarda tus ideas", 
      icon: Lightbulb, 
      color: "yellow" 
    },
    { 
      src: "/Imagenes/create-libros/guardatusimagenes.png", 
      caption: "Guarda tus imágenes", 
      icon: Image, 
      color: "blue" 
    },
  ];

  const getColorClasses = (color: "blue" | "green" | "yellow" | "red"): ColorClasses => {
    const colors: Record<"blue" | "green" | "yellow" | "red", ColorClasses> = {
      blue: {
        bg: "bg-blue-100",
        border: "border-blue-300",
        text: "text-blue-600",
        hover: "hover:bg-blue-200",
        icon: "text-blue-500"
      },
      green: {
        bg: "bg-green-100",
        border: "border-green-300",
        text: "text-green-600",
        hover: "hover:bg-green-200",
        icon: "text-green-500"
      },
      yellow: {
        bg: "bg-yellow-100",
        border: "border-yellow-300",
        text: "text-yellow-600",
        hover: "hover:bg-yellow-200",
        icon: "text-yellow-500"
      },
      red: {
        bg: "bg-red-100",
        border: "border-red-300",
        text: "text-red-600",
        hover: "hover:bg-red-200",
        icon: "text-red-500"
      }
    };
    return colors[color];
  };

  const handleNavigation = (url: string | undefined): void => {
    if (url) {
      window.location.href = url.toLowerCase().replace(/\s/g, "");
    }
  };

  return (
    <UnifiedLayout className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-green-300">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <div className="inline-block mb-4 sm:mb-6">
              <div className="bg-white rounded-full p-4 sm:p-6 shadow-2xl">
                <BookPlus size={48} className="text-blue-500 sm:w-16 sm:h-16" />
              </div>
            </div>
            
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-700 mb-3 sm:mb-4 px-4"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              TALLER DE CREACIÓN
            </h1>
            
            <p 
              className="text-lg sm:text-xl md:text-2xl text-gray-600 font-bold mb-4 sm:mb-6 px-4"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              🌈 Donde tus historias cobran vida 🌈
            </p>
          </div>

          {/* Banner Principal */}
          <div className="mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-0">
            <div 
              className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4 lg:p-6 border-3 border-yellow-300 transform transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => handleNavigation(Banner[0].Json)}
            >
              <img 
                src={Banner[0].src}
                alt={Banner[0].caption}
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Sección de Acciones Principales */}
          <div className="mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-0">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border-3 border-yellow-300">
              <h2 
                className="text-center text-2xl sm:text-3xl lg:text-4xl font-black text-gray-700 mb-2 sm:mb-3 px-2"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                🎨 ¿Qué quieres hacer hoy? 📚
              </h2>
              <p 
                className="text-center text-gray-600 text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 px-2"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                ¡Elige una opción y comienza!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {acciones.map((accion: ImageItem, index: number) => {
                  const Icon = accion.icon;
                  const colors: ColorClasses = getColorClasses(accion.color || "blue");
                  
                  return (
                    <div
                      key={index}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => handleNavigation(accion.Json)}
                    >
                      <div className={`${colors.bg} rounded-2xl p-3 sm:p-4 shadow-xl ${colors.hover} border-2 ${colors.border}`}>
                        {Icon && (
                          <div className="bg-white rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-lg flex items-center justify-center">
                            <Icon size={40} className={`${colors.icon} sm:w-12 sm:h-12`} />
                          </div>
                        )}
                        <div className="bg-white rounded-xl p-2 sm:p-3 mb-2 sm:mb-3 shadow-md">
                          <img 
                            src={accion.src} 
                            alt={accion.caption}
                            className="w-full h-auto object-contain rounded-lg"
                          />
                        </div>
                        <h3 
                          className={`text-center text-base sm:text-lg font-black ${colors.text} px-2`}
                          style={{ fontFamily: 'Comic Sans MS, cursive' }}
                        >
                          {accion.caption}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sección de Ideas e Imágenes */}
          <div className="mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-0">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border-3 border-blue-300">
              <h2 
                className="text-center text-2xl sm:text-3xl lg:text-4xl font-black text-gray-700 mb-4 sm:mb-6 px-2"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                💡 Tu Biblioteca Personal 🖼️
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {guardarIdeas.map((idea: ImageItem, index: number) => {
                  const Icon = idea.icon;
                  const colors: ColorClasses = getColorClasses(idea.color || "blue");
                  
                  return (
                    <div
                      key={index}
                      className={`${colors.bg} rounded-2xl p-4 sm:p-6 shadow-xl transform transition-all duration-300 hover:scale-105 border-2 ${colors.border}`}
                    >
                      {Icon && (
                        <div className="flex justify-center mb-3 sm:mb-4">
                          <div className="bg-white rounded-full p-3 sm:p-4 shadow-lg">
                            <Icon size={36} className={`${colors.icon} sm:w-10 sm:h-10`} />
                          </div>
                        </div>
                      )}
                      <div className="bg-white rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 shadow-md">
                        <img 
                          src={idea.src}
                          alt={idea.caption}
                          className="w-full h-auto object-contain rounded-lg"
                        />
                      </div>
                      <h3 
                        className={`text-center text-lg sm:text-xl font-black ${colors.text} px-2`}
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        {idea.caption}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Botón de Regreso */}
          <div className="flex justify-center mb-6 sm:mb-8 px-2 sm:px-0">
            <Link href="/pages-my-books">
              <button 
                className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white text-lg sm:text-xl font-black rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
                ⬅️ Volver al menú
              </button>
            </Link>
          </div>

          {/* Mensaje Motivacional */}
          <div className="text-center px-2 sm:px-0">
            <div className="inline-block bg-white rounded-2xl shadow-2xl px-4 sm:px-8 py-3 sm:py-4 border-3 border-yellow-300 transform transition-all duration-300 hover:scale-105">
              <p 
                className="text-gray-700 text-base sm:text-lg lg:text-xl font-black flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <Sparkles className="text-yellow-500 w-6 h-6 sm:w-7 sm:h-7" />
                <span className="text-center sm:text-left">¡Cada historia comienza con una idea maravillosa!</span>
                <Sparkles className="text-yellow-500 w-6 h-6 sm:w-7 sm:h-7" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default CreateBook;