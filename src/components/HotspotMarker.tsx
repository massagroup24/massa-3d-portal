import { Html } from '@react-three/drei';
import { Hotspot } from '../data/tourData';
import { Navigation } from 'lucide-react';

interface HotspotMarkerProps {
  hotspot: Hotspot;
  onClick: () => void;
}

export function HotspotMarker({ hotspot, onClick }: HotspotMarkerProps) {
  return (
    <Html position={hotspot.position} center>
      <button 
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
      >
        {/* The glowing icon button */}
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
          <Navigation className="w-5 h-5 -rotate-45 drop-shadow-md" />
        </div>
        
        {/* The label tooltip */}
        <div className="absolute top-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap border border-white/10 shadow-xl">
            {hotspot.label}
          </div>
        </div>
        
        {/* Soft pulse ring */}
        <div className="absolute w-12 h-12 rounded-full border border-white/50 animate-ping opacity-20 pointer-events-none" />
      </button>
    </Html>
  );
}
