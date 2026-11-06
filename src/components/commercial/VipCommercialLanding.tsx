import { useState, useMemo, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Compass, 
  X, 
  Mail, 
  ArrowUpRight, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { CANONICAL_PROJECTS, type CanonicalProject, formatAreaMetric } from '../../data/canonicalProjects';
import { CommercialLoginModal } from './CommercialLoginModal';
import { Project } from '../../data/tourData';
import { getProjectIdentity } from '../../config/projectIdentityConfig';
import massaLogoInline from '../../assets/branding/massa-uso.png?inline';

interface VipCommercialLandingProps {
  onSelectProjectForPortal: (projectId: string) => void;
  onLaunch360Tour?: (projectId?: string) => void;
  onLoginSuccess: (role: 'client' | 'architect' | 'guest', userName?: string) => void;
  projects?: Record<string, Project>;
}

export function VipCommercialLanding({
  onSelectProjectForPortal,
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

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
              src={massaLogoInline}
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
                          <div
                            className={`hidden sm:flex items-center px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border shadow-lg ${
                              isCustomBrand ? 'border-[#DFC47B]/40' : 'border-[#9CD01A]/40'
                            }`}
                          >
                            <img
                              src={brand.logoHorizontalWhite.startsWith('data:') ? brand.logoHorizontalWhite : encodeURI(brand.logoHorizontalWhite)}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
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

      {/* 5. SECCIÓN: ESTUDIO, CONCIERGE & ECOSISTEMA DIGITAL (EXPERIENCIA ARQUITECTÓNICA BENTO) */}
      <section id="contacto" className="relative py-16 sm:py-24 px-4 sm:px-8 lg:px-14 bg-[#060709] border-t border-white/[0.08] overflow-hidden text-left">
        {/* Retícula arquitectónica sutil y resplandor ambiental */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#9CD01A 1px, transparent 1px), linear-gradient(90deg, #9CD01A 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="pointer-events-none absolute -top-24 left-1/4 w-[520px] h-[320px] bg-[#9CD01A]/[0.06] rounded-full blur-[150px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-[460px] h-[280px] bg-[#9CD01A]/[0.04] rounded-full blur-[140px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Cabecera Editorial Monumental */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/35 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#9CD01A] animate-pulse" />
                <span className="massa-metallic-text text-[10px] font-mono font-bold tracking-[0.24em] uppercase">
                  CONCIERGE ARQUITECTÓNICO • MASSA GROUP
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[0.98] uppercase">
                Proyectemos tu <br className="hidden sm:block" />
                <span className="massa-metallic-text">Próxima Obra</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/65 max-w-md font-normal leading-relaxed border-l-2 border-[#9CD01A]/50 pl-4">
              Atención directa con dirección arquitectónica para diseño residencial de autor, estructuración técnica y recorridos inmersivos 360° en tiempo real.
            </p>
          </div>

          {/* COMPOSICIÓN BENTO ARQUITECTÓNICA (NO TABLA) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* TARJETA PROTAGONISTA (7 COLUMNAS): CONCIERGE DIRECTO WHATSAPP, LLAMADA Y CORREO */}
            <div className="lg:col-span-7 relative rounded-[24px] sm:rounded-[28px] overflow-hidden border border-[#9CD01A]/35 bg-[#0B0D11]/95 p-5 sm:p-8 lg:p-10 flex flex-col justify-between shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_45px_rgba(156,208,26,0.08)] group">
              {/* Imagen arquitectónica velada de fondo para dar profundidad espacial */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20 group-hover:opacity-25 transition-opacity duration-700">
                <img
                  src="/IBIZA A14/01-F004.jpg"
                  alt=""
                  className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-1000 filter brightness-75 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#08090C] via-[#08090C]/90 to-[#08090C]/55" />
              </div>

              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 sm:mb-6">
                  <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 max-w-full">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping shrink-0" />
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-white/90 truncate">
                      Línea Directa Dirección • Respuesta Inmediata
                    </span>
                  </div>
                  <img
                    src={massaLogoInline}
                    alt="MASSA GROUP"
                    className="h-5 sm:h-7 w-auto object-contain opacity-90 shrink-0"
                  />
                </div>

                <span className="text-[10px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] text-white/45 block mb-1.5">
                  WhatsApp Oficial & Atención Telefónica
                </span>
                <div className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black tracking-tight text-white font-mono tabular-nums mb-3">
                  +57 313 <span className="massa-metallic-text">305 1060</span>
                </div>
                <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed mb-6 sm:mb-7">
                  Habla directamente con nuestro equipo de arquitectura e ingeniería para evaluar tu lote, cotizar un proyecto desde cero o solicitar el dossier técnico de nuestras obras en desarrollo.
                </p>

                {/* Acciones Principales: WhatsApp + Llamada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <a
                    href="https://wa.me/573133051060?text=Hola%20Massa%20Group,%20estoy%20interesado%20en%20recibir%20asesor%C3%ADa%20sobre%20sus%20proyectos%20arquitect%C3%B3nicos."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #4E6E08 0%, #8EC115 16%, #E4FF8A 34%, #9CD01A 50%, #5F870A 66%, #DAFF6E 82%, #7CB010 100%)',
                      boxShadow: '0 12px 32px rgba(156, 208, 26, 0.32)',
                    }}
                    className="min-h-[50px] px-4 sm:px-5 py-3.5 rounded-2xl text-[#060804] font-black text-xs uppercase tracking-wider flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.585 1.77.893 2.791.894h.005c3.182 0 5.768-2.587 5.769-5.766.001-1.543-.599-2.994-1.69-4.086-1.09-1.091-2.541-1.694-4.085-1.694zm7.391 1.621c1.558 1.558 2.416 3.63 2.416 5.834 0 4.549-3.702 8.25-8.254 8.25-.001 0-.001 0 0 0-1.408 0-2.79-.364-4.004-1.054l-5.58 1.462 1.488-5.438c-.764-1.282-1.168-2.748-1.168-4.22 0-4.55 3.702-8.251 8.255-8.251 2.204 0 4.276.858 5.834 2.417zm-4.09 5.86c-.198-.099-1.171-.577-1.353-.643-.182-.066-.314-.099-.446.099-.133.197-.513.643-.629.775-.116.132-.232.148-.43.05-.198-.099-.836-.308-1.592-.982-.589-.526-.987-1.176-1.103-1.374-.116-.198-.012-.305.087-.404.089-.089.198-.232.297-.348.099-.116.132-.198.198-.33.066-.132.033-.248-.017-.348-.05-.099-.446-1.072-.611-1.469-.161-.387-.325-.334-.446-.34-.116-.006-.248-.007-.38-.007-.132 0-.348.05-.53.248-.182.198-.694.677-.694 1.653 0 .975.71 1.916.81 2.048.099.132 1.398 2.134 3.387 2.991.473.204.842.326 1.13.418.475.151.907.129 1.248.078.38-.057 1.171-.479 1.336-.942.166-.462.166-.859.116-.942-.049-.082-.181-.132-.38-.231z"/></svg>
                      <span className="truncate">Iniciar Chat en WhatsApp</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </a>

                  <a
                    href="tel:+573133051060"
                    className="min-h-[50px] px-4 sm:px-5 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-[#9CD01A]/50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Phone className="w-4 h-4 text-[#9CD01A] shrink-0" />
                      <span className="truncate">Llamada Telefónica</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#9CD01A] shrink-0" />
                  </a>
                </div>
              </div>

              {/* Franja Inferior de Correo Oficial dentro de la Tarjeta Protagonista */}
              <a
                href="mailto:massagroup24@gmail.com"
                className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group/mail"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#9CD01A] group-hover/mail:border-[#9CD01A]/50 transition-colors shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.14em] sm:tracking-[0.18em] text-white/45 block truncate">
                      Correo Oficial • Planos, Licitaciones & Dossier
                    </span>
                    <span className="text-xs sm:text-base font-mono font-bold text-white group-hover/mail:text-[#9CD01A] transition-colors break-all sm:break-normal block">
                      massagroup24@gmail.com
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center justify-center sm:justify-end gap-1.5 py-2.5 px-3.5 sm:p-0 rounded-xl bg-white/[0.04] sm:bg-transparent border border-white/10 sm:border-0 text-xs font-mono font-bold uppercase tracking-wider text-[#9CD01A] shrink-0">
                  <span>Redactar correo</span>
                  <ArrowUpRight className="w-4 h-4 group-hover/mail:translate-x-0.5 group-hover/mail:-translate-y-0.5 transition-transform" />
                </span>
              </a>
            </div>

            {/* COLUMNA DERECHA (5 COLUMNAS): VITRINA DIGITAL INSTAGRAM & TIKTOK (SIN YOUTUBE) */}
            <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
              {/* TARJETA INSTAGRAM OFICIAL */}
              <a
                href="https://www.instagram.com/massa_arquitectos?utm_source=ig_web_button_share_sheet&rpxt=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex-1 rounded-[24px] sm:rounded-[26px] overflow-hidden border border-white/10 hover:border-[#E1306C]/55 bg-[#0B0D11]/95 p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.75)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-gradient-to-tr from-[#F58529]/20 via-[#DD2A7B]/20 to-[#8134AF]/20 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"
                />

                <div className="relative z-10 flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#F58529]/25 via-[#DD2A7B]/25 to-[#8134AF]/25 border border-[#E1306C]/40 flex items-center justify-center text-[#E1306C] group-hover:scale-110 transition-transform shadow-[0_0_25px_rgba(225,48,108,0.2)] shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#E1306C]/15 text-[#E1306C] border border-[#E1306C]/30 uppercase tracking-wider">
                        Instagram Oficial
                      </span>
                      <h3 className="text-base sm:text-xl font-black text-white mt-1 tracking-tight truncate">
                        @massa_arquitectos
                      </h3>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/70 group-hover:text-[#E1306C] group-hover:border-[#E1306C]/40 transition-colors shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative z-10 mt-5 pt-4 border-t border-white/[0.07] flex items-center justify-between gap-2">
                  <span className="text-xs text-white/60">
                    Portafolio de renders 4K, diseño interior y dirección de obra.
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E1306C] shrink-0">
                    Explorar ↗
                  </span>
                </div>
              </a>

              {/* TARJETA TIKTOK OFICIAL */}
              <a
                href="https://www.tiktok.com/@massa.group?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex-1 rounded-[24px] sm:rounded-[26px] overflow-hidden border border-white/10 hover:border-[#00F2FE]/55 bg-[#0B0D11]/95 p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.75)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#00F2FE]/15 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"
                />

                <div className="relative z-10 flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#00F2FE]/15 border border-[#00F2FE]/35 flex items-center justify-center text-[#00F2FE] group-hover:scale-110 transition-transform shadow-[0_0_25px_rgba(0,242,254,0.2)] shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-6.6 6.32 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.52a8.27 8.27 0 0 0 5.17 1.83V6.9a4.83 4.83 0 0 1-2-.21z"/></svg>
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30 uppercase tracking-wider">
                        TikTok Oficial
                      </span>
                      <h3 className="text-base sm:text-xl font-black text-white mt-1 tracking-tight truncate">
                        @massa.group
                      </h3>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/70 group-hover:text-[#00F2FE] group-hover:border-[#00F2FE]/40 transition-colors shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative z-10 mt-5 pt-4 border-t border-white/[0.07] flex items-center justify-between gap-2">
                  <span className="text-xs text-white/60">
                    Reels arquitectónicos, recorridos en obra y procesos constructivos.
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00F2FE] shrink-0">
                    Ver videos ↗
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* BLOQUE INFERIOR MONUMENTAL: OFICINA PRINCIPAL (GOOGLE MAPS) */}
          <div className="mt-5 sm:mt-6 rounded-[24px] sm:rounded-[28px] overflow-hidden border border-[#9CD01A]/30 bg-gradient-to-r from-[#0C0F0B] via-[#0B0D11] to-[#0A0C10] p-5 sm:p-8 lg:px-10 lg:py-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative">
            {/* Líneas de coordenadas tipo plano arquitectónico */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: 'radial-gradient(#9CD01A 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                <a
                  href="https://maps.app.goo.gl/TuKJeBdYcAjLwsYr7"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver Oficina Principal en Google Maps"
                  className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#9CD01A]/15 border border-[#9CD01A]/40 flex items-center justify-center text-[#9CD01A] shrink-0 shadow-[0_0_25px_rgba(156,208,26,0.2)] hover:scale-105 transition-transform"
                >
                  <span className="absolute inset-0 rounded-2xl border border-[#9CD01A]/40 animate-ping opacity-30" />
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="massa-metallic-text text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em]">
                      Oficina Principal • Estudio & Atención Privada
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#9CD01A]/15 text-[#9CD01A] border border-[#9CD01A]/30 uppercase">
                      Cúcuta, N. de S.
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    Visítanos en Nuestra Sede Principal
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
                    ¿Tienes un lote o proyecto en mente? Evaluamos en estudio la topografía, bioclimática y potencial constructivo de tu desarrollo.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <a
                  href="https://maps.app.goo.gl/TuKJeBdYcAjLwsYr7"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #4E6E08 0%, #8EC115 16%, #E4FF8A 34%, #9CD01A 50%, #5F870A 66%, #DAFF6E 82%, #7CB010 100%)',
                    boxShadow: '0 10px 28px rgba(156, 208, 26, 0.3)',
                  }}
                  className="min-h-[48px] px-6 py-3.5 rounded-xl text-[#060804] font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Ver Ubicación en Google Maps</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER MINIMALISTA & MODERNO */}
      <footer
        className="relative bg-[#050608] border-t border-white/[0.08] py-10 sm:py-12 px-4 sm:px-8 lg:px-14 text-left"
        style={{
          paddingBottom: 'max(2.5rem, calc(2rem + env(safe-area-inset-bottom, 0px)))',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={massaLogoInline}
              alt="MASSA HOME"
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <span className="text-xs text-white/40 border-l border-white/10 pl-3">
              Arquitectura de Autor • Gemelos Digitales 360°
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-xs text-white/60">
            <a href="#hero" className="hover:text-white transition">Home</a>
            <a href="#proyectos" className="hover:text-white transition">Proyectos</a>
            <button
              type="button"
              onClick={() => setActiveInfoModal('quienes-somos')}
              className="hover:text-white transition cursor-pointer"
            >
              Nosotros
            </button>
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

          <div className="text-xs font-mono text-white/40 text-center md:text-right">
            © 2026 MASSA HOME • Por MASSA GROUP
          </div>
        </div>
      </footer>


      {/* MODALES FUNCIONALES */}
      <CommercialLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />

      {/* MODAL EDITORIAL MONUMENTAL: QUIÉNES SOMOS (NOSOTROS) */}
      <AnimatePresence>
        {activeInfoModal === 'quienes-somos' && (
          <m.div
            key="modal-quienes-somos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setActiveInfoModal(null)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 lg:p-10 bg-black/85 backdrop-blur-xl overflow-y-auto overscroll-contain"
          >
            <m.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
              }}
              className="relative w-full max-w-6xl max-h-[94dvh] sm:max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[28px] sm:rounded-[34px] bg-[#090B0F] border-t sm:border border-[#9CD01A]/35 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_60px_rgba(156,208,26,0.12)] text-left sm:my-auto"
            >
              {/* Retícula arquitectónica sutil y luz ambiental */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    'linear-gradient(#9CD01A 1px, transparent 1px), linear-gradient(90deg, #9CD01A 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />
              <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#9CD01A]/10 blur-[130px]" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#9CD01A]/[0.07] blur-[130px]" />

              {/* Barra Superior Sticky para Móvil y Escritorio (Siempre accesible al hacer scroll) */}
              <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3.5 sm:px-8 sm:py-5 bg-[#090B0F]/90 backdrop-blur-xl border-b border-white/[0.08]">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/35 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#9CD01A] animate-pulse shrink-0" />
                  <span className="massa-metallic-text text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.18em] sm:tracking-[0.22em] uppercase truncate">
                    MASSA GROUP • ESTUDIO DE AUTOR
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveInfoModal(null)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-white/[0.07] hover:bg-[#9CD01A] border border-white/15 hover:border-[#9CD01A] text-white/85 hover:text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-lg shrink-0"
                  title="Cerrar ventana"
                >
                  <span>Cerrar</span>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-10 p-4 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-stretch">
                {/* COLUMNA IZQUIERDA (7 COLUMNAS): FOTOGRAFÍA CORPORATIVA PANORÁMICA 16:9 + MÉTRICAS DEL ESTUDIO */}
                <div className="lg:col-span-7 flex flex-col justify-between gap-3.5 sm:gap-4">
                  {/* Marco Panorámico 16:9 sin recortar al equipo */}
                  <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[#9CD01A]/35 bg-[#0F1218] shadow-[0_20px_50px_rgba(0,0,0,0.85)] group">
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                      <img
                        src="/images/massa-equipo-corporativo.jpg"
                        alt="Equipo Corporativo MASSA Group"
                        className="w-full h-full object-cover object-center transform group-hover:scale-[1.03] transition-transform duration-1000 filter contrast-[1.04] brightness-[0.98]"
                      />
                      {/* Viñeteado inferior sutil en tablet/desktop */}
                      <div className="hidden sm:block pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06070A] via-transparent to-black/25 opacity-90" />

                      {/* Sello Superior Izquierdo sobre la fotografía (en pantallas sm+ para dejar 100% despejada la foto en móvil) */}
                      <div className="hidden sm:flex absolute top-4 left-4 items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15">
                        <img
                          src={massaLogoInline}
                          alt="MASSA"
                          className="h-5 w-auto object-contain"
                        />
                        <span className="h-3 w-px bg-white/20" />
                        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white/90 uppercase">
                          FIRMA CORPORATIVA
                        </span>
                      </div>

                      {/* Pie de fotografía superpuesto en tablet/desktop */}
                      <div className="hidden sm:flex absolute bottom-4 inset-x-5 flex-wrap items-end justify-between gap-2">
                        <div>
                          <span className="massa-metallic-text text-[10px] font-mono font-bold uppercase tracking-[0.24em] block">
                            DIRECCIÓN, ARQUITECTURA &amp; INGENIERÍA
                          </span>
                          <p className="text-sm font-bold text-white tracking-tight">
                            Equipo Multidisciplinario MASSA Group • Sede Principal
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#9CD01A]/20 backdrop-blur-md border border-[#9CD01A]/45 text-[9px] font-mono font-bold text-[#D9FF66] uppercase tracking-wider">
                          Cúcuta, N. de S.
                        </span>
                      </div>
                    </div>

                    {/* Pie de fotografía dedicado en móvil (debajo de la foto para no cubrir al equipo) */}
                    <div className="flex sm:hidden items-center justify-between gap-2 px-3.5 py-3 bg-[#0B0E14] border-t border-white/10">
                      <div className="min-w-0">
                        <span className="massa-metallic-text text-[8px] font-mono font-bold uppercase tracking-[0.18em] block truncate">
                          DIRECCIÓN, ARQUITECTURA &amp; INGENIERÍA
                        </span>
                        <p className="text-xs font-bold text-white tracking-tight truncate">
                          Equipo Corporativo MASSA Group
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/40 text-[8px] font-mono font-bold text-[#D9FF66] uppercase tracking-wider shrink-0">
                        Cúcuta, N. de S.
                      </span>
                    </div>
                  </div>

                  {/* Fila de 3 Tarjetas de Respaldo Corporativo (optimizada para móvil sin quiebres de línea) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
                    <div className="rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 p-2.5 sm:p-4 min-w-0">
                      <span className="massa-metallic-text text-sm sm:text-2xl font-black font-mono tracking-tight block whitespace-nowrap">
                        100%
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-white mt-0.5 block truncate">
                        Diseño de Autor
                      </span>
                      <span className="text-[10px] text-white/45 hidden sm:block mt-0.5">
                        Identidad única por lote
                      </span>
                    </div>

                    <div className="rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 p-2.5 sm:p-4 min-w-0">
                      <span className="massa-metallic-text text-sm sm:text-2xl font-black font-mono tracking-tight block whitespace-nowrap">
                        BIM 360°
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-white mt-0.5 block truncate">
                        Gemelos Digitales
                      </span>
                      <span className="text-[10px] text-white/45 hidden sm:block mt-0.5">
                        Inmersión pre-constructiva
                      </span>
                    </div>

                    <div className="rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 p-2.5 sm:p-4 min-w-0">
                      <span className="massa-metallic-text text-sm sm:text-2xl font-black font-mono tracking-tight block whitespace-nowrap">
                        INTEGRAL
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-white mt-0.5 block truncate">
                        Rigor Técnico
                      </span>
                      <span className="text-[10px] text-white/45 hidden sm:block mt-0.5">
                        Control de obra y costos
                      </span>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA (5 COLUMNAS): MANIFIESTO EDITORIAL & PILARES ARQUITECTÓNICOS */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[0.95] uppercase mb-3 sm:mb-4">
                      Quiénes <span className="massa-metallic-text">Somos</span>
                    </h3>

                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4 sm:mb-5">
                      Somos una firma de arquitectura, ingeniería y construcción de residencias y desarrollos exclusivos en Colombia. Nuestro equipo multidisciplinario integra diseño bioclimático contemporáneo, precisión estructural y visualización inmersiva en Cúcuta y Norte de Santander.
                    </p>

                    {/* 3 Pilares en Tarjetas Arquitectónicas */}
                    <div className="space-y-2.5 mb-5 sm:mb-6">
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#9CD01A]/35 transition-colors flex items-start gap-3">
                        <div className="w-7 h-7 rounded-xl bg-[#9CD01A]/15 border border-[#9CD01A]/35 flex items-center justify-center text-[#9CD01A] shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            Arquitectura Bioclimática de Alta Gama
                          </h4>
                          <p className="text-[11px] sm:text-xs text-white/55 mt-0.5 leading-relaxed">
                            Proyectos concebidos según asoleamiento, ventilación cruzada y topografía real de cada terreno.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#9CD01A]/35 transition-colors flex items-start gap-3">
                        <div className="w-7 h-7 rounded-xl bg-[#9CD01A]/15 border border-[#9CD01A]/35 flex items-center justify-center text-[#9CD01A] shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            Ingeniería &amp; Ejecución de Alta Precisión
                          </h4>
                          <p className="text-[11px] sm:text-xs text-white/55 mt-0.5 leading-relaxed">
                            Dirección técnica rigurosa, planeación presupuestal transparente y acabados de primer nivel.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#9CD01A]/35 transition-colors flex items-start gap-3">
                        <div className="w-7 h-7 rounded-xl bg-[#9CD01A]/15 border border-[#9CD01A]/35 flex items-center justify-center text-[#9CD01A] shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            Tecnología BIM &amp; Recorridos 360°
                          </h4>
                          <p className="text-[11px] sm:text-xs text-white/55 mt-0.5 leading-relaxed">
                            Gemelos digitales interactivos para explorar cada espacio antes y durante su construcción.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Directas */}
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t border-white/[0.08]">
                    <a
                      href="#proyectos"
                      onClick={() => setActiveInfoModal(null)}
                      style={{
                        backgroundImage:
                          'linear-gradient(135deg, #4E6E08 0%, #8EC115 16%, #E4FF8A 34%, #9CD01A 50%, #5F870A 66%, #DAFF6E 82%, #7CB010 100%)',
                        boxShadow: '0 10px 28px rgba(156, 208, 26, 0.28)',
                      }}
                      className="min-h-[48px] flex-1 py-3.5 px-5 rounded-xl text-[#060804] font-black text-xs text-center uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span>Ver Catálogo de Obras</span>
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                    </a>
                    <a
                      href="#contacto"
                      onClick={() => setActiveInfoModal(null)}
                      className="min-h-[48px] py-3.5 px-5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#9CD01A]/45 text-white font-bold text-xs text-center uppercase tracking-wider transition-all flex items-center justify-center"
                    >
                      Contacto Directo
                    </a>
                  </div>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

    </div>
  );
}
