import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
const Page: React.FC = () => {
    return <UnifiedLayout><></></UnifiedLayout>;
}
export default Page;
// 'use client'

// import React, { useState, useEffect } from "react";
// import { Book, Trash2, ArrowLeft, Sparkles, Library, Star, Heart } from "lucide-react";
// import ImageGrid from "@/src/utils/imagenes/ImageGrid";
// import FlipBook from "@/src/components/components-for-books/book/utils/FlipBook";
// import { Page } from "@/src/core/domain/types";
// import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
// import { getUserId } from "@/src/utils/supabase/utilsClient";

// interface BookData {
//   pages: any[];
//   title?: string;
// }

// interface LibroUI {
//   Json: string;
//   src: string;
//   caption: string;
//   description?: string;
// }

// const MyBooks: React.FC = () => {
//   const [selectedBook, setSelectedBook] = useState<{ json: string } | null>(null);
//   const [bookData, setBookData] = useState<BookData | null>(null);
//   const [libros, setLibros] = useState<LibroUI[]>([]);

//   // 🔹 Cargar libros desde la API
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
//         console.error("❌ Error cargando libros:", error);
//       }
//     };

//     fetchLibros();
//   }, []);

//   // 🔹 Cargar libro seleccionado desde la API
//   useEffect(() => {
//     if (selectedBook) {
//       const fetchBook = async () => {
//         try {
//           const response = await fetch(`/api/libros/pagesforbook/${selectedBook.json}`);
//           const data = await response.json();
//           setBookData({ pages: data.pages });
//         } catch (error) {
//           console.error("❌ Error al cargar el libro:", error);
//         }
//       };
//       fetchBook();
//     } else {
//       setBookData(null);
//     }
//   }, [selectedBook]);

//   // 🔹 Eliminar libro con confirmación
//   const handleDeleteBook = async (idLibro: string) => {
//     if (!confirm("🚨 ¿Estás seguro que quieres borrar este cuento mágico?")) return;

//     try {
//       const res = await fetch(`/api/libros/deletebook/${idLibro}`, { method: "DELETE" });
//       const data = await res.json();

//       if (res.ok) {
//         alert("✅ Libro eliminado correctamente");
//         setLibros((prev) => prev.filter((libro) => libro.Json !== idLibro));
//       } else {
//         alert(`❌ Error al eliminar libro: ${data.error}`);
//       }
//     } catch (error) {
//       console.error("❌ Error al eliminar libro:", error);
//     }
//   };

//   return (
//     <UnifiedLayout className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-cyan-50">
//       {!selectedBook && (
//         <>
//           {/* Hero Section Divertido */}
//           <div className="relative w-full overflow-hidden bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 py-16">
//             {/* Decoraciones flotantes */}
//             <div className="absolute inset-0 overflow-hidden pointer-events-none">
//               <Star className="absolute top-10 left-10 text-white animate-pulse" size={40} />
//               <Star className="absolute top-20 right-20 text-yellow-200 animate-bounce" size={30} />
//               <Heart className="absolute bottom-10 left-20 text-white animate-pulse" size={35} />
//               <Sparkles className="absolute bottom-20 right-10 text-yellow-100 animate-bounce" size={35} />
//             </div>

//             <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
//               <div className="inline-block mb-6 animate-bounce">
//                 <div className="bg-white rounded-full p-6 shadow-2xl">
//                   <Library size={64} className="text-sky-500" />
//                 </div>
//               </div>
              
//               <h1 className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-lg" 
//                   style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.2)' }}>
//                 ✨ Mi Biblioteca Mágica ✨
//               </h1>
              
//               <p className="text-2xl md:text-3xl text-white font-bold drop-shadow-md">
//                 🌈 ¡Todos tus cuentos favoritos en un solo lugar! 🌈
//               </p>
//             </div>
//           </div>

//           {/* Contenido Principal */}
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
//             {/* Tarjetas de Stats Divertidas */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
//               <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-3xl shadow-xl p-8 transform transition-all duration-300 hover:scale-110 hover:rotate-2">
//                 <div className="text-center text-white">
//                   <div className="inline-block bg-white rounded-full p-4 mb-4">
//                     <Book size={48} className="text-sky-600" />
//                   </div>
//                   <p className="text-5xl font-black mb-2">{libros.length}</p>
//                   <p className="text-xl font-bold">Cuentos Guardados</p>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-cyan-400 to-teal-500 rounded-3xl shadow-xl p-8 transform transition-all duration-300 hover:scale-110 hover:rotate-2">
//                 <div className="text-center text-white">
//                   <div className="inline-block bg-white rounded-full p-4 mb-4">
//                     <Sparkles size={48} className="text-cyan-600" />
//                   </div>
//                   <p className="text-5xl font-black mb-2">∞</p>
//                   <p className="text-xl font-bold">Aventuras</p>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl shadow-xl p-8 transform transition-all duration-300 hover:scale-110 hover:rotate-2">
//                 <div className="text-center text-white">
//                   <div className="inline-block bg-white rounded-full p-4 mb-4">
//                     <Heart size={48} className="text-blue-600" />
//                   </div>
//                   <p className="text-5xl font-black mb-2">100%</p>
//                   <p className="text-xl font-bold">Diversión</p>
//                 </div>
//               </div>
//             </div>

//             {/* Título de Sección */}
//             <div className="text-center mb-12">
//               <h2 className="text-5xl md:text-6xl font-black text-blue-700 mb-4"
//                   style={{ textShadow: '3px 3px 0px rgba(255,255,255,0.5)' }}>
//                 🎪 Tus Cuentos Favoritos 🎪
//               </h2>
              
//               <div className="flex items-center justify-center gap-2 mb-6">
//                 <Star className="text-yellow-400 animate-spin" size={24} style={{ animationDuration: '3s' }} />
//                 <div className="h-2 w-32 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 rounded-full" />
//                 <Star className="text-yellow-400 animate-spin" size={24} style={{ animationDuration: '3s' }} />
//               </div>

//               <p className="text-2xl text-blue-600 font-bold max-w-2xl mx-auto">
//                 ¡Haz clic en un libro para leer! 📚✨
//               </p>
//             </div>

//             {/* Grid de Libros */}
//             {libros.length > 0 ? (
//               <ImageGrid
//                 images={libros}
//                 shapeType={2}
//                 columns={3}
//                 onClick={(book: any) => setSelectedBook({ json: book.Json })}
//                 showButton={true}
//                 buttonText="🗑"
//                 buttonColor="red"
//                 buttonPosition="corner"
//                 onButtonClick={(book: any) => handleDeleteBook(book.Json)}
//               />
//             ) : (
//               <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
//                 <div className="inline-block animate-bounce mb-6">
//                   <Book size={80} className="text-gray-300" />
//                 </div>
//                 <p className="text-3xl font-bold text-gray-600 mb-3">
//                   ¡Ups! No hay cuentos todavía
//                 </p>
//                 <p className="text-xl text-gray-400">
//                   🌟 ¡Empieza a crear tus historias mágicas! 🌟
//                 </p>
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* Vista de Lectura */}
//       {selectedBook && bookData && (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8">
//             <FlipBook pages={bookData.pages} />
//           </div>
          
//           <div className="flex justify-center">
//             <button
//               onClick={() => setSelectedBook(null)}
//               className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 text-white text-2xl font-black rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-110 hover:-translate-y-2"
//               style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}
//             >
//               <ArrowLeft size={28} />
//               ⬅️ Volver a mis cuentos
//             </button>
//           </div>
//         </div>
//       )}
//     </UnifiedLayout>
//   );
// };

// export default MyBooks;