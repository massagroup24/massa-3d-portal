import { useState, useMemo, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Sparkles, 
  Phone, 
  Compass, 
  ArrowRight, 
  X, 
  Mail, 
  ArrowUpRight, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { CANONICAL_PROJECTS, type CanonicalProject, formatAreaMetric } from '../../data/canonicalProjects';
import { VipContactModal } from './VipContactModal';
import { CommercialLoginModal } from './CommercialLoginModal';
import { Project } from '../../data/tourData';
import { getProjectIdentity } from '../../config/projectIdentityConfig';

interface VipCommercialLandingProps {
  onSelectProjectForPortal: (projectId: string) => void;
  onLaunch360Tour?: (projectId?: string) => void;
  onOpenMonumentalShowcase: () => void;
  onLoginSuccess: (role: 'client' | 'architect' | 'guest', userName?: string) => void;
  projects?: Record<string, Project>;
}

export function VipCommercialLanding({
  onSelectProjectForPortal,
  onOpenMonumentalShowcase,
  onLoginSuccess,
}: VipCommercialLandingProps) {
  // Estados de Onboarding cinemático:
  // 1. Splash con logo MASSA animado
  // 2. Secuencia rápida de bienvenida con conceptos (DISEÑO -> ARQUITECTURA -> EXCLUSIVIDAD)
  // 3. Revelación monumental de MASSA HOME
  // 4. Asentamiento con barra difuminada inferior y menús
  const [showSplash, setShowSplash] = useState(true);
  const [introPhase, setIntroPhase] = useState<'splash' | 'settled'>('splash');

  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterAño, setFilterAño] = useState<string>('todos');

  const filterOptions = useMemo(() => {
    const tipos = Array.from(new Set(CANONICAL_PROJECTS.map(p => p.tipo)));
    const estados = Array.from(new Set(CANONICAL_PROJECTS.map(p => p.estado)));
    const años = Array.from(new Set(CANONICAL_PROJECTS.map(p => String(p.año))));
    return { tipos, estados, años };
  }, []);

  const filteredProjects: CanonicalProject[] = useMemo(() => {
    return [...CANONICAL_PROJECTS]
      .filter(p => filterTipo === 'todos' || p.tipo === filterTipo)
      .filter(p => filterEstado === 'todos' || p.estado === filterEstado)
      .filter(p => filterAño === 'todos' || String(p.año) === filterAño)
      .sort((a, b) => b.año - a.año);
  }, [filterTipo, filterEstado, filterAño]);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedResidenceForContact] = useState<string | undefined>(undefined);
  const [activeInfoModal, setActiveInfoModal] = useState<'quienes-somos' | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Acordeón interactivo para Proyectos en desarrollo (por defecto índice 0 expandido)
  const [activeProjectIndex, setActiveProjectIndex] = useState<number>(0);

  const heroVideoRef = useRef<HTMLVideoElement>(null);

  // Asegurar reproducción automática fluida del video Hero de inicio
  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.defaultMuted = true;
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => {
        // Fallback de política de autoplay del navegador
      });
    }
  }, []);

  // Detección de scroll para visibilidad de la barra inferior flotante
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1. Temporizador del Splash con logo animado (2s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setIntroPhase('settled');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#08090D] text-[#F5F5F5] font-sans selection:bg-[#9CD01A] selection:text-[#08090D] overflow-x-hidden">
      
      {/* 1. PRELOADER / SPLASH SCREEN CON ANIMACIÓN DEL LOGO (REFERENCIA IMAGEN 1) */}
      <AnimatePresence>
        {showSplash && (
          <m.div
            key="massa-splash-screen"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              y: -40,
              filter: 'blur(10px)',
              transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } 
            }}
            className="fixed inset-0 z-50 bg-[#070709] flex flex-col items-center justify-center p-6 cursor-pointer select-none overflow-hidden"
            onClick={() => {
              setShowSplash(false);
              setIntroPhase('settled');
            }}
          >
            {/* Resplandor ambiental de fondo arquitectónico */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[450px] sm:w-[650px] lg:w-[950px] h-[450px] sm:h-[650px] lg:h-[950px] rounded-full bg-[#9CD01A]/[0.08] blur-[140px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-4">
              <div className="relative w-full flex items-center justify-center py-4">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full max-w-[500px] sm:max-w-[700px] md:max-w-[850px] lg:max-w-[1050px] h-auto max-h-[70vh] object-contain filter drop-shadow-[0_0_60px_rgba(156,208,26,0.5)] transform scale-[1.3] sm:scale-[1.65] md:scale-[1.95] lg:scale-[2.2] transition-transform origin-center"
                >
                  <source src="/logo-massa-animado.webm" type="video/webm" />
                  <source src="/logo-massa-animado.mp4" type="video/mp4" />
                  <source src="/NUEVO%20LOGO%20MASSA%20SIN%20FONDO_alpha.mov" type='video/mp4; codecs="hvc1"' />
                </video>
              </div>

              <div className="mt-8 sm:mt-12 flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-2xl">
                <span className="w-2 h-2 rounded-full bg-[#9CD01A] animate-ping" />
                <span className="text-xs sm:text-sm font-mono tracking-[0.35em] uppercase text-white/80 font-semibold">
                  MASSA HOME • PORTAFOLIO 2026
                </span>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* 2. HERO EDITORIAL CINEMATOGRÁFICO */}
      <section 
        id="hero" 
        onClick={() => {
          if (introPhase !== 'settled') {
            setIntroPhase('settled');
          }
        }}
        style={{
          paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
          paddingLeft: 'max(1.5rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1.5rem, env(safe-area-inset-right, 0px))',
        }}
        className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden p-6 sm:p-10 lg:p-14 pb-24 sm:pb-28 lg:pb-32"
      >
        
        {/* VIDEO DE FONDO NÍTIDO */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.04] transform scale-[1.01]"
          >
            <source src="/VIDEO%20H4.mp4" type="video/mp4" />
            <source src="/VIDEO H4.mp4" type="video/mp4" />
          </video>
          {/* Overlay suave y dinámico para garantizar máxima legibilidad */}
          <div className="absolute inset-0 transition-opacity duration-700 pointer-events-none bg-gradient-to-t from-[#08090D] via-black/25 to-black/40" />
        </div>



        {/* HEADER SUPERIOR: LOGO A LA IZQUIERDA Y MENÚ VERTICAL A LA DERECHA */}
        <m.header
          initial={false}
          animate={{
            opacity: introPhase === 'settled' ? 1 : 0,
            y: introPhase === 'settled' ? 0 : -20,
            pointerEvents: introPhase === 'settled' ? 'auto' : 'none',
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 w-full flex items-start justify-between gap-4"
        >
          
          {/* Logo Minimalista Superior Izquierdo */}
          <a href="#hero" className="flex items-center group py-2">
            <img
              src="/MASSA_USO.png"
              alt="MASSA HOME"
              className="h-8 sm:h-10 md:h-11 w-auto object-contain filter drop-shadow-[0_2px_12px_rgba(156,208,26,0.35)] transition-transform duration-300 group-hover:scale-105"
            />
          </a>

          {/* Menú de Navegación Vertical (Orientación según Foto Adjunta) */}
          <div className="flex flex-col items-end">
            
            {/* Botón Toggle para Móvil */}
            <div className="flex items-center gap-2 md:hidden mb-2">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="px-4 py-2 rounded-2xl bg-[#222328]/90 backdrop-blur-xl border border-white/15 text-xs font-bold text-white flex items-center gap-2 shadow-xl active:scale-95 cursor-pointer"
              >
                <span>Menú</span>
                <span className={`transform transition-transform text-xs ${isMobileNavOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="p-2.5 rounded-2xl bg-[#16161A]/90 border border-white/15 text-[#9CD01A] cursor-pointer"
                title="Ingreso Recorridos 360°"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>

            {/* Columna Vertical de Cápsulas */}
            <nav className={`
              ${isMobileNavOpen ? 'flex' : 'hidden'} md:flex
              flex-col items-end gap-2 sm:gap-2.5 select-none
            `}>
              {/* 1. Home */}
              <a
                href="#hero"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-52 sm:w-60 md:w-64 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#52535a]/80 hover:bg-[#5f6068]/95 backdrop-blur-xl border border-white/10 hover:border-white/25 text-[15px] sm:text-base font-medium text-white transition-all duration-200 shadow-lg text-left block active:scale-98"
              >
                Home
              </a>

              {/* 2. Proyectos */}
              <a
                href="#proyectos"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-52 sm:w-60 md:w-64 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#52535a]/80 hover:bg-[#5f6068]/95 backdrop-blur-xl border border-white/10 hover:border-white/25 text-[15px] sm:text-base font-medium text-white transition-all duration-200 shadow-lg text-left block active:scale-98"
              >
                Proyectos
              </a>

              {/* 3. Nosotros */}
              <button
                type="button"
                onClick={() => {
                  setActiveInfoModal('quienes-somos');
                  setIsMobileNavOpen(false);
                }}
                className="w-52 sm:w-60 md:w-64 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#52535a]/80 hover:bg-[#5f6068]/95 backdrop-blur-xl border border-white/10 hover:border-white/25 text-[15px] sm:text-base font-medium text-white transition-all duration-200 shadow-lg text-left cursor-pointer active:scale-98"
              >
                Nosotros
              </button>

              {/* 4. Contacto */}
              <a
                href="#contacto"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-52 sm:w-60 md:w-64 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#52535a]/80 hover:bg-[#5f6068]/95 backdrop-blur-xl border border-white/10 hover:border-white/25 text-[15px] sm:text-base font-medium text-white transition-all duration-200 shadow-lg text-left block active:scale-98"
              >
                Contacto
              </a>

              {/* Ingreso al Creador y Gestor de Recorridos 360° */}
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMobileNavOpen(false);
                }}
                className="w-52 sm:w-60 md:w-64 px-5 sm:px-6 py-3 rounded-2xl bg-[#2e2f35]/90 hover:bg-[#3d3e46]/95 backdrop-blur-xl border border-white/10 hover:border-[#9CD01A]/50 text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition-all duration-200 shadow-lg flex items-center justify-between cursor-pointer active:scale-98 mt-1"
                title="Ingreso Recorridos 360°"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[#9CD01A]" />
                  <span>Recorridos 360°</span>
                </div>
                <span className="text-[10px] font-mono text-[#9CD01A]/80 tracking-wider">STUDIO</span>
              </button>
            </nav>
          </div>
        </m.header>

        {/* PIE DEL HERO: TIPOGRAFÍA MONUMENTAL A LA IZQ. + BLOQUE DE VALOR A LA DER. */}
        <div className="relative z-20 w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pt-12 pb-6 mb-16 sm:mb-20">
          
          {/* Tipografía Monumental Abajo Izquierda */}
          <m.div
            initial={false}
            animate={{
              opacity: introPhase === 'settled' ? 1 : 0,
              x: introPhase === 'settled' ? 0 : -30,
              scale: introPhase === 'settled' ? 1 : 0.95,
            }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="text-left"
          >
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.88] uppercase select-none filter drop-shadow-[0_15px_45px_rgba(0,0,0,0.95)]">
              MASSA<br />
              <span className="text-[#9CD01A]">HOME</span>
            </h1>
          </m.div>

          {/* Bloque de Valor Abajo Derecha */}
          <m.div
            initial={false}
            animate={{
              opacity: introPhase === 'settled' ? 1 : 0,
              x: introPhase === 'settled' ? 0 : 30,
              pointerEvents: introPhase === 'settled' ? 'auto' : 'none',
            }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-left md:text-right max-w-lg flex flex-col md:items-end"
          >
            
            <button
              type="button"
              onClick={onOpenMonumentalShowcase}
              className="group inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 hover:bg-black/80 border border-[#9CD01A]/40 mb-3 text-[10px] font-mono tracking-widest text-[#9CD01A] uppercase transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#9CD01A]" />
              <span>MODO GALERÍA MONUMENTAL</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight filter drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]">
              Portafolio Proyectos <br />
              <span className="text-[#9CD01A]">de Alto Valor</span>
            </h2>

            <a
              href="#proyectos"
              className="group flex items-start md:items-center md:justify-end gap-2.5 mt-3 text-xs sm:text-sm text-white/80 hover:text-white transition leading-relaxed font-medium"
            >
              <span className="text-[#9CD01A] font-black text-lg group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">↗</span>
              <p className="text-left md:text-right">
                Diseñamos y construimos residencias de autor y proyectos referentes en Cúcuta y Colombia.
              </p>
            </a>

          </m.div>

        </div>

        {/* 4. ANIMACIÓN DIFUMINADA EN TODA LA PARTE INFERIOR (INVITACIÓN A DESLIZAR) */}
        <AnimatePresence>
          {introPhase === 'settled' && isAtTop && (
            <m.div
              key="bottom-blurred-animation-dock"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40, transition: { duration: 0.4 } }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => {
                e.stopPropagation();
                const target = document.getElementById('proyectos');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="fixed bottom-0 inset-x-0 z-40 w-full h-32 sm:h-40 flex flex-col justify-end items-center pb-4 sm:pb-6 pointer-events-auto cursor-pointer select-none overflow-hidden transition-all group"
            >
              {/* CAPA 1: DEGRADADO DIFUMINADO PROGRESIVO VERTICAL (SIN BORDES NI CAJAS) */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/80 to-transparent backdrop-blur-[10px] pointer-events-none"
                style={{
                  WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
                  maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
                }}
              />

              {/* CAPA 2: RESPLANDOR DIFUMINADO ORGÁNICO ESMERALDA QUE RESPIRA */}
              <m.div
                animate={{
                  opacity: [0.25, 0.65, 0.25],
                  scaleX: [0.9, 1.2, 0.9],
                  scaleY: [0.8, 1.15, 0.8],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[450px] sm:w-[750px] md:w-[900px] h-[75px] sm:h-[100px] bg-[#9CD01A]/20 blur-[60px] sm:blur-[80px] rounded-full pointer-events-none"
              />

              {/* CAPA 3: HAZ DE LUZ DIFUMINADO HORIZONTAL EN MOVIMIENTO */}
              <div className="absolute bottom-0 inset-x-0 h-[1px] overflow-hidden pointer-events-none">
                <m.div
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#9CD01A]/70 to-transparent blur-[1.5px]"
                />
              </div>

              {/* CAPA 4: ANIMACIÓN CINÉTICA DIFUMINADA CENTRAL (INVITACIÓN A DESLIZAR) */}
              <div className="relative z-10 flex flex-col items-center gap-2 transition-transform duration-300 group-hover:scale-105">
                
                {/* Indicador de Deslizamiento Animado */}
                <div className="relative flex flex-col items-center">
                  <div className="absolute inset-0 bg-[#9CD01A]/35 blur-xl rounded-full scale-150 animate-pulse pointer-events-none" />
                  
                  {/* Cápsula con punto verde que fluye suavemente hacia abajo */}
                  <div className="relative w-5 h-9 sm:w-6 sm:h-10 rounded-full border border-white/25 group-hover:border-[#9CD01A]/70 transition-colors flex items-start justify-center p-1 backdrop-blur-md bg-black/30 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <m.div
                      animate={{
                        y: [0, 16, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-[#9CD01A] shadow-[0_0_10px_#9CD01A]"
                    />
                  </div>
                </div>

                {/* Texto cinético difuminado que brilla e invita a continuar */}
                <div className="flex flex-col items-center text-center">
                  <m.span
                    animate={{
                      opacity: [0.75, 1, 0.75],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.35em] uppercase text-white/95 group-hover:text-[#9CD01A] transition-colors filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  >
                    DESLIZA PARA CONTINUAR EL RECORRIDO
                  </m.span>

                  {/* Flechas difuminadas en cascada descendente */}
                  <div className="flex items-center gap-1 mt-0.5 text-[#9CD01A]">
                    <m.div
                      animate={{ y: [0, 4, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </m.div>
                  </div>
                </div>

              </div>

            </m.div>
          )}
        </AnimatePresence>

      </section>


      {/* 3. SECCIÓN: PROYECTOS EN DESARROLLO */}
      <section id="proyectos" className="relative py-20 sm:py-28 px-4 sm:px-8 lg:px-14 bg-[#08090D] border-t border-white/[0.08]">
        
        {/* Cabecera de Sección & Filtros (solo por: tipo, estado y año) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="max-w-3xl text-left">
            <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#9CD01A] uppercase block mb-2">
              • PORTAFOLIO EN CURSO
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              Proyectos en desarrollo
            </h2>
          </div>

          {/* Filtros solo por: tipo, estado y año */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto self-start sm:self-end">
            <div className="flex items-center justify-between gap-1 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-mono min-w-0">
              <span className="text-white/40 shrink-0">Tipo:</span>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer capitalize min-w-0 truncate"
              >
                <option value="todos" className="bg-[#121216] text-white">Todos</option>
                {filterOptions.tipos.map(t => (
                  <option key={t} value={t} className="bg-[#121216] text-white capitalize">{t}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-1 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-mono min-w-0">
              <span className="text-white/40 shrink-0">Estado:</span>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer min-w-0 truncate"
              >
                <option value="todos" className="bg-[#121216] text-white">Todos</option>
                {filterOptions.estados.map(e => (
                  <option key={e} value={e} className="bg-[#121216] text-white">{e}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-1 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-mono min-w-0">
              <span className="text-white/40 shrink-0">Año:</span>
              <select
                value={filterAño}
                onChange={(e) => setFilterAño(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer min-w-0 truncate"
              >
                <option value="todos" className="bg-[#121216] text-white">Todos</option>
                {filterOptions.años.map(a => (
                  <option key={a} value={a} className="bg-[#121216] text-white">{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Listado / Acordeón de Proyectos (orden descendente por año) */}
        <div className="flex flex-col lg:flex-row gap-4 lg:h-[620px] w-full">
          {filteredProjects.map((project, idx) => {
            const isActive = activeProjectIndex === idx;
            const isHacienda = project.id === 'project_hacienda_f22';
            const identity = getProjectIdentity(project.id);
            const brand = identity.clientBrand;
            const isCustomBrand = Boolean(brand && isHacienda);
            const primaryColor = identity.theme.primaryColor || (isHacienda ? '#DFC47B' : '#9CD01A');
            const metallicGradient =
              brand?.metallicGradient ||
              (isHacienda
                ? 'linear-gradient(135deg, #B89752 0%, #DFC47B 32%, #F7E8A8 50%, #D1B16B 74%, #9E7D3B 100%)'
                : 'linear-gradient(135deg, #729B0E 0%, #9CD01A 35%, #D4FF5E 52%, #8CBF14 76%, #5B7E08 100%)');

            const facadeRender = project.imagen_principal;
            const areaFormatted = formatAreaMetric(project.area_construida);

            return (
              <div
                key={project.id || `proj-${idx}`}
                onMouseEnter={() => setActiveProjectIndex(idx)}
                onClick={() => {
                  if (!isActive) {
                    setActiveProjectIndex(idx);
                  } else {
                    onSelectProjectForPortal(project.id);
                  }
                }}
                className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 ease-out border ${
                  isActive
                    ? isCustomBrand
                      ? 'lg:flex-[3.5] flex-none min-h-[440px] lg:min-h-0 border-[#DFC47B]/70 shadow-[0_20px_50px_rgba(0,0,0,0.92),0_0_45px_rgba(223,196,123,0.22)]'
                      : 'lg:flex-[3.5] flex-none min-h-[440px] lg:min-h-0 border-[#9CD01A]/60 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(156,208,26,0.15)]'
                    : isCustomBrand
                      ? 'lg:flex-[1] flex-none min-h-[90px] lg:min-h-0 border-[#DFC47B]/25 hover:border-[#DFC47B]/55'
                      : 'lg:flex-[1] flex-none min-h-[90px] lg:min-h-0 border-[#9CD01A]/20 hover:border-[#9CD01A]/50'
                }`}
              >
                {/* Visual de Fondo: Render de Fachada */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#101218] via-[#0b0c10] to-[#06070a] overflow-hidden">
                  <img
                    src={encodeURI(facadeRender)}
                    alt={project.nombre}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${
                      isActive
                        ? 'scale-105 filter brightness-[0.78] contrast-[1.08]'
                        : 'filter brightness-[0.38] contrast-[0.95] grayscale-[15%]'
                    }`}
                    loading="eager"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent pointer-events-none" />

                {/* CONTENIDO CUANDO EL PROYECTO NO ESTÁ ACTIVO */}
                {!isActive && (
                  <div className="absolute inset-0 p-4 sm:p-6 flex lg:flex-col items-center lg:items-start justify-between z-10 select-none gap-2">
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: primaryColor }}
                      >
                        0{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[9px] font-mono font-bold uppercase tracking-wider text-white">
                        Render
                      </span>
                      {brand?.logoIcon && (
                        <img
                          src={encodeURI(brand.logoIcon)}
                          alt={brand.shortName}
                          className="w-4 h-4 object-contain"
                        />
                      )}
                    </div>
                    <h3
                      style={{ fontFamily: identity.theme.fontFamilyTitle }}
                      className="text-sm sm:text-lg lg:text-2xl font-black uppercase tracking-wider lg:[writing-mode:vertical-rl] lg:rotate-180 truncate select-none"
                    >
                      <span className="text-white">{project.nombre}</span>
                    </h3>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                        isCustomBrand
                          ? 'bg-[#DFC47B]/15 border-[#DFC47B]/40 text-[#F1E29B]'
                          : 'bg-[#9CD01A]/15 border-[#9CD01A]/40 text-[#9CD01A]'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* CONTENIDO CUANDO EL PROYECTO ESTÁ ACTIVO (Tarjeta estricta: imagen, nombre, tipo, ciudad, año, estado y área) */}
                {isActive && (
                  <div className="absolute inset-0 p-5 sm:p-10 flex flex-col justify-between z-10 text-left select-none">
                    {/* Barra Superior */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                          Render
                        </span>
                        <span
                          className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-black text-[10px] sm:text-xs tracking-wider uppercase ${
                            isCustomBrand ? 'text-[#060608] shadow-[0_4px_15px_rgba(223,196,123,0.35)]' : 'bg-[#9CD01A] text-black'
                          }`}
                          style={isCustomBrand ? { backgroundImage: metallicGradient } : undefined}
                        >
                          OBRA 0{idx + 1}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase ${
                            isCustomBrand
                              ? 'border-[#DFC47B]/35 text-[#F1E29B]'
                              : 'border-white/10 text-white/80'
                          }`}
                        >
                          {project.tipo}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {project.hasTour360 && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border text-[11px] font-mono font-bold ${
                              isCustomBrand
                                ? 'border-[#DFC47B]/45 text-[#F1E29B]'
                                : 'border-[#9CD01A]/30 text-[#9CD01A]'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full animate-pulse"
                              style={{ backgroundColor: primaryColor }}
                            />
                            <span>360° ACTIVO</span>
                          </span>
                        )}

                        {brand?.logoHorizontalWhite && (
                          <div className="hidden sm:flex items-center px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-[#DFC47B]/40 shadow-lg">
                            <img
                              src={encodeURI(brand.logoHorizontalWhite)}
                              alt={brand.companyName}
                              className="h-5 w-auto object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información Principal */}
                    <div className="max-w-2xl">
                      <span
                        className={`text-xs sm:text-sm font-mono font-bold tracking-wider uppercase block mb-1 ${
                          isCustomBrand ? 'text-[#F1E29B]' : 'text-[#9CD01A]'
                        }`}
                      >
                        {project.ciudad}, {project.departamento}{project.barrio_o_sector ? ` • ${project.barrio_o_sector}` : ''}
                      </span>

                      <h3
                        style={{ fontFamily: identity.theme.fontFamilyTitle }}
                        className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 tracking-tight uppercase leading-none select-none text-white"
                      >
                        {project.nombre}
                      </h3>

                      <p className="text-xs sm:text-base text-white/85 leading-relaxed mb-6 font-medium line-clamp-2">
                        {project.descripcion_corta}
                      </p>

                      {/* Tarjeta de campos estrictos: tipo, ciudad, año, estado y área (solo si existe) */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-6 text-xs font-mono">
                        <div className="px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-sm border border-white/10 text-white/80">
                          <span className="text-white/40 mr-1.5">Tipo:</span>
                          <span className="font-bold text-white capitalize">{project.tipo}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-sm border border-white/10 text-white/80">
                          <span className="text-white/40 mr-1.5">Ciudad:</span>
                          <span className="font-bold text-white">{project.ciudad}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-sm border border-white/10 text-white/80">
                          <span className="text-white/40 mr-1.5">Año:</span>
                          <span className="font-bold text-white">{project.año}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-sm border border-white/10 text-white/80">
                          <span className="text-white/40 mr-1.5">Estado:</span>
                          <span
                            className="font-bold"
                            style={{ color: isCustomBrand ? '#F1E29B' : primaryColor }}
                          >
                            {project.estado}
                          </span>
                        </div>
                        {areaFormatted && (
                          <div className="px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-sm border border-white/10 text-white/80">
                            <span className="text-white/40 mr-1.5">Área:</span>
                            <span className="font-bold text-white">{areaFormatted}</span>
                          </div>
                        )}
                      </div>

                      {/* Botón Principal */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProjectForPortal(project.id);
                        }}
                        className={`w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 ${
                          isCustomBrand
                            ? 'text-[#060608] border border-[#F7E8A8]/55 shadow-[0_10px_30px_rgba(223,196,123,0.4)]'
                            : 'bg-[#9CD01A] hover:bg-white text-black shadow-2xl'
                        }`}
                        style={isCustomBrand ? { backgroundImage: metallicGradient } : undefined}
                      >
                        <span>
                          {project.hasTour360
                            ? isCustomBrand
                              ? `Explorar Proyecto ${brand?.shortName} & Gemelo 360°`
                              : 'Explorar Ficha & Gemelo Digital 360°'
                            : 'Explorar Proyecto'}
                        </span>
                        <ArrowUpRight className="w-4 h-4 font-black" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* 5. SECCIÓN: CANALES DE CONTACTO & REDES SOCIALES MULTIMEDIA (DISEÑO MINIMALISTA DE ALTA DENSIDAD) */}
      <section id="contacto" className="relative py-12 sm:py-16 px-4 sm:px-8 lg:px-14 bg-[#07070A] border-t border-white/[0.08] overflow-hidden text-left">
        
        {/* Resplandor ambiental sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-[#9CD01A]/[0.025] rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Cabecera Editorial Compacta */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A] animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#9CD01A] uppercase">
                  CANALES & REDES OFICIALES
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Canales de Contacto <span className="text-[#9CD01A]">& Redes Sociales</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/60 max-w-lg font-normal leading-relaxed">
              Comunícate directamente con nuestro equipo técnico para cotizar tu proyecto o síguenos para explorar renders 4K, recorridos 360° y avance de obras en vivo.
            </p>
          </div>

          {/* Directorio Arquitectónico Minimalista (2 Columnas Divididas por Líneas Finas, Sin Cuadros Pesados) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            
            {/* COLUMNA 1: ATENCIÓN DIRECTA */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[11px] font-mono font-bold text-[#9CD01A] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
                  Atención Directa & Cotizaciones
                </span>
                <span className="text-[10px] font-mono text-white/40">Respuesta Inmediata</span>
              </div>

              <div className="divide-y divide-white/[0.06] border-y border-white/[0.08]">
                {/* 1. WHATSAPP */}
                <a
                  href="https://wa.me/573104771967?text=Hola%20Massa%20Group,%20estoy%20interesado%20en%20conocer%20m%C3%A1s%20sobre%20sus%20proyectos%20arquitect%C3%B3nicos."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between py-3.5 px-3 sm:px-4 hover:bg-[#25D366]/[0.04] transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(37,211,102,0.15)] shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.585 1.77.893 2.791.894h.005c3.182 0 5.768-2.587 5.769-5.766.001-1.543-.599-2.994-1.69-4.086-1.09-1.091-2.541-1.694-4.085-1.694zm7.391 1.621c1.558 1.558 2.416 3.63 2.416 5.834 0 4.549-3.702 8.25-8.254 8.25-.001 0-.001 0 0 0-1.408 0-2.79-.364-4.004-1.054l-5.58 1.462 1.488-5.438c-.764-1.282-1.168-2.748-1.168-4.22 0-4.55 3.702-8.251 8.255-8.251 2.204 0 4.276.858 5.834 2.417zm-4.09 5.86c-.198-.099-1.171-.577-1.353-.643-.182-.066-.314-.099-.446.099-.133.197-.513.643-.629.775-.116.132-.232.148-.43.05-.198-.099-.836-.308-1.592-.982-.589-.526-.987-1.176-1.103-1.374-.116-.198-.012-.305.087-.404.089-.089.198-.232.297-.348.099-.116.132-.198.198-.33.066-.132.033-.248-.017-.348-.05-.099-.446-1.072-.611-1.469-.161-.387-.325-.334-.446-.34-.116-.006-.248-.007-.38-.007-.132 0-.348.05-.53.248-.182.198-.694.677-.694 1.653 0 .975.71 1.916.81 2.048.099.132 1.398 2.134 3.387 2.991.473.204.842.326 1.13.418.475.151.907.129 1.248.078.38-.057 1.171-.479 1.336-.942.166-.462.166-.859.116-.942-.049-.082-.181-.132-.38-.231z"/></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#25D366] transition-colors truncate">
                          WhatsApp Oficial
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 uppercase">
                          Chat Directo
                        </span>
                      </div>
                      <div className="text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors">
                        +57 310 477 1967 • +57 304 588 2770
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#25D366] shrink-0 pl-3">
                    <span className="text-xs font-bold hidden sm:inline opacity-80 group-hover:opacity-100">
                      Iniciar Chat
                    </span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>

                {/* 2. LLAMADA TELEFÓNICA */}
                <a
                  href="tel:+573104771967"
                  className="group relative flex items-center justify-between py-3.5 px-3 sm:px-4 hover:bg-[#9CD01A]/[0.04] transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#9CD01A]/15 border border-[#9CD01A]/30 flex items-center justify-center text-[#9CD01A] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(156,208,26,0.15)] shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#9CD01A] transition-colors truncate">
                          Llamada Telefónica
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#9CD01A]/10 text-[#9CD01A] border border-[#9CD01A]/20 uppercase">
                          Línea Directa
                        </span>
                      </div>
                      <div className="text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors">
                        +57 310 477 1967 • +57 304 588 2770
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#9CD01A] shrink-0 pl-3">
                    <span className="text-xs font-bold hidden sm:inline opacity-80 group-hover:opacity-100">
                      Llamar a MASSA
                    </span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>

                {/* 3. CORREO COMERCIAL */}
                <a
                  href="mailto:comercial@massagroup.co"
                  className="group relative flex items-center justify-between py-3.5 px-3 sm:px-4 hover:bg-white/[0.04] transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-white transition-colors truncate">
                          Correo Comercial
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-white/80 border border-white/20 uppercase">
                          Planos & Formal
                        </span>
                      </div>
                      <div className="text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors truncate">
                        comercial@massagroup.co
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 group-hover:text-white shrink-0 pl-3">
                    <span className="text-xs font-bold hidden sm:inline opacity-80 group-hover:opacity-100">
                      Enviar Correo
                    </span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              </div>
            </div>

            {/* COLUMNA 2: ECOSISTEMA MULTIMEDIA */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[11px] font-mono font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                  Multimedia & Recorridos 360°
                </span>
                <span className="text-[10px] font-mono text-white/40">Contenido Audiovisual</span>
              </div>

              <div className="divide-y divide-white/[0.06] border-y border-white/[0.08]">
                {/* 4. INSTAGRAM */}
                <a
                  href="https://www.instagram.com/massagroup.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between py-3.5 px-3 sm:px-4 hover:bg-[#E1306C]/[0.04] transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F58529]/20 via-[#DD2A7B]/20 to-[#8134AF]/20 border border-[#E1306C]/30 flex items-center justify-center text-[#E1306C] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(225,48,108,0.15)] shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#E1306C] transition-colors truncate">
                          Instagram Oficial
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E1306C]/10 text-[#E1306C] border border-[#E1306C]/20 uppercase">
                          Renders & Obra
                        </span>
                      </div>
                      <div className="text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors">
                        @massagroup.co
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#E1306C] shrink-0 pl-3">
                    <span className="text-xs font-bold hidden sm:inline opacity-80 group-hover:opacity-100">
                      Ver Portafolio
                    </span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>

                {/* 5. YOUTUBE */}
                <a
                  href="https://www.youtube.com/@massagroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between py-3.5 px-3 sm:px-4 hover:bg-[#FF0000]/[0.04] transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#FF0000]/15 border border-[#FF0000]/30 flex items-center justify-center text-[#FF0000] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,0,0,0.15)] shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#FF0000] transition-colors truncate">
                          YouTube • Videos 4K
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 uppercase">
                          Tours 360°
                        </span>
                      </div>
                      <div className="text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors">
                        MASSA GROUP Oficial
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#FF0000] shrink-0 pl-3">
                    <span className="text-xs font-bold hidden sm:inline opacity-80 group-hover:opacity-100">
                      Ver Canal
                    </span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>

                {/* 6. TIKTOK */}
                <a
                  href="https://www.tiktok.com/@massagroup.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between py-3.5 px-3 sm:px-4 hover:bg-[#00F2FE]/[0.04] transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#00F2FE]/15 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,242,254,0.15)] shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-6.6 6.32 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.52a8.27 8.27 0 0 0 5.17 1.83V6.9a4.83 4.83 0 0 1-2-.21z"/></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#00F2FE] transition-colors truncate">
                          TikTok Oficial
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20 uppercase">
                          Avances en Obra
                        </span>
                      </div>
                      <div className="text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors">
                        @massagroup.co
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#00F2FE] shrink-0 pl-3">
                    <span className="text-xs font-bold hidden sm:inline opacity-80 group-hover:opacity-100">
                      Explorar Videos
                    </span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              </div>
            </div>

          </div>

          {/* Barra Minimalista de Sede Central & Asesoría VIP (Sustituye tarjeta gigante anterior) */}
          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-white/[0.03] via-white/[0.015] to-transparent border border-white/[0.08] hover:border-[#9CD01A]/30 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#9CD01A]/10 border border-[#9CD01A]/20 flex items-center justify-center text-[#9CD01A] shrink-0 shadow-[0_0_15px_rgba(156,208,26,0.15)]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">Sede Central • Cúcuta, Colombia</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#9CD01A]/10 text-[#9CD01A] border border-[#9CD01A]/20 uppercase">
                    Visitas Privadas
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5 font-normal">
                  ¿Tienes un lote o proyecto en mente? Evaluamos la topografía, ventilación y potencial de tu desarrollo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#9CD01A] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shrink-0 shadow-[0_0_20px_rgba(156,208,26,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Agendar Asesoría VIP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </section>

      {/* FOOTER MINIMALISTA & MODERNO */}
      <footer className="relative bg-[#050608] border-t border-white/[0.08] py-12 px-4 sm:px-8 lg:px-14 text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/MASSA_USO.png"
              alt="MASSA HOME"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xs text-white/40 border-l border-white/10 pl-3">
              Arquitectura de Autor • Gemelos Digitales 360°
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/60">
            <a href="#hero" className="hover:text-white transition">Home</a>
            <a href="#proyectos" className="hover:text-white transition">Proyectos</a>
            <a href="#contacto" className="hover:text-[#9CD01A] transition">Contacto</a>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="text-white/40 hover:text-[#9CD01A] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Recorridos 360°</span>
            </button>
          </div>

          <div className="text-xs font-mono text-white/40">
            © 2026 MASSA HOME • Por MASSA GROUP
          </div>
        </div>
      </footer>


      {/* MODALES FUNCIONALES */}
      <VipContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        defaultResidenceName={selectedResidenceForContact}
      />

      <CommercialLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />

      {/* MODAL INFORMATIVO: QUIENES SOMOS */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121215] border border-white/10 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(156,208,26,0.15)] text-left">
            
            <button
              type="button"
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>

            {/* MODAL: QUIÉNES SOMOS */}
            {activeInfoModal === 'quienes-somos' && (
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#9CD01A] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#9CD01A] uppercase">
                    MASSA GROUP • ESTUDIO DE AUTOR
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                  Quiénes Somos
                </h3>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  Somos una firma boutique de arquitectura, ingeniería y construcción de residencias exclusivas en Colombia. Desarrollamos obras de autor que integran el diseño contemporáneo en Cúcuta y Norte de Santander con tecnología de punta (recorridos 3D y gemelos digitales).
                </p>
                <div className="space-y-2 mb-6 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#9CD01A]" />
                    <span>Diseño arquitectónico bioclimático y de alta gama</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#9CD01A]" />
                    <span>Construcción integral de alta precisión sin sobrecostos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#9CD01A]" />
                    <span>Presencia consolidada en Cúcuta, Norte de Santander y Colombia</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a
                    href="#proyectos"
                    onClick={() => setActiveInfoModal(null)}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#9CD01A] hover:bg-[#aef01e] text-black font-extrabold text-xs text-center uppercase tracking-wider transition"
                  >
                    Ver Catálogo de Obras
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveInfoModal(null);
                      setIsContactModalOpen(true);
                    }}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Contactar
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
