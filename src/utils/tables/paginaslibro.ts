export interface paginaslibro {
  idpagina: string;             // UUID
  idlibro: string;              // UUID
  layout: string;               // VARCHAR(50)
  animation?: string | null;    // VARCHAR(50) opcional
  title?: string | null;        // TEXT opcional
  text?: string | null;         // TEXT opcional
  image?: string | null;        // TEXT opcional (URL)
  audio?: string | null;        // TEXT opcional (URL)
  interactivegame?: string | null; // VARCHAR(100) opcional
  items: string[];              // TEXT[] (array de strings)
  background?: string | null;   // TEXT opcional
  font?: string | null;         // VARCHAR(50) opcional
  border?: string | null;       // VARCHAR(50) opcional
  numeropagina: number;         // SMALLINT
}
