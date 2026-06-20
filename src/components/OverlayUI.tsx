import { useState, useEffect } from 'react';
import { Map, ChevronLeft } from 'lucide-react';
import { Room } from '../data/tourData';

interface OverlayUIProps {
  currentRoom: Room;
  rooms: Record<string, Room>;
  minimapImage: string;
  onNavigate: (roomId: string) => void;
  onBackToHome?: () => void;
}

export function OverlayUI({ currentRoom, rooms, minimapImage, onNavigate, onBackToHome }: OverlayUIProps) {
  const [showIndicator, setShowIndicator] = useState(true);

  // Hide the indicator after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(false), 4000);
    return () => clearTimeout(timer);
  }, [currentRoom.id]);

  return (
    <div className="w-full h-full flex flex-col justify-between p-6">
      
      {/* Top Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col gap-4">
          {onBackToHome && (
            <button 
              onClick={onBackToHome}
              className="flex items-center gap-2 text-white/70 hover:text-white bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 w-fit shadow-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a Proyectos
            </button>
          )}

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 max-w-sm shadow-2xl text-white">
            <h1 className="text-3xl font-light tracking-wide mb-2">{currentRoom.name}</h1>
            <p className="text-white/70 text-sm leading-relaxed">{currentRoom.description}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-white/20">
            <img 
              src="/MASSA_REBRANDING.png" 
              alt="MASSA" 
              className="h-6 md:h-8 object-contain"
              onError={(e) => { e.currentTarget.src = '/MASSA_REBRANDING_PROFILE_REDES_ENTREGABLE_2023_001.png' }}
            />
          </div>
        </div>
      </header>

      {/* Center Indicator */}
      {showIndicator && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-soft">
          <div className="bg-black/40 backdrop-blur-md text-white/90 px-6 py-3 rounded-full border border-white/20 shadow-2xl flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="font-medium tracking-wide">Arrastra para mirar</span>
          </div>
        </div>
      )}

      {/* Bottom Minimap (Plano de Planta) */}
      <footer className="flex justify-between items-end pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white/90 font-medium mb-1 px-1">
            <Map className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">Plano del Proyecto</span>
          </div>
          
          <div className="relative w-96 h-72 bg-white/5 rounded-lg overflow-hidden border border-white/10 group flex items-center justify-center">
            {/* Contenedor ajustado exactamente al tamaño de la imagen */}
            <div className="relative h-full flex-shrink-0">
              {/* Imagen del plano */}
              <img 
                src={minimapImage} 
                alt="Plano del proyecto" 
                className="h-full w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              
              {/* Mensaje de fallback */}
              <div className="absolute inset-0 flex items-center justify-center -z-10 text-white/30 text-xs text-center px-4">
                Pega tu 'plano.png' en public
              </div>

              {/* Minimap Dots */}
              {Object.values(rooms).map((room) => {
                const isCurrent = currentRoom.id === room.id;
                return (
                  <div
                    key={room.id}
                    className="absolute group/dot z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${room.minimapPosition.x}%`, top: `${room.minimapPosition.y}%` }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(room.id);
                      }}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 shadow-lg ${
                        isCurrent 
                          ? 'bg-lime-500 border-lime-400 scale-125 shadow-[0_0_10px_rgba(132,204,22,0.8)]' 
                          : 'bg-black/50 border-white/70 hover:bg-white hover:scale-110'
                      }`}
                    />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-xs text-white font-medium whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl">
                      {room.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
