import React, { useEffect, useState, useRef, useCallback } from "react";
import * as ROT from "rot-js";
import KidsShootQuestion from '@/src/components/games/laberinto/KidsShootQuestion'

export interface PreguntaObj {
  Pregunta: string;
  Respuesta1: string;
  Respuesta2: string;
  Respuesta3: string;
  Correcta: string;
}

interface IdentificadorCuento {
  Id: number;
  height?: number;
  width?: number;
  // Nuevas props para personalización de imágenes
  avatarImage?: string;
  floorImage?: string;
  wallImage?: string;
  chestImage?: string;
  goalImage?: string;
  alternativeWallImage?: string;
  alternativeFloorImage?: string;
}

const MazeGame: React.FC<IdentificadorCuento> = ({
  Id,
  height,
  width,
  avatarImage = '/Imagenes/Kirbypx.webp',
  floorImage: floorImageProp = '/Imagenes/Suelo.webp',
  wallImage: wallImageProp = '/Imagenes/Pared.webp',
  chestImage = '/Imagenes/Cofre.webp',
  goalImage = '/Imagenes/Portal.webp',
  alternativeWallImage = '',
  alternativeFloorImage = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  // 📱 Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const setupHighDPICanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const devicePixelRatio = window.devicePixelRatio || 1;

    // Ajustar tamaño según dispositivo - REDUCIDO para desktop
    const displayWidth = isMobile ? Math.min(window.innerWidth - 40, 350) : (width || 600); // Reducido de 900 a 600
    const displayHeight = isMobile ? Math.min(window.innerHeight - 200, 500) : (height || 450); // Reducido de 650 a 450

    canvas.width = displayWidth * devicePixelRatio;
    canvas.height = displayHeight * devicePixelRatio;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, [isMobile, width, height]);

  const [map, setMap] = useState<number[][]>([]);
  const [preguntas, setPreguntas] = useState<PreguntaObj[]>([]);
  const [activePregunta, setActivePregunta] = useState<PreguntaObj | null>(null);
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
  const [floorImage, setFloorImage] = useState<HTMLImageElement | null>(null);
  const [wallImage, setWallImage] = useState<HTMLImageElement | null>(null);
  const [giftImage, setGiftImage] = useState<HTMLImageElement | null>(null);
  const [castleImage, setCastleImage] = useState<HTMLImageElement | null>(null);
  const [alternativeWall, setAlternativeWall] = useState<HTMLImageElement | null>(null);
  const [floorAlternativeImage, setAlternativeFloorImage] = useState<HTMLImageElement | null>(null);

  // 🎮 Estado del juego optimizado
  const [gameState, setGameState] = useState({
    playerX: 1.5,
    playerY: 1.5,
    targetX: 1.5,
    targetY: 1.5,
    isMoving: false,
    moveSpeed: 0.25,
    cellSize: isMobile ? 25 : 30, // Reducido ligeramente para desktop
    cameraX: 0,
    cameraY: 0
  });

  // 🗺️ Estado del sistema de exploración
  const [explorationState, setExplorationState] = useState({
    showingPath: true,
    pathToGoal: [] as { x: number, y: number }[],
    goalPosition: { x: 0, y: 0 },
    exploredCells: new Set<string>(),
    discoveredCells: new Set<string>(),
    visionRadius: isMobile ? 2 : 2.5,
    pathAnimationProgress: 0,
    pathCameraIndex: 0,
    gamePhase: 'showing-path' as 'showing-path' | 'exploring' | 'completed',
    mazeGenerated: false // NUEVO: Para controlar cuando el mapa está listo
  });

  // 🎮 Control de teclas
  const keysPressed = useRef({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // 📱 Controles táctiles para móvil
  const [touchControls, setTouchControls] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isTouching: false
  });

  const loadOptimizedImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error('No image source provided'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        console.log(`Imagen cargada: ${src}`);
        resolve(img);
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  // 🗺️ Encontrar camino
  const findPathToGoal = useCallback((startX: number, startY: number, goalX: number, goalY: number): { x: number, y: number }[] => {
    if (!map.length) return [];

    const visited = new Set<string>();
    const queue: { x: number, y: number, path: { x: number, y: number }[] }[] = [
      { x: startX, y: startY, path: [{ x: startX, y: startY }] }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (current.x === goalX && current.y === goalY) {
        return current.path;
      }

      const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

      for (const [dx, dy] of directions) {
        const newX = current.x + dx;
        const newY = current.y + dy;
        const newKey = `${newX},${newY}`;

        if (newX >= 0 && newX < map[0].length &&
          newY >= 0 && newY < map.length &&
          map[newY][newX] !== 1 &&
          !visited.has(newKey)) {

          queue.push({
            x: newX,
            y: newY,
            path: [...current.path, { x: newX, y: newY }]
          });
        }
      }
    }

    return [];
  }, [map]);

  // 🎯 Encontrar posición para la meta
  const findGoalPosition = useCallback((): { x: number, y: number } => {
    if (!map.length) return { x: 1, y: 1 };

    const possibleGoals: { x: number, y: number }[] = [];
    const playerGridX = Math.floor(gameState.playerX);
    const playerGridY = Math.floor(gameState.playerY);

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] === 0) {
          const distance = Math.abs(x - playerGridX) + Math.abs(y - playerGridY);
          if (distance > 8) {
            possibleGoals.push({ x, y });
          }
        }
      }
    }

    return possibleGoals[Math.floor(Math.random() * possibleGoals.length)] || { x: 1, y: 1 };
  }, [map, gameState.playerX, gameState.playerY]);

  // 🔍 Verificar si una celda debe ser visible
  const isCellVisible = useCallback((x: number, y: number): boolean => {
    if (explorationState.gamePhase === 'showing-path') return true;

    const cellKey = `${x},${y}`;
    return explorationState.discoveredCells.has(cellKey);
  }, [explorationState.gamePhase, explorationState.discoveredCells]);

 // 🎨 Función de dibujo optimizada y centrada
const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  const { playerX, playerY, cellSize, cameraX, cameraY } = gameState;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // dimensiones lógicas (corregidas con DPR)
  const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
  const logicalHeight = canvas.height / (window.devicePixelRatio || 1);

  // Fondo degradado
  const gradient = ctx.createLinearGradient(0, 0, logicalWidth, logicalHeight);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#98FB98');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  if (!map.length) return;

  // calcular rango de celdas visibles
  const startX = Math.max(0, Math.floor((cameraX - logicalWidth / 2) / cellSize));
  const endX = Math.min(map[0].length, Math.ceil((cameraX + logicalWidth / 2) / cellSize));
  const startY = Math.max(0, Math.floor((cameraY - logicalHeight / 2) / cellSize));
  const endY = Math.min(map.length, Math.ceil((cameraY + logicalHeight / 2) / cellSize));

  if (explorationState.gamePhase === 'exploring') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  }

  // ====================
  // MAPA
  // ====================
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const screenX = Math.round(x * cellSize - cameraX + logicalWidth / 2);
      const screenY = Math.round(y * cellSize - cameraY + logicalHeight / 2);
      const roundedCellSize = Math.round(cellSize);

      const cell = map[y][x];
      const cellVisible = isCellVisible(x, y);

      if (!cellVisible && explorationState.gamePhase === 'exploring') continue;

      if (cell === 0) {
        if (floorImage?.complete && floorImage.naturalWidth > 0) {
          ctx.drawImage(floorImage, screenX, screenY, roundedCellSize, roundedCellSize);
          if ((x + y) % 3 === 0 && floorAlternativeImage?.complete) {
            ctx.drawImage(floorAlternativeImage, screenX, screenY, roundedCellSize, roundedCellSize);
          }
        } else {
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        }

      } else if (cell === 1) {
        if (wallImage?.complete && wallImage.naturalWidth > 0) {
          ctx.drawImage(wallImage, screenX, screenY, roundedCellSize, roundedCellSize);
          if ((x + y) % 3 === 0 && alternativeWall?.complete) {
            ctx.drawImage(alternativeWall, screenX, screenY, roundedCellSize, roundedCellSize);
          }
        } else {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        }

      } else if (cell === 2) {
        if (floorImage?.complete) {
          ctx.drawImage(floorImage, screenX, screenY, roundedCellSize, roundedCellSize);
        } else {
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        }

        if (giftImage?.complete && giftImage.naturalWidth > 0) {
          const giftSize = Math.round(cellSize - 8);
          const giftOffset = Math.round(4);
          ctx.drawImage(giftImage, screenX + giftOffset, screenY + giftOffset, giftSize, giftSize);
        } else {
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(screenX + 5, screenY + 5, roundedCellSize - 10, roundedCellSize - 10);
        }

      } else if (cell === 3) {
        if (floorImage?.complete) {
          ctx.drawImage(floorImage, screenX, screenY, roundedCellSize, roundedCellSize);
        } else {
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        }

        const time = Date.now() * 0.003;
        const pulse = Math.sin(time) * 0.1 + 0.9;
        ctx.fillStyle = `rgba(255, 215, 0, ${0.3 * pulse})`;
        ctx.beginPath();
        ctx.arc(screenX + cellSize / 2, screenY + cellSize / 2, cellSize / 2 * pulse, 0, Math.PI * 2);
        ctx.fill();

        if (castleImage?.complete && castleImage.naturalWidth > 0) {
          const castleSize = Math.round(cellSize - 4);
          const castleOffset = Math.round(2);
          ctx.drawImage(castleImage, screenX + castleOffset, screenY + castleOffset, castleSize, castleSize);
        } else {
          ctx.fillStyle = '#9400D3';
          ctx.fillRect(screenX + 2, screenY + 2, roundedCellSize - 4, roundedCellSize - 4);
        }
      }
    }
  }

  // ====================
  // CAMINO
  // ====================
  if (explorationState.gamePhase === 'showing-path' && explorationState.pathToGoal.length > 0) {
    const pathProgress = Math.min(explorationState.pathAnimationProgress, explorationState.pathToGoal.length);

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = isMobile ? 4 : 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([12, 6]);
    ctx.lineDashOffset = -Date.now() * 0.005;

    ctx.beginPath();

    for (let i = 0; i < Math.floor(pathProgress) - 1 && i < explorationState.pathToGoal.length - 1; i++) {
      const current = explorationState.pathToGoal[i];
      const next = explorationState.pathToGoal[i + 1];

      const currentScreenX = current.x * cellSize - cameraX + logicalWidth / 2 + cellSize / 2;
      const currentScreenY = current.y * cellSize - cameraY + logicalHeight / 2 + cellSize / 2;
      const nextScreenX = next.x * cellSize - cameraX + logicalWidth / 2 + cellSize / 2;
      const nextScreenY = next.y * cellSize - cameraY + logicalHeight / 2 + cellSize / 2;

      if (i === 0) ctx.moveTo(currentScreenX, currentScreenY);
      ctx.lineTo(nextScreenX, nextScreenY);
    }

    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ====================
  // JUGADOR
  // ====================
  const screenPlayerX = Math.round(playerX * cellSize - cameraX + logicalWidth / 2);
  const screenPlayerY = Math.round(playerY * cellSize - cameraY + logicalHeight / 2);

  if (playerImage?.complete && playerImage.naturalWidth > 0) {
    const size = Math.round(cellSize - 6);
    ctx.save();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.drawImage(
      playerImage,
      Math.round(screenPlayerX - size / 2),
      Math.round(screenPlayerY - size / 2),
      size,
      size
    );

    ctx.restore();
  } else {
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(screenPlayerX, screenPlayerY, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
  }
}, [gameState, explorationState, map, isCellVisible, playerImage, floorImage, wallImage, giftImage, castleImage, alternativeWall, floorAlternativeImage, isMobile]);


  // 🎮 Lógica de movimiento
  const handleMovementInput = useCallback(() => {
    if (activePregunta || gameState.isMoving || explorationState.gamePhase !== 'exploring') return;

    const keys = keysPressed.current;
    let deltaX = 0;
    let deltaY = 0;

    if (keys.up) deltaY = -1;
    if (keys.down) deltaY = 1;
    if (keys.left) deltaX = -1;
    if (keys.right) deltaX = 1;

    if (deltaX === 0 && deltaY === 0) return;

    const currentGridX = Math.floor(gameState.playerX);
    const currentGridY = Math.floor(gameState.playerY);
    const newX = currentGridX + deltaX;
    const newY = currentGridY + deltaY;

    if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return;
    if (map[newY][newX] === 1) return;

    setGameState(prev => ({
      ...prev,
      targetX: newX + 0.5,
      targetY: newY + 0.5,
      isMoving: true
    }));
  }, [activePregunta, gameState.isMoving, gameState.playerX, gameState.playerY, map, explorationState.gamePhase]);

  // 📱 Manejo de controles táctiles
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      setTouchControls({
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isTouching: true
      });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0 && touchControls.isTouching) {
      const touch = e.touches[0];
      setTouchControls(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY
      }));
    }
  }, [touchControls.isTouching]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchControls.isTouching && !activePregunta && !gameState.isMoving && explorationState.gamePhase === 'exploring') {
      const deltaX = touchControls.currentX - touchControls.startX;
      const deltaY = touchControls.currentY - touchControls.startY;
      const threshold = 30;

      let moveX = 0;
      let moveY = 0;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold) moveX = 1;
        else if (deltaX < -threshold) moveX = -1;
      } else {
        if (deltaY > threshold) moveY = 1;
        else if (deltaY < -threshold) moveY = -1;
      }

      if (moveX !== 0 || moveY !== 0) {
        const currentGridX = Math.floor(gameState.playerX);
        const currentGridY = Math.floor(gameState.playerY);
        const newX = currentGridX + moveX;
        const newY = currentGridY + moveY;

        if (newY >= 0 && newY < map.length && newX >= 0 && newX < map[0].length && map[newY][newX] !== 1) {
          setGameState(prev => ({
            ...prev,
            targetX: newX + 0.5,
            targetY: newY + 0.5,
            isMoving: true
          }));
        }
      }
    }

    setTouchControls({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isTouching: false
    });
  }, [touchControls, activePregunta, gameState, explorationState.gamePhase, map]);

  // 🎮 Update game
  const updateGame = useCallback((deltaTime: number) => {
    if (!map.length) return;

    const playerGridX = Math.floor(gameState.playerX);
    const playerGridY = Math.floor(gameState.playerY);

    if (map[playerGridY] && map[playerGridY][playerGridX] === 3 &&
      explorationState.gamePhase === 'exploring') {
      setExplorationState(prev => ({ ...prev, gamePhase: 'completed' }));
      return;
    }

    if (gameState.isMoving) {
      const dx = gameState.targetX - gameState.playerX;
      const dy = gameState.targetY - gameState.playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.05) {
        setGameState(prev => ({
          ...prev,
          playerX: prev.targetX,
          playerY: prev.targetY,
          isMoving: false
        }));

        const gridX = Math.floor(gameState.targetX);
        const gridY = Math.floor(gameState.targetY);
        if (map[gridY] && map[gridY][gridX] === 2) {
          shootQuestion();
        }
      } else {
        const moveAmount = gameState.moveSpeed * (deltaTime / 16);
        setGameState(prev => ({
          ...prev,
          playerX: prev.playerX + dx * moveAmount,
          playerY: prev.playerY + dy * moveAmount
        }));
      }
    } else {
      handleMovementInput();
    }

    if (explorationState.gamePhase === 'exploring') {
      const newDiscovered = new Set(explorationState.discoveredCells);
      const visionRadius = explorationState.visionRadius;

      for (let dy = -Math.ceil(visionRadius); dy <= Math.ceil(visionRadius); dy++) {
        for (let dx = -Math.ceil(visionRadius); dx <= Math.ceil(visionRadius); dx++) {
          const x = Math.floor(gameState.playerX) + dx;
          const y = Math.floor(gameState.playerY) + dy;
          if (x >= 0 && x < map[0].length && y >= 0 && y < map.length) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= visionRadius) {
              newDiscovered.add(`${x},${y}`);
            }
          }
        }
      }

      if (newDiscovered.size !== explorationState.discoveredCells.size) {
        setExplorationState(prev => ({
          ...prev,
          discoveredCells: newDiscovered,
          exploredCells: newDiscovered
        }));
      }
    }

    if (explorationState.gamePhase === 'showing-path' && explorationState.pathToGoal.length > 1) {
      const currentPathIndex = Math.min(
        Math.floor(explorationState.pathAnimationProgress),
        explorationState.pathToGoal.length - 1
      );

      if (currentPathIndex >= 0 && currentPathIndex < explorationState.pathToGoal.length - 1) {
        const current = explorationState.pathToGoal[currentPathIndex];
        const next = explorationState.pathToGoal[currentPathIndex + 1];
        const progress = explorationState.pathAnimationProgress - currentPathIndex;

        const interpolatedX = current.x + (next.x - current.x) * progress;
        const interpolatedY = current.y + (next.y - current.y) * progress;

        const targetCameraX = (interpolatedX + 0.5) * gameState.cellSize;
        const targetCameraY = (interpolatedY + 0.5) * gameState.cellSize;

        setGameState(prev => ({
          ...prev,
          cameraX: targetCameraX,
          cameraY: targetCameraY
        }));
      }
    } else if (explorationState.gamePhase === 'exploring') {
      const targetCameraX = gameState.playerX * gameState.cellSize;
      const targetCameraY = gameState.playerY * gameState.cellSize;

      setGameState(prev => ({
        ...prev,
        cameraX: prev.cameraX + (targetCameraX - prev.cameraX) * 0.1,
        cameraY: prev.cameraY + (targetCameraY - prev.cameraY) * 0.1
      }));
    }

    if (explorationState.gamePhase === 'showing-path') {
      setExplorationState(prev => {
        const newProgress = prev.pathAnimationProgress + 0.08;
        if (newProgress >= prev.pathToGoal.length + 30) {
          return { ...prev, gamePhase: 'exploring', pathAnimationProgress: newProgress };
        }
        return { ...prev, pathAnimationProgress: newProgress };
      });
    }
  }, [map, gameState, explorationState, handleMovementInput]);

  const shootQuestion = useCallback(() => {
    if (preguntas.length === 0) return;
    const randomIndex = Math.floor(Math.random() * preguntas.length);
    setActivePregunta(preguntas[randomIndex]);
  }, [preguntas]);

  const gameLoop = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    if (deltaTime < 100) {
      updateGame(deltaTime);
      draw(ctx, canvas);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, draw]);

  // ⌨️ Event listeners para teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = keysPressed.current;

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          e.preventDefault();
          keys.up = true;
          break;
        case "arrowdown":
        case "s":
          e.preventDefault();
          keys.down = true;
          break;
        case "arrowleft":
        case "a":
          e.preventDefault();
          keys.left = true;
          break;
        case "arrowright":
        case "d":
          e.preventDefault();
          keys.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = keysPressed.current;

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          keys.up = false;
          break;
        case "arrowdown":
        case "s":
          keys.down = false;
          break;
        case "arrowleft":
        case "a":
          keys.left = false;
          break;
        case "arrowright":
        case "d":
          keys.right = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Actualizar canvas cuando cambie el tamaño
  useEffect(() => {
    setupHighDPICanvas();
    setGameState(prev => ({
      ...prev,
      cellSize: isMobile ? 25 : 30 // Ajustado
    }));
    setExplorationState(prev => ({
      ...prev,
      visionRadius: isMobile ? 2 : 2.5
    }));
  }, [setupHighDPICanvas, isMobile]);

  // 🏗️ Inicialización - CORREGIDA para evitar regenerar el mapa
  useEffect(() => {
    // Solo generar una vez cuando cambie el ID o cuando sea la primera vez
    if (explorationState.mazeGenerated) return;

    const mockPreguntas: PreguntaObj[] = [
      {
        Pregunta: "¿Cuál es tu color favorito?",
        Respuesta1: "Azul como el cielo",
        Respuesta2: "Verde como la hierba",
        Respuesta3: "Rosa como las flores",
        Correcta: "Verde como la hierba",
      },
      {
        Pregunta: "¿Qué animal te gusta más?",
        Respuesta1: "Gato",
        Respuesta2: "Perro",
        Respuesta3: "Unicornio",
        Correcta: "Unicornio",
      }
    ];

    setPreguntas(mockPreguntas);

    // Generar laberinto - MISMA LÓGICA para móvil y desktop
    const mazeWidth = isMobile ? 20 : 25; // Menos diferencia entre móvil y desktop
    const mazeHeight = isMobile ? 25 : 30; // Menos diferencia entre móvil y desktop
    
    console.log(`Generando laberinto: ${mazeWidth}x${mazeHeight} (isMobile: ${isMobile})`);
    
    const maze = new ROT.Map.DividedMaze(mazeWidth, mazeHeight);

    const newMap: number[][] = [];
    maze.create((x, y, wall) => {
      if (!newMap[y]) newMap[y] = [];
      newMap[y][x] = wall ? 1 : (Math.random() < 0.08 ? 2 : 0);
    });

    setMap(newMap);

    // Encontrar posición inicial válida
    let startX = 1.5, startY = 1.5;
    outerLoop: for (let y = 1; y < newMap.length - 1; y++) {
      for (let x = 1; x < newMap[0].length - 1; x++) {
        if (newMap[y][x] === 0) {
          startX = x + 0.5;
          startY = y + 0.5;
          break outerLoop;
        }
      }
    }

    console.log(`Posición inicial del jugador: (${startX}, ${startY})`);

    setGameState(prev => ({
      ...prev,
      playerX: startX,
      playerY: startY,
      targetX: startX,
      targetY: startY,
      cameraX: startX * prev.cellSize,
      cameraY: startY * prev.cellSize
    }));

    setExplorationState(prev => ({
      ...prev,
      mazeGenerated: true,
      gamePhase: 'showing-path',
      pathAnimationProgress: 0,
      discoveredCells: new Set([`${Math.floor(startX)},${Math.floor(startY)}`])
    }));

  }, [Id, isMobile, explorationState.mazeGenerated]); // CLAVE: Solo regenerar si cambia isMobile o ID

  // Cargar imágenes con las props
  useEffect(() => {
    // Cargar imagen del jugador
    if (avatarImage) {
      loadOptimizedImage(avatarImage)
        .then(setPlayerImage)
        .catch(() => console.log('Player image not found, using fallback'));
    }

    // Cargar imagen del suelo
    if (floorImageProp) {
      loadOptimizedImage(floorImageProp)
        .then(setFloorImage)
        .catch(() => console.log('Floor image not found, using fallback'));
    }

    // Cargar imagen del suelo alternativo
    if (alternativeFloorImage) {
      loadOptimizedImage(alternativeFloorImage)
        .then(setAlternativeFloorImage)
        .catch(() => console.log('Alternative floor image not found, using fallback'));
    }

    // Cargar pared alternativa
    if (alternativeWallImage) {
      loadOptimizedImage(alternativeWallImage)
        .then(setAlternativeWall)
        .catch(() => console.log('Alternative wall image not found, using fallback'));
    }

    // Cargar imagen de pared
    if (wallImageProp) {
      loadOptimizedImage(wallImageProp)
        .then(setWallImage)
        .catch(() => console.log('Wall image not found, using fallback'));
    }

    // Cargar imagen de cofre
    if (chestImage) {
      loadOptimizedImage(chestImage)
        .then(setGiftImage)
        .catch(() => console.log('Gift image not found, using fallback'));
    }

    // Cargar imagen de meta
    if (goalImage) {
      loadOptimizedImage(goalImage)
        .then(setCastleImage)
        .catch(() => console.log('Castle image not found, using fallback'));
    }
  }, [avatarImage, floorImageProp, wallImageProp, chestImage, goalImage, alternativeWallImage, alternativeFloorImage]);

  // CORREGIDO: Configurar meta cuando el mapa esté listo y las posiciones estén establecidas
  useEffect(() => {
    if (map.length > 0 && 
        gameState.playerX > 1 && 
        explorationState.goalPosition.x === 0 && 
        explorationState.mazeGenerated) {
      
      console.log('Configurando meta y camino...');
      
      const goalPos = findGoalPosition();
      console.log(`Posición de meta encontrada: (${goalPos.x}, ${goalPos.y})`);

      // Crear copia del mapa y colocar la meta
      const newMap = map.map(row => [...row]);
      newMap[goalPos.y][goalPos.x] = 3;
      setMap(newMap);

      // Encontrar camino desde la posición actual del jugador
      const playerGridX = Math.floor(gameState.playerX);
      const playerGridY = Math.floor(gameState.playerY);
      
      console.log(`Calculando camino desde (${playerGridX}, ${playerGridY}) hasta (${goalPos.x}, ${goalPos.y})`);
      
      const path = findPathToGoal(playerGridX, playerGridY, goalPos.x, goalPos.y);
      
      console.log(`Camino encontrado con ${path.length} pasos:`, path.slice(0, 5), '...');

      setExplorationState(prev => ({
        ...prev,
        goalPosition: goalPos,
        pathToGoal: path,
        pathAnimationProgress: 0,
        gamePhase: 'showing-path'
      }));
    }
  }, [map.length, gameState.playerX, gameState.playerY, explorationState.goalPosition.x, explorationState.mazeGenerated, findGoalPosition, findPathToGoal]);

  // Game loop
  useEffect(() => {
    if (map.length > 0 && explorationState.mazeGenerated) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [map.length, explorationState.mazeGenerated, gameLoop]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: isMobile ? '10px' : '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: isMobile ? '1.5rem' : '2.5rem',
        textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
        margin: isMobile ? '5px 0 10px 0' : '10px 0 20px 0',
        fontFamily: 'Comic Sans MS, cursive',
        textAlign: 'center'
      }}>
        🌟 ¡Aventura Mágica! 🌟
      </h1>

      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          border: '5px solid #fff',
          borderRadius: isMobile ? '10px' : '20px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
          background: '#87CEEB',
          imageRendering: 'auto',
          touchAction: 'none',
          maxWidth: '100%',
          maxHeight: isMobile ? '70vh' : '60vh' // LIMITADO para permitir scroll
        }}
      />

      {/* Solo mostrar instrucciones en desktop */}
      {!isMobile && (
        <div style={{
          marginTop: '20px',
          color: 'white',
          textAlign: 'center',
          fontFamily: 'Comic Sans MS, cursive',
          fontSize: '1.2rem',
          maxWidth: '800px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '15px',
            borderRadius: '15px',
            marginBottom: '10px'
          }}>
            <p style={{ margin: '5px 0' }}>🎮 Usa las flechas ⬅️➡️⬆️⬇️ o WASD para moverte</p>
            <p style={{ margin: '5px 0' }}>🎁 Recoge los regalos mágicos para responder preguntas</p>
            <p style={{ margin: '5px 0' }}>🏰 ¡Encuentra el castillo mágico para ganar!</p>
          </div>
        </div>
      )}

      {/* Indicador de controles móviles */}
      {isMobile && (
        <div style={{
          marginTop: '10px',
          color: 'white',
          textAlign: 'center',
          fontFamily: 'Comic Sans MS, cursive',
          fontSize: '1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '10px',
          borderRadius: '10px',
        }}>
          <p style={{ margin: '0' }}>👆 Desliza para moverte</p>
        </div>
      )}

      {/* Información adicional que ahora será visible */}
      <div style={{
        marginTop: '20px',
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Comic Sans MS, cursive',
        fontSize: isMobile ? '0.9rem' : '1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '15px',
        borderRadius: '10px',
        maxWidth: '600px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>✨ Información del Juego ✨</h3>
        <p style={{ margin: '5px 0' }}>
          🔍 Al principio verás el camino hacia el castillo mágico
        </p>
        <p style={{ margin: '5px 0' }}>
          🌟 Luego podrás explorar libremente el laberinto
        </p>
        <p style={{ margin: '5px 0' }}>
          🎯 Recuerda la ubicación del castillo para llegar hasta él
        </p>
      </div>

      {/* Mensaje de victoria */}
      {explorationState.gamePhase === 'completed' && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          color: 'white',
          padding: isMobile ? '20px' : '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          zIndex: 1000,
          animation: 'pulse 1s ease-in-out infinite'
        }}>
          <h2 style={{
            fontSize: isMobile ? '1.8rem' : '3rem',
            margin: '0 0 10px 0',
            fontFamily: 'Comic Sans MS, cursive'
          }}>
            🎉 ¡GANASTE! 🎉
          </h2>
          <p style={{
            fontSize: isMobile ? '1rem' : '1.5rem',
            fontFamily: 'Comic Sans MS, cursive'
          }}>
            ¡Has completado la aventura mágica!
          </p>
        </div>
      )}

      {activePregunta && (
        <KidsShootQuestion
          pregunta={activePregunta}
          onClose={() => setActivePregunta(null)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        
        /* Asegurar que el contenedor permita scroll */
        body {
          overflow-y: auto !important;
        }
      `}</style>
    </div>
  );
};

export default MazeGame;