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
import { projectsData, Project } from '../../data/tourData';
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

const RESIDENCE_LEVELS_F22: LevelInfo[] = [
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

const RESIDENCE_LEVELS_A14: LevelInfo[] = [
  {
    id: 'nivel-1',
    name: 'Planta Nivel 1',
    area: 'Nivel Social',
    role: 'Zona Social Bioclimática & Oasis Exterior',
    spaces: [
      'Pórtico de ingreso monumental con aleros de control solar y espejo de agua',
      'Gran salón social con ventilación cruzada y apertura total hacia la terraza',
      'Comedor principal integrado con visuales al jardín interior y piscina',
      'Cocina de autor con isla central, alacena independiente y barra social',
      'Estudio / Suite de huéspedes en primer nivel con baño completo',
      'Piscina con playa húmeda, solárium y zona lounge exterior en Condominio Ibiza',
      'Terraza cubierta con estación BBQ gourmet y comedor de verano',
      'Parqueadero cubierto para vehículos, cuarto técnico y zona de servicios'
    ]
  },
  {
    id: 'nivel-2',
    name: 'Planta Nivel 2',
    area: 'Nivel Privado',
    role: 'Zona Íntima de Suites & Family Lounge',
    spaces: [
      'Circulación superior con iluminación natural cenital y brise-soleil',
      'Master Suite A14 con balcón privado hacia el paisaje del Condominio Ibiza',
      'Walk-in Closet de gran capacidad con diseño modular e iluminación indirecta',
      'Baño principal tipo Spa con doble lavamanos flotante y ducha pluvial',
      'Suites secundarias con baño privado, vestier y protección solar pasiva',
      'Sala de TV / Family Room íntimo en segundo nivel'
    ]
  },
  {
    id: 'nivel-3',
    name: 'Nivel 3 • Cubierta',
    area: 'Terrazas & Aleros',
    role: 'Ingeniería Bioclimática & Confort Térmico',
    spaces: [
      'Grandes voladizos perimetrales calculados para la incidencia solar de Cúcuta',
      'Cubierta termoacústica de alto desempeño para reducción térmica interior',
      'Preinstalación técnica para paneles solares fotovoltaicos y equipos VRF'
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

const ROOMS_360_F22: Room360Info[] = [
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

const ROOMS_360_A14: Room360Info[] = [
  {
    id: 'a14-fachada',
    name: 'Acceso Principal & Fachada A14',
    levelId: 'nivel-1',
    cota: 'Cota +0.00 m • Exterior',
    image: '/IBIZA A14/01-F004.jpg',
    description: 'Fachada principal con aleros bioclimáticos de control solar y materiales nobles en Condominio Ibiza.',
    hotspots: [
      { id: 'a14-h0', title: 'Aleros de Protección Solar', desc: 'Voladizos estudiados para mitigar la radiación directa en Cúcuta.', x: 42, y: 38 },
      { id: 'a14-h1', title: 'Ingresar a Sala Social', desc: 'Conectar con el Gran Salón Principal →', x: 60, y: 56 },
    ]
  },
  {
    id: 'a14-salon',
    name: 'Gran Salón Social & Pórtico A14',
    levelId: 'nivel-1',
    cota: 'Cota +0.00 m • Nivel 1',
    image: '/IBIZA A14/07-S1.jpg',
    description: 'Espacio social principal con ventilación cruzada y conexión directa hacia la terraza y piscina del Lote A14.',
    hotspots: [
      { id: 'a14-h2', title: 'Integración Interior-Exterior', desc: 'Ventanales corredizos de gran formato hacia la terraza.', x: 62, y: 54 },
      { id: 'a14-h3', title: 'Conectar a Cocina de Chef', desc: 'Isla central y área gastronómica →', x: 26, y: 50 },
    ]
  },
  {
    id: 'a14-cocina',
    name: 'Cocina de Autor & Comedor A14',
    levelId: 'nivel-1',
    cota: 'Cota +0.00 m • Nivel 1',
    image: '/IBIZA A14/08-C01.jpg',
    description: 'Cocina abierta con isla central y comunicación directa con el salón y el área de BBQ exterior.',
    hotspots: [
      { id: 'a14-h4', title: 'Isla Central & Barra', desc: 'Superficie en piedra sinterizada con herrajes europeos.', x: 42, y: 56 },
      { id: 'a14-h5', title: 'Conexión a Terraza BBQ', desc: 'Flujo gastronómico directo hacia el comedor exterior.', x: 72, y: 48 },
    ]
  },
  {
    id: 'a14-piscina',
    name: 'Terraza, Piscina & Zona BBQ A14',
    levelId: 'nivel-1',
    cota: 'Cota -0.15 m • Exterior',
    image: '/IBIZA A14/03-F006.jpg',
    description: 'Oasis exterior en el Condominio Ibiza con piscina, playa húmeda, solárium y pérgola bioclimática.',
    hotspots: [
      { id: 'a14-h6', title: 'Piscina & Playa Húmeda', desc: 'Espejo de agua integrado al paisajismo tropical del Lote A14.', x: 46, y: 62 },
      { id: 'a14-h7', title: 'Lounge Cubierto & BBQ', desc: 'Zona social exterior protegida por aleros arquitectónicos.', x: 76, y: 48 },
    ]
  },
  {
    id: 'a14-master',
    name: 'Master Suite A14 & Balcón Privado',
    levelId: 'nivel-2',
    cota: 'Cota +3.40 m • Nivel 2',
    image: '/IBIZA A14/06-S2.jpg',
    description: 'Suite principal en segundo nivel con vestier, baño tipo spa y balcón profundo orientado hacia las brisas.',
    hotspots: [
      { id: 'a14-h8', title: 'Balcón con Control Solar', desc: 'Visuales abiertas hacia el Condominio Ibiza con sombra proyectada.', x: 35, y: 44 },
      { id: 'a14-h9', title: 'Master Bath & Walk-In Closet', desc: 'Doble tocador flotante, ducha pluvial e iluminación cálida.', x: 68, y: 54 },
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

  // Determinar si es Hacienda F22 o un proyecto con su propia configuración (ej. Ibiza A14)
  const isHaciendaF22 = identity.id === 'project_hacienda_f22';

  // Renders propios del proyecto (Hacienda F22 usa sus 33 renders; Ibiza A14 usa su propio arreglo sin mezclar los de F22)
  const renders = useMemo(() => {
    if (isHaciendaF22) {
      return identity.renders && identity.renders.length > 0 ? identity.renders : HACIENDA_F22_RENDERS;
    }
    return identity.renders || [];
  }, [identity, isHaciendaF22]);

  // Niveles del proyecto
  const residenceLevels = useMemo<LevelInfo[]>(() => {
    return isHaciendaF22 ? RESIDENCE_LEVELS_F22 : RESIDENCE_LEVELS_A14;
  }, [isHaciendaF22]);

  // Ambientes 360° del escenario protagonista
  const rooms360List = useMemo<Room360Info[]>(() => {
    return isHaciendaF22 ? ROOMS_360_F22 : ROOMS_360_A14;
  }, [isHaciendaF22]);

  // Lightbox Modal para ampliar cualquier render en alta definición
  const [lightboxRender, setLightboxRender] = useState<ProjectRender | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxTouchStartX = useRef<number | null>(null);

  // Niveles
  const [activeLevel, setActiveLevel] = useState<string>('nivel-1');

  // Recorrido 360° Integrado en Modal
  const [is360Active, setIs360Active] = useState(false);
  const [activeTourRoomId, setActiveTourRoomId] = useState<string>('');

  // Estados para el Escenario Protagonista 360° Integrado en la Sección
  const [active360RoomId, setActive360RoomId] = useState<string>(() => (isHaciendaF22 ? 'salon' : 'a14-salon'));
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
    return rooms360List.find(r => r.id === active360RoomId) || rooms360List[0];
  }, [rooms360List, active360RoomId]);

  // Sincronización bidireccional entre Nivel arquitectónico y Ambiente 360
  const handleSelectLevel = (levelId: string) => {
    setActiveLevel(levelId);
    const matchedRoom = rooms360List.find(r => r.levelId === levelId);
    if (matchedRoom) {
      setActive360RoomId(matchedRoom.id);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setActive360RoomId(roomId);
    const room = rooms360List.find(r => r.id === roomId);
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

  // Título e icono de la pestaña 100% personalizado según la identidad del proyecto
  useEffect(() => {
    const currentIdentity = getProjectIdentity(id || 'hacienda-f22');
    setIdentity(currentIdentity);
    setActiveLevel('nivel-1');
    setActive360RoomId(currentIdentity.id === 'project_hacienda_f22' ? 'salon' : 'a14-salon');

    const brandTitle = currentIdentity.clientBrand?.companyName || currentIdentity.brandName || 'Proyecto Arquitectónico';
    document.title = `${currentIdentity.name} | ${brandTitle} • ${currentIdentity.urbanization}`;

    // Reemplazar dinámicamente el favicon por el isotipo de la marca del proyecto
    const iconUrl = currentIdentity.clientBrand?.logoIcon || '/HACIENDA F22/branding/amho-icon.png';
    const existingIcons = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
    existingIcons.forEach((el) => {
      (el as HTMLLinkElement).href = iconUrl;
    });

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [id]);

  // Manejador de teclado para Lightbox (Escape, Flechas)
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

  const handleOpenLightbox = (render: ProjectRender, index: number) => {
    if (!render.url) return;
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

  // Sincronizar con escenas 360° guardadas en el Estudio de Recorridos 360° (localStorage + tourData)
  const rawProjectData = useMemo<Project | null>(() => {
    const baseData = identity.id && projectsData[identity.id] ? projectsData[identity.id] : null;
    try {
      const saved = localStorage.getItem('custom_projects_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (identity.id && parsed[identity.id]) {
          return parsed[identity.id] as Project;
        }
      }
    } catch {
      // ignore storage read error
    }
    return baseData;
  }, [identity.id, is360Active]);

  useEffect(() => {
    if (rawProjectData?.rooms) {
      const firstId = Object.keys(rawProjectData.rooms)[0] || '';
      setActiveTourRoomId(firstId);
    }
  }, [rawProjectData]);

  const brand = identity.clientBrand;
  const primaryColor = identity.theme.primaryColor || '#DFC47B';
  const primaryHover = identity.theme.primaryHover || '#F1E29B';
  const metallicAccentGradient = brand?.metallicGradient || 'linear-gradient(135deg, #B89752 0%, #DFC47B 32%, #F7E8A8 50%, #D1B16B 74%, #9E7D3B 100%)';
  const titlePrefix = identity.titlePrefix || (isHaciendaF22 ? 'HACIENDA' : 'IBIZA');
  const titleHighlight = identity.titleHighlight || (isHaciendaF22 ? 'F22' : 'A14');

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
      {/* Fondo técnico sutil con cuadrícula arquitectónica personalizada por proyecto */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.028] z-0"
        style={{
          backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`,
          backgroundSize: '44px 44px'
        }}
      />

      {/* Resplandor ambiental de la identidad del proyecto */}
      <div 
        className="fixed -top-32 left-1/3 w-[700px] h-[700px] rounded-full blur-[190px] pointer-events-none opacity-15 z-0"
        style={{ backgroundColor: primaryColor }}
      />

      {/* =========================================================================
          1. HEADER OFICIAL DE MARCA
          ========================================================================= */}
      <header
        className="sticky top-0 z-40 w-full border-b bg-[#060608]/95 backdrop-blur-2xl transition-all shadow-[0_10px_30px_rgba(0,0,0,0.65)]"
        style={{ borderColor: `${primaryColor}33` }}
      >
        {/* Fila principal del Header */}
        <div className="w-full px-3.5 sm:px-8 lg:px-12 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          {/* Identidad Corporativa: Logo Horizontal + Emblema del Proyecto */}
          <div className="flex items-center gap-2.5 sm:gap-5 min-w-0">
            {brand?.logoHorizontalWhite ? (
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center group cursor-pointer focus:outline-none shrink-0"
                title={brand.companyName}
              >
                <img
                  src={encodeURI(brand.logoHorizontalWhite)}
                  alt={brand.companyName}
                  className="h-7 sm:h-10 lg:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </button>
            ) : (
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs tracking-tight shadow-lg border shrink-0 select-none"
                style={{ 
                  fontFamily: identity.theme.fontFamilyTitle,
                  background: metallicAccentGradient,
                  borderColor: `${primaryColor}65`,
                  color: '#060608',
                }}
              >
                {identity.code}
              </div>
            )}

            {/* Divisor vertical */}
            <div
              className="h-6 sm:h-8 w-px shrink-0"
              style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${primaryColor}75, transparent)` }}
            />

            {/* Título del Proyecto Residencial (visible también en móvil en formato compacto) */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span 
                  style={{ fontFamily: identity.theme.fontFamilyTitle }}
                  className="text-[11px] sm:text-sm lg:text-base font-black tracking-tight uppercase leading-none select-none truncate"
                >
                  <span className="text-white">{titlePrefix}</span>{' '}
                  <span 
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: metallicAccentGradient }}
                  >
                    {titleHighlight}
                  </span>
                </span>
                <span
                  className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${primaryColor}24`,
                    color: primaryHover,
                    borderColor: `${primaryColor}55`
                  }}
                >
                  {identity.lot}
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-white/45 uppercase block mt-0.5 truncate">
                <span className="sm:hidden">{identity.lot} • PROYECTO DE AUTOR</span>
                <span className="hidden sm:inline">{identity.urbanization} • PROYECTO DE AUTOR</span>
              </span>
            </div>
          </div>

          {/* Acceso Rápido a Secciones (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-mono tracking-widest uppercase text-white/65">
            <button 
              onClick={scrollToGallery}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Renders</span>
              <span
                className="px-1.5 py-0.2 rounded-full text-[9px] font-bold border"
                style={{
                  backgroundColor: `${primaryColor}30`,
                  color: primaryHover,
                  borderColor: `${primaryColor}50`
                }}
              >
                {renders.length}
              </span>
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('muro-parallax-renders');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Muro Parallax</span>
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('distribucion-seccion');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Distribución & 360°
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('sello-constructora-amho');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              style={{ color: primaryColor }}
            >
              <span>La Firma</span>
            </button>
          </nav>

          {/* Acciones VIP */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setIs360Active(true)}
              style={{
                color: primaryHover,
                backgroundColor: `${primaryColor}1A`,
                borderColor: `${primaryColor}58`
              }}
              className="flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer items-center gap-1.5 hover:scale-105"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Tour 360°</span>
            </button>

            {!isHaciendaF22 && (
              <button
                onClick={() => navigate('/')}
                className="p-2 sm:px-3 sm:py-2 rounded-full text-[11px] font-mono tracking-wider uppercase text-white/50 hover:text-white border border-white/10 hover:border-white/25 transition-all cursor-pointer flex items-center gap-1.5"
                title="Volver al catálogo"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Catálogo</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Navegación Rápida Táctil para Móvil (< 768px) */}
        <div
          className="md:hidden w-full px-3.5 py-2 border-t border-white/[0.06] bg-[#08080C]/90 flex items-center gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <button
            type="button"
            onClick={scrollToGallery}
            style={{
              backgroundColor: `${primaryColor}24`,
              borderColor: `${primaryColor}55`,
              color: primaryHover
            }}
            className="px-3 py-1 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Eye className="w-3 h-3" style={{ color: primaryColor }} />
            <span>Renders ({renders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('muro-parallax-renders');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/15 text-[9px] font-mono font-semibold uppercase tracking-wider text-white/80 whitespace-nowrap shrink-0 active:scale-95 transition-transform"
          >
            Muro Parallax
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('distribucion-seccion');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/15 text-[9px] font-mono font-semibold uppercase tracking-wider text-white/80 whitespace-nowrap shrink-0 active:scale-95 transition-transform"
          >
            Gemelo 360° & Niveles
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('sello-constructora-amho');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              borderColor: `${primaryColor}45`,
              color: primaryColor
            }}
            className="px-3 py-1 rounded-full bg-white/[0.04] border text-[9px] font-mono font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 active:scale-95 transition-transform"
          >
            La Firma {brand?.shortName || ''}
          </button>

          <button
            type="button"
            onClick={() => setIs360Active(true)}
            style={{
              backgroundColor: `${primaryColor}1A`,
              borderColor: `${primaryColor}55`,
              color: primaryHover
            }}
            className="px-3 py-1 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1 active:scale-95 transition-transform"
          >
            <Compass className="w-3 h-3" style={{ color: primaryColor }} />
            <span>Tour 360°</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. EL INICIO: VIDEO HORIZONTAL CINEMATOGRÁFICO (PRIMERA PANTALLA)
             Misma estructura exacta: Columna izquierda (Sello, Título Monumental,
             Memoria Conceptual, 4 Métricas, Botones y Tarjeta de Firma) +
             Columna derecha (Reproductor 16:9 Cinematográfico)
          ========================================================================= */}
      <main className="relative z-10 w-full min-h-[calc(100vh-105px)] sm:min-h-[calc(100vh-76px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-8">
        
        <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center my-auto">
          
          {/* COLUMNA LATERAL: SELLO DE FIRMA, TÍTULO MONUMENTAL & FICHA RÁPIDA */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 pr-0 lg:pr-4">
            
            {/* Insignia Superior de Firma Constructora */}
            <div
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#111116]/90 border w-fit mb-3 sm:mb-4"
              style={{
                borderColor: `${primaryColor}55`,
                boxShadow: `0 0 25px ${primaryColor}26`
              }}
            >
              {brand?.logoIcon ? (
                <img
                  src={encodeURI(brand.logoIcon)}
                  alt={brand.shortName}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain"
                />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              )}
              <span
                className="text-[9px] sm:text-[11px] font-mono font-bold tracking-[0.18em] sm:tracking-[0.2em] uppercase"
                style={{ color: primaryHover }}
              >
                {brand?.companyName || identity.brandName} • {identity.lot}
              </span>
            </div>

            {/* Título Monumental de la Casa */}
            <h1 
              style={{ fontFamily: identity.theme.fontFamilyTitle }}
              className="font-black text-[34px] sm:text-5xl lg:text-6xl xl:text-7xl tracking-tighter leading-[0.92] uppercase text-white drop-shadow-[0_15px_40px_rgba(0,0,0,0.9)] select-none mb-3 sm:mb-4"
            >
              {titlePrefix}{' '}
              <span 
                className="inline sm:block bg-clip-text text-transparent"
                style={{
                  backgroundImage: metallicAccentGradient,
                  filter: `drop-shadow(0 0 35px ${primaryColor}48)`
                }}
              >
                {titleHighlight}
              </span>
            </h1>

            {/* Breve Memoria Conceptual */}
            {isHaciendaF22 ? (
              <p className="text-xs sm:text-base text-white/75 leading-relaxed font-normal mb-4 sm:mb-5 max-w-xl">
                Escultura habitable concebida por <strong className="text-[#F1E29B] font-semibold">AMHO Construcciones</strong> en diálogo entre volúmenes en voladizo, travertino romano, 
                cuarcita exótica Taj Mahal y un oasis exterior con piscina desbordante y spa.
              </p>
            ) : (
              <p className="text-xs sm:text-base text-white/75 leading-relaxed font-normal mb-4 sm:mb-5 max-w-xl">
                {identity.tagline}
              </p>
            )}

            {/* 4 Métricas Clave con Borde Metálico */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 p-2.5 sm:p-3.5 rounded-2xl bg-[#0E0E13]/95 border backdrop-blur-xl mb-4 sm:mb-5 shadow-2xl"
              style={{ borderColor: `${primaryColor}40` }}
            >
              <div
                className="p-2.5 rounded-xl bg-black/50 border border-white/5 border-t-2"
                style={{ borderTopColor: `${primaryColor}68` }}
              >
                <span className="text-[9px] sm:text-[10px] font-mono text-white/45 block">CONSTRUIDO</span>
                <span className="text-sm sm:text-lg font-black text-white">{identity.specs.areaBuilt}</span>
              </div>
              <div
                className="p-2.5 rounded-xl bg-black/50 border border-white/5 border-t-2"
                style={{ borderTopColor: `${primaryColor}68` }}
              >
                <span className="text-[9px] sm:text-[10px] font-mono text-white/45 block">{identity.lot}</span>
                <span className="text-sm sm:text-lg font-black text-white">{identity.specs.lotMetricValue || identity.specs.lotArea}</span>
              </div>
              <div
                className="p-2.5 rounded-xl bg-black/50 border border-white/5 border-t-2"
                style={{ borderTopColor: `${primaryColor}68` }}
              >
                <span className="text-[9px] sm:text-[10px] font-mono text-white/45 block">SUITES</span>
                <span className="text-sm sm:text-lg font-black text-white">{identity.specs.suitesLabel || `${identity.specs.bedrooms} Suites`}</span>
              </div>
              <div
                className="p-2.5 rounded-xl bg-black/50 border border-white/5 border-t-2"
                style={{ borderTopColor: `${primaryColor}68` }}
              >
                <span className="text-[9px] sm:text-[10px] font-mono text-white/45 block">WELLNESS</span>
                <span className="text-sm sm:text-lg font-black" style={{ color: primaryHover }}>
                  {identity.specs.wellnessLabel || 'Piscina + Spa'}
                </span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              <button
                type="button"
                onClick={scrollToGallery}
                className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-2xl hover:scale-105 active:scale-95 border"
                style={{
                  backgroundImage: metallicAccentGradient,
                  borderColor: `${primaryHover}80`,
                  color: '#060608',
                  boxShadow: `0 10px 35px ${primaryColor}58`
                }}
              >
                <Eye className="w-4 h-4 font-black shrink-0" />
                <span>Ver Renders del Proyecto ({renders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIs360Active(true)}
                style={{ borderColor: `${primaryColor}58` }}
                className="px-5 py-3.5 sm:py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border text-white font-bold text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Compass className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                <span>Tour 360°</span>
              </button>
            </div>

            {/* Tarjeta de Respaldo Corporativo */}
            {brand && (
              <div
                className="flex items-center justify-between gap-3 sm:gap-4 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#111117] via-[#14141C] to-[#0E0E13] border shadow-lg"
                style={{ borderColor: `${primaryColor}40` }}
              >
                <img
                  src={encodeURI(brand.logoHorizontalWhite)}
                  alt={brand.companyName}
                  className="h-7 sm:h-9 w-auto object-contain shrink-0"
                />
                <div className="h-6 sm:h-7 w-px shrink-0" style={{ backgroundColor: `${primaryColor}40` }} />
                <div className="text-left flex-1 min-w-0">
                  <span
                    className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.2em] font-bold block"
                    style={{ color: primaryColor }}
                  >
                    FIRMA DESARROLLADORA OFICIAL
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-white/65 block truncate">
                    Diseño Ejecutivo, Ingeniería & Construcción Llave en Mano
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* COLUMNA PRINCIPAL: VIDEO HORIZONTAL CINEMATOGRÁFICO 16:9 */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
            <div 
              id="project-hero-video-stage"
              className="relative w-full aspect-video rounded-2xl sm:rounded-3xl lg:rounded-[32px] overflow-hidden border bg-[#08080C] group"
              style={{
                borderColor: `${primaryColor}58`,
                boxShadow: `0 25px 80px rgba(0,0,0,0.85), 0 0 55px ${primaryColor}35`
              }}
            >
              {/* Video Horizontal 16:9 Dedicado del Proyecto */}
              <video
                key={identity.heroVideoUrl}
                ref={videoRef}
                poster={identity.heroVideoPoster ? encodeURI(identity.heroVideoPoster) : undefined}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover object-center filter brightness-[0.97] contrast-[1.04] transition-transform duration-700 group-hover:scale-[1.01]"
              >
                <source src={encodeURI(identity.heroVideoUrl)} type="video/mp4" />
              </video>

              {/* Viñeta cinematográfica */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none" />

              {/* Badge superior izquierdo de calidad */}
              <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20 flex items-center gap-2">
                <span
                  className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md border text-[8px] sm:text-[10px] font-mono font-bold tracking-wider sm:tracking-widest uppercase flex items-center gap-1.5 sm:gap-2"
                  style={{
                    borderColor: `${primaryColor}70`,
                    color: primaryHover
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ backgroundColor: primaryColor }} />
                  <span className="sm:hidden">4K UHD • REEL {identity.code}</span>
                  <span className="hidden sm:inline">4K UHD • REEL ARQUITECTÓNICO</span>
                </span>
              </div>

              {/* Marca de agua oficial en esquina superior derecha del reproductor */}
              {brand && (
                <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-4 z-20 pointer-events-none">
                  <div
                    className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-black/65 backdrop-blur-md border flex items-center gap-2 shadow-xl"
                    style={{ borderColor: `${primaryColor}48` }}
                  >
                    <img
                      src={encodeURI(brand.logoHorizontalWhite)}
                      alt={brand.companyName}
                      className="h-4 sm:h-6 w-auto object-contain opacity-95"
                    />
                  </div>
                </div>
              )}

              {/* Controles del Reproductor */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    style={{ borderColor: `${primaryColor}48` }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-black backdrop-blur-md border text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                    title={isPlaying ? 'Pausar video' : 'Reproducir video'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: primaryHover }} /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" style={{ color: primaryHover }} />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    style={{ borderColor: `${primaryColor}48` }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-black backdrop-blur-md border text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                    title={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/50" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: primaryHover }} />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  style={{ borderColor: `${primaryColor}48` }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-black backdrop-blur-md border text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                  title="Pantalla completa"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: primaryHover }} /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: primaryHover }} />}
                </button>
              </div>

              {/* Barra de progreso de video */}
              <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-white/10">
                <div 
                  className="h-full transition-all duration-150"
                  style={{ 
                    width: `${videoProgress}%`,
                    backgroundImage: metallicAccentGradient
                  }}
                />
              </div>

            </div>

            {/* Pie técnico del reproductor */}
            <div className="flex items-center justify-between gap-2 mt-2 sm:mt-3 px-1 sm:px-2 text-[9px] sm:text-[11px] font-mono text-white/45">
              <span className="tracking-wider flex items-center gap-1.5 sm:gap-2 truncate">
                {brand?.logoIcon && (
                  <img src={encodeURI(brand.logoIcon)} alt="" className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain shrink-0" />
                )}
                <span className="truncate">{brand?.companyName || identity.brandName}</span>
              </span>
              <span className="font-bold shrink-0" style={{ color: primaryHover }}>{identity.name}</span>
            </div>

          </div>

        </div>

        {/* Indicador de Desplazamiento hacia la Galería de Renders */}
        <div className="w-full flex justify-center pt-4 sm:pt-6 pb-1 sm:pb-2">
          <button
            type="button"
            onClick={scrollToGallery}
            className="flex flex-col items-center gap-1.5 sm:gap-2 text-white/45 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] sm:tracking-[0.25em]">
              Ver Renders de Todo el Proyecto ({renders.length})
            </span>
            <ArrowDown className="w-4 h-4 animate-bounce group-hover:scale-110" style={{ color: primaryColor }} />
          </button>
        </div>

      </main>

      {/* =========================================================================
          2.5. SELLO CORPORATIVO DE LA FIRMA (SHOWCASE DE AUTORÍA)
          ========================================================================= */}
      {brand && (
        <section
          id="sello-constructora-amho"
          className="relative z-10 w-full py-10 sm:py-16 border-t bg-gradient-to-b from-[#07070A] via-[#0B0B10] to-[#09090D]"
          style={{ borderColor: `${primaryColor}33` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div
              className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-10 lg:p-12 bg-[#0D0D13]/90 border shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
              style={{ borderColor: `${primaryColor}48` }}
            >
              {/* Destello arquitectónico de fondo */}
              <div
                className="absolute -right-24 -top-24 w-96 h-96 rounded-full blur-[130px] opacity-20 pointer-events-none"
                style={{ backgroundColor: primaryColor }}
              />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
                {/* Columna 1: Logo sobre Pedestal Obsidiana */}
                <div
                  className="lg:col-span-4 flex flex-col items-center justify-center p-5 sm:p-8 rounded-2xl bg-[#07070A] border shadow-inner"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <img
                    src={encodeURI(brand.logoVerticalWhite)}
                    alt={brand.companyName}
                    className="h-28 sm:h-36 w-auto object-contain"
                  />
                  <div
                    className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t w-full text-center"
                    style={{ borderColor: `${primaryColor}33` }}
                  >
                    <span
                      className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.22em] sm:tracking-[0.28em] font-bold"
                      style={{ color: primaryHover }}
                    >
                      SELLO DE AUTORÍA & CONSTRUCCIÓN
                    </span>
                  </div>
                </div>

                {/* Columna 2: Manifiesto de Marca y Pilares de Ingeniería */}
                <div className="lg:col-span-5 flex flex-col justify-center text-left">
                  <span
                    className="text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.22em] sm:tracking-[0.28em] uppercase mb-1.5 sm:mb-2"
                    style={{ color: primaryColor }}
                  >
                    • {brand.subtitle}
                  </span>
                  <h2
                    style={{ fontFamily: identity.theme.fontFamilyTitle }}
                    className="text-xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-2.5 sm:mb-3"
                  >
                    RESPALDO Y EXCELENCIA{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: metallicAccentGradient }}
                    >
                      {brand.shortName}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4 sm:mb-5">
                    La residencia <strong className="text-white">{identity.name}</strong> sintetiza la visión constructiva de <strong style={{ color: primaryHover }}>{brand.companyName}</strong>: diseño arquitectónico bioclimático, estructuras de alta precisión, selección curada de materiales nobles y ejecución con rigor milimétrico en {identity.urbanization}.
                  </p>

                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    <div
                      className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border"
                      style={{ borderColor: `${primaryColor}33` }}
                    >
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase block" style={{ color: primaryColor }}>DISEÑO</span>
                      <span className="text-[11px] sm:text-xs font-bold text-white leading-tight block mt-0.5">Arquitectura de Autor</span>
                    </div>
                    <div
                      className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border"
                      style={{ borderColor: `${primaryColor}33` }}
                    >
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase block" style={{ color: primaryColor }}>ESTRUCTURA</span>
                      <span className="text-[11px] sm:text-xs font-bold text-white leading-tight block mt-0.5">Alta Ingeniería</span>
                    </div>
                    <div
                      className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border"
                      style={{ borderColor: `${primaryColor}33` }}
                    >
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase block" style={{ color: primaryColor }}>ENTREGA</span>
                      <span className="text-[11px] sm:text-xs font-bold text-white leading-tight block mt-0.5">Llave en Mano</span>
                    </div>
                  </div>
                </div>

                {/* Columna 3: Placa Metálica de Certificación */}
                <div
                  className="lg:col-span-3 flex flex-col justify-between p-5 sm:p-6 rounded-2xl border shadow-2xl text-[#060608]"
                  style={{
                    backgroundImage: metallicAccentGradient,
                    borderColor: `${primaryHover}90`
                  }}
                >
                  <div className="flex items-center justify-between border-b border-black/15 pb-2.5 sm:pb-3 mb-3 sm:mb-4">
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-black/80">
                      CERTIFICACIÓN DE OBRA
                    </span>
                    <span
                      className="px-2 py-0.5 rounded bg-black text-[9px] font-mono font-bold"
                      style={{ color: primaryHover }}
                    >
                      {identity.lot}
                    </span>
                  </div>

                  <div className="my-1 sm:my-2 flex items-center justify-center py-3 px-2 rounded-xl bg-black/85 backdrop-blur-sm shadow-inner border border-black/20">
                    <img
                      src={encodeURI(isHaciendaF22 ? brand.logoHorizontalDark : brand.logoHorizontalWhite)}
                      alt={brand.companyName}
                      className={`h-9 sm:h-11 w-auto object-contain ${isHaciendaF22 ? 'invert-0 bg-white/95 px-3 py-1 rounded-lg' : ''}`}
                    />
                  </div>

                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-black/15 flex items-center justify-between text-[9px] sm:text-[10px] font-mono font-bold text-black/85">
                    <span>EXPEDIENTE EJECUTIVO</span>
                    <span>{identity.code} • VIP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          3. MÁS ABAJO: GALERÍA DE RENDERS DE TODO EL PROYECTO (SKIPER 54)
          ========================================================================= */}
      <section 
        id="galeria-renders-skiper" 
        className="relative z-10 w-full py-12 sm:py-24 border-t bg-[#09090D]"
        style={{ borderColor: `${primaryColor}26` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-5 sm:mb-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full border mb-2.5 sm:mb-3"
            style={{
              backgroundColor: `${primaryColor}1A`,
              borderColor: `${primaryColor}48`
            }}
          >
            {brand?.logoIcon && (
              <img src={encodeURI(brand.logoIcon)} alt="" className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain" />
            )}
            <span
              className="text-[9px] sm:text-xs font-mono font-bold tracking-[0.18em] sm:tracking-[0.25em] uppercase"
              style={{ color: primaryHover }}
            >
              {brand?.companyName || identity.brandName} • PORTAFOLIO ({renders.length} RENDERS)
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            Galería de Renders del Proyecto
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-lg mx-auto mt-1.5 sm:mt-2 font-normal leading-relaxed">
            Visualización interactiva en proporciones originales. Deslice lateralmente o filtre por estancias.
          </p>
        </div>

        {/* Carrusel Dinámico Skiper 54 con desplazamiento automático e imágenes completas */}
        <SkiperArchitecturalCarousel
          renders={renders}
          identity={identity}
          autoplay={true}
          onOpenLightbox={handleOpenLightbox}
        />
      </section>

      {/* =========================================================================
          3.5. MURO PARALLAX ARQUITECTÓNICO (SKIPER 30)
          ========================================================================= */}
      <SkiperParallaxGallery
        renders={renders}
        identity={identity}
        onSelectRender={(render) => {
          const foundIdx = renders.findIndex((r) => r.id === render.id);
          handleOpenLightbox(render, foundIdx >= 0 ? foundIdx : 0);
        }}
      />

      {/* =========================================================================
          4. PROYECTO 360° PROTAGONISTA & PROGRAMA ARQUITECTÓNICO
          ========================================================================= */}
      <section 
        id="distribucion-seccion" 
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-24 border-t border-white/[0.08]"
      >
        {/* Cabecera Monumental de la Sección 360° */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-2.5 sm:mb-3"
              style={{
                backgroundColor: `${primaryColor}1A`,
                borderColor: `${primaryColor}48`
              }}
            >
              {brand?.logoIcon ? (
                <img src={encodeURI(brand.logoIcon)} alt="" className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain" />
              ) : (
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
              )}
              <span
                className="text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase"
                style={{ color: primaryHover }}
              >
                {brand?.companyName || 'EXPERIENCIA VIRTUAL INMERSIVA'} • RECORRIDO 360°
              </span>
            </div>
            <h2 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
              GEMELO DIGITAL{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: metallicAccentGradient }}
              >
                360°
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-2 sm:mt-3 leading-relaxed max-w-2xl">
              Navegue e interactúe libremente por los ambientes de <strong className="text-white">{identity.name}</strong> diseñada por <strong style={{ color: primaryHover }}>{brand?.companyName || identity.brandName}</strong>. Arrastre en cualquier dirección para rotar en 360 grados, explore los puntos de interés arquitectónicos y cambie de nivel en tiempo real.
            </p>
          </div>
        </div>

        {/* =====================================================================
             ESCENARIO PROTAGONISTA 360° (CANVAS & VISOR INMERSIVO)
            ===================================================================== */}
        <div 
          ref={stageRef}
          style={{
            borderColor: `${primaryColor}58`,
            boxShadow: `0 25px 80px rgba(0,0,0,0.95), 0 0 50px ${primaryColor}24`
          }}
          className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#070709] border transition-all select-none mb-8 sm:mb-12 ${
            isStageFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[430px] sm:h-[600px] lg:h-[680px]'
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
              {/* Capa de imagen panorámica ultra-HD o retícula 360° interactiva si está en configuración */}
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
                {current360Room.image ? (
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
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
                    style={{
                      transform: `scale(${cameraZoom * 1.08}) translate3d(${Math.sin((cameraRotationX * Math.PI) / 180) * 8}%, ${cameraRotationY * 0.3}px, 0)`,
                      background: `radial-gradient(circle at 50% 45%, ${primaryColor}22 0%, rgba(10,12,15,0.96) 65%, #050608 100%)`
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${primaryColor}45 1px, transparent 1px), linear-gradient(to bottom, ${primaryColor}45 1px, transparent 1px)`,
                        backgroundSize: '56px 56px'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Viñeteado perimetral oscuro de lente fotográfico */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />

              {/* HOTSPOTS ESPACIALES INTERACTIVOS EN 3D */}
              {current360Room.hotspots.map((h) => {
                // Cálculo sincronizado con el desplazamiento panorámico
                const panShift = Math.sin((cameraRotationX * Math.PI) / 180) * 10;
                const offsetX = Math.max(10, Math.min(90, h.x + panShift));
                const offsetY = Math.max(16, Math.min(82, h.y + (cameraRotationY * 0.2)));
                const isSelectedHotspot = activeHotspot === h.id;

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

                    {/* Popover explicativo en Desktop (sm+) */}
                    {isSelectedHotspot && (
                      <div
                        className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 rounded-2xl bg-[#0F0F14]/95 backdrop-blur-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-left pointer-events-auto animate-fadeIn"
                        style={{ borderColor: `${primaryColor}80` }}
                      >
                        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10">
                          <span
                            className="text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5"
                            style={{ color: primaryHover }}
                          >
                            <Sparkles className="w-3 h-3" />
                            ESPECIFICACIÓN {brand?.shortName || identity.code}
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
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-6 lg:p-8 z-30">
            
            {/* BARRA SUPERIOR DEL HUD: ESTADO + SELLO DE MARCA + BOTONES DE CONTROL */}
            <div className="w-full flex items-start justify-between gap-2 sm:gap-3">
              
              {/* Información del Ambiente Activo */}
              <div className="flex flex-col gap-1 pointer-events-auto min-w-0">
                <div
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/65 border backdrop-blur-md w-fit"
                  style={{ borderColor: `${primaryColor}65` }}
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: primaryColor }} />
                  <span
                    className="text-[8px] sm:text-[10px] font-mono font-bold tracking-wider sm:tracking-widest uppercase truncate"
                    style={{ color: primaryHover }}
                  >
                    360° • {current360Room.cota}
                  </span>
                </div>
                <h3 className="text-sm sm:text-2xl font-black text-white uppercase tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] truncate">
                  {current360Room.name}
                </h3>
              </div>

              {/* Controles del Visor 360 + Marca de Agua */}
              <div className="flex items-center gap-2 pointer-events-auto shrink-0">
                {brand && (
                  <div
                    className="hidden sm:flex items-center px-3 py-1.5 rounded-2xl bg-black/65 backdrop-blur-xl border shadow-2xl"
                    style={{ borderColor: `${primaryColor}48` }}
                  >
                    <img
                      src={encodeURI(brand.logoHorizontalWhite)}
                      alt={brand.companyName}
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                )}

                <div className="flex items-center gap-1 bg-black/70 backdrop-blur-xl p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl">
                  {/* Botón Auto-Rotación */}
                  <button
                    type="button"
                    onClick={() => setIs360AutoRotating(!is360AutoRotating)}
                    style={
                      is360AutoRotating
                        ? {
                            backgroundColor: primaryColor,
                            color: '#060608',
                            boxShadow: `0 0 15px ${primaryColor}65`
                          }
                        : undefined
                    }
                    className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                      is360AutoRotating 
                        ? '' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title={is360AutoRotating ? "Pausar rotación automática" : "Activar rotación automática"}
                  >
                    <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  {/* Controles de Zoom */}
                  <button
                    type="button"
                    onClick={() => setCameraZoom(prev => Math.min(1.4, prev + 0.1))}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Acercar"
                  >
                    <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraZoom(prev => Math.max(0.85, prev - 0.1))}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Alejar"
                  >
                    <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  {/* Pantalla Completa */}
                  <button
                    type="button"
                    onClick={toggleStageFullscreen}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Pantalla Completa"
                  >
                    {isStageFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* GUÍA DE INTERACCIÓN CENTRAL */}
            {!hasInteractedWith360 && !activeHotspot && (
              <div className="self-center flex flex-col items-center text-center animate-bounce pointer-events-none">
                <div
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/70 border backdrop-blur-md flex items-center justify-center mb-1.5 sm:mb-2"
                  style={{
                    borderColor: `${primaryColor}90`,
                    boxShadow: `0 0 25px ${primaryColor}55`
                  }}
                >
                  {brand?.logoIcon ? (
                    <img src={encodeURI(brand.logoIcon)} alt="" className="w-5 h-5 sm:w-7 sm:h-7 object-contain" />
                  ) : (
                    <Compass className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: primaryColor }} />
                  )}
                </div>
                <span
                  className="text-[9px] sm:text-[11px] font-mono font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white/95 bg-black/75 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full border backdrop-blur-md"
                  style={{ borderColor: `${primaryColor}55` }}
                >
                  ARRASTRA O TOCA PUNTOS 360°
                </span>
              </div>
            )}

            {/* TARJETA MÓVIL DE ESPECIFICACIÓN DE HOTSPOT */}
            {activeHotspot && (
              <div className="sm:hidden w-full pointer-events-auto my-auto">
                {current360Room.hotspots
                  .filter((h) => h.id === activeHotspot)
                  .map((h) => (
                    <div
                      key={h.id}
                      style={{ borderColor: `${primaryColor}85` }}
                      className="w-full p-3.5 rounded-2xl bg-[#0F0F14]/95 backdrop-blur-2xl border shadow-[0_15px_40px_rgba(0,0,0,0.95)] text-left"
                    >
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/10">
                        <span
                          className="text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5"
                          style={{ color: primaryHover }}
                        >
                          <Sparkles className="w-3 h-3" />
                          ESPECIFICACIÓN {brand?.shortName || identity.code}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHotspot(null);
                          }}
                          className="p-1 text-white/60 hover:text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-tight">{h.title}</h4>
                      <p className="text-[11px] text-white/75 mt-0.5 leading-relaxed">{h.desc}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* BARRA INFERIOR DEL VISOR: SELECTOR DE AMBIENTES 360° */}
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pointer-events-auto">
              
              {/* Selector horizontal de espacios */}
              <div
                className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-2xl"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {rooms360List.map((room) => {
                  const isActive = active360RoomId === room.id;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleSelectRoom(room.id)}
                      className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? 'text-[#060608]'
                          : 'text-white/65 hover:text-white hover:bg-white/10'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundImage: metallicAccentGradient,
                              boxShadow: `0 0 20px ${primaryColor}80`
                            }
                          : undefined
                      }
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
                style={{
                  backgroundColor: `${primaryColor}33`,
                  borderColor: `${primaryColor}80`,
                  color: primaryHover
                }}
                className="group px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 hover:scale-105"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Distribución por Niveles (8 columnas) */}
          <div className="lg:col-span-8 min-w-0">
            <span
              className="text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase block mb-3"
              style={{ color: primaryColor }}
            >
              • PROGRAMA ARQUITECTÓNICO POR NIVELES • {brand?.companyName || identity.name}
            </span>

            {/* Pestañas de Nivel */}
            <div
              className="flex items-center gap-2 sm:gap-2.5 mb-5 sm:mb-6 overflow-x-auto pb-1.5"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {residenceLevels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => handleSelectLevel(lvl.id)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-mono uppercase font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
                    activeLevel === lvl.id
                      ? 'text-[#060608]'
                      : 'bg-white/[0.04] text-white/60 hover:text-white border border-white/10'
                  }`}
                  style={
                    activeLevel === lvl.id
                      ? {
                          backgroundImage: metallicAccentGradient,
                          boxShadow: `0 0 20px ${primaryColor}58`
                        }
                      : undefined
                  }
                >
                  {lvl.name} ({lvl.area})
                </button>
              ))}
            </div>

            {/* Contenido detallado del nivel seleccionado */}
            {residenceLevels.filter(l => l.id === activeLevel).map((lvl) => (
              <div
                key={lvl.id}
                className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0D0D12] border shadow-2xl"
                style={{ borderColor: `${primaryColor}33` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 sm:mb-5 pb-3 border-b border-white/10 text-xs font-mono">
                  <span className="text-white/40 uppercase text-[10px] sm:text-xs">Función Principal:</span>
                  <span className="font-bold text-xs" style={{ color: primaryHover }}>{lvl.role}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  {lvl.spaces.map((sp, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sello Oficial & Resumen Ejecutivo (4 columnas) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Tarjeta de Sello Oficial con Cabecera Metálica */}
            {brand && (
              <div
                className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#121218] to-[#0A0A0E] border shadow-2xl overflow-hidden"
                style={{ borderColor: `${primaryColor}58` }}
              >
                <div
                  className="px-6 py-4 sm:py-5 flex flex-col items-center justify-center border-b border-black/15"
                  style={{ backgroundImage: metallicAccentGradient }}
                >
                  <div className={`px-6 py-2.5 sm:py-3 rounded-2xl shadow-md border border-black/10 flex items-center justify-center ${isHaciendaF22 ? 'bg-white/90' : 'bg-black/85'}`}>
                    <img
                      src={encodeURI(isHaciendaF22 ? brand.logoVerticalDark : brand.logoVerticalWhite)}
                      alt={brand.companyName}
                      className="h-16 sm:h-20 w-auto object-contain"
                    />
                  </div>
                </div>

                <div className="p-5 sm:p-6 text-center">
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest font-bold block mb-1"
                    style={{ color: primaryHover }}
                  >
                    CERTIFICACIÓN DE AUTOR • {brand.shortName}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold uppercase text-white mb-1.5">
                    {brand.companyName}
                  </h3>
                  <p className="text-xs text-white/65 leading-relaxed">
                    Arquitectura de precisión, ingeniería estructural certificada y acabados de colección en {identity.urbanization}.
                  </p>
                </div>
              </div>
            )}

            {/* Cuadro de Métricas Rápidas */}
            <div
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0D0D12] border text-xs font-mono space-y-2.5"
              style={{ borderColor: `${primaryColor}33` }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-white/40">Constructora</span>
                <span className="font-bold" style={{ color: primaryHover }}>{brand?.companyName || identity.brandName}</span>
              </div>
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
                <span className="font-bold" style={{ color: primaryHover }}>{identity.specs.modality}</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================================================
          5. FOOTER CORPORATIVO OFICIAL
          ========================================================================= */}
      <footer
        className="relative z-10 w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-12 border-t bg-[#050507]"
        style={{ borderColor: `${primaryColor}40` }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Logo Horizontal Blanco + Identidad Residencial */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-6 text-center sm:text-left">
            {brand?.logoHorizontalWhite ? (
              <img
                src={encodeURI(brand.logoHorizontalWhite)}
                alt={brand.companyName}
                className="h-10 sm:h-12 w-auto object-contain"
              />
            ) : (
              <div 
                style={{ fontFamily: identity.theme.fontFamilyTitle, backgroundImage: metallicAccentGradient }}
                className="w-8 h-8 rounded-md text-[#060608] font-black flex items-center justify-center text-xs"
              >
                {identity.code}
              </div>
            )}

            <div className="hidden sm:block h-9 w-px" style={{ backgroundColor: `${primaryColor}48` }} />

            <div>
              <div className="text-sm font-black uppercase tracking-tight">
                <span className="text-white">RESIDENCIA {titlePrefix}</span>{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: metallicAccentGradient }}
                >
                  {titleHighlight}
                </span>
              </div>
              <span className="text-white/45 text-[10px] font-mono block mt-0.5">
                {identity.urbanization} • {identity.lot} • {identity.location}
              </span>
            </div>
          </div>

          {/* Derechos Reservados & Sello Oficial */}
          <div className="flex flex-col items-center md:items-end gap-1.5 text-center md:text-right">
            <span
              className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] font-bold"
              style={{ color: primaryHover }}
            >
              DISEÑO, INGENIERÍA Y CONSTRUCCIÓN POR {brand?.companyName || identity.brandName}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-white/35 uppercase tracking-widest">
              © {new Date().getFullYear()} {brand?.companyName || identity.brandName} • PROYECTO ARQUITECTÓNICO DE AUTOR
            </span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          6. LIGHTBOX MODAL EN ALTA DEFINICIÓN
          ========================================================================= */}
      {lightboxRender && renders.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none"
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              lightboxTouchStartX.current = e.touches[0].clientX;
            }
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
          {/* Barra Superior */}
          <div className="w-full flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {brand?.logoHorizontalWhite && (
                <img
                  src={encodeURI(brand.logoHorizontalWhite)}
                  alt={brand.companyName}
                  style={{ borderColor: `${primaryColor}48` }}
                  className="h-7 sm:h-8 w-auto object-contain hidden sm:block pr-3 border-r shrink-0"
                />
              )}
              <span
                className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[#060608] text-[9px] sm:text-[10px] font-mono font-bold uppercase shrink-0"
                style={{ backgroundImage: metallicAccentGradient }}
              >
                {lightboxRender.category}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight truncate">
                {lightboxRender.title}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="text-[11px] sm:text-xs font-mono text-white/50">
                {lightboxIndex !== null ? lightboxIndex + 1 : 1}/{renders.length}
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
              title="Anterior (Flecha izquierda)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="relative flex items-center justify-center max-w-full max-h-full">
              <img
                src={encodeURI(lightboxRender.url)}
                alt={lightboxRender.title}
                className="max-h-[75vh] sm:max-h-[85vh] max-w-full object-contain rounded-xl sm:rounded-2xl shadow-2xl"
              />
              {brand?.logoHorizontalWhite && (
                <div
                  className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-black/65 backdrop-blur-md border pointer-events-none"
                  style={{ borderColor: `${primaryColor}48` }}
                >
                  <img
                    src={encodeURI(brand.logoHorizontalWhite)}
                    alt={brand.companyName}
                    className="h-4 sm:h-5 w-auto object-contain opacity-90"
                  />
                </div>
              )}
            </div>

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
              title="Siguiente (Flecha derecha)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Controles Táctiles Inferiores en Móvil + Pie de Especificación */}
          <div className="w-full flex flex-col items-center gap-2.5 z-10">
            <div className="flex sm:hidden items-center justify-center gap-3 w-full">
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

            <div className="w-full text-center text-[9px] sm:text-[10px] font-mono text-white/40 uppercase tracking-widest">
              {lightboxRender.width && lightboxRender.height ? `${lightboxRender.width} × ${lightboxRender.height} px • ` : ''}
              {brand?.companyName || identity.name} • DESLIZA O USA FLECHAS
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. RECORRIDO 360° INTEGRADO (CONECTADO CON EL ESTUDIO 360°)
          ========================================================================= */}
      {is360Active && rawProjectData && (
        <div className="fixed inset-0 z-50 bg-black">
          <TourContainer
            currentRoom={
              rawProjectData.rooms
                ? rawProjectData.rooms[activeTourRoomId] || Object.values(rawProjectData.rooms)[0]
                : undefined
            }
            rooms={rawProjectData.rooms || {}}
            minimapImage={rawProjectData.minimapImage}
            onNavigate={(targetId) => setActiveTourRoomId(targetId)}
            onBackToHome={() => setIs360Active(false)}
            projectName={`${identity.name} • ${brand?.companyName || identity.brandName}`}
          />
        </div>
      )}

    </div>
  );
}
