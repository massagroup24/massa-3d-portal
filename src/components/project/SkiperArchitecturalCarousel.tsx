import { useState, useEffect, useCallback, useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Play, Pause } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '../ui/carousel';
import { ProjectRender } from '../../config/projectIdentityConfig';

interface SkiperArchitecturalCarouselProps {
  renders: ProjectRender[];
  className?: string;
  autoplay?: boolean;
  onOpenLightbox?: (render: ProjectRender, index: number) => void;
}

export function SkiperArchitecturalCarousel({
  renders,
  className,
  autoplay = true,
  onOpenLightbox,
}: SkiperArchitecturalCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isAutoplayRunning, setIsAutoplayRunning] = useState(autoplay);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  // Categorías con conteo para selector minimalista
  const categories = useMemo(() => {
    const list = ['Todos', 'Fachada & Exteriores', 'Bienvenida & Salón', 'Cocina de Autor', 'Piscina & BBQ', 'Entretenimiento & Estudio', 'Suites & Baños Spa'];
    return list.map(cat => ({
      name: cat,
      count: cat === 'Todos' ? renders.length : renders.filter(r => r.category === cat).length
    })).filter(c => c.count > 0);
  }, [renders]);

  // Lista de renders a mostrar (todos o filtrados)
  const displayedRenders = useMemo(() => {
    if (activeCategory === 'Todos') return renders;
    return renders.filter(r => r.category === activeCategory);
  }, [renders, activeCategory]);

  // Sincronizar snap actual de Embla
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Al cambiar de categoría, reiniciar scroll al primer slide
  const handleCategoryChange = (catName: string) => {
    setActiveCategory(catName);
    setCurrent(0);
    if (api) {
      api.scrollTo(0, true);
    }
  };

  const toggleAutoplay = useCallback(() => {
    if (!api) return;
    const autoplayPlugin = api.plugins()?.autoplay as any;
    if (!autoplayPlugin) return;

    if (isAutoplayRunning) {
      autoplayPlugin.stop();
      setIsAutoplayRunning(false);
    } else {
      autoplayPlugin.play();
      setIsAutoplayRunning(true);
    }
  }, [api, isAutoplayRunning]);

  const activeRender = displayedRenders[current] || displayedRenders[0];

  return (
    <div className={cn("w-full relative flex flex-col items-center justify-center select-none py-4", className)}>
      
      {/* 1. Selector Minimalista de Zonas Arquitectónicas */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap mb-6 sm:mb-8 px-4 z-20">
        {categories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => handleCategoryChange(cat.name)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-1.5 border",
              activeCategory === cat.name
                ? "bg-[#D4A359] text-[#08080A] border-[#D4A359] font-black shadow-[0_4px_20px_rgba(212,163,89,0.35)] scale-105"
                : "bg-white/[0.04] text-white/60 border-white/10 hover:border-[#D4A359]/40 hover:text-white"
            )}
          >
            <span>{cat.name.split(' ')[0]}</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
              activeCategory === cat.name ? "bg-black/20 text-[#08080A]" : "bg-white/10 text-white/50"
            )}>
              {cat.count}
            </span>
          </button>
        ))}

        {/* Toggle sutil de autoplay */}
        <button
          type="button"
          onClick={toggleAutoplay}
          className="p-2 rounded-full bg-white/[0.04] border border-white/10 text-white/60 hover:text-[#D4A359] transition-all cursor-pointer ml-1"
          title={isAutoplayRunning ? "Pausar carrusel continuo" : "Reproducir carrusel continuo"}
        >
          {isAutoplayRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Embla Carousel con Arquitectura Skiper 54 (Framer Motion clipPath dinámico) */}
      <Carousel
        setApi={setApi}
        className="w-full relative"
        opts={{
          loop: true,
          align: 'center',
          skipSnaps: false,
          containScroll: false,
        }}
        plugins={
          autoplay
            ? [
                Autoplay({
                  delay: 3600,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]
            : []
        }
      >
        <CarouselContent 
          className="flex h-[520px] sm:h-[640px] md:h-[720px] lg:h-[800px] xl:h-[860px] 2xl:h-[900px] w-full items-center"
          style={{
            ['--stage-height' as any]: 'clamp(520px, 78vh, 880px)'
          }}
        >
          {displayedRenders.map((render, index) => {
            const isSelected = current === index;
            // Proporción nativa de cada render para evitar cortes o deformación
            const ratio = render.aspectRatio || 1.33;

            return (
              <CarouselItem
                key={render.id}
                className="relative flex h-[94%] shrink-0 items-center justify-center transition-all duration-300 px-2 sm:px-3"
                style={{
                  // Amplio espacio de vista previa monumental respetando la proporción nativa del render
                  width: `min(calc(var(--stage-height, 800px) * 0.94 * ${ratio}), 95vw)`,
                  aspectRatio: `${ratio}`,
                }}
              >
                {/* Contenedor animado Skiper 54 que muestra la imagen 100% completa sin recortar ningún detalle */}
                <motion.div
                  initial={false}
                  animate={{
                    clipPath: isSelected
                      ? "inset(0% 0 0% 0 round 2rem)"
                      : "inset(2% 0 2% 0 round 2rem)",
                    filter: isSelected
                      ? "brightness(1.02) contrast(1.02)"
                      : "brightness(0.60) contrast(0.92)",
                    scale: isSelected ? 1 : 0.96,
                  }}
                  transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
                  onClick={() => {
                    if (isSelected && onOpenLightbox) {
                      onOpenLightbox(render, index);
                    } else if (api) {
                      api.scrollTo(index);
                    }
                  }}
                  className={cn(
                    "h-full w-full overflow-hidden rounded-[2rem] relative cursor-pointer group transition-all duration-500 bg-[#08080C] border",
                    isSelected 
                      ? "shadow-[0_25px_80px_rgba(0,0,0,0.95)] border-[#D4A359]/40 ring-1 ring-[#D4A359]/30" 
                      : "border-white/5 opacity-80 hover:opacity-100"
                  )}
                >
                  <div className="relative h-full w-full bg-[#08080C] flex items-center justify-center p-1 sm:p-2">
                    {/* Render en proporción nativa completa: 100% visible sin recortes de bordes */}
                    <img
                      src={encodeURI(render.url)}
                      alt={render.title}
                      loading="lazy"
                      className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl sm:rounded-2xl transition-transform duration-700 ease-out"
                    />

                    {/* Botón flotante para ampliar render a pantalla completa */}
                    {onOpenLightbox && (
                      <button
                        type="button"
                        aria-label="Ampliar render"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLightbox(render, index);
                        }}
                        className={cn(
                          "absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-[#D4A359] text-white hover:text-[#08080A] border border-white/20 hover:border-[#D4A359] flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-xl",
                          isSelected ? "opacity-90 hover:opacity-100 hover:scale-110" : "opacity-0 group-hover:opacity-100"
                        )}
                        title="Ver en pantalla completa"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Sutil viñeta degradada inferior */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* 3. Botones Flotantes de Navegación Lateral */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 sm:px-6 z-30">
          <button
            type="button"
            aria-label="Render anterior"
            onClick={() => api?.scrollPrev()}
            className="pointer-events-auto w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/70 hover:bg-[#D4A359] text-white hover:text-[#08080A] border border-white/15 hover:border-[#D4A359] flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-xl shadow-2xl hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <button
            type="button"
            aria-label="Siguiente render"
            onClick={() => api?.scrollNext()}
            className="pointer-events-auto w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/70 hover:bg-[#D4A359] text-white hover:text-[#08080A] border border-white/15 hover:border-[#D4A359] flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-xl shadow-2xl hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </Carousel>

      {/* 4. Título Minimalista Central con Desenfoque Suave (Exacto a Skiper 54) */}
      <div className="w-full min-h-[70px] flex items-center justify-center mt-3 z-20">
        <AnimatePresence mode="wait">
          {activeRender && (
            <motion.div
              key={activeRender.id}
              initial={{ opacity: 0, filter: "blur(12px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(8px)", y: -8 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-[#D4A359] uppercase font-bold">
                  {activeRender.category}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-white/40">
                  {String(current + 1).padStart(2, '0')} / {displayedRenders.length}
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
                {activeRender.title}
              </h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Paginación de Puntos Minimalista */}
      <div className="flex w-full items-center justify-center mt-3 gap-1.5 z-20">
        {displayedRenders.slice(0, Math.min(displayedRenders.length, 15)).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
              current === index 
                ? "w-7 bg-[#D4A359] shadow-[0_0_12px_rgba(212,163,89,0.5)]" 
                : "w-1.5 bg-white/20 hover:bg-white/40"
            )}
            aria-label={`Ir al render ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
