// Este overlay bloquea la UI automáticamente mientras Next carga la página
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm pointer-events-auto">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
