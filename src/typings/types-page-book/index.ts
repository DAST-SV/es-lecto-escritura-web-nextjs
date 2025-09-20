// src/types/index.ts
import { layouts } from "@/src/components/components-for-books/layouts";
import  {backgrounds } from "./backgrounds"; 
import  { HtmlFontFamilies } from "./HtmlFontFamilies";
import  {borders} from "./borders"

export type LayoutType = keyof typeof layouts;
export type borderstype = keyof typeof borders;
export type HtmlFontFamiliestype = keyof typeof HtmlFontFamilies;
export type backgroundstype = keyof typeof backgrounds;


////
//Este tipo se usa para la construccion del json para visualizar el libro
////
// Tipo de cada página individual
export interface Page {
  layout: LayoutType;
  animation?: string;
  title?: string;
  text?: string;
  image?: string;
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  background?:backgroundstype  | string; 
  font?: HtmlFontFamiliestype;       
  border?: borderstype;
}

////
//Este tipo se usa para la creacion y editado de los libros
////
export interface page {
    id: string;
    layout: string;
    title?: string;
    text?: string;
    image?: string | null;         // URL para mostrar en la UI
    file?: Blob | File | null;     // Archivo real para subir
    background?: string | null;    // color o URL para mostrar
    backgroundFile?: Blob | File | null; // Archivo real del background
    font?: string;
}

export interface LibroUI {
  Json: string;
  src: string;
  caption: string;
  description?: string;
}


// Tipo del libro completo
export interface Story {
  pages: Page[];           // Array de páginas
}
