import { useState, useEffect, useCallback, useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Play, Pause, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '../ui/carousel';
import { ProjectIdentity, ProjectRender } from '../../config/projectIdentityConfig';

interface SkiperArchitecturalCarouselProps {
  renders: ProjectRender[];
  identity?: ProjectIdentity;
  className?: string;
  autoplay?: boolean;
  onOpenLightbox?: (render: ProjectRender, index: number) => void;
}

export function SkiperArchitecturalCarousel({
  renders,
  identity,
  className,
  autoplay = true,
  onOpenLightbox,
}: SkiperArchitecturalCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isAutoplayRunning, setIsAutoplayRunning] = useState(autoplay);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const primaryColor = identity?.theme.primaryColor || '#DFC47B';
  const primaryHover = identity?.theme.primaryHover || '#F1E29B';
  const brandLogoHorizontal = identity?.clientBrand?.logoHorizontalWhite || '/HACIENDA F22/branding/amho-horizontal-white.png';
  const brandName = identity?.brandName || 'AMHO Construcciones';
  const projectName = identity?.name || 'HACIENDA F22';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Si aún no hay renders cargados en el proyecto (ej. IBIZA A14 en configuración inicial),
  // generamos slots estructurales por categoría para conservar exactamente la misma estructura visual Skiper 54
  const effectiveRenders: ProjectRender[] = useMemo(() => {
    if (renders && renders.length > 0) return renders;
    return [
      {
        id: 'slot-fachada',
        title: `Fachada Principal & Volumetría • ${projectName}`,
        url: '',
        category: 'Fachada & Exteriores',
        description: `Espacio reservado para los renders exteriores y vistas aéreas de ${projectName}.`,
        aspectRatio: 1.5
      },
      {
        id: 'slot-salon',
        title: `Gran Salón Social & Doble Altura • ${projectName}`,
        url: '',
        category: 'Bienvenida & Salón',
        description: `Espacio reservado para los renders de bienvenida, pórtico y salón principal de ${projectName}.`,
        aspectRatio: 1.6
      },
      {
        id: 'slot-cocina',
        title: `Cocina de Autor & Comedor Integrado • ${projectName}`,
        url: '',
        category: 'Cocina de Autor',
        description: `Espacio reservado para los renders de gastronomía y carpintería arquitectónica de ${projectName}.`,
        aspectRatio: 1.4
      },
      {
        id: 'slot-piscina',
        title: `Piscina, Solárium & Terraza BBQ • ${projectName}`,
        url: '',
        category: 'Piscina & BBQ',
        description: `Espacio reservado para el oasis exterior, espejo de agua y zona social de ${projectName}.`,
        aspectRatio: 1.5
      },
      {
        id: 'slot-suites',
        title: `Master Suite & Baños Spa • ${projectName}`,
        url: '',
        category: 'Suites & Baños Spa',
        description: `Espacio reservado para las suites privadas, vestier y baños de ${projectName}.`,
        aspectRatio: 1.45
      }
    ];
  }, [renders, projectName]);

  // Categorías con conteo para selector minimalista
  const categories = useMemo(() => {
    const list = ['Todos', 'Fachada & Exteriores', 'Bienvenida & Salón', 'Cocina de Autor', 'Piscina & BBQ', 'Entretenimiento & Estudio', 'Suites & Baños Spa'];
    return list.map(cat => ({
      name: cat,
      count: cat === 'Todos' ? effectiveRenders.length : effectiveRenders.filter(r => r.category === cat).length
    })).filter(c => c.count > 0);
  }, [effectiveRenders]);

  // Lista de renders a mostrar (todos o filtrados)
  const displayedRenders = useMemo(() => {
    if (activeCategory === 'Todos') return effectiveRenders;
    return effectiveRenders.filter(r => r.category === activeCategory);
  }, [effectiveRenders, activeCategory]);

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
    <div className={cn("w-full relative flex flex-col items-center justify-center select-none py-2 sm:py-4", className)}>
      
      {/* 1. Selector Minimalista de Zonas Arquitectónicas (Scroll horizontal fluido en móvil, centrado en desktop) */}
      <div className="w-full max-w-7xl px-4 mb-4 sm:mb-8 z-20">
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 flex-nowrap sm:flex-wrap overflow-x-auto pb-2 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategoryChange(cat.name)}
                style={
                  isActive
                    ? {
                        backgroundColor: primaryColor,
                        color: '#060608',
                        borderColor: primaryColor,
                        boxShadow: `0 4px 20px ${primaryColor}55`,
                      }
                    : undefined
                }
                className={cn(
                  "px-3.5 py-2 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-1.5 border shrink-0",
                  isActive
                    ? "font-black sm:scale-105"
                    : "bg-white/[0.04] text-white/65 border-white/10 hover:text-white"
                )}
              >
                <span>{cat.name.split(' ')[0]}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                  isActive ? "bg-black/20 text-[#060608]" : "bg-white/10 text-white/50"
                )}>
                  {cat.count}
                </span>
              </button>
            );
          })}

          {/* Toggle sutil de autoplay */}
          <button
            type="button"
            onClick={toggleAutoplay}
            className="p-2 rounded-full bg-white/[0.04] border border-white/10 text-white/65 hover:text-white transition-all cursor-pointer ml-1 shrink-0"
            title={isAutoplayRunning ? "Pausar carrusel continuo" : "Reproducir carrusel continuo"}
          >
            {isAutoplayRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Embla Carousel con Arquitectura Skiper 54 (Adaptado para proporción perfecta en móvil y desktop) */}
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
          className="flex h-[285px] sm:h-[600px] md:h-[700px] lg:h-[800px] xl:h-[860px] 2xl:h-[900px] w-full items-center"
          style={{
            ['--stage-height' as any]: isMobile ? '285px' : 'clamp(560px, 78vh, 880px)'
          }}
        >
          {displayedRenders.map((render, index) => {
            const isSelected = current === index;
            // Proporción nativa de cada render para evitar cortes o deformación
            const ratio = render.aspectRatio || 1.33;
            const hasImage = Boolean(render.url && render.url.trim().length > 0);

            return (
              <CarouselItem
                key={render.id}
                className="relative flex h-[96%] sm:h-[94%] shrink-0 items-center justify-center transition-all duration-300 px-1.5 sm:px-3"
                style={
                  isMobile
                    ? {
                        width: '88vw',
                        maxWidth: '420px',
                      }
                    : {
                        // Amplio espacio de vista previa monumental respetando la proporción nativa del render
                        width: `min(calc(var(--stage-height, 800px) * 0.94 * ${ratio}), 95vw)`,
                        aspectRatio: `${ratio}`,
                      }
                }
              >
                {/* Contenedor animado Skiper 54 que muestra la imagen 100% completa sin recortar ningún detalle */}
                <motion.div
                  initial={false}
                  animate={{
                    clipPath: isSelected
                      ? "inset(0% 0 0% 0 round 1.35rem)"
                      : "inset(2% 0 2% 0 round 1.35rem)",
                    filter: isSelected
                      ? "brightness(1.02) contrast(1.02)"
                      : "brightness(0.58) contrast(0.92)",
                    scale: isSelected ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                  onClick={() => {
                    if (isSelected && hasImage && onOpenLightbox) {
                      onOpenLightbox(render, index);
                    } else if (api) {
                      api.scrollTo(index);
                    }
                  }}
                  style={
                    isSelected
                      ? {
                          borderColor: `${primaryColor}75`,
                          boxShadow: '0 20px 60px rgba(0,0,0,0.95)',
                        }
                      : undefined
                  }
                  className={cn(
                    "h-full w-full overflow-hidden rounded-[1.35rem] sm:rounded-[2rem] relative cursor-pointer group transition-all duration-500 bg-[#08080C] border",
                    isSelected 
                      ? "opacity-100" 
                      : "border-white/5 opacity-75 hover:opacity-100"
                  )}
                >
                  <div className="relative h-full w-full bg-[#08080C] flex items-center justify-center p-1 sm:p-2">
                    {hasImage ? (
                      <img
                        src={encodeURI(render.url)}
                        alt={render.title}
                        loading="lazy"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl sm:rounded-2xl transition-transform duration-700 ease-out"
                      />
                    ) : (
                      /* Estado Arquitectónico Estructurado cuando el render está en proceso de carga */
                      <div
                        className="relative w-full h-full rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center p-6 sm:p-12 text-center overflow-hidden"
                        style={{
                          borderColor: `${primaryColor}28`,
                          background: `radial-gradient(circle at 50% 35%, ${primaryColor}14, rgba(8,9,12,0.96) 70%)`
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-[0.06] pointer-events-none"
                          style={{
                            backgroundImage: `linear-gradient(to right, ${primaryColor} 1px, transparent 1px), linear-gradient(to bottom, ${primaryColor} 1px, transparent 1px)`,
                            backgroundSize: '36px 36px'
                          }}
                        />
                        <div
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 border"
                          style={{
                            backgroundColor: `${primaryColor}15`,
                            borderColor: `${primaryColor}40`
                          }}
                        >
                          <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: primaryHover }} />
                        </div>
                        <span
                          className="text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.28em] mb-2"
                          style={{ color: primaryHover }}
                        >
                          {render.category} • SLOT ARQUITECTÓNICO
                        </span>
                        <h4 className="text-base sm:text-2xl font-black text-white uppercase tracking-tight max-w-lg mb-2">
                          {render.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-white/55 max-w-md leading-relaxed">
                          {render.description}
                        </p>
                      </div>
                    )}

                    {/* Etiqueta táctil en móvil para indicar ampliación */}
                    {isSelected && hasImage && (
                      <div
                        className="sm:hidden absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border pointer-events-none flex items-center gap-1.5"
                        style={{ borderColor: `${primaryColor}55` }}
                      >
                        <Maximize2 className="w-2.5 h-2.5" style={{ color: primaryHover }} />
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-white/90">
                          Toca para 4K
                        </span>
                      </div>
                    )}

                    {/* Sello de marca en esquina inferior derecha del slide activo */}
                    {isSelected && (
                      <div
                        className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-20 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-black/65 backdrop-blur-md border pointer-events-none flex items-center gap-1.5"
                        style={{ borderColor: `${primaryColor}45` }}
                      >
                        <img
                          src={encodeURI(brandLogoHorizontal)}
                          alt={brandName}
                          className="h-3.5 sm:h-4.5 w-auto object-contain opacity-90"
                        />
                      </div>
                    )}

                    {/* Botón flotante para ampliar render a pantalla completa */}
                    {hasImage && onOpenLightbox && (
                      <button
                        type="button"
                        aria-label="Ampliar render"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLightbox(render, index);
                        }}
                        className={cn(
                          "absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/75 text-white border border-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-xl",
                          isSelected ? "opacity-95 hover:opacity-100 hover:scale-110" : "opacity-0 group-hover:opacity-100"
                        )}
                        title="Ver en pantalla completa"
                      >
                        <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

        {/* 3. Botones Flotantes de Navegación Lateral (Visibles en tablet y desktop) */}
        <div className="hidden sm:flex pointer-events-none absolute inset-y-0 left-0 right-0 items-center justify-between px-3 sm:px-6 z-30">
          <button
            type="button"
            aria-label="Render anterior"
            onClick={() => api?.scrollPrev()}
            className="pointer-events-auto w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/70 text-white border border-white/15 flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-xl shadow-2xl hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <button
            type="button"
            aria-label="Siguiente render"
            onClick={() => api?.scrollNext()}
            className="pointer-events-auto w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/70 text-white border border-white/15 flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-xl shadow-2xl hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </Carousel>

      {/* 4. Título Minimalista Central + Controles Táctiles Rápidos en Móvil */}
      <div className="w-full min-h-[64px] flex flex-col items-center justify-center mt-3 px-4 z-20">
        <AnimatePresence mode="wait">
          {activeRender && (
            <motion.div
              key={activeRender.id}
              initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(6px)", y: -6 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center text-center max-w-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] uppercase font-bold"
                  style={{ color: primaryHover }}
                >
                  {activeRender.category}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-white/50">
                  {String(current + 1).padStart(2, '0')} / {displayedRenders.length}
                </span>
              </div>
              <h3 className="text-base sm:text-2xl font-bold tracking-tight text-white uppercase font-sans leading-snug">
                {activeRender.title}
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de control táctil ergonómica para móvil */}
        <div className="flex sm:hidden items-center justify-center gap-4 mt-3">
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.06] text-white border border-white/15 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            <span>Anterior</span>
          </button>

          {activeRender && activeRender.url && onOpenLightbox && (
            <button
              type="button"
              onClick={() => onOpenLightbox(activeRender, current)}
              style={{
                backgroundColor: `${primaryColor}22`,
                borderColor: `${primaryColor}65`,
                color: primaryHover,
              }}
              className="px-3.5 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Ver 4K</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => api?.scrollNext()}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.06] text-white border border-white/15 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: primaryColor }} />
          </button>
        </div>
      </div>

      {/* 5. Paginación de Puntos Minimalista */}
      <div className="flex w-full items-center justify-center mt-3 gap-1.5 z-20 px-4">
        {displayedRenders.slice(0, Math.min(displayedRenders.length, 15)).map((_, index) => {
          const isCurrent = current === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => api?.scrollTo(index)}
              style={
                isCurrent
                  ? {
                      backgroundColor: primaryColor,
                      boxShadow: `0 0 12px ${primaryColor}80`,
                    }
                  : undefined
              }
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                isCurrent 
                  ? "w-6 sm:w-7" 
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Ir al render ${index + 1}`}
            />
          );
        })}
      </div>

    </div>
  );
}
