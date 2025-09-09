// src/types/index.ts
import { layouts } from "../../app/pages/components-for-books/book/layouts";
import  {backgrounds } from "./backgrounds"; 
import  { HtmlFontFamilies } from "./HtmlFontFamilies";
import  {borders} from "./borders"

export type LayoutType = keyof typeof layouts;
export type borderstype = keyof typeof borders;
export type HtmlFontFamiliestype = keyof typeof HtmlFontFamilies;
export type backgroundstype = keyof typeof backgrounds;


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

// Tipo del libro completo
export interface Story {
  pages: Page[];           // Array de páginas
}
