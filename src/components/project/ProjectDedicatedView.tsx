import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Compass, 
  ArrowLeft, 
  ArrowDown,
  FileText, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Sparkles,
  RotateCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { getProjectIdentity, ProjectIdentity, HACIENDA_F22_RENDERS, ProjectRender } from '../../config/projectIdentityConfig';
import { TourContainer } from '../TourContainer';
import { projectsData } from '../../data/tourData';
import { SkiperArchitecturalCarousel } from './SkiperArchitecturalCarousel';
import { SkiperParallaxGallery } from './SkiperParallaxGallery';

// Distribución simplificada por Niveles (formato minimalista)
interface LevelInfo {
  id: string;
  name: string;
  area: string;
  role: string;
  spaces: string[];
}

const RESIDENCE_LEVELS: LevelInfo[] = [
  {
    id: 'nivel-1',
    name: 'Planta Nivel 1',
    area: '290 m²',
    role: 'Zona Social & Recreativa Exterior',
    spaces: [
      'Pórtico monumental de acceso con puerta pivotante sobredimensionada y atrio de recibo',
      'Gran salón con doble altura (6.8 m) y chimenea lineal de bioetanol',
      'Comedor formal para 10 puestos integrado al paisaje verde exterior',
      'Cocina de chef con isla en cuarcita Taj Mahal y despensa oculta',
      'Cava vertical climatizada para vinos selectos',
      'Family Lounge acústico y Home Office / Estudio privado',
      'Piscina infinity desbordante (48 m²) con jacuzzi hidromasaje y deck asoleadero',
      'Pabellón quincho gourmet con asador BBQ empotrado y barra exterior',
      'Garaje cubierto para 4 vehículos y cuartos técnicos'
    ]
  },
  {
    id: 'nivel-2',
    name: 'Planta Nivel 2',
    area: '210 m²',
    role: 'Zona Privada de Suites Familiares',
    spaces: [
      'Puente pasarela acristalado sobre el salón central con visuales cenitales',
      'Master Suite Presidencial con terraza privada panorámica',
      'Walk-in Closet Boutique con vitrinas ahumadas e iluminación perimetral LED',
      'Master Bath & Spa con tina exenta monolítica, doble tocador y doble ducha pluvial',
      '3 Suites secundarias completas con baño privado y clóset en roble',
      'Estar íntimo nocturno y estación de servicio'
    ]
  },
  {
    id: 'nivel-3',
    name: 'Nivel 3 • Rooftop',
    area: '60 m²',
    role: 'Sky Lounge & Cubierta Mirador',
    spaces: [
      'Mirador 360° con vistas despejadas a las colinas y atardeceres',
      'Lounge a cielo abierto para veladas privadas y fogata de diseño',
      'Pérgola bioclimática con cubierta vegetal viva',
      'Barra de apoyo exterior para eventos nocturnos'
    ]
  }
];

// Definición de ambientes para el Escenario Protagonista 360°
interface Hotspot360 {
  id: string;
  title: string;
  desc: string;
  x: number; // Porcentaje horizontal 0-100
  y: number; // Porcentaje vertical 0-100
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

const ROOMS_360: Room360Info[] = [
  {
    id: 'salon',
    name: 'Gran Salón & Atrio Monumental',
    levelId: 'nivel-1',
    cota: 'Cota +0.00 m • Nivel 1',
    image: '/HACIENDA F22/SALA.jpg',
    description: 'Espacio central de 6.8 m de doble altura con chimenea lineal, atrio de recibo y pasarela mezzanine.',
    hotspots: [
      { id: 'h1', title: 'Atrio & Puerta Pivotante', desc: 'Acceso monumental sobredimensionado con recibidor de gran formato.', x: 26, y: 50 },
      { id: 'h2', title: 'Chimenea Lineal de Bioetanol', desc: 'Muro central en piedra sinterizada e iluminación perimetral.', x: 50, y: 58 },
      { id: 'h3', title: 'Pasarela Mezzanine', desc: 'Puente acristalado de conexión al Nivel 2 sobre el vacío central.', x: 72, y: 36 },
    ]
  },
  {
    id: 'cocina',
    name: 'Cocina de Chef & Cava Climatizada',
    levelId: 'nivel-1',
    cota: 'Cota +0.00 m • Nivel 1',
    image: '/HACIENDA F22/COCINA.jpg',
    description: 'Isla monolítica en cuarcita Taj Mahal, despensa oculta y cava vertical de vinos selectos.',
    hotspots: [
      { id: 'h4', title: 'Isla Central Taj Mahal', desc: 'Cuarcita exótica de alta resistencia con barra de servicio.', x: 38, y: 56 },
      { id: 'h5', title: 'Cava de Vinos Vertical', desc: 'Control bioclimático digital y carpintería en roble.', x: 68, y: 46 },
    ]
  },
  {
    id: 'piscina',
    name: 'Terraza Piscina Infinity & Quincho',
    levelId: 'nivel-1',
    cota: 'Cota -0.15 m • Exterior',
    image: '/HACIENDA F22/PISCINA.jpg',
    description: 'Piscina infinity desbordante (48 m²) con jacuzzi hidromasaje, deck asoleadero y pabellón BBQ.',
    hotspots: [
      { id: 'h6', title: 'Piscina Infinity Desbordante', desc: '48 m² con borde infinito hacia las colinas y jacuzzi integrado.', x: 44, y: 62 },
      { id: 'h7', title: 'Pabellón Quincho Gourmet', desc: 'Asador BBQ empotrado, barra exterior y pérgola protectora.', x: 78, y: 48 },
    ]
  },
  {
    id: 'master',
    name: 'Master Suite Presidencial & Spa',
    levelId: 'nivel-2',
    cota: 'Cota +3.60 m • Nivel 2',
    image: '/HACIENDA F22/DORMITORIO.jpg',
    description: 'Suite principal con terraza privada panorámica, vestidor boutique y spa con tina exenta.',
    hotspots: [
      { id: 'h8', title: 'Terraza Privada Panorámica', desc: 'Visuales abiertas 180° hacia el paisaje natural circundante.', x: 32, y: 42 },
      { id: 'h9', title: 'Master Bath & Spa Privado', desc: 'Tina monolítica, doble tocador flotante y doble ducha pluvial.', x: 66, y: 54 },
    ]
  },
  {
    id: 'rooftop',
    name: 'Sky Lounge & Cubierta Mirador',
    levelId: 'nivel-3',
    cota: 'Cota +7.20 m • Nivel 3',
    image: '/HACIENDA F22/FACHADA DRON.png',
    description: 'Mirador 360° con vistas despejadas, fire pit a cielo abierto y barra de apoyo para eventos.',
    hotspots: [
      { id: 'h10', title: 'Mirador 360° Panorámico', desc: 'Vistas despejadas hacia los atardeceres y colinas de Cúcuta.', x: 50, y: 38 },
      { id: 'h11', title: 'Fire Pit & Lounge Exterior', desc: 'Zona de fogata a cielo abierto con asientos monolíticos.', x: 74, y: 62 },
    ]
  }
];

export function ProjectDedicatedView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Resolver identidad de proyecto
  const [identity, setIdentity] = useState<ProjectIdentity>(() => getProjectIdentity(id || 'hacienda-f22'));

  // Video Reel Estados (Inicio)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Renders de la residencia con proporciones nativas para el carrusel Skiper
  const renders = useMemo(() => {
    return identity.renders && identity.renders.length > 0 
      ? identity.renders 
      : HACIENDA_F22_RENDERS;
  }, [identity]);

  // Lightbox Modal para ampliar cualquier render en alta definición
  const [lightboxRender, setLightboxRender] = useState<ProjectRender | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Niveles
  const [activeLevel, setActiveLevel] = useState<string>('nivel-1');

  // Modal de Dossier Confidencial
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [dossierSubmitted, setDossierSubmitted] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Recorrido 360° Integrado en Modal
  const [is360Active, setIs360Active] = useState(false);

  // Estados para el Escenario Protagonista 360° Integrado en la Sección
  const [active360RoomId, setActive360RoomId] = useState<string>('salon');
  const [is360AutoRotating, setIs360AutoRotating] = useState(true);
  const [cameraRotationX, setCameraRotationX] = useState(0); // Pan horizontal
  const [cameraRotationY, setCameraRotationY] = useState(0); // Tilt vertical
  const [cameraZoom, setCameraZoom] = useState(1);
  const [isDragging360, setIsDragging360] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [hasInteractedWith360, setHasInteractedWith360] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isStageFullscreen, setIsStageFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Espacio configurable para conectar el proyecto 360 del usuario (Matterport, Kuula, TourContainer o iframe)
  const user360EmbedUrl = identity.tourEmbedUrl || '';

  const current360Room = useMemo(() => {
    return ROOMS_360.find(r => r.id === active360RoomId) || ROOMS_360[0];
  }, [active360RoomId]);

  // Sincronización bidireccional entre Nivel arquitectónico y Ambiente 360
  const handleSelectLevel = (levelId: string) => {
    setActiveLevel(levelId);
    const matchedRoom = ROOMS_360.find(r => r.levelId === levelId);
    if (matchedRoom) {
      setActive360RoomId(matchedRoom.id);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setActive360RoomId(roomId);
    const room = ROOMS_360.find(r => r.id === roomId);
    if (room) {
      setActiveLevel(room.levelId);
    }
  };

  // Auto-rotación panorámica suave cuando no se arrastra manualmente
  useEffect(() => {
    if (!is360AutoRotating || isDragging360) return;
    const interval = setInterval(() => {
      setCameraRotationX(prev => (prev + 0.12) % 360);
    }, 25);
    return () => clearInterval(interval);
  }, [is360AutoRotating, isDragging360]);

  // Manejadores táctiles y de ratón para el arrastre 360
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

  const handleStageMouseUp = () => {
    setIsDragging360(false);
  };

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

  // Título de la pestaña sin rastro de MASSA
  useEffect(() => {
    const currentIdentity = getProjectIdentity(id || 'hacienda-f22');
    setIdentity(currentIdentity);
    document.title = `${currentIdentity.name} | ${currentIdentity.urbanization} • Proyecto Arquitectónico`;

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [id]);

  // Manejador de teclado para Lightbox (Escape, Flechas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
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

  const handleOpenLightbox = (render: ProjectRender, index: number) => {
    setLightboxRender(render);
    setLightboxIndex(index);
  };

  // Manejo de video
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('project-hero-video-stage');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const scrollToGallery = () => {
    const el = document.getElementById('galeria-renders-skiper');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Contacto VIP por WhatsApp
  const handleRequestDossier = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const phone = '573105741870';
    const msg = encodeURIComponent(
      `Hola, tengo un alto interés en la residencia ${identity.name} (${identity.lot} en ${identity.urbanization}). Mi nombre es ${clientName || 'Cliente VIP'}${clientPhone ? ` (Tel: ${clientPhone})` : ''}. Deseo recibir el dossier confidencial y coordinar una presentación privada.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    setDossierSubmitted(true);
    setTimeout(() => {
      setIsDossierModalOpen(false);
      setDossierSubmitted(false);
    }, 2500);
  };

  const rawProjectData = identity.id && projectsData[identity.id] ? projectsData[identity.id] : null;

  return (
    <div 
      className="min-h-screen w-full bg-[#08080A] text-[#F5F2EB] selection:bg-[#D4A359] selection:text-black font-sans relative overflow-x-hidden"
      style={{
        ['--proj-primary' as any]: identity.theme.primaryColor || '#D4A359',
        ['--proj-glow' as any]: identity.theme.accentGlow || 'rgba(212, 163, 89, 0.35)',
        ['--proj-border' as any]: identity.theme.borderColor || 'rgba(212, 163, 89, 0.22)',
      }}
    >
      {/* Fondo técnico sutil con cuadrícula arquitectónica pura */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-0"
        style={{
          backgroundImage: `linear-gradient(#D4A359 1px, transparent 1px), linear-gradient(90deg, #D4A359 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Resplandor ambiental oro cálido */}
      <div 
        className="fixed -top-32 left-1/3 w-[650px] h-[650px] rounded-full blur-[180px] pointer-events-none opacity-15 z-0"
        style={{ backgroundColor: '#D4A359' }}
      />

      {/* =========================================================================
          1. HEADER INDEPENDIENTE (CERO LOGOS CORPORATIVOS O MENCIÓN DE MASSA)
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full px-5 sm:px-8 lg:px-12 py-4 flex items-center justify-between border-b border-[#D4A359]/15 bg-[#08080A]/90 backdrop-blur-2xl transition-all">
        {/* Monograma F22 y Nombre con la misma tipografía del título grande */}
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs tracking-tight shadow-lg border border-[#D4A359]/40 shrink-0 select-none"
            style={{ 
              fontFamily: identity.theme.fontFamilyTitle,
              backgroundColor: '#D4A359', 
              color: '#08080A',
              boxShadow: '0 0 20px rgba(212, 163, 89, 0.35)'
            }}
          >
            F22
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span 
                style={{ fontFamily: identity.theme.fontFamilyTitle }}
                className="text-sm sm:text-base lg:text-lg font-black tracking-tight uppercase leading-none select-none"
              >
                {identity.name.includes(' ') ? (
                  <>
                    <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      {identity.name.substring(0, identity.name.lastIndexOf(' '))}
                    </span>{' '}
                    <span className="text-[#D4A359] drop-shadow-[0_0_15px_rgba(212,163,89,0.45)]">
                      {identity.name.substring(identity.name.lastIndexOf(' ') + 1)}
                    </span>
                  </>
                ) : (
                  <span className="text-white">{identity.name}</span>
                )}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#D4A359]/15 text-[#D4A359] border border-[#D4A359]/30">
                OBRA PRIVADA
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-wider text-white/40 block mt-0.5">
              {identity.urbanization} • {identity.lot}
            </span>
          </div>
        </div>

        {/* Acceso Rápido a Secciones */}
        <nav className="hidden md:flex items-center gap-6 text-[11px] font-mono tracking-widest uppercase text-white/60">
          <button 
            onClick={scrollToGallery}
            className="hover:text-[#D4A359] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Renders</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#D4A359]/20 text-[#D4A359] text-[9px] font-bold">
              {renders.length}
            </span>
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('muro-parallax-renders');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#D4A359] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Muro Parallax</span>
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('distribucion-seccion');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#D4A359] transition-colors cursor-pointer"
          >
            Distribución
          </button>
          <button 
            onClick={() => setIs360Active(true)}
            className="hover:text-[#D4A359] transition-colors cursor-pointer flex items-center gap-1 text-[#D4A359]"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tour 360°</span>
          </button>
        </nav>

        {/* Acciones VIP y Regreso */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDossierModalOpen(true)}
            className="px-4 py-2 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer border border-[#D4A359]/40 hover:scale-105 active:scale-95 shadow-md"
            style={{ 
              backgroundColor: '#D4A359',
              color: '#08080A',
              boxShadow: '0 4px 15px rgba(212, 163, 89, 0.25)'
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dossier Confidencial</span>
            <span className="sm:hidden">Dossier</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="p-2 sm:px-3 sm:py-2 rounded-full text-[11px] font-mono tracking-wider uppercase text-white/50 hover:text-white border border-white/10 hover:border-white/25 transition-all cursor-pointer flex items-center gap-1.5"
            title="Volver al catálogo"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Catálogo</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. EL INICIO: VIDEO HORIZONTAL CINEMATOGRÁFICO (PRIMERA PANTALLA)
             Título monumental al costado + Video horizontal 16:9
          ========================================================================= */}
      <main className="relative z-10 w-full min-h-[calc(100vh-76px)] flex flex-col justify-between px-5 sm:px-8 lg:px-12 py-6 lg:py-8">
        
        <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
          
          {/* COLUMNA LATERAL: TÍTULO MONUMENTAL & FICHA RÁPIDA */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 pr-0 lg:pr-4">
            
            {/* Ubicación y Lote */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4A359] shadow-[0_0_12px_#D4A359]" />
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.22em] uppercase text-[#D4A359]">
                {identity.urbanization} • {identity.lot}
              </span>
            </div>

            {/* Título Monumental de la Casa */}
            <h1 
              style={{ fontFamily: identity.theme.fontFamilyTitle }}
              className="font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tighter leading-[0.90] uppercase text-white drop-shadow-[0_15px_40px_rgba(0,0,0,0.9)] select-none mb-4"
            >
              HACIENDA
              <span className="block text-[#D4A359] drop-shadow-[0_0_35px_rgba(212,163,89,0.35)]">
                F22
              </span>
            </h1>

            {/* Breve Memoria Conceptual */}
            <p className="text-sm sm:text-base text-white/70 leading-relaxed font-normal mb-6 max-w-xl">
              Escultura habitable concebida en diálogo entre volúmenes en voladizo, travertino romano, 
              cuarcita exótica Taj Mahal y un oasis exterior con piscina desbordante y spa.
            </p>

            {/* Métricas Clave */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-2xl bg-[#121217]/90 border border-[#D4A359]/20 backdrop-blur-xl mb-6 shadow-2xl">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block">CONSTRUIDO</span>
                <span className="text-base sm:text-lg font-black text-white">{identity.specs.areaBuilt}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block">LOTE F22</span>
                <span className="text-base sm:text-lg font-black text-white">1.200 m²</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block">SUITES</span>
                <span className="text-base sm:text-lg font-black text-white">4 Master</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block">WELLNESS</span>
                <span className="text-base sm:text-lg font-black text-[#D4A359]">Piscina + Spa</span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={scrollToGallery}
                className="px-6 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-2xl hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: '#D4A359',
                  color: '#08080A',
                  boxShadow: '0 10px 35px rgba(212, 163, 89, 0.4)'
                }}
              >
                <Eye className="w-4 h-4 font-black" />
                <span>Ver Renders del Proyecto ({renders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIs360Active(true)}
                className="px-5 py-4 rounded-full bg-white/[0.05] hover:bg-[#D4A359]/10 border border-[#D4A359]/30 text-white hover:text-[#D4A359] font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Compass className="w-4 h-4" />
                <span>Tour 360°</span>
              </button>
            </div>

          </div>

          {/* COLUMNA PRINCIPAL: VIDEO HORIZONTAL CINEMATOGRÁFICO 16:9 */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
            <div 
              id="project-hero-video-stage"
              className="relative w-full aspect-video rounded-2xl sm:rounded-3xl lg:rounded-[32px] overflow-hidden border border-[#D4A359]/30 shadow-[0_25px_80px_rgba(0,0,0,0.85)] bg-[#0C0D12] group"
              style={{
                boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 50px rgba(212, 163, 89, 0.20)'
              }}
            >
              {/* Video Horizontal 16:9 */}
              <video
                ref={videoRef}
                poster="/HACIENDA F22/FACHADA.png"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.04] transition-transform duration-700 group-hover:scale-[1.01]"
              >
                <source src="/VIDEO H4.mp4" type="video/mp4" />
                <source src="/VIDEO%20H4.mp4" type="video/mp4" />
              </video>

              {/* Viñeta cinematográfica */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

              {/* Badge superior de calidad */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#D4A359]/40 text-[10px] font-mono font-bold tracking-widest uppercase text-[#D4A359]">
                  4K UHD • REEL CINEMATOGRÁFICO
                </span>
              </div>

              {/* Controles del Reproductor */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-black/80 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                    title={isPlaying ? 'Pausar video' : 'Reproducir video'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-black/80 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                    title={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-white/50" /> : <Volume2 className="w-4 h-4 text-[#D4A359]" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-10 h-10 rounded-full bg-black/80 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                  title="Pantalla completa"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Barra de progreso de video dorada */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div 
                  className="h-full bg-[#D4A359] transition-all duration-150"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>

            </div>

            {/* Pie técnico */}
            <div className="flex items-center justify-between mt-3 px-2 text-[10px] sm:text-[11px] font-mono text-white/40">
              <span className="tracking-wider">VISUALIZACIÓN HORIZONTAL 16:9</span>
              <span className="text-[#D4A359]/80 font-bold">RESIDENCIA HACIENDA F22</span>
            </div>

          </div>

        </div>

        {/* Indicador de Desplazamiento hacia la Galería de Renders */}
        <div className="w-full flex justify-center pt-6 pb-2">
          <button
            type="button"
            onClick={scrollToGallery}
            className="flex flex-col items-center gap-2 text-white/40 hover:text-[#D4A359] transition-colors cursor-pointer group"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.25em]">
              Ver Renders de Todo el Proyecto ({renders.length})
            </span>
            <ArrowDown className="w-4 h-4 animate-bounce text-[#D4A359] group-hover:scale-110" />
          </button>
        </div>

      </main>

      {/* =========================================================================
          3. MÁS ABAJO: GALERÍA DE RENDERS DE TODO EL PROYECTO (SKIPER 54)
             Implementación exacta del recurso: clipPath dinámico, proporciones
             nativas de imagen sin recortes y subtítulo minimalista con blur
          ========================================================================= */}
      <section 
        id="galeria-renders-skiper" 
        className="relative z-10 w-full py-20 sm:py-28 border-t border-[#D4A359]/15 bg-[#09090D]"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-8 text-center">
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#D4A359] block mb-2">
            • ARCHIVO FOTORREALISTA COMPLETO ({renders.length} RENDERS)
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            Galería de Renders del Proyecto
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-lg mx-auto mt-2 font-normal leading-relaxed">
            Visualización interactiva en proporciones originales. Deslice lateralmente o filtre por estancias.
          </p>
        </div>

        {/* Carrusel Dinámico Skiper 54 con desplazamiento automático e imágenes completas */}
        <SkiperArchitecturalCarousel
          renders={renders}
          autoplay={true}
          onOpenLightbox={handleOpenLightbox}
        />
      </section>

      {/* =========================================================================
          3.5. MURO PARALLAX ARQUITECTÓNICO (SKIPER 30)
               Cascada continua de 4 columnas en paralelo con efecto parallax 
               diferencial dinámico impulsado por Lenis y Framer Motion
          ========================================================================= */}
      <SkiperParallaxGallery renders={renders} />

      {/* =========================================================================
          4. PROYECTO 360° PROTAGONISTA & PROGRAMA ARQUITECTÓNICO
             Escenario central interactivo inmersivo 360 con visor panorámico,
             controles espaciales, hotspots y espacio listo para el proyecto 360
          ========================================================================= */}
      <section 
        id="distribucion-seccion" 
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-24 border-t border-white/[0.08]"
      >
        {/* Cabecera Monumental de la Sección 360° */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A359]/10 border border-[#D4A359]/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#D4A359] animate-ping" />
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#D4A359] uppercase">
                EXPERIENCIA VIRTUAL INMERSIVA
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
              GEMELO DIGITAL <span className="text-[#D4A359]">360°</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-3 leading-relaxed max-w-2xl">
              Navegue e interactúe libremente por los ambientes de la residencia. Arrastre en cualquier dirección para rotar en 360 grados, explore los puntos de interés arquitectónicos y cambie de nivel en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDossierModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/20 text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Dossier en PDF</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            ESCENARIO PROTAGONISTA 360° (CANVAS & VISOR INMERSIVO)
            ===================================================================== */}
        <div 
          ref={stageRef}
          className={`relative w-full rounded-3xl overflow-hidden bg-[#070709] border border-[#D4A359]/35 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(212,163,89,0.12)] transition-all select-none mb-12 ${
            isStageFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[500px] sm:h-[600px] lg:h-[680px]'
          }`}
        >
          {/* Si el usuario conecta un tour 360 embebido (Matterport, Kuula, TourContainer) */}
          {user360EmbedUrl ? (
            <iframe
              src={user360EmbedUrl}
              title="Recorrido 360°"
              className="w-full h-full border-0 absolute inset-0 z-10"
              allow="fullscreen; accelerometer; gyroscope; magnetometer; vr"
            />
          ) : (
            /* Escenario Panorámico Interactivo Simulado de Alta Precisión */
            <div
              onMouseDown={handleStageMouseDown}
              onMouseMove={handleStageMouseMove}
              onMouseUp={handleStageMouseUp}
              onMouseLeave={handleStageMouseUp}
              onTouchStart={handleStageTouchStart}
              onTouchMove={handleStageTouchMove}
              onTouchEnd={handleStageMouseUp}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
            >
              {/* Capa de imagen panorámica ultra-HD con zoom y rotación cinemática */}
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
                <img
                  src={encodeURI(current360Room.image)}
                  alt={current360Room.name}
                  className="w-full h-full object-cover select-none transition-transform duration-100 ease-out"
                  style={{
                    transform: `scale(${cameraZoom * 1.15}) translate3d(${Math.sin((cameraRotationX * Math.PI) / 180) * 10}%, ${cameraRotationY * 0.35}px, 0)`,
                    transformOrigin: 'center center',
                    filter: 'brightness(0.92) contrast(1.06)',
                  }}
                />
              </div>

              {/* Viñeteado perimetral oscuro de lente fotográfico */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />
              <div className="absolute inset-0 ring-1 ring-inset ring-[#D4A359]/30 rounded-3xl pointer-events-none" />

              {/* HOTSPOTS ESPACIALES INTERACTIVOS EN 3D */}
              {current360Room.hotspots.map((h) => {
                // Cálculo sincronizado con el desplazamiento panorámico
                const panShift = Math.sin((cameraRotationX * Math.PI) / 180) * 10;
                const offsetX = Math.max(8, Math.min(92, h.x + panShift));
                const offsetY = Math.max(12, Math.min(88, h.y + (cameraRotationY * 0.2)));

                return (
                  <div
                    key={h.id}
                    style={{ left: `${offsetX}%`, top: `${offsetY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto transition-all duration-75"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHotspot(activeHotspot === h.id ? null : h.id);
                      }}
                      className="relative p-2.5 flex items-center justify-center cursor-pointer group"
                    >
                      <span className="w-9 h-9 rounded-full bg-[#D4A359]/25 border border-[#D4A359] flex items-center justify-center shadow-[0_0_25px_rgba(212,163,89,0.6)] transition-transform group-hover:scale-125">
                        <span className="w-3 h-3 rounded-full bg-[#D4A359] animate-pulse" />
                      </span>
                    </button>

                    {/* Popover explicativo al hacer clic o hover */}
                    {activeHotspot === h.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 rounded-2xl bg-[#0F0F14]/95 backdrop-blur-2xl border border-[#D4A359]/50 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-left pointer-events-auto animate-fadeIn">
                        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#D4A359] flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            DETALLE ARQUITECTÓNICO
                          </span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspot(null);
                            }}
                            className="text-white/40 hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-tight">{h.title}</h4>
                        <p className="text-[11px] text-white/70 mt-1 leading-relaxed">{h.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===================================================================
              HUD OVERLAY: CONTROLES, ESTADO Y AMBIENTES EN TIEMPO REAL
              =================================================================== */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 lg:p-8 z-30">
            
            {/* BARRA SUPERIOR DEL HUD: ESTADO + BOTONES DE CONTROL */}
            <div className="w-full flex items-start justify-between gap-3">
              
              {/* Información del Ambiente Activo */}
              <div className="flex flex-col gap-1 pointer-events-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#D4A359]/40 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[#D4A359] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4A359] uppercase">
                    360° ACTIVO • {current360Room.cota}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  {current360Room.name}
                </h3>
              </div>

              {/* Controles del Visor 360 */}
              <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                
                {/* Botón Auto-Rotación */}
                <button
                  type="button"
                  onClick={() => setIs360AutoRotating(!is360AutoRotating)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    is360AutoRotating 
                      ? 'bg-[#D4A359] text-[#08080A] shadow-[0_0_15px_rgba(212,163,89,0.4)]' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title={is360AutoRotating ? "Pausar rotación automática" : "Activar rotación automática"}
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Controles de Zoom */}
                <button
                  type="button"
                  onClick={() => setCameraZoom(prev => Math.min(1.4, prev + 0.1))}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Acercar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCameraZoom(prev => Math.max(0.85, prev - 0.1))}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Alejar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                {/* Pantalla Completa */}
                <button
                  type="button"
                  onClick={toggleStageFullscreen}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Pantalla Completa"
                >
                  {isStageFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

              </div>

            </div>

            {/* GUÍA DE INTERACCIÓN CENTRAL (Se desvanece tras la primera interacción) */}
            {!hasInteractedWith360 && (
              <div className="self-center flex flex-col items-center text-center animate-bounce pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-[#D4A359]/60 backdrop-blur-md flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(212,163,89,0.3)]">
                  <Compass className="w-6 h-6 text-[#D4A359]" />
                </div>
                <span className="text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-white/90 bg-black/70 px-4 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
                  ARRASTRA PARA EXPLORAR 360°
                </span>
              </div>
            )}

            {/* BARRA INFERIOR DEL VISOR: SELECTOR DE AMBIENTES 360° */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
              
              {/* Selector horizontal de espacios */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full p-1.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/15 shadow-2xl">
                {ROOMS_360.map((room) => {
                  const isActive = active360RoomId === room.id;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleSelectRoom(room.id)}
                      className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#D4A359] text-[#08080A] shadow-[0_0_20px_rgba(212,163,89,0.5)]'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{room.name.split('&')[0].trim()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Botón de apertura a pantalla completa inmersiva */}
              <button
                type="button"
                onClick={() => setIs360Active(true)}
                className="group px-4 py-2.5 rounded-2xl bg-[#D4A359]/20 hover:bg-[#D4A359] text-[#D4A359] hover:text-[#08080A] border border-[#D4A359]/50 font-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
              >
                <span>Tour Inmersivo Total</span>
                <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================================
            PROGRAMA ARQUITECTÓNICO & DISTRIBUCIÓN POR NIVELES
            Coordinado con el visor 360°
            ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Distribución por Niveles (8 columnas) */}
          <div className="lg:col-span-8">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-[#D4A359] block mb-3">
              • PROGRAMA ARQUITECTÓNICO POR NIVELES
            </span>

            {/* Pestañas de Nivel */}
            <div className="flex items-center gap-2.5 mb-6 overflow-x-auto pb-2">
              {RESIDENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => handleSelectLevel(lvl.id)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-mono uppercase font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
                    activeLevel === lvl.id
                      ? 'bg-[#D4A359] text-[#08080A] shadow-[0_0_20px_rgba(212,163,89,0.35)]'
                      : 'bg-white/[0.04] text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {lvl.name} ({lvl.area})
                </button>
              ))}
            </div>

            {/* Contenido detallado del nivel seleccionado */}
            {RESIDENCE_LEVELS.filter(l => l.id === activeLevel).map((lvl) => (
              <div key={lvl.id} className="p-6 sm:p-8 rounded-3xl bg-[#0D0D12] border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10 text-xs font-mono">
                  <span className="text-white/40 uppercase">Función Principal:</span>
                  <span className="text-[#D4A359] font-bold">{lvl.role}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {lvl.spaces.map((sp, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A359] shrink-0 mt-0.5" />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Dossier Técnico & Resumen Ejecutivo (4 columnas) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Tarjeta de Dossier */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#121218] to-[#0A0A0E] border border-[#D4A359]/35 shadow-2xl">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4A359] font-bold block mb-1">
                DOCUMENTACIÓN EXCLUSIVA
              </span>
              <h3 className="text-lg font-bold uppercase text-white mb-2">
                Dossier Técnico en PDF
              </h3>
              <p className="text-xs text-white/60 mb-5 leading-relaxed">
                Planos acotados, memorias estructurales, especificaciones de acabados y costos de inversión de la residencia.
              </p>
              <button
                type="button"
                onClick={() => setIsDossierModalOpen(true)}
                className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]"
                style={{
                  backgroundColor: '#D4A359',
                  color: '#08080A',
                }}
              >
                <FileText className="w-4 h-4" />
                <span>Solicitar Dossier VIP</span>
              </button>
            </div>

            {/* Cuadro de Métricas Rápidas */}
            <div className="p-6 rounded-3xl bg-[#0D0D12] border border-white/10 text-xs font-mono space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-white/40">Área Construida</span>
                <span className="text-white font-bold">{identity.specs.areaBuilt}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-white/40">Área de Lote</span>
                <span className="text-white font-bold">{identity.specs.lotArea}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-white/40">Configuración</span>
                <span className="text-white font-bold">{identity.specs.bedrooms} Suites • {identity.specs.bathrooms} Baños</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Modalidad</span>
                <span className="text-[#D4A359] font-bold">{identity.specs.modality}</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================================================
          5. FOOTER MINIMALISTA (100% INDEPENDIENTE)
          ========================================================================= */}
      <footer className="relative z-10 w-full px-5 sm:px-8 lg:px-12 py-8 border-t border-[#D4A359]/15 bg-[#060608] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div 
            style={{ fontFamily: identity.theme.fontFamilyTitle }}
            className="w-6 h-6 rounded-md bg-[#D4A359] text-[#08080A] font-black flex items-center justify-center text-[10px]"
          >
            F22
          </div>
          <span 
            style={{ fontFamily: identity.theme.fontFamilyTitle }}
            className="text-xs font-black uppercase tracking-tight"
          >
            <span className="text-white">HACIENDA</span>{' '}
            <span className="text-[#D4A359]">F22</span>
            <span className="text-white/40 text-[10px] font-mono font-normal ml-2">• {identity.urbanization} • {identity.lot}</span>
          </span>
        </div>

        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          DOCUMENTO ARQUITECTÓNICO CONFIDENCIAL • CLIENTES VIP
        </span>
      </footer>

      {/* =========================================================================
          6. LIGHTBOX MODAL EN ALTA DEFINICIÓN (Sin recorte de imagen)
          ========================================================================= */}
      {lightboxRender && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Barra Superior */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#D4A359] text-[#08080A] text-[10px] font-mono font-bold uppercase">
                {lightboxRender.category}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight">
                {lightboxRender.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/40">
                {lightboxIndex !== null ? lightboxIndex + 1 : 1} de {renders.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setLightboxRender(null);
                  setLightboxIndex(null);
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Área Central: Imagen en proporción original nativa */}
          <div className="relative w-full flex-1 flex items-center justify-center my-3 overflow-hidden">
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
              className="absolute left-2 sm:left-6 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#D4A359] text-white hover:text-black border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-2xl"
              title="Anterior (Flecha izquierda)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <img
              src={encodeURI(lightboxRender.url)}
              alt={lightboxRender.title}
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
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
              className="absolute right-2 sm:right-6 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#D4A359] text-white hover:text-black border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-2xl"
              title="Siguiente (Flecha derecha)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Barra Inferior */}
          <div className="w-full text-center z-10 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            {lightboxRender.width && lightboxRender.height ? `${lightboxRender.width} × ${lightboxRender.height} px • ` : ''}
            RESOLUCIÓN NATIVA 4K • PROPORCIÓN ORIGINAL
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL DE DOSSIER CONFIDENCIAL & WHATSAPP
          ========================================================================= */}
      {isDossierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#121217] border border-[#D4A359]/40 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => setIsDossierModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="px-3 py-0.5 rounded-full bg-[#D4A359]/20 text-[#D4A359] border border-[#D4A359]/40 text-[10px] font-mono font-bold uppercase mb-2 inline-block">
              ATENCIÓN PRIVADA VIP
            </span>

            <h3 className="text-xl font-black uppercase tracking-tight mb-1">
              Dossier Confidencial
            </h3>
            <p className="text-xs text-white/60 mb-5 leading-relaxed">
              Reciba las memorias técnicas, planos y disponibilidad de la <strong className="text-white">Residencia HACIENDA F22</strong>.
            </p>

            {dossierSubmitted ? (
              <div className="p-6 rounded-2xl bg-[#D4A359]/15 border border-[#D4A359]/40 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#D4A359] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Solicitud Registrada</h4>
                <p className="text-xs text-white/70">Redirigiendo a WhatsApp...</p>
              </div>
            ) : (
              <form onSubmit={handleRequestDossier} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#D4A359]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    WhatsApp Móvil
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#D4A359]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#D4A359]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#D4A359',
                    color: '#08080A',
                  }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Solicitar Dossier Vía WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          8. RECORRIDO 360° INTEGRADO
          ========================================================================= */}
      {is360Active && rawProjectData && (
        <div className="fixed inset-0 z-50 bg-black">
          <TourContainer
            currentRoom={rawProjectData.rooms ? Object.values(rawProjectData.rooms)[0] : undefined}
            rooms={rawProjectData.rooms || {}}
            minimapImage={rawProjectData.minimapImage}
            onNavigate={() => {}}
            onBackToHome={() => setIs360Active(false)}
            projectName={identity.name}
          />
        </div>
      )}

    </div>
  );
}
