import { useState, useEffect, useMemo, useRef } from 'react';
import { Map, ChevronLeft, ChevronDown, Layers, X, Info, Compass } from 'lucide-react';
import { Room } from '../data/tourData';

interface OverlayUIProps {
  currentRoom: Room;
  rooms: Record<string, Room>;
  minimapImage: string;
  floorPlans?: Record<string, string>;
  onNavigate: (roomId: string, position?: [number, number, number]) => void;
  onBackToHome?: () => void;
  brandLogo?: string;
  brandColor?: string;
  isGyroEnabled?: boolean;
  isGyroSupported?: boolean;
  onToggleGyro?: () => void;
}

export function OverlayUI({
  currentRoom,
  rooms,
  minimapImage,
  floorPlans,
  onNavigate,
  onBackToHome,
  brandLogo,
  brandColor = '#9CD01A',
  isGyroEnabled = false,
  isGyroSupported = false,
  onToggleGyro
}: OverlayUIProps) {
  const [showIndicator, setShowIndicator] = useState(true);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  // En móviles (< 768px) el plano inicia minimizado para inmersión panorámica total
  const [isMinimapOpen, setIsMinimapOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  const roomChipsRef = useRef<HTMLDivElement>(null);

  // Niveles detectados en las habitaciones o en floorPlans (ordenados: Piso 1, Piso 2, Piso 3)
  const availableFloors = useMemo(() => {
    const set = new Set<string>();
    if (floorPlans) {
      Object.keys(floorPlans).forEach(f => {
        if (f) set.add(f);
      });
    }
    Object.values(rooms || {}).forEach(r => {
      if (r.floorLevel) set.add(r.floorLevel);
    });
    // Resguardo directo para Hacienda F22
    if (currentRoom?.id?.includes('f22') || minimapImage?.includes('F22') || minimapImage?.includes('f22')) {
      set.add('Piso 1');
      set.add('Piso 2');
      set.add('Piso 3');
    }
    const orderMap: Record<string, number> = {
      'Piso 1': 1, 'Nivel 1': 1,
      'Piso 2': 2, 'Nivel 2': 2,
      'Piso 3': 3, 'Nivel 3': 3, 'Rooftop': 4
    };
    return Array.from(set).sort((a, b) => (orderMap[a] || 99) - (orderMap[b] || 99));
  }, [rooms, floorPlans, currentRoom?.id, minimapImage]);

  // Nivel activo en el minimapa (se sincroniza con la habitación actual)
  const [selectedFloor, setSelectedFloor] = useState<string>(() => currentRoom?.floorLevel || availableFloors[0] || 'Piso 1');

  useEffect(() => {
    if (currentRoom?.floorLevel) {
      setSelectedFloor(currentRoom.floorLevel);
    }
  }, [currentRoom?.id, currentRoom?.floorLevel]);

  // Desplazar automáticamente el carrusel horizontal para centrar el chip de la habitación activa
  useEffect(() => {
    if (!roomChipsRef.current || !currentRoom?.id) return;
    const activeChip = roomChipsRef.current.querySelector(`[data-room-id="${currentRoom.id}"]`) as HTMLElement;
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentRoom?.id]);

  // Imagen del plano axonométrico según piso seleccionado
  const activeMinimapImage = useMemo(() => {
    if (floorPlans && floorPlans[selectedFloor]) {
      return floorPlans[selectedFloor];
    }
    if (selectedFloor === 'Piso 1' || selectedFloor === 'Nivel 1') {
      return '/HACIENDA F22/360/PLANOS/P1-1.png';
    }
    if (selectedFloor === 'Piso 2' || selectedFloor === 'Nivel 2') {
      return '/HACIENDA F22/360/PLANOS/P1-2.png';
    }
    if (selectedFloor === 'Piso 3' || selectedFloor === 'Nivel 3' || selectedFloor === 'Rooftop') {
      return '/HACIENDA F22/360/PLANOS/P1-3.png';
    }
    if (currentRoom?.floorLevel === selectedFloor && currentRoom?.floorPlanImage) {
      return currentRoom.floorPlanImage;
    }
    const matchingRoom = Object.values(rooms || {}).find(r => r.floorLevel === selectedFloor && r.floorPlanImage);
    if (matchingRoom?.floorPlanImage) return matchingRoom.floorPlanImage;
    return minimapImage;
  }, [selectedFloor, currentRoom, rooms, minimapImage, floorPlans]);

  // Filtrado de habitaciones visibles en el plano activo
  const visibleRooms = useMemo(() => {
    if (availableFloors.length <= 1) return Object.values(rooms || {}).filter(Boolean);
    return Object.values(rooms || {}).filter(r => (r.floorLevel || 'Piso 1') === selectedFloor);
  }, [rooms, selectedFloor, availableFloors]);

  // Ocultar indicador central después de 3.5 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(false), 3500);
    return () => clearTimeout(timer);
  }, [currentRoom?.id]);

  if (!currentRoom) return null;

  const handleBack = onBackToHome || (() => { window.location.href = '/'; });
  const isAmho = brandColor === '#DFC47B' || currentRoom?.imageUrl?.includes('HACIENDA') || currentRoom?.id?.includes('f22');
  const resolvedLogo = brandLogo || (isAmho ? '/HACIENDA F22/LOGO AMHO.png' : '/MASSA_REBRANDING.png');

  return (
    <div
      style={{
        paddingTop: 'max(0.75rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
        paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
        paddingLeft: 'max(0.75rem, calc(env(safe-area-inset-left, 0px) + 0.25rem))',
        paddingRight: 'max(0.75rem, calc(env(safe-area-inset-right, 0px) + 0.25rem))',
      }}
      className="w-full h-full flex flex-col justify-between p-3 sm:p-6 select-none">
      
      {/* =========================================================================
          1. HEADER ADAPTATIVO:
             - En Celular (< 768px): Cápsula ultracompacta que no tapa la visual 360°
             - En Desktop (>= 768px): Tarjeta espaciosa de ultralujo
          ========================================================================= */}
      
      {/* Vista Móvil (< 768px) */}
      <header className="flex md:hidden items-center justify-between gap-2 pointer-events-auto w-full">
        <button 
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-xl border border-white/20 text-white text-xs font-bold active:scale-95 transition-all shadow-xl shrink-0 cursor-pointer"
          title="Regresar"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: brandColor }} />
          <span>Volver</span>
        </button>

        {/* Cápsula central interactiva de ambiente */}
        <button
          type="button"
          onClick={() => setShowMobileInfo(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 text-white text-xs font-medium max-w-[46vw] active:scale-95 transition-all shadow-xl cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: brandColor }} />
          <span className="truncate">{currentRoom.name}</span>
          <Info className="w-3.5 h-3.5 text-white/60 shrink-0 ml-0.5" />
        </button>

        {/* Lado derecho: Giroscopio (si está disponible) y Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleGyro && isGyroSupported && (
            <button
              type="button"
              onClick={onToggleGyro}
              className={`p-1.5 rounded-full border backdrop-blur-xl transition-all active:scale-90 shadow-xl cursor-pointer ${
                isGyroEnabled 
                  ? 'shadow-lg' 
                  : 'bg-black/80 border-white/20 text-white/70'
              }`}
              style={
                isGyroEnabled
                  ? {
                      backgroundColor: `${brandColor}33`,
                      borderColor: brandColor,
                      color: brandColor,
                      boxShadow: `0 0 12px ${brandColor}80`
                    }
                  : undefined
              }
              title={isGyroEnabled ? 'Desactivar Giroscopio' : 'Activar Giroscopio (Mover celular)'}
            >
              <Compass className="w-4 h-4" />
            </button>
          )}

          <div 
            className="backdrop-blur-xl px-2.5 py-1 rounded-full border shadow-md shrink-0 flex items-center justify-center"
            style={{
              backgroundColor: isAmho ? 'rgba(8, 8, 10, 0.85)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isAmho ? `${brandColor}55` : 'rgba(255, 255, 255, 0.2)',
              boxShadow: isAmho ? `0 0 15px ${brandColor}30` : undefined
            }}
          >
            <img 
              src={encodeURI(resolvedLogo)} 
              alt={isAmho ? "AMHO Construcciones" : "Logo"} 
              className="h-4 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      {/* Modal / Popover flotante de detalles en celular */}
      {showMobileInfo && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto md:hidden"
          onClick={() => setShowMobileInfo(false)}
        >
          <div 
            className="w-full max-w-xs bg-[#0E0E14]/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-2xl text-white flex flex-col gap-3 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              {currentRoom.floorLevel && (
                <span 
                  className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold"
                  style={{ color: brandColor }}
                >
                  {currentRoom.floorLevel}
                </span>
              )}
              <button 
                type="button" 
                onClick={() => setShowMobileInfo(false)} 
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <h2 className="text-xl font-light tracking-wide">{currentRoom.name}</h2>
            
            {currentRoom.description && (
              <p className="text-white/80 text-xs leading-relaxed">{currentRoom.description}</p>
            )}

            <button
              type="button"
              onClick={() => setShowMobileInfo(false)}
              className="mt-1 w-full py-2 rounded-xl text-center text-xs font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Vista Desktop (>= 768px) */}
      <header className="hidden md:flex justify-between items-start gap-4 pointer-events-auto">
        <div className="flex flex-col gap-3 max-w-sm">
          <button 
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-white bg-black/85 hover:bg-black border border-white/25 rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-2xl group w-fit cursor-pointer hover:scale-102 active:scale-98"
            style={{ borderColor: 'rgba(255,255,255,0.25)' }}
            title="Regresar al Menú / Portal Principal"
          >
            <ChevronLeft 
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" 
              style={{ color: brandColor }}
            />
            <span>Volver al Menú</span>
          </button>

          <div className="bg-black/65 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl text-white">
            {currentRoom.floorLevel && (
              <span 
                className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-1 font-semibold"
                style={{ color: brandColor }}
              >
                {currentRoom.floorLevel}
              </span>
            )}
            <h1 className="text-xl lg:text-2xl font-light tracking-wide mb-1.5">{currentRoom.name}</h1>
            {currentRoom.description && (
              <p className="text-white/70 text-xs leading-relaxed line-clamp-3">{currentRoom.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onToggleGyro && isGyroSupported && (
            <button
              type="button"
              onClick={onToggleGyro}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border backdrop-blur-xl transition-all shadow-xl cursor-pointer ${
                isGyroEnabled 
                  ? '' 
                  : 'bg-black/80 border-white/20 text-white/80 hover:text-white'
              }`}
              style={
                isGyroEnabled
                  ? {
                      backgroundColor: `${brandColor}33`,
                      borderColor: brandColor,
                      color: brandColor,
                      boxShadow: `0 0 15px ${brandColor}60`
                    }
                  : undefined
              }
              title={isGyroEnabled ? 'Desactivar Giroscopio' : 'Activar Giroscopio'}
            >
              <Compass className="w-4 h-4" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase">Giroscopio</span>
            </button>
          )}

          <div 
            className="backdrop-blur-xl px-3.5 py-2 rounded-2xl border shadow-xl flex items-center justify-center"
            style={{
              backgroundColor: isAmho ? 'rgba(8, 8, 10, 0.85)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isAmho ? `${brandColor}55` : 'rgba(255, 255, 255, 0.2)',
              boxShadow: isAmho ? `0 0 25px ${brandColor}35` : '0 0 20px rgba(255,255,255,0.15)'
            }}
          >
            <img 
              src={encodeURI(resolvedLogo)} 
              alt={isAmho ? "AMHO Construcciones" : "Logo"} 
              className="h-6 lg:h-7 object-contain"
            />
          </div>
        </div>
      </header>

      {/* Center Indicator */}
      {showIndicator && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-soft z-10">
          <div className="bg-black/70 backdrop-blur-md text-white/95 px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 text-xs sm:text-sm">
            <span className="w-2 h-2 rounded-full animate-ping shrink-0" style={{ backgroundColor: brandColor }} />
            <span className="font-medium tracking-wide">Arrastra con el dedo para explorar</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. PLANO ARQUITECTÓNICO & CONTROLES INFERIORES:
             - En Celular (< 768px): Bottom Sheet elegante desplegable + barra horizontal con scroll nativo
             - En Desktop (>= 768px): Visor de esquina integrado
          ========================================================================= */}

      {/* BOTTOM SHEET PARA CELULAR (< 768px) */}
      {isMinimapOpen && (
        <>
          {/* Backdrop para cerrar al tocar afuera */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsMinimapOpen(false)}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0C0C12]/95 backdrop-blur-2xl border-t border-white/20 rounded-t-3xl p-4 pb-[calc(env(safe-area-inset-bottom,16px)+12px)] flex flex-col gap-3 shadow-[0_-20px_50px_rgba(0,0,0,0.9)] max-h-[82vh] pointer-events-auto md:hidden animate-slide-up">
            {/* Tirador del Bottom Sheet */}
            <div className="w-12 h-1 rounded-full bg-white/30 mx-auto -mt-1 cursor-pointer" onClick={() => setIsMinimapOpen(false)} />

            {/* Cabecera del Plano */}
            <div className="flex items-center justify-between text-white px-1">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" style={{ color: brandColor }} />
                <span className="text-xs font-bold uppercase tracking-wider">Plano Arquitectónico</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMinimapOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 active:scale-90 transition-all cursor-pointer"
                title="Cerrar plano"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Pisos para Celulares (distribución equitativa sin saltos de línea) */}
            {availableFloors.length > 1 && (
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-full">
                {availableFloors.map((floor) => {
                  const isCurrentFloor = selectedFloor === floor;
                  const label = 
                    floor === 'Piso 1' ? 'P1 • Social' : 
                    floor === 'Piso 2' ? 'P2 • Suites' : 
                    floor === 'Piso 3' ? 'P3 • Sky' : floor;

                  return (
                    <button
                      key={floor}
                      type="button"
                      onClick={() => setSelectedFloor(floor)}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95"
                      style={
                        isCurrentFloor
                          ? { backgroundColor: brandColor, color: '#000000', boxShadow: `0 0 10px ${brandColor}66` }
                          : { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)' }
                      }
                    >
                      <Layers className="w-3 h-3" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Imagen del plano axonométrico en Celular */}
            <div className="relative bg-black/60 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center p-2 max-h-[44vh] shadow-inner">
              <div className="relative inline-block w-fit h-fit max-w-full max-h-[40vh]">
                <img 
                  src={activeMinimapImage} 
                  alt="Plano del proyecto" 
                  className="block max-w-full max-h-[40vh] w-auto h-auto object-contain opacity-95 rounded-lg mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />

                {visibleRooms.map((room) => {
                  const isCurrent = currentRoom?.id === room?.id;
                  return (
                    <div
                      key={room.id}
                      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${room.minimapPosition.x}%`, top: `${room.minimapPosition.y}%` }}
                    >
                      {/* Zona táctil de 38x38px para pulsación perfecta con el dedo */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(room.id);
                          setIsMinimapOpen(false); // Auto-cerrar al tocar un ambiente para entrar al 360
                        }}
                        className="w-10 h-10 flex items-center justify-center -m-3 cursor-pointer touch-manipulation active:scale-90"
                        title={room.name}
                      >
                        <span 
                          className="w-3.5 h-3.5 rounded-full border-2 transition-all shadow-lg"
                          style={
                            isCurrent
                              ? { backgroundColor: brandColor, borderColor: '#ffffff', transform: 'scale(1.3)', boxShadow: `0 0 12px ${brandColor}` }
                              : { backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#ffffff' }
                          }
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* PLANO DE ESQUINA EN DESKTOP (>= 768px) */}
      <footer className="flex flex-col sm:flex-row justify-between items-end gap-3 pointer-events-auto">
        {isMinimapOpen ? (
          <div className="hidden md:flex bg-black/85 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex-col gap-3 transition-all">
            <div className="flex items-center justify-between text-white/90 font-medium px-1">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" style={{ color: brandColor }} />
                <span className="text-xs uppercase tracking-wider font-semibold">Plano Arquitectónico</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsMinimapOpen(false)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Ocultar</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pestañas de niveles en Desktop */}
            {availableFloors.length > 1 && (
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                {availableFloors.map((floor) => {
                  const isCurrentFloor = selectedFloor === floor;
                  const label = 
                    floor === 'Piso 1' ? 'Piso 1 • Social' : 
                    floor === 'Piso 2' ? 'Piso 2 • Suites' : 
                    floor === 'Piso 3' ? 'Piso 3 • Sky Lounge' : floor;

                  return (
                    <button
                      key={floor}
                      type="button"
                      onClick={() => setSelectedFloor(floor)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                      style={
                        isCurrentFloor
                          ? { backgroundColor: brandColor, color: '#000000', boxShadow: `0 0 12px ${brandColor}55` }
                          : { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)' }
                      }
                    >
                      <Layers className="w-3 h-3" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="relative bg-black/60 rounded-xl overflow-hidden border border-white/10 group flex items-center justify-center max-w-[500px] max-h-[48vh] p-2 transition-all shadow-2xl">
              <div className="relative inline-block w-fit h-fit max-w-full max-h-[44vh]">
                <img 
                  src={activeMinimapImage} 
                  alt="Plano del proyecto" 
                  className="block max-w-full max-h-[44vh] w-auto h-auto object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 rounded-lg mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />

                {visibleRooms.map((room) => {
                  const isCurrent = currentRoom?.id === room?.id;
                  return (
                    <div
                      key={room.id}
                      className="absolute group/dot z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${room.minimapPosition.x}%`, top: `${room.minimapPosition.y}%` }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(room.id);
                        }}
                        className="w-4 h-4 rounded-full border-2 transition-all duration-300 shadow-lg cursor-pointer"
                        style={
                          isCurrent
                            ? { backgroundColor: brandColor, borderColor: '#ffffff', transform: 'scale(1.3)', boxShadow: `0 0 12px ${brandColor}` }
                            : { backgroundColor: 'rgba(0,0,0,0.6)', borderColor: '#ffffff' }
                        }
                      />
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black/90 backdrop-blur-md border border-white/20 rounded text-xs text-white font-medium whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl z-20">
                        {room.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* BARRA INFERIOR FLOTANTE (BOTÓN PLANO + CARRUSEL HORIZONTAL DE AMBIENTES) */}
        {(!isMinimapOpen || typeof window !== 'undefined' && window.innerWidth < 768) && (
          <div className="flex items-center gap-2 max-w-full w-full pointer-events-auto">
            <button 
              type="button"
              onClick={() => setIsMinimapOpen(true)}
              className="bg-black/85 backdrop-blur-xl border border-white/20 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-2xl flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm transition-all hover:bg-black/95 active:scale-95 group shrink-0 cursor-pointer"
            >
              <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" style={{ color: brandColor }} />
              <span>Plano ({Object.keys(rooms).length})</span>
            </button>

            {/* Selector rápido deslizable de ambientes con soporte táctil nativo */}
            <div 
              ref={roomChipsRef}
              className="flex items-center gap-1.5 overflow-x-auto w-full py-1 no-scrollbar touch-pan-x"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none', 
                WebkitOverflowScrolling: 'touch' 
              }}
            >
              {Object.values(rooms || {}).filter(Boolean).map((r) => {
                const isCurrent = currentRoom?.id === r?.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    data-room-id={r.id}
                    onClick={() => onNavigate(r.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 active:scale-95 touch-manipulation cursor-pointer"
                    style={
                      isCurrent
                        ? { 
                            backgroundColor: brandColor, 
                            color: '#000000', 
                            borderColor: brandColor, 
                            fontWeight: 700, 
                            boxShadow: `0 0 12px ${brandColor}66` 
                          }
                        : { 
                            backgroundColor: 'rgba(0,0,0,0.65)', 
                            color: 'rgba(255,255,255,0.85)', 
                            borderColor: 'rgba(255,255,255,0.15)' 
                          }
                    }
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
