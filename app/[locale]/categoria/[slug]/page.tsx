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
