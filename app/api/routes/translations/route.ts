import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60; // ISR: revalidate every minute

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: routes, error } = await supabase
      .schema('app')
      .from('routes')
      .select(`
        pathname,
        route_translations (
          language_code,
          translated_path
        )
      `)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (error) throw error;

    // Build map: { physicalPath: { localeCode: translatedPath } }
    const translations: Record<string, Record<string, string>> = {};

    routes?.forEach((route: any) => {
      const t: Record<string, string> = {};
      route.route_translations?.forEach((tr: any) => {
        t[tr.language_code] = tr.translated_path;
      });
      if (Object.keys(t).length > 0) {
        translations[route.pathname] = t;
      }
    });

    return NextResponse.json({ translations }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('API Error - Route Translations:', error);
    return NextResponse.json({ translations: {} }, { status: 500 });
  }
}
