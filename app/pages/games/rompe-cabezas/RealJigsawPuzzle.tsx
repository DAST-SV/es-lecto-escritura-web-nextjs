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
  Url: string; // tu único parámetro
}

const RealJigsawPuzzle: React.FC<RealJigsawPuzzleProps> = ({ Url}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [_imageUrl, setImageUrl] = useState<string>('');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCompleted, setIsCompleted] = useState(false);

  // Generar forma irregular de pieza de puzzle REAL con curvas Bézier
  const generateRealPiecePath = (
    piece: PuzzlePiece,
    pieceWidth: number,
    pieceHeight: number
  ) => {
    const tabSize = Math.min(pieceWidth, pieceHeight) * 0.25; // Tamaño de las protuberancias/huecos
    const curveStrength = tabSize * 0.7; // Curvatura de las formas

    return (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();

      // Empezar desde esquina superior izquierda
      ctx.moveTo(0, 0);

      // ============ LADO SUPERIOR ============
      if (piece.tabs.top === 0) {
        // Borde recto (pieza del borde superior)
        ctx.lineTo(pieceWidth, 0);
      } else {
        // Pieza interior con forma irregular
        const midX = pieceWidth / 2;
        const tabWidth = tabSize;

        // Ir hasta el inicio del tab
        ctx.lineTo(midX - tabWidth, 0);

        if (piece.tabs.top === 1) {
          // PROTUBERANCIA (tab que sale hacia arriba)
          ctx.bezierCurveTo(
            midX - tabWidth,
            -curveStrength, // Punto control 1
            midX - tabWidth / 2,
            -tabSize, // Punto control 2
            midX,
            -tabSize // Punto final
          );
          ctx.bezierCurveTo(
            midX + tabWidth / 2,
            -tabSize, // Punto control 1
            midX + tabWidth,
            -curveStrength, // Punto control 2
            midX + tabWidth,
            0 // Punto final
          );
        } else {
          // HUECO (tab que entra hacia adentro)
          ctx.bezierCurveTo(
            midX - tabWidth,
            curveStrength, // Punto control 1
            midX - tabWidth / 2,
            tabSize, // Punto control 2
            midX,
            tabSize // Punto final
          );
          ctx.bezierCurveTo(
            midX + tabWidth / 2,
            tabSize, // Punto control 1
            midX + tabWidth,
            curveStrength, // Punto control 2
            midX + tabWidth,
            0 // Punto final
          );
        }

        // Continuar hasta esquina superior derecha
        ctx.lineTo(pieceWidth, 0);
      }

      // ============ LADO DERECHO ============
      if (piece.tabs.right === 0) {
        // Borde recto (pieza del borde derecho)
        ctx.lineTo(pieceWidth, pieceHeight);
      } else {
        const midY = pieceHeight / 2;
        const tabHeight = tabSize;

        // Ir hasta el inicio del tab
        ctx.lineTo(pieceWidth, midY - tabHeight);

        if (piece.tabs.right === 1) {
          // PROTUBERANCIA (tab que sale hacia la derecha)
          ctx.bezierCurveTo(
            pieceWidth + curveStrength,
            midY - tabHeight,
            pieceWidth + tabSize,
            midY - tabHeight / 2,
            pieceWidth + tabSize,
            midY
          );
          ctx.bezierCurveTo(
            pieceWidth + tabSize,
            midY + tabHeight / 2,
            pieceWidth + curveStrength,
            midY + tabHeight,
            pieceWidth,
            midY + tabHeight
          );
        } else {
          // HUECO (tab que entra hacia adentro)
          ctx.bezierCurveTo(
            pieceWidth - curveStrength,
            midY - tabHeight,
            pieceWidth - tabSize,
            midY - tabHeight / 2,
            pieceWidth - tabSize,
            midY
          );
          ctx.bezierCurveTo(
            pieceWidth - tabSize,
            midY + tabHeight / 2,
            pieceWidth - curveStrength,
            midY + tabHeight,
            pieceWidth,
            midY + tabHeight
          );
        }

        ctx.lineTo(pieceWidth, pieceHeight);
      }

      // ============ LADO INFERIOR ============
      if (piece.tabs.bottom === 0) {
        // Borde recto (pieza del borde inferior)
        ctx.lineTo(0, pieceHeight);
      } else {
        const midX = pieceWidth / 2;
        const tabWidth = tabSize;

        // Ir hasta el inicio del tab (de derecha a izquierda)
        ctx.lineTo(midX + tabWidth, pieceHeight);

        if (piece.tabs.bottom === 1) {
          // PROTUBERANCIA (tab que sale hacia abajo)
          ctx.bezierCurveTo(
            midX + tabWidth,
            pieceHeight + curveStrength,
            midX + tabWidth / 2,
            pieceHeight + tabSize,
            midX,
            pieceHeight + tabSize
          );
          ctx.bezierCurveTo(
            midX - tabWidth / 2,
            pieceHeight + tabSize,
            midX - tabWidth,
            pieceHeight + curveStrength,
            midX - tabWidth,
            pieceHeight
          );
        } else {
          // HUECO (tab que entra hacia adentro)
          ctx.bezierCurveTo(
            midX + tabWidth,
            pieceHeight - curveStrength,
            midX + tabWidth / 2,
            pieceHeight - tabSize,
            midX,
            pieceHeight - tabSize
          );
          ctx.bezierCurveTo(
            midX - tabWidth / 2,
            pieceHeight - tabSize,
            midX - tabWidth,
            pieceHeight - curveStrength,
            midX - tabWidth,
            pieceHeight
          );
        }

        ctx.lineTo(0, pieceHeight);
      }

      // ============ LADO IZQUIERDO ============
      if (piece.tabs.left === 0) {
        // Borde recto (pieza del borde izquierdo)
        ctx.lineTo(0, 0);
      } else {
        const midY = pieceHeight / 2;
        const tabHeight = tabSize;

        // Ir hasta el inicio del tab (de abajo hacia arriba)
        ctx.lineTo(0, midY + tabHeight);

        if (piece.tabs.left === 1) {
          // PROTUBERANCIA (tab que sale hacia la izquierda)
          ctx.bezierCurveTo(
            -curveStrength,
            midY + tabHeight,
            -tabSize,
            midY + tabHeight / 2,
            -tabSize,
            midY
          );
          ctx.bezierCurveTo(
            -tabSize,
            midY - tabHeight / 2,
            -curveStrength,
            midY - tabHeight,
            0,
            midY - tabHeight
          );
        } else {
          // HUECO (tab que entra hacia adentro)
          ctx.bezierCurveTo(
            curveStrength,
            midY + tabHeight,
            tabSize,
            midY + tabHeight / 2,
            tabSize,
            midY
          );
          ctx.bezierCurveTo(
            tabSize,
            midY - tabHeight / 2,
            curveStrength,
            midY - tabHeight,
            0,
            midY - tabHeight
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
    const puzzleWidth = 500;
    const puzzleHeight = 500;
    const pieceWidth = puzzleWidth / cols;
    const pieceHeight = puzzleHeight / rows;

    const newPieces: PuzzlePiece[] = [];

    // Crear matriz de tabs para asegurar que las piezas encajen perfectamente
    const tabMatrix: number[][][] = Array(rows)
      .fill(null)
      .map(
        () =>
          Array(cols)
            .fill(null)
            .map(() => [0, 0, 0, 0]) // [top, right, bottom, left]
      );

    // Generar tabs asegurando compatibilidad entre piezas adyacentes
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Tab superior
        if (r === 0) {
          tabMatrix[r][c][0] = 0; // Borde superior siempre recto
        } else {
          // Debe ser opuesto al tab inferior de la pieza de arriba
          tabMatrix[r][c][0] = -tabMatrix[r - 1][c][2];
        }

        // Tab derecho
        if (c === cols - 1) {
          tabMatrix[r][c][1] = 0; // Borde derecho siempre recto
        } else {
          // Generar aleatoriamente protuberancia (1) o hueco (-1)
          tabMatrix[r][c][1] = Math.random() > 0.5 ? 1 : -1;
        }

        // Tab inferior
        if (r === rows - 1) {
          tabMatrix[r][c][2] = 0; // Borde inferior siempre recto
        } else {
          // Generar aleatoriamente protuberancia (1) o hueco (-1)
          tabMatrix[r][c][2] = Math.random() > 0.5 ? 1 : -1;
        }

        // Tab izquierdo
        if (c === 0) {
          tabMatrix[r][c][3] = 0; // Borde izquierdo siempre recto
        } else {
          // Debe ser opuesto al tab derecho de la pieza de la izquierda
          tabMatrix[r][c][3] = -tabMatrix[r][c - 1][1];
        }
      }
    }

    // Crear las piezas con las formas calculadas
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const correctX = c * pieceWidth;
        const correctY = r * pieceHeight;

        newPieces.push({
          id: r * cols + c,
          row: r,
          col: c,
          x: Math.random() * (canvas.width - pieceWidth - 50),
          y: Math.random() * (canvas.height - pieceHeight - 50),
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
  }, [image, rows, cols]);

  // Dibujar el puzzle con formas irregulares realistas
  const drawPuzzle = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar marco del área del puzzle
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(0, 0, 500, 500);
    ctx.setLineDash([]);

    // Texto de ayuda en el marco
    ctx.fillStyle = '#999';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Área del Puzzle', 250, 250);

    // Dibujar cada pieza con su forma irregular
    pieces.forEach((piece) => {
      ctx.save();

      const tabSize = Math.min(piece.width, piece.height) * 0.25;
      const bounds = getExpandedBounds(piece, piece.width, piece.height);

      // Posicionar la pieza (ajustando por el offset de las protuberancias)
      ctx.translate(piece.x - bounds.offsetX, piece.y - bounds.offsetY);

      // Generar el path con forma irregular (con offset para las protuberancias)
      ctx.translate(bounds.offsetX, bounds.offsetY);
      const drawPath = generateRealPiecePath(piece, piece.width, piece.height);
      drawPath(ctx);

      // Aplicar clipping para mostrar solo la imagen dentro de la forma
      ctx.clip();

      // Calcular qué parte expandida de la imagen original mostrar
      const sourceX =
        piece.col * (image.width / cols) -
        (piece.tabs.left === 1
          ? (image.width / cols) * (tabSize / piece.width)
          : 0);
      const sourceY =
        piece.row * (image.height / rows) -
        (piece.tabs.top === 1
          ? (image.height / rows) * (tabSize / piece.height)
          : 0);
      const sourceWidth =
        (image.width / cols) * (bounds.expandedWidth / piece.width);
      const sourceHeight =
        (image.height / rows) * (bounds.expandedHeight / piece.height);

      // Dibujar la porción expandida de la imagen
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

      // Dibujar borde de la pieza con colores según estado
      ctx.save();
      ctx.translate(piece.x, piece.y);
      drawPath(ctx);

      if (piece.isPlaced) {
        ctx.strokeStyle = '#28a745'; // Verde para piezas correctas
        ctx.lineWidth = 3;
      } else if (piece.isDragging) {
        ctx.strokeStyle = '#ff6b6b'; // Rojo para pieza siendo arrastrada
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = '#007bff'; // Azul para piezas normales
        ctx.lineWidth = 2;
      }

      ctx.stroke();
      ctx.restore();

      // Sombra para la pieza (efecto 3D)
      if (!piece.isPlaced) {
        ctx.save();
        ctx.translate(piece.x + 2, piece.y + 2);
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
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        '🎉 ¡PUZZLE COMPLETADO! 🎉',
        canvas.width / 2,
        canvas.height / 2
      );

      ctx.font = '24px Arial';
      ctx.fillText(
        '¡Excelente trabajo!',
        canvas.width / 2,
        canvas.height / 2 + 60
      );
    }
  }, [pieces, image, rows, cols, isCompleted]);

    // Manejar carga de imagen
    const handleFileChange = (
        e?: React.ChangeEvent<HTMLInputElement>, 
        Url: string = ""
    ) => {
        let url: string = Url;

        // Si no hay URL y tampoco hay evento válido, salir
        if (!url && (!e || !e.target.files || e.target.files.length === 0)) {
            return;
        }

        // Si viene de un input file
        if (e && e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            url = URL.createObjectURL(file);
        }

        // Guardar URL en estado
        setImageUrl(url);

        // Crear y cargar imagen
        const img = new Image();
        img.onload = () => {
            setImage(img);
        };
        img.src = url;
    };


  // Verificar si una pieza está en su posición correcta
  const isPieceInCorrectPosition = (piece: PuzzlePiece): boolean => {
    const threshold = 25;
    return (
      Math.abs(piece.x - piece.correctX) < threshold &&
      Math.abs(piece.y - piece.correctY) < threshold
    );
  };

  // Encontrar pieza en coordenadas específicas
  const findPieceAt = (x: number, y: number): PuzzlePiece | null => {
    for (let i = pieces.length - 1; i >= 0; i--) {
      const piece = pieces[i];
      // Área aproximada de detección (se podría mejorar con detección de forma exacta)
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

  // Manejar eventos de mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const piece = findPieceAt(x, y);
    if (piece && !piece.isPlaced) {
      setDraggedPiece(piece);
      setDragOffset({ x: x - piece.x, y: y - piece.y });

      // Mover pieza al final del array para que se dibuje encima
      setPieces((prev) => {
        const newPieces = prev.filter((p) => p.id !== piece.id);
        return [...newPieces, { ...piece, isDragging: true }];
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedPiece) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPieces((prev) =>
      prev.map((piece) =>
        piece.id === draggedPiece.id
          ? { ...piece, x: x - dragOffset.x, y: y - dragOffset.y }
          : piece
      )
    );
  };

  const handleMouseUp = () => {
    if (!draggedPiece) return;

    setPieces((prev) => {
      const newPieces = prev.map((piece) => {
        if (piece.id === draggedPiece.id) {
          const updatedPiece = { ...piece, isDragging: false };

          // Verificar si está en posición correcta
          if (isPieceInCorrectPosition(updatedPiece)) {
            updatedPiece.x = updatedPiece.correctX;
            updatedPiece.y = updatedPiece.correctY;
            updatedPiece.isPlaced = true;
          }

          return updatedPiece;
        }
        return piece;
      });

      // Verificar si el puzzle está completo
      const allPlaced = newPieces.every((piece) => piece.isPlaced);
      if (allPlaced && newPieces.length > 0) {
        setIsCompleted(true);
      }

      return newPieces;
    });

    setDraggedPiece(null);
  };

  // Mezclar piezas
  const shufflePieces = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    setPieces((prev) =>
      prev.map((piece) => ({
        ...piece,
        x: Math.random() * (canvas.width - piece.width - 100) ,
        y: Math.random() * (canvas.height - piece.height - 100) ,
        isPlaced: false,
        isDragging: false,
      }))
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
}, [Url]); // se ejecuta cuando Url cambie


  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '20px',
            fontSize: '3rem',
            fontWeight: '800',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          🧩 Rompecabezas Real
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#7f8c8d',
            fontSize: '18px',
            marginBottom: '40px',
            fontStyle: 'italic',
          }}
        >
          Con formas irregulares auténticas que encajan perfectamente
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '25px',
            marginBottom: '30px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ecf0f1',
            padding: '25px',
            borderRadius: '15px',
            border: '2px solid #bdc3c7',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#2c3e50',
                fontSize: '16px',
              }}
            >
              📸 Subir imagen:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                padding: '10px',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#2c3e50',
                fontSize: '16px',
              }}
            >
              📏 Filas:
            </label>
            <input
              type="number"
              min={2}
              max={8}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              style={{
                padding: '10px',
                width: '70px',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#2c3e50',
                fontSize: '16px',
              }}
            >
              📐 Columnas:
            </label>
            <input
              type="number"
              min={2}
              max={8}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              style={{
                padding: '10px',
                width: '70px',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            />
          </div>

          {pieces.length > 0 && (
            <button
              onClick={shufflePieces}
              style={{
                padding: '12px 25px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                marginTop: '25px',
                boxShadow: '0 4px 8px rgba(52, 152, 219, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#2980b9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#3498db';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              🔄 Mezclar Piezas
            </button>
          )}
        </div>

        {image && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                marginBottom: '25px',
                position: 'relative',
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={900}
                style={{
                  border: '4px solid #34495e',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  cursor: draggedPiece ? 'grabbing' : 'grab',
                  backgroundColor: '#ffffff',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {pieces.length > 0 && (
              <div
                style={{
                  padding: '20px',
                  backgroundColor: isCompleted ? '#d4edda' : '#fff3cd',
                  border: `3px solid ${isCompleted ? '#28a745' : '#ffc107'}`,
                  borderRadius: '12px',
                  color: isCompleted ? '#155724' : '#856404',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  marginTop: '20px',
                }}
              >
                {isCompleted ? (
                  <>
                    🎉 ¡PUZZLE COMPLETADO! 🎉
                    <div style={{ marginTop: '10px', fontSize: '14px' }}>
                      ¡Todas las {pieces.length} piezas están en su lugar
                      correcto!
                    </div>
                  </>
                ) : (
                  <>
                    Progreso: {pieces.filter((p) => p.isPlaced).length} /{' '}
                    {pieces.length} piezas colocadas
                    <div style={{ marginTop: '8px', fontSize: '14px' }}>
                      Arrastra las piezas hacia el área punteada para completar
                      el rompecabezas
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
