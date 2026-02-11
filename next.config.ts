import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Deshabilitar todos los logs de Next.js
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Agregar 90 a las qualities configuradas
    qualities: [75, 80, 70,  85, 90, 95],
    
    // Si tienes dominio de Supabase, agrégalo aquí
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
