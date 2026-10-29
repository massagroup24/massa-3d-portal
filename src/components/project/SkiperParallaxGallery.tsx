import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { useEffect, useRef, useState, useMemo } from 'react';
import { ProjectIdentity, ProjectRender } from '../../config/projectIdentityConfig';
import { ArrowDown, Layers, Image as ImageIcon } from 'lucide-react';

interface SkiperParallaxGalleryProps {
  renders: ProjectRender[];
  identity?: ProjectIdentity;
  onSelectRender?: (render: ProjectRender) => void;
}

interface ColumnProps {
  renders: ProjectRender[];
  y: MotionValue<number>;
  className?: string;
  primaryColor: string;
  primaryHover: string;
  brandName: string;
  onSelectRender?: (render: ProjectRender) => void;
}

const Column = ({ renders, y, className, primaryColor, primaryHover, brandName, onSelectRender }: ColumnProps) => {
  return (
    <motion.div
      className={`relative flex h-full flex-col gap-2.5 sm:gap-[1.8vw] min-w-0 ${className}`}
      style={{ y }}
    >
      {renders.map((render, i) => {
        const hasImage = Boolean(render.url && render.url.trim().length > 0);
        return (
          <div
            key={`${render.id}-${i}`}
            onClick={() => hasImage && onSelectRender?.(render)}
            className="relative w-full overflow-hidden rounded-xl sm:rounded-3xl border border-white/10 bg-[#0C0D12] shadow-[0_15px_40px_rgba(0,0,0,0.85)] group transition-all duration-500 shrink-0 cursor-pointer"
          >
            {hasImage ? (
              <img
                src={encodeURI(render.url)}
                alt={render.title}
                loading="lazy"
                className="w-full h-auto object-cover pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div
                className="w-full aspect-[4/3] flex flex-col items-center justify-center p-4 sm:p-6 text-center relative overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 50% 35%, ${primaryColor}16, rgba(10,12,16,0.96) 75%)`
                }}
              >
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2.5 border"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderColor: `${primaryColor}35`
                  }}
                >
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryHover }} />
                </div>
                <span
                  className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] font-bold mb-1"
                  style={{ color: primaryHover }}
                >
                  {render.category}
                </span>
                <span className="text-[11px] sm:text-sm font-bold text-white/90 uppercase tracking-tight leading-snug">
                  {render.title}
                </span>
              </div>
            )}

            {/* Tarjeta inferior con datos arquitectónicos de la estancia (Visible sutilmente en móvil y en hover en desktop) */}
            {hasImage && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 p-2.5 sm:p-5 flex flex-col justify-end pointer-events-none">
                <span
                  className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] font-bold mb-0.5 sm:mb-1 truncate"
                  style={{ color: primaryHover }}
                >
                  {render.category}
                </span>
                <span className="text-[10px] sm:text-sm font-bold text-white uppercase tracking-tight leading-tight line-clamp-1 sm:line-clamp-2">
                  {render.title}
                </span>
                {render.width && render.height && (
                  <span className="hidden sm:block text-[8px] font-mono text-white/40 uppercase mt-1">
                    {render.width} × {render.height} px • {brandName}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

export function SkiperParallaxGallery({ renders, identity, onSelectRender }: SkiperParallaxGalleryProps) {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const isMobile = dimension.width > 0 && dimension.width < 640;

  const primaryColor = identity?.theme.primaryColor || '#DFC47B';
  const primaryHover = identity?.theme.primaryHover || '#F1E29B';
  const brandIcon = identity?.clientBrand?.logoIcon || '/HACIENDA F22/branding/amho-icon.png';
  const brandName = identity?.brandName || 'AMHO CONSTRUCCIONES';
  const projectName = identity?.name || 'HACIENDA F22';

  // Si el proyecto aún no tiene renders cargados, generamos tarjetas estructurales para que las 4 columnas Parallax operen con idéntica estructura
  const effectiveRenders: ProjectRender[] = useMemo(() => {
    if (renders && renders.length > 0) return renders;
    const categories = [
      'Fachada & Exteriores',
      'Bienvenida & Salón',
      'Cocina de Autor',
      'Piscina & BBQ',
      'Suites & Baños Spa',
      'Entretenimiento & Estudio',
      'Paisajismo & Terrazas',
      'Iluminación Nocturna'
    ];
    return Array.from({ length: 12 }, (_, idx) => ({
      id: `parallax-slot-${idx + 1}`,
      title: `${projectName} • Perspectiva ${String(idx + 1).padStart(2, '0')}`,
      url: '',
      category: categories[idx % categories.length]
    }));
  }, [renders, projectName]);

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ['start end', 'end start'],
  });

  const { height } = dimension;
  const y = useTransform(scrollYProgress, [0, 1], [0, height * (isMobile ? 0.95 : 1.8)]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * (isMobile ? 1.45 : 3.1)]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.3]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 2.7]);

  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId: number;
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    if (!isTouchDevice) {
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

  // Asegurar que las columnas tengan suficiente densidad vertical para el efecto parallax multidimensional
  const parallaxSourceRenders = useMemo(() => {
    if (renders && renders.length > 0) {
      if (renders.length < 20) {
        const repeats = Math.ceil(24 / renders.length);
        const multiplied: ProjectRender[] = [];
        for (let r = 0; r < repeats; r++) {
          renders.forEach((item, idx) => {
            multiplied.push({ ...item, id: `${item.id}-cycle-${r}-${idx}` });
          });
        }
        return multiplied;
      }
      return renders;
    }
    return effectiveRenders;
  }, [renders, effectiveRenders]);

  // En móvil (2 columnas) distribuimos los renders entre col1 y col2; en tablet/desktop en 4 columnas
  const col1 = useMemo(
    () => parallaxSourceRenders.filter((_, i) => (isMobile ? i % 2 === 0 : i % 4 === 0)),
    [parallaxSourceRenders, isMobile]
  );
  const col2 = useMemo(
    () => parallaxSourceRenders.filter((_, i) => (isMobile ? i % 2 === 1 : i % 4 === 1)),
    [parallaxSourceRenders, isMobile]
  );
  const col3 = useMemo(() => parallaxSourceRenders.filter((_, i) => i % 4 === 2), [parallaxSourceRenders]);
  const col4 = useMemo(() => parallaxSourceRenders.filter((_, i) => i % 4 === 3), [parallaxSourceRenders]);

  return (
    <section 
      id="muro-parallax-renders" 
      className="relative z-10 w-full bg-[#060608] border-t overflow-hidden"
      style={{ borderColor: `${primaryColor}33` }}
    >
      {/* Encabezado VIP del Muro Parallax */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-14 sm:pt-20 pb-8 sm:pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full border mb-3 max-w-full"
          style={{
            backgroundColor: `${primaryColor}18`,
            borderColor: `${primaryColor}48`
          }}
        >
          <img src={encodeURI(brandIcon)} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
          <span
            className="text-[9px] sm:text-xs font-mono font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase truncate"
            style={{ color: primaryHover }}
          >
            {brandName} • EXPERIENCIA CONTINUA
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          Muro Parallax Arquitectónico
        </h2>
        <p className="text-xs sm:text-sm text-white/55 max-w-xl mx-auto mt-2 font-normal leading-relaxed px-2">
          {renders.length > 0
            ? `Las ${renders.length} perspectivas de la residencia en flujo vertical multidimensional. Toque cualquier fotografía para abrirla en resolución 4K.`
            : `Flujo vertical multidimensional preparado para las perspectivas arquitectónicas de ${projectName}.`}
        </p>

        {/* Indicador de Desplazamiento Parallax */}
        <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2.5 sm:gap-3 text-[9px] sm:text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.25em]">
          <span className="w-6 sm:w-8 h-px" style={{ backgroundColor: `${primaryColor}65` }} />
          <span className="flex items-center gap-1.5" style={{ color: primaryHover }}>
            <Layers className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            <span className="sm:hidden">Mosaico Parallax Interactivo</span>
            <span className="hidden sm:inline">4 Columnas con Parallax Dinámico</span>
          </span>
          <span className="w-6 sm:w-8 h-px" style={{ backgroundColor: `${primaryColor}65` }} />
        </div>
      </div>

      {/* Galería Parallax Skiper 30 (Adaptada sin desborde horizontal en móvil y 4 columnas en desktop) */}
      <div
        ref={gallery}
        className="relative box-border flex h-[175vh] sm:h-[220vh] lg:h-[250vh] gap-2.5 sm:gap-[1.8vw] overflow-hidden bg-[#07070A] p-2.5 sm:p-[1.8vw] border-y border-white/[0.06]"
      >
        <Column 
          renders={col1} 
          y={y} 
          primaryColor={primaryColor}
          primaryHover={primaryHover}
          brandName={brandName}
          onSelectRender={onSelectRender}
          className="w-1/2 sm:w-1/3 lg:w-1/4 -top-[28%] sm:-top-[45%]" 
        />
        <Column 
          renders={col2} 
          y={y2} 
          primaryColor={primaryColor}
          primaryHover={primaryHover}
          brandName={brandName}
          onSelectRender={onSelectRender}
          className="w-1/2 sm:w-1/3 lg:w-1/4 -top-[48%] sm:-top-[90%]" 
        />
        <Column 
          renders={col3} 
          y={y3} 
          primaryColor={primaryColor}
          primaryHover={primaryHover}
          brandName={brandName}
          onSelectRender={onSelectRender}
          className="hidden sm:flex sm:w-1/3 lg:w-1/4 -top-[45%]" 
        />
        <Column 
          renders={col4} 
          y={y4} 
          primaryColor={primaryColor}
          primaryHover={primaryHover}
          brandName={brandName}
          onSelectRender={onSelectRender}
          className="hidden lg:flex lg:w-1/4 -top-[75%]" 
        />
      </div>

      {/* Cierre inferior de transición suave */}
      <div className="w-full py-8 sm:py-10 px-4 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#07070A] to-[#09090D] text-center border-b border-white/[0.08]">
        <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/40">
          Fin del Recorrido Fotográfico • Continúe al Gemelo Digital 360°
        </span>
        <ArrowDown className="w-4 h-4 animate-bounce" style={{ color: primaryColor }} />
      </div>
    </section>
  );
}
