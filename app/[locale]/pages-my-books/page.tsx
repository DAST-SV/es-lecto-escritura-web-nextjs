import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
const Page: React.FC = () => {
    return <UnifiedLayout><></></UnifiedLayout>;
}
export default Page;
// 'use client'

// import React, { useState, useEffect } from "react";
// import { BookOpen, ArrowLeft, Star, Moon, Cloud, TreePine, Flame, Feather } from "lucide-react";
// import BookCarousel from "@/src/components/components-for-books/book/utils/BookCarousel";
// import FlipBook from "@/src/components/components-for-books/book/utils/FlipBook";
// import type { Page, LibroUI } from "@/src/typings/types-page-book/index";
// import Link from "next/link";
// import { getUserId } from "@/src/utils/supabase/utilsClient";
// import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

// interface BookData {
//   pages: Page[];
//   title?: string;
// }

// const MyBooks: React.FC = () => {
//   const [selectedBook, setSelectedBook] = useState<{ Json: string; caption: string } | null>(null);
//   const [bookData, setBookData] = useState<BookData | null>(null);
//   const [libros, setLibros] = useState<LibroUI[]>([]);
//   const [isDarkTheme, setIsDarkTheme] = useState(true);

//   useEffect(() => {
//     const fetchLibros = async () => {
//       try {
//         const idUsuario = await getUserId();
//         if (!idUsuario) return;

//         const resLibros = await fetch(`/api/libros/bookinformation/${idUsuario}`);
//         const dataLibros = await resLibros.json();
//         const librosUsuario = dataLibros?.libros ?? [];

//         const librosUI: LibroUI[] = librosUsuario.map((libro: any) => ({
//           Json: libro.id_libro,
//           src: libro.portada ?? libro.background ?? "/Imagenes/placeholder.png",
//           caption: libro.titulo,
//           description: libro.descripcion ?? "",
//         }));

//         setLibros(librosUI.filter(Boolean) as LibroUI[]);
//       } catch (error) {
//         console.error("❌ Error cargando libros y páginas:", error);
//       }
//     };

//     fetchLibros();
//   }, []);

//   useEffect(() => {
//     if (selectedBook) {
//       const fetchBook = async () => {
//         try {
//           const response = await fetch(`/api/libros/pagesforbook/${selectedBook.Json}`);
//           const data = await response.json();
//           setBookData({ pages: data.pages });
//         } catch (error) {
//           console.error("Error al cargar el libro:", error);
//         }
//       };
//       fetchBook();
//     } else {
//       setBookData(null);
//     }
//   }, [selectedBook]);

//   return (
//     <UnifiedLayout className={`relative flex flex-col min-h-screen overflow-hidden transition-colors duration-700 ${isDarkTheme
//         ? 'bg-gradient-to-b from-emerald-950 via-slate-900 to-indigo-950'
//         : 'bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100'
//       }`}>

//       {/* Botón de cambio de tema - Posición fija en esquina superior derecha */}
//       <button
//         onClick={() => setIsDarkTheme(!isDarkTheme)}
//         className={`fixed top-24 right-6 z-50 group ${isDarkTheme
//             ? 'bg-slate-800 hover:bg-slate-700 border-amber-600'
//             : 'bg-white hover:bg-amber-50 border-orange-400'
//           } p-4 rounded-2xl border-4 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-12`}
//         title={isDarkTheme ? "Cambiar a tema diurno" : "Cambiar a tema nocturno"}
//       >
//         {/* Esquinas decorativas */}
//         <div className={`absolute -top-2 -left-2 w-3 h-3 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//           }`} />
//         <div className={`absolute -top-2 -right-2 w-3 h-3 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//           }`} />
//         <div className={`absolute -bottom-2 -left-2 w-3 h-3 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//           }`} />
//         <div className={`absolute -bottom-2 -right-2 w-3 h-3 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//           }`} />

//         {isDarkTheme ? (
//           <div className="flex items-center gap-2">
//             <Moon className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
//             <span className="text-amber-200 font-serif font-bold text-sm whitespace-nowrap">Nocturno</span>
//           </div>
//         ) : (
//           <div className="flex items-center gap-2">
//             <span className="text-2xl animate-pulse">☀️</span>
//             <span className="text-orange-600 font-serif font-bold text-sm whitespace-nowrap">Diurno</span>
//           </div>
//         )}
//       </button>

//       {/* 🌲 Fondo de bosque místico / jardín soleado */}
//       <div className="absolute inset-0 -z-10 pointer-events-none opacity-15">
//         {Array.from({ length: 20 }).map((_, i) => (
//           <TreePine
//             key={i}
//             className={`absolute ${isDarkTheme ? 'text-emerald-800' : 'text-green-600'}`}
//             style={{
//               left: `${(i * 5) % 100}%`,
//               top: `${20 + (i * 7) % 60}%`,
//               width: `${30 + Math.random() * 40}px`,
//               height: `${30 + Math.random() * 40}px`,
//               opacity: 0.3 + Math.random() * 0.3
//             }}
//           />
//         ))}
//       </div>

//       {/* Niebla flotante / Nubes suaves */}
//       <div className="absolute inset-0 pointer-events-none">
//         {[...Array(6)].map((_, i) => (
//           <Cloud
//             key={i}
//             className={`absolute animate-float-slow ${isDarkTheme ? 'text-slate-400/10' : 'text-blue-300/20'
//               }`}
//             style={{
//               left: `${(i * 18) % 100}%`,
//               top: `${10 + (i * 12) % 70}%`,
//               width: `${80 + i * 15}px`,
//               height: `${60 + i * 10}px`,
//               animationDelay: `${i * 2}s`,
//               animationDuration: `${25 + i * 5}s`
//             }}
//           />
//         ))}
//       </div>

//       {/* Estrellas parpadeantes / Partículas doradas */}
//       <div className="absolute inset-0 pointer-events-none">
//         {Array.from({ length: 50 }).map((_, i) => (
//           <div
//             key={i}
//             className={`absolute w-1 h-1 rounded-full animate-pulse ${isDarkTheme ? 'bg-amber-200' : 'bg-yellow-400'
//               }`}
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animationDelay: `${Math.random() * 3}s`,
//               animationDuration: `${2 + Math.random() * 2}s`,
//               opacity: 0.3 + Math.random() * 0.4
//             }}
//           />
//         ))}
//       </div>

//       {/* CONTENIDO PRINCIPAL */}
//       {!selectedBook && (
//         <>
//           {/* Hero Section - Portal de Entrada a la Biblioteca */}
//           <div className="relative w-full mb-16 pt-8">
//             <div className="max-w-6xl mx-auto px-4">

//               {/* Arco de entrada místico / Portal soleado */}
//               <div className="relative mb-12">
//                 {/* Columnas del arco */}
//                 <div className={`absolute left-0 top-0 w-12 h-64 rounded-t-full border-4 shadow-2xl ${isDarkTheme
//                     ? 'bg-gradient-to-b from-slate-700 to-slate-900 border-amber-600/30'
//                     : 'bg-gradient-to-b from-orange-300 to-orange-500 border-yellow-600/50'
//                   }`} />
//                 <div className={`absolute right-0 top-0 w-12 h-64 rounded-t-full border-4 shadow-2xl ${isDarkTheme
//                     ? 'bg-gradient-to-b from-slate-700 to-slate-900 border-amber-600/30'
//                     : 'bg-gradient-to-b from-orange-300 to-orange-500 border-yellow-600/50'
//                   }`} />

//                 {/* Arco superior */}
//                 <div className={`absolute left-0 right-0 top-0 h-32 rounded-t-[100%] border-t-4 border-x-4 ${isDarkTheme
//                     ? 'bg-gradient-to-b from-slate-700/60 to-transparent border-amber-600/30'
//                     : 'bg-gradient-to-b from-orange-300/60 to-transparent border-yellow-600/50'
//                   }`} />

//                 {/* Placa central del arco */}
//                 <div className="absolute left-1/2 -translate-x-1/2 top-8 z-10">
//                   <div className={`relative px-12 py-6 rounded-2xl border-4 shadow-2xl ${isDarkTheme
//                       ? 'bg-slate-800 border-amber-600'
//                       : 'bg-white border-orange-400'
//                     }`}>
//                     <div className={`absolute -top-4 -left-4 w-8 h-8 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//                       }`} />
//                     <div className={`absolute -top-4 -right-4 w-8 h-8 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//                       }`} />
//                     <div className={`absolute -bottom-4 -left-4 w-8 h-8 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//                       }`} />
//                     <div className={`absolute -bottom-4 -right-4 w-8 h-8 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//                       }`} />

//                     <h1 className={`text-4xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text text-center whitespace-nowrap ${isDarkTheme
//                         ? 'bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200'
//                         : 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500'
//                       }`}>
//                       {isDarkTheme ? 'La Biblioteca Antigua' : 'La Gran Biblioteca'}
//                     </h1>
//                   </div>
//                 </div>

//                 {/* Banner de imagen místico / soleado */}
//                 <div className={`relative mt-24 overflow-hidden rounded-3xl border-8 shadow-2xl ${isDarkTheme ? 'border-slate-700/50' : 'border-orange-300/70'
//                   }`}>
                 

//                   {/* Overlay con textura de pergamino */}
//                   <div className={`absolute inset-0 ${isDarkTheme
//                       ? 'bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent'
//                       : 'bg-gradient-to-t from-orange-100 via-amber-50/60 to-transparent'
//                     }`} />
//                   <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-20" />

//                   {/* Contenido central */}
//                   <div className={`absolute inset-0 flex flex-col items-center justify-center ${isDarkTheme ? 'text-white' : 'text-gray-800'
//                     }`}>
//                     {/* Luna / Sol flotante */}
//                     <div className="relative mb-6">
//                       {isDarkTheme ? (
//                         <div className="w-24 h-24 rounded-full bg-amber-100 shadow-[0_0_60px_rgba(251,191,36,0.6)] flex items-center justify-center animate-float">
//                           <Moon className="w-12 h-12 text-amber-600" />
//                         </div>
//                       ) : (
//                         <div className="w-24 h-24 rounded-full bg-yellow-300 shadow-[0_0_60px_rgba(251,191,36,0.8)] flex items-center justify-center animate-float">
//                           <span className="text-6xl">☀️</span>
//                         </div>
//                       )}
//                     </div>

//                     <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4 text-center px-4 ${isDarkTheme ? 'text-amber-200' : 'text-orange-700'
//                       }`}
//                       style={{ textShadow: isDarkTheme ? '4px 4px 12px rgba(0,0,0,0.8)' : '2px 2px 8px rgba(255,255,255,0.8)' }}>
//                       Mis Crónicas Personales
//                     </h2>

//                     <div className="flex items-center gap-3 mb-4">
//                       <div className={`h-px w-16 ${isDarkTheme ? 'bg-amber-600' : 'bg-orange-400'}`} />
//                       <Feather className={`w-6 h-6 ${isDarkTheme ? 'text-amber-400' : 'text-orange-500'}`} />
//                       <p className={`text-xl sm:text-2xl font-serif italic ${isDarkTheme ? 'text-amber-200/90' : 'text-orange-600'
//                         }`}>
//                         Donde las historias cobran vida
//                       </p>
//                       <Feather className={`w-6 h-6 ${isDarkTheme ? 'text-amber-400' : 'text-orange-500'}`} />
//                       <div className={`h-px w-16 ${isDarkTheme ? 'bg-amber-600' : 'bg-orange-400'}`} />
//                     </div>
//                   </div>

//                   {/* Candelabros / Flores decorativas en las esquinas */}
//                   <div className="absolute top-4 left-4">
//                     {isDarkTheme ? (
//                       <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
//                     ) : (
//                       <span className="text-3xl">🌻</span>
//                     )}
//                   </div>
//                   <div className="absolute top-4 right-4">
//                     {isDarkTheme ? (
//                       <Flame className="w-8 h-8 text-orange-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
//                     ) : (
//                       <span className="text-3xl">🌸</span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Separador decorativo */}
//               <div className="flex items-center justify-center mb-12">
//                 <div className={`h-px w-32 ${isDarkTheme ? 'bg-gradient-to-r from-transparent to-amber-600/50' : 'bg-gradient-to-r from-transparent to-orange-400/50'}`} />
//                 <Star className={`w-6 h-6 mx-4 animate-pulse ${isDarkTheme ? 'text-amber-400' : 'text-yellow-500'}`} />
//                 <div className={`h-px w-32 ${isDarkTheme ? 'bg-gradient-to-l from-transparent to-amber-600/50' : 'bg-gradient-to-l from-transparent to-orange-400/50'}`} />
//               </div>
//             </div>
//           </div>

//           {/* Tarjetas de estadísticas - Estilo pergaminos */}
//           <div className="max-w-6xl mx-auto px-4 mb-16">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

//               {/* Tomos Coleccionados */}
//               <div className="relative group">
//                 <div className={`absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity ${isDarkTheme ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-pink-400 to-rose-400'
//                   }`} />
//                 <div className={`relative rounded-2xl shadow-2xl p-6 border-4 transform transition-all duration-300 hover:scale-105 hover:-rotate-1 ${isDarkTheme
//                     ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-700/40'
//                     : 'bg-gradient-to-br from-white to-orange-50 border-orange-300/70'
//                   }`}>
//                   <div className="flex items-center gap-4">
//                     <div className={`backdrop-blur-sm p-4 rounded-xl border-2 ${isDarkTheme
//                         ? 'bg-slate-700/50 border-amber-600/30'
//                         : 'bg-orange-100/50 border-orange-400/50'
//                       }`}>
//                       <BookOpen size={40} className={isDarkTheme ? 'text-amber-400' : 'text-orange-600'} />
//                     </div>
//                     <div>
//                       <p className={`text-5xl font-serif font-black mb-1 ${isDarkTheme ? 'text-amber-300' : 'text-orange-600'}`}>{libros.length}</p>
//                       <p className={`text-sm font-serif uppercase tracking-wider ${isDarkTheme ? 'text-amber-200/80' : 'text-orange-700/80'
//                         }`}>Tomos Coleccionados</p>
//                     </div>
//                   </div>
//                   {/* Ornamento inferior */}
//                   <div className={`absolute bottom-2 right-2 w-12 h-12 border-r-2 border-b-2 rounded-br-2xl ${isDarkTheme ? 'border-amber-700/30' : 'border-orange-400/40'
//                     }`} />
//                 </div>
//               </div>

//               {/* Páginas por Descubrir */}
//               <div className="relative group">
//                 <div className={`absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity ${isDarkTheme ? 'bg-gradient-to-br from-blue-600 to-cyan-600' : 'bg-gradient-to-br from-blue-400 to-cyan-400'
//                   }`} />
//                 <div className={`relative rounded-2xl shadow-2xl p-6 border-4 transform transition-all duration-300 hover:scale-105 ${isDarkTheme
//                     ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-700/40'
//                     : 'bg-gradient-to-br from-white to-blue-50 border-blue-300/70'
//                   }`}>
//                   <div className="flex items-center gap-4">
//                     <div className={`backdrop-blur-sm p-4 rounded-xl border-2 ${isDarkTheme
//                         ? 'bg-slate-700/50 border-amber-600/30'
//                         : 'bg-blue-100/50 border-blue-400/50'
//                       }`}>
//                       <Feather size={40} className={isDarkTheme ? 'text-cyan-400' : 'text-blue-600'} />
//                     </div>
//                     <div>
//                       <p className={`text-5xl font-serif font-black mb-1 ${isDarkTheme ? 'text-amber-300' : 'text-blue-600'}`}>∞</p>
//                       <p className={`text-sm font-serif uppercase tracking-wider ${isDarkTheme ? 'text-amber-200/80' : 'text-blue-700/80'
//                         }`}>Páginas por Descubrir</p>
//                     </div>
//                   </div>
//                   <div className={`absolute bottom-2 left-2 w-12 h-12 border-l-2 border-b-2 rounded-bl-2xl ${isDarkTheme ? 'border-amber-700/30' : 'border-blue-400/40'
//                     }`} />
//                 </div>
//               </div>

//               {/* Magia Contenida */}
//               <div className="relative group">
//                 <div className={`absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity ${isDarkTheme ? 'bg-gradient-to-br from-amber-600 to-orange-600' : 'bg-gradient-to-br from-yellow-400 to-orange-400'
//                   }`} />
//                 <div className={`relative rounded-2xl shadow-2xl p-6 border-4 transform transition-all duration-300 hover:scale-105 hover:rotate-1 ${isDarkTheme
//                     ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-700/40'
//                     : 'bg-gradient-to-br from-white to-yellow-50 border-yellow-300/70'
//                   }`}>
//                   <div className="flex items-center gap-4">
//                     <div className={`backdrop-blur-sm p-4 rounded-xl border-2 ${isDarkTheme
//                         ? 'bg-slate-700/50 border-amber-600/30'
//                         : 'bg-yellow-100/50 border-yellow-400/50'
//                       }`}>
//                       <Flame size={40} className={`animate-pulse ${isDarkTheme ? 'text-orange-400' : 'text-orange-600'}`} />
//                     </div>
//                     <div>
//                       <p className={`text-5xl font-serif font-black mb-1 ${isDarkTheme ? 'text-amber-300' : 'text-yellow-600'}`}>✨</p>
//                       <p className={`text-sm font-serif uppercase tracking-wider ${isDarkTheme ? 'text-amber-200/80' : 'text-yellow-700/80'
//                         }`}>Magia Contenida</p>
//                     </div>
//                   </div>
//                   <div className={`absolute top-2 right-2 w-12 h-12 border-r-2 border-t-2 rounded-tr-2xl ${isDarkTheme ? 'border-amber-700/30' : 'border-yellow-400/40'
//                     }`} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Galería de Cuentos - Estantería Antigua */}
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
//             <div className="text-center mb-10">
//               {/* Placa decorativa del título */}
//               <div className="inline-block mb-6">
//                 <div className={`relative px-12 py-6 rounded-2xl border-4 shadow-2xl ${isDarkTheme ? 'bg-slate-800 border-amber-600' : 'bg-white border-orange-400'
//                   }`}>
//                   <div className={`absolute -top-3 -left-3 w-6 h-6 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//                     }`} />
//                   <div className={`absolute -top-3 -right-3 w-6 h-6 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//                     }`} />
//                   <div className={`absolute -bottom-3 -left-3 w-6 h-6 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//                     }`} />
//                   <div className={`absolute -bottom-3 -right-3 w-6 h-6 rounded-full border-2 ${isDarkTheme ? 'bg-amber-600 border-slate-900' : 'bg-orange-400 border-white'
//                     }`} />

//                   <h2 className={`text-4xl sm:text-5xl font-serif font-bold ${isDarkTheme ? 'text-amber-200' : 'text-orange-600'
//                     }`}>
//                     {isDarkTheme ? 'Los Estantes Encantados' : 'Los Estantes Dorados'}
//                   </h2>
//                 </div>
//               </div>

//               <div className="flex items-center justify-center gap-3 mb-6">
//                 <div className={`h-px w-24 ${isDarkTheme ? 'bg-gradient-to-r from-transparent to-amber-600/50' : 'bg-gradient-to-r from-transparent to-orange-400/50'}`} />
//                 <Star className={`w-5 h-5 animate-spin ${isDarkTheme ? 'text-amber-400' : 'text-yellow-500'}`} style={{ animationDuration: '3s' }} />
//                 <div className={`h-px w-24 ${isDarkTheme ? 'bg-gradient-to-l from-transparent to-amber-600/50' : 'bg-gradient-to-l from-transparent to-orange-400/50'}`} />
//               </div>

//               <p className={`text-xl font-serif italic max-w-2xl mx-auto ${isDarkTheme ? 'text-amber-300/80' : 'text-orange-600/90'
//                 }`}>
//                 Selecciona un tomo para abrir sus páginas y adentrarte en sus secretos...
//               </p>
//             </div>

//             {/* Estantería - Marco de madera antigua */}
//             <div className={`relative rounded-3xl shadow-2xl p-8 border-8 ${isDarkTheme
//                 ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-900/50'
//                 : 'bg-gradient-to-br from-white to-orange-50 border-orange-400/60'
//               }`}>
//               {/* Magia Contenida */}
//               <div className="relative group">
//                 <div className={`absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity ${isDarkTheme ? 'bg-gradient-to-br from-amber-600 to-orange-600' : 'bg-gradient-to-br from-yellow-400 to-orange-400'
//                   }`} />
//                 <div className={`relative rounded-2xl shadow-2xl p-6 border-4 transform transition-all duration-300 hover:scale-105 hover:rotate-1 ${isDarkTheme
//                     ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-700/40'
//                     : 'bg-gradient-to-br from-white to-yellow-50 border-yellow-300/70'
//                   }`}>
//                   <div className="flex items-center gap-4">
//                     <div className={`backdrop-blur-sm p-4 rounded-xl border-2 ${isDarkTheme ? 'bg-slate-700/50 border-amber-600/30' : 'bg-yellow-100/50 border-yellow-400/50'
//                       }`}>
//                       <Star size={40} className={isDarkTheme ? 'text-yellow-400' : 'text-orange-600'} />
//                     </div>
//                     <div>
//                       <p className={`text-5xl font-serif font-black mb-1 ${isDarkTheme ? 'text-amber-300' : 'text-orange-600'}`}>★</p>
//                       <p className={`text-sm font-serif uppercase tracking-wider ${isDarkTheme ? 'text-amber-200/80' : 'text-orange-700/80'
//                         }`}>Magia Contenida</p>
//                     </div>
//                   </div>
//                   <div className={`absolute bottom-2 right-2 w-12 h-12 border-r-2 border-b-2 rounded-br-2xl ${isDarkTheme ? 'border-amber-700/30' : 'border-yellow-400/40'
//                     }`} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Carrusel de Libros */}
//           <div className="max-w-6xl mx-auto px-4 pb-32">
//             <BookCarousel
//               libros={libros}
//               onSelect={(libro) => setSelectedBook(libro)}
//             />

//           </div>
//         </>
//       )}

//       {/* 📖 Vista de libro seleccionado */}
//       {selectedBook && bookData && (
//         <div className="relative pt-6 pb-16 px-4 max-w-5xl mx-auto">

//           {/* Botón Volver */}
//           <button
//             onClick={() => setSelectedBook(null)}
//             className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border-2 shadow-lg transition-all hover:scale-105 ${isDarkTheme
//                 ? "bg-slate-800 text-amber-200 border-amber-600 hover:bg-slate-700"
//                 : "bg-white text-orange-700 border-orange-400 hover:bg-orange-50"
//               }`}
//           >
//             <ArrowLeft />
//             Volver a Mis Libros
//           </button>

//           {/* Flipbook */}
//           <FlipBook pages={bookData.pages} />
//         </div>
//       )}

//     </UnifiedLayout>
//   );
// };

// export default MyBooks;
