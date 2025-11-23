import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
const Page: React.FC = () => {
    return <UnifiedLayout><></></UnifiedLayout>;
}
export default Page;
// 'use client'

// import React from "react";
// import Image from "next/image";
// import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

// import fondo from "@/public/Imagenes/explore-content/Fondo.jpg";

// // 🔹 Imagen cuento y botones
// import Cuento from "@/public/Imagenes/detalle-de-cuento/4c0b975f-aad1-466d-8f92-195023104342.jpg";
// import Retos from "@/public/Imagenes/detalle-de-cuento/ba760be0-e5dd-4719-ac94-800abc34b092.jpg";
// import Volver from "@/public/Imagenes/detalle-de-cuento/213275df-e013-446d-b6a5-c84ac1e21e1d.jpg";
// import Desafio from "@/public/Imagenes/detalle-de-cuento/8bc051e2-a614-488f-beb1-c4666c24ade0.jpg";
// import Leer from "@/public/Imagenes/detalle-de-cuento/d8621f18-298a-427a-b0c9-617fa1e6f2e7.jpg";

// // 🔹 Grid genérico (solo para la imagen del cuento)
// import ImageGrid, { ImageItem } from "@/src/utils/imagenes/ImageGrid";

// const StoryCard: React.FC = () => {
//   // 🔹 Imagen del cuento
//   const cuentoImage: ImageItem[] = [
//     {
//       src: Cuento,
//       caption: "EL SECRETO DEL ÁRBOL AZUL",
//     },
//   ];

//   return (
//     <UnifiedLayout className="relative flex flex-col min-h-screen overflow-hidden">
//       <div
//         className="min-h-screen flex flex-col justify-center p-6"
//         style={{
//           backgroundImage: `url(${fondo.src})`,
//           backgroundRepeat: "no-repeat",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {/* 🔹 Contenedor principal con fondo azul gradiente */}
//         <div className="mx-auto w-full max-w-5xl bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 rounded-3xl p-6 relative shadow-lg">

//           {/* 🔹 Estrellas decorativas */}
//           <div className="absolute top-4 right-6 text-white text-3xl">✦</div>
//           <div className="absolute bottom-20 right-8 text-white text-xl">✦</div>

//           {/* 🔹 Layout principal: imagen + texto */}
//           <div className="flex flex-col md:flex-row gap-6 mb-6">

//             {/* 🔹 Imagen del cuento */}
//             <div className="flex-shrink-0 w-full md:w-80">
//               <ImageGrid
//                 images={cuentoImage}
//                 columns={1}
//                 aspectRatio="3/4"
//                 captionColor="white"
//                 captionSize="text-lg font-bold"
//                 textBackgroundColor="rgba(0,0,0,0.7)"
//               />
//             </div>

//             {/* 🔹 Contenido de texto */}
//             <div className="flex-1 text-black">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//                 {/* 🔹 Columna izquierda */}
//                 <div>
//                   <h2 className="text-xl font-bold mb-3 text-white">Resumen</h2>
//                   <p className="text-sm leading-relaxed mb-4 text-black">
//                     Tomás, un niño curioso que descubre un árbol azul que ha perdido su magia por culpa de un hada traviesa; para ayudarlo, se enfrenta a acertijos y desafíos en un bosque encantado.
//                   </p>
//                   <p className="text-sm leading-relaxed mb-4 text-black">
//                     Con astucia y valentía, logra recuperar una chispa dorada que devuelve la luz y el poder al árbol. Al final, el bosque brilla de nuevo y Tomás se despide con el corazón lleno.
//                   </p>

//                   <div className="space-y-2 text-sm text-black">
//                     <p><span className="font-bold">Género:</span> Fantasía</p>
//                     <p><span className="font-bold">Personajes:</span> Tomás, un árbol parlante, y un hada traviesa</p>
//                     <p><span className="font-bold">Etiquetas:</span> Bosque, hada, magia <span className="text-white text-lg">✦</span></p>
//                   </div>
//                 </div>

//                 {/* 🔹 Columna derecha */}
//                 <div>
//                   <h3 className="text-xl font-bold mb-3 text-white">Valores del cuento</h3>
//                   <p className="text-sm mb-4 text-black">
//                     Curiosidad, Empatía, Respeto, Imaginación, Asombro
//                   </p>

//                   <p className="text-sm font-bold text-black mt-6">
//                     <span className="text-white font-bold">Edad recomendada:</span> de 7 a 12 años
//                   </p>
//                 </div>
//               </div>

//               {/* 🔹 Fila de botones */}
//               {/* 🔹 Fila de botones */}
//               <div className="flex justify-center items-center gap-6 mt-6">
//                 {[Leer, Desafio, Retos, Volver].map((img, index) => (
//                   <button
//                     key={index}
//                     className="transition-transform hover:scale-105"
//                   >
//                     <Image
//                       src={img}
//                       alt={`Botón ${index + 1}`}
//                       width={160} // 🔹 Tamaño mediano (ajustable)
//                       height={160}
//                       className="rounded-2xl shadow-md cursor-pointer"
//                     />
//                   </button>
//                 ))}
//               </div>


//             </div>
//           </div>
//         </div>
//       </div>
//     </UnifiedLayout>
//   );
// };

// export default StoryCard;
