import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { useEffect, useRef, useState, useMemo } from 'react';
import { ProjectRender } from '../../config/projectIdentityConfig';
import { ArrowDown, Layers } from 'lucide-react';

interface SkiperParallaxGalleryProps {
  renders: ProjectRender[];
}

interface ColumnProps {
  renders: ProjectRender[];
  y: MotionValue<number>;
  className?: string;
}

const Column = ({ renders, y, className }: ColumnProps) => {
  return (
    <motion.div
      className={`relative flex h-full flex-col gap-[1.8vw] ${className}`}
      style={{ y }}
    >
      {renders.map((render, i) => (
        <div
          key={`${render.id}-${i}`}
          className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0C0D12] shadow-[0_20px_50px_rgba(0,0,0,0.85)] group hover:border-[#D4A359]/60 transition-all duration-500 shrink-0"
        >
          <img
            src={encodeURI(render.url)}
            alt={render.title}
            loading="lazy"
            className="w-full h-auto object-cover pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {/* Tarjeta inferior con datos arquitectónicos de la estancia */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 sm:p-5 flex flex-col justify-end pointer-events-none">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#D4A359] font-bold mb-1">
              {render.category}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight leading-snug">
              {render.title}
            </span>
            {render.width && render.height && (
              <span className="text-[8px] font-mono text-white/40 uppercase mt-1">
                {render.width} × {render.height} px
              </span>
            )}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export function SkiperParallaxGallery({ renders }: SkiperParallaxGalleryProps) {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ['start end', 'end start'],
  });

  const { height } = dimension;
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 1.8]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.1]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.3]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 2.7]);

  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId: number;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    } catch (err) {
      console.warn('Lenis could not be initialized:', err);
    }

    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  // Distribuir los 32 renders de manera equilibrada en las 4 columnas
  const col1 = useMemo(() => renders.filter((_, i) => i % 4 === 0), [renders]);
  const col2 = useMemo(() => renders.filter((_, i) => i % 4 === 1), [renders]);
  const col3 = useMemo(() => renders.filter((_, i) => i % 4 === 2), [renders]);
  const col4 = useMemo(() => renders.filter((_, i) => i % 4 === 3), [renders]);

  return (
    <section 
      id="muro-parallax-renders" 
      className="relative z-10 w-full bg-[#060608] border-t border-[#D4A359]/20 overflow-hidden"
    >
      {/* Encabezado VIP del Muro Parallax */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-12 text-center">
        <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#D4A359] block mb-2">
          • EXPERIENCIA VISUAL INMERSIVA CONTINUA
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          Muro Parallax Arquitectónico
        </h2>
        <p className="text-xs sm:text-sm text-white/50 max-w-xl mx-auto mt-2 font-normal leading-relaxed">
          Las 33 perspectivas de la residencia organizadas en un flujo vertical multidimensional. Desplace la página para activar las velocidades diferenciales de cada columna.
        </p>

        {/* Indicador de Desplazamiento Parallax */}
        <div className="mt-6 flex items-center justify-center gap-3 text-[10px] font-mono text-white/40 uppercase tracking-[0.25em]">
          <span className="w-8 h-px bg-[#D4A359]/40" />
          <span className="flex items-center gap-1.5 text-[#D4A359]">
            <Layers className="w-3.5 h-3.5" />
            4 Columnas con Parallax Dinámico
          </span>
          <span className="w-8 h-px bg-[#D4A359]/40" />
        </div>
      </div>

      {/* Galería Parallax Skiper 30 (Adaptada a la identidad oscura y dorada de HACIENDA F22) */}
      <div
        ref={gallery}
        className="relative box-border flex h-[190vh] sm:h-[220vh] lg:h-[250vh] gap-[1.8vw] overflow-hidden bg-[#07070A] p-[1.8vw] border-y border-white/[0.06]"
      >
        <Column 
          renders={col1} 
          y={y} 
          className="w-1/2 sm:w-1/3 lg:w-1/4 min-w-[240px] -top-[45%]" 
        />
        <Column 
          renders={col2} 
          y={y2} 
          className="w-1/2 sm:w-1/3 lg:w-1/4 min-w-[240px] -top-[90%]" 
        />
        <Column 
          renders={col3} 
          y={y3} 
          className="hidden sm:flex sm:w-1/3 lg:w-1/4 min-w-[240px] -top-[45%]" 
        />
        <Column 
          renders={col4} 
          y={y4} 
          className="hidden lg:flex lg:w-1/4 min-w-[240px] -top-[75%]" 
        />
      </div>

      {/* Cierre inferior de transición suave */}
      <div className="w-full py-10 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#07070A] to-[#09090D] text-center border-b border-white/[0.08]">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
          Fin del Recorrido Fotográfico • Continúe a la Distribución Arquitectónica
        </span>
        <ArrowDown className="w-4 h-4 text-[#D4A359] animate-bounce" />
      </div>
    </section>
  );
}
