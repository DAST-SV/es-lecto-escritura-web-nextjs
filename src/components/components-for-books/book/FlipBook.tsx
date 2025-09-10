'use client'

import { useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import type { Page } from "@/src/typings/types-page-book/index";
import { PageRenderer } from "./PageRenderer";

interface Props {
  pages: Page[];
  width?: number;   // ancho de cada página
  height?: number;
}

export const FlipBook: React.FC<Props> = ({ pages, width = 500, height = 600 }) => {
  const bookRef = useRef<React.ElementRef<typeof HTMLFlipBook> | null>(null);
  const [activePage, setActivePage] = useState(0);

  if (pages.length < 2) return null;

  const flipBookProps: React.ComponentProps<typeof HTMLFlipBook> = {
    width,
    height,
    maxShadowOpacity: 0.5,
    drawShadow: true,
    showCover: true,          // ⚡ esto maneja portada sola y contraportada sola
    flippingTime: 700,
    size: "fixed",
    className: "storybook-flipbook",
    onFlip: (e: unknown) => {
      const ev = e as { data: number }; 
      setActivePage(ev.data);
    },
    onUpdate: (e: unknown) => {
      const ev = e as { data: number };
      console.log("Book updated, page:", ev.data);
    },
    startPage: 0,
    minWidth: 100,
    maxWidth: 1000,
    minHeight: 100,
    maxHeight: 1000,
    usePortrait: true,
    startZIndex: 0,
    autoSize: true,
    mobileScrollSupport: true,
    clickEventForward: true,
    useMouseEvents: true,
    swipeDistance: 10,
    showPageCorners: true,
    disableFlipByClick: false,
    style: {},
    children: pages.map((page, idx) => (
      <div className="page w-full h-full" key={idx}>
        <div className="page-inner w-full h-full box-border">
          <PageRenderer page={page} isActive={activePage === idx || activePage+1 === idx}/>
        </div>
      </div>
    )),
  };

  return (
    <div className="w-full flex justify-center items-center">
      <HTMLFlipBook {...flipBookProps} ref={bookRef} />
    </div>
  );
};

export default FlipBook;
