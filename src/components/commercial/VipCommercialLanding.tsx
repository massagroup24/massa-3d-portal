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
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react';
import { 
  COMMERCIAL_RESIDENCES, 
  CommercialResidence,
  TRUSTED_PARTNERS_ROW1,
  TRUSTED_PARTNERS_ROW2
} from '../../data/commercialData';
import { VipContactModal } from './VipContactModal';
import { CommercialLoginModal } from './CommercialLoginModal';
import { Project, CANONICAL_PROJECT_ORDER } from '../../data/tourData';
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
  projects,
}: VipCommercialLandingProps) {
  // Estados de Onboarding cinemático:
  // 1. Splash con logo MASSA animado
  // 2. Secuencia rápida de bienvenida con conceptos (DISEÑO -> ARQUITECTURA -> EXCLUSIVIDAD)
  // 3. Revelación monumental de MASSA HOME
  // 4. Asentamiento con barra difuminada inferior y menús
  const [showSplash, setShowSplash] = useState(true);
  const [introPhase, setIntroPhase] = useState<'splash' | 'concepts' | 'brand-reveal' | 'settled'>('splash');
  const [conceptIndex, setConceptIndex] = useState(0);

  const CONCEPTS = useMemo(() => [
    { title: 'DISEÑO', subtitle: 'VISIÓN CONTEMPORÁNEA' },
    { title: 'ARQUITECTURA', subtitle: 'INGENIERÍA DE AUTOR' },
    { title: 'EXCLUSIVIDAD', subtitle: 'ALTO VALOR RESIDENCIAL' }
  ], []);

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

  // 1. Temporizador del Splash con logo animado (2.5s para apreciar el logo MASSA)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setIntroPhase('concepts');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Secuencia cinemática de conceptos sobre el video de fondo
  useEffect(() => {
    if (introPhase !== 'concepts') return;
    setConceptIndex(0);

    const c1 = setTimeout(() => {
      setConceptIndex(1); // ARQUITECTURA
    }, 750);

    const c2 = setTimeout(() => {
      setConceptIndex(2); // EXCLUSIVIDAD
    }, 1500);

    const c3 = setTimeout(() => {
      setIntroPhase('brand-reveal'); // Revelación MASSA HOME
    }, 2250);

    return () => {
      clearTimeout(c1);
      clearTimeout(c2);
      clearTimeout(c3);
    };
  }, [introPhase]);

  // 3. Transición de la revelación de marca hacia el estado final asentado
  useEffect(() => {
    if (introPhase !== 'brand-reveal') return;

    const brandTimer = setTimeout(() => {
      setIntroPhase('settled');
    }, 950);

    return () => clearTimeout(brandTimer);
  }, [introPhase]);

  // Detector estricto de assets 360 panorámicos, equirrectangulares o placeholders no auténticos
  const is360OrPlaceholderAsset = (url?: string): boolean => {
    if (!url || typeof url !== 'string' || !url.trim()) return true;
    const lower = url.toLowerCase();
    return (
      lower.includes('360') ||
      lower.includes('panorama') ||
      lower.includes('pano') ||
      lower.includes('equirectangular') ||
      lower.includes('sphere') ||
      lower.includes('.hdr') ||
      lower.includes('1546484396') ||
      lower.includes('unsplash.com') ||
      lower.includes('pan_') ||
      lower.includes('_pan') ||
      lower.includes('panor')
    );
  };

  // Resuelve el auténtico render principal arquitectónico del proyecto
  // Si no hay ningún render 2D genuino cargado, retorna cadena vacía para activar el estado explicativo
  const resolveMainArchitecturalRender = (p: Project): string => {
    // 1. Renders reales en p.renders
    if (p.renders && p.renders.length > 0) {
      const facade = p.renders.find(
        (r) =>
          (r.category === 'Fachada' ||
            r.title?.toLowerCase().includes('fachada') ||
            r.title?.toLowerCase().includes('principal') ||
            r.title?.toLowerCase().includes('exterior')) &&
          !is360OrPlaceholderAsset(r.storage_path)
      );
      if (facade?.storage_path) return facade.storage_path;

      const anyRender = p.renders.find((r) => !is360OrPlaceholderAsset(r.storage_path));
      if (anyRender?.storage_path) return anyRender.storage_path;
    }

    // 2. heroImage genuino de la obra
    if (p.heroImage && !is360OrPlaceholderAsset(p.heroImage)) {
      return p.heroImage;
    }

    // 3. Galería de imágenes genuina
    if (p.galleryImages && p.galleryImages.length > 0) {
      const galleryImg = p.galleryImages.find((img) => !is360OrPlaceholderAsset(img));
      if (galleryImg) return galleryImg;
    }

    // 4. Thumbnail si es un render real y no 360 ni placeholder
    if (p.thumbnail && !is360OrPlaceholderAsset(p.thumbnail)) {
      return p.thumbnail;
    }

    // Si no hay render 2D cargado para este proyecto, NO inventar nada: retornar vacío
    return '';
  };

  // Mapear los proyectos activos en desarrollo (Marquimoda y Edinson Jején se conservan exclusivamente en el apartado de Recorridos 360° Guardados)
  const SAVED_TOUR_ONLY_IDS = new Set(['project_1781963945215', 'project_1782912175010']);

  const dynamicResidences: CommercialResidence[] = useMemo(() => {
    if (projects && Object.keys(projects).length > 0) {
      const seen = new Set<string>();
      const list: CommercialResidence[] = [];

      for (const p of Object.values(projects)) {
        if (!p || !p.id) continue;
        const canonicalId = p.id === 'edinson-jejen' ? 'project_1781963945215' 
          : p.id === 'marquimoda' ? 'project_1782912175010' 
          : (p.id === 'ibiza-a14' || p.id === 'ibiza') ? 'project_ibiza_a14'
          : (p.id === 'hacienda-f22' || p.id === 'hacienda') ? 'project_hacienda_f22'
          : p.id;
        if (SAVED_TOUR_ONLY_IDS.has(canonicalId)) continue;
        if (seen.has(canonicalId)) continue;
        seen.add(canonicalId);

        // Encontrar datos comerciales de enriquecimiento si existen
        const curated = COMMERCIAL_RESIDENCES.find(c => c.projectId === canonicalId || c.id === canonicalId);
        const pCat = (p.category as any) || curated?.category || 'villa';

        list.push({
          id: canonicalId,
          projectId: canonicalId,
          name: p.name || curated?.name || 'Obra MASSA',
          tagline: p.tagline || curated?.tagline || p.description || 'Exclusiva residencia de autor MASSA',
          category: pCat,
          categoryLabel: p.categoryLabel || curated?.categoryLabel || 'Residencia de Autor',
          location: p.location || curated?.location || 'Valle del Cauca, Colombia',
          zone: p.zone || curated?.zone || 'Zona Exclusiva',
          areaBuilt: p.areaBuilt || curated?.areaBuilt || '450 m²',
          areaLot: p.areaLot || curated?.areaLot,
          bedrooms: p.bedrooms ?? curated?.bedrooms ?? 4,
          bathrooms: p.bathrooms ?? curated?.bathrooms ?? 5,
          parkingSpaces: p.parkingSpaces ?? curated?.parkingSpaces ?? 3,
          priceCOP: p.priceCOP || curated?.priceCOP || 'Obra Privada',
          priceUSD: p.priceUSD || curated?.priceUSD || 'Proyecto Personalizado',
          status: (p.status as any) || curated?.status || 'en_obra',
          statusLabel: p.statusLabel || curated?.statusLabel || 'En Ejecución',
          hasTour360: !!p.hasTour360,
          featured: !!p.featured,
          heroImage: resolveMainArchitecturalRender(p) || (curated?.heroImage && !is360OrPlaceholderAsset(curated.heroImage) ? curated.heroImage : ''),
          galleryImages: (p.galleryImages && p.galleryImages.length > 0)
            ? p.galleryImages.filter((img) => !is360OrPlaceholderAsset(img))
            : (curated?.galleryImages || (p.renders ? p.renders.filter((r) => !is360OrPlaceholderAsset(r.storage_path)).map((r) => r.storage_path) : [])),
          highlights: p.highlights && p.highlights.length > 0 ? p.highlights : (curated?.highlights || []),
          description: p.description || curated?.description || ''
        });
      }

      // Orden canónico estricto: 1. Hacienda F22, 2. Ibiza A14, 3. Edinson Jején, 4. Marquimoda
      list.sort((a, b) => {
        const idxA = CANONICAL_PROJECT_ORDER.indexOf(a.id);
        const idxB = CANONICAL_PROJECT_ORDER.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });

      if (list.length > 0) {
        return list;
      }
    }
    const fallbackList = COMMERCIAL_RESIDENCES
      .filter((c) => !SAVED_TOUR_ONLY_IDS.has(c.id) && !(c.projectId && SAVED_TOUR_ONLY_IDS.has(c.projectId)))
      .map((c) => ({
        ...c,
        heroImage: !is360OrPlaceholderAsset(c.heroImage) ? c.heroImage : '',
      }));
    return fallbackList.sort((a, b) => {
      const idxA = CANONICAL_PROJECT_ORDER.indexOf(a.id);
      const idxB = CANONICAL_PROJECT_ORDER.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [projects]);

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
              setIntroPhase('concepts');
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
          <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            introPhase === 'concepts' || introPhase === 'brand-reveal'
              ? 'bg-black/60' 
              : 'bg-gradient-to-t from-[#08090D] via-black/25 to-black/40'
          }`} />
        </div>

        {/* BOTÓN DISCRETO PARA OMITIR INTRO */}
        <AnimatePresence>
          {introPhase !== 'settled' && !showSplash && (
            <m.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => {
                e.stopPropagation();
                setIntroPhase('settled');
              }}
              className="absolute top-6 right-6 sm:top-10 sm:right-10 z-40 px-4 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-[#9CD01A]/60 text-white/80 hover:text-white font-mono text-[11px] font-bold tracking-widest uppercase backdrop-blur-md transition-all shadow-xl cursor-pointer"
            >
              Omitir intro ✕
            </m.button>
          )}
        </AnimatePresence>

        {/* SECUENCIA CINEMÁTICA RÁPIDA: DISEÑO • ARQUITECTURA • EXCLUSIVIDAD */}
        <AnimatePresence mode="wait">
          {introPhase === 'concepts' && (
            <m.div
              key={`concept-screen-${conceptIndex}`}
              initial={{ opacity: 0, scale: 0.94, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none"
            >
              {/* Resplandor focal esmeralda */}
              <div className="absolute w-[450px] sm:w-[650px] h-[300px] sm:h-[400px] bg-[#9CD01A]/15 rounded-full blur-[110px] pointer-events-none -z-10" />

              {/* Badge superior */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 border border-[#9CD01A]/40 backdrop-blur-md mb-5 shadow-2xl">
                <span className="w-2 h-2 rounded-full bg-[#9CD01A] animate-ping" />
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.35em] text-[#9CD01A] uppercase">
                  {CONCEPTS[conceptIndex].subtitle}
                </span>
              </div>

              {/* Título de gran escala del concepto */}
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-[0.16em] sm:tracking-[0.24em] uppercase filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
                {CONCEPTS[conceptIndex].title}
              </h2>

              {/* Indicadores lineales de progreso */}
              <div className="flex items-center gap-2 mt-8">
                {CONCEPTS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === conceptIndex ? 'w-10 bg-[#9CD01A] shadow-[0_0_12px_#9CD01A]' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* REVELACIÓN MONUMENTAL DE MASSA HOME */}
        <AnimatePresence>
          {introPhase === 'brand-reveal' && (
            <m.div
              key="brand-reveal-screen"
              initial={{ opacity: 0, scale: 0.88, filter: 'blur(16px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none"
            >
              <div className="absolute w-[500px] h-[350px] bg-[#9CD01A]/20 rounded-full blur-[130px] pointer-events-none -z-10" />

              <m.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mb-3 text-xs sm:text-sm font-mono tracking-[0.45em] uppercase text-white/80 font-bold"
              >
                BIENVENIDO A
              </m.div>

              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.88] uppercase select-none filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
                MASSA<br />
                <span className="text-[#9CD01A] drop-shadow-[0_0_45px_rgba(156,208,26,0.7)]">HOME</span>
              </h1>
            </m.div>
          )}
        </AnimatePresence>

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


      {/* 3. SECCIÓN: PROYECTOS EN DESARROLLO (ACORDEÓN HOVER EXPANDIBLE) */}
      <section id="proyectos" className="relative py-20 sm:py-28 px-4 sm:px-8 lg:px-14 bg-[#08090D] border-t border-white/[0.08]">
        
        {/* Cabecera de Sección */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div className="max-w-3xl text-left">
            <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#9CD01A] uppercase block mb-2">
              • PORTAFOLIO EN CURSO
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              Proyectos en desarrollo
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-3 max-w-xl font-normal leading-relaxed">
              Obras arquitectónicas activas en nuestro estudio. Pasa el cursor sobre cada proyecto para desplegar sus especificaciones y acceder a su gemelo digital inmersivo 360°.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-end">
            <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/60 font-mono text-[11px] font-bold tracking-wider uppercase">
              {dynamicResidences.length} {dynamicResidences.length === 1 ? 'OBRA EN CURSO' : 'OBRAS EN CURSO'}
            </span>
          </div>
        </div>

        {/* Acordeón Interactivo de Proyectos (Horizontal en Desktop, Vertical en Móvil) */}
        <div className="flex flex-col lg:flex-row gap-4 lg:h-[620px] w-full">
          {dynamicResidences.map((residence, idx) => {
            const isActive = activeProjectIndex === idx;
            const hasRealRender = !!residence.heroImage;
            const isHacienda = residence.id === 'project_hacienda_f22';
            const identity = getProjectIdentity(residence.id);
            const brand = identity.clientBrand;
            // Solo Hacienda F22 tiene marca de cliente externo (AMHO Construcciones con acentos champagne gold)
            // Ibiza A14 conserva la identidad de autor insigne de MASSA con su verde lima característico (#9CD01A)
            const isCustomBrand = Boolean(brand && isHacienda);
            const primaryColor = identity.theme.primaryColor || (isHacienda ? '#DFC47B' : '#9CD01A');
            const metallicGradient =
              brand?.metallicGradient ||
              (isHacienda
                ? 'linear-gradient(135deg, #B89752 0%, #DFC47B 32%, #F7E8A8 50%, #D1B16B 74%, #9E7D3B 100%)'
                : 'linear-gradient(135deg, #729B0E 0%, #9CD01A 35%, #D4FF5E 52%, #8CBF14 76%, #5B7E08 100%)');

            const facadeRender =
              identity.heroVideoPoster ||
              residence.heroImage ||
              (residence.id === 'project_hacienda_f22' ? '/HACIENDA F22/FACHADA.png' : '/IBIZA A14/01-F004.jpg');

            return (
              <div
                key={residence.id || `proj-${idx}`}
                onMouseEnter={() => setActiveProjectIndex(idx)}
                onClick={() => {
                  if (!isActive) {
                    setActiveProjectIndex(idx);
                  } else {
                    onSelectProjectForPortal(residence.projectId || residence.id);
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
                {/* Visual de Fondo Unificado: Render Fotorrealista de Fachada en Alta Definición para ambas obras */}
                {facadeRender ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#101218] via-[#0b0c10] to-[#06070a] overflow-hidden">
                      <img
                        src={encodeURI(facadeRender)}
                        alt={residence.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${
                          isActive
                            ? 'scale-105 filter brightness-[0.78] contrast-[1.08]'
                            : 'filter brightness-[0.38] contrast-[0.95] grayscale-[15%]'
                        }`}
                        loading="eager"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent pointer-events-none" />
                  </>
                ) : (
                  /* Fondo Técnico CAD cuando no hay render 2D asignado */
                  <div className="absolute inset-0 bg-gradient-to-br from-[#13141a] via-[#0e0f13] to-[#090a0d]">
                    <div
                      className="absolute inset-0 opacity-[0.08] pointer-events-none"
                      style={{
                        backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
                  </div>
                )}

                {/* CONTENIDO CUANDO EL PROYECTO NO ESTÁ ACTIVO */}
                {!isActive && (
                  <div className="absolute inset-0 p-5 sm:p-6 flex lg:flex-col items-center lg:items-start justify-between z-10 select-none">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: primaryColor }}
                      >
                        0{idx + 1}
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
                      className="text-base sm:text-lg lg:text-2xl font-black uppercase tracking-wider lg:[writing-mode:vertical-rl] lg:rotate-180 truncate select-none"
                    >
                      <span className="text-white">{identity.titlePrefix || (isHacienda ? 'HACIENDA' : 'IBIZA')}</span>{' '}
                      <span
                        className="inline-block font-black"
                        style={{
                          backgroundImage: metallicGradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: primaryColor,
                          filter: `drop-shadow(0 0 16px ${primaryColor}75)`
                        }}
                      >
                        {identity.titleHighlight || (isHacienda ? 'F22' : 'A14')}
                      </span>
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

                {/* CONTENIDO CUANDO EL PROYECTO ESTÁ ACTIVO (Panel Extendido con Identidad Propia) */}
                {isActive && (
                  <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10 text-left select-none">
                    {/* Barra Superior */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3.5 py-1.5 rounded-full font-black text-xs tracking-wider uppercase ${
                            isCustomBrand ? 'text-[#060608] shadow-[0_4px_15px_rgba(223,196,123,0.35)]' : 'bg-[#9CD01A] text-black'
                          }`}
                          style={isCustomBrand ? { backgroundImage: metallicGradient } : undefined}
                        >
                          {identity.lot ? `OBRA 0${idx + 1} • ${identity.lot}` : `OBRA 0${idx + 1}`}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border font-mono text-[11px] font-bold tracking-wider uppercase ${
                            isCustomBrand
                              ? 'border-[#DFC47B]/35 text-[#F1E29B]'
                              : 'border-white/10 text-white/80'
                          }`}
                        >
                          {identity.categoryLabel || residence.categoryLabel || 'Residencia de Autor'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {residence.hasTour360 && (
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

                        {brand?.logoHorizontalWhite ? (
                          <div className="hidden sm:flex items-center px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-[#DFC47B]/40 shadow-lg">
                            <img
                              src={encodeURI(brand.logoHorizontalWhite)}
                              alt={brand.companyName}
                              className="h-5 w-auto object-contain"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-white/50 tracking-widest hidden sm:inline">
                            {identity.brandName || 'MASSA HOME'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Información Principal y Llamado a la Acción */}
                    <div className="max-w-2xl">
                      <span
                        className={`text-xs sm:text-sm font-mono font-bold tracking-wider uppercase block mb-1 ${
                          isCustomBrand ? 'text-[#F1E29B]' : 'text-[#9CD01A]'
                        }`}
                      >
                        {identity.locationFull || `${residence.location || 'Cúcuta, Colombia'} • ${residence.zone || 'Zona Exclusiva'}`}
                      </span>

                      <h3
                        style={{ fontFamily: identity.theme.fontFamilyTitle }}
                        className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 tracking-tight uppercase leading-none select-none"
                      >
                        <span className="text-white">{identity.titlePrefix || (isHacienda ? 'HACIENDA' : 'IBIZA')}</span>{' '}
                        <span
                          className="inline-block bg-clip-text text-transparent font-black"
                          style={{
                            backgroundImage: metallicGradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: primaryColor,
                            filter: `drop-shadow(0 0 25px ${primaryColor}55)`
                          }}
                        >
                          {identity.titleHighlight || (isHacienda ? 'F22' : 'A14')}
                        </span>
                      </h3>

                      {(!hasRealRender && !isHacienda) ? (
                        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                          <div className="flex items-center gap-2 mb-1.5 text-[#9CD01A]">
                            <ImageIcon className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                              Render principal no asignado
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                            Esta obra se encuentra activa en nuestro estudio. Ingresa a los detalles para consultar la ficha técnica oficial y explorar su <span className="text-[#9CD01A] font-semibold">recorrido virtual 360° interactivo</span>.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-base text-white/85 leading-relaxed mb-6 font-medium line-clamp-2">
                          {identity.tagline || residence.tagline || residence.description}
                        </p>
                      )}

                      {/* Chips de especificaciones clave */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-6 text-xs font-mono">
                        <div
                          className={`px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-sm border text-white/80 ${
                            isCustomBrand ? 'border-[#DFC47B]/30' : 'border-white/10'
                          }`}
                        >
                          <span className="text-white/40 mr-1.5">Área:</span>
                          <span className="font-bold text-white">{identity.specs?.areaBuilt || residence.areaBuilt}</span>
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-sm border text-white/80 ${
                            isCustomBrand ? 'border-[#DFC47B]/30' : 'border-white/10'
                          }`}
                        >
                          <span className="text-white/40 mr-1.5">Estado:</span>
                          <span
                            className="font-bold"
                            style={{ color: isCustomBrand ? '#F1E29B' : primaryColor }}
                          >
                            {identity.statusLabel || residence.statusLabel || 'En Ejecución'}
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-sm border text-white/80 hidden sm:block ${
                            isCustomBrand ? 'border-[#DFC47B]/30' : 'border-white/10'
                          }`}
                        >
                          <span className="text-white/40 mr-1.5">{brand ? 'Firma:' : 'Modalidad:'}</span>
                          <span className="font-bold text-white">
                            {brand ? brand.companyName : (residence.priceCOP || 'Inversión Privada')}
                          </span>
                        </div>
                      </div>

                      {/* Botón Principal Personalizado según la Marca del Proyecto */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProjectForPortal(residence.projectId || residence.id);
                        }}
                        className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 ${
                          isCustomBrand
                            ? 'text-[#060608] border border-[#F7E8A8]/55 shadow-[0_10px_30px_rgba(223,196,123,0.4)]'
                            : 'bg-[#9CD01A] hover:bg-white text-black shadow-2xl'
                        }`}
                        style={isCustomBrand ? { backgroundImage: metallicGradient } : undefined}
                      >
                        <span>
                          {isCustomBrand
                            ? `Explorar Proyecto ${brand?.shortName} & Gemelo 360°`
                            : 'Explorar Ficha & Gemelo Digital 360°'}
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


      {/* 4. SECCIÓN: RESPALDO CORPORATIVO & EMPRESAS QUE CONFÍAN EN MASSA */}
      <section className="relative py-16 sm:py-24 bg-white border-y border-black/[0.06] overflow-hidden text-center select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 mb-8">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] text-[#648D08] uppercase block mb-2">
            • ALIANZAS ESTRATÉGICAS & CLIENTES CORPORATIVOS
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0D0E12]">
            Empresas que confían en MASSA GROUP
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto mt-2 font-normal">
            Más de 30 marcas, líderes empresariales e instituciones que han desarrollado proyectos con nuestra firma.
          </p>
        </div>

        {/* Carrusel Marquee de ancho total con difuminado lateral hacia blanco */}
        <div 
          className="w-full overflow-hidden py-4 space-y-4 sm:space-y-5"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%)'
          }}
        >
          {/* Carril 1 */}
          <div className="animate-marquee-left flex gap-5 sm:gap-6 items-center py-1">
            {[...TRUSTED_PARTNERS_ROW1, ...TRUSTED_PARTNERS_ROW1].map((partner, idx) => (
              <div
                key={`partner-r1-${idx}`}
                className="h-20 sm:h-24 md:h-28 w-48 sm:w-56 md:w-64 shrink-0 rounded-2xl bg-white border border-gray-100 hover:border-[#9CD01A] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex items-center justify-center p-4 group"
                title={partner.name}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-11 sm:max-h-14 max-w-[82%] object-contain group-hover:scale-105 transition-all duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Carril 2 */}
          <div className="animate-marquee-right flex gap-5 sm:gap-6 items-center py-1">
            {[...TRUSTED_PARTNERS_ROW2, ...TRUSTED_PARTNERS_ROW2].map((partner, idx) => (
              <div
                key={`partner-r2-${idx}`}
                className="h-20 sm:h-24 md:h-28 w-48 sm:w-56 md:w-64 shrink-0 rounded-2xl bg-white border border-gray-100 hover:border-[#9CD01A] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex items-center justify-center p-4 group"
                title={partner.name}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-11 sm:max-h-14 max-w-[82%] object-contain group-hover:scale-105 transition-all duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
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
                  href="https://wa.me/573108924410?text=Hola%20Massa%20Group,%20estoy%20interesado%20en%20conocer%20m%C3%A1s%20sobre%20sus%20proyectos%20arquitect%C3%B3nicos."
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
                        +57 310 892 4410
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
                  href="tel:+573108924410"
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
                        +57 310 892 4410
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
                    <span>Construcción integral llave en mano sin sobrecostos</span>
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
