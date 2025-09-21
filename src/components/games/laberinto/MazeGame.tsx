import React, { useEffect, useState, useRef, useCallback } from "react";
import * as ROT from "rot-js";
// Mock de ROT.js para el ejemplo
// const ROT = {
//   Map: {
//     DividedMaze: class {
//       constructor(private width: number, private height: number) {}
      
//       create(callback: (x: number, y: number, wall: number) => void): void {
//         // Generar un laberinto simple
//         for (let y = 0; y < this.height; y++) {
//           for (let x = 0; x < this.width; x++) {
//             let wall = 0;
            
//             // Bordes siempre son paredes
//             if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
//               wall = 1;
//             }
//             // Crear un patrón de laberinto simple
//             else if ((x % 2 === 0 && y % 2 === 0) || (x % 4 === 0 || y % 4 === 0)) {
//               wall = Math.random() < 0.3 ? 1 : 0;
//             }
            
//             callback(x, y, wall);
//           }
//         }
//       }
//     }
//   }
// };

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
  
  // 📱 Estado responsivo
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 900,
    height: typeof window !== 'undefined' ? window.innerHeight : 650,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isPortrait: typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  });
  
  // 🎮 Configuración del canvas adaptativa
  const getCanvasSize = useCallback((): CanvasSize => {
    const { width, height, isMobile, isPortrait } = screenInfo;
    
    if (isMobile) {
      // En móviles, usar casi toda la pantalla pero dejar espacio para controles
      const padding = 40;
      const controlsSpace = isPortrait ? 200 : 120;
      
      const maxWidth = width - padding;
      const maxHeight = height - controlsSpace;
      
      const finalWidth = Math.min(maxWidth, 400);
      const finalHeight = Math.min(maxHeight, 500);
      
      return {
        width: finalWidth,
        height: finalHeight,
        cellSize: Math.max(8, Math.min(finalWidth / 25, finalHeight / 30))
      };
    } else {
      // En escritorio, tamaño original
      return {
        width: Math.min(900, width - 40),
        height: Math.min(650, height - 200),
        cellSize: 20
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
    
    // Configurar resolución interna
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    
    // Configurar tamaño visual
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Escalar contexto
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
  }, [getCanvasSize]);

  const [map, setMap] = useState<number[][]>([]);
  const [preguntas, setPreguntas] = useState<PreguntaObj[]>([]);
  const [activePregunta, setActivePregunta] = useState<PreguntaObj | null>(null);

  // 🎮 Estado del juego optimizado para móvil
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

  // 📱 Detectar cambios de pantalla
  useEffect(() => {
    const updateScreenInfo = (): void => {
      const newScreenInfo: ScreenInfo = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isPortrait: window.innerHeight > window.innerWidth
      };
      
      setScreenInfo(newScreenInfo);
      
      // Actualizar velocidad y configuración según dispositivo
      setGameState(prev => ({
        ...prev,
        moveSpeed: newScreenInfo.isMobile ? 0.3 : 0.25
      }));
      
      setExplorationState(prev => ({
        ...prev,
        visionRadius: newScreenInfo.isMobile ? 2 : 2.5
      }));
    };

    // Llamar inmediatamente para configurar el estado inicial
    updateScreenInfo();

    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', () => {
      // Delay para orientationchange
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

  // 🎨 Función de dibujo adaptada para móvil
  const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void => {
    const { playerX, playerY, cellSize, cameraX, cameraY } = gameState;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!map.length) return;

    // Dibujar laberinto
    const visibleCells = screenInfo.isMobile ? 2 : 3;
    const startX = Math.max(0, Math.floor((cameraX - canvas.width/2) / cellSize) - visibleCells);
    const endX = Math.min(map[0].length, Math.ceil((cameraX + canvas.width/2) / cellSize) + visibleCells);
    const startY = Math.max(0, Math.floor((cameraY - canvas.height/2) / cellSize) - visibleCells);
    const endY = Math.min(map.length, Math.ceil((cameraY + canvas.height/2) / cellSize) + visibleCells);

    // Durante exploración, fondo negro para áreas no descubiertas
    if (explorationState.gamePhase === 'exploring') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const screenX = Math.round(x * cellSize - cameraX + canvas.width / 2);
        const screenY = Math.round(y * cellSize - cameraY + canvas.height / 2);
        const roundedCellSize = Math.round(cellSize);
        
        const cell = map[y][x];
        const cellVisible = isCellVisible(x, y);
        
        if (!cellVisible && explorationState.gamePhase === 'exploring') continue;
        
        if (cell === 0) {
          // Suelo
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        } else if (cell === 1) {
          // Paredes
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
        } else if (cell === 2) {
          // Regalos
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
          
          ctx.fillStyle = '#FFD700';
          const giftSize = Math.round(cellSize - 4);
          const giftOffset = Math.round(2);
          ctx.fillRect(screenX + giftOffset, screenY + giftOffset, giftSize, giftSize);
        } else if (cell === 3) {
          // Castillo
          ctx.fillStyle = '#90EE90';
          ctx.fillRect(screenX, screenY, roundedCellSize, roundedCellSize);
          
          // Aura del castillo
          const time = Date.now() * 0.003;
          const pulse = Math.sin(time) * 0.1 + 0.9;
          ctx.fillStyle = `rgba(255, 215, 0, ${0.3 * pulse})`;
          ctx.beginPath();
          ctx.arc(screenX + cellSize/2, screenY + cellSize/2, cellSize/2 * pulse, 0, Math.PI * 2);
          ctx.fill();
          
          // Castillo
          ctx.fillStyle = '#8A2BE2';
          const castleSize = Math.round(cellSize - 4);
          const castleOffset = Math.round(2);
          ctx.fillRect(screenX + castleOffset, screenY + castleOffset, castleSize, castleSize);
        }
      }
    }

    // Camino durante demostración
    if (explorationState.gamePhase === 'showing-path' && explorationState.pathToGoal.length > 0) {
      const pathProgress = Math.min(explorationState.pathAnimationProgress, explorationState.pathToGoal.length);
      
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = screenInfo.isMobile ? 4 : 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([8, 4]);
      ctx.lineDashOffset = -Date.now() * 0.005;
      
      ctx.beginPath();
      
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
      
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Jugador
    const screenPlayerX = Math.round(playerX * cellSize - cameraX + canvas.width / 2);
    const screenPlayerY = Math.round(playerY * cellSize - cameraY + canvas.height / 2);
    
    // Jugador con emoji
    ctx.fillStyle = '#FF69B4';
    ctx.font = `${cellSize * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👧', screenPlayerX, screenPlayerY);
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

  // 🎮 Update game
  const updateGame = useCallback((deltaTime: number): void => {
    if (!map.length) return;
    
    // Verificar victoria
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
    
    // Cámara
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
    
    // Animación del camino
    if (explorationState.gamePhase === 'showing-path') {
      setExplorationState(prev => {
        const newProgress = prev.pathAnimationProgress + (screenInfo.isMobile ? 0.1 : 0.08);
        if (newProgress >= prev.pathToGoal.length + (screenInfo.isMobile ? 20 : 30)) {
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

  // 📱 Touch handlers
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
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          keysPressed.current.right = true;
          setTimeout(() => keysPressed.current.right = false, 100);
        } else {
          keysPressed.current.left = true;
          setTimeout(() => keysPressed.current.left = false, 100);
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          keysPressed.current.down = true;
          setTimeout(() => keysPressed.current.down = false, 100);
        } else {
          keysPressed.current.up = true;
          setTimeout(() => keysPressed.current.up = false, 100);
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

  // Inicialización
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

    // Generar laberinto (más pequeño en móvil)
    const width = screenInfo.isMobile ? 20 : 30;
    const height = screenInfo.isMobile ? 25 : 40;
    const maze = new ROT.Map.DividedMaze(width, height);

    const newMap: number[][] = [];
    maze.create((x: number, y: number, wall: number) => {
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

    const canvasSize = getCanvasSize();
    setGameState(prev => ({
      ...prev,
      playerX: startX,
      playerY: startY,
      targetX: startX,
      targetY: startY,
      cellSize: canvasSize.cellSize,
      moveSpeed: screenInfo.isMobile ? 0.3 : 0.25
    }));
    
  }, [Id, screenInfo.isMobile, getCanvasSize]);

  // Configurar meta cuando el mapa esté listo
  useEffect(() => {
    if (map.length > 0 && gameState.playerX > 0 && explorationState.goalPosition.x === 0) {
      const goalPos = findGoalPosition();
      
      // Establecer el castillo como tipo 3 en una copia del mapa
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

  // 🎮 Componente de controles táctiles para móvil
  const TouchControls: React.FC = () => {
    if (!screenInfo.isMobile) return null;

    const buttonStyle: React.CSSProperties = {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: '3px solid #4CAF50',
      fontSize: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      userSelect: 'none',
      touchAction: 'manipulation',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      transition: 'all 0.1s ease'
    };

    const handleTouchButton = (direction: keyof KeysPressed): void => {
      keysPressed.current[direction] = true;
      setTimeout(() => keysPressed.current[direction] = false, 150);
    };

    const handleTouchButtonStart = (direction: keyof KeysPressed) => (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();
      handleTouchButton(direction);
      // Efecto visual
      const target = e.currentTarget;
      target.style.transform = 'scale(0.95)';
      target.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      setTimeout(() => {
        target.style.transform = 'scale(1)';
        target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      }, 100);
    };

    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'grid',
        gridTemplate: '"up" "left right" "down"',
        gap: '8px',
        gridTemplateColumns: '50px 50px 50px',
        gridTemplateRows: '50px 50px 50px',
        zIndex: 1000
      }}>
        <button 
          style={{...buttonStyle, gridArea: 'up', gridColumn: '2'}}
          onTouchStart={handleTouchButtonStart('up')}
          onMouseDown={handleTouchButtonStart('up')}
        >
          ⬆️
        </button>
        <button 
          style={{...buttonStyle, gridArea: 'left', gridColumn: '1', gridRow: '2'}}
          onTouchStart={handleTouchButtonStart('left')}
          onMouseDown={handleTouchButtonStart('left')}
        >
          ⬅️
        </button>
        <button 
          style={{...buttonStyle, gridArea: 'right', gridColumn: '3', gridRow: '2'}}
          onTouchStart={handleTouchButtonStart('right')}
          onMouseDown={handleTouchButtonStart('right')}
        >
          ➡️
        </button>
        <button 
          style={{...buttonStyle, gridArea: 'down', gridColumn: '2', gridRow: '3'}}
          onTouchStart={handleTouchButtonStart('down')}
          onMouseDown={handleTouchButtonStart('down')}
        >
          ⬇️
        </button>
      </div>
    );
  };

  const canvasSize = getCanvasSize();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'flex-start',
      padding: screenInfo.isMobile ? '10px' : '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      width: '100vw',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: screenInfo.isMobile ? '1.2rem' : '2.5rem',
        textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
        margin: screenInfo.isMobile ? '5px 0 10px 0' : '10px 0 20px 0',
        fontFamily: 'Comic Sans MS, cursive',
        textAlign: 'center'
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
          border: screenInfo.isMobile ? '3px solid #fff' : '5px solid #fff',
          borderRadius: screenInfo.isMobile ? '15px' : '20px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
          background: '#87CEEB',
          imageRendering: 'auto',
          touchAction: 'none',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
      
      {/* Controles táctiles para móvil */}
      <TouchControls />
      
      <div style={{ 
        marginTop: screenInfo.isMobile ? '10px' : '20px', 
        color: 'white', 
        textAlign: 'center',
        fontFamily: 'Comic Sans MS, cursive',
        fontSize: screenInfo.isMobile ? '0.8rem' : '1.2rem',
        maxWidth: '90%',
        lineHeight: '1.3'
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.2)', 
          padding: screenInfo.isMobile ? '8px' : '15px', 
          borderRadius: '15px',
          marginBottom: '10px'
        }}>
          {screenInfo.isMobile ? (
            <>
              <p style={{ margin: '3px 0' }}>📱 Desliza o usa los botones para moverte</p>
              <p style={{ margin: '3px 0' }}>🎁 Recoge regalos para preguntas</p>
              <p style={{ margin: '3px 0' }}>🏰 ¡Encuentra el castillo!</p>
            </>
          ) : (
            <>
              <p style={{ margin: '5px 0' }}>🎮 Usa las flechas ⬅️➡️⬆️⬇️ o WASD para moverte</p>
              <p style={{ margin: '5px 0' }}>🎁 Recoge los regalos mágicos para responder preguntas</p>
              <p style={{ margin: '5px 0' }}>🏰 ¡Encuentra el castillo mágico para ganar!</p>
            </>
          )}
        </div>
        
        {explorationState.gamePhase === 'completed' && (
          <div style={{
            background: 'rgba(255, 215, 0, 0.9)',
            color: '#333',
            padding: screenInfo.isMobile ? '15px' : '20px',
            borderRadius: '15px',
            fontSize: screenInfo.isMobile ? '1rem' : '1.5rem',
            fontWeight: 'bold'
          }}>
            🎉 ¡FELICIDADES! 🎉<br/>
            ¡Has completado la aventura!
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