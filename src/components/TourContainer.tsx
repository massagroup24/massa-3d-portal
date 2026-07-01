import { useState, useEffect, useRef } from 'react';
import { Room } from '../data/tourData';
import { TourViewer } from './TourViewer';
import { OverlayUI } from './OverlayUI';

interface TourContainerProps {
  currentRoom: Room;
  rooms: Record<string, Room>;
  minimapImage: string;
  onNavigate: (roomId: string, position?: [number, number, number]) => void;
  onBackToHome?: () => void;
}

export function TourContainer({
  currentRoom,
  rooms,
  minimapImage,
  onNavigate,
  onBackToHome,
}: TourContainerProps) {
  const [isIdle, setIsIdle] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'zooming' | 'fading-in'>('idle');
  const [targetPos, setTargetPos] = useState<[number, number, number] | null>(null);
  
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpieza general de temporizadores al desmontar el componente
  useEffect(() => {
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Gestión de rotación automática suave por inactividad (5 segundos)
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    if (transitionPhase === 'idle') {
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 5000);
    }
  };

  useEffect(() => {
    resetIdleTimer();
    const events = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown'];
    const handleActivity = () => resetIdleTimer();
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [transitionPhase]);

  // Manejo de navegación con transición cinemática (Warp / Zoom-Fade)
  const handleNavigate = (roomId: string, position?: [number, number, number]) => {
    if (transitionPhase !== 'idle' || !currentRoom || roomId === currentRoom.id) return;
    if (!rooms[roomId]) return;

    resetIdleTimer();

    // 1. Iniciar fase de zoom cinemático
    setTargetPos(position || null);
    setTransitionPhase('zooming');

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);

    // 2. A los 450ms, cuando el zoom termina, cambiamos de habitación
    transitionTimeoutRef.current = setTimeout(() => {
      onNavigate(roomId, position);
      setTransitionPhase('fading-in');

      // 3. A los 350ms de fade-in, devolvemos el control total al usuario
      transitionTimeoutRef.current = setTimeout(() => {
        setTransitionPhase('idle');
        setTargetPos(null);
      }, 350);
    }, 450);
  };

  if (!currentRoom) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <TourViewer 
          room={currentRoom} 
          onNavigate={handleNavigate}
          isTransitioning={transitionPhase === 'zooming'}
          targetPosition={targetPos}
          isIdle={isIdle && transitionPhase === 'idle'}
        />
      </div>

      {/* Cinematic Transition Glass Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-400 z-10 ${
          transitionPhase === 'zooming' 
            ? 'opacity-100 backdrop-blur-sm bg-black/40 scale-102' 
            : transitionPhase === 'fading-in'
            ? 'opacity-30 backdrop-blur-none bg-black/15 scale-100'
            : 'opacity-0 backdrop-blur-none bg-black/0 scale-100'
        }`}
      />

      {/* Indicador elegante de Modo Cinemático / Auto-Rotación */}
      <div 
        className={`absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-15 pointer-events-none transition-all duration-700 ${
          isIdle && transitionPhase === 'idle'
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 text-white/90 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-light tracking-wide shadow-2xl flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
          <span>Vista Cinemática 360</span>
          <span className="text-white/40 text-[10px] uppercase tracking-wider hidden sm:inline">• Mueve el ratón o toca para explorar</span>
        </div>
      </div>

      {/* 2D UI Overlay Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <OverlayUI 
          currentRoom={currentRoom} 
          rooms={rooms}
          minimapImage={minimapImage}
          onNavigate={handleNavigate} 
          onBackToHome={onBackToHome}
        />
      </div>
    </div>
  );
}
