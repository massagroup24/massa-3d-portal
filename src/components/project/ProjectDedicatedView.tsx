import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Maximize2,
  Minimize2,
  Compass,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Building2,
  MessageSquare,
  Box
} from 'lucide-react';
import { getProjectIdentity, ProjectIdentity, HACIENDA_F22_RENDERS, HACIENDA_F22_ROOMS_360, ProjectRender } from '../../config/projectIdentityConfig';
import { F22_LEVELS } from '../../data/haciendaF22Specs';
import { ProjectFichaTecnica } from './ProjectFichaTecnica';
import { ProjectVisualFloorPlans } from './ProjectVisualFloorPlans';
import { ProjectBrandSignature, ProjectPresentationHero } from './ProjectPresentationHero';
import { ProjectShareButton } from './ProjectShareButton';
import { TourContainer } from '../TourContainer';
import { Project, projectsData, resolveCanonicalProjectId } from '../../data/tourData';
import { getProjectsFromSupabase } from '../../supabase';
import { SkiperArchitecturalCarousel } from './SkiperArchitecturalCarousel';
import { SkiperParallaxGallery } from './SkiperParallaxGallery';
import { IbizaAnimatedModel3DViewer } from './IbizaAnimatedModel3DViewer';
import {
  getCanonicalProjectBySlugOrId,
  CanonicalProject
} from '../../data/canonicalProjects';
import { useClaritySectionTracker, trackClarityEvent } from '../../utils/clarityAnalytics';

// Niveles arquitectónicos verificados para Hacienda Club F22
interface LevelInfo {
  id: string;
  name: string;
  area: string;
  role: string;
  spaces: string[];
}

const RESIDENCE_LEVELS_F22: LevelInfo[] = F22_LEVELS;

// Definición de ambientes para el Escenario Protagonista 360°
interface Hotspot360 {
  id: string;
  title: string;
  desc: string;
  x: number;
  y: number;
}

interface Room360Info {
  id: string;
  name: string;
  levelId: string;
  cota: string;
  image: string;
  description: string;
  hotspots: Hotspot360[];
}

const ROOMS_360_F22: Room360Info[] = HACIENDA_F22_ROOMS_360.map(room => ({
  id: room.id,
  name: room.name,
  levelId: room.level.includes('3') ? 'nivel-3' : room.level.includes('2') ? 'nivel-2' : 'nivel-1',
  cota: room.level,
  image: room.previewUrl,
  description: 'Recorrido 360° de Hacienda Club F22.',
  hotspots: room.hotspots.map(hotspot => ({
    id: hotspot.id,
    title: hotspot.label,
    desc: hotspot.detail,
    x: hotspot.x,
    y: hotspot.y
  }))
}));

function ProjectDedicatedContent({ remoteProject, isLoading = false }: { remoteProject: Project; isLoading?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Una ruta desconocida nunca debe heredar la identidad de otro proyecto.
  const canonicalProject: CanonicalProject = useMemo(() => {
    const configured = getCanonicalProjectBySlugOrId(id || '') || getCanonicalProjectBySlugOrId(remoteProject.id);
    if (configured) return configured;
    const projectIdentity = getProjectIdentity(remoteProject.id);
    return {
      id: remoteProject.id,
      slug: projectIdentity.slug,
      nombre: remoteProject.name,
      tipo: remoteProject.category === 'corporativo' ? 'comercial' : 'vivienda',
      estado: remoteProject.status === 'entregado' ? 'Entregado' : remoteProject.status === 'en_obra' ? 'En ejecución' : 'En diseño',
      año: 0,
      ciudad: remoteProject.location || projectIdentity.location,
      departamento: '',
      area_construida: null,
      area_lote: null,
      alcance: 'Diseño y construcción',
      descripcion_corta: remoteProject.description,
      imagen_principal: remoteProject.heroImage || remoteProject.thumbnail,
      hasTour360: remoteProject.hasTour360 === true,
      galeria: (remoteProject.renders || []).map(render => ({ url: render.storage_path, alt: render.title, tipo: 'render' as const })),
    };
  }, [id, remoteProject]);

  const isHaciendaF22 = canonicalProject.id === 'project_hacienda_f22';
  const isIbizaA14 = canonicalProject.id === 'project_ibiza_a14';

  // Resolver identidad visual y tema
  const identity: ProjectIdentity = useMemo(() => getProjectIdentity(canonicalProject.id), [canonicalProject.id]);

  // Rastreo automático de secciones vistas en Microsoft Clarity para analizar uso post-lanzamiento
  useClaritySectionTracker(canonicalProject.slug, [
    'encabezado',
    'galeria',
    'modelo-3d',
    'muro-parallax-renders',
    'planos-2d',
    'ficha-tecnica',
    'distribucion-seccion',
    'sello-constructora-amho',
    'navegacion-contacto'
  ]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${canonicalProject.nombre} | ${identity.clientBrand?.companyName || identity.brandName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const previousDescription = metaDesc?.getAttribute('content');
    if (metaDesc && canonicalProject.descripcion_corta) {
      metaDesc.setAttribute('content', canonicalProject.descripcion_corta);
    }
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const previousIcon = icon?.getAttribute('href');
    if (icon && identity.clientBrand?.logoIcon) icon.href = encodeURI(identity.clientBrand.logoIcon);
    return () => {
      document.title = previousTitle;
      if (metaDesc && previousDescription != null) metaDesc.setAttribute('content', previousDescription);
      if (icon && previousIcon != null) icon.setAttribute('href', previousIcon);
    };
  }, [canonicalProject, identity]);

  const brand = identity.clientBrand;
  const primaryColor = identity.theme.primaryColor || '#DFC47B';
  const primaryHover = identity.theme.primaryHover || '#F1E29B';
  const metallicAccentGradient = brand?.metallicGradient || 'linear-gradient(135deg, #B89752 0%, #DFC47B 32%, #F7E8A8 50%, #D1B16B 74%, #9E7D3B 100%)';

  // Renders del proyecto adaptados para Lightbox y carruseles
  const renders: ProjectRender[] = useMemo(() => {
    if (isHaciendaF22) {
      return identity.renders && identity.renders.length > 0 ? identity.renders : HACIENDA_F22_RENDERS;
    }
    return identity.renders.length ? identity.renders : canonicalProject.galeria.filter(g => g.tipo === 'render').map((g, idx) => ({
      id: `${canonicalProject.id}-render-${idx}`,
      title: g.alt,
      url: g.url,
      category: 'Renders',
      description: g.alt,
      aspectRatio: 1.6
    }));
  }, [identity, isHaciendaF22, canonicalProject]);

  // Agrupación de medios de la galería
  const avanceList = useMemo(() => {
    return canonicalProject.galeria
      .filter(g => g.tipo === 'avance_de_obra')
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  }, [canonicalProject]);

  const terminadaList = useMemo(() => {
    return canonicalProject.galeria.filter(g => g.tipo === 'obra_terminada');
  }, [canonicalProject]);

  // Lightbox Modal
  const [lightboxRender, setLightboxRender] = useState<ProjectRender | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxTouchStartX = useRef<number | null>(null);

  // Niveles arquitectónicos del proyecto (Hacienda Club F22 o niveles configurados en identidad como Ibiza A14)
  const projectLevels: LevelInfo[] = useMemo(() => {
    if (isHaciendaF22) return RESIDENCE_LEVELS_F22;
    if (identity.levels && identity.levels.length > 0) {
      return identity.levels.map(lvl => ({
        id: lvl.id,
        name: lvl.label.split('•')[0].trim(),
        area: lvl.area.split('•')[0].trim(),
        role: lvl.summary || lvl.height,
        spaces: lvl.spaces
      }));
    }
    return [];
  }, [isHaciendaF22, identity]);

  const [activeLevel, setActiveLevel] = useState<string>('nivel-1');

  useEffect(() => {
    if (projectLevels.length > 0 && !projectLevels.some(lvl => lvl.id === activeLevel)) {
      setActiveLevel(projectLevels[0].id);
    }
  }, [projectLevels, activeLevel]);

  // Recorrido 360° en Modal
  const [is360Active, setIs360Active] = useState(false);
  const [activeTourRoomId, setActiveTourRoomId] = useState<string>('');

  // Escenario 360° Integrado (solo para proyectos con recorrido 360)
  const rawProjectData = remoteProject;
  const [active360RoomId, setActive360RoomId] = useState<string>('room_f22_zona_social');
  const [is360AutoRotating, setIs360AutoRotating] = useState(true);
  const [cameraRotationX, setCameraRotationX] = useState(0);
  const [cameraRotationY, setCameraRotationY] = useState(0);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [isDragging360, setIsDragging360] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [hasInteractedWith360, setHasInteractedWith360] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isStageFullscreen, setIsStageFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const rooms360List = useMemo<Room360Info[]>(() => {
    if (!canonicalProject.hasTour360) return [];
    if (rawProjectData?.rooms && Object.keys(rawProjectData.rooms).length > 0) {
      return Object.values(rawProjectData.rooms).map((r) => {
        const levelId = (r.floorLevel === 'Piso 3' || r.floorLevel === 'Nivel 3' || r.floorLevel === 'Rooftop')
          ? 'nivel-3'
          : (r.floorLevel === 'Piso 2' || r.floorLevel === 'Nivel 2')
          ? 'nivel-2'
          : 'nivel-1';

        return {
          id: r.id,
          name: r.name,
          levelId,
          cota: r.floorLevel ? `Nivel ${r.floorLevel}` : 'Cota +0.00 m',
          image: r.imageUrl,
          description: r.description || `Ambiente ${r.name}`,
          hotspots: (r.hotspots || []).map((h, i) => {
            let posX = 50;
            let posY = 50;
            if (h.position && Array.isArray(h.position) && h.position.length === 3) {
              const [px, py, pz] = h.position;
              const lon = Math.atan2(px, -pz);
              posX = Math.round(((lon + Math.PI) / (2 * Math.PI)) * 100);
              const radius = Math.hypot(px, py, pz) || 500;
              const lat = Math.asin(Math.max(-1, Math.min(1, py / radius)));
              posY = Math.round(((Math.PI / 2 - lat) / Math.PI) * 100);
              posX = Math.max(14, Math.min(86, posX));
              posY = Math.max(22, Math.min(78, posY));
            } else if (typeof (h as any).x === 'number' && typeof (h as any).y === 'number') {
              posX = (h as any).x;
              posY = (h as any).y;
            }

            return {
              id: h.id || `h-${i}`,
              title: h.label || 'Navegación 360°',
              desc: `Conectar con ${rawProjectData.rooms[h.targetRoom]?.name || 'ambiente'}`,
              x: posX,
              y: posY
            };
          })
        };
      });
    }
    return isHaciendaF22 ? ROOMS_360_F22 : [];
  }, [rawProjectData, isHaciendaF22, canonicalProject.hasTour360]);

  const current360Room = useMemo(() => {
    return rooms360List.find(r => r.id === active360RoomId) || rooms360List[0];
  }, [rooms360List, active360RoomId]);

  const handleSelectLevel = (levelId: string) => {
    setActiveLevel(levelId);
    const matchedRoom = rooms360List.find(r => r.levelId === levelId);
    if (matchedRoom) setActive360RoomId(matchedRoom.id);
  };

  const handleSelectRoom = (roomId: string) => {
    setActive360RoomId(roomId);
    const room = rooms360List.find(r => r.id === roomId);
    if (room) setActiveLevel(room.levelId);
  };

  // Auto-rotación panorámica suave
  useEffect(() => {
    if (!is360AutoRotating || isDragging360 || is360Active || !canonicalProject.hasTour360) return;
    const interval = setInterval(() => {
      setCameraRotationX(prev => (prev + 0.12) % 360);
    }, 25);
    return () => clearInterval(interval);
  }, [is360AutoRotating, isDragging360, is360Active, canonicalProject.hasTour360]);

  // Manejadores de arrastre 360
  const handleStageMouseDown = (e: React.MouseEvent) => {
    setIsDragging360(true);
    setHasInteractedWith360(true);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
  };

  const handleStageMouseMove = (e: React.MouseEvent) => {
    if (!isDragging360) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    setCameraRotationX(prev => prev - deltaX * 0.3);
    setCameraRotationY(prev => Math.max(-25, Math.min(25, prev + deltaY * 0.2)));
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
  };

  const handleStageMouseUp = () => setIsDragging360(false);

  const handleStageTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging360(true);
      setHasInteractedWith360(true);
      setDragStartX(e.touches[0].clientX);
      setDragStartY(e.touches[0].clientY);
    }
  };

  const handleStageTouchMove = (e: React.TouchEvent) => {
    if (!isDragging360 || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    const deltaY = e.touches[0].clientY - dragStartY;
    setCameraRotationX(prev => prev - deltaX * 0.3);
    setCameraRotationY(prev => Math.max(-25, Math.min(25, prev + deltaY * 0.2)));
    setDragStartX(e.touches[0].clientX);
    setDragStartY(e.touches[0].clientY);
  };

  const toggleStageFullscreen = () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen().catch(() => {
        setIsStageFullscreen(true);
      });
      setIsStageFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsStageFullscreen(false);
    }
  };

  // Lightbox handlers
  const handleOpenLightbox = (render: ProjectRender, index: number) => {
    if (!render.url) return;
    setLightboxRender(render);
    const originalIndex = renders.findIndex(item => item.id === render.id);
    setLightboxIndex(originalIndex >= 0 ? originalIndex : index);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || renders.length === 0) return;
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        setLightboxRender(null);
      }
      if (e.key === 'ArrowRight') {
        const next = (lightboxIndex + 1) % renders.length;
        setLightboxIndex(next);
        setLightboxRender(renders[next]);
      }
      if (e.key === 'ArrowLeft') {
        const prev = (lightboxIndex - 1 + renders.length) % renders.length;
        setLightboxIndex(prev);
        setLightboxRender(renders[prev]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, renders]);

  useEffect(() => {
    if (rawProjectData?.rooms) {
      const rooms = rawProjectData.rooms;
      const firstId = rooms[rawProjectData.initialRoomId] ? rawProjectData.initialRoomId : Object.keys(rooms)[0] || '';
      if (!activeTourRoomId || !rooms[activeTourRoomId]) setActiveTourRoomId(firstId);
    }
  }, [rawProjectData, activeTourRoomId]);

  return (
    <div
      className="min-h-screen w-full bg-[#060608] text-[#F5F2EB] font-sans relative overflow-x-hidden"
      style={{
        ['--proj-primary' as any]: primaryColor,
        ['--proj-hover' as any]: primaryHover,
        ['--proj-glow' as any]: identity.theme.accentGlow || 'rgba(223, 196, 123, 0.35)',
        ['--proj-border' as any]: identity.theme.borderColor || 'rgba(223, 196, 123, 0.28)',
      }}
    >
      {/* Fondo técnico sutil */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-0"
        style={{
          backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* =========================================================================
          BARRA DE NAVEGACIÓN SUPERIOR (RESPONSIVE & SAFE AREA)
          ========================================================================= */}
      <header
        className="sticky top-0 z-40 w-full border-b bg-[#060608]/95 backdrop-blur-2xl transition-all shadow-[0_10px_30px_rgba(0,0,0,0.65)]"
        style={{
          borderColor: `${primaryColor}33`,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-8 lg:flex lg:flex-wrap lg:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {brand?.logoHorizontalWhite ? (
              <img
                src={brand.logoHorizontalWhite.startsWith('data:') ? brand.logoHorizontalWhite : encodeURI(brand.logoHorizontalWhite)}
                alt={brand.companyName}
                className="h-8 sm:h-9 w-auto object-contain shrink-0"
              />
            ) : (
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-white">
                <span className="text-white">{identity.titlePrefix} </span>
                <span className={isHaciendaF22 ? 'gold-metallic-text' : 'massa-metallic-text'}>
                  {identity.titleHighlight}
                </span>
              </span>
            )}
            <div className="hidden h-6 w-px shrink-0 bg-white/10 sm:block" />
            <span className="hidden truncate text-xs font-mono text-white/50 sm:inline">
              {canonicalProject.ciudad}
            </span>
          </div>

          <nav aria-label="Secciones del proyecto" className="no-scrollbar order-3 col-span-2 flex w-full items-center gap-1.5 sm:gap-2 overflow-x-auto whitespace-nowrap text-[10px] font-mono uppercase tracking-wider lg:order-2 lg:ml-auto lg:w-auto lg:gap-3 lg:text-[11px]">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('galeria');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="min-h-[38px] px-3 py-1.5 rounded-lg text-white/75 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              Galería
            </button>
            {isIbizaA14 && (
              <button
                type="button"
                onClick={() => {
                  trackClarityEvent('abrir_modelo_3d_ibiza_a14');
                  document.getElementById('modelo-3d')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="apple-aqua-bubble-studio min-h-[38px] px-3.5 py-1.5 rounded-full font-bold text-[#D9FF66] flex items-center gap-1.5 cursor-pointer"
              >
                <Box className="w-3.5 h-3.5 text-[#9CD01A]" />
                <span>Modelo 3D</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => document.getElementById('planos-2d')?.scrollIntoView({ behavior: 'smooth' })}
              className="min-h-[38px] px-3 py-1.5 rounded-lg text-white/75 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              Planos 2D
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('ficha-tecnica');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="min-h-[38px] px-3 py-1.5 rounded-lg text-white/75 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              Ficha Técnica
            </button>
            {canonicalProject.hasTour360 && (
              <button
                type="button"
                onClick={() => {
                  trackClarityEvent(`abrir_tour_360_${canonicalProject.slug}`);
                  setIs360Active(true);
                }}
                style={{
                  backgroundColor: `${primaryColor}20`,
                  borderColor: `${primaryColor}55`,
                  color: primaryHover
                }}
                className="min-h-[38px] px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Tour 360°</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => document.getElementById('muro-parallax-renders')?.scrollIntoView({ behavior: 'smooth' })}
              className="min-h-[38px] px-3 py-1.5 rounded-lg text-white/75 hover:text-white active:scale-95 transition-all cursor-pointer"
            >
              Muro parallax
            </button>
            {brand && <button
              type="button"
              onClick={() => document.getElementById('sello-constructora-amho')?.scrollIntoView({ behavior: 'smooth' })}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg transition-all font-bold active:scale-95 cursor-pointer ${isHaciendaF22 ? 'gold-metallic-text' : ''}`}
              style={{ color: primaryColor }}
            >La firma</button>}
            {!isHaciendaF22 && canonicalProject.id !== 'project_ibiza_a14' && <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-white/50 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
              title="Volver al catálogo"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catálogo</span>
            </button>}
          </nav>
          <ProjectShareButton
            slug={canonicalProject.slug}
            projectName={canonicalProject.nombre}
            brandName={brand?.companyName || identity.brandName}
            accentColor={primaryColor}
            className="order-2 shrink-0 lg:order-3"
          />
        </div>
      </header>

      <ProjectPresentationHero
        project={canonicalProject}
        identity={identity}
        renderCount={renders.length}
        onOpenTour={() => setIs360Active(true)}
        isLoading={isLoading}
      />

      {/* =========================================================================
          GALERÍA VISUAL Y DETALLES DEL PROYECTO
          Agrupada por tipo (Renders / Avance de obra / Obra terminada)
          Renders siempre identificados con badge visual "Render"
          ========================================================================= */}
      <section id="galeria" className="relative z-10 w-full py-12 sm:py-20 border-t border-white/10 scroll-mt-24">
        <div className="text-center mb-8 px-4">
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-[0.22em] block mb-2 ${isHaciendaF22 ? 'gold-metallic-text' : ''}`}
            style={{ color: primaryHover }}
          >
            Galería visual ({renders.length} renders)
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Renders del <span className={isHaciendaF22 ? 'gold-metallic-text' : ''}>Proyecto</span>
          </h2>
        </div>

        {renders.length > 0 && (
          <>
            {/* Carrusel Arquitectónico Skiper 54 */}
            <div className="mb-8">
              <SkiperArchitecturalCarousel
                renders={renders}
                identity={identity}
                autoplay={true}
                onOpenLightbox={handleOpenLightbox}
              />
            </div>

            {/* Muro Parallax Skiper 30 */}
            <div className="mb-12">
              <SkiperParallaxGallery
                renders={renders}
                identity={identity}
                onSelectRender={(render) => {
                  const foundIdx = renders.findIndex(r => r.id === render.id);
                  handleOpenLightbox(render, foundIdx >= 0 ? foundIdx : 0);
                }}
              />
            </div>

          </>
        )}

        {/* VISOR 3D INTERACTIVO ANIMADO (EXCLUSIVO PARA IBIZA A14) */}
        {isIbizaA14 && (
          <section
            id="modelo-3d"
            className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 border-t border-white/10 scroll-mt-24"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/40 mb-2.5">
                  <Box className="w-3.5 h-3.5 text-[#9CD01A]" />
                  <span className="massa-metallic-text text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.22em] uppercase">
                    GEMELO ARQUITECTÓNICO 3D • VISTA EXPLOSIVA INTERACTIVA
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-none">
                  MODELO 3D <span className="massa-metallic-text">INTERACTIVO</span>
                </h2>
                <p className="text-xs sm:text-sm text-white/65 mt-2 max-w-2xl leading-relaxed">
                  Explora en 360° la volumetría real de <strong>{canonicalProject.nombre}</strong>. Pausa la animación cuando los niveles 2 y cubierta estén elevados o usa la barra de progreso para inspeccionar la distribución interior a voluntad.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-white/60 shrink-0">
                <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
                  Arrastra para orbitar • Rueda para zoom
                </span>
              </div>
            </div>

            <IbizaAnimatedModel3DViewer
              projectName={canonicalProject.nombre}
              accentColor={primaryColor}
              modelUrl="/models/modelo_animado_web_360.glb"
            />
          </section>
        )}

        <ProjectVisualFloorPlans
          projectId={canonicalProject.id}
          projectName={canonicalProject.nombre}
          levels={projectLevels}
          accentColor={primaryColor}
        />

        <section id="ficha-tecnica" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20 scroll-mt-24">
          <ProjectFichaTecnica
            project={canonicalProject}
            technicalSpecs={remoteProject.technicalSpecs || identity.technicalSpecs}
            accentColor={primaryColor}
            projectName={canonicalProject.nombre}
          />
        </section>

        {isHaciendaF22 && canonicalProject.hasTour360 && (
            <div id="distribucion-seccion" className="max-w-7xl mx-auto px-4 sm:px-8 mt-14 pt-10 border-t border-white/10 scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-2.5"
                    style={{
                      backgroundColor: `${primaryColor}1A`,
                      borderColor: `${primaryColor}48`
                    }}
                  >
                    <span className="gold-metallic-text text-[9px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: primaryHover }}>
                      AMHO CONSTRUCCIONES • RECORRIDO 360°
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    GEMELO DIGITAL <span className="gold-metallic-text" style={{ color: primaryColor }}>360°</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-xl">
                    Navegue por los ambientes de Hacienda Club F22. Arrastre para rotar en 360 grados y explore los puntos de interés.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIs360Active(true)}
                  style={{
                    backgroundImage: metallicAccentGradient,
                    boxShadow: `0 10px 30px ${primaryColor}50`,
                    color: '#060608'
                  }}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl shrink-0"
                >
                  <Compass className="w-4 h-4" />
                  <span>Entrar al Recorrido 360° Inmersivo</span>
                </button>
              </div>

              {/* Visor 360° */}
              <div
                ref={stageRef}
                style={{
                  borderColor: `${primaryColor}58`,
                  boxShadow: `0 25px 80px rgba(0,0,0,0.95), 0 0 50px ${primaryColor}24`,
                  ...(isStageFullscreen ? {
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    paddingLeft: 'env(safe-area-inset-left, 0px)',
                    paddingRight: 'env(safe-area-inset-right, 0px)',
                  } : {})
                }}
                className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#070709] border transition-all select-none mb-8 ${
                  isStageFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[460px] sm:h-[600px] lg:h-[680px]'
                }`}
              >
                {current360Room && (
                  <div
                    onMouseDown={handleStageMouseDown}
                    onMouseMove={handleStageMouseMove}
                    onMouseUp={handleStageMouseUp}
                    onMouseLeave={handleStageMouseUp}
                    onTouchStart={handleStageTouchStart}
                    onTouchMove={handleStageTouchMove}
                    onTouchEnd={handleStageMouseUp}
                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden [touch-action:pan-y]"
                  >
                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
                      <img
                        src={encodeURI(current360Room.image)}
                        alt={current360Room.name}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover select-none transition-transform duration-100 ease-out"
                        style={{
                          transform: `scale(${cameraZoom * 1.15}) translate3d(${Math.sin((cameraRotationX * Math.PI) / 180) * 10}%, ${cameraRotationY * 0.35}px, 0)`,
                          transformOrigin: 'center center',
                        }}
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />

                    {/* Hotspots */}
                    {current360Room.hotspots.map((h) => {
                      const panShift = Math.sin((cameraRotationX * Math.PI) / 180) * 10;
                      const offsetX = Math.max(10, Math.min(90, h.x + panShift));
                      const offsetY = Math.max(16, Math.min(82, h.y + (cameraRotationY * 0.2)));
                      const isSelectedHotspot = activeHotspot === h.id;

                      return (
                        <div
                          key={h.id}
                          style={{ left: `${offsetX}%`, top: `${offsetY}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspot(isSelectedHotspot ? null : h.id);
                            }}
                            className="relative p-2 flex items-center justify-center cursor-pointer group"
                          >
                            <span
                              style={{
                                backgroundColor: isSelectedHotspot ? primaryColor : `${primaryColor}40`,
                                borderColor: isSelectedHotspot ? '#FFFFFF' : primaryColor,
                                boxShadow: `0 0 25px ${primaryColor}95`
                              }}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-transform group-hover:scale-125"
                            >
                              <span
                                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse"
                                style={{ backgroundColor: isSelectedHotspot ? '#060608' : primaryHover }}
                              />
                            </span>
                          </button>

                          {isSelectedHotspot && (
                            <div
                              className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 rounded-2xl bg-[#0F0F14]/95 backdrop-blur-2xl border shadow-2xl text-left pointer-events-auto"
                              style={{ borderColor: `${primaryColor}80` }}
                            >
                              <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/10">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: primaryHover }}>
                                  AMHO CONSTRUCCIONES
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveHotspot(null);
                                  }}
                                  className="text-white/60 hover:text-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <h4 className="text-xs font-bold text-white uppercase">{h.title}</h4>
                              <p className="text-[11px] text-white/75 mt-0.5 leading-relaxed">{h.desc}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Cabecera del visor */}
                    <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 z-20 flex items-center justify-between gap-3 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase"
                          style={{ borderColor: `${primaryColor}65`, color: primaryHover }}
                        >
                          360° • {current360Room.cota}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white drop-shadow-md hidden sm:block">
                          {current360Room.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 pointer-events-auto bg-black/75 backdrop-blur-md border border-white/15 p-1 rounded-xl">
                        {brand?.logoIcon && (
                          <img
                            src={brand.logoIcon}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="w-5 h-5 object-contain mr-1 ml-0.5"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setIs360AutoRotating(!is360AutoRotating)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            is360AutoRotating ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                          }`}
                          title={is360AutoRotating ? 'Pausar rotación' : 'Activar rotación'}
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCameraZoom(prev => Math.min(1.4, prev + 0.1))}
                          className="p-1.5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
                          title="Acercar"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCameraZoom(prev => Math.max(0.85, prev - 0.1))}
                          className="p-1.5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
                          title="Alejar"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={toggleStageFullscreen}
                          className="p-1.5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
                          title="Pantalla completa"
                        >
                          {isStageFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Guía central si aún no interactúa */}
                    {!hasInteractedWith360 && !activeHotspot && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className="px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-white"
                          style={{ borderColor: `${primaryColor}80` }}
                        >
                          Arrastra o toca puntos 360°
                        </div>
                      </div>
                    )}

                    {/* Tarjeta flotante de Hotspot en móvil (anclada dentro del visor para no desbordar la pantalla) */}
                    {activeHotspot && (() => {
                      const activeHs = current360Room.hotspots.find(item => item.id === activeHotspot);
                      if (!activeHs) return null;
                      return (
                        <div
                          className="sm:hidden absolute top-15 left-3 right-3 z-30 p-3.5 rounded-2xl bg-[#0F0F14]/95 backdrop-blur-2xl border shadow-2xl text-left pointer-events-auto"
                          style={{ borderColor: `${primaryColor}80` }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/10">
                            <span className="gold-metallic-text text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: primaryHover }}>
                              AMHO CONSTRUCCIONES
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveHotspot(null);
                              }}
                              className="p-1 text-white/70 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="text-xs font-bold text-white uppercase">{activeHs.title}</h4>
                          <p className="text-[11px] text-white/80 mt-0.5 leading-relaxed">{activeHs.desc}</p>
                        </div>
                      );
                    })()}

                    {/* Selector de ambientes */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-auto">
                      <div
                        className="no-scrollbar flex items-center gap-1.5 overflow-x-auto max-w-full p-1 rounded-xl bg-black/80 backdrop-blur-xl border border-white/15"
                      >
                        {rooms360List.map((room) => {
                          const isActive = active360RoomId === room.id;
                          return (
                            <button
                              key={room.id}
                              type="button"
                              onClick={() => handleSelectRoom(room.id)}
                              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                                isActive ? 'text-[#060608]' : 'text-white/65 hover:text-white'
                              }`}
                              style={isActive ? { backgroundImage: metallicAccentGradient } : undefined}
                            >
                              {room.name.split('&')[0].trim()}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIs360Active(true)}
                        style={{
                          backgroundImage: metallicAccentGradient,
                          color: '#060608'
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shrink-0"
                      >
                        <span>Tour Inmersivo Total</span>
                        <Compass className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
        )}

        {/* Distribución por Niveles del Proyecto */}
        {projectLevels.length > 0 && (
          <div id="distribucion-niveles" className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 pt-8 border-t border-white/10 scroll-mt-24">
            <span className={`${isHaciendaF22 ? 'gold-metallic-text' : ''} text-[10px] font-mono font-bold tracking-[0.2em] uppercase block mb-3`} style={{ color: primaryColor }}>
              Distribución por Niveles • {canonicalProject.nombre}
            </span>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {projectLevels.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleSelectLevel(lvl.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
                    activeLevel === lvl.id
                      ? 'text-[#060608]'
                      : 'bg-white/[0.04] text-white/60 hover:text-white border border-white/10'
                  }`}
                  style={activeLevel === lvl.id ? { backgroundImage: metallicAccentGradient } : undefined}
                >
                  {lvl.name}{lvl.area && !lvl.area.includes('Por definir') ? ` (${lvl.area})` : ''}
                </button>
              ))}
            </div>

            {projectLevels.filter(l => l.id === activeLevel).map((lvl) => (
              <div
                key={lvl.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0D0D12] border border-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10 text-xs font-mono">
                  <span className="text-white/50 shrink-0">Función:</span>
                  <span className="font-bold text-white sm:text-right">{lvl.role}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-white/80">
                  {lvl.spaces.map((sp, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-white/30">•</span>
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Avance de Obra: Solo si existen registros */}
        {avanceList.length > 0 && (
          <div id="avance-obra" className="max-w-7xl mx-auto px-4 sm:px-8 mt-14 pt-8 border-t border-white/10">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4">Avance de Obra</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {avanceList.map((item, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-white/15 bg-black/50">
                  <img src={encodeURI(item.url)} alt={item.alt} className="w-full aspect-video object-cover" />
                  <div className="p-3 text-xs font-mono text-white/70">
                    <span>{item.fecha || ''}</span> • <span>{item.alt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Obra Terminada: Solo si existen registros */}
        {terminadaList.length > 0 && (
          <div id="obra-terminada" className="max-w-7xl mx-auto px-4 sm:px-8 mt-14 pt-8 border-t border-white/10">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4">Obra Terminada</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {terminadaList.map((item, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-white/15 bg-black/50">
                  <img src={encodeURI(item.url)} alt={item.alt} className="w-full aspect-video object-cover" />
                  <div className="p-3 text-xs font-mono text-white/70">{item.alt}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {(canonicalProject.descripcion_corta || canonicalProject.descripcion_larga) && (
        <section id="descripcion" className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">Memoria descriptiva</h2>
          </div>
          {canonicalProject.descripcion_corta && (
            <p className="text-base sm:text-xl text-white font-medium leading-relaxed mb-4">
              {canonicalProject.descripcion_corta}
            </p>
          )}
          {canonicalProject.descripcion_larga && (
            <p className="text-sm sm:text-base text-white/70 leading-relaxed font-normal whitespace-pre-line">
              {canonicalProject.descripcion_larga}
            </p>
          )}
        </section>
      )}

      <ProjectBrandSignature project={canonicalProject} identity={identity} />

      {/* =========================================================================
          BLOQUE 6: CRÉDITOS
          ========================================================================= */}
      {canonicalProject.creditos && canonicalProject.creditos.length > 0 && (
        <section id="creditos" className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">Créditos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {canonicalProject.creditos.map((credito, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.03] border flex items-center justify-between"
                style={{ borderColor: `${primaryColor}30` }}
              >
                <div>
                  <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">{credito.rol}</span>
                  <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">{credito.nombre}</span>
                </div>
                <Building2 className="w-5 h-5 text-white/30" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          BLOQUE 7: NAVEGACIÓN Y CONTACTO DIRECTO
          ========================================================================= */}
      <section id="navegacion-contacto" className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16 border-t border-white/10">
        <div className="rounded-3xl border bg-[#0A0A0E]/95 p-6 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6" style={{ borderColor: `${primaryColor}35` }}>
          <div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.22em] block mb-1.5 ${isHaciendaF22 ? 'gold-metallic-text' : 'massa-metallic-text'}`} style={{ color: primaryColor }}>
              Atención Comercial Directa
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
              <span className="text-white">{identity.titlePrefix} </span>
              <span className={isHaciendaF22 ? 'gold-metallic-text' : 'massa-metallic-text'}>
                {identity.titleHighlight}
              </span>
            </h3>
            {isHaciendaF22 ? (
              <p className="text-xs sm:text-sm font-mono text-white/65 mt-1.5">
                Líneas oficiales: <span className="gold-metallic-text font-bold">310 477 1967</span> • <span className="gold-metallic-text font-bold">304 588 2770</span>
              </p>
            ) : (
              <p className="text-xs sm:text-sm font-mono text-white/65 mt-1.5">
                Línea oficial MASSA: <span className="massa-metallic-text font-bold">+57 313 305 1060</span> • <span className="text-white/80 font-bold">massagroup24@gmail.com</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {isHaciendaF22 ? (
              <>
                <a
                  href={`https://wa.me/573104771967?text=${encodeURIComponent(`Hola, deseo recibir información oficial sobre el proyecto ${canonicalProject.nombre}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundImage: metallicAccentGradient,
                    boxShadow: `0 8px 25px ${primaryColor}40`,
                    color: '#060608'
                  }}
                  className="px-5 py-3.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp 310 477 1967</span>
                </a>

                <a
                  href={`https://wa.me/573045882770?text=${encodeURIComponent(`Hola, deseo recibir información oficial sobre el proyecto ${canonicalProject.nombre}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ borderColor: `${primaryColor}55` }}
                  className="px-5 py-3.5 rounded-xl border bg-white/[0.04] hover:bg-white/[0.09] font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="gold-metallic-text">WhatsApp 304 588 2770</span>
                </a>
              </>
            ) : (
              <>
                <a
                  href={`https://wa.me/573133051060?text=${encodeURIComponent(`Hola MASSA Group, deseo recibir información oficial sobre el proyecto ${canonicalProject.nombre}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundImage: metallicAccentGradient,
                    boxShadow: `0 8px 25px ${primaryColor}40`,
                    color: '#060608'
                  }}
                  className="px-5 py-3.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp 313 305 1060</span>
                </a>

                <a
                  href="tel:+573133051060"
                  style={{ borderColor: `${primaryColor}55` }}
                  className="px-5 py-3.5 rounded-xl border bg-white/[0.04] hover:bg-white/[0.09] font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="massa-metallic-text">Llamar 313 305 1060</span>
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PIE DE PÁGINA (SOBRIO Y LIMPIO)
          ========================================================================= */}
      <footer
        className="w-full px-4 sm:px-8 py-8 border-t bg-[#050507]"
        style={{
          borderColor: `${primaryColor}26`,
          paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom, 0px)))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))'
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/45">
          <div className="flex items-center gap-3">
            {brand?.logoHorizontalWhite && (
              <img
                src={brand.logoHorizontalWhite}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="h-6 w-auto object-contain"
              />
            )}
            <span>{canonicalProject.nombre} • {canonicalProject.ciudad}</span>
          </div>
          <span>© {canonicalProject.año || new Date().getFullYear()} {brand?.companyName || identity.brandName}</span>
        </div>
      </footer>

      {/* =========================================================================
          LIGHTBOX MODAL CON BADGE VISUAL "RENDER"
          ========================================================================= */}
      {lightboxRender && renders.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn"
          style={{
            paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) lightboxTouchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (lightboxTouchStartX.current !== null && e.changedTouches.length === 1 && lightboxIndex !== null) {
              const deltaX = e.changedTouches[0].clientX - lightboxTouchStartX.current;
              if (Math.abs(deltaX) > 45) {
                if (deltaX < 0) {
                  const next = (lightboxIndex + 1) % renders.length;
                  setLightboxIndex(next);
                  setLightboxRender(renders[next]);
                } else {
                  const prev = (lightboxIndex - 1 + renders.length) % renders.length;
                  setLightboxIndex(prev);
                  setLightboxRender(renders[prev]);
                }
              }
              lightboxTouchStartX.current = null;
            }
          }}
        >
          {/* Barra superior de Lightbox */}
          <div className="w-full flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-black/80 border border-white/20 text-[9px] font-mono font-bold uppercase text-white/90">
                Render
              </span>
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight truncate">
                {lightboxRender.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/50">
                {lightboxIndex !== null ? lightboxIndex + 1 : 1}/{renders.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setLightboxRender(null);
                  setLightboxIndex(null);
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Imagen en formato original */}
          <div className="relative w-full flex-1 flex items-center justify-center my-2 sm:my-3 overflow-hidden">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (lightboxIndex !== null) {
                  const prev = (lightboxIndex - 1 + renders.length) % renders.length;
                  setLightboxIndex(prev);
                  setLightboxRender(renders[prev]);
                }
              }}
              className="hidden sm:flex absolute left-6 z-20 w-11 h-11 rounded-full bg-black/60 text-white border border-white/20 items-center justify-center transition-all cursor-pointer shadow-2xl hover:scale-110"
              title="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <img
              src={encodeURI(lightboxRender.url)}
              alt={lightboxRender.title}
              className="max-h-[75vh] sm:max-h-[85vh] max-w-full object-contain rounded-xl sm:rounded-2xl shadow-2xl"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (lightboxIndex !== null) {
                  const next = (lightboxIndex + 1) % renders.length;
                  setLightboxIndex(next);
                  setLightboxRender(renders[next]);
                }
              }}
              className="hidden sm:flex absolute right-6 z-20 w-11 h-11 rounded-full bg-black/60 text-white border border-white/20 items-center justify-center transition-all cursor-pointer shadow-2xl hover:scale-110"
              title="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación móvil inferior */}
          <div className="flex sm:hidden items-center justify-center gap-3 w-full z-10">
            <button
              type="button"
              onClick={() => {
                if (lightboxIndex !== null) {
                  const prev = (lightboxIndex - 1 + renders.length) % renders.length;
                  setLightboxIndex(prev);
                  setLightboxRender(renders[prev]);
                }
              }}
              className="flex-1 py-2.5 rounded-xl bg-white/10 text-white border border-white/15 text-[11px] font-mono font-bold uppercase flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (lightboxIndex !== null) {
                  const next = (lightboxIndex + 1) % renders.length;
                  setLightboxIndex(next);
                  setLightboxRender(renders[next]);
                }
              }}
              style={{
                backgroundColor: `${primaryColor}33`,
                borderColor: `${primaryColor}70`,
                color: primaryHover
              }}
              className="flex-1 py-2.5 rounded-xl border text-[11px] font-mono font-bold uppercase flex items-center justify-center gap-1.5"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOUR 360° INMERSIVO EN MODAL (PORTAL)
          Conectado con el branding de AMHO Construcciones para Hacienda Club F22
          ========================================================================= */}
      {is360Active && canonicalProject.hasTour360 && rawProjectData && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Recorrido 360° inmersivo" className="tour-viewport fixed inset-0 z-[100] bg-black overflow-hidden overscroll-none">
          <TourContainer
            currentRoom={
              rawProjectData.rooms
                ? rawProjectData.rooms[activeTourRoomId || active360RoomId] || Object.values(rawProjectData.rooms)[0]
                : undefined
            }
            rooms={rawProjectData.rooms || {}}
            minimapImage={rawProjectData.minimapImage}
            floorPlans={rawProjectData.floorPlans}
            tourEmbedUrl={rawProjectData.tourType === 'matterport_iframe' ? rawProjectData.tourEmbedUrl : undefined}
            onNavigate={(targetId) => {
              setActiveTourRoomId(targetId);
              setActive360RoomId(targetId);
            }}
            onBackToHome={() => setIs360Active(false)}
            projectName={isHaciendaF22 ? 'HACIENDA CLUB F22 • AMHO CONSTRUCCIONES' : canonicalProject.nombre}
            brandLogo={brand?.logoHorizontalWhite || brand?.logoIcon || (isHaciendaF22 ? '/branding/amho-horizontal-white.png' : undefined)}
            brandColor={isHaciendaF22 ? '#DFC47B' : primaryColor}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

export function ProjectDedicatedView() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const previewCanonical = useMemo(() => getCanonicalProjectBySlugOrId(id || ''), [id]);
  const previewIdentity = useMemo(
    () => getProjectIdentity(previewCanonical?.id || id || 'hacienda-f22'),
    [previewCanonical, id]
  );

  useEffect(() => {
    let cancelled = false;
    setProject(null);
    setLoading(true);
    const load = async () => {
      try {
        const rows = await getProjectsFromSupabase();
        if (!cancelled) setProject(rows.find(row => resolveCanonicalProjectId(row.id) === resolveCanonicalProjectId(id || '')) || null);
      } catch {
        if (!cancelled) setProject(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const resume = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', resume);
    void load();
    const timer = window.setInterval(() => { void load(); }, 240000);
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener('visibilitychange', resume); };
  }, [id]);

  // Para los proyectos canónicos (Hacienda Club F22 e Ibiza A14) no combinamos dos pantallas de carga distintas:
  // La animación central -> división a esquinas (estilo Casa Momo) actúa como la única secuencia de carga y apertura desde el primer instante.
  if (previewCanonical?.id === 'project_hacienda_f22' || previewCanonical?.id === 'project_ibiza_a14') {
    const canonicalRemoteProject = project || projectsData[previewCanonical.id];
    return (
      <ProjectDedicatedContent
        key={previewCanonical.id}
        remoteProject={canonicalRemoteProject}
        isLoading={loading}
      />
    );
  }

  if (loading) {
    const color = previewIdentity.theme.primaryColor || '#DFC47B';
    const hoverColor = previewIdentity.theme.primaryHover || '#F1E29B';
    const brand = previewIdentity.clientBrand;
    const gradient = brand?.metallicGradient || `linear-gradient(135deg, ${color}, ${hoverColor})`;

    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Cargando proyecto"
        className="relative min-h-screen w-full overflow-hidden bg-[#060608] text-[#F5F2EB] flex flex-col items-center justify-center px-6 select-none"
      >
        {/* Resplandor radial sutil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color}1A 0%, rgba(6,6,8,0.94) 52%, #060608 100%)`
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Anillo minimalista con isotipo */}
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-dashed animate-spin"
              style={{ borderColor: `${color}65`, animationDuration: '12s' }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-2 rounded-full border"
              style={{ borderColor: `${color}35` }}
            />
            {brand?.logoIcon ? (
              <img
                src={brand.logoIcon}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="relative z-10 h-9 w-9 object-contain"
              />
            ) : (
              <span
                className="relative z-10 text-sm font-mono font-bold tracking-widest uppercase"
                style={{ color: hoverColor }}
              >
                {previewIdentity.code}
              </span>
            )}
          </div>

          {/* Barra de progreso limpia sin duplicar título */}
          <div className="h-[2px] w-44 overflow-hidden rounded-full bg-white/10 relative">
            <div
              className="animate-project-loader-beam h-full w-1/2 rounded-full"
              style={{
                backgroundImage: gradient,
                boxShadow: `0 0 12px ${color}`
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    // Si no está en Supabase todavía, intentar resolverlo desde la colección local canónica
    const fallbackCanonical = getCanonicalProjectBySlugOrId(id || '');
    if (fallbackCanonical) {
      const localProject = projectsData[fallbackCanonical.id];
      const stubProject: Project = localProject || {
        id: fallbackCanonical.id,
        name: fallbackCanonical.nombre,
        description: fallbackCanonical.descripcion_corta,
        initialRoomId: 'room_f22_zona_social',
        rooms: {},
        thumbnail: fallbackCanonical.imagen_principal,
        minimapImage: '',
        published: true
      };
      return <ProjectDedicatedContent key={fallbackCanonical.id} remoteProject={stubProject} />;
    }

    return (
      <div className="min-h-screen bg-black text-white grid place-items-center font-mono text-sm">
        <div className="text-center p-6">
          <h1 className="text-xl font-bold uppercase mb-2">Proyecto no disponible</h1>
          <p className="text-white/60 mb-4">El proyecto no está publicado o no se pudo consultar.</p>
          <a href="/" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return <ProjectDedicatedContent key={project.id} remoteProject={project} />;
}
