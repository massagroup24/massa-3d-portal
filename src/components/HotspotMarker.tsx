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
  const isDraggingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPosRef.current) return;
    const dist = Math.hypot(e.clientX - startPosRef.current.x, e.clientY - startPosRef.current.y);
    if (dist > 14) {
      isDraggingRef.current = true;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDraggingRef.current) {
      onClick();
    }
    startPosRef.current = null;
    isDraggingRef.current = false;
  };

  return (
    <Html position={hotspot.position} center zIndexRange={[100, 0]}>
      <button 
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        className="group relative flex flex-col items-center justify-center cursor-pointer pointer-events-auto touch-manipulation select-none p-3 -m-3 outline-none focus:outline-none"
        title={hotspot.label || 'Moverse a este ambiente'}
      >
        {/* Botón flotante arquitectónico con efecto glow */}
        <div 
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/80 backdrop-blur-xl border-2 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-115 active:scale-95"
          style={{
            borderColor: brandColor,
            boxShadow: `0 0 20px ${brandColor}70`
          }}
        >
          <Navigation 
            className="w-5 h-5 -rotate-45 drop-shadow-md text-white transition-colors" 
          />
        </div>
        
        {/* Etiqueta adaptativa bajo el botón */}
        {hotspot.label && (
          <div className="mt-1.5 transition-all duration-300 pointer-events-none z-20">
            <div 
              className="bg-black/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap border shadow-2xl tracking-wide max-w-[150px] sm:max-w-none truncate"
              style={{ 
                borderColor: `${brandColor}80`,
                boxShadow: '0 4px 15px rgba(0,0,0,0.85)'
              }}
            >
              {hotspot.label}
            </div>
          </div>
        )}
        
        {/* Anillo de pulso sutil personalizado con el color de marca */}
        <div 
          className="absolute top-3 w-11 h-11 sm:w-12 sm:h-12 rounded-full animate-ping opacity-35 pointer-events-none" 
          style={{
            borderColor: brandColor,
            borderWidth: 1.5,
            borderStyle: 'solid'
          }}
        />
      </button>
    </Html>
  );
}
