import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Palette, Eraser, Download, RotateCcw, PaintBucket, X } from 'lucide-react';

interface DraggableElement {
    id: string;
    type: string;
    svg: string;
    name: string;
}

interface PreviewElement {
    id: string;
    type: string;
    svg: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
}

interface PermanentElement {
    id: string;
    type: string;
    svg: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
}

interface Imagen {
  Url?: string;
  Name?: string;
}
const PaintGame: React.FC<Imagen> = ({Url,Name}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#FF6B6B');
    const [brushSize, setBrushSize] = useState(5);
    const [currentTool, setCurrentTool] = useState<'brush' | 'eraser' | 'bucket'>('brush');
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [backgroundImageFile, setBackgroundImageFile] = useState<string | null>(null);
    const [draggedElement, setDraggedElement] = useState<DraggableElement | null>(null);
    const [previewElement, setPreviewElement] = useState<PreviewElement | null>(null);
    const [isDraggingElement, setIsDraggingElement] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [initialSize, setInitialSize] = useState(0);
    const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
    const [showHandles, setShowHandles] = useState(false);
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
    const paintingLayerRef = useRef<HTMLCanvasElement>(null);

    const colors = [
        { color: '#FF0000', name: 'Rojo' },
        { color: '#FF8000', name: 'Naranja' },
        { color: '#FFFF00', name: 'Amarillo' },
        { color: '#80FF00', name: 'Lima' },
        { color: '#00FF00', name: 'Verde' },
        { color: '#00FF80', name: 'Turquesa' },
        { color: '#00FFFF', name: 'Cian' },
        { color: '#0080FF', name: 'Azul cielo' },
        { color: '#0000FF', name: 'Azul' },
        { color: '#8000FF', name: 'Violeta' },
        { color: '#FF00FF', name: 'Magenta' },
        { color: '#FF0080', name: 'Rosa' },
        { color: '#8B4513', name: 'Café' },
        { color: '#000000', name: 'Negro' },
        { color: '#808080', name: 'Gris' },
        { color: '#FFFFFF', name: 'Blanco' },
    ];

    const draggableElements: DraggableElement[] = [
        {
            id: '1',
            type: 'tree',
            name: 'Árbol',
            svg: `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="46" y="85" width="8" height="35" fill="none" stroke="black" stroke-width="2"/>
        <path d="M30,70 Q35,50 40,60 Q45,45 50,55 Q55,40 60,50 Q65,45 70,65 Q65,80 60,75 Q55,85 50,80 Q45,90 40,85 Q35,80 30,70" fill="none" stroke="black" stroke-width="2"/>
        <path d="M25,75 Q30,60 35,70 Q40,55 45,65 Q50,50 55,60 Q60,55 65,70 Q60,85 55,80 Q50,90 45,85 Q40,85 35,80 Q30,85 25,75" fill="none" stroke="black" stroke-width="2"/>
      </svg>`
        },
        {
            id: '2',
            type: 'sun',
            name: 'Sol',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="18" fill="none" stroke="black" stroke-width="2"/>
        <line x1="50" y1="12" x2="50" y2="22" stroke="black" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="78" x2="50" y2="88" stroke="black" stroke-width="3" stroke-linecap="round"/>
        <line x1="12" y1="50" x2="22" y2="50" stroke="black" stroke-width="3" stroke-linecap="round"/>
        <line x1="78" y1="50" x2="88" y2="50" stroke="black" stroke-width="3" stroke-linecap="round"/>
        <line x1="23.5" y1="23.5" x2="30.5" y2="30.5" stroke="black" stroke-width="3" stroke-linecap="round"/>
        <line x1="69.5" y1="69.5" x2="76.5" y2="76.5" stroke="black" stroke-width="3" stroke-linecap="round"/>
        <line x1="76.5" y1="23.5" x2="69.5" y2="30.5" stroke="black" stroke-width="3" stroke-linecap="round"/>
        <line x1="30.5" y1="69.5" x2="23.5" y2="76.5" stroke="black" stroke-width="3" stroke-linecap="round"/>
        <circle cx="45" cy="45" r="2" fill="black"/>
        <circle cx="55" cy="45" r="2" fill="black"/>
        <path d="M42 55 Q50 62 58 55" stroke="black" stroke-width="2" fill="none"/>
      </svg>`
        },
        {
            id: '3',
            type: 'cloud',
            name: 'Nube',
            svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M25,45 Q15,35 25,25 Q35,15 50,20 Q65,10 80,20 Q95,15 100,30 Q105,45 95,45 Z" fill="none" stroke="black" stroke-width="2"/>
      </svg>`
        },
        {
            id: '4',
            type: 'flower',
            name: 'Flor',
            svg: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="40" y1="55" x2="40" y2="90" stroke="black" stroke-width="3"/>
        <circle cx="40" cy="35" r="6" fill="none" stroke="black" stroke-width="2"/>
        <ellipse cx="40" cy="20" rx="8" ry="15" fill="none" stroke="black" stroke-width="2"/>
        <ellipse cx="40" cy="50" rx="8" ry="15" fill="none" stroke="black" stroke-width="2"/>
        <ellipse cx="25" cy="35" rx="15" ry="8" fill="none" stroke="black" stroke-width="2"/>
        <ellipse cx="55" cy="35" rx="15" ry="8" fill="none" stroke="black" stroke-width="2"/>
        <ellipse cx="28" cy="22" rx="10" ry="6" fill="none" stroke="black" stroke-width="2" transform="rotate(-45 28 22)"/>
        <ellipse cx="52" cy="22" rx="10" ry="6" fill="none" stroke="black" stroke-width="2" transform="rotate(45 52 22)"/>
        <ellipse cx="28" cy="48" rx="10" ry="6" fill="none" stroke="black" stroke-width="2" transform="rotate(45 28 48)"/>
        <ellipse cx="52" cy="48" rx="10" ry="6" fill="none" stroke="black" stroke-width="2" transform="rotate(-45 52 48)"/>
        <path d="M35 75 Q30 70 25 75 Q30 80 35 75" fill="none" stroke="black" stroke-width="2"/>
        <path d="M45 75 Q50 70 55 75 Q50 80 45 75" fill="none" stroke="black" stroke-width="2"/>
      </svg>`
        },
        {
            id: '5',
            type: 'house',
            name: 'Casa',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="45" width="60" height="50" fill="none" stroke="black" stroke-width="2"/>
        <polygon points="15,50 50,20 85,50" fill="none" stroke="black" stroke-width="2"/>
        <rect x="35" y="70" width="15" height="25" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="46" cy="82" r="1.5" fill="black"/>
        <rect x="60" y="55" width="12" height="12" fill="none" stroke="black" stroke-width="2"/>
        <line x1="60" y1="61" x2="72" y2="61" stroke="black" stroke-width="1"/>
        <line x1="66" y1="55" x2="66" y2="67" stroke="black" stroke-width="1"/>
        <rect x="55" y="25" width="8" height="15" fill="none" stroke="black" stroke-width="2"/>
        <line x1="57" y1="28" x2="61" y2="28" stroke="black" stroke-width="2"/>
      </svg>`
        },
        {
            id: '6',
            type: 'car',
            name: 'Carro',
            svg: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="30" width="90" height="20" rx="8" fill="none" stroke="black" stroke-width="2"/>
        <path d="M25,30 Q30,15 45,15 L75,15 Q90,15 95,30" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="35" cy="50" r="8" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="85" cy="50" r="8" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="35" cy="50" r="4" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="85" cy="50" r="4" fill="none" stroke="black" stroke-width="2"/>
        <rect x="45" y="20" width="12" height="10" fill="none" stroke="black" stroke-width="2"/>
        <rect x="63" y="20" width="12" height="10" fill="none" stroke="black" stroke-width="2"/>
        <rect x="20" y="35" width="8" height="8" rx="2" fill="none" stroke="black" stroke-width="2"/>
        <rect x="92" y="35" width="8" height="8" rx="2" fill="none" stroke="black" stroke-width="2"/>
      </svg>`
        },
        {
            id: '7',
            type: 'butterfly',
            name: 'Mariposa',
            svg: `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="40" cy="30" rx="2" ry="25" fill="none" stroke="black" stroke-width="2"/>
        <path d="M25,20 Q15,10 20,25 Q15,35 25,40 Q35,35 35,25 Q30,15 25,20" fill="none" stroke="black" stroke-width="2"/>
        <path d="M55,20 Q65,10 60,25 Q65,35 55,40 Q45,35 45,25 Q50,15 55,20" fill="none" stroke="black" stroke-width="2"/>
        <ellipse cx="22" cy="25" rx="3" ry="5" fill="none" stroke="black" stroke-width="1"/>
        <ellipse cx="58" cy="25" rx="3" ry="5" fill="none" stroke="black" stroke-width="1"/>
        <circle cx="20" cy="22" r="2" fill="none" stroke="black" stroke-width="1"/>
        <circle cx="60" cy="22" r="2" fill="none" stroke="black" stroke-width="1"/>
        <line x1="40" y1="8" x2="36" y2="3" stroke="black" stroke-width="2" stroke-linecap="round"/>
        <line x1="40" y1="8" x2="44" y2="3" stroke="black" stroke-width="2" stroke-linecap="round"/>
        <circle cx="36" cy="3" r="1" fill="black"/>
        <circle cx="44" cy="3" r="1" fill="black"/>
      </svg>`
        },
        {
            id: '8',
            type: 'star',
            name: 'Estrella',
            svg: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,8 35,22 50,22 38,32 42,47 30,39 18,47 22,32 10,22 25,22" fill="none" stroke="black" stroke-width="2"/>
        <polygon points="30,15 32,20 37,20 33,23 34,28 30,26 26,28 27,23 23,20 28,20" fill="none" stroke="black" stroke-width="1"/>
      </svg>`
        },
        {
            id: '9',
            type: 'heart',
            name: 'Corazón',
            svg: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M30,50 C25,40 10,30 15,20 C20,10 30,15 30,25 C30,15 40,10 45,20 C50,30 35,40 30,50Z" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="22" cy="22" r="3" fill="none" stroke="black" stroke-width="1"/>
        <circle cx="38" cy="22" r="3" fill="none" stroke="black" stroke-width="1"/>
      </svg>`
        }
    ];

    const isBlackBorder = (x: number, y: number): boolean => {
        const canvas = canvasRef.current;
        if (!canvas) return false;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        
        // Verificar si las coordenadas están dentro del canvas
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return false;
        
        const imageData = ctx.getImageData(x, y, 1, 1);
        const [r, g, b, a] = imageData.data;
        
        // Si es transparente, no es un contorno negro
        if (a === 0) return false;
        
        // Detectar si es negro muy oscuro (threshold más restrictivo)
        const threshold = 30;
        return r < threshold && g < threshold && b < threshold && a > 200;
    };

    const floodFill = (startX: number, startY: number, fillColor: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const targetColor = getPixelColor(data, startX, startY, canvas.width);
        const fillColorRgb = hexToRgb(fillColor);

        if (!fillColorRgb || colorsMatch(targetColor, fillColorRgb)) return;

        const pixelsToCheck = [startX, startY];
        const imageWidth = canvas.width;
        const imageHeight = canvas.height;
        const visited = new Set<string>();

        while (pixelsToCheck.length > 0) {
            const y = pixelsToCheck.pop()!;
            const x = pixelsToCheck.pop()!;

            if (x < 0 || x >= imageWidth || y < 0 || y >= imageHeight) continue;

            const key = `${x},${y}`;
            if (visited.has(key)) continue;
            visited.add(key);

            const currentColor = getPixelColor(data, x, y, imageWidth);
            if (!colorsMatch(currentColor, targetColor)) continue;

            setPixelColor(data, x, y, fillColorRgb, imageWidth);

            pixelsToCheck.push(x + 1, y);
            pixelsToCheck.push(x - 1, y);
            pixelsToCheck.push(x, y + 1);
            pixelsToCheck.push(x, y - 1);
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const getPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number) => {
        const index = (y * width + x) * 4;
        return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    };

    const setPixelColor = (data: Uint8ClampedArray, x: number, y: number, color: number[], width: number) => {
        const index = (y * width + x) * 4;
        data[index] = color[0];
        data[index + 1] = color[1];
        data[index + 2] = color[2];
        data[index + 3] = 255;
    };

    const colorsMatch = (color1: number[], color2: number[]) => {
        return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2] && color1[3] === color2[3];
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.floor(e.clientX - rect.left),
            y: Math.floor(e.clientY - rect.top)
        };
    };

    const getResizeHandle = (x: number, y: number, element: PreviewElement): string | null => {
        if (!showHandles) return null;

        const handleSize = 8;
        const halfSize = element.size / 2;

        const handles = {
            'nw': { x: element.x - halfSize, y: element.y - halfSize },
            'ne': { x: element.x + halfSize, y: element.y - halfSize },
            'sw': { x: element.x - halfSize, y: element.y + halfSize },
            'se': { x: element.x + halfSize, y: element.y + halfSize },
            'rotate': { x: element.x + halfSize + 15, y: element.y - halfSize - 15 }
        };

        for (const [handle, pos] of Object.entries(handles)) {
            if (
                x >= pos.x - handleSize / 2 &&
                x <= pos.x + handleSize / 2 &&
                y >= pos.y - handleSize / 2 &&
                y <= pos.y + handleSize / 2
            ) {
                return handle;
            }
        }

        return null;
    };

    const drawOnCanvas = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getMousePos(e);

        if (currentTool === 'bucket') {
            // Solo verificar contornos negros para el balde
            if (isBlackBorder(x, y)) {
                return;
            }
            floodFill(x, y, currentColor);
            return;
        }

        // Para pincel, solo verificar contornos en áreas específicas
        if (currentTool === 'brush' && isBlackBorder(x, y)) {
            return;
        }

        if (currentTool === 'brush') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = currentColor;
        } else if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        }

        if (isDrawing && lastPos) {
            // Dibujar línea suave desde la última posición
            ctx.lineWidth = brushSize * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (currentTool === 'brush') {
                ctx.strokeStyle = currentColor;
            }

            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        // Dibujar círculo en la posición actual
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();

        setLastPos({ x, y });
    }, [currentColor, brushSize, currentTool, isDrawing, lastPos]);

    const drawSVGSync = async (ctx: CanvasRenderingContext2D, element: PreviewElement | PermanentElement): Promise<void> => {
        return new Promise((resolve) => {
            const svgBlob = new Blob([element.svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();

            img.onload = () => {
                ctx.save();
                ctx.translate(element.x, element.y);
                ctx.rotate(element.rotation);
                ctx.drawImage(img, -element.size / 2, -element.size / 2, element.size, element.size);
                ctx.restore();

                URL.revokeObjectURL(url);
                resolve();
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve();
            };

            img.src = url;
        });
    };

    const drawSelectionHandles = (ctx: CanvasRenderingContext2D, element: PreviewElement) => {
        if (!showHandles) return;

        const handleSize = 8;
        const halfSize = element.size / 2;

        ctx.strokeStyle = '#0066FF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        ctx.strokeRect(element.x - halfSize, element.y - halfSize, element.size, element.size);

        const corners = [
            { x: element.x - halfSize, y: element.y - halfSize },
            { x: element.x + halfSize, y: element.y - halfSize },
            { x: element.x - halfSize, y: element.y + halfSize },
            { x: element.x + halfSize, y: element.y + halfSize }
        ];

        corners.forEach(corner => {
            ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
        });

        const rotateX = element.x + halfSize + 15;
        const rotateY = element.y - halfSize - 15;
        ctx.beginPath();
        ctx.arc(rotateX, rotateY, handleSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rotateX, rotateY, 3, 0, 1.5 * Math.PI);
        ctx.moveTo(rotateX + 2, rotateY - 3);
        ctx.lineTo(rotateX + 4, rotateY - 1);
        ctx.lineTo(rotateX + 2, rotateY + 1);
        ctx.stroke();
    };

    const redrawMainCanvas = async () => {
    const canvas = canvasRef.current;
    const paintingLayer = paintingLayerRef.current;
    if (!canvas || !paintingLayer) return;
    const ctp = paintingLayer.getContext('2d');
    const ctx = canvas.getContext('2d');
    if (!ctx || !ctp) return;

    // Limpiar canvas principal y pintar fondo
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundImage) ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Limpiar capa de pintura
    ctp.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar elementos permanentes
    // for (const element of permanentElements) {
    //     await drawSVGSync(ctp, element);
    // }

    // Dibujar elemento de preview
    if (previewElement) {
        await drawSVGSync(ctp, previewElement);
        if (showHandles) drawSelectionHandles(ctp, previewElement);
    }
};

    const redrawCanvas = redrawMainCanvas;

    const confirmElement = async () => {
        if (previewElement) {
          const canvas = canvasRef.current;
 
          if (!canvas) return;

          const ctx = canvas.getContext('2d');

         if (!ctx) return;

          await drawSVGSync(ctx, previewElement);
 
            setPreviewElement(null);
            setShowHandles(false);
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getMousePos(e);

        if (previewElement && showHandles) {
            const handle = getResizeHandle(x, y, previewElement);
            if (handle) {
                if (handle === 'rotate') {
                    const updatedElement = { ...previewElement, rotation: previewElement.rotation + Math.PI / 4 };
                    setPreviewElement(updatedElement);
                    return;
                } else {
                    setIsResizing(true);
                    setResizeHandle(handle);
                    setInitialSize(previewElement.size);
                    setInitialMousePos({ x, y });
                    return;
                }
            }

            const halfSize = previewElement.size / 2;
            if (
                x >= previewElement.x - halfSize &&
                x <= previewElement.x + halfSize &&
                y >= previewElement.y - halfSize &&
                y <= previewElement.y + halfSize
            ) {
                setIsDraggingElement(true);
                setDragOffset({
                    x: x - previewElement.x,
                    y: y - previewElement.y
                });
                return;
            }

            confirmElement();
            return;
        }

        if (previewElement && !showHandles) {
            const halfSize = previewElement.size / 2;
            if (
                x >= previewElement.x - halfSize &&
                x <= previewElement.x + halfSize &&
                y >= previewElement.y - halfSize &&
                y <= previewElement.y + halfSize
            ) {
                setShowHandles(true);
                return;
            }
            confirmElement();
            return;
        }

        if (currentTool === 'bucket') {
            drawOnCanvas(e);
            return;
        }

        setIsDrawing(true);
        setLastPos({ x, y });
        drawOnCanvas(e);
    };

    const continueDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getMousePos(e);

        if (isResizing && previewElement && resizeHandle) {
            const deltaX = x - initialMousePos.x;
            const deltaY = y - initialMousePos.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const factor = resizeHandle === 'nw' || resizeHandle === 'sw' ? -1 : 1;
            const newSize = Math.max(20, Math.min(400, initialSize + (distance * factor * 1.0)));

            const updatedElement = { ...previewElement, size: newSize };
            setPreviewElement(updatedElement);
            return;
        }

        if (isDraggingElement && previewElement && !isResizing) {
            const updatedElement = {
                ...previewElement,
                x: x - dragOffset.x,
                y: y - dragOffset.y
            };
            setPreviewElement(updatedElement);
            return;
        }

        if (!isDrawing || currentTool === 'bucket') return;
        drawOnCanvas(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setIsDraggingElement(false);
        setIsResizing(false);
        setResizeHandle(null);
        setLastPos(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setBackgroundImage(img);
                setBackgroundImageFile(file.name);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleImageFromUrl = (url: string, name: string) => {
        const img = new Image();
        img.onload = () => {
            setBackgroundImage(img);
            setBackgroundImageFile(name);
        };
        img.src = url;
    };

    const removeBackgroundImage = () => {
        setBackgroundImage(null);
        setBackgroundImageFile(null);
        // Limpiar el input file para permitir resubir la misma imagen
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Redibujar el canvas con fondo blanco
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const paintingLayer = paintingLayerRef.current;
        if (!canvas || !paintingLayer) return;

        setBackgroundImage(null);
        setBackgroundImageFile(null);
        setPreviewElement(null);
        setShowHandles(false);

        const ctx = canvas.getContext('2d');
        const paintCtx = paintingLayer.getContext('2d');

        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (paintCtx) {
            paintCtx.clearRect(0, 0, paintingLayer.width, paintingLayer.height);
        }
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (previewElement) {
            confirmElement();
        }

        const link = document.createElement('a');
        link.download = 'mi-dibujo.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const handleDragStart = (element: DraggableElement) => {
        setDraggedElement(element);
    };

   const handleCanvasDrop = async (e: React.DragEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!draggedElement) return;

        const canvas = canvasRef.current;
        const paintingLayer = paintingLayerRef.current;

        if (!canvas || !paintingLayer) return;

        const ctp = paintingLayer.getContext('2d');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;
        if (!ctp) return;

        if (previewElement) {
            confirmElement();
        }

        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newElement: PreviewElement = {
            id: `${draggedElement.id}-${Date.now()}`,
            type: draggedElement.type,
            svg: draggedElement.svg,
            x,
            y,
            size: 80,
            rotation: 0
        };

        await drawSVGSync(ctp, newElement);
        setPreviewElement(newElement);
        setShowHandles(false);
        setDraggedElement(null);
    };

    const handleCanvasDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
        e.preventDefault();
    };

    const handleToolChange = (tool: 'brush' | 'eraser' | 'bucket') => {
        setCurrentTool(tool);

        if (previewElement) {
            confirmElement();
        }
    };

    useEffect(() => {
        redrawCanvas();
    }, [backgroundImage, previewElement, showHandles]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const paintingLayer = paintingLayerRef.current;

        if (canvas && paintingLayer) {
            canvas.width = 800;
            canvas.height = 600;
            paintingLayer.width = 800;
            paintingLayer.height = 600;

            const ctx = canvas.getContext('2d');
            const paintCtx = paintingLayer.getContext('2d');

            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            if (paintCtx) {
                paintCtx.clearRect(0, 0, paintingLayer.width, paintingLayer.height);
            }
        }

        if(Url && Name)
        handleImageFromUrl(Url,Name);

    }, []);

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-100 to-pink-100">
            {/* Sidebar */}
            <div className="w-72 bg-white shadow-lg p-4 overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">🎨 Mi Paleta Mágica</h2>

                {/* Image Upload */}
                <div className="mb-6">
                    <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                        <Upload size={20} className="mr-2 text-purple-600" />
                        <span className="text-sm text-purple-700">Subir imagen de fondo</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>

                    {backgroundImageFile && (
                        <div className="mt-2 p-2 bg-purple-50 rounded-lg flex items-center justify-between">
                            <span className="text-xs text-purple-800 truncate">{backgroundImageFile}</span>
                            <button
                                onClick={removeBackgroundImage}
                                className="ml-2 text-red-500 hover:text-red-700"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Tools */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-gray-700">🛠️ Herramientas</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button
                            onClick={() => handleToolChange('brush')}
                            className={`p-3 rounded-lg border-2 transition-all ${currentTool === 'brush'
                                    ? 'bg-blue-500 text-white border-blue-500 transform scale-105'
                                    : 'bg-white hover:bg-blue-50 border-blue-300'
                                }`}
                            title="Pincel"
                        >
                            <Palette size={24} className="mx-auto" />
                            <div className="text-xs mt-1">Pincel</div>
                        </button>
                        <button
                            onClick={() => handleToolChange('eraser')}
                            className={`p-3 rounded-lg border-2 transition-all ${currentTool === 'eraser'
                                    ? 'bg-pink-500 text-white border-pink-500 transform scale-105'
                                    : 'bg-white hover:bg-pink-50 border-pink-300'
                                }`}
                            title="Borrador"
                        >
                            <Eraser size={24} className="mx-auto" />
                            <div className="text-xs mt-1">Borrador</div>
                        </button>
                        <button
                            onClick={() => handleToolChange('bucket')}
                            className={`p-3 rounded-lg border-2 transition-all ${currentTool === 'bucket'
                                    ? 'bg-green-500 text-white border-green-500 transform scale-105'
                                    : 'bg-white hover:bg-green-50 border-green-300'
                                }`}
                            title="Balde de pintura"
                        >
                            <PaintBucket size={24} className="mx-auto" />
                            <div className="text-xs mt-1">Balde</div>
                        </button>
                    </div>

                    {/* Brush Size */}
                    {currentTool !== 'bucket' && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-700 font-medium">
                                Tamaño del {currentTool === 'brush' ? 'pincel' : 'borrador'}: {brushSize}px
                            </label>
                            <input
                                type="range"
                                min="2"
                                max="30"
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="w-full mt-2 accent-purple-500"
                            />
                        </div>
                    )}
                </div>

                {/* Beautiful Artist Palette */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-gray-700">🎨 Paleta de Pintor</h3>
                    <div className="relative">
                        {/* Paleta en forma de pintor real */}
                        <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 shadow-lg border-4 border-gray-300 relative"
                            style={{
                                width: '220px',
                                height: '160px',
                                borderRadius: '45% 20% 45% 20%',
                                transform: 'rotate(-15deg)'
                            }}>

                            {/* Agujero del pulgar */}
                            <div className="absolute bg-white border-4 border-gray-400 rounded-full shadow-inner"
                                style={{
                                    width: '35px',
                                    height: '35px',
                                    top: '60px',
                                    right: '25px',
                                    transform: 'rotate(15deg)'
                                }}>
                            </div>

                            {/* Colores distribuidos como en una paleta real */}
                            <div className="absolute inset-0" style={{ transform: 'rotate(15deg)' }}>
                                {colors.map((colorInfo, index) => {
                                    // Distribución orgánica de colores en la paleta
                                    const positions = [
                                        { x: '25%', y: '20%' }, { x: '45%', y: '15%' }, { x: '65%', y: '20%' }, { x: '80%', y: '35%' },
                                        { x: '20%', y: '40%' }, { x: '40%', y: '35%' }, { x: '60%', y: '40%' }, { x: '75%', y: '55%' },
                                        { x: '15%', y: '60%' }, { x: '35%', y: '60%' }, { x: '55%', y: '65%' }, { x: '70%', y: '75%' },
                                        { x: '25%', y: '80%' }, { x: '45%', y: '85%' }, { x: '10%', y: '25%' }, { x: '85%', y: '20%' }
                                    ];

                                    const position = positions[index] || { x: '50%', y: '50%' };

                                    return (
                                        <button
                                            key={colorInfo.color}
                                            onClick={() => setCurrentColor(colorInfo.color)}
                                            className={`absolute w-6 h-6 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg hover:scale-125 transition-all duration-200 ${currentColor === colorInfo.color
                                                    ? 'border-gray-800 ring-3 ring-blue-400 z-10'
                                                    : 'border-gray-400 hover:border-gray-600'
                                                }`}
                                            style={{
                                                backgroundColor: colorInfo.color,
                                                left: position.x,
                                                top: position.y
                                            }}
                                            title={colorInfo.name}
                                        >
                                            {currentColor === colorInfo.color && (
                                                <div className="absolute inset-0 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Pincel decorativo */}
                            <div className="absolute" style={{ bottom: '-10px', right: '40px', transform: 'rotate(45deg)' }}>
                                <div className="w-16 h-2 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full shadow-md"></div>
                                <div className="w-8 h-3 bg-gradient-to-r from-gray-600 to-gray-400 rounded-sm mt-1 ml-4 shadow-sm"></div>
                                <div className="w-3 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-sm mt-1 ml-6 shadow-sm"></div>
                            </div>
                        </div>

                        {/* Color actual seleccionado */}
                        <div className="mt-4 text-center">
                            <div className="inline-block p-1 bg-white rounded-lg shadow-md">
                                <div
                                    className="w-12 h-12 rounded-lg border-3 border-gray-300 shadow-inner"
                                    style={{ backgroundColor: currentColor }}
                                />
                            </div>
                            <p className="text-xs text-gray-600 mt-2 font-medium">Color Actual</p>
                            <p className="text-xs text-gray-500">{currentColor}</p>
                        </div>

                        {/* Color picker para colores personalizados */}
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg shadow-inner">
                            <label className="text-xs text-gray-600 block mb-1">🌈 Color personalizado:</label>
                            <input
                                type="color"
                                value={currentColor}
                                onChange={(e) => setCurrentColor(e.target.value)}
                                className="w-full h-8 rounded border-2 border-gray-300 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Draggable Elements */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-gray-700">🎭 Formas para Colorear</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {draggableElements.map((element) => (
                            <div
                                key={element.id}
                                draggable
                                onDragStart={() => handleDragStart(element)}
                                className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg cursor-move hover:scale-105 transition-transform text-center border-2 border-yellow-300 hover:border-orange-400"
                                title={`Arrastra ${element.name} al lienzo`}
                            >
                                <div
                                    dangerouslySetInnerHTML={{ __html: element.svg }}
                                    className="w-12 h-12 mx-auto"
                                />
                                <div className="text-xs text-gray-700 mt-1 font-medium">{element.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {previewElement && (
                        <button
                            onClick={confirmElement}
                            className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center font-semibold"
                        >
                            ✅ Confirmar Elemento
                        </button>
                    )}
                    <button
                        onClick={clearCanvas}
                        className="w-full p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center font-semibold"
                    >
                        <RotateCcw size={18} className="mr-2" />
                        Limpiar Todo
                    </button>
                    <button
                        onClick={downloadCanvas}
                        className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center font-semibold"
                    >
                        <Download size={18} className="mr-2" />
                        Descargar Arte
                    </button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white rounded-xl shadow-2xl p-6 relative">
                    <h1 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        🌟 ¡Crea tu obra de arte! 🌟
                    </h1>
                    <div className="relative">
                        <canvas
                        ref={paintingLayerRef}
                       className="absolute top-0 left-0 z-10"
                        onDrop={handleCanvasDrop}
                        onDragOver={handleCanvasDragOver}
                                                    onMouseDown={startDrawing}
                            onMouseMove={continueDrawing}
                            onMouseUp={stopDrawing}
                         style={{ maxWidth: '100%', maxHeight: '600px', zIndex: 3 }}
                        />

                        {/* Canvas principal visible */}
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={continueDrawing}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className={`border-4 border-purple-300 rounded-lg bg-white shadow-lg relative ${currentTool === 'bucket' ? 'cursor-pointer' :
                                    previewElement ? 'cursor-move' : 'cursor-crosshair'
                                }`}
                            style={{ maxWidth: '100%', maxHeight: '600px', zIndex: 2 }}
                        />
                    </div>
                    <div className="text-center text-gray-600 mt-4 text-sm bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                        {currentTool === 'bucket'
                            ? '🪣 Haz clic para llenar áreas con color'
                            : previewElement && !showHandles
                                ? '👆 Haz clic en el elemento para seleccionarlo y editarlo'
                                : previewElement && showHandles
                                    ? '✨ Elemento seleccionado: mueve, redimensiona o rota. Haz clic fuera para confirmar'
                                    : '🖌️ Pinta con el pincel o arrastra elementos desde la barra lateral'
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaintGame;