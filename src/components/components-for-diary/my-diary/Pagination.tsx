import {PaginationProps} from '@/src/typings/types-diary/types'


export const Pagination: React.FC<PaginationProps> = ({ 
  paginaActual, 
  totalPaginas, 
  onPageChange 
}) => {
  const generarPaginas = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) {
        pages.push(i);
      }
    } else {
      if (paginaActual <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        pages.push(1, '...', totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas);
      } else {
        pages.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-xl font-bold text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        ← Anterior
      </button>

      {generarPaginas().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)} 
            className={`px-4 py-2 rounded-xl font-bold transition-all border-2 ${
              page === paginaActual
                ? 'bg-purple-500 text-white border-purple-600 scale-110'
                : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-100'
            }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-xl font-bold text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Siguiente →
      </button>
    </div>
  );
};