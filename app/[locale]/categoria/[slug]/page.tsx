import { ImprovedBookCategoryPage } from "@/src/components/InteractiveBooks";
import { contentCategories } from "@/src/components/sections/public/data/contentCategories";
import { notFound } from 'next/navigation';

interface CategoryPageParams {
  locale: string;
  slug: string;
}

export default async function CategoryPage({ params }: { params: Promise<CategoryPageParams> }) {
  const { slug } = await params;

  const categoryMap: Record<string, string> = {
    'cuentos': 'cuentos',
    'fabulas': 'fabulas',
    'poemas': 'poemas',
    'leyendas': 'leyendas',
    'adivinanzas': 'adivinanzas',
    'historietas': 'historietas',
    'trabalenguas': 'trabalenguas',
    'refranes': 'refranes'
  };

  const categoryId = categoryMap[slug];
  const category = contentCategories.find(cat => cat.id === categoryId);
  
  if (!category) {
    notFound();
  }

  return <ImprovedBookCategoryPage category={category} />;
}
// // O crear una página dinámica: app/[locale]/categoria/[slug]/page.tsx
// interface CategoryPageProps {
//   params: {
//     locale: string;
//     slug: string;
//   };
// }

// export default function CategoryPage({ params }: CategoryPageProps) {
//   const categoryMap: Record<string, string> = {
//     'cuentos': 'cuentos',
//     'fabulas': 'fabulas', 
//     'poemas': 'poemas',
//     'leyendas': 'leyendas',
//     'adivinanzas': 'adivinanzas',
//     'historietas': 'historietas',
//     'trabalenguas': 'trabalenguas',
//     'refranes': 'refranes'
//   };

//   const categoryId = categoryMap[params.slug];
//   const category = contentCategories.find(cat => cat.id === categoryId);
  
//   if (!category) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-800 mb-4">
//             Categoría no encontrada
//           </h1>
//           <p className="text-gray-600">
//             La categoría "{params.slug}" no existe.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return <SingleCategoryPage category={category} />;
// }

// // Para generar páginas estáticas
// export async function generateStaticParams() {
//   return [
//     { slug: 'cuentos' },
//     { slug: 'fabulas' },
//     { slug: 'poemas' },
//     { slug: 'leyendas' },
//     { slug: 'adivinanzas' },
//     { slug: 'historietas' },
//     { slug: 'trabalenguas' },
//     { slug: 'refranes' }
//   ];
// }