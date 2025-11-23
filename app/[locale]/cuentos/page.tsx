// 'use client'
// import React from "react";
// import Image from "next/image";
// import { Search } from "lucide-react"; // Ícono lupa
// import ImageGrid, { ImageItem } from "@/src/utils/imagenes/ImageGrid";
// import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

// // 🔹 Imports de imágenes
// import Caracoles from "@/public/Imagenes/explore-content/top10/04e5ba5c-10d1-4f6d-ac86-82b8a0ba59fc.jpg";
// import Hamster from "@/public/Imagenes/explore-content/top10/52063d7e-8fd6-4f18-9ce2-d05abbb78fbb.jpg";
// import Dragon from "@/public/Imagenes/explore-content/top10/9d6e7983-33e9-4192-af7c-80d5ce7186ae.jpg";

// const Page: React.FC = () => {
//     const topLecturas: ImageItem[] = [
//         {
//             caption: "El Dragón de las Nubes",
//             component: (
//                 <Image
//                     src={Dragon}
//                     alt="Dragón"
//                     width={500}
//                     height={350}
//                     className="w-full h-auto object-cover rounded-lg"
//                 />
//             ),
//         },
//         {
//             caption: "El Hámster Viajero",
//             component: (
//                 <Image
//                     src={Hamster}
//                     alt="Hámster"
//                     width={500}
//                     height={350}
//                     className="w-full h-auto object-cover rounded-lg"
//                 />
//             ),
//         },
//         {
//             caption: "La Carrera de los Caracoles Valientes",
//             component: (
//                 <Image
//                     src={Caracoles}
//                     alt="Caracoles"
//                     width={500}
//                     height={350}
//                     className="w-full h-auto object-cover rounded-lg"
//                 />
//             ),
//         },
//         {
//             caption: "El Hámster Viajero",
//             component: (
//                 <Image
//                     src={Hamster}
//                     alt="Hámster"
//                     width={500}
//                     height={350}
//                     className="w-full h-auto object-cover rounded-lg"
//                 />
//             ),
//         },
//         {
//             caption: "El Dragón de las Nubes",
//             component: (
//                 <Image
//                     src={Dragon}
//                     alt="Dragón"
//                     width={500}
//                     height={350}
//                     className="w-full h-auto object-cover rounded-lg"
//                 />
//             ),
//         }

//     ];

//     return (
//         <UnifiedLayout className="relative flex flex-col min-h-screen overflow-hidden">
//             <div className="px-4 sm:px-6 md:px-16 py-6 space-y-12 bg-white">

//                 {/* 🔹 Barra de filtros */}
//                 <div className="w-full px-10 flex items-center bg-sky-400 text-black font-bold text-sm shadow-md rounded-md overflow-hidden">
//                     <button className="px-4 py-2 hover:bg-sky-500">Todos</button>
//                     <button className="px-4 py-2 hover:bg-sky-500">Niveles</button>
//                     <button className="px-4 py-2 hover:bg-sky-500">Géneros</button>
//                     <button className="px-4 py-2 hover:bg-sky-500">Etiquetas</button>
//                     <button className="px-4 py-2 hover:bg-sky-500">País</button>
//                     <button className="px-4 py-2 hover:bg-sky-500">Usuario</button>

//                     {/* Input de búsqueda */}
//                     <div className="flex items-center ml-auto bg-white text-black px-2">
//                         <input
//                             type="text"
//                             placeholder="Buscar..."
//                             className="px-2 py-1 outline-none w-56"
//                         />
//                         <Search className="w-5 h-5 cursor-pointer text-black" />
//                     </div>
//                 </div>

//                 {/* 🔹 Top lecturas */}
//                 <div className="w-full px-10 rounded-xl p-4 shadow-md bg-white">
//                     <h2 className="text-3xl font-bold mb-3 text-center text-black">
//                         Top 10 de tu país
//                     </h2>
//                     <ImageGrid images={topLecturas} columns={5} shapeType={1}  onClick={(img) => "/detalle-de-cuento"} />
//                 </div>

//                 {/* 🔹 Top lecturas */}
//                 <div className="w-full px-10 rounded-xl p-4 shadow-md bg-white">
//                     <h2 className="text-3xl font-bold mb-3 text-center text-black">
//                         Cuentos más leídos
//                     </h2>
//                     <ImageGrid images={topLecturas} columns={5} shapeType={1} />
//                 </div>

//                 {/* 🔹 Top lecturas */}
//                 <div className="w-full px-10 rounded-xl p-4 shadow-md bg-white">
//                     <h2 className="text-3xl font-bold mb-3 text-center text-black">
//                         Cuentos mejor evaluados
//                     </h2>
//                     <ImageGrid images={topLecturas} columns={5} shapeType={1} />
//                 </div>

//             </div>
//         </UnifiedLayout>
//     );
// };

// export default Page;
