'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';

// Tipo para representar una pieza del puzzle con formas irregulares
interface PuzzlePiece {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  correctX: number;
  correctY: number;
  width: number;
  height: number;
  tabs: {
    top: number; // -1: entrante (hueco), 0: recto (borde), 1: saliente (protuberancia)
    right: number;
    bottom: number;
    left: number;
  };
  isDragging: boolean;
  isPlaced: boolean;
}

interface RealJigsawPuzzleProps {
  Url: string;
}

const RealJigsawPuzzle: React.FC<RealJigsawPuzzleProps> = ({ Url }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [_imageUrl, setImageUrl] = useState<string>('');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  const [puzzleSize, setPuzzleSize] = useState({ width: 800, height: 800 });
  const [isMobile, setIsMobile] = useState(false);

  // Detectar dispositivo móvil y ajustar tamaños
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (mobile) {
        // Ajustar tamaños para móvil - canvas y puzzle del mismo tamaño
        const containerWidth = Math.min(window.innerWidth - 40, 400);
        
        setCanvasSize({
          width: containerWidth,
          height: containerWidth
        });
        setPuzzleSize({
          width: containerWidth,
          height: containerWidth
        });
      } else {
        // Tamaños para escritorio - canvas y puzzle del mismo tamaño
        setCanvasSize({ width: 800, height: 800 });
        setPuzzleSize({ width: 800, height: 800 });
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generar forma irregular de pieza de puzzle REAL con curvas Bézier
  const generateRealPiecePath = (
    piece: PuzzlePiece,
    pieceWidth: number,
    pieceHeight: number
  ) => {
    const tabSize = Math.min(pieceWidth, pieceHeight) * 0.25;
    const curveStrength = tabSize * 0.7;

    return (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);

      // ============ LADO SUPERIOR ============
      if (piece.tabs.top === 0) {
        ctx.lineTo(pieceWidth, 0);
      } else {
        const midX = pieceWidth / 2;
        const tabWidth = tabSize;
        ctx.lineTo(midX - tabWidth, 0);

        if (piece.tabs.top === 1) {
          ctx.bezierCurveTo(
            midX - tabWidth, -curveStrength,
            midX - tabWidth / 2, -tabSize,
            midX, -tabSize
          );
          ctx.bezierCurveTo(
            midX + tabWidth / 2, -tabSize,
            midX + tabWidth, -curveStrength,
            midX + tabWidth, 0
          );
        } else {
          ctx.bezierCurveTo(
            midX - tabWidth, curveStrength,
            midX - tabWidth / 2, tabSize,
            midX, tabSize
          );
          ctx.bezierCurveTo(
            midX + tabWidth / 2, tabSize,
            midX + tabWidth, curveStrength,
            midX + tabWidth, 0
          );
        }
        ctx.lineTo(pieceWidth, 0);
      }

      // ============ LADO DERECHO ============
      if (piece.tabs.right === 0) {
        ctx.lineTo(pieceWidth, pieceHeight);
      } else {
        const midY = pieceHeight / 2;
        const tabHeight = tabSize;
        ctx.lineTo(pieceWidth, midY - tabHeight);

        if (piece.tabs.right === 1) {
          ctx.bezierCurveTo(
            pieceWidth + curveStrength, midY - tabHeight,
            pieceWidth + tabSize, midY - tabHeight / 2,
            pieceWidth + tabSize, midY
          );
          ctx.bezierCurveTo(
            pieceWidth + tabSize, midY + tabHeight / 2,
            pieceWidth + curveStrength, midY + tabHeight,
            pieceWidth, midY + tabHeight
          );
        } else {
          ctx.bezierCurveTo(
            pieceWidth - curveStrength, midY - tabHeight,
            pieceWidth - tabSize, midY - tabHeight / 2,
            pieceWidth - tabSize, midY
          );
          ctx.bezierCurveTo(
            pieceWidth - tabSize, midY + tabHeight / 2,
            pieceWidth - curveStrength, midY + tabHeight,
            pieceWidth, midY + tabHeight
          );
        }
        ctx.lineTo(pieceWidth, pieceHeight);
      }

      // ============ LADO INFERIOR ============
      if (piece.tabs.bottom === 0) {
        ctx.lineTo(0, pieceHeight);
      } else {
        const midX = pieceWidth / 2;
        const tabWidth = tabSize;
        ctx.lineTo(midX + tabWidth, pieceHeight);

        if (piece.tabs.bottom === 1) {
          ctx.bezierCurveTo(
            midX + tabWidth, pieceHeight + curveStrength,
            midX + tabWidth / 2, pieceHeight + tabSize,
            midX, pieceHeight + tabSize
          );
          ctx.bezierCurveTo(
            midX - tabWidth / 2, pieceHeight + tabSize,
            midX - tabWidth, pieceHeight + curveStrength,
            midX - tabWidth, pieceHeight
          );
        } else {
          ctx.bezierCurveTo(
            midX + tabWidth, pieceHeight - curveStrength,
            midX + tabWidth / 2, pieceHeight - tabSize,
            midX, pieceHeight - tabSize
          );
          ctx.bezierCurveTo(
            midX - tabWidth / 2, pieceHeight - tabSize,
            midX - tabWidth, pieceHeight - curveStrength,
            midX - tabWidth, pieceHeight
          );
        }
        ctx.lineTo(0, pieceHeight);
      }

      // ============ LADO IZQUIERDO ============
      if (piece.tabs.left === 0) {
        ctx.lineTo(0, 0);
      } else {
        const midY = pieceHeight / 2;
        const tabHeight = tabSize;
        ctx.lineTo(0, midY + tabHeight);

        if (piece.tabs.left === 1) {
          ctx.bezierCurveTo(
            -curveStrength, midY + tabHeight,
            -tabSize, midY + tabHeight / 2,
            -tabSize, midY
          );
          ctx.bezierCurveTo(
            -tabSize, midY - tabHeight / 2,
            -curveStrength, midY - tabHeight,
            0, midY - tabHeight
          );
        } else {
          ctx.bezierCurveTo(
            curveStrength, midY + tabHeight,
            tabSize, midY + tabHeight / 2,
            tabSize, midY
          );
          ctx.bezierCurveTo(
            tabSize, midY - tabHeight / 2,
            curveStrength, midY - tabHeight,
            0, midY - tabHeight
          );
        }
        ctx.lineTo(0, 0);
      }
      ctx.closePath();
    };
  };

  // Calcular los bounds expandidos de una pieza (incluyendo protuberancias)
  const getExpandedBounds = (
    piece: PuzzlePiece,
    pieceWidth: number,
    pieceHeight: number
  ) => {
    const tabSize = Math.min(pieceWidth, pieceHeight) * 0.25;
    return {
      offsetX: piece.tabs.left === 1 ? tabSize : 0,
      offsetY: piece.tabs.top === 1 ? tabSize : 0,
      expandedWidth:
        pieceWidth +
        (piece.tabs.left === 1 ? tabSize : 0) +
        (piece.tabs.right === 1 ? tabSize : 0),
      expandedHeight:
        pieceHeight +
        (piece.tabs.top === 1 ? tabSize : 0) +
        (piece.tabs.bottom === 1 ? tabSize : 0),
    };
  };

  // Generar piezas con formas que encajan perfectamente
  const generatePieces = useCallback(() => {
    if (!image) return;

    const canvas = canvasRef.current!;
    const pieceWidth = puzzleSize.width / cols;
    const pieceHeight = puzzleSize.height / rows;
    const newPieces: PuzzlePiece[] = [];

    // Crear matriz de tabs para asegurar que las piezas encajen perfectamente
    const tabMatrix: number[][][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null).map(() => [0, 0, 0, 0]));

    // Generar tabs asegurando compatibilidad entre piezas adyacentes
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 0) {
          tabMatrix[r][c][0] = 0;
        } else {
          tabMatrix[r][c][0] = -tabMatrix[r - 1][c][2];
        }

        if (c === cols - 1) {
          tabMatrix[r][c][1] = 0;
        } else {
          tabMatrix[r][c][1] = Math.random() > 0.5 ? 1 : -1;
        }

        if (r === rows - 1) {
          tabMatrix[r][c][2] = 0;
        } else {
          tabMatrix[r][c][2] = Math.random() > 0.5 ? 1 : -1;
        }

        if (c === 0) {
          tabMatrix[r][c][3] = 0;
        } else {
          tabMatrix[r][c][3] = -tabMatrix[r][c - 1][1];
        }
      }
    }

    // Crear las piezas con las formas calculadas
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const correctX = c * pieceWidth;
        const correctY = r * pieceHeight;

        // Posición inicial aleatoria dentro del área del puzzle (mezcladas)
        const margin = pieceWidth * 0.1;
        const maxX = puzzleSize.width - pieceWidth - margin;
        const maxY = puzzleSize.height - pieceHeight - margin;

        newPieces.push({
          id: r * cols + c,
          row: r,
          col: c,
          x: margin + Math.random() * maxX,
          y: margin + Math.random() * maxY,
          correctX,
          correctY,
          width: pieceWidth,
          height: pieceHeight,
          tabs: {
            top: tabMatrix[r][c][0],
            right: tabMatrix[r][c][1],
            bottom: tabMatrix[r][c][2],
            left: tabMatrix[r][c][3],
          },
          isDragging: false,
          isPlaced: false,
        });
      }
    }

    setPieces(newPieces);
    setIsCompleted(false);
  }, [image, rows, cols, puzzleSize, canvasSize, isMobile]);

  // Dibujar el puzzle con formas irregulares realistas
  const drawPuzzle = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo sutil para el área del puzzle
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, puzzleSize.width, puzzleSize.height);

    // Dibujar cada pieza con su forma irregular
    pieces.forEach((piece) => {
      ctx.save();
      const tabSize = Math.min(piece.width, piece.height) * 0.25;
      const bounds = getExpandedBounds(piece, piece.width, piece.height);

      ctx.translate(piece.x - bounds.offsetX, piece.y - bounds.offsetY);
      ctx.translate(bounds.offsetX, bounds.offsetY);
      const drawPath = generateRealPiecePath(piece, piece.width, piece.height);
      drawPath(ctx);
      ctx.clip();

      const sourceX =
        piece.col * (image.width / cols) -
        (piece.tabs.left === 1 ? (image.width / cols) * (tabSize / piece.width) : 0);
      const sourceY =
        piece.row * (image.height / rows) -
        (piece.tabs.top === 1 ? (image.height / rows) * (tabSize / piece.height) : 0);
      const sourceWidth = (image.width / cols) * (bounds.expandedWidth / piece.width);
      const sourceHeight = (image.height / rows) * (bounds.expandedHeight / piece.height);

      ctx.drawImage(
        image,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(sourceWidth, image.width - Math.max(0, sourceX)),
        Math.min(sourceHeight, image.height - Math.max(0, sourceY)),
        -bounds.offsetX,
        -bounds.offsetY,
        bounds.expandedWidth,
        bounds.expandedHeight
      );

      ctx.restore();

      // Dibujar borde de la pieza
      ctx.save();
      ctx.translate(piece.x, piece.y);
      drawPath(ctx);

      if (piece.isPlaced) {
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = isMobile ? 2 : 3;
      } else if (piece.isDragging) {
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = isMobile ? 3 : 4;
      } else {
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = isMobile ? 1.5 : 2;
      }

      ctx.stroke();
      ctx.restore();

      // Sombra para la pieza (efecto 3D) - reducida en móvil
      if (!piece.isPlaced) {
        ctx.save();
        const shadowOffset = isMobile ? 1 : 2;
        ctx.translate(piece.x + shadowOffset, piece.y + shadowOffset);
        drawPath(ctx);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();
        ctx.restore();
      }
    });

    // Mostrar mensaje de completado
    if (isCompleted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${isMobile ? '24' : '48'}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(
        '🎉 ¡PUZZLE COMPLETADO! 🎉',
        canvas.width / 2,
        canvas.height / 2
      );

      ctx.font = `${isMobile ? '16' : '24'}px Arial`;
      ctx.fillText(
        '¡Excelente trabajo!',
        canvas.width / 2,
        canvas.height / 2 + (isMobile ? 40 : 60)
      );
    }
  }, [pieces, image, rows, cols, isCompleted, puzzleSize, isMobile]);

  // Manejar carga de imagen
  const handleFileChange = (
    e?: React.ChangeEvent<HTMLInputElement>,
    Url: string = ""
  ) => {
    let url: string = Url;

    if (!url && (!e || !e.target.files || e.target.files.length === 0)) {
      return;
    }

    if (e && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      url = URL.createObjectURL(file);
    }

    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    img.src = url;
  };

  // Verificar si una pieza está en su posición correcta
  const isPieceInCorrectPosition = (piece: PuzzlePiece): boolean => {
    const threshold = isMobile ? 35 : 25; // Mayor tolerancia en móvil
    return (
      Math.abs(piece.x - piece.correctX) < threshold &&
      Math.abs(piece.y - piece.correctY) < threshold
    );
  };

  // Encontrar pieza en coordenadas específicas
  const findPieceAt = (x: number, y: number): PuzzlePiece | null => {
    for (let i = pieces.length - 1; i >= 0; i--) {
      const piece = pieces[i];
      if (
        x >= piece.x &&
        x <= piece.x + piece.width &&
        y >= piece.y &&
        y <= piece.y + piece.height
      ) {
        return piece;
      }
    }
    return null;
  };

  // Obtener coordenadas del evento (mouse o touch) - versión para eventos nativos
  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Evento táctil
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Evento de mouse
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  // Versión para eventos de React (solo mouse)
  const getReactEventCoordinates = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Manejar inicio de arrastre (solo mouse via React)
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getReactEventCoordinates(e);
    const piece = findPieceAt(x, y);
    
    if (piece && !piece.isPlaced) {
      setDraggedPiece(piece);
      setDragOffset({ x: x - piece.x, y: y - piece.y });

      setPieces((prev) => {
        const newPieces = prev.filter((p) => p.id !== piece.id);
        return [...newPieces, { ...piece, isDragging: true }];
      });
    }
  };

  // Manejar movimiento (solo mouse via React)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPiece) return;
    
    const { x, y } = getReactEventCoordinates(e);

    setPieces((prev) =>
      prev.map((piece) =>
        piece.id === draggedPiece.id
          ? { ...piece, x: x - dragOffset.x, y: y - dragOffset.y }
          : piece
      )
    );
  };

  // Manejar fin de arrastre (mouse y touch)
  const handleMouseUp = () => {
    if (!draggedPiece) return;

    setPieces((prev) => {
      const newPieces = prev.map((piece) => {
        if (piece.id === draggedPiece.id) {
          const updatedPiece = { ...piece, isDragging: false };

          if (isPieceInCorrectPosition(updatedPiece)) {
            updatedPiece.x = updatedPiece.correctX;
            updatedPiece.y = updatedPiece.correctY;
            updatedPiece.isPlaced = true;
          }

          return updatedPiece;
        }
        return piece;
      });

      const allPlaced = newPieces.every((piece) => piece.isPlaced);
      if (allPlaced && newPieces.length > 0) {
        setIsCompleted(true);
      }

      return newPieces;
    });

    setDraggedPiece(null);
  };

  // Event listeners para touch con preventDefault habilitado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Ahora sí funciona porque usamos { passive: false }
      const { x, y } = getEventCoordinates(e);
      const piece = findPieceAt(x, y);
      
      if (piece && !piece.isPlaced) {
        setDraggedPiece(piece);
        setDragOffset({ x: x - piece.x, y: y - piece.y });

        setPieces((prev) => {
          const newPieces = prev.filter((p) => p.id !== piece.id);
          return [...newPieces, { ...piece, isDragging: true }];
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!draggedPiece) return;
      
      const { x, y } = getEventCoordinates(e);
      setPieces((prev) =>
        prev.map((piece) =>
          piece.id === draggedPiece.id
            ? { ...piece, x: x - dragOffset.x, y: y - dragOffset.y }
            : piece
        )
      );
    };

    const handleTouchEnd = () => {
      if (!draggedPiece) return;

      setPieces((prev) => {
        const newPieces = prev.map((piece) => {
          if (piece.id === draggedPiece.id) {
            const updatedPiece = { ...piece, isDragging: false };

            if (isPieceInCorrectPosition(updatedPiece)) {
              updatedPiece.x = updatedPiece.correctX;
              updatedPiece.y = updatedPiece.correctY;
              updatedPiece.isPlaced = true;
            }

            return updatedPiece;
          }
          return piece;
        });

        const allPlaced = newPieces.every((piece) => piece.isPlaced);
        if (allPlaced && newPieces.length > 0) {
          setIsCompleted(true);
        }

        return newPieces;
      });

      setDraggedPiece(null);
    };

    // Agregar event listeners con passive: false para poder usar preventDefault
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [draggedPiece, dragOffset, pieces]); // Dependencias necesarias

  // Mezclar piezas
  const shufflePieces = () => {
    if (!canvasRef.current) return;

    const margin = pieces.length > 0 ? pieces[0].width * 0.1 : 20;
    
    setPieces((prev) =>
      prev.map((piece) => {
        const maxX = puzzleSize.width - piece.width - margin;
        const maxY = puzzleSize.height - piece.height - margin;
        
        return {
          ...piece,
          x: margin + Math.random() * maxX,
          y: margin + Math.random() * maxY,
          isPlaced: false,
          isDragging: false,
        };
      })
    );
    setIsCompleted(false);
  };

  // Effects
  useEffect(() => {
    if (image) {
      generatePieces();
    }
  }, [generatePieces]);

  useEffect(() => {
    drawPuzzle();
  }, [drawPuzzle]);

  useEffect(() => {
    handleFileChange(undefined, Url);
  }, [Url]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-100 p-2 sm:p-4 md:p-6"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-center text-gray-800 mb-4 md:mb-6">
          🧩 Rompecabezas Real
        </h1>

        <p className="text-center text-gray-600 text-sm sm:text-base md:text-lg mb-6 md:mb-8 italic">
          Con formas irregulares auténticas que encajan perfectamente
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-1 sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                📸 Subir imagen:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white text-sm"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                📏 Filas:
              </label>
              <input
                type="number"
                min={2}
                max={isMobile ? 5 : 8}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-full p-2 border-2 border-gray-300 rounded-lg text-center font-bold"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                📐 Columnas:
              </label>
              <input
                type="number"
                min={2}
                max={isMobile ? 5 : 8}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="w-full p-2 border-2 border-gray-300 rounded-lg text-center font-bold"
              />
            </div>
          </div>

          {pieces.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={shufflePieces}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                🔄 Mezclar Piezas
              </button>
            </div>
          )}
        </div>

        {image && (
          <div className="text-center">
            <div className="inline-block mb-4 relative">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="border-4 border-gray-700 rounded-lg shadow-xl bg-white"
                style={{
                  cursor: draggedPiece ? 'grabbing' : 'grab',
                  maxWidth: '100%',
                  height: 'auto',
                  touchAction: 'none' // Previene gestos táctiles del navegador
                }}
                // Solo eventos de mouse (los táctiles se manejan con useEffect)
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {pieces.length > 0 && (
              <div
                className={`p-4 rounded-lg border-3 font-bold text-center ${
                  isCompleted
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-yellow-100 border-yellow-500 text-yellow-800'
                }`}
              >
                {isCompleted ? (
                  <>
                    <div className="text-lg sm:text-xl">🎉 ¡PUZZLE COMPLETADO! 🎉</div>
                    <div className="text-sm mt-2">
                      ¡Todas las {pieces.length} piezas están en su lugar correcto!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg">
                      Progreso: {pieces.filter((p) => p.isPlaced).length} / {pieces.length} piezas
                    </div>
                    <div className="text-sm mt-2">
                      {isMobile 
                        ? 'Toca y arrastra las piezas hacia el área punteada'
                        : 'Arrastra las piezas hacia el área punteada para completar el rompecabezas'
                      }
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealJigsawPuzzle;