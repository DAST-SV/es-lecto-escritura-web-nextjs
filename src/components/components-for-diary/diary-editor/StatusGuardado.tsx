'use client';

interface StatusGuardadoProps {
  guardando: boolean;
  ultimoGuardado: Date | null;
  subiendoImagen: boolean;
}

export default function StatusGuardado({ guardando, ultimoGuardado, subiendoImagen }: StatusGuardadoProps) {
  const formatearTiempo = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);

    if (diferencia < 10) {
      return 'justo ahora';
    } else if (diferencia < 60) {
      return `hace ${diferencia} segundos`;
    } else if (diferencia < 3600) {
      const minutos = Math.floor(diferencia / 60);
      return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    } else {
      return fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (subiendoImagen) {
    return (
      <span className="flex items-center gap-2 text-amber-200 animate-pulse">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-amber-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-amber-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-amber-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm font-medium">Subiendo imagen...</span>
      </span>
    );
  }

  if (guardando) {
    return (
      <span className="flex items-center gap-2 text-amber-200">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm font-medium">Guardando...</span>
      </span>
    );
  }

  if (ultimoGuardado) {
    return (
      <span className="flex items-center gap-2 text-amber-100">
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">
          Guardado {formatearTiempo(ultimoGuardado)}
        </span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-amber-300">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span className="text-sm font-medium">Sin guardar</span>
    </span>
  );
}