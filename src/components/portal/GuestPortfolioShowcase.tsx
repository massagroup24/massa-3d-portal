import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Sparkles, MapPin, Maximize, Rotate3d, MessageSquare, LogIn } from 'lucide-react';
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

// Curated collection of high-end architectural works by MASSA GROUP
export const PORTFOLIO_WORKS: PortfolioWork[] = [
  {
    id: 'villa-serena',
    name: 'VILLA SERENA',
    category: 'Residencia Unifamiliar Luxury',
    location: 'Valle del Cauca',
    area: '480 m²',
    year: '2026',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'marquimoda',
    name: 'MARQUIMODA',
    category: 'Sede Corporativa & Oficinas',
    location: 'Valle del Cauca',
    area: '620 m²',
    year: '2026',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
    bgImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'edinson-jejen',
    name: 'EDINSON JEJEN',
    category: 'Diseño Residencial Contemporáneo',
    location: 'Valle del Cauca',
    area: '420 m²',
    year: '2025',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
    bgImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'casa-del-lago',
    name: 'CASA DEL LAGO',
    category: 'Villa Campestre & Biofílica',
    location: 'Calima, Colombia',
    area: '520 m²',
    year: '2026',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    bgImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'penthouse-massa',
    name: 'PENTHOUSE MASSA',
    category: 'Penthouse Dúplex Panorámico',
    location: 'Cali / Peñón',
    area: '380 m²',
    year: '2025',
    thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
    bgImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'altos-del-valle',
    name: 'ALTOS DEL VALLE',
    category: 'Estructura Monolítica & Concreto',
    location: 'Dapa, Valle',
    area: '610 m²',
    year: '2026',
    thumbnail: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80',
    bgImage: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'residencia-bambu',
    name: 'RESIDENCIA BAMBÚ',
    category: 'Estrategia Bioclimática & Spa',
    location: 'Valle del Cauca',
    area: '440 m²',
    year: '2025',
    thumbnail: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80',
    bgImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'torre-horizonte',
    name: 'TORRE HORIZONTE',
    category: 'Sky Villas & Penthouse',
    location: 'Cali / Peñón',
    area: '780 m²',
    year: '2026',
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    bgImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'casa-cantera',
    name: 'CASA CANTERA',
    category: 'Piedra Natural & Volúmenes Flotantes',
    location: 'Valle del Cauca',
    area: '560 m²',
    year: '2025',
    thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=400&q=80',
    bgImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=85',
  },
];

function getTitleFontSize(title: string): string {
  const len = title.length;
  if (len <= 8) {
    return 'text-5xl sm:text-7xl md:text-8xl lg:text-[8.5vw] xl:text-[9.5vw]';
  }
  if (len <= 11) {
    // "PORTAFOLIO", "CASA ANDES" (10-11 caracteres)
    return 'text-4xl sm:text-6xl md:text-7xl lg:text-[7.2vw] xl:text-[8vw]';
  }
  if (len <= 14) {
    // "VILLA SERENA" (12 caracteres)
    return 'text-3xl sm:text-5xl md:text-6xl lg:text-[6vw] xl:text-[6.8vw]';
  }
  // Títulos largos (15+ caracteres como "RESIDENCIA BAMBÚ", "PENTHOUSE MASSA", etc.)
  return 'text-2xl sm:text-4xl md:text-5xl lg:text-[4.8vw] xl:text-[5.5vw]';
}


interface GuestPortfolioShowcaseProps {
  onSelectProject: (projectId: string) => void;
  onOpenLogin: () => void;
  onContactCommercial?: () => void;
}

export function GuestPortfolioShowcase({
  onSelectProject,
  onOpenLogin,
  onContactCommercial,
}: GuestPortfolioShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeWork = hoveredIndex !== null ? PORTFOLIO_WORKS[hoveredIndex] : null;
  const currentTitle = activeWork ? activeWork.name : 'PORTAFOLIO';
  const isAccent = !!activeWork;
  const currentFontSize = getTitleFontSize(currentTitle);

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
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 flex items-center justify-between gap-4">
        
        {/* Marca MASSA GROUP + VIEW */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#161618] border border-white/10 p-2 flex items-center justify-center shadow-xl">
            <MassaLogo size="sm" glow={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-[0.25em] text-[#9CD01A] uppercase">
                MASSA GROUP
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/10 text-white/80 font-mono tracking-wider">
                VIEW
              </span>
            </div>
            <span className="text-[11px] text-white/50 font-medium block">
              Portal Público de Arquitectura
            </span>
          </div>
        </div>

        {/* Badge Central Informativo (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-white/80 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_8px_#9CD01A] animate-pulse" />
          <span>Exploración de Obras • Acceso Invitado</span>
        </div>

        {/* Botones de Acción (Contacto Comercial + Iniciar Sesión) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleCommercial}
            type="button"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#9CD01A]/15 hover:bg-[#9CD01A] border border-[#9CD01A]/30 text-xs font-bold text-[#9CD01A] hover:text-[#0D0D0E] shadow-[0_0_15px_rgba(156,208,26,0.15)] transition-all cursor-pointer hover:scale-103"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Cotizar Proyecto</span>
          </button>

          <button
            onClick={onOpenLogin}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer hover:scale-103 active:scale-97"
            title="Ingresar como Propietario o Arquitecto"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Iniciar Sesión</span>
            <span className="sm:hidden">Login</span>
          </button>
        </div>

      </header>

      {/* 3. Área Central: Carrusel de Thumbnails + Tipografía Monumental SKIPER6 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pt-4 sm:pt-6 pb-6 max-w-7xl mx-auto w-full">
        
        {/* Tira Superior de Miniaturas (Inamovible: anclada en la parte superior sin desplazamientos) */}
        <div className="relative mb-3 sm:mb-6 max-w-full shrink-0 z-20">
          <div 
            onMouseLeave={() => setHoveredIndex(null)}
            className="flex items-center justify-start md:justify-center gap-2 sm:gap-3.5 p-2 sm:p-2.5 rounded-3xl bg-[#141416]/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-x-auto no-scrollbar max-w-full"
          >
            {PORTFOLIO_WORKS.map((work, idx) => {
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={work.id}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onClick={() => onSelectProject(work.id)}
                  className="relative group cursor-pointer shrink-0"
                >
                  {/* Contenedor de la miniatura con elevación y zoom */}
                  <m.div
                    animate={{
                      y: isHovered ? -16 : 0,
                      scale: isHovered ? 1.25 : 1,
                      zIndex: isHovered ? 30 : 10,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 24,
                    }}
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-colors duration-300 ${
                      isHovered
                        ? 'border-[#9CD01A] shadow-[0_15px_35px_rgba(156,208,26,0.45)]'
                        : 'border-white/15 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={work.thumbnail}
                      alt={work.name}
                      className="w-full h-full object-cover transform duration-500 group-hover:scale-115"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </m.div>

                  {/* Indicador Flotante con Flecha ↗ animada con Spring (Estilo skiper6) */}
                  {isHovered && (
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
        </div>

        {/* Tipografía Monumental Dinámica: Ocupa el espacio restante centrado sin alterar la posición de la barra */}
        <div 
          onClick={() => activeWork && onSelectProject(activeWork.id)}
          className={`flex-1 w-full flex flex-col items-center justify-center select-none ${activeWork ? 'cursor-pointer group' : ''}`}
        >
          {/* Caja con altura fija reservada para garantizar CLS = 0 (cero saltos visuales) */}
          <div className="relative h-[90px] sm:h-[130px] md:h-[160px] lg:h-[195px] flex items-center justify-center w-full px-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <m.div
                key={currentTitle}
                className="absolute inset-0 flex items-center justify-center whitespace-nowrap select-none"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className={`font-monumental ${currentFontSize} tracking-wide text-center leading-none flex items-center justify-center group-hover:scale-102 transition-transform uppercase ${
                  isAccent 
                    ? 'text-[#9CD01A] filter drop-shadow-[0_10px_35px_rgba(156,208,26,0.35)]' 
                    : 'text-white/95 filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
                }`}>
                  {currentTitle}
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
                  className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-full bg-[#161618]/90 backdrop-blur-xl border border-[#9CD01A]/30 text-xs sm:text-sm text-white shadow-xl group-hover:border-[#9CD01A]"
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
                  <span className="text-white/30">•</span>
                  <span className="text-white/70">
                    {activeWork.category}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-[#9CD01A] font-bold flex items-center gap-1">
                    <span>Explorar Obra</span>
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
                  <span>Pasa el cursor sobre cada miniatura para descubrir la obra • Clic para ingresar</span>
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
