/**
 * Offline Fallback Page
 * @file app/offline/page.tsx
 * @description Página que se muestra cuando no hay conexión a internet.
 * Sin texto estático — comunicación visual universal.
 */

'use client';

import { useState, useEffect } from 'react';

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);
  const [dots, setDots] = useState(0);

  // Animación de puntos suspensivos mientras reintenta
  useEffect(() => {
    if (!retrying) return;
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, [retrying]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      // Usar fetch con cache bypass explícito — el SW ignora Supabase y no-store
      // Probar con un recurso pequeño que el SW NO cachea (query string única)
      const probe = await fetch(`/favicon.ico?_=${Date.now()}`, {
        cache: 'no-store',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000),
      });
      // mode: no-cors siempre retorna opaque response (type === 'opaque')
      // si llega cualquier response, hay red
      if (probe.type === 'opaque' || probe.ok) {
        // Ir a la página anterior si era del mismo origen, sino al home
        const dest =
          document.referrer &&
          (() => {
            try {
              return new URL(document.referrer).origin === location.origin;
            } catch {
              return false;
            }
          })()
            ? document.referrer
            : '/';
        window.location.replace(dest);
        return;
      }
    } catch {
      // Sin conexión todavía
    }
    setRetrying(false);
    setDots(0);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          font-family: Nunito, 'Varela Round', Comfortaa, sans-serif;
        }
        .card {
          text-align: center;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        /* ── Ilustración ── */
        .illustration { position: relative; width: 160px; height: 160px; }

        /* Libro flotante */
        .book-wrap {
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(-10px); }
        }

        /* Sombra del libro */
        .book-shadow {
          position: absolute;
          bottom: -6px; left: 50%;
          transform: translateX(-50%);
          width: 90px; height: 10px;
          background: rgba(30, 64, 175, 0.3);
          border-radius: 50%;
          animation: shadow-pulse 3s ease-in-out infinite;
        }
        @keyframes shadow-pulse {
          0%, 100% { transform: translateX(-50%) scaleX(1);   opacity: 0.4; }
          50%       { transform: translateX(-50%) scaleX(0.7); opacity: 0.2; }
        }

        /* Badge wifi tachado */
        .wifi-badge {
          position: absolute;
          top: 0; right: 0;
          background: #fbbf24;
          border-radius: 50%;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          border: 3px solid white;
          animation: badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes badge-pop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* ── Barra de señal sin conexión ── */
        .signal-bars {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 20px;
        }
        .bar {
          width: 5px;
          border-radius: 2px;
          background: white;
          opacity: 0.25;
        }
        .bar:nth-child(1) { height: 6px; }
        .bar:nth-child(2) { height: 10px; }
        .bar:nth-child(3) { height: 14px; }
        .bar:nth-child(4) { height: 19px; }

        /* ── Botón reintentar ── */
        .retry-btn {
          width: 76px; height: 76px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.8);
          background: #fbbf24;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2), 0 0 0 0 rgba(251,191,36,0.5);
          transition: transform 0.2s, box-shadow 0.2s;
          outline: none;
          animation: pulse-ring 2.5s ease-out infinite;
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 8px 24px rgba(0,0,0,0.2), 0 0 0 0   rgba(251,191,36,0.5); }
          70%  { box-shadow: 0 8px 24px rgba(0,0,0,0.2), 0 0 0 18px rgba(251,191,36,0);   }
          100% { box-shadow: 0 8px 24px rgba(0,0,0,0.2), 0 0 0 0   rgba(251,191,36,0);   }
        }
        .retry-btn:hover:not(:disabled) { transform: scale(1.1); }
        .retry-btn:active:not(:disabled){ transform: scale(0.95); }
        .retry-btn:disabled { opacity: 0.65; cursor: not-allowed; animation: none; }
        .retry-btn svg { width: 34px; height: 34px; fill: #1e40af; }
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Puntos de espera ── */
        .dots-row {
          display: flex; gap: 8px; align-items: center; height: 20px;
        }
        .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: white;
          opacity: 0;
          animation: dot-blink 1.2s ease-in-out infinite;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot-blink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>

      <div className="card">

        {/* ── Ilustración principal ── */}
        <div className="illustration">
          <div className="book-shadow" />

          <div className="book-wrap">
            <svg
              width="130" height="130"
              viewBox="0 0 130 130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Portada izquierda */}
              <rect x="6" y="22" width="52" height="76" rx="5"
                fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
              {/* Líneas de texto izq */}
              <line x1="16" y1="40" x2="50" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="50" x2="50" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="60" x2="50" y2="60" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="70" x2="40" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="80" x2="46" y2="80" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              {/* Lomo */}
              <rect x="59" y="22" width="12" height="76" rx="3"
                fill="white" fillOpacity="0.45"/>
              {/* Portada derecha */}
              <rect x="72" y="22" width="52" height="76" rx="5"
                fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
              {/* Líneas de texto der */}
              <line x1="82" y1="40" x2="116" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="82" y1="50" x2="116" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="82" y1="60" x2="116" y2="60" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="82" y1="70" x2="102" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="82" y1="80" x2="110" y2="80" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>

          {/* Badge wifi tachado */}
          <div className="wifi-badge" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {/* Arcos wifi */}
              <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="#1e40af" strokeWidth="2" strokeLinecap="round"/>
              <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="#1e40af" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="20" r="1.5" fill="#1e40af"/>
              {/* Cruz roja */}
              <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Barras de señal (todas apagadas) */}
        <div className="signal-bars" aria-hidden="true">
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>

        {/* Indicador de estado */}
        {retrying ? (
          <div className="dots-row" aria-label="Retrying">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        ) : (
          <div style={{ height: '20px' }} />
        )}

        {/* Botón de reintentar */}
        <button
          className="retry-btn"
          onClick={handleRetry}
          disabled={retrying}
          aria-label="Retry connection"
        >
          <svg
            viewBox="0 0 24 24"
            className={retrying ? 'spin' : ''}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>

      </div>
    </>
  );
}
