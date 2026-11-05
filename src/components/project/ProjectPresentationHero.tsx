import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Compass, Eye, Maximize2, Minimize2, Pause, Play, RotateCcw, Video, Volume2, VolumeX } from 'lucide-react';
import type { ProjectIdentity } from '../../config/projectIdentityConfig';
import { formatAreaMetric, type CanonicalProject } from '../../data/canonicalProjects';

interface ProjectPresentationHeroProps {
  project: CanonicalProject;
  identity: ProjectIdentity;
  renderCount: number;
  onOpenTour: () => void;
  isLoading?: boolean;
}

export function ProjectPresentationHero({ project, identity, renderCount, onOpenTour, isLoading = false }: ProjectPresentationHeroProps) {
  const brand = identity.clientBrand;
  const color = identity.theme.primaryColor;
  const hoverColor = identity.theme.primaryHover || '#F1E29B';
  const gradient = brand?.metallicGradient || `linear-gradient(135deg, ${color}, ${hoverColor})`;
  // La configuración de identidad conserva también el espacio reservado cuando no hay reel oficial.
  const videoUrl = (project.video || identity.heroVideoUrl).trim();
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showOutro, setShowOutro] = useState(false);
  const hasBrandOutro = identity.id === 'project_hacienda_f22' && Boolean(brand);
  const isHaciendaF22 = identity.id === 'project_hacienda_f22';
  const hasVideo = Boolean(videoUrl) && !videoFailed;

  // Coreografía unificada de introducción central -> división a esquinas (estilo Casa Momo)
  const [introStage, setIntroStage] = useState<'center' | 'split'>(() => (reducedMotion ? 'split' : 'center'));
  const [minIntroDone, setMinIntroDone] = useState(() => reducedMotion);
  const [introRunId, setIntroRunId] = useState(0);

  const primaryMetrics = [
    { label: 'Construcción total', value: formatAreaMetric(project.area_construida) },
    { label: 'Área del lote', value: formatAreaMetric(project.area_lote) },
    {
      label: 'Configuración',
      value:
        project.habitaciones && project.banos
          ? `${project.habitaciones} Habitaciones · ${project.banos} Baños`
          : project.habitaciones
          ? `${project.habitaciones} Habitaciones`
          : null,
    },
    { label: 'Distribución', value: project.numero_pisos ? `${project.numero_pisos} niveles` : null },
  ].filter((metric): metric is { label: string; value: string } => Boolean(metric.value));

  const fallbackMetrics = [
    {
      label: 'Tipología',
      value: project.tipo ? project.tipo.charAt(0).toUpperCase() + project.tipo.slice(1) : identity.categoryLabel,
    },
    {
      label: 'Sector',
      value: [project.barrio_o_sector || identity.urbanization, identity.lot].filter(Boolean).join(' · '),
    },
    {
      label: 'Ubicación',
      value: [project.ciudad, project.departamento].filter(Boolean).join(' / ') || identity.location,
    },
    {
      label: 'Alcance',
      value: project.alcance,
    },
  ].filter((metric): metric is { label: string; value: string } => Boolean(metric.value));

  const metrics = primaryMetrics.length >= 4
    ? primaryMetrics
    : [
        ...primaryMetrics,
        ...fallbackMetrics.filter(fb => !primaryMetrics.some(pm => pm.label === fb.label)),
      ].slice(0, 4);

  const openGallery = () => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (reducedMotion) {
      setMinIntroDone(true);
      setIntroStage('split');
      return;
    }
    setMinIntroDone(false);
    setIntroStage('center');
    const timer = window.setTimeout(() => {
      setMinIntroDone(true);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, introRunId, identity.id]);

  useEffect(() => {
    if (reducedMotion) return;
    if (minIntroDone && !isLoading) {
      setIntroStage('split');
    }
  }, [reducedMotion, minIntroDone, isLoading]);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === stage.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    if (!showOutro) return;
    const timeout = window.setTimeout(() => {
      setShowOutro(false);
      if (video.current) {
        video.current.currentTime = 0;
        void video.current.play().catch(() => {});
      }
    }, 2800);
    return () => window.clearTimeout(timeout);
  }, [showOutro]);

  const togglePlayback = () => {
    if (!video.current) return;
    if (showOutro) {
      setShowOutro(false);
      video.current.currentTime = 0;
      void video.current.play().catch(() => {});
    } else if (playing) video.current.pause();
    else void video.current.play().catch(() => {});
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    else await stage.current?.requestFullscreen().catch(() => {});
  };

  const replayIntro = () => {
    setIntroStage('center');
    setIntroRunId(prev => prev + 1);
  };

  const isSplit = introStage === 'split';
  const isGold = color.toUpperCase() === '#DFC47B';
  const topTitleWord = isHaciendaF22 ? 'Hacienda Club' : identity.titlePrefix;
  const bottomTitleWord = identity.titleHighlight || identity.code;

  return (
    <main
      id="encabezado"
      className="relative z-10 mx-auto w-full max-w-[1680px] px-2.5 py-3 sm:px-6 sm:py-6 lg:px-10 lg:py-8"
      style={{ fontFamily: identity.theme.fontFamilyTitle }}
    >
      {/* ESCENARIO MONUMENTAL DE BIENVENIDA CON TRANSICIÓN CENTRAL A ESQUINAS */}
      <div
        ref={stage}
        id="project-hero-video-stage"
        className="group relative min-h-[520px] h-[79svh] sm:h-[83svh] lg:h-[85svh] max-h-[920px] w-full overflow-hidden rounded-2xl border bg-[#060609] sm:rounded-[32px]"
        style={{
          borderColor: `${color}58`,
          boxShadow: `0 30px 90px rgba(0,0,0,0.92), 0 0 65px ${color}1F`
        }}
      >
        {/* 1. CAPA DE VIDEO / IMAGEN ARQUITECTÓNICA DE FONDO */}
        {hasVideo ? (
          <video
            ref={video}
            key={videoUrl}
            poster={encodeURI(identity.heroVideoPoster || project.imagen_principal)}
            autoPlay
            loop={!hasBrandOutro}
            muted={muted}
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setVideoFailed(true)}
            onEnded={() => {
              setPlaying(false);
              if (hasBrandOutro) setShowOutro(true);
            }}
            onTimeUpdate={() => {
              if (video.current?.duration) {
                setProgress((video.current.currentTime / video.current.duration) * 100);
              }
            }}
            className={`relative z-0 h-full w-full object-cover transition-all duration-[1400ms] ease-out ${
              isSplit ? 'scale-100 opacity-100 brightness-100 contrast-[1.04]' : 'scale-[1.07] opacity-25 brightness-60'
            }`}
            src={encodeURI(videoUrl)}
          />
        ) : (
          <div
            className="absolute inset-0 z-0 flex items-center justify-center p-8"
            style={{ background: `radial-gradient(ellipse at center, ${color}12, transparent 70%)` }}
          >
            <div
              className="pointer-events-none absolute inset-4 rounded-xl border border-dashed sm:inset-6"
              style={{ borderColor: `${color}28` }}
            />
            <div className="relative text-center">
              <Video className="mx-auto mb-3 h-8 w-8 sm:mb-5 sm:h-12 sm:w-12" style={{ color }} />
              <h2 className="text-lg font-medium text-white sm:text-3xl">Video del proyecto</h2>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-white/50 sm:text-sm">
                {videoFailed ? 'El video no está disponible en este momento.' : 'Próximamente, el recorrido cinematográfico de esta residencia.'}
              </p>
            </div>
          </div>
        )}

        {/* 2. CORTINA TEATRAL OBSIDIANA PURA DURANTE LA ANIMACIÓN CENTRAL INICIAL (CAPA z-10, DEBAJO DE LAS LETRAS) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-10 bg-[#060609] transition-opacity duration-[1100ms] ease-out ${
            isSplit ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${color}1C 0%, rgba(6,6,9,0.96) 58%, #050507 100%)`
          }}
        />

        {/* 3. VIÑETA SUAVE DE CONTRASTE EN ESQUINAS (CAPA z-10, DEBAJO DE LAS LETRAS Y CONTROLES z-30) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(180deg, rgba(6,6,9,0.52) 0%, rgba(6,6,9,0.04) 30%, rgba(6,6,9,0.06) 65%, rgba(6,6,9,0.68) 100%), radial-gradient(circle at 0% 0%, rgba(6,6,9,0.55) 0%, transparent 42%), radial-gradient(circle at 100% 100%, rgba(6,6,9,0.62) 0%, transparent 45%)'
          }}
        />

        {/* 4. BARRA SUPERIOR DEL ESCENARIO (CAPA z-30 SOBRE EL FILTRO) */}
        <div
          className={`absolute inset-x-3.5 top-3.5 sm:inset-x-8 sm:top-6 lg:inset-x-12 lg:top-7 z-30 flex items-center justify-between gap-2 sm:gap-3 transition-all duration-700 delay-200 ${
            isSplit ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="rounded-full border bg-black/80 backdrop-blur-md px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-[0.18em] sm:px-3 sm:text-[10px] truncate"
              style={{ borderColor: `${color}55`, color: hoverColor }}
            >
              <span className={isGold ? 'gold-metallic-text' : ''}>
                {hasVideo ? `Reel arquitectónico · ${identity.code}` : 'Video · Próximamente'}
              </span>
            </span>
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border bg-black/60 backdrop-blur-md px-3 py-1 text-[9px] font-mono uppercase tracking-[0.18em] text-white/75"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            >
              {brand && <img src={encodeURI(brand.logoIcon)} alt="" className="h-3.5 w-3.5 object-contain" />}
              <span>{brand?.companyName || identity.brandName} · {identity.lot}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={replayIntro}
              title="Repetir animación de apertura"
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/70 backdrop-blur-md px-2.5 py-1 text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-white/70 hover:text-white hover:border-white/30 transition-colors cursor-pointer active:scale-95"
            >
              <RotateCcw className="h-3 w-3" style={{ color }} />
              <span>Intro</span>
            </button>
            {brand && (
              <div
                className="rounded-xl border bg-black/75 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 shadow-lg"
                style={{ borderColor: `${color}45` }}
              >
                <img
                  src={encodeURI(brand.logoHorizontalWhite)}
                  alt={brand.companyName}
                  className="h-3.5 w-auto object-contain sm:h-6"
                />
              </div>
            )}
          </div>
        </div>

        {/* 5. TÍTULO PROTAGONISTA EN CAPA SUPERIOR z-30 (ENCIMA DEL FILTRO OSCURO):
            INICIA EN EL CENTRO Y SE DESPLAZA A ESQUINA SUPERIOR IZQUIERDA E INFERIOR DERECHA */}
        <h1
          aria-label={identity.name}
          className="project-f22-title pointer-events-none absolute inset-0 z-30 uppercase text-[#FFFDF8]"
        >
          {/* Parte 1: Del centro a la esquina superior izquierda */}
          <span
            key={`${identity.id}-top-${introRunId}`}
            className={`project-f22-word-enter-1 absolute block whitespace-nowrap select-none transition-all duration-[1150ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isSplit
                ? 'left-3.5 top-14 sm:left-8 sm:top-16 lg:left-12 lg:top-20 translate-x-0 translate-y-0 scale-100 text-left'
                : 'left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 scale-105 text-center'
            }`}
          >{topTitleWord}</span>

          {/* Parte 2: Del centro a la esquina inferior derecha */}
          <span
            key={`${identity.id}-bottom-${introRunId}`}
            className={`project-f22-word-enter-2 absolute block whitespace-nowrap select-none transition-all duration-[1150ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isSplit
                ? 'right-3.5 bottom-[9.8rem] sm:right-8 sm:bottom-20 lg:right-12 lg:bottom-20 translate-x-0 translate-y-0 scale-110 sm:scale-125 origin-bottom-right text-right'
                : 'right-1/2 bottom-[39%] translate-x-1/2 translate-y-1/2 scale-110 text-center'
            }`}
          ><span style={{ color }}>{bottomTitleWord}</span></span>
        </h1>

        {/* Detalle decorativo justo debajo del título en la esquina superior izquierda (CAPA z-30) */}
        <div
          aria-hidden="true"
          style={{
            top: 'calc(clamp(3.5rem, 4.8vw, 5rem) + clamp(1.52rem, 5.3vw, 4.75rem) + 0.55rem)'
          }}
          className={`pointer-events-none absolute left-3.5 sm:left-8 lg:left-12 z-30 flex items-center gap-2.5 transition-all duration-700 delay-300 ${
            isSplit ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          <span className="h-[2px] w-10 sm:w-20 rounded-full" style={{ backgroundImage: gradient }} />
          <span className={`${isGold ? 'gold-metallic-text' : ''} text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.22em] sm:tracking-[0.26em]`} style={{ color: hoverColor }}>
            Arquitectura residencial · {project.ciudad || 'Cúcuta'}
          </span>
        </div>

        {/* 6. ESQUINA INFERIOR IZQUIERDA: DESCRIPCIÓN EDITORIAL & BOTONES DE ACCIÓN (CAPA z-30 SOBRE EL FILTRO) */}
        <div
          className={`absolute left-3.5 right-3.5 bottom-14 sm:left-8 sm:right-auto sm:bottom-20 lg:left-12 lg:bottom-20 z-30 max-w-md transition-all duration-700 delay-200 ${
            isSplit ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
          }`}
        >
          <p className="mb-3 text-[11px] sm:text-sm leading-relaxed text-white/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] line-clamp-2 sm:line-clamp-3">
            {project.descripcion_corta || identity.tagline}
          </p>
          <div className={`${project.hasTour360 ? 'grid grid-cols-2 sm:flex sm:flex-wrap' : 'flex flex-wrap'} items-center gap-2 sm:gap-2.5`}>
            {project.hasTour360 && (
              <button
                type="button"
                onClick={onOpenTour}
                className="group/btn min-h-[42px] sm:min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2.5 sm:px-5 sm:py-3 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#060608] shadow-2xl transition-all hover:scale-[1.03] active:scale-95 cursor-pointer whitespace-nowrap"
                style={{
                  backgroundImage: gradient,
                  boxShadow: `0 10px 30px ${color}4D`
                }}
              >
                <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform duration-300 group-hover/btn:rotate-45" />
                <span>Recorrido 360°</span>
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 hidden xs:inline" />
              </button>
            )}
            <button
              type="button"
              onClick={openGallery}
              className="min-h-[42px] sm:min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border bg-black/75 backdrop-blur-md px-4 py-2.5 sm:px-5 sm:py-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-black/90 hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
              style={{ borderColor: `${color}60` }}
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" style={{ color }} />
              <span>Ver renders ({renderCount})</span>
            </button>
          </div>
        </div>

        {/* 7. CIERRE DE MARCA AL TERMINAR EL REEL */}
        {hasVideo && showOutro && brand && (
          <div
            role="status"
            aria-label={`Presentado por ${brand.companyName}`}
            className="project-brand-outro absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-[#08080C] px-8"
          >
            <div
              className="project-brand-outro-glow pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(ellipse at center, ${color}20, transparent 65%)` }}
            />
            <span className="project-brand-outro-caption mb-5 text-[8px] uppercase tracking-[0.35em] text-white/55 sm:text-[10px]">
              Una visión que toma forma
            </span>
            <img
              src={encodeURI(brand.logoHorizontalWhite)}
              alt={brand.companyName}
              className="project-brand-outro-logo w-[65%] max-w-[330px] object-contain"
            />
            <div className="project-brand-outro-line my-5 h-px w-20" style={{ background: gradient }} />
            <span className="project-brand-outro-caption text-[8px] uppercase tracking-[0.3em] sm:text-[10px]" style={{ color }}>
              {identity.name}
            </span>
          </div>
        )}

        {/* 8. CONTROLES INFERIORES DE VIDEO Y BARRA DE PROGRESO (CAPA z-30) */}
        {hasVideo && (
          <>
            <div
              className={`absolute bottom-3.5 left-4 right-4 sm:bottom-4 sm:left-8 sm:right-8 lg:left-12 lg:right-12 z-30 flex items-center gap-2 transition-opacity duration-700 delay-300 ${
                isSplit ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <button
                type="button"
                aria-label={showOutro ? 'Volver a ver el video' : playing ? 'Pausar video' : 'Reproducir video'}
                onClick={togglePlayback}
                className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/20 bg-black/75 backdrop-blur-md text-white transition-transform hover:scale-105 cursor-pointer"
              >
                {playing ? <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: hoverColor }} /> : <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: hoverColor }} />}
              </button>
              <button
                type="button"
                aria-label={muted ? 'Activar sonido' : 'Silenciar'}
                onClick={() => setMuted(value => !value)}
                className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/20 bg-black/75 backdrop-blur-md text-white transition-transform hover:scale-105 cursor-pointer"
              >
                {muted ? <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" /> : <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: hoverColor }} />}
              </button>
              <button
                type="button"
                aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                onClick={() => void toggleFullscreen()}
                className="ml-auto grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/20 bg-black/75 backdrop-blur-md text-white transition-transform hover:scale-105 cursor-pointer"
              >
                {fullscreen ? <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: hoverColor }} /> : <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: hoverColor }} />}
              </button>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 z-20 h-1 w-full bg-white/10 transition-opacity duration-700 delay-300 ${
                isSplit ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="h-full transition-all duration-150" style={{ width: `${progress}%`, backgroundImage: gradient }} />
            </div>
          </>
        )}
      </div>

      {/* BARRA INFERIOR DE MÉTRICAS Y SELLO DE LA CONSTRUCTORA BAJO EL ESCENARIO PRINCIPAL */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 gap-4 rounded-2xl border bg-[#0B0B10]/90 p-3.5 sm:p-6 lg:grid-cols-12 lg:items-center" style={{ borderColor: `${color}30` }}>
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 sm:grid-cols-4 lg:col-span-8">
          {metrics.map(metric => (
            <div key={metric.label} className="relative min-w-0 pl-3 sm:pl-3.5">
              <span
                aria-hidden="true"
                className="absolute left-0 top-0.5 bottom-0.5 w-[2px] rounded-full"
                style={{ backgroundImage: gradient }}
              />
              <span className="mb-1 block text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.14em] sm:tracking-[0.16em] text-white/45 truncate">{metric.label}</span>
              <span className="block text-sm font-bold leading-snug tabular-nums text-white sm:text-lg">{metric.value}</span>
            </div>
          ))}
        </div>

        {brand && (
          <a
            href="#sello-constructora-amho"
            className="flex items-center justify-between gap-4 rounded-xl border bg-white/[0.025] px-4 py-3 transition-colors hover:bg-white/[0.05] lg:col-span-4"
            style={{ borderColor: `${color}35` }}
          >
            <img src={encodeURI(brand.logoHorizontalWhite)} alt={brand.companyName} className="h-7 w-auto max-w-[42%] object-contain" />
            <div className="min-w-0 border-l border-white/15 pl-3.5 text-right">
              <span className={`${isGold ? 'gold-metallic-text' : ''} block text-[9px] font-mono font-bold uppercase tracking-wider`} style={{ color }}>Firma del proyecto</span>
              <span className="mt-0.5 block text-xs text-white/65 truncate">{project.alcance}</span>
            </div>
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={openGallery}
        className="mx-auto mt-4 flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.22em] text-white/45 hover:text-white transition-colors cursor-pointer"
      >
        Explorar el proyecto <ArrowDown className="h-4 w-4 animate-bounce" style={{ color }} />
      </button>
    </main>
  );
}

export function ProjectBrandSignature({ project, identity }: Pick<ProjectPresentationHeroProps, 'project' | 'identity'>) {
  const brand = identity.clientBrand;
  const color = identity.theme.primaryColor;
  const isGoldTheme = color.toUpperCase() === '#DFC47B';
  const areaBuiltText = formatAreaMetric(project.area_construida);
  const areaLotText = formatAreaMetric(project.area_lote);
  const configText =
    project.habitaciones && project.banos
      ? `${project.habitaciones} Habitaciones • ${project.banos} Baños`
      : project.habitaciones
      ? `${project.habitaciones} Habitaciones`
      : null;
  const phonesText =
    project.telefonos_contacto && project.telefonos_contacto.length > 0
      ? project.telefonos_contacto.map(p => p.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')).join(' • ')
      : null;

  const specRows: [string, string, boolean?][] = [
    ['Constructora', brand?.companyName || identity.brandName, true],
    ...(areaBuiltText ? ([['Área Construida', areaBuiltText]] as [string, string][]) : []),
    ...(areaLotText
      ? ([['Área de Lote', `${areaLotText} (${identity.lot})`]] as [string, string][])
      : identity.lot
      ? ([['Ubicación / Lote', [project.barrio_o_sector || identity.urbanization, identity.lot].filter(Boolean).join(' • ')]] as [string, string][])
      : []),
    ...(configText
      ? ([['Configuración', configText]] as [string, string][])
      : project.numero_pisos
      ? ([['Distribución', `${project.numero_pisos} niveles`]] as [string, string][])
      : []),
    ['Alcance', `${project.alcance} • ${brand?.companyName || identity.brandName}`, true],
    ...(phonesText ? ([['Contacto Directo', phonesText]] as [string, string][]) : []),
  ];

  return brand ? (
    <section id="sello-constructora-amho" className="relative z-10 scroll-mt-28 border-y bg-[#0A0A0E] px-4 py-10 sm:px-8 sm:py-16" style={{ borderColor: `${color}20` }}>
      <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl border bg-[#0D0D13] p-6 sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-12" style={{ borderColor: `${color}30` }}>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#07070A] p-8 lg:col-span-4">
          <img src={encodeURI(brand.logoVerticalWhite)} alt={brand.companyName} className="h-32 w-auto max-w-full object-contain sm:h-40" />
          <span className={`${isGoldTheme ? 'gold-metallic-text' : ''} mt-4 text-[10px] font-mono font-bold uppercase tracking-[0.22em]`} style={{ color }}>
            Certificación de Autor • {brand.shortName}
          </span>
        </div>
        <div className="lg:col-span-8">
          <p className={`${isGoldTheme ? 'gold-metallic-text' : ''} text-[10px] font-mono font-bold uppercase tracking-[0.2em]`} style={{ color }}>{brand.subtitle}</p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight text-white sm:text-4xl" style={{ fontFamily: identity.theme.fontFamilyTitle }}>
            La firma detrás de <span className={isGoldTheme ? 'gold-metallic-text' : ''} style={{ color }}>{identity.name}</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{brand.tagline}</p>

          {/* Tabla rectificada de especificaciones de la firma */}
          <div className="mt-6 rounded-2xl border bg-[#09090D]/90 p-4 sm:p-6 divide-y divide-white/[0.07]" style={{ borderColor: `${color}28` }}>
            {specRows.map(([label, value, isHighlight]) => (
              <div key={label} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 text-[11px] sm:text-sm font-mono">
                <span className="text-white/45 shrink-0">{label}</span>
                <span className={`text-right ${isHighlight ? `${isGoldTheme ? 'gold-metallic-text' : ''} font-bold` : 'font-bold text-white'}`} style={isHighlight ? { color } : undefined}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  ) : null;
}
