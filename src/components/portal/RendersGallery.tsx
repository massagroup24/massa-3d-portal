import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Maximize2, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { ProjectMediaItem } from '../../services/portalService';
import { GlassCard } from '../ui/GlassCard';
import { EmptyState } from '../ui/EmptyState';

interface RendersGalleryProps {
  renders: ProjectMediaItem[];
  projectName: string;
}

export function RendersGallery({ renders, projectName }: RendersGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Extract unique categories
  const categories = ['Todos', ...Array.from(new Set(renders.map(r => r.category).filter(Boolean)))];

  const filteredRenders = selectedCategory === 'Todos'
    ? renders
    : renders.filter(r => r.category === selectedCategory);

  const activeRender = activeImageIndex !== null ? filteredRenders[activeImageIndex] : null;

  // Reset zoom when active image changes
  useEffect(() => {
    setZoomLevel(1);
  }, [activeImageIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === 'Escape') setActiveImageIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev !== null && prev < filteredRenders.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredRenders.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, filteredRenders.length]);

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_${filename}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#9CD01A]">
              Galería Arquitectónica
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F5]">
            Renders Fotorrealistas
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Visualizaciones de alta fidelidad aprobadas para <span className="text-[#F5F5F5] font-medium">{projectName}</span>
          </p>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as string)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 border ${
                selectedCategory === cat
                  ? 'bg-[#9CD01A] text-black border-[#9CD01A] shadow-[0_0_20px_rgba(156,208,26,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-[#A3A3A3] hover:text-[#F5F5F5] border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Renders Grid / Empty State */}
      {filteredRenders.length === 0 ? (
        <EmptyState
          variant="renders"
          title={selectedCategory === 'Todos' ? 'Sin renders cargados aún' : `No hay renders en ${selectedCategory}`}
          description={`Las visualizaciones arquitectónicas para ${projectName} en este apartado se encuentran en producción fotorrealista.`}
          badge={selectedCategory === 'Todos' ? 'PORTAFOLIO FOTORREALISTA' : `SECCIÓN ${selectedCategory.toUpperCase()}`}
          secondaryAction={
            selectedCategory !== 'Todos'
              ? {
                  label: 'Ver Todos los Renders',
                  onClick: () => setSelectedCategory('Todos'),
                  icon: <RotateCcw className="w-3.5 h-3.5" />
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRenders.map((render, idx) => (
            <m.div
              key={render.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="group relative cursor-pointer"
              onClick={() => setActiveImageIndex(idx)}
            >
              <GlassCard
                variant="card"
                glowColor="#9CD01A"
                className="p-0 overflow-hidden border-white/10 hover:border-[#9CD01A]/60 transition-all duration-400 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(156,208,26,0.2)] hover:-translate-y-1.5"
              >
                {/* Image Container with Aspect Ratio */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                {render.thumbnail_path || render.storage_path ? (
                  <>
                    <img
                      src={encodeURI(render.thumbnail_path || render.storage_path)}
                      alt={render.title}
                      className="w-full h-full object-cover transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[#121318] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-[0.12] pointer-events-none"
                      style={{
                        backgroundImage: `linear-gradient(#9CD01A 1px, transparent 1px), linear-gradient(90deg, #9CD01A 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }}
                    />
                    <div className="w-12 h-12 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/30 flex items-center justify-center text-[#9CD01A] mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(156,208,26,0.2)]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CD01A] font-bold">
                      Espacio Listo Para Render
                    </span>
                    <span className="text-xs text-white/50 mt-1 max-w-[200px]">
                      Pendiente de asignar imagen HD
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#9CD01A] border border-white/10 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    {render.category || 'Render'}
                  </span>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 border border-white/10">
                    {render.metadata?.resolution || '4K UHD'}
                  </span>
                </div>

                {/* Hover Quick Action Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-black/70 backdrop-blur-xl border border-[#9CD01A]/50 flex items-center justify-center text-[#9CD01A] shadow-[0_0_24px_rgba(156,208,26,0.4)] transform scale-90 group-hover:scale-100 transition-transform">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Bottom Information */}
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <h3 className="text-base font-bold text-white tracking-tight drop-shadow-md">
                    {render.title}
                  </h3>
                  {render.metadata?.description && (
                    <p className="text-xs text-white/70 line-clamp-1 mt-0.5 drop-shadow">
                      {render.metadata.description}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </m.div>
        ))}
      </div>
      )}

      {/* Lightbox Modal (visionOS Fullscreen View) */}
      <AnimatePresence>
        {activeRender && activeImageIndex !== null && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 md:p-8"
            onClick={() => setActiveImageIndex(null)}
          >
            {/* Top Toolbar */}
            <div
              className="absolute top-4 left-4 right-4 flex items-center justify-between z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-white border border-white/15">
                  {activeImageIndex + 1} / {filteredRenders.length}
                </span>
                <span className="text-sm font-semibold text-white/90 hidden sm:inline">
                  {activeRender.title}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 2.5))}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white transition"
                  title="Acercar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.7))}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white transition"
                  title="Alejar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white transition"
                  title="Restablecer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {activeRender.storage_path && (
                  <button
                    onClick={() => handleDownload(activeRender.storage_path, activeRender.title)}
                    className="px-3.5 h-10 rounded-full bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-semibold text-xs flex items-center gap-1.5 transition shadow-[0_0_20px_rgba(156,208,26,0.3)]"
                    title="Descargar Alta Resolución"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Descargar HD</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveImageIndex(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/30 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white hover:text-red-300 transition"
                  title="Cerrar (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image Stage */}
            <div
              className="relative max-w-6xl max-h-[80vh] w-full h-full flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeRender.storage_path ? (
                <m.img
                  key={activeRender.id}
                  src={encodeURI(activeRender.storage_path)}
                  alt={activeRender.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: zoomLevel }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              ) : (
                <div className="p-8 sm:p-12 rounded-3xl bg-[#141416]/95 border border-[#9CD01A]/30 backdrop-blur-2xl max-w-xl text-center shadow-2xl flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-[#9CD01A]/10 border border-[#9CD01A]/30 flex items-center justify-center text-[#9CD01A] mb-4 shadow-[0_0_25px_rgba(156,208,26,0.25)]">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#9CD01A] font-bold mb-1">
                    Espacio Listo para Render
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                    {activeRender.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
                    {activeRender.metadata?.description || 'Este espacio está configurado y listo para recibir la imagen fotorrealista en alta definición.'}
                  </p>
                  <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/50">
                    Resolución recomendada: 4K UHD (3840 x 2160)
                  </span>
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : filteredRenders.length - 1
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) =>
                  prev !== null && prev < filteredRenders.length - 1 ? prev + 1 : 0
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition hover:scale-105"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Bottom Details Card */}
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-lg w-full px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#171717]/85 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-center shadow-2xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-[#9CD01A] uppercase tracking-wider">
                    {activeRender.category}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-[11px] text-[#A3A3A3] font-mono">
                    {activeRender.metadata?.resolution || '4K Ultra HD'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">{activeRender.title}</h4>
                {activeRender.metadata?.description && (
                  <p className="text-xs text-[#A3A3A3] mt-1 line-clamp-2">
                    {activeRender.metadata.description}
                  </p>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
