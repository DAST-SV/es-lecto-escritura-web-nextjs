/**
 * Offline Fallback Page
 * @file app/offline/page.tsx
 * @description Página que se muestra cuando no hay conexión a internet
 */

'use client';

export default function OfflinePage() {
  return (
    <div
      style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
        color: 'white',
      }}
    >
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {/* Icono de libro */}
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📚</div>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            marginBottom: '0.5rem',
            textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
          }}
        >
          ¡Sin conexión!
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            maxWidth: '400px',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          Parece que no tienes conexión a internet. Revisa tu WiFi o datos
          móviles e intenta de nuevo.
        </p>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '14px 32px',
            fontSize: '1rem',
            fontWeight: 800,
            fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
            backgroundColor: '#fbbf24',
            color: '#1e40af',
            border: '3px solid white',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          🔄 Reintentar
        </button>

        <div
          style={{
            marginTop: '3rem',
            opacity: 0.6,
            fontSize: '0.85rem',
          }}
        >
          Eslectoescritura · Aprende a leer y escribir
        </div>
      </div>
    </div>
  );
}
