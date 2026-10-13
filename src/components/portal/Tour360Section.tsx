import { useState } from 'react';
import { 
  Compass, 
  Maximize2, 
  MapPin, 
  ArrowRight, 
  Layers, 
  Play
} from 'lucide-react';
import { Room } from '../../data/tourData';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface Tour360SectionProps {
  projectName: string;
  rooms: Record<string, Room>;
  minimapImage: string;
  onLaunchTour: (initialRoomId?: string) => void;
}

export function Tour360Section({
  projectName,
  rooms,
  minimapImage,
  onLaunchTour
}: Tour360SectionProps) {
  const roomList = Object.values(rooms || {});
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomList[0]?.id || '');

  const activeRoom = rooms[selectedRoomId] || roomList[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#9CD01A]">
              Recorrido Inmersivo Equirectangular
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F5]">
            Recorrido 360° Interactivo
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Navega punto a punto por cada espacio y estancia de <span className="text-[#F5F5F5] font-medium">{projectName}</span>
          </p>
        </div>

        {/* Big Launch Tour CTA */}
        <Button
          variant="primary"
          onClick={() => onLaunchTour(activeRoom?.id)}
          className="gap-2 self-start md:self-auto shadow-[0_0_30px_rgba(156,208,26,0.35)]"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Iniciar Experiencia Inmersiva 360°</span>
        </Button>
      </div>

      {/* Hero Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Room Preview Hero (2 cols) */}
        <div className="lg:col-span-2">
          <GlassCard
            variant="card"
            glowColor="#9CD01A"
            className="p-0 overflow-hidden border-white/10 relative h-[480px] group flex flex-col"
          >
            {/* Background Panorama Preview */}
            <div className="relative w-full h-full overflow-hidden bg-black">
              {activeRoom?.imageUrl ? (
                <img
                  src={activeRoom.imageUrl}
                  alt={activeRoom.name}
                  className="w-full h-full object-cover transform duration-700 group-hover:scale-105 filter brightness-90"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  Sin imagen equirectangular
                </div>
              )}

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 pointer-events-none" />

              {/* Top Room Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 text-[#9CD01A] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
                  <span>360° HDR Equirectangular</span>
                </span>

                <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 text-white/80">
                  {roomList.length} Ambientes Disponibles
                </span>
              </div>

              {/* Center Launch Overlay Trigger */}
              <div
                onClick={() => onLaunchTour(activeRoom?.id)}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-black/70 backdrop-blur-2xl border-2 border-[#9CD01A] flex items-center justify-center text-[#9CD01A] shadow-[0_0_35px_rgba(156,208,26,0.5)] transform group-hover:scale-110 transition-transform duration-300">
                  <Maximize2 className="w-8 h-8" />
                </div>
              </div>

              {/* Bottom Room Information */}
              <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
                <div>
                  <div className="text-xs text-[#9CD01A] font-semibold uppercase tracking-wider mb-1">
                    Ambiente Seleccionado
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {activeRoom?.name || 'Recorrido 360'}
                  </h3>
                  {activeRoom?.description && (
                    <p className="text-xs text-white/80 mt-1 max-w-md drop-shadow">
                      {activeRoom.description}
                    </p>
                  )}
                </div>

                <div className="pointer-events-auto">
                  <button
                    onClick={() => onLaunchTour(activeRoom?.id)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <span>Entrar a {activeRoom?.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9CD01A]" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Room Picker & Minimap Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Room Selector List */}
          <GlassCard
            variant="card"
            className="p-5 border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9CD01A]" />
                <span>Espacios Registrados</span>
              </h4>
              <span className="text-[11px] font-mono text-white/40">
                {roomList.length} zonas
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {roomList.map((room) => {
                const isSelected = room.id === activeRoom?.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#9CD01A]/15 border-[#9CD01A]/50 text-white'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-[#A3A3A3] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#9CD01A]' : 'bg-white/20'}`} />
                      <span className="text-xs font-semibold">{room.name}</span>
                    </div>

                    <span className="text-[10px] font-mono text-white/40">
                      {(room.hotspots || []).length} enlaces
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Minimap Card */}
          {minimapImage && (
            <GlassCard
              variant="card"
              className="p-5 border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9CD01A]" />
                  <span>Plano de Ubicación</span>
                </h4>
                <span className="text-[11px] text-[#9CD01A] font-semibold">2D Radar</span>
              </div>

              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/60 border border-white/10">
                <img
                  src={minimapImage}
                  alt="Plano 2D"
                  className="w-full h-full object-contain p-2"
                />

                {/* Minimap active pin */}
                {activeRoom?.minimapPosition && (
                  <div
                    className="absolute w-4 h-4 rounded-full bg-[#9CD01A] border-2 border-black transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(156,208,26,0.8)] animate-pulse"
                    style={{
                      left: `${activeRoom.minimapPosition.x}%`,
                      top: `${activeRoom.minimapPosition.y}%`
                    }}
                  />
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
