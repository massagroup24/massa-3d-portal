import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { Hotspot } from '../data/tourData';
import { Navigation } from 'lucide-react';

interface HotspotMarkerProps {
  hotspot: Hotspot;
  onClick: () => void;
  brandColor?: string;
}

export function HotspotMarker({ hotspot, onClick, brandColor = '#9CD01A' }: HotspotMarkerProps) {
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const dist = Math.hypot(dx, dy);
    const duration = Date.now() - pointerStartRef.current.time;
    pointerStartRef.current = null;

    // Solo activar si fue un tap/clic intencional y no un arrastre de rotación (< 12px y < 600ms)
    if (dist < 12 && duration < 600) {
      onClick();
    }
  };

  return (
    <Html position={hotspot.position} center>
      <button 
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="group relative flex flex-col items-center justify-center cursor-pointer pointer-events-auto touch-manipulation select-none p-2 -m-2 outline-none focus:outline-none"
        title={hotspot.label || 'Moverse a este ambiente'}
      >
        {/* Botón flotante arquitectónico con efecto glow */}
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 sm:bg-white/10 backdrop-blur-md border flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25 active:scale-90"
          style={{
            borderColor: 'rgba(255,255,255,0.4)',
            boxShadow: `0 0 20px ${brandColor}40`
          }}
        >
          <Navigation 
            className="w-4 h-4 sm:w-5 sm:h-5 -rotate-45 drop-shadow-md text-white transition-colors" 
          />
        </div>
        
        {/* Etiqueta adaptativa con tipografía pulida */}
        {hotspot.label && (
          <div className="absolute top-11 sm:top-14 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
            <div 
              className="bg-black/90 backdrop-blur-md text-white px-2.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap border shadow-xl shadow-black/60 tracking-wide max-w-[140px] sm:max-w-none truncate"
              style={{ borderColor: `${brandColor}66` }}
            >
              {hotspot.label}
            </div>
          </div>
        )}
        
        {/* Anillo de pulso sutil personalizado con el color de marca */}
        <div 
          className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full animate-ping opacity-30 pointer-events-none" 
          style={{
            borderColor: brandColor,
            borderWidth: 1,
            borderStyle: 'solid'
          }}
        />
      </button>
    </Html>
  );
}
