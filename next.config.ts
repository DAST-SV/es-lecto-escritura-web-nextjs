import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["hxxtkzshnnrwxvvgtgsh.supabase.co"], // ✅ host de Supabase
    qualities: [75, 85, 95], // Define los valores de calidad permitidos
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
