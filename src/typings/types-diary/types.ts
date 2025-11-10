import { LucideIcon } from 'lucide-react';



export interface EntradaDiario {
  id_entrada: number;
  id_usuario: number;
  titulo: string | null;
  fecha: string;
  total_paginas: number;
  id_emocion: number | null;
  privacidad: 'solo_nino' | 'padres_nino' | 'docente_nino' | 'padres_nino_docente';
  es_favorito: boolean;
  clima: string | null;
  calificacion_dia: number | null;
  creado: string;
  actualizado: string | null;
}

export interface PaginaDiario {
  id_pagina: number;
  id_entrada: number;
  numero: number;
  contenido: string;
  creado: string;
  actualizado: string | null;
}

export interface Emocion {
  id_emocion: number;
  nombre: string;
  color: string | null;
  icono: string | null;
  es_positiva: boolean | null;
  orden: number | null;
}

export interface Pregunta {
  id_pregunta: number;
  texto: string;
  categoria: string | null;
  edad_minima: number | null;
  edad_maxima: number | null;
  activa: boolean;
}

export interface Adjunto {
  id_adjunto: number;
  id_pagina: number;
  ruta: string;
  tipo: string | null;
  descripcion: string | null;
  tamano: number | null;
  creado: string;
}

///////////////////////////////////////////////////////////////////////////////////////////
///ESTOS TIPOS SON UTILIZADOS MERAMENTE PARA VISTA NO PARA INTERACTURAR CON LA BD
//////////////////////////////////////////////////////////////////////////////////////////
// types/diary.types.ts

export interface EntradaDiario {
  id_entrada: number;
  titulo: string | null;
  fecha: string;
  clima: string | null;
  calificacion_dia: number | null;
  total_paginas: number;
  es_favorito: boolean;
  creado: string;
  emocion: string | null;
  color_emocion: string | null;
  icono_emocion: string | null;
  contenido_preview?: string;
}

export type FiltroEmocion = 'todas' | 'positivas' | 'negativas';
export type OrdenFecha = 'recientes' | 'antiguas';

// ============= COMPONENT PROPS =============

// DiaryHeader Props
export interface DiaryHeaderProps {
  totalEntradas: number;
  onNuevaEntrada: () => void;
  onVolver: () => void;
}

// SearchAndFilters Props
export interface SearchAndFiltersProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  filtroEmocion: FiltroEmocion;
  onFiltroEmocionChange: (filtro: FiltroEmocion) => void;
  filtroCalificacion: number | null;
  onFiltroCalificacionChange: (calificacion: number | null) => void;
  ordenFecha: OrdenFecha;
  onOrdenFechaToggle: () => void;
  mostrarFiltros: boolean;
  onToggleFiltros: () => void;
}

// DiaryCard Props
export interface DiaryCardProps {
  entrada: EntradaDiario;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleFavorito: (id: number, esFavorito: boolean) => void;
}

// Pagination Props
export interface PaginationProps {
  paginaActual: number;
  totalPaginas: number;
  onPageChange: (page: number) => void;
}

// EmptyState Props
export interface EmptyStateProps {
  hasFilters: boolean;
  onCreateNew: () => void;
}

// DeleteModal Props
export interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface EmocionVista {
  id_emocion: number;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
}

// Parámetros para crear una nueva entrada
export interface CrearEntradaParams {
  titulo: string;
  clima: string | null;
  emocionesSeleccionadas: number[];
  calificacion: number;
}

// Valor de retorno del hook useNuevaEntrada
export interface UseNuevaEntradaReturn {
  crearEntrada: (params: CrearEntradaParams) => Promise<number | null>;
  cargando: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

export interface ClimaOption {
  nombre: string;
  icon: LucideIcon;
  color: string;
}

export interface PasoInfo {
  numero: number;
  titulo: string;
  descripcion: string;
}

// Props de Componentes
export interface StepIndicatorProps {
  pasos: PasoInfo[];
  pasoActual: number;
}

export interface TituloStepProps {
  titulo: string;
  onTituloChange: (value: string) => void;
}

export interface EmocionesStepProps {
  emociones: Emocion[];
  emocionesSeleccionadas: number[];
  onToggleEmocion: (id: number) => void;
}

export interface CalificacionStepProps {
  calificacion: number;
  onCalificacionChange: (value: number) => void;
}

export interface ClimaStepProps {
  climas: ClimaOption[];
  climaSeleccionado: string | null;
  onClimaChange: (clima: string) => void;
}

export interface NavigationButtonsProps {
  paso: number;
  cargando: boolean;
  onRetroceder: () => void;
  onAvanzar: () => void;
}