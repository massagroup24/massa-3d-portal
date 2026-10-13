import { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowLeftRight, 
  Maximize2, 
  X
} from 'lucide-react';
import { ProgressUpdateItem } from '../../services/portalService';
import { GlassCard } from '../ui/GlassCard';

interface ProgressTimelineProps {
  progressUpdates: ProgressUpdateItem[];
  currentPhase: string;
  currentProgress: number;
  projectName: string;
  beforeAfterComparison?: {
    beforeImage: string;
    beforeLabel: string;
    afterImage: string;
    afterLabel: string;
  };
}

export function ProgressTimeline({
  progressUpdates,
  currentPhase,
  currentProgress,
  projectName,
  beforeAfterComparison
}: ProgressTimelineProps) {
  // Before / After slider position (0 to 100)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Active Lightbox image for milestone gallery
  const [activeMediaUrl, setActiveMediaUrl] = useState<{ url: string; caption?: string } | null>(null);

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.min(Math.max((offsetX / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Overview Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#9CD01A]">
              Seguimiento de Construcción
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F5]">
            Avance de Obra en Tiempo Real
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Bitácora técnica, control de hitos y comparación evolutiva para <span className="text-[#F5F5F5] font-medium">{projectName}</span>
          </p>
        </div>

        {/* Global Progress Card */}
        <div className="bg-[#171717]/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-5 shadow-2xl">
          <div>
            <div className="text-xs text-[#A3A3A3] font-medium uppercase tracking-wider">
              {currentPhase}
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1 mt-0.5">
              <span>{currentProgress}%</span>
              <span className="text-xs text-[#9CD01A] font-normal uppercase tracking-normal">Ejecutado</span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-[#9CD01A] border-r-[#9CD01A] flex items-center justify-center font-bold text-xs text-[#9CD01A]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 1. Interactive Before / After Split Comparison Slider */}
      {beforeAfterComparison && (
        <GlassCard
          variant="card"
          glowColor="#9CD01A"
          className="p-6 border-white/10 overflow-hidden relative"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-[#9CD01A]" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Comparador Evolutivo (Antes vs. Ahora)
              </h3>
            </div>
            <span className="text-xs text-[#A3A3A3] hidden sm:inline">
              Arrastra el deslizador para comparar el estado del proyecto
            </span>
          </div>

          {/* Slider Container */}
          <div
            ref={sliderRef}
            onMouseDown={() => setIsDraggingSlider(true)}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseLeave={() => setIsDraggingSlider(false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden cursor-ew-resize select-none bg-black/60 shadow-inner"
          >
            {/* After Image (Full Background) */}
            <img
              src={beforeAfterComparison.afterImage}
              alt="Estado Actual"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-full text-xs font-semibold text-[#9CD01A] pointer-events-none">
              {beforeAfterComparison.afterLabel}
            </div>

            {/* Before Image (Clipped Layer) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforeAfterComparison.beforeImage}
                alt="Estado Inicial"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: sliderRef.current?.clientWidth || '100%' }}
              />
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-full text-xs font-semibold text-white pointer-events-none">
                {beforeAfterComparison.beforeLabel}
              </div>
            </div>

            {/* Split Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10 flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-10 h-10 rounded-full bg-black/85 backdrop-blur-xl border-2 border-[#9CD01A] flex items-center justify-center text-[#9CD01A] shadow-[0_0_20px_rgba(156,208,26,0.6)] transform -translate-x-1/2">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* 2. Chronological Milestones Feed */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#9CD01A]" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Bitácora Cronológica de Hitos
          </h3>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-8">
          {progressUpdates.map((update, idx) => (
            <m.div
              key={update.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative group"
            >
              {/* Glowing Node Dot on Timeline */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#171717] border-2 border-[#9CD01A] flex items-center justify-center shadow-[0_0_12px_rgba(156,208,26,0.5)] group-hover:scale-125 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
              </div>

              {/* Milestone Card */}
              <GlassCard
                variant="card"
                glowColor="#9CD01A"
                className="p-6 border-white/10 hover:border-white/20 transition-all duration-300"
              >
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#9CD01A]/15 text-[#9CD01A] border border-[#9CD01A]/30">
                      {update.phase_name}
                    </span>
                    <span className="text-xs text-[#A3A3A3] flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {update.update_date}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-white/5 text-white/90">
                    {update.progress_percentage}% Completado
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white tracking-tight mb-2">
                  {update.title}
                </h4>

                <p className="text-sm text-[#A3A3A3] leading-relaxed mb-5">
                  {update.description}
                </p>

                {/* Photo Gallery Grid for this Milestone */}
                {update.media && update.media.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                      Evidencias Fotográficas ({update.media.length})
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {update.media.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setActiveMediaUrl({ url: item.storage_path, caption: item.caption })}
                          className="group/photo relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer bg-black/40 border border-white/10 hover:border-[#9CD01A]/50 transition"
                        >
                          <img
                            src={item.storage_path}
                            alt={item.caption || 'Foto de avance'}
                            className="w-full h-full object-cover transform duration-500 group-hover/photo:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-[#9CD01A]" />
                          </div>
                          {item.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-md p-1.5 text-[10px] text-white/80 line-clamp-1 text-center">
                              {item.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </m.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Milestone Photos */}
      <AnimatePresence>
        {activeMediaUrl && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4"
            onClick={() => setActiveMediaUrl(null)}
          >
            <button
              onClick={() => setActiveMediaUrl(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center">
              <img
                src={activeMediaUrl.url}
                alt="Detalle de avance"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
              {activeMediaUrl.caption && (
                <div className="mt-4 bg-[#171717]/90 px-6 py-2.5 rounded-full border border-white/15 text-sm text-white/90">
                  {activeMediaUrl.caption}
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
