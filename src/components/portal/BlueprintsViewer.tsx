import { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Layers, 
  Compass, 
  MapPin, 
  Info
} from 'lucide-react';
import { ProjectMediaItem } from '../../services/portalService';
import { GlassCard } from '../ui/GlassCard';

interface BlueprintsViewerProps {
  blueprints: ProjectMediaItem[];
  projectName: string;
}

interface AreaMarker {
  id: string;
  name: string;
  area: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  levelId: string;
}

const SAMPLE_MARKERS: AreaMarker[] = [
  { id: 'm-1', name: 'Acceso Principal & Hall', area: '14.5 m²', x: 22, y: 78, levelId: 'bp-1' },
  { id: 'm-2', name: 'Sala Doble Altura', area: '38.0 m²', x: 42, y: 55, levelId: 'bp-1' },
  { id: 'm-3', name: 'Comedor & Bar Social', area: '24.0 m²', x: 60, y: 52, levelId: 'bp-1' },
  { id: 'm-4', name: 'Cocina Abierta & Isla', area: '26.5 m²', x: 78, y: 40, levelId: 'bp-1' },
  { id: 'm-5', name: 'Terraza Cubierta & BBQ', area: '45.0 m²', x: 50, y: 22, levelId: 'bp-1' },
  { id: 'm-6', name: 'Piscina Infinity & Deck', area: '62.0 m²', x: 82, y: 18, levelId: 'bp-1' },
  
  { id: 'm-7', name: 'Master Suite Principal', area: '34.0 m²', x: 35, y: 45, levelId: 'bp-2' },
  { id: 'm-8', name: 'Vestidor Walk-in', area: '16.0 m²', x: 22, y: 35, levelId: 'bp-2' },
  { id: 'm-9', name: 'Baño Principal & Spa', area: '18.5 m²', x: 20, y: 60, levelId: 'bp-2' },
  { id: 'm-10', name: 'Estar de Alcobas / TV', area: '22.0 m²', x: 55, y: 50, levelId: 'bp-2' },
  { id: 'm-11', name: 'Habitación Auxiliar 1', area: '20.0 m²', x: 75, y: 38, levelId: 'bp-2' },
  { id: 'm-12', name: 'Habitación Auxiliar 2', area: '21.0 m²', x: 76, y: 68, levelId: 'bp-2' }
];

export function BlueprintsViewer({ blueprints, projectName }: BlueprintsViewerProps) {
  const [selectedBpId, setSelectedBpId] = useState<string>(blueprints[0]?.id || '');
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [hoveredMarker, setHoveredMarker] = useState<AreaMarker | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeBlueprint = blueprints.find(b => b.id === selectedBpId) || blueprints[0];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.6), 3.5));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const activeMarkers = SAMPLE_MARKERS.filter(
    m => m.levelId === activeBlueprint?.id || activeBlueprint?.order_index === 1
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#9CD01A]">
              Documentación Técnica
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F5]">
            Planos Arquitectónicos
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Planos constructivos acotados y zonificación espacial para <span className="text-[#F5F5F5] font-medium">{projectName}</span>
          </p>
        </div>

        {/* Blueprint Levels Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {blueprints.map((bp) => (
            <button
              key={bp.id}
              onClick={() => {
                setSelectedBpId(bp.id);
                resetView();
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 border flex items-center gap-1.5 ${
                selectedBpId === bp.id
                  ? 'bg-[#9CD01A] text-black border-[#9CD01A] shadow-[0_0_20px_rgba(156,208,26,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-[#A3A3A3] hover:text-[#F5F5F5] border-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{bp.metadata?.level || bp.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Blueprint Canvas Panel */}
      <GlassCard
        variant="card"
        glowColor="#9CD01A"
        className="p-0 overflow-hidden border-white/10 relative h-[650px] flex flex-col bg-[#0F0F10]"
      >
        {/* Floating Toolbar on Top */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Blueprint Title badge */}
          <div className="pointer-events-auto bg-black/70 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 text-xs text-white">
            <div className="flex items-center gap-2 font-semibold">
              <Compass className="w-4 h-4 text-[#9CD01A]" />
              <span>{activeBlueprint?.title}</span>
            </div>
            {activeBlueprint?.metadata?.area && (
              <span className="text-white/50 border-l border-white/15 pl-3 font-mono">
                {activeBlueprint.metadata.area}
              </span>
            )}
          </div>

          {/* Canvas Controls */}
          <div className="pointer-events-auto flex items-center gap-2 bg-black/70 backdrop-blur-xl border border-white/15 p-1.5 rounded-2xl shadow-xl">
            <button
              onClick={() => setScale((s) => Math.min(s + 0.25, 3.5))}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition"
              title="Acercar plano (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale((s) => Math.max(s - 0.25, 0.6))}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition"
              title="Alejar plano (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition"
              title="Centrar y restablecer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-white/20 mx-1" />

            {/* Contrast / CAD filter button */}
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isHighContrast
                  ? 'bg-[#9CD01A] text-black font-bold'
                  : 'bg-white/5 hover:bg-white/15 text-white'
              }`}
              title="Alternar estilo CAD negativo"
            >
              <span>{isHighContrast ? 'Modo CAD' : 'Modo Estándar'}</span>
            </button>

            {/* Download Blueprint */}
            <a
              href={activeBlueprint?.storage_path}
              download={`${projectName}_${activeBlueprint?.title}.jpg`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Descargar plano en alta calidad"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </a>
          </div>
        </div>

        {/* Pan and Zoom Canvas Viewport */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`w-full h-full relative overflow-hidden flex items-center justify-center select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        >
          {/* Blueprint Inner Transformation Layer */}
          <div
            className="relative transition-transform duration-75 origin-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
            }}
          >
            <img
              src={activeBlueprint?.storage_path}
              alt={activeBlueprint?.title}
              draggable={false}
              className={`max-w-[850px] max-h-[550px] w-auto h-auto object-contain rounded-xl transition-all duration-300 shadow-2xl ${
                isHighContrast
                  ? 'filter invert hue-rotate-180 brightness-110 contrast-125'
                  : 'brightness-95 contrast-105'
              }`}
            />

            {/* Architectural Area Pins / Hotspots */}
            {activeMarkers.map((marker) => (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                onMouseEnter={() => setHoveredMarker(marker)}
                onMouseLeave={() => setHoveredMarker(null)}
              >
                {/* Glowing Radar Pulse Pin */}
                <div className="relative cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-[#9CD01A]/30 animate-ping absolute inset-0" />
                  <div className="w-6 h-6 rounded-full bg-black/80 border border-[#9CD01A] flex items-center justify-center text-[#9CD01A] shadow-[0_0_12px_rgba(156,208,26,0.5)] group-hover:scale-125 transition-transform">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Floating Tooltip with Area */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                  <div className="bg-black/90 backdrop-blur-xl border border-white/20 px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl text-center">
                    <p className="text-xs font-bold text-white">{marker.name}</p>
                    <p className="text-[10px] font-mono text-[#9CD01A]">{marker.area}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Legend and Info Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-black/70 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 text-xs text-[#A3A3A3]">
            <div className="flex items-center gap-1.5 text-white/80">
              <Info className="w-3.5 h-3.5 text-[#9CD01A]" />
              {hoveredMarker ? (
                <span>
                  Área enfocada: <strong className="text-white">{hoveredMarker.name}</strong> ({hoveredMarker.area})
                </span>
              ) : (
                <span>Arrastra para mover • Rueda para zoom • Haz hover en los puntos de área</span>
              )}
            </div>
          </div>

          <div className="pointer-events-auto bg-black/70 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-2xl text-[11px] font-mono text-[#9CD01A]">
            Zoom: {Math.round(scale * 100)}%
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
