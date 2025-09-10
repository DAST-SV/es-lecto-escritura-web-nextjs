import React, { useEffect, useState, useRef, useCallback } from "react";
import * as ROT from "rot-js";
import KidsShootQuestion from "./KidsShootQuestion";

export interface PreguntaObj {
  Pregunta: string;
  Respuesta1: string;
  Respuesta2: string;
  Respuesta3: string;
  Correcta: string;
}

interface IdentificadorCuento {
  Id: number;
  height? : number;
  width?: number
}

const MazeGameCanvas: React.FC<IdentificadorCuento> = ({ Id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const setupHighDPICanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Obtener el pixel ratio del dispositivo
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Tamaños de visualización
    const displayWidth = 900;
    const displayHeight = 650;
    
    // Configurar la resolución interna del canvas
    canvas.width = displayWidth * devicePixelRatio;
    canvas.height = displayHeight * devicePixelRatio;
    
    // Configurar el tamaño CSS (visual)
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // Escalar el contexto para compensar el pixel ratio
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Configuración de renderizado optimizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    console.log(`Canvas configurado con pixel ratio: ${devicePixelRatio}`);
  }, []);

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

  // 🎮 Estado del juego optimizado - VELOCIDAD AUMENTADA
  const [gameState, setGameState] = useState({
    playerX: 1.5,
    playerY: 1.5,
    targetX: 1.5,
    targetY: 1.5,
    isMoving: false,
    moveSpeed: 0.25, // ⚡ AUMENTADO de 0.12 a 0.25
    cellSize: 35,
    cameraX: 0,
    cameraY: 0
  });

  // 🗺️ Estado del sistema de exploración
  const [explorationState, setExplorationState] = useState({
    showingPath: true,
    pathToGoal: [] as {x: number, y: number}[],
    goalPosition: {x: 0, y: 0},
    exploredCells: new Set<string>(),
    discoveredCells: new Set<string>(),
    visionRadius: 2.5,
    pathAnimationProgress: 0,
    pathCameraIndex: 0,
    gamePhase: 'showing-path' as 'showing-path' | 'exploring' | 'completed'
  });

  // 🎮 Control de teclas optimizado con useRef
  const keysPressed = useRef({
    up: false,
    down: false,
    left: false,
    right: false
  });


const loadOptimizedImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // ✨ Configuraciones importantes para calidad
    img.crossOrigin = 'anonymous'; // Si cargas desde otro dominio
    
    img.onload = () => {
      // Verificar que la imagen tenga buen tamaño
      console.log(`Imagen cargada: ${src}, Tamaño: ${img.naturalWidth}x${img.naturalHeight}`);
      resolve(img);
    };
    
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

  // 🗺️ Encontrar camino - optimizado
  const findPathToGoal = useCallback((startX: number, startY: number, goalX: number, goalY: number): {x: number, y: number}[] => {
    if (!map.length) return [];
    
    const visited = new Set<string>();
    const queue: {x: number, y: number, path: {x: number, y: number}[]}[] = [
      {x: startX, y: startY, path: [{x: startX, y: startY}]}
    ];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (current.x === goalX && current.y === goalY) {
        return current.path;
      }
      
      // Solo 4 direcciones para optimizar
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
            path: [...current.path, {x: newX, y: newY}]
          });
        }
      }
    }
    
    return [];
  }, [map]);

  // 🎯 Encontrar posición para la meta - optimizado
  const findGoalPosition = useCallback((): {x: number, y: number} => {
    if (!map.length) return {x: 1, y: 1};
    
    const possibleGoals: {x: number, y: number}[] = [];
    const playerGridX = Math.floor(gameState.playerX);
    const playerGridY = Math.floor(gameState.playerY);
    
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] === 0) {
          const distance = Math.abs(x - playerGridX) + Math.abs(y - playerGridY);
          if (distance > 8) {
            possibleGoals.push({x, y});
          }
        }
      }
    }
    
    return possibleGoals[Math.floor(Math.random() * possibleGoals.length)] || {x: 1, y: 1};
  }, [map, gameState.playerX, gameState.playerY]);

  // 🔍 Verificar si una celda debe ser visible
  const isCellVisible = useCallback((x: number, y: number): boolean => {
    if (explorationState.gamePhase === 'showing-path') return true;
    
    // En fase de exploración, solo mostrar celdas descubiertas
    const cellKey = `${x},${y}`;
    return explorationState.discoveredCells.has(cellKey);
  }, [explorationState.gamePhase, explorationState.discoveredCells]);

// 🎨 Función de dibujo optimizada - CON SOPORTE PARA IMÁGENES DE TODOS LOS ELEMENTOS
const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  const { playerX, playerY, cellSize, cameraX, cameraY } = gameState;
  
  // ✨ Configurar renderizado de alta calidad al inicio de cada frame
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Limpiar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 🌈 Fondo simple
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#98FB98');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!map.length) return;

  // 🏗️ Dibujar laberinto optimizado con posiciones redondeadas
  const startX = Math.max(0, Math.floor((cameraX - canvas.width/2) / cellSize) - 1);
  const endX = Math.min(map[0].length, Math.ceil((cameraX + canvas.width/2) / cellSize) + 1);
  const startY = Math.max(0, Math.floor((cameraY - canvas.height/2) / cellSize) - 1);
  const endY = Math.min(map.length, Math.ceil((cameraY + canvas.height/2) / cellSize) + 1);

  // Durante exploración, dibujar fondo negro para áreas no descubiertas
  if (explorationState.gamePhase === 'exploring') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      // ✨ REDONDEAR posiciones para evitar blur de sub-píxeles
      const screenX = Math.round(x * cellSize - cameraX + canvas.width / 2);
      const screenY = Math.round(y * cellSize - cameraY + canvas.height / 2);
      const roundedCellSize = Math.round(cellSize);
      
      const cell = map[y][x];
      const cellVisible = isCellVisible(x, y);
      
      if (!cellVisible && explorationState.gamePhase === 'exploring') continue;
      
      if (cell === 0) {
        // 🌸 Suelo optimizado
        if (floorImage && floorImage.complete && floorImage.naturalWidth > 0) {
          ctx.drawImage(floorImage, screenX, screenY, roundedCellSize, roundedCellSize);
          if ((x + y) % 3 === 0 && floorAlternativeImage) {
            ctx.drawImage(floorAlternativeImage, screenX, screenY, roundedCellSize, roundedCellSize);
          }
        } else {
          // Fallback
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        }
        
      } else if (cell === 1) {
        // 🌳 Paredes optimizadas
        if (wallImage && wallImage.complete && wallImage.naturalWidth > 0) {
          ctx.drawImage(wallImage, screenX, screenY, roundedCellSize, roundedCellSize);
          if ((x + y) % 3 === 0 && alternativeWall) {
            ctx.drawImage(alternativeWall, screenX, screenY, roundedCellSize, roundedCellSize);
          }
        } else {
          // Fallback
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        }
        
      } else if (cell === 2) {
        // 🎁 Regalos optimizados
        if (floorImage && floorImage.complete) {
          ctx.drawImage(floorImage, screenX, screenY, roundedCellSize, roundedCellSize);
        } else {
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        }
        
        if (giftImage && giftImage.complete && giftImage.naturalWidth > 0) {
          const giftSize = Math.round(cellSize - 8);
          const giftOffset = Math.round(4);
          ctx.drawImage(giftImage, screenX + giftOffset, screenY + giftOffset, giftSize, giftSize);
        }
        
      } else if (cell === 3) {
        // 🏰 Castillo optimizado
        if (floorImage && floorImage.complete) {
          ctx.drawImage(floorImage, screenX, screenY, roundedCellSize, roundedCellSize);
        } else {
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        }
        
        // Aura del castillo
        const time = Date.now() * 0.003;
        const pulse = Math.sin(time) * 0.1 + 0.9;
        ctx.fillStyle = `rgba(255, 215, 0, ${0.3 * pulse})`;
        ctx.beginPath();
        ctx.arc(screenX + cellSize/2, screenY + cellSize/2, cellSize/2 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        if (castleImage && castleImage.complete && castleImage.naturalWidth > 0) {
          const castleSize = Math.round(cellSize - 4);
          const castleOffset = Math.round(2);
          ctx.drawImage(castleImage, screenX + castleOffset, screenY + castleOffset, castleSize, castleSize);
        }
      }
    }
  }

  // 🗺️ Camino durante demostración - ANIMACIÓN MÁS SUAVE
  if (explorationState.gamePhase === 'showing-path' && explorationState.pathToGoal.length > 0) {
    const pathProgress = Math.min(explorationState.pathAnimationProgress, explorationState.pathToGoal.length);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([12, 6]);
    ctx.lineDashOffset = -Date.now() * 0.005;
    
    ctx.beginPath();
    
    // ✨ INTERPOLACIÓN SUAVE entre puntos del camino
    for (let i = 0; i < Math.floor(pathProgress) - 1 && i < explorationState.pathToGoal.length - 1; i++) {
      const current = explorationState.pathToGoal[i];
      const next = explorationState.pathToGoal[i + 1];
      
      const currentScreenX = current.x * cellSize - cameraX + canvas.width / 2 + cellSize/2;
      const currentScreenY = current.y * cellSize - cameraY + canvas.height / 2 + cellSize/2;
      const nextScreenX = next.x * cellSize - cameraX + canvas.width / 2 + cellSize/2;
      const nextScreenY = next.y * cellSize - cameraY + canvas.height / 2 + cellSize/2;
      
      if (i === 0) ctx.moveTo(currentScreenX, currentScreenY);
      ctx.lineTo(nextScreenX, nextScreenY);
    }
    
    // ✨ Punto animado para mostrar progreso
    if (Math.floor(pathProgress) < explorationState.pathToGoal.length) {
      const currentIndex = Math.floor(pathProgress);
      const progress = pathProgress - currentIndex;
      
      if (currentIndex < explorationState.pathToGoal.length - 1) {
        const current = explorationState.pathToGoal[currentIndex];
        const next = explorationState.pathToGoal[currentIndex + 1];
        
        const currentScreenX = current.x * cellSize - cameraX + canvas.width / 2 + cellSize/2;
        const currentScreenY = current.y * cellSize - cameraY + canvas.height / 2 + cellSize/2;
        const nextScreenX = next.x * cellSize - cameraX + canvas.width / 2 + cellSize/2;
        const nextScreenY = next.y * cellSize - cameraY + canvas.height / 2 + cellSize/2;
        
        const interpolatedX = currentScreenX + (nextScreenX - currentScreenX) * progress;
        const interpolatedY = currentScreenY + (nextScreenY - currentScreenY) * progress;
        
        ctx.lineTo(interpolatedX, interpolatedY);
      }
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    // ✨ Punto brillante que se mueve por el camino
    if (Math.floor(pathProgress) < explorationState.pathToGoal.length) {
      const currentIndex = Math.floor(pathProgress);
      const progress = pathProgress - currentIndex;
      
      if (currentIndex < explorationState.pathToGoal.length - 1) {
        const current = explorationState.pathToGoal[currentIndex];
        const next = explorationState.pathToGoal[currentIndex + 1];
        
        const currentScreenX = current.x * cellSize - cameraX + canvas.width / 2 + cellSize/2;
        const currentScreenY = current.y * cellSize - cameraY + canvas.height / 2 + cellSize/2;
        const nextScreenX = next.x * cellSize - cameraX + canvas.width / 2 + cellSize/2;
        const nextScreenY = next.y * cellSize - cameraY + canvas.height / 2 + cellSize/2;
        
        const interpolatedX = currentScreenX + (nextScreenX - currentScreenX) * progress;
        const interpolatedY = currentScreenY + (nextScreenY - currentScreenY) * progress;
        
        // Punto brillante animado
        const glowTime = Date.now() * 0.01;
        const glowSize = 8 + Math.sin(glowTime) * 3;
        
        ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
        ctx.beginPath();
        ctx.arc(interpolatedX, interpolatedY, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(interpolatedX, interpolatedY, glowSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const screenPlayerX = Math.round(playerX * cellSize - cameraX + canvas.width / 2);
  const screenPlayerY = Math.round(playerY * cellSize - cameraY + canvas.height / 2);
  
  if (playerImage && playerImage.complete && playerImage.naturalWidth > 0) {
    const size = Math.round(cellSize - 6);
    ctx.save();
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.drawImage(
      playerImage,
      Math.round(screenPlayerX - size/2),
      Math.round(screenPlayerY - size/2),
      size,
      size
    );
    
    ctx.restore();
  } else {
    // Fallback
    ctx.fillStyle = '#FF69B4';
    ctx.font = `${cellSize * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👧', screenPlayerX, screenPlayerY);
  }
}, [gameState, explorationState, map, isCellVisible, playerImage, floorImage, wallImage, giftImage, castleImage]);

  // 🎮 Lógica de movimiento optimizada
  const handleMovementInput = useCallback(() => {
    if (activePregunta || gameState.isMoving || explorationState.gamePhase !== 'exploring') return;
    
    const keys = keysPressed.current;
    let deltaX = 0;
    let deltaY = 0;
    
    if (keys.up) deltaY = -1;
    if (keys.down) deltaY = 1;
    if (keys.left) deltaX = -1;
    if (keys.right) deltaX = 1;
    
    // Permitir diagonal
    if (keys.up && keys.left) { deltaX = -1; deltaY = -1; }
    if (keys.up && keys.right) { deltaX = 1; deltaY = -1; }
    if (keys.down && keys.left) { deltaX = -1; deltaY = 1; }
    if (keys.down && keys.right) { deltaX = 1; deltaY = 1; }
    
    if (deltaX === 0 && deltaY === 0) return;
    
    const currentGridX = Math.floor(gameState.playerX);
    const currentGridY = Math.floor(gameState.playerY);
    const newX = currentGridX + deltaX;
    const newY = currentGridY + deltaY;
    
    // Verificar límites
    if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return;
    if (map[newY][newX] === 1) return;
    
    // Movimiento suave
    setGameState(prev => ({
      ...prev,
      targetX: newX + 0.5,
      targetY: newY + 0.5,
      isMoving: true
    }));
  }, [activePregunta, gameState.isMoving, gameState.playerX, gameState.playerY, map, explorationState.gamePhase]);

  // 🎮 Update game optimizado
  const updateGame = useCallback((deltaTime: number) => {
    if (!map.length) return;
    
    // Verificar victoria - ahora con tipo 3
    const playerGridX = Math.floor(gameState.playerX);
    const playerGridY = Math.floor(gameState.playerY);
    
    if (map[playerGridY] && map[playerGridY][playerGridX] === 3 &&
        explorationState.gamePhase === 'exploring') {
      setExplorationState(prev => ({ ...prev, gamePhase: 'completed' }));
      return;
    }
    
    // Movimiento del jugador
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
        
        // Verificar casilla especial (tipo 2)
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
    
    // Actualizar exploración - pintar conforme descubres
    if (explorationState.gamePhase === 'exploring') {
      const newDiscovered = new Set(explorationState.discoveredCells);
      for (let dy = -Math.ceil(explorationState.visionRadius); dy <= Math.ceil(explorationState.visionRadius); dy++) {
        for (let dx = -Math.ceil(explorationState.visionRadius); dx <= Math.ceil(explorationState.visionRadius); dx++) {
          const x = Math.floor(gameState.playerX) + dx;
          const y = Math.floor(gameState.playerY) + dy;
          if (x >= 0 && x < map[0].length && y >= 0 && y < map.length) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= explorationState.visionRadius) {
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
    
    // Cámara que sigue el recorrido durante demostración - MÁS SUAVE
    if (explorationState.gamePhase === 'showing-path' && explorationState.pathToGoal.length > 1) {
      const currentPathIndex = Math.min(
        Math.floor(explorationState.pathAnimationProgress), 
        explorationState.pathToGoal.length - 1
      );
      
      if (currentPathIndex >= 0 && currentPathIndex < explorationState.pathToGoal.length - 1) {
        const current = explorationState.pathToGoal[currentPathIndex];
        const next = explorationState.pathToGoal[currentPathIndex + 1];
        const progress = explorationState.pathAnimationProgress - currentPathIndex;
        
        // ✨ Interpolación suave entre puntos del camino para la cámara
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
      // Cámara suave siguiendo al jugador durante exploración
      const targetCameraX = gameState.playerX * gameState.cellSize;
      const targetCameraY = gameState.playerY * gameState.cellSize;
      
      setGameState(prev => ({
        ...prev,
        cameraX: prev.cameraX + (targetCameraX - prev.cameraX) * 0.1,
        cameraY: prev.cameraY + (targetCameraY - prev.cameraY) * 0.1
      }));
    }
    
    // Animación del camino - MÁS SUAVE
    if (explorationState.gamePhase === 'showing-path') {
      setExplorationState(prev => {
        const newProgress = prev.pathAnimationProgress + 0.08; // ✨ REDUCIDO de 0.15 a 0.08 para más suavidad
        if (newProgress >= prev.pathToGoal.length + 30) {
          return { ...prev, gamePhase: 'exploring', pathAnimationProgress: newProgress };
        }
        return { ...prev, pathAnimationProgress: newProgress };
      });
    }
  }, [map, gameState, explorationState, handleMovementInput]);

  // 🎯 Función para mostrar pregunta
  const shootQuestion = useCallback(() => {
    if (preguntas.length === 0) return;
    const randomIndex = Math.floor(Math.random() * preguntas.length);
    setActivePregunta(preguntas[randomIndex]);
  }, [preguntas]);

  // 🎮 Game loop optimizado
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

  // ⌨️ Event listeners optimizados
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

useEffect(() => {
  setupHighDPICanvas();
}, [setupHighDPICanvas]);


  // 🏗️ Inicialización
  useEffect(() => {

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

    // Generar laberinto
    const width = 30;
    const height = 40;
    const maze = new ROT.Map.DividedMaze(width, height);

    const newMap: number[][] = [];
    maze.create((x, y, wall) => {
      if (!newMap[y]) newMap[y] = [];
      newMap[y][x] = wall ? 1 : (Math.random() < 0.08 ? 2 : 0);
    });
    
    setMap(newMap);

    // Encontrar posición inicial
    let startX = 1.5, startY = 1.5;
    for (let y = 0; y < newMap.length; y++) {
      for (let x = 0; x < newMap[0].length; x++) {
        if (newMap[y][x] === 0) {
          startX = x + 0.5;
          startY = y + 0.5;
          break;
        }
      }
    }

    setGameState(prev => ({
      ...prev,
      playerX: startX,
      playerY: startY,
      targetX: startX,
      targetY: startY
    }));
    
  }, [Id]);

  useEffect(() => {
  // Cargar imagen del jugador
  loadOptimizedImage('/Imagenes/Kirbypx.webp')
    .then(setPlayerImage)
    .catch(() => console.log('Player image not found, using fallback'));
    
  // Cargar imagen del suelo
  loadOptimizedImage('/Imagenes/Suelo.webp')
    .then(setFloorImage)
    .catch(() => console.log('Floor image not found, using fallback'));

  // Cargar imagen del suelo
  loadOptimizedImage('')
    .then(setAlternativeFloorImage)
    .catch(() => console.log('Floor image not found, using fallback'));

  // Cargar imagen del suelo
  loadOptimizedImage('')
    .then(setAlternativeWall)
    .catch(() => console.log('Floor image not found, using fallback'));
    
  // Cargar imagen de pared
  loadOptimizedImage('/Imagenes/Pared.webp')
    .then(setWallImage)
    .catch(() => console.log('Wall image not found, using fallback'));
    
  // Cargar imagen de regalo
  loadOptimizedImage('/Imagenes/Cofre.webp')
    .then(setGiftImage)
    .catch(() => console.log('Gift image not found, using fallback'));
    
  // Cargar imagen de castillo
  loadOptimizedImage('/Imagenes/Portal.webp')
    .then(setCastleImage)
    .catch(() => console.log('Castle image not found, using fallback'));
}, []);
  // Configurar meta cuando el mapa esté listo
  useEffect(() => {
    if (map.length > 0 && gameState.playerX > 0 && explorationState.goalPosition.x === 0) {
      const goalPos = findGoalPosition();
      
      // Establecer el castillo como tipo 3 en una copia del mapa (SOLO UNA VEZ)
      const newMap = map.map(row => [...row]);
      newMap[goalPos.y][goalPos.x] = 3;
      setMap(newMap);
      
      const path = findPathToGoal(
        Math.floor(gameState.playerX), 
        Math.floor(gameState.playerY), 
        goalPos.x, 
        goalPos.y
      );
      
      setExplorationState(prev => ({
        ...prev,
        goalPosition: goalPos,
        pathToGoal: path,
        pathAnimationProgress: 0,
        // Inicializar las celdas descubiertas con el área inicial del jugador
        discoveredCells: new Set([
          `${Math.floor(gameState.playerX)},${Math.floor(gameState.playerY)}`
        ])
      }));

      // Inicializar cámara en la posición del jugador
      setGameState(prev => ({
        ...prev,
        cameraX: prev.playerX * prev.cellSize,
        cameraY: prev.playerY * prev.cellSize
      }));
    }
  }, [map.length, gameState.playerX, gameState.playerY, explorationState.goalPosition.x, findGoalPosition, findPathToGoal]);

  // Game loop
  useEffect(() => {
    if (map.length > 0) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [map, gameLoop]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '2.5rem',
        textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
        margin: '10px 0 20px 0',
        fontFamily: 'Comic Sans MS, cursive'
      }}>
        🌟 ¡Aventura Mágica! 🌟
      </h1>

<canvas
  ref={canvasRef}
  width={900}
  height={650}
  style={{
    border: '5px solid #fff',
    borderRadius: '20px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
    background: '#87CEEB',
    imageRendering: 'auto' // ✨ Esta es la línea clave para imágenes nítidas
  }}
/>
      
      <div style={{ 
        marginTop: '20px', 
        color: 'white', 
        textAlign: 'center',
        fontFamily: 'Comic Sans MS, cursive',
        fontSize: '1.2rem'
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

      {activePregunta && (
        <KidsShootQuestion
          pregunta={activePregunta}
          onClose={() => setActivePregunta(null)}
        />
      )}
    </div>
  );
};

export default MazeGameCanvas;