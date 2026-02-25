// ============================================
// app/[locale]/loading.tsx
// Loading sutil para navegación entre páginas
// NO fullscreen — solo barra de progreso arriba + mini indicador
// ============================================

export default function Loading() {
  return (
    <>
      {/* Barra de progreso animada en la parte superior */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-blue-100">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-blue-500 to-green-400 rounded-r-full"
          style={{
            animation: 'loading-bar 1.8s ease-in-out infinite',
          }}
        />
      </div>

      {/* Mini indicador central (sutil, con blur de fondo) */}
      <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg px-6 py-4 flex items-center gap-3 border border-yellow-200">
          {/* Mini libro animado */}
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
              {/* Lomo */}
              <rect x="18" y="4" width="4" height="32" rx="1" fill="#3b82f6" opacity="0.6" />
              {/* Página izquierda */}
              <rect x="2" y="4" width="16" height="32" rx="2" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" />
              {/* Líneas de texto */}
              <line x1="5" y1="12" x2="15" y2="12" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
              <line x1="5" y1="17" x2="14" y2="17" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
              <line x1="5" y1="22" x2="15" y2="22" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
              {/* Página derecha — se voltea */}
              <rect
                x="22" y="4" width="16" height="32" rx="2" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5"
                style={{ transformOrigin: '22px 20px', animation: 'page-flip 1.5s ease-in-out infinite' }}
              />
            </svg>
          </div>
          <span
            className="text-blue-600 font-bold text-sm"
            style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
          >
            Cargando...
          </span>
        </div>
      </div>

      {/* Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
        @keyframes page-flip {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-30deg); }
        }
      `}} />
    </>
  );
}
