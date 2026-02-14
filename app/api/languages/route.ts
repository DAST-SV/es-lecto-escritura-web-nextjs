import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 300; // ISR: revalidate every 5 minutes

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data, error } = await supabase
      .schema('app')
      .from('languages')
      .select('code, name, native_name, flag_emoji, is_default, is_active, order_index')
      .eq('is_active', true)
      .order('order_index')
      .order('code');

    if (error) throw error;

    const defaultLang = data?.find((l) => l.is_default) || data?.[0];

    return NextResponse.json({
      languages: data || [],
      locales: (data || []).map((l) => l.code),
      defaultLocale: defaultLang?.code || 'es',
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('API Error - Languages:', error);
    return NextResponse.json(
      { error: 'Error fetching languages', languages: [], locales: ['es'], defaultLocale: 'es' },
      { status: 500 }
    );
  }
}
