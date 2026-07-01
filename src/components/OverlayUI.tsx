import { useState, useEffect } from 'react';
import { Map, ChevronLeft, ChevronDown } from 'lucide-react';
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
  // En dispositivos móviles (< 768px) el plano inicia minimizado para que la inmersión 360 sea total
  const [isMinimapOpen, setIsMinimapOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  // Hide the indicator after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(false), 4000);
    return () => clearTimeout(timer);
  }, [currentRoom.id]);

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-6">
      
      {/* Top Header Responsivo */}
      <header className="flex justify-between items-start gap-2 pointer-events-auto">
        <div className="flex flex-col gap-2 sm:gap-4 max-w-[65vw] sm:max-w-sm">
          {onBackToHome && (
            <button 
              onClick={onBackToHome}
              className="flex items-center gap-1.5 text-white/80 hover:text-white bg-black/60 backdrop-blur-xl border border-white/15 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all hover:bg-white/10 w-fit shadow-xl"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Volver</span>
            </button>
          )}

          <div className="bg-black/60 backdrop-blur-xl border border-white/15 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xl text-white">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-light tracking-wide mb-1 sm:mb-2">{currentRoom.name}</h1>
            {currentRoom.description && (
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">{currentRoom.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 flex-shrink-0">
          <div className="bg-white/95 backdrop-blur-xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-white/20">
            <img 
              src="/MASSA_REBRANDING.png" 
              alt="MASSA" 
              className="h-5 sm:h-6 md:h-8 object-contain"
              onError={(e) => { e.currentTarget.src = '/MASSA_REBRANDING_PROFILE_REDES_ENTREGABLE_2023_001.png' }}
            />
          </div>
        </div>
      </header>

      {/* Center Indicator */}
      {showIndicator && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-soft z-10">
          <div className="bg-black/60 backdrop-blur-md text-white/90 px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 sm:gap-3 text-xs sm:text-base">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="font-medium tracking-wide">Arrastra para mirar alrededor</span>
          </div>
        </div>
      )}

      {/* Bottom Footer: Plano de Planta y Selector Rápido */}
      <footer className="flex flex-col sm:flex-row justify-between items-end gap-3 pointer-events-auto">
        {isMinimapOpen ? (
          <div className="bg-black/75 backdrop-blur-xl border border-white/20 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3 max-w-[94vw] sm:max-w-none transition-all">
            <div className="flex items-center justify-between text-white/90 font-medium px-1">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-lime-400" />
                <span className="text-xs uppercase tracking-wider font-semibold">Plano del Proyecto</span>
              </div>
              <button 
                onClick={() => setIsMinimapOpen(false)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 font-medium"
              >
                <span>Ocultar</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="relative w-[85vw] max-w-[340px] h-[210px] sm:w-96 sm:h-72 bg-white/5 rounded-xl overflow-hidden border border-white/10 group flex items-center justify-center">
              <div className="relative h-full flex-shrink-0">
                <img 
                  src={minimapImage} 
                  alt="Plano del proyecto" 
                  className="h-full w-auto object-contain opacity-85 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center -z-10 text-white/30 text-xs text-center px-4">
                  Pega tu 'plano.png' en public
                </div>

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
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-300 shadow-lg ${
                          isCurrent 
                            ? 'bg-lime-500 border-lime-400 scale-125 shadow-[0_0_10px_rgba(132,204,22,0.8)]' 
                            : 'bg-black/60 border-white hover:bg-white hover:scale-110'
                        }`}
                      />
                      <div className="absolute bottom-full mb-1 sm:mb-2 left-1/2 -translate-x-1/2 px-2 py-0.5 sm:py-1 bg-black/90 backdrop-blur-md border border-white/20 rounded text-[10px] sm:text-xs text-white font-medium whitespace-nowrap opacity-90 sm:opacity-0 sm:group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl z-20">
                        {room.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 max-w-full">
            <button 
              onClick={() => setIsMinimapOpen(true)}
              className="bg-black/75 backdrop-blur-xl border border-white/20 hover:border-lime-500/50 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 font-medium text-xs sm:text-sm transition-all hover:bg-black/90 group flex-shrink-0"
            >
              <Map className="w-4 h-4 text-lime-400 group-hover:scale-110 transition-transform" />
              <span>Ver Plano ({Object.keys(rooms).length})</span>
            </button>

            {/* Selector rápido de habitaciones en barra flotante */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[calc(100vw-150px)] sm:max-w-xl py-1 no-scrollbar">
              {Object.values(rooms).map((r) => {
                const isCurrent = currentRoom.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onNavigate(r.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                      isCurrent 
                        ? 'bg-lime-500 text-black border-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.5)] font-semibold' 
                        : 'bg-black/60 text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </footer>
      
    </div>
  );
}
