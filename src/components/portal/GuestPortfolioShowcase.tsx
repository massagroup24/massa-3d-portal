import { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowUpRight, Sparkles, MapPin, Maximize, Rotate3d, LogIn } from 'lucide-react';
import { MassaLogo } from '../ui/MassaLogo';

export interface PortfolioWork {
  id: string;
  name: string;
  category: string;
  location: string;
  area: string;
  year: string;
  thumbnail: string;
  bgImage: string;
}

// Curated collection of high-end architectural works by MASSA GROUP (Obras reales en existencia)
export const PORTFOLIO_WORKS: PortfolioWork[] = [
  {
    id: 'project_hacienda_f22',
    name: 'HACIENDA F22',
    category: 'Residencia Campestre Luxury',
    location: 'Cúcuta, Norte de Santander',
    area: 'Por definir m²',
    year: '2026',
    thumbnail: '',
    bgImage: '',
  },
  {
    id: 'project_ibiza_a14',
    name: 'IBIZA A14',
    category: 'Villa Campestre de Autor',
    location: 'Cúcuta, Norte de Santander',
    area: 'Por definir m²',
    year: '2026',
    thumbnail: '',
    bgImage: '',
  },
  {
    id: 'project_1781963945215',
    name: 'RESIDENCIA JEJÉN',
    category: 'Residencia Unifamiliar Luxury',
    location: 'Cali, Colombia',
    area: '480 m²',
    year: '2026',
    thumbnail: '',
    bgImage: '',
  },
  {
    id: 'project_1782912175010',
    name: 'SEDE MARQUIMODA',
    category: 'Sede Corporativa & Atelier',
    location: 'Valle del Cauca, Colombia',
    area: '620 m²',
    year: '2026',
    thumbnail: '',
    bgImage: '',
  },
];

interface TitleWordPart {
  text: string;
  className: string;
}

interface TitleLineData {
  words: TitleWordPart[];
}

interface ShowcaseTitleData {
  key: string;
  fontSize: string;
  lines: TitleLineData[];
}

function getShowcaseTitleData(activeWork: PortfolioWork | null): ShowcaseTitleData {
  if (!activeWork) {
    // Título monumental de dos renglones: PORTAFOLIO arriba, MASSA 2026 abajo (con MASSA en verde lima)
    return {
      key: 'brand-portfolio-2026',
      fontSize: 'text-6xl sm:text-7xl md:text-8xl lg:text-[10vw] xl:text-[11.5vw]',
      lines: [
        {
          words: [
            { 
              text: 'PORTAFOLIO', 
              className: 'text-white/95 filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]' 
            }
          ]
        },
        {
          words: [
            { 
              text: 'MASSA', 
              className: 'text-[#9CD01A] filter drop-shadow-[0_10px_35px_rgba(156,208,26,0.5)]' 
            },
            { 
              text: '2026', 
              className: 'text-white/90 filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]' 
            }
          ]
        }
      ]
    };
  }

  // Título de una obra arquitectónica activa
  const words = activeWork.name.trim().split(/\s+/);
  const maxWordLength = Math.max(...words.map(w => w.length));

  let fontSize = '';
  if (words.length > 1) {
    if (maxWordLength <= 6) {
      fontSize = 'text-7xl sm:text-8xl md:text-[11vw] lg:text-[13.5vw] xl:text-[15.5vw]';
    } else if (maxWordLength <= 8) {
      fontSize = 'text-6xl sm:text-7xl md:text-[10vw] lg:text-[12vw] xl:text-[14vw]';
    } else {
      fontSize = 'text-5xl sm:text-6xl md:text-[9vw] lg:text-[11vw] xl:text-[12.5vw]';
    }
  } else {
    if (activeWork.name.length <= 8) {
      fontSize = 'text-[18vw] sm:text-9xl md:text-[13vw] lg:text-[15.5vw] xl:text-[17vw]';
    } else if (activeWork.name.length <= 11) {
      fontSize = 'text-[15.5vw] sm:text-8xl md:text-[11.5vw] lg:text-[14vw] xl:text-[15.5vw]';
    } else {
      fontSize = 'text-[13vw] sm:text-7xl md:text-[9.5vw] lg:text-[11.5vw] xl:text-[13vw]';
    }
  }

  return {
    key: `work-${activeWork.id}`,
    fontSize,
    lines: words.map((w) => ({
      words: [
        {
          text: w,
          className: 'text-[#9CD01A] filter drop-shadow-[0_10px_35px_rgba(156,208,26,0.35)]'
        }
      ]
    }))
  };
}


interface GuestPortfolioShowcaseProps {
  onSelectProject: (projectId: string) => void;
  onOpenLogin: () => void;
  onContactCommercial?: () => void;
  onBackToCommercial?: () => void;
}

// Icono de barra lateral exacto al solicitado en la captura de pantalla
function SidebarToggleIcon({ className = "w-5 h-5", active = false }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect 
        x="3.5" 
        y="3.5" 
        width="17" 
        height="17" 
        rx="4.5" 
        className={active ? "stroke-[#9CD01A]" : "stroke-white/80"} 
        strokeWidth="1.8" 
      />
      <rect 
        x="6" 
        y="6" 
        width="4.5" 
        height="12" 
        rx="1.8" 
        className={active ? "fill-[#9CD01A]" : "fill-white/80"} 
      />
    </svg>
  );
}

// Variantes para la animación de escalera monumental letra por letra (100% libre de cortes o planos 3D)
const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 38,
    scale: 0.92,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      delay: i * 0.038,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: -30,
    scale: 0.92,
    transition: {
      duration: 0.2,
      delay: i * 0.014,
      ease: [0.55, 0.055, 0.675, 0.19] as const,
    },
  }),
};

export function GuestPortfolioShowcase({
  onSelectProject,
  onOpenLogin,
  onContactCommercial,
  onBackToCommercial,
}: GuestPortfolioShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileIcon, setMobileIcon] = useState<'logo' | 'sidebar'>('logo');
  const [autoCycleIndex, setAutoCycleIndex] = useState<number>(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const userInteractionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Detectar si es dispositivo móvil / táctil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Registrar actividad del usuario y reanudar showroom tras inactividad
  const registerUserActivity = () => {
    setIsUserInteracting(true);
    if (userInteractionTimeoutRef.current) {
      clearTimeout(userInteractionTimeoutRef.current);
    }
    // Tras 4.5s de inactividad táctil, se reanuda el ciclo showroom
    userInteractionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 4500);
  };

  useEffect(() => {
    return () => {
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, []);

  // 2. Alternancia suave del icono del logo en móviles cada 3.2s
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setMobileIcon((prev) => (prev === 'logo' ? 'sidebar' : 'logo'));
    }, 3200);
    return () => clearInterval(iconInterval);
  }, []);

  // 3. Modo Showroom / Auto-preview en celulares mientras el usuario no toque la pantalla
  useEffect(() => {
    if (!isMobile || isUserInteracting) return;

    const showroomTimer = setInterval(() => {
      setAutoCycleIndex((prev) => {
        const next = (prev + 1) % PORTFOLIO_WORKS.length;
        const container = carouselRef.current;
        if (container) {
          const item = container.children[next] as HTMLElement | undefined;
          if (item) {
            item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
        return next;
      });
    }, 3600);

    return () => clearInterval(showroomTimer);
  }, [isMobile, isUserInteracting]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    }
    if (isSidebarOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen]);

  // Obra activa: prioridad al hover del mouse o selección manual; en reposo en móvil toma el autoCycleIndex
  const effectiveIndex = hoveredIndex !== null 
    ? hoveredIndex 
    : (isMobile && !isUserInteracting ? autoCycleIndex : null);
  const activeWork = effectiveIndex !== null ? PORTFOLIO_WORKS[effectiveIndex] : null;
  const titleData = getShowcaseTitleData(activeWork);

  // Manejador al tocar/clicar una miniatura
  const handleWorkClick = (idx: number, workId: string) => {
    registerUserActivity();
    if (isMobile) {
      // En móvil, si la obra no está activa, seleccionarla para ver la animación de escalera y detalles
      if (effectiveIndex !== idx) {
        setHoveredIndex(idx);
        const container = carouselRef.current;
        if (container) {
          const item = container.children[idx] as HTMLElement | undefined;
          if (item) {
            item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
        return;
      }
    }
    // Si ya está seleccionada (o en desktop), abrir el proyecto
    onSelectProject(workId);
  };

  // Detección de desplazamiento en móvil para cambiar obra al deslizar con el dedo
  const handleCarouselScroll = () => {
    registerUserActivity();
    if (!isMobile || !carouselRef.current) return;
    const container = carouselRef.current;
    const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;

    let closestIdx = -1;
    let minDistance = Infinity;

    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i] as HTMLElement;
      if (!child || !child.getBoundingClientRect) continue;
      const childCenter = child.getBoundingClientRect().left + child.clientWidth / 2;
      const dist = Math.abs(containerCenter - childCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    if (minDistance < 85 && closestIdx !== -1 && hoveredIndex !== closestIdx) {
      setHoveredIndex(closestIdx);
    }
  };

  const handleCommercial = () => {
    if (onContactCommercial) {
      onContactCommercial();
    } else {
      const msg = encodeURIComponent("Hola Massa Group, estuve explorando su portafolio público VIEW y quisiera cotizar un diseño arquitectónico.");
      window.open(`https://wa.me/573108924410?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D0D0E] text-[#F5F5F5] overflow-x-hidden flex flex-col justify-between selection:bg-[#9CD01A] selection:text-[#0D0D0E]">
      
      {/* 1. Fondo Ambiental Cinematográfico Reactivo */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Fondo tenue del proyecto activo */}
        <AnimatePresence mode="wait">
          {activeWork ? (
            <m.div
              key={activeWork.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.22, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-cover bg-center filter blur-2xl transform"
              style={{ backgroundImage: `url(${activeWork.bgImage})` }}
            />
          ) : (
            <m.div
              key="default-ambient"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-[radial-gradient(circle_900px_at_50%_35%,rgba(156,208,26,0.18),transparent_75%)]"
            />
          )}
        </AnimatePresence>

        {/* Cuadrícula sutil de perspectiva */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-transparent to-[#0D0D0E]/80" />
      </div>

      {/* 2. Top Header de Bienvenida & Marca MASSA */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 pb-2">
        <div className="w-full h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* LADO IZQUIERDO (flex-1): Botón de Menú Isotipo MASSA + Volver a Comercial */}
          <div className="flex-1 flex items-center justify-start gap-2 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              type="button"
              className="group relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer hover:scale-103 active:scale-97 shrink-0"
              title="Abrir índice de proyectos"
            >
              {/* Isotipo normal (en móvil se alterna con mobileIcon, en desktop responde al hover) */}
              <div className={`transition-all duration-500 pointer-events-none ${
                mobileIcon === 'sidebar' 
                  ? 'opacity-0 scale-75 md:opacity-100 md:scale-100 md:group-hover:opacity-0 md:group-hover:scale-75' 
                  : 'opacity-100 scale-100 md:group-hover:opacity-0 md:group-hover:scale-75'
              }`}>
                <MassaLogo size="md" glow={false} />
              </div>

              {/* Icono de barra lateral (en móvil alterna, en desktop aparece al hacer hover) */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none ${
                mobileIcon === 'sidebar' 
                  ? 'opacity-100 scale-100 md:opacity-0 md:scale-75 md:group-hover:opacity-100 md:group-hover:scale-100' 
                  : 'opacity-0 scale-75 md:opacity-0 md:scale-75 md:group-hover:opacity-100 md:group-hover:scale-100'
              }`}>
                <SidebarToggleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#9CD01A]" active={true} />
              </div>

              {/* Micro-anillo de pulso verde en móvil para guiar la acción táctil */}
              <span className="md:hidden absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9CD01A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9CD01A]" />
              </span>
            </button>

            {onBackToCommercial && (
              <button
                type="button"
                onClick={onBackToCommercial}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-[#9CD01A] text-white/80 hover:text-black border border-white/10 hover:border-[#9CD01A] text-xs font-bold transition-all cursor-pointer"
                title="Volver al Catálogo y Cotizador Comercial"
              >
                <span>← Catálogo</span>
              </button>
            )}
          </div>

          {/* CENTRO (shrink-0): Logo Oficial MASSA GROUP 100% Centrado sin riesgo de solapamiento */}
          <div className="shrink-0 flex items-center justify-center px-1 sm:px-4">
            <img 
              src="/MASSA_USO.png" 
              alt="MASSA GROUP" 
              className="h-5 sm:h-7 md:h-8 w-auto object-contain filter drop-shadow-[0_2px_14px_rgba(156,208,26,0.3)] transition-all duration-300 hover:scale-103 cursor-pointer"
            />
          </div>

          {/* LADO DERECHO (flex-1): Botón de Iniciar Sesión */}
          <div className="flex-1 flex items-center justify-end">
            <button
              onClick={onOpenLogin}
              type="button"
              className="inline-flex items-center justify-center gap-2 h-10 sm:h-11 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer hover:scale-103 active:scale-97 shrink-0"
              title="Ingresar como Propietario o Arquitecto"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
              <span className="sm:hidden text-xs">Login</span>
            </button>
          </div>

        </div>

        {/* Drawer Lateral Desplegable con Regla CAD (Exacto a la captura de pantalla 2) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop oscuro */}
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
              />

              {/* Panel de navegación lateral */}
              <m.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="relative z-10 w-80 sm:w-96 h-full bg-[#0D0D0E]/95 backdrop-blur-2xl border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between"
              >
                {/* Header del drawer: botón de toggle en la esquina superior izquierda */}
                <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-white/[0.06]">
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    type="button"
                    className="w-11 h-11 rounded-2xl bg-[#161618] border border-[#9CD01A]/40 flex items-center justify-center shadow-lg cursor-pointer hover:scale-103 active:scale-97 group transition-all"
                    title="Cerrar navegación"
                  >
                    <SidebarToggleIcon className="w-5 h-5 text-[#9CD01A]" active={true} />
                  </button>

                  <div className="text-right">
                    <span className="text-[11px] font-black tracking-[0.25em] text-[#9CD01A] uppercase block">
                      MASSA GROUP
                    </span>
                    <span className="text-[9px] font-mono text-white/40 tracking-wider">
                      ÍNDICE DE OBRAS // VIEW
                    </span>
                  </div>
                </div>

                {/* Lista Vertical con Ticks de Regla Arquitectónica CAD */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 sm:px-4">
                  <div className="text-[10px] font-mono tracking-widest text-white/30 uppercase px-3 mb-2">
                    // CATÁLOGO DE ARQUITECTURA
                  </div>

                  <div className="space-y-0.5">
                    {PORTFOLIO_WORKS.map((work, idx) => {
                      const itemNumber = idx + 1;
                      const isCurrent = (activeWork ? activeWork.id : PORTFOLIO_WORKS[0].id) === work.id;

                      return (
                        <button
                          key={work.id}
                          type="button"
                          onMouseEnter={() => !isMobile && setHoveredIndex(idx)}
                          onClick={() => {
                            setHoveredIndex(idx);
                            setIsSidebarOpen(false);
                            registerUserActivity();
                            const container = carouselRef.current;
                            if (container) {
                              const item = container.children[idx] as HTMLElement | undefined;
                              if (item) {
                                item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                              }
                            }
                          }}
                          className={`w-full group flex items-center text-left py-2 px-1 rounded-xl transition-all cursor-pointer ${
                            isCurrent
                              ? 'text-[#9CD01A] font-bold'
                              : 'text-white/45 hover:text-white/90 hover:bg-white/[0.03]'
                          }`}
                        >
                          {/* Marca de regla CAD (línea horizontal de extensión hacia el elemento activo) */}
                          <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                            {isCurrent ? (
                              <div className="w-8 h-[2px] bg-[#9CD01A] shadow-[0_0_8px_#9CD01A]" />
                            ) : (
                              <div className="w-3 h-[1px] bg-white/20 group-hover:w-5 group-hover:bg-white/60 transition-all" />
                            )}
                          </div>

                          {/* Número con ceros y nombre */}
                          <div className="flex items-baseline gap-2.5 min-w-0 flex-1">
                            <span className={`text-xs font-mono shrink-0 ${isCurrent ? 'text-[#9CD01A] font-bold' : 'text-white/30 group-hover:text-white/60'}`}>
                              {itemNumber}
                            </span>
                            <span className="text-xs sm:text-sm tracking-wide truncate">
                              {work.name}
                            </span>
                          </div>

                          <span className={`text-[10px] font-mono shrink-0 ml-2 hidden sm:block ${isCurrent ? 'text-[#9CD01A]/80' : 'text-white/25 group-hover:text-white/45'}`}>
                            {work.area}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Separador de regla */}
                  <div className="my-4 px-2">
                    <div className="h-px bg-white/[0.08]" />
                  </div>

                  <div className="text-[10px] font-mono tracking-widest text-white/30 uppercase px-3 mb-2">
                    // EXPERIENCIAS & ACCESO
                  </div>

                  <div className="space-y-0.5">
                    {/* Recorrido Virtual 360° */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(activeWork ? activeWork.id : PORTFOLIO_WORKS[0].id);
                        setIsSidebarOpen(false);
                      }}
                      className="w-full group flex items-center text-left py-2 px-1 rounded-xl text-white/50 hover:text-white/90 hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                        <div className="w-3 h-[1px] bg-white/20 group-hover:w-5 group-hover:bg-[#9CD01A] transition-all" />
                      </div>
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="text-xs font-medium tracking-wide">Recorrido Virtual 360°</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#9CD01A]/10 text-[#9CD01A] font-mono font-bold">3D</span>
                      </div>
                    </button>

                    {/* Portal Propietarios */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenLogin();
                        setIsSidebarOpen(false);
                      }}
                      className="w-full group flex items-center text-left py-2 px-1 rounded-xl text-white/50 hover:text-white/90 hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                        <div className="w-3 h-[1px] bg-white/20 group-hover:w-5 group-hover:bg-white/60 transition-all" />
                      </div>
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="text-xs font-medium tracking-wide">Portal Propietarios</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono">Login</span>
                      </div>
                    </button>

                    {/* Cotizar Proyecto */}
                    <button
                      type="button"
                      onClick={() => {
                        handleCommercial();
                        setIsSidebarOpen(false);
                      }}
                      className="w-full group flex items-center text-left py-2 px-1 rounded-xl text-[#9CD01A] hover:bg-[#9CD01A]/10 transition-all cursor-pointer"
                    >
                      <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                        <div className="w-5 h-[2px] bg-[#9CD01A] shadow-[0_0_6px_#9CD01A]" />
                      </div>
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="text-xs font-bold tracking-wide">Cotizar Proyecto</span>
                        <span className="text-[9px] font-mono text-[#9CD01A]">WhatsApp</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Footer con atajo para salir */}
                <div className="p-4 sm:p-5 border-t border-white/[0.06] bg-[#0A0A0B] flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>ESC para cerrar</span>
                  <span className="text-[#9CD01A]">VIEW V2.0</span>
                </div>
              </m.aside>
            </div>
          )}
        </AnimatePresence>

      </header>

      {/* 3. Área Central: Carrusel de Thumbnails + Tipografía Monumental SKIPER6 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pt-4 sm:pt-6 pb-6 max-w-7xl mx-auto w-full">
        
        {/* Tira Superior de Miniaturas (Inamovible: anclada en la parte superior sin desplazamientos) */}
        <div className="relative mb-3 sm:mb-6 max-w-full shrink-0 z-20">
          <div 
            ref={carouselRef}
            onTouchStart={registerUserActivity}
            onScroll={handleCarouselScroll}
            onWheel={registerUserActivity}
            onMouseLeave={() => !isMobile && setHoveredIndex(null)}
            className="flex items-center justify-start md:justify-center gap-2 sm:gap-3.5 p-2 sm:p-2.5 rounded-3xl bg-[#141416]/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-x-auto no-scrollbar max-w-full touch-pan-x"
          >
            {PORTFOLIO_WORKS.map((work, idx) => {
              const isHovered = hoveredIndex === idx;
              const isAutoActive = isMobile && !isUserInteracting && autoCycleIndex === idx;
              const isItemActive = isHovered || isAutoActive;

              return (
                <div
                  key={work.id}
                  onMouseEnter={() => !isMobile && setHoveredIndex(idx)}
                  onTouchStart={registerUserActivity}
                  onClick={() => handleWorkClick(idx, work.id)}
                  className="relative group cursor-pointer shrink-0"
                >
                  {/* Contenedor de la miniatura con elevación y zoom */}
                  <m.div
                    animate={{
                      y: isItemActive ? (isMobile ? -10 : -16) : 0,
                      scale: isItemActive ? (isMobile ? 1.14 : 1.25) : 1,
                      zIndex: isItemActive ? 30 : 10,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 24,
                    }}
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      isItemActive
                        ? 'border-[#9CD01A] shadow-[0_12px_30px_rgba(156,208,26,0.5)] ring-2 ring-[#9CD01A]/30'
                        : 'border-white/15 hover:border-white/40'
                    }`}
                  >
                    {work.thumbnail ? (
                      <img
                        src={work.thumbnail}
                        alt={work.name}
                        className="w-full h-full object-cover transform duration-500 group-hover:scale-115"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#15161a] p-1 text-center select-none">
                        <span className="text-[10px] sm:text-xs font-mono font-black text-[#9CD01A]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[7px] sm:text-[8px] font-mono text-white/50 tracking-tighter uppercase truncate max-w-full">
                          {work.name.split(' ')[0]}
                        </span>
                      </div>
                    )}
                    <div className={`absolute inset-0 transition-colors ${isItemActive ? 'bg-transparent' : 'bg-black/20 group-hover:bg-transparent'}`} />
                  </m.div>

                  {/* Indicador Flotante con Flecha ↗ animada con Spring (Estilo skiper6) */}
                  {isItemActive && (
                    <m.div
                      layoutId="hover-arrow-indicator"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-40 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#9CD01A] text-[#0D0D0E] flex items-center justify-center shadow-[0_0_18px_rgba(156,208,26,0.85)] pointer-events-none"
                    >
                      <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3]" />
                    </m.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Swipe hint sutil en móvil para invitar al deslizamiento horizontal */}
          {isMobile && !isUserInteracting && (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-mono text-[#9CD01A] tracking-wider animate-pulse select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
              <span>DESLIZA PARA VER MÁS OBRAS ➔</span>
            </div>
          )}
        </div>

        {/* Tipografía Monumental Dinámica: Ocupa el espacio restante centrado sin alterar la posición de la barra */}
        <div 
          onClick={() => activeWork && onSelectProject(activeWork.id)}
          className={`flex-1 w-full flex flex-col items-center justify-center select-none ${activeWork ? 'cursor-pointer group' : ''}`}
        >
          {/* Tipografía Monumental 100% Libre: Sin cajas restrictivas, sin overflow-hidden ni recortes */}
          <div className="w-full flex items-center justify-center py-2 sm:py-4">
            <AnimatePresence mode="wait">
              <m.div
                key={titleData.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="w-full flex items-center justify-center select-none"
              >
                <h1 
                  className={`font-monumental ${titleData.fontSize} tracking-wide text-center leading-[0.82] sm:leading-[0.86] flex flex-col items-center justify-center group-hover:scale-102 transition-transform uppercase`}
                  style={{
                    WebkitFontSmoothing: 'antialiased',
                  }}
                >
                  {titleData.lines.map((line, lineIndex) => (
                    <div
                      key={`line-${lineIndex}`}
                      className="flex items-center justify-center gap-2.5 sm:gap-4 whitespace-nowrap"
                    >
                      {line.words.map((wordObj, wordIndex) => {
                        let lettersBefore = 0;
                        for (let l = 0; l < lineIndex; l++) {
                          for (let w = 0; w < titleData.lines[l].words.length; w++) {
                            lettersBefore += titleData.lines[l].words[w].text.length;
                          }
                        }
                        for (let w = 0; w < wordIndex; w++) {
                          lettersBefore += line.words[w].text.length;
                        }

                        return (
                          <div key={`word-${wordIndex}`} className={`flex items-center ${wordObj.className}`}>
                            {wordObj.text.split('').map((char, charIndex) => {
                              const globalIndex = lettersBefore + charIndex;
                              return (
                                <m.span
                                  key={`${titleData.key}-${lineIndex}-${wordIndex}-${charIndex}`}
                                  custom={globalIndex}
                                  variants={letterVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  className="inline-block will-change-transform"
                                  style={{ 
                                    display: 'inline-block',
                                  }}
                                >
                                  {char}
                                </m.span>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </h1>
              </m.div>
            </AnimatePresence>
          </div>

          {/* Subtítulo Dinámico Interactivo con altura reservada para que no cause saltos */}
          <div className="mt-2 sm:mt-3 h-[44px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeWork ? (
                <m.div
                  key={`sub-${activeWork.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#161618]/90 backdrop-blur-xl border border-[#9CD01A]/30 text-xs sm:text-sm text-white shadow-xl group-hover:border-[#9CD01A]"
                >
                  <span className="flex items-center gap-1 text-[#9CD01A] font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {activeWork.location}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="flex items-center gap-1 text-white/80">
                    <Maximize className="w-3.5 h-3.5 text-[#9CD01A]" />
                    {activeWork.area}
                  </span>
                  <span className="text-white/30 hidden md:inline">•</span>
                  <span className="text-white/70 hidden md:inline">
                    {activeWork.category}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-[#9CD01A] font-bold flex items-center gap-1">
                    <span>{isMobile ? 'Toca para ingresar' : 'Explorar Obra'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </m.div>
              ) : (
                <m.div
                  key="default-sub"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#A3A3A3]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#9CD01A]" />
                  <span>{isMobile ? 'Toca cualquier miniatura para explorar • Desliza para ver más' : 'Pasa el cursor sobre cada miniatura para descubrir la obra • Clic para ingresar'}</span>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* 4. Footer con Características Públicas Disponibles */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-5">
        
        <div className="flex items-center gap-4 sm:gap-6 text-xs text-white/60 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
            <span>Renders 4K Ultra HD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Rotate3d className="w-3.5 h-3.5 text-[#9CD01A]" />
            <span>Recorridos 360° Inmersivos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
            <span>Fichas Técnicas & Materiales</span>
          </div>
        </div>

        <div className="text-[11px] text-white/40 font-mono text-center sm:text-right">
          MASSA GROUP • ARQUITECTURA & INGENIERÍA 2026
        </div>

      </footer>

    </div>
  );
}
