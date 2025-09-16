import HeroCarousel from '@/src/components/sections/public/HeroCarousel';
import {getTranslations} from 'next-intl/server';
 
export default async function HomePage() {
  // const t = await getTranslations('welcome');
  // return <h1>{t('title')}...</h1>;
  return <HeroCarousel />
}