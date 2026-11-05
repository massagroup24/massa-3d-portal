import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Image as ImageIcon, Layers } from 'lucide-react';
import type { ProjectIdentity, ProjectRender } from '../../config/projectIdentityConfig';
import { buildParallaxColumns, getRenderAspectRatio } from '../../utils/parallaxLayout';

interface SkiperParallaxGalleryProps {
  renders: ProjectRender[];
  identity?: ProjectIdentity;
  onSelectRender?: (render: ProjectRender) => void;
}

function ParallaxColumn({ column, index, progress, reducedMotion, color, onSelectRender }: {
  column: ReturnType<typeof buildParallaxColumns>[number];
  index: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
  color: string;
  onSelectRender?: (render: ProjectRender) => void;
}) {
  const distance = reducedMotion ? 0 : column.travel * (index % 2 ? -1 : 1);
  const y = useTransform(progress, [0, 1], [distance, -distance]);

  return (
    <motion.div
      data-parallax-column={index}
      className="relative flex min-w-0 flex-col gap-[var(--gallery-gap)]"
      style={{ y, top: column.top }}
    >
      {column.items.map((render, itemIndex) => (
        <button
          type="button"
          key={`${render.id}-${itemIndex}`}
          onClick={() => render.url && onSelectRender?.(render)}
          aria-label={`Ampliar render: ${render.title}`}
          disabled={!render.url || !onSelectRender}
          className="group relative block w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#111116] text-left outline-offset-4 focus-visible:outline focus-visible:outline-2 sm:rounded-2xl shadow-xl transition-all duration-300 hover:border-white/30 cursor-pointer"
          style={{ aspectRatio: getRenderAspectRatio(render) }}
        >
          {render.url ? (
            <img
              src={encodeURI(render.url)}
              alt={render.title}
              loading="lazy"
              width={render.width}
              height={render.height}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
              <ImageIcon className="h-7 w-7" style={{ color }} />
              <span className="text-xs text-white/60">{render.title}</span>
            </div>
          )}

          {/* Badge visual OBLIGATORIO "Render" */}
          <span className="absolute left-2 top-2 z-10 rounded-full border border-white/20 bg-black/80 backdrop-blur-md px-2 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-white/90 sm:left-3 sm:top-3 shadow-md">
            Render
          </span>

          {/* Rótulo permanente del Sector y Estancia para visualizar claramente cada área de la vivienda */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/95 via-black/65 to-transparent flex items-end justify-between gap-2 z-10">
            <div className="min-w-0 flex-1">
              {render.category && (
                <span
                  className={`block text-[8px] sm:text-[9px] font-mono uppercase tracking-widest font-bold truncate ${color.toUpperCase() === '#DFC47B' ? 'gold-metallic-text' : ''}`}
                  style={{ color }}
                >
                  {render.category}
                </span>
              )}
              <span className="mt-0.5 block text-[11px] sm:text-sm font-semibold text-white truncate drop-shadow-md">
                {render.title}
              </span>
            </div>
            <div className="hidden sm:flex w-7 h-7 rounded-full bg-black/70 border border-white/20 items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
              <ArrowUpRight className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

export function SkiperParallaxGallery({ renders, identity, onSelectRender }: SkiperParallaxGalleryProps) {
  const gallery = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1280, height: 1800 });
  const reducedMotion = Boolean(useReducedMotion());
  const color = identity?.theme.primaryColor || '#DFC47B';
  const brand = identity?.clientBrand;
  const gap = size.width < 640 ? 12 : 24;

  // Extracción dinámica de sectores arquitectónicos reales del proyecto
  const sectors = useMemo(() => {
    const set = new Set<string>();
    renders.forEach(r => {
      if (r.category) set.add(r.category);
    });
    return ['Todos los sectores', ...Array.from(set)];
  }, [renders]);

  const [activeSector, setActiveSector] = useState('Todos los sectores');

  const displayedRenders = useMemo(() => {
    if (activeSector === 'Todos los sectores') return renders;
    return renders.filter(r => r.category === activeSector);
  }, [renders, activeSector]);

  const { scrollYProgress } = useScroll({ target: gallery, offset: ['start end', 'end start'] });
  const columns = useMemo(() => buildParallaxColumns(displayedRenders, size.width, size.height, gap), [displayedRenders, size, gap]);

  useEffect(() => {
    const element = gallery.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(previous => previous.width === width && previous.height === height ? previous : { width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!renders.length) return null;

  return (
    <section 
      id="muro-parallax-renders" 
      className="relative z-10 w-full scroll-mt-24 overflow-hidden border-y bg-[#08080B]" 
      style={{ borderColor: `${color}20` }}
    >
      {/* Cabecera ampliada con filtro por sectores */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-6 pt-12 sm:px-8 sm:pb-8 sm:pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="mb-2.5 flex items-center gap-2 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.2em]" style={{ color }}>
              {brand?.logoIcon ? (
                <img src={encodeURI(brand.logoIcon)} alt="" className="h-4 w-4 object-contain" />
              ) : (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              )}
              <span className={color.toUpperCase() === '#DFC47B' ? 'gold-metallic-text' : ''}>
                {brand?.companyName || identity?.brandName} · Galería de arquitectura expandida
              </span>
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              Sectores de la <span className={color.toUpperCase() === '#DFC47B' ? 'gold-metallic-text' : ''}>Vivienda</span> en Perspectiva
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm leading-relaxed text-white/55">
            Muro vertical expandido con {displayedRenders.length} perspectivas arquitectónicas. Deslice para explorar los diferentes sectores y toque cualquier imagen para ampliarla en alta definición.
          </p>
        </div>

        {/* Selector de Sectores / Estancias de la Vivienda */}
        {sectors.length > 2 && (
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-white/40 uppercase tracking-wider mr-1 shrink-0">
              <Layers className="w-3.5 h-3.5" style={{ color }} />
              <span>Sectores:</span>
            </div>
            {sectors.map((sec) => {
              const isActive = activeSector === sec;
              const count = sec === 'Todos los sectores' ? renders.length : renders.filter(r => r.category === sec).length;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setActiveSector(sec)}
                  className={`min-h-[38px] px-3.5 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'text-[#060608] shadow-lg sm:scale-105'
                      : 'bg-white/[0.04] text-white/70 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                  style={isActive ? { backgroundImage: identity?.clientBrand?.metallicGradient || 'linear-gradient(135deg, #B89752 0%, #DFC47B 50%, #9E7D3B 100%)' } : undefined}
                >
                  {sec} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Espacio Parallax Ampliado y Monumental */}
      <div 
        ref={gallery} 
        className="relative w-full overflow-hidden h-[160vh] sm:h-[200vh] lg:h-[240vh] min-h-[1000px] sm:min-h-[1400px] lg:min-h-[1800px] max-h-[3000px]"
      >
        <div 
          className="absolute inset-0 grid items-start gap-[var(--gallery-gap)] p-[var(--gallery-gap)]" 
          style={{ 
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, 
            ['--gallery-gap' as string]: `${gap}px` 
          }}
        >
          {columns.map((column, index) => (
            <ParallaxColumn 
              key={`${activeSector}-${index}`} 
              column={column} 
              index={index} 
              progress={scrollYProgress} 
              reducedMotion={reducedMotion} 
              color={color} 
              onSelectRender={onSelectRender} 
            />
          ))}
        </div>

        {/* Gradientes perimetrales sutiles para transiciones suaves */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#08080B] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#08080B] to-transparent" />
      </div>

      {/* Pie técnico del muro */}
      <div className="flex items-center justify-center gap-3 px-4 py-6 text-[9px] font-mono uppercase tracking-[0.18em] text-white/35 border-t border-white/5">
        <span className="h-px w-8" style={{ backgroundColor: `${color}40` }} /> 
        {identity?.name} · {brand?.companyName || identity?.brandName} 
        <span className="h-px w-8" style={{ backgroundColor: `${color}40` }} />
      </div>
    </section>
  );
}
