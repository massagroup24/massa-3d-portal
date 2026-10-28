import { useState, useEffect, useRef } from 'react';
import { Room } from '../data/tourData';
import { TourViewer } from './TourViewer';
import { OverlayUI } from './OverlayUI';
import { ArrowLeft, Rotate3d } from 'lucide-react';
import { EmptyState } from './ui/EmptyState';
import { ArchitecturalCadBackground } from './ui/ArchitecturalCadBackground';

interface TourContainerProps {
  currentRoom?: Room;
  rooms: Record<string, Room>;
  minimapImage: string;
  onNavigate: (roomId: string, position?: [number, number, number]) => void;
  onBackToHome?: () => void;
  tourEmbedUrl?: string;
  projectName?: string;
}

export function TourContainer({
  currentRoom,
  rooms,
  minimapImage,
  onNavigate,
  onBackToHome,
  tourEmbedUrl,
  projectName = 'Recorrido Virtual MASSA'
}: TourContainerProps) {
  const [isIdle, setIsIdle] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'zooming' | 'fading-in'>('idle');
  const [targetPos, setTargetPos] = useState<[number, number, number] | null>(null);
  
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Soporte directo para Recorrido 3D Externo / Gemelo Digital (Matterport / Spline / Kuula)
  if (tourEmbedUrl && tourEmbedUrl.trim()) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col">
        {/* Floating Topbar */}
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-[#0D0D0E]/85 backdrop-blur-2xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#9CD01A] text-white hover:text-black text-xs font-bold transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver</span>
              </button>
            )}
            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#9CD01A] animate-pulse" />
              <span className="text-xs font-black tracking-wider text-white uppercase">{projectName}</span>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#9CD01A]/30 text-[#9CD01A] text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Rotate3d className="w-3.5 h-3.5" />
              <span>GEMELO DIGITAL 3D</span>
            </span>
          </div>
        </div>

        {/* Embedded Iframe */}
        <iframe
          src={tourEmbedUrl}
          className="w-full h-full border-0"
          allow="fullscreen; xr-spatial-tracking; vr; gyroscope; accelerometer"
          title={projectName}
        />
      </div>
    );
  }

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

  // Habitación segura (si no hay ninguna pasada o seleccionada, usar la primera disponible)
  const safeRoom = currentRoom || Object.values(rooms)[0];

  // Si no hay ninguna habitación o no tiene imagen 360 configurada, mostrar Empty State de ultralujo
  if (!safeRoom || !safeRoom.imageUrl) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-[#08080A] flex flex-col items-center justify-center p-4 sm:p-6 text-white">
        <ArchitecturalCadBackground />
        
        {/* Topbar flotante para volver */}
        {onBackToHome && (
          <div className="absolute top-5 left-5 z-20">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-[#9CD01A] text-white hover:text-black border border-white/10 text-xs font-bold transition-all shadow-xl cursor-pointer active:scale-95 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Volver al Catálogo</span>
            </button>
          </div>
        )}

        <div className="relative z-10 max-w-lg w-full">
          <EmptyState
            variant="rooms"
            title="Recorrido 360° en Preparación"
            description={`Este proyecto (${projectName}) se encuentra actualmente en proceso de captura y renderizado panorámico 360°. Las tomas inmersivas estarán disponibles muy pronto.`}
            badge="DIGITAL TWIN • EN RENDERIZADO"
            primaryAction={
              onBackToHome
                ? {
                    label: 'Volver a Proyectos',
                    onClick: onBackToHome,
                    icon: <ArrowLeft className="w-4 h-4" />
                  }
                : undefined
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <TourViewer 
          room={safeRoom} 
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
          currentRoom={safeRoom} 
          rooms={rooms}
          minimapImage={minimapImage}
          onNavigate={handleNavigate} 
          onBackToHome={onBackToHome}
        />
      </div>
    </div>
  );
}
