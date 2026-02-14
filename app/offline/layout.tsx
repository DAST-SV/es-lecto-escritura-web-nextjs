/**
 * Layout raíz para la página offline.
 * Necesario porque app/offline está fuera del [locale] segment
 * y Next.js App Router requiere un layout con <html> y <body>.
 */
export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
