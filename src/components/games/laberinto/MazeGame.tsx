import React, { useEffect, useState, useRef, useCallback } from "react";
import ROT from "rot-js";

// Mock del componente KidsShootQuestion
const KidsShootQuestion: React.FC<{ 
  pregunta: PreguntaObj; 
  onClose: () => void 
}> = ({ pregunta, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    boxSizing: 'border-box'
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '20px',
      textAlign: 'center',
      maxWidth: '90%',
      maxHeight: '90%',
      overflow: 'auto',
      fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem'
    }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>{pregunta.Pregunta}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {[pregunta.Respuesta1, pregunta.Respuesta2, pregunta.Respuesta3].map((respuesta: string, index: number) => (
          <button
            key={index}
            onClick={() => {
              if (respuesta === pregunta.Correcta) {
                alert('¡Correcto! 🎉');
              } else {
                alert('¡Inténtalo de nuevo! 💪');
              }
              onClose();
            }}
            style={{
              padding: '15px 20px',
              fontSize: window.innerWidth < 768 ? '1rem' : '1.1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            {respuesta}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer'
        }}
      >
        Cerrar
      </button>
    </div>
  </div>
);

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
}

interface ScreenInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isPortrait: boolean;
}

interface GameState {
  playerX: number;
  playerY: number;
  targetX: number;
  targetY: number;
  isMoving: boolean;
  moveSpeed: number;
  cellSize: number;
  cameraX: number;
  cameraY: number;
}

interface ExplorationState {
  showingPath: boolean;
  pathToGoal: {x: number, y: number}[];
  goalPosition: {x: number, y: number};
  exploredCells: Set<string>;
  discoveredCells: Set<string>;
  visionRadius: number;
  pathAnimationProgress: number;
  pathCameraIndex: number;
  gamePhase: 'showing-path' | 'exploring' | 'completed';
}

interface KeysPressed {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

interface TouchStart {
  x: number;
  y: number;
}

interface CanvasSize {
  width: number;
  height: number;
  cellSize: number;
}

const MazeGameCanvas: React.FC<IdentificadorCuento> = ({ Id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const touchStartRef = useRef<TouchStart>({ x: 0, y: 0 });
  
  // 📱 Detección ultra simple de móviles
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>(() => {
    const detectMobile = (): boolean => {
      if (typeof window === 'undefined') return false;
      
      // Detección muy simple
      return window.innerWidth <= 768 && 'ontouchstart' in window;
    };
    
    return {
      width: typeof window !== 'undefined' ? window.innerWidth : 900,
      height: typeof window !== 'undefined' ? window.innerHeight : 650,
      isMobile: detectMobile(),
      isPortrait: typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
    };
  });
  
  // 🎮 Configuración del canvas con mejor centrado
  const getCanvasSize = useCallback((): CanvasSize => {
    const { width, height, isMobile, isPortrait } = screenInfo;
    
    if (isMobile) {
      const padding = 20;
      const controlsSpace = 200;
      const headerSpace = 80;
      
      const maxWidth = width - (padding * 2);
      const maxHeight = height - controlsSpace - headerSpace;
      
      // Calcular tamaño óptimo manteniendo proporción
      const optimalSize = Math.min(maxWidth, maxHeight);
      const finalWidth = Math.min(optimalSize, 400);
      const finalHeight = Math.min(optimalSize, 400);
      
      return {
        width: finalWidth,
        height: finalHeight,
        cellSize: Math.max(15, Math.min(finalWidth / 20, finalHeight / 20))
      };
    } else {
      // En escritorio, tamaño fijo centrado
      return {
        width: Math.min(800, width - 100),
        height: Math.min(600, height - 250),
        cellSize: 25
      };
    }
  }, [screenInfo]);

  const setupResponsiveCanvas = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = getCanvasSize();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
  }, [getCanvasSize]);

  const [map, setMap] = useState<number[][]>([]);
  const [preguntas, setPreguntas] = useState<PreguntaObj[]>([]);
  const [activePregunta, setActivePregunta] = useState<PreguntaObj | null>(null);

  // 🎮 Estado del juego
  const [gameState, setGameState] = useState<GameState>({
    playerX: 1.5,
    playerY: 1.5,
    targetX: 1.5,
    targetY: 1.5,
    isMoving: false,
    moveSpeed: 0.25,
    cellSize: 20,
    cameraX: 0,
    cameraY: 0
  });

  // 🗺️ Estado del sistema de exploración
  const [explorationState, setExplorationState] = useState<ExplorationState>({
    showingPath: true,
    pathToGoal: [],
    goalPosition: { x: 0, y: 0 },
    exploredCells: new Set<string>(),
    discoveredCells: new Set<string>(),
    visionRadius: 2.5,
    pathAnimationProgress: 0,
    pathCameraIndex: 0,
    gamePhase: 'showing-path'
  });

  // 🎮 Control de teclas y touch
  const keysPressed = useRef<KeysPressed>({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // 📱 Actualizar información de pantalla con detección ultra simple
  useEffect(() => {
    const updateScreenInfo = (): void => {
      const detectMobile = (): boolean => {
        return window.innerWidth <= 768 && 'ontouchstart' in window;
      };
      
      const newScreenInfo: ScreenInfo = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: detectMobile(),
        isPortrait: window.innerHeight > window.innerWidth
      };
      
      console.log('Mobile detection:', newScreenInfo.isMobile, 'Width:', newScreenInfo.width);
      setScreenInfo(newScreenInfo);
      
      setGameState(prev => ({
        ...prev,
        moveSpeed: newScreenInfo.isMobile ? 0.3 : 0.25
      }));
      
      setExplorationState(prev => ({
        ...prev,
        visionRadius: newScreenInfo.isMobile ? 2 : 2.5
      }));
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateScreenInfo, 100);
    });
    
    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  // 🎮 Funciones del juego
  const findPathToGoal = useCallback((startX: number, startY: number, goalX: number, goalY: number): {x: number, y: number}[] => {
    if (!map.length) return [];
    
    const visited = new Set<string>();
    const queue: {x: number, y: number, path: {x: number, y: number}[]}[] = [
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
      
      const directions: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      
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

  const findGoalPosition = useCallback((): {x: number, y: number} => {
    if (!map.length) return { x: 1, y: 1 };
    
    const possibleGoals: {x: number, y: number}[] = [];
    const playerGridX = Math.floor(gameState.playerX);
    const playerGridY = Math.floor(gameState.playerY);
    
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] === 0) {
          const distance = Math.abs(x - playerGridX) + Math.abs(y - playerGridY);
          if (distance > (screenInfo.isMobile ? 6 : 8)) {
            possibleGoals.push({ x, y });
          }
        }
      }
    }
    
    return possibleGoals[Math.floor(Math.random() * possibleGoals.length)] || { x: 1, y: 1 };
  }, [map, gameState.playerX, gameState.playerY, screenInfo.isMobile]);

  const isCellVisible = useCallback((x: number, y: number): boolean => {
    if (explorationState.gamePhase === 'showing-path') return true;
    
    const cellKey = `${x},${y}`;
    return explorationState.discoveredCells.has(cellKey);
  }, [explorationState.gamePhase, explorationState.discoveredCells]);

  // 🎨 Función de dibujo con sistema de cámara híbrido para ambas fases
// 🎨 Función de dibujo con sistema de cámara híbrido para ambas fases
  const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void => {
    const { playerX, playerY, cellSize } = gameState;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Usar el tamaño real del canvas sin escalar
    const actualWidth = canvas.width / (window.devicePixelRatio || 1);
    const actualHeight = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, actualWidth, actualHeight);
    
    // Fondo gradient
    const gradient = ctx.createLinearGradient(0, 0, actualWidth, actualHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, actualWidth, actualHeight);

    if (!map.length) return;

    const canvasCenterX = actualWidth / 2;
    const canvasCenterY = actualHeight / 2;
    
    // SISTEMA DE CÁMARA SIMPLIFICADO
    let cameraX, cameraY;
    
    if (explorationState.gamePhase === 'showing-path' && explorationState.pathToGoal.length > 0) {
      // Durante demostración: seguir el camino animado
      const pathIndex = Math.min(
        Math.floor(explorationState.pathAnimationProgress),
        explorationState.pathToGoal.length - 1
      );
      
      if (pathIndex < explorationState.pathToGoal.length - 1) {
        const current = explorationState.pathToGoal[pathIndex];
        const next = explorationState.pathToGoal[pathIndex + 1];
        const progress = explorationState.pathAnimationProgress - pathIndex;
        
        cameraX = current.x + (next.x - current.x) * progress + 0.5;
        cameraY = current.y + (next.y - current.y) * progress + 0.5;
      } else {
        const lastPoint = explorationState.pathToGoal[pathIndex];
        cameraX = lastPoint.x + 0.5;
        cameraY = lastPoint.y + 0.5;
      }
    } else {
      // Durante exploración: centrar en el jugador
      cameraX = playerX;
      cameraY = playerY;
    }
    
    // Calcular offset para centrar la cámara
    const offsetX = canvasCenterX - (cameraX * cellSize);
    const offsetY = canvasCenterY - (cameraY * cellSize);
    
    // Rango de celdas visible
    const visibleRange = screenInfo.isMobile ? 8 : 15;
    const startX = Math.max(0, Math.floor(cameraX - visibleRange));
    const endX = Math.min(map[0].length, Math.ceil(cameraX + visibleRange));
    const startY = Math.max(0, Math.floor(cameraY - visibleRange));
    const endY = Math.min(map.length, Math.ceil(cameraY + visibleRange));

    // Fondo negro para áreas no exploradas solo durante exploración
    if (explorationState.gamePhase === 'exploring') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Dibujar celdas
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const screenX = Math.round(x * cellSize + offsetX);
        const screenY = Math.round(y * cellSize + offsetY);
        const roundedCellSize = Math.round(cellSize);
        
        const cell = map[y][x];
        const cellVisible = isCellVisible(x, y);
        
        if (!cellVisible && explorationState.gamePhase === 'exploring') continue;
        
        if (cell === 0) {
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
          ctx.strokeStyle = '#7FDD7F';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX, screenY, roundedCellSize, roundedCellSize);
        } else if (cell === 1) {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
          ctx.fillStyle = '#654321';
          ctx.fillRect(screenX + 2, screenY + 2, roundedCellSize - 2, roundedCellSize - 2);
        } else if (cell === 2) {
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
          
          ctx.fillStyle = '#FFD700';
          const giftSize = Math.round(cellSize * 0.7);
          const giftOffset = Math.round((cellSize - giftSize) / 2);
          ctx.fillRect(screenX + giftOffset, screenY + giftOffset, giftSize, giftSize);
          
          ctx.fillStyle = '#FFFF99';
          const innerSize = Math.round(giftSize * 0.6);
          const innerOffset = Math.round((cellSize - innerSize) / 2);
          ctx.fillRect(screenX + innerOffset, screenY + innerOffset, innerSize, innerSize);
        } else if (cell === 3) {
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
          
          const time = Date.now() * 0.003;
          const pulse = Math.sin(time) * 0.2 + 0.8;
          ctx.fillStyle = `rgba(255, 215, 0, ${0.5 * pulse})`;
          ctx.beginPath();
          ctx.arc(screenX + cellSize/2, screenY + cellSize/2, cellSize * 0.8 * pulse, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#8A2BE2';
          const castleSize = Math.round(cellSize * 0.8);
          const castleOffset = Math.round((cellSize - castleSize) / 2);
          ctx.fillRect(screenX + castleOffset, screenY + castleOffset, castleSize, castleSize);
        }
      }
    }

    // Camino durante demostración
    if (explorationState.gamePhase === 'showing-path' && explorationState.pathToGoal.length > 0) {
      const pathProgress = Math.min(explorationState.pathAnimationProgress, explorationState.pathToGoal.length);
      
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = screenInfo.isMobile ? 8 : 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([12, 6]);
      ctx.lineDashOffset = -Date.now() * 0.005;
      
      ctx.beginPath();
      
      for (let i = 0; i < Math.floor(pathProgress) - 1 && i < explorationState.pathToGoal.length - 1; i++) {
        const current = explorationState.pathToGoal[i];
        const next = explorationState.pathToGoal[i + 1];
        
        const currentScreenX = current.x * cellSize + offsetX + cellSize/2;
        const currentScreenY = current.y * cellSize + offsetY + cellSize/2;
        const nextScreenX = next.x * cellSize + offsetX + cellSize/2;
        const nextScreenY = next.y * cellSize + offsetY + cellSize/2;
        
        if (i === 0) ctx.moveTo(currentScreenX, currentScreenY);
        ctx.lineTo(nextScreenX, nextScreenY);
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Dibujar jugador según la fase
    let playerScreenX, playerScreenY;
    
    if (explorationState.gamePhase === 'showing-path') {
      // Durante demostración: posición relativa a la cámara
      playerScreenX = Math.round(playerX * cellSize + offsetX);
      playerScreenY = Math.round(playerY * cellSize + offsetY);
    } else {
      // Durante exploración: siempre centrado
      playerScreenX = canvasCenterX;
      playerScreenY = canvasCenterY;
    }
    
    // Sombra del jugador
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(playerScreenX + 2, playerScreenY + 2, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Jugador
    ctx.fillStyle = '#FF69B4';
    ctx.font = `${cellSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👧', playerScreenX, playerScreenY);

    // Debug info
    if (screenInfo.isMobile) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(5, 5, 200, 100);
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(`Mobile: ${screenInfo.isMobile}`, 10, 20);
      ctx.fillText(`Phase: ${explorationState.gamePhase}`, 10, 35);
      ctx.fillText(`Player: ${playerX.toFixed(1)}, ${playerY.toFixed(1)}`, 10, 50);
      ctx.fillText(`Camera: ${cameraX.toFixed(0)}, ${cameraY.toFixed(0)}`, 10, 65);
      ctx.fillText(`Screen: ${playerScreenX}, ${playerScreenY}`, 10, 80);
      ctx.fillText(`Width: ${canvas.width}x${canvas.height}`, 10, 95);
    }
  }, [gameState, explorationState, map, isCellVisible, screenInfo.isMobile]);

  // 🎮 Manejo de movimiento
  const handleMovementInput = useCallback((): void => {
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

  // 🎮 Update game
  const updateGame = useCallback((deltaTime: number): void => {
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
    
    // Actualizar exploración
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
    
    // Sistema de cámara mejorado
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
      // Cámara suave siguiendo al jugador - centrado mejorado
      const targetCameraX = gameState.playerX * gameState.cellSize;
      const targetCameraY = gameState.playerY * gameState.cellSize;
      
      // Velocidad de seguimiento más suave
      const lerpSpeed = screenInfo.isMobile ? 0.15 : 0.08;
      
      setGameState(prev => ({
        ...prev,
        cameraX: prev.cameraX + (targetCameraX - prev.cameraX) * lerpSpeed,
        cameraY: prev.cameraY + (targetCameraY - prev.cameraY) * lerpSpeed
      }));
    }
    
    // Animación del camino
    if (explorationState.gamePhase === 'showing-path') {
      setExplorationState(prev => {
        const newProgress = prev.pathAnimationProgress + (screenInfo.isMobile ? 0.08 : 0.06);
        if (newProgress >= prev.pathToGoal.length + (screenInfo.isMobile ? 15 : 25)) {
          return { ...prev, gamePhase: 'exploring', pathAnimationProgress: newProgress };
        }
        return { ...prev, pathAnimationProgress: newProgress };
      });
    }
  }, [map, gameState, explorationState, handleMovementInput, screenInfo.isMobile]);

  const shootQuestion = useCallback((): void => {
    if (preguntas.length === 0) return;
    const randomIndex = Math.floor(Math.random() * preguntas.length);
    setActivePregunta(preguntas[randomIndex]);
  }, [preguntas]);

  // 🎮 Game loop
  const gameLoop = useCallback((currentTime: number): void => {
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

  // 📱 Touch handlers mejorados
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    const minSwipeDistance = 40; // Distancia mínima aumentada
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          keysPressed.current.right = true;
          setTimeout(() => keysPressed.current.right = false, 150);
        } else {
          keysPressed.current.left = true;
          setTimeout(() => keysPressed.current.left = false, 150);
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          keysPressed.current.down = true;
          setTimeout(() => keysPressed.current.down = false, 150);
        } else {
          keysPressed.current.up = true;
          setTimeout(() => keysPressed.current.up = false, 150);
        }
      }
    }
  }, []);

  // ⌨️ Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
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

    const handleKeyUp = (e: KeyboardEvent): void => {
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
    setupResponsiveCanvas();
  }, [setupResponsiveCanvas, screenInfo]);

  // Inicialización del juego
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

    // Generar laberinto adaptado al dispositivo
    const width = screenInfo.isMobile ? 17 : 25;
    const height = screenInfo.isMobile ? 22 : 30;
    
    const maze = new ROT.Map.DividedMaze(width, height);

    const newMap: number[][] = [];
    maze.create((x: number, y: number, wall: number) => {
      if (!newMap[y]) newMap[y] = [];
      newMap[y][x] = wall ? 1 : (Math.random() < 0.04 ? 2 : 0);
    });
    
    setMap(newMap);

    // Encontrar posición inicial válida
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

    const canvasSize = getCanvasSize();
    setGameState(prev => ({
      ...prev,
      playerX: startX,
      playerY: startY,
      targetX: startX,
      targetY: startY,
      cellSize: canvasSize.cellSize,
      moveSpeed: screenInfo.isMobile ? 0.3 : 0.25,
      cameraX: startX * canvasSize.cellSize,
      cameraY: startY * canvasSize.cellSize
    }));
    
  }, [Id, screenInfo.isMobile, getCanvasSize]);

  // Configurar meta cuando el mapa esté listo
  useEffect(() => {
    if (map.length > 0 && gameState.playerX > 0 && explorationState.goalPosition.x === 0) {
      const goalPos = findGoalPosition();
      
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
        discoveredCells: new Set([
          `${Math.floor(gameState.playerX)},${Math.floor(gameState.playerY)}`
        ])
      }));
    }
  }, [map.length, gameState.playerX, gameState.playerY, explorationState.goalPosition.x, findGoalPosition, findPathToGoal]);

  // Game loop principal
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

  // 🎮 Controles táctiles con detección ultra simple
  const TouchControls: React.FC = () => {
    console.log('TouchControls render - isMobile:', screenInfo.isMobile, 'phase:', explorationState.gamePhase);
    
    // Mostrar SIEMPRE en pantallas pequeñas con touch (para testing)
    const shouldShow = screenInfo.isMobile;
    
    if (!shouldShow) {
      return (
        <div style={{
          position: 'fixed',
          top: '50px',
          left: '10px',
          background: 'red',
          color: 'white',
          padding: '5px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          No mobile: {screenInfo.width}px
        </div>
      );
    }

    const buttonStyle: React.CSSProperties = {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: 'rgba(76, 175, 80, 0.9)',
      border: '2px solid #ffffff',
      fontSize: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      userSelect: 'none',
      touchAction: 'manipulation',
      boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
      transition: 'all 0.1s ease',
      position: 'relative',
      zIndex: 1002,
      color: 'white',
      fontWeight: 'bold'
    };

    const handleTouchButton = (direction: keyof KeysPressed): void => {
      keysPressed.current[direction] = true;
      setTimeout(() => {
        keysPressed.current[direction] = false;
      }, 180);
    };

    const handleButtonEvent = (direction: keyof KeysPressed) => (e: any): void => {
      e.preventDefault();
      e.stopPropagation();
      handleTouchButton(direction);
      
      // Efecto visual
      const target = e.currentTarget;
      target.style.transform = 'scale(0.9)';
      target.style.backgroundColor = 'rgba(255, 193, 7, 0.9)';
      setTimeout(() => {
        target.style.transform = 'scale(1)';
        target.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
      }, 120);
    };

    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '20px',
        padding: '15px',
        zIndex: 1001
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <button 
            style={buttonStyle}
            onTouchStart={handleButtonEvent('up')}
            onMouseDown={handleButtonEvent('up')}
          >
            ⬆
          </button>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              style={buttonStyle}
              onTouchStart={handleButtonEvent('left')}
              onMouseDown={handleButtonEvent('left')}
            >
              ⬅
            </button>
            
            <div style={{ 
              width: '60px', 
              height: '60px',
              borderRadius: '50%',
              border: '2px dashed rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              👧
            </div>
            
            <button 
              style={buttonStyle}
              onTouchStart={handleButtonEvent('right')}
              onMouseDown={handleButtonEvent('right')}
            >
              ➡
            </button>
          </div>
          
          <button 
            style={buttonStyle}
            onTouchStart={handleButtonEvent('down')}
            onMouseDown={handleButtonEvent('down')}
          >
            ⬇
          </button>
        </div>
      </div>
    );
  };

  const canvasSize = getCanvasSize();

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxSizing: 'border-box',
      overflow: 'hidden',
      zIndex: 50
    }}>
      {/* Título más pequeño para pantalla completa */}
      <h1 style={{
        color: 'white',
        fontSize: screenInfo.isMobile ? '1.5rem' : '2rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        margin: screenInfo.isMobile ? '10px 0' : '15px 0',
        fontFamily: 'Comic Sans MS, cursive',
        textAlign: 'center',
        position: screenInfo.isMobile ? 'absolute' : 'relative',
        top: screenInfo.isMobile ? '10px' : 'auto',
        left: screenInfo.isMobile ? '50%' : 'auto',
        transform: screenInfo.isMobile ? 'translateX(-50%)' : 'none',
        zIndex: 100
      }}>
        🌟 ¡Aventura Mágica! 🌟
      </h1>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          border: screenInfo.isMobile ? '2px solid #fff' : '3px solid #fff',
          borderRadius: '10px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
          background: '#87CEEB',
          imageRendering: 'auto',
          touchAction: 'none',
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'block'
        }}
      />
      
      {/* Controles táctiles para móviles */}
      <TouchControls />
      
      {/* Instrucciones más compactas */}
      <div style={{ 
        position: screenInfo.isMobile ? 'absolute' : 'relative',
        bottom: screenInfo.isMobile ? '10px' : 'auto',
        marginTop: screenInfo.isMobile ? '0' : '10px',
        color: 'white', 
        textAlign: 'center',
        fontFamily: 'Comic Sans MS, cursive',
        fontSize: screenInfo.isMobile ? '0.7rem' : '0.9rem',
        maxWidth: screenInfo.isMobile ? '80%' : '90%',
        lineHeight: '1.2',
        zIndex: 100
      }}>
        {!screenInfo.isMobile && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            padding: '8px 12px', 
            borderRadius: '8px',
            marginBottom: '5px'
          }}>
            🎮 Flechas o WASD • 🎁 Regalos = Preguntas • 🏰 Encuentra el castillo
          </div>
        )}
        
        {explorationState.gamePhase === 'completed' && (
          <div style={{
            background: 'rgba(255, 215, 0, 0.9)',
            color: '#333',
            padding: '10px 15px',
            borderRadius: '8px',
            fontSize: screenInfo.isMobile ? '0.9rem' : '1.1rem',
            fontWeight: 'bold',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200
          }}>
            🎉 ¡FELICIDADES! 🎉<br/>
            ¡Aventura completada!
          </div>
        )}
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