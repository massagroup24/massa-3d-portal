import { supabase } from '../supabase';
import { Project } from '../data/tourData';

export interface ProjectMediaItem {
  id: string;
  project_id: string;
  type: 'render' | 'blueprint' | 'model_3d';
  title: string;
  storage_path: string;
  thumbnail_path?: string;
  category?: string;
  order_index?: number;
  metadata?: {
    resolution?: string;
    level?: string;
    area?: string;
    description?: string;
    [key: string]: any;
  };
  published?: boolean;
}

export interface ProgressMediaItem {
  id: string;
  progress_id: string;
  media_type: 'photo' | 'video';
  storage_path: string;
  caption?: string;
  is_before_after?: boolean;
  comparison_stage?: 'before' | 'after';
}

export interface ProgressUpdateItem {
  id: string;
  project_id: string;
  title: string;
  description: string;
  phase_name: string;
  progress_percentage: number;
  update_date: string;
  published?: boolean;
  media?: ProgressMediaItem[];
}

export interface ProjectMaterialItem {
  name: string;
  category: string;
  description: string;
}

export interface ProjectPublicSpecs {
  areaBuilt: string;
  lotArea?: string;
  levels: string;
  typology: string;
  location: string;
  year: string;
  architecturalStyle: string;
  designConcept: string;
  keyFeatures: string[];
  materials: ProjectMaterialItem[];
  spatialProgram: {
    zone: string;
    spaces: string[];
  }[];
  locationDetails?: {
    city: string;
    neighborhood: string; // Condominio o sector
    lotNumber?: string; // Número de casa o lote
    environment: string;
  };
  finishes?: {
    flooring: string;
    carpentry: string;
    kitchen: string;
    bathrooms: string;
    facade: string;
    automation?: string;
  };
  financials?: {
    priceCOP: string;
    priceUSD: string;
    downPayment: string;
    milestones: string;
    delivery: string;
    customTerms?: string[];
  };
}

export interface ProjectPortalData {
  id: string;
  name: string;
  clientName: string;
  currentPhase: string;
  currentProgress: number;
  isPublic?: boolean;
  architect: {
    name: string;
    role: string;
    avatar: string;
    phone: string;
    whatsapp: string;
  };
  renders: ProjectMediaItem[];
  blueprints: ProjectMediaItem[];
  progressUpdates: ProgressUpdateItem[];
  publicSpecs: ProjectPublicSpecs;
  beforeAfterComparison?: {
    beforeImage: string;
    beforeLabel: string;
    afterImage: string;
    afterLabel: string;
  };
}



export const IBIZA_A14_BLUEPRINTS: ProjectMediaItem[] = [
  {
    id: 'bp-ibiza-1',
    project_id: 'project_ibiza_a14',
    type: 'blueprint',
    title: 'Planta Nivel 1 • Acceso & Área Social',
    storage_path: '/PLANO.jpg',
    category: 'Plantas',
    order_index: 1,
    metadata: { level: 'Nivel 1', area: '190 m²', description: 'Espacio listo para plano de salón social, cocina gourmet, piscina y garajes.' }
  },
  {
    id: 'bp-ibiza-2',
    project_id: 'project_ibiza_a14',
    type: 'blueprint',
    title: 'Planta Nivel 2 • Área Íntima & Habitaciones',
    storage_path: '/PLANO.jpg',
    category: 'Plantas',
    order_index: 2,
    metadata: { level: 'Nivel 2', area: '165 m²', description: 'Espacio listo para plano de Master Suite, vestidor, 2 habitaciones y estar TV.' }
  },
  {
    id: 'bp-ibiza-3',
    project_id: 'project_ibiza_a14',
    type: 'blueprint',
    title: 'Planta Cubierta • Solárium & Aleros Bioclimáticos',
    storage_path: '/PLANO.jpg',
    category: 'Cubiertas',
    order_index: 3,
    metadata: { level: 'Cubierta', area: '85 m²', description: 'Espacio listo para plano de losa técnica, aleros de protección y paneles solares.' }
  },
  {
    id: 'bp-ibiza-4',
    project_id: 'project_ibiza_a14',
    type: 'blueprint',
    title: 'Corte Longitudinal A-A\' • Doble Altura',
    storage_path: '/PLANO.jpg',
    category: 'Cortes',
    order_index: 4,
    metadata: { level: 'Cortes & Secciones', area: 'Alturas 3.20m', description: 'Espacio listo para corte arquitectónico con detalles de cimentación y ventilación cruzada.' }
  }
];

export const HACIENDA_F22_BLUEPRINTS: ProjectMediaItem[] = [
  {
    id: 'bp-hacienda-1',
    project_id: 'project_hacienda_f22',
    type: 'blueprint',
    title: 'Planta Axonométrica Piso 1 • Social, Deck & Piscina',
    storage_path: '/HACIENDA F22/360/PLANOS/P1-1.png',
    category: 'Plantas',
    order_index: 1,
    metadata: { level: 'Nivel 1', area: '340 m² + 220 m² Exteriores', description: 'Plano 3D con atrio, gran salón a doble altura, cocina de chef, estudio, escaleras, quincho BBQ y piscina.' }
  },
  {
    id: 'bp-hacienda-2',
    project_id: 'project_hacienda_f22',
    type: 'blueprint',
    title: 'Planta Axonométrica Piso 2 • Suites & Mezzanine',
    storage_path: '/HACIENDA F22/360/PLANOS/P1-2.png',
    category: 'Plantas',
    order_index: 2,
    metadata: { level: 'Nivel 2', area: '220 m²', description: 'Plano 3D con Master Suite presidencial, vestier boutique, baño spa, family lounge, puente mezzanine y suites.' }
  },
  {
    id: 'bp-hacienda-3',
    project_id: 'project_hacienda_f22',
    type: 'blueprint',
    title: 'Planta Axonométrica Piso 3 • Sky Lounge, Juegos & Mirador 360°',
    storage_path: '/HACIENDA F22/360/PLANOS/P1-3.png',
    category: 'Cubiertas',
    order_index: 3,
    metadata: { level: 'Rooftop', area: '110 m²', description: 'Plano 3D de cubierta transitable con visuales 360°, fire pit a cielo abierto y preinstalación bioclimática.' }
  },
  {
    id: 'bp-hacienda-4',
    project_id: 'project_hacienda_f22',
    type: 'blueprint',
    title: 'Planta General de Implantación & Lote F22',
    storage_path: '/HACIENDA F22/360/PLANOS/P1-1.png',
    category: 'Plantas',
    order_index: 4,
    metadata: { level: 'Lote Completo', area: '1.200 m²', description: 'Implantación bioclimática en Condominio Hacienda con orientación solar óptima y retiros perimetrales.' }
  }
];

export const IBIZA_A14_RENDERS: ProjectMediaItem[] = [
  {
    id: 'render-ibiza-1',
    project_id: 'project_ibiza_a14',
    type: 'render',
    title: 'Fachada Principal Bioclimática',
    storage_path: '',
    category: 'Fachada',
    order_index: 1,
    metadata: { resolution: '4K UHD', description: 'Espacio listo para render exterior en alta definición de fachada principal y accesos.' }
  },
  {
    id: 'render-ibiza-2',
    project_id: 'project_ibiza_a14',
    type: 'render',
    title: 'Gran Salón Social & Doble Altura',
    storage_path: '',
    category: 'Interiores',
    order_index: 2,
    metadata: { resolution: '4K UHD', description: 'Espacio listo para render interior de sala, comedor y ventanales.' }
  },
  {
    id: 'render-ibiza-3',
    project_id: 'project_ibiza_a14',
    type: 'render',
    title: 'Terraza Lounge, Deck & Piscina',
    storage_path: '',
    category: 'Zonas Comunes',
    order_index: 3,
    metadata: { resolution: '4K UHD', description: 'Espacio listo para render de área social exterior, piscina y asador.' }
  },
  {
    id: 'render-ibiza-4',
    project_id: 'project_ibiza_a14',
    type: 'render',
    title: 'Master Suite & Vestidor',
    storage_path: '',
    category: 'Interiores',
    order_index: 4,
    metadata: { resolution: '4K UHD', description: 'Espacio listo para render de habitación principal y baño spa.' }
  }
];

export const HACIENDA_F22_RENDERS: ProjectMediaItem[] = [
  { id: 'h22-r-dron', project_id: 'project_hacienda_f22', type: 'render', title: 'Vista Aérea Panorámica Dron & Entorno', storage_path: '/HACIENDA F22/FACHADA DRON.png', category: 'Fachada', order_index: 1, metadata: { resolution: '4K UHD', description: 'Toma aérea monumental con dron capturando la volumetría de la residencia, piscina, quincho y entorno paisajístico del condominio.' } },
  { id: 'h22-r-1', project_id: 'project_hacienda_f22', type: 'render', title: 'Fachada Principal & Emblema F22', storage_path: '/HACIENDA F22/FACHADA.png', category: 'Fachada', order_index: 2, metadata: { resolution: '4K UHD', description: 'Volumetría monumental en piedra sinterizada, losa en voladizo e iluminación cálida con emblema F22 retroiluminado.' } },
  { id: 'h22-r-2', project_id: 'project_hacienda_f22', type: 'render', title: 'Perspectiva Escultórica Frontal', storage_path: '/HACIENDA F22/FACHADA 2.png', category: 'Fachada', order_index: 3, metadata: { resolution: '4K UHD', description: 'Geometría pura de volúmenes desfasados, pérgola en concreto y celosías de privacidad.' } },
  { id: 'h22-r-3', project_id: 'project_hacienda_f22', type: 'render', title: 'Iluminación Crepuscular & Paisajismo', storage_path: '/HACIENDA F22/FACHADA 3.png', category: 'Fachada', order_index: 4, metadata: { resolution: '4K UHD', description: 'Diseño lumínico rasante al atardecer realzando texturas de travertino y jardinería tropical.' } },
  { id: 'h22-r-n1', project_id: 'project_hacienda_f22', type: 'render', title: 'Fachada Nocturna & Iluminación Escénica', storage_path: '/HACIENDA F22/FACHADA NOCHE.png', category: 'Fachada', order_index: 5, metadata: { resolution: '4K UHD', description: 'Composición nocturna de alto impacto con iluminación cálida 2700K y relieve arquitectónico.' } },
  { id: 'h22-r-n2', project_id: 'project_hacienda_f22', type: 'render', title: 'Perspectiva Nocturna Frontal', storage_path: '/HACIENDA F22/FACHADA NOCHE 2.png', category: 'Fachada', order_index: 6, metadata: { resolution: '4K UHD', description: 'Visual nocturna frontal que destaca la volumetría de la residencia y su diálogo con el cielo estrellado.' } },
  { id: 'h22-r-4', project_id: 'project_hacienda_f22', type: 'render', title: 'Fachada Posterior & Apertura al Patio', storage_path: '/HACIENDA F22/FACHADA TRASERA.jpg', category: 'Fachada', order_index: 7, metadata: { resolution: '4K UHD', description: 'Grandes paños acristalados de piso a techo que desvanecen los límites con la piscina.' } },
  { id: 'h22-r-5', project_id: 'project_hacienda_f22', type: 'render', title: 'Perspectiva Posterior & Deck Superior', storage_path: '/HACIENDA F22/FACHADA TRASERA 2.jpg', category: 'Fachada', order_index: 8, metadata: { resolution: '4K UHD', description: 'Vista diagonal de terrazas y conexión bioclimática cruzada hacia el entorno natural.' } },
  { id: 'h22-r-6', project_id: 'project_hacienda_f22', type: 'render', title: 'Atrio y Vestíbulo de Acceso', storage_path: '/HACIENDA F22/VESTIBULO.jpg', category: 'Interiores', order_index: 9, metadata: { resolution: '4K UHD', description: 'Pórtico monumental de recibo con puerta pivotante de gran formato y muro en madera noble.' } },
  { id: 'h22-r-7', project_id: 'project_hacienda_f22', type: 'render', title: 'Detalle Arquitectónico de Entrada', storage_path: '/HACIENDA F22/VESTIBULO 2.jpg', category: 'Interiores', order_index: 10, metadata: { resolution: '4K UHD', description: 'Transición entre exterior e interior con iluminación escenográfica vertical.' } },
  { id: 'h22-r-8', project_id: 'project_hacienda_f22', type: 'render', title: 'Gran Salón Monumental & Doble Altura', storage_path: '/HACIENDA F22/SALA.jpg', category: 'Interiores', order_index: 11, metadata: { resolution: '4K UHD', description: 'Espacio central de doble altura con sofá orgánico bouclé, escalera flotante en madera y puente mezzanine.' } },
  { id: 'h22-r-9', project_id: 'project_hacienda_f22', type: 'render', title: 'Perspectiva de Doble Altura & Mezzanine', storage_path: '/HACIENDA F22/SALA 2.jpg', category: 'Interiores', order_index: 12, metadata: { resolution: '4K UHD', description: 'Juego de luces cenitales y sombras proyectadas a través de la pasarela acristalada superior.' } },
  { id: 'h22-r-10', project_id: 'project_hacienda_f22', type: 'render', title: 'Comedor Formal & Integración Espacial', storage_path: '/HACIENDA F22/SALA 3.png', category: 'Interiores', order_index: 13, metadata: { resolution: '4K UHD', description: 'Mesa de comedor en roble natural integrada con visual abierta hacia los jardines.' } },
  { id: 'h22-r-11', project_id: 'project_hacienda_f22', type: 'render', title: 'Cocina de Chef con Isla de Cuarcita', storage_path: '/HACIENDA F22/COCINA.jpg', category: 'Interiores', order_index: 14, metadata: { resolution: '4K UHD', description: 'Isla monolítica en cuarcita exótica, campana oculta y lámpara escultórica suspendida en ondas doradas.' } },
  { id: 'h22-r-12', project_id: 'project_hacienda_f22', type: 'render', title: 'Cava de Vinos & Vitrina de Cristal', storage_path: '/HACIENDA F22/COCINA 2.jpg', category: 'Interiores', order_index: 15, metadata: { resolution: '4K UHD', description: 'Mueble vertical acanalado en madera con iluminación perimetral para cristalería y vinos selectos.' } },
  { id: 'h22-r-13', project_id: 'project_hacienda_f22', type: 'render', title: 'Perspectiva Integral de Cocina Gourmet', storage_path: '/HACIENDA F22/COCINA 3.jpg', category: 'Interiores', order_index: 16, metadata: { resolution: '4K UHD', description: 'Diálogo armónico entre la barra de desayuno, el piso travertino y carpintería oculta.' } },
  { id: 'h22-r-14', project_id: 'project_hacienda_f22', type: 'render', title: 'Piscina Turquesa & Muros de Travertino', storage_path: '/HACIENDA F22/PISCINA.jpg', category: 'Zonas Comunes', order_index: 17, metadata: { resolution: '4K UHD', description: 'Piscina desbordante con zona de bronceado, jacuzzi y muros perimetrales con cinta LED rasante.' } },
  { id: 'h22-r-15', project_id: 'project_hacienda_f22', type: 'render', title: 'Espejo de Agua al Atardecer', storage_path: '/HACIENDA F22/PISCINA 2.jpg', category: 'Zonas Comunes', order_index: 18, metadata: { resolution: '4K UHD', description: 'Atardecer dorado reflejado sobre el agua con pabellón exterior iluminado.' } },
  { id: 'h22-r-16', project_id: 'project_hacienda_f22', type: 'render', title: 'Pabellón Gourmet / Quincho de Chef', storage_path: '/HACIENDA F22/TERRAZA.png', category: 'Zonas Comunes', order_index: 19, metadata: { resolution: '4K UHD', description: 'Cocina exterior cubierta con asador BBQ empotrado, cava de frío y comedor al aire libre.' } },
  { id: 'h22-r-17', project_id: 'project_hacienda_f22', type: 'render', title: 'Lounge Apergolado en Teca', storage_path: '/HACIENDA F22/TERRAZA 2.jpg', category: 'Zonas Comunes', order_index: 20, metadata: { resolution: '4K UHD', description: 'Estructura apergolada con ventilación natural y living exterior para veladas privadas.' } },
  { id: 'h22-r-18', project_id: 'project_hacienda_f22', type: 'render', title: 'Family Lounge & Media Room', storage_path: '/HACIENDA F22/SALA TV.jpg', category: 'Interiores', order_index: 21, metadata: { resolution: '4K UHD', description: 'Ambiente íntimo de descanso con panelado en madera acústica e iluminación indirecta cálida.' } },
  { id: 'h22-r-19', project_id: 'project_hacienda_f22', type: 'render', title: 'Sala de Cine y TV Familiar', storage_path: '/HACIENDA F22/SALA TV 2.jpg', category: 'Interiores', order_index: 22, metadata: { resolution: '4K UHD', description: 'Mobiliario envolvente low-profile diseñado para el relax total de la familia.' } },
  { id: 'h22-r-20', project_id: 'project_hacienda_f22', type: 'render', title: 'Game Room & Sala de TV Integrada', storage_path: '/HACIENDA F22/SALA TV 3.png', category: 'Interiores', order_index: 23, metadata: { resolution: '4K UHD', description: 'Espacio de entretenimiento con mesa de ping-pong de diseño, sala de TV al fondo e iluminación lineal perimetral en plafón.' } },
  { id: 'h22-r-21', project_id: 'project_hacienda_f22', type: 'render', title: 'Home Office / Estudio de Dirección', storage_path: '/HACIENDA F22/OFICINA.jpg', category: 'Interiores', order_index: 24, metadata: { resolution: '4K UHD', description: 'Despacho privado de alto estándar con aislamiento acústico y luz natural directa.' } },
  { id: 'h22-r-22', project_id: 'project_hacienda_f22', type: 'render', title: 'Master Suite Presidencial', storage_path: '/HACIENDA F22/DORMITORIO.jpg', category: 'Interiores', order_index: 25, metadata: { resolution: '4K UHD', description: 'Habitación principal con cabecero en lino cálido, ranura de luz vertical 2700K y terraza privada.' } },
  { id: 'h22-r-23', project_id: 'project_hacienda_f22', type: 'render', title: 'Perspectiva de Suite Principal', storage_path: '/HACIENDA F22/DORMITORIO 2.jpg', category: 'Interiores', order_index: 26, metadata: { resolution: '4K UHD', description: 'Cama suspendida, ventanales de piso a techo y texturas serenas de relajación.' } },
  { id: 'h22-r-24', project_id: 'project_hacienda_f22', type: 'render', title: 'Suite Familiar 01', storage_path: '/HACIENDA F22/HABITACION.jpg', category: 'Interiores', order_index: 27, metadata: { resolution: '4K UHD', description: 'Dormitorio secundario con baño privado, acabados neutros y armarios integrados.' } },
  { id: 'h22-r-25', project_id: 'project_hacienda_f22', type: 'render', title: 'Suite de Huéspedes 02', storage_path: '/HACIENDA F22/HABITACION 2.jpg', category: 'Interiores', order_index: 28, metadata: { resolution: '4K UHD', description: 'Espacio sereno con control solar pasivo y luz matutina indirecta.' } },
  { id: 'h22-r-26', project_id: 'project_hacienda_f22', type: 'render', title: 'Suite Panorámica 03', storage_path: '/HACIENDA F22/HABITACION 3.jpg', category: 'Interiores', order_index: 29, metadata: { resolution: '4K UHD', description: 'Habitación con vista perimetral y salida a balcón superior.' } },
  { id: 'h22-r-27', project_id: 'project_hacienda_f22', type: 'render', title: 'Walk-in Closet Presidencial', storage_path: '/HACIENDA F22/VESTIER.jpg', category: 'Interiores', order_index: 30, metadata: { resolution: '4K UHD', description: 'Vestier tipo boutique con vitrinas de vidrio ahumado, iluminación interna y módulo de accesorios.' } },
  { id: 'h22-r-28', project_id: 'project_hacienda_f22', type: 'render', title: 'Master Bath & Spa', storage_path: '/HACIENDA F22/BANO.jpg', category: 'Interiores', order_index: 31, metadata: { resolution: '4K UHD', description: 'Baño principal en mármol con doble lavamanos flotante, espejos con halo LED y grifería negro mate.' } },
  { id: 'h22-r-29', project_id: 'project_hacienda_f22', type: 'render', title: 'Ducha Pluvial de Gran Formato', storage_path: '/HACIENDA F22/BANO 2.png', category: 'Interiores', order_index: 32, metadata: { resolution: '4K UHD', description: 'Zona de ducha húmeda con nicho empotrado y acabado en piedra natural.' } },
  { id: 'h22-r-30', project_id: 'project_hacienda_f22', type: 'render', title: 'Tocador & Baño Secundario', storage_path: '/HACIENDA F22/BANO 3.jpg', category: 'Interiores', order_index: 33, metadata: { resolution: '4K UHD', description: 'Mobiliario de baño en roble alistonado y encimera pulida de fácil mantenimiento.' } }
];

const DEFAULT_BLUEPRINTS: ProjectMediaItem[] = [
  {
    id: 'bp-1',
    project_id: 'default',
    type: 'blueprint',
    title: 'Planta Arquitectónica Nivel 1',
    storage_path: '/PLANO.jpg',
    category: 'Plantas',
    order_index: 1,
    metadata: { level: 'Nivel 1', area: '185 m²', description: 'Área social, cocina gourmet, terraza cubierta y parqueaderos.' }
  },
  {
    id: 'bp-2',
    project_id: 'default',
    type: 'blueprint',
    title: 'Planta Nivel 2 - Habitaciones',
    storage_path: '/PLANO.jpg',
    category: 'Plantas',
    order_index: 2,
    metadata: { level: 'Nivel 2', area: '160 m²', description: 'Master suite con vestidor, 2 habitaciones auxiliares con baño y estar de alcobas.' }
  },
  {
    id: 'bp-3',
    project_id: 'default',
    type: 'blueprint',
    title: 'Planta Cubierta & Terraza Spa',
    storage_path: '/PLANO.jpg',
    category: 'Cubiertas',
    order_index: 3,
    metadata: { level: 'Cubierta', area: '95 m²', description: 'Zona lounge exterior, jacuzzi apergolado y paneles solares integrados.' }
  },
  {
    id: 'bp-4',
    project_id: 'default',
    type: 'blueprint',
    title: 'Corte Longitudinal A-A\'',
    storage_path: '/PLANO.jpg',
    category: 'Cortes',
    order_index: 4,
    metadata: { level: 'Sección', area: 'Alturas 3.20m', description: 'Detalle de dobles alturas, cimentación escalonada y aislamiento térmico.' }
  }
];

const DEFAULT_PROGRESS: ProgressUpdateItem[] = [
  {
    id: 'prog-1',
    project_id: 'default',
    title: 'Acabados en Madera y Carpintería Fija',
    description: 'Instalación de paneles en roble europeo en sala y habitación principal. Avance al 85% de carpintería general.',
    phase_name: 'FASE 3: ACABADOS DE LUJO',
    progress_percentage: 68,
    update_date: 'Octubre 2026',
    published: true,
    media: [
      {
        id: 'pm-1',
        progress_id: 'prog-1',
        media_type: 'photo',
        storage_path: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&q=80',
        caption: 'Colocación de cielorrasos e iluminación técnica perimetral.'
      },
      {
        id: 'pm-2',
        progress_id: 'prog-1',
        media_type: 'photo',
        storage_path: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Enchape en porcelanato de gran formato en cocina.'
      }
    ]
  },
  {
    id: 'prog-2',
    project_id: 'default',
    title: 'Estructura Metálica y Mampostería Completa',
    description: 'Fundición de losa de entrepiso y levantamiento de muros divisorios en bloque termoacústico.',
    phase_name: 'FASE 2: OBRA GRUESA',
    progress_percentage: 45,
    update_date: 'Agosto 2026',
    published: true,
    media: [
      {
        id: 'pm-3',
        progress_id: 'prog-2',
        media_type: 'photo',
        storage_path: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Estructura portante completada y revisada por interventoría técnica.'
      }
    ]
  },
  {
    id: 'prog-3',
    project_id: 'default',
    title: 'Cimentación y Movimiento de Tierras',
    description: 'Excavación, micropilotes a 12 metros y fundición de zapatas aisladas con concreto de 4000 PSI.',
    phase_name: 'FASE 1: CIMENTACIÓN',
    progress_percentage: 20,
    update_date: 'Mayo 2026',
    published: true,
    media: [
      {
        id: 'pm-4',
        progress_id: 'prog-3',
        media_type: 'photo',
        storage_path: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Plataforma nivelada y anclajes estructurales iniciales.'
      }
    ]
  }
];

export async function getProjectPortalData(projectId: string, fallbackProject?: Project): Promise<ProjectPortalData> {
  try {
    // 1. Obtener datos de la tabla 'projects'
    const { data: projRow } = await supabase
      .from('projects')
      .select('id, data, current_phase, current_progress, architect_name, architect_role, architect_avatar, architect_phone, architect_whatsapp, published_for_client')
      .eq('id', projectId)
      .maybeSingle();

    // 2. Obtener medios relacionales de project_media
    const { data: mediaRows } = await supabase
      .from('project_media')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    // 3. Obtener actualizaciones de progreso
    const { data: progressRows } = await supabase
      .from('progress_updates')
      .select('*, media:progress_media(*)')
      .eq('project_id', projectId)
      .order('update_date', { ascending: false });

    const rawData = projRow?.data || fallbackProject || {};
    const lowerId = projectId.toLowerCase();
    const isIbiza = lowerId.includes('ibiza') || (rawData.name && rawData.name.toLowerCase().includes('ibiza')) || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('ibiza'));
    const isHacienda = lowerId.includes('hacienda') || (rawData.name && rawData.name.toLowerCase().includes('hacienda')) || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('hacienda'));
    const isMq = lowerId.includes('marquimoda') || projectId === 'project_1782912175010' || (rawData.name && rawData.name.toLowerCase().includes('marquimoda'));

    const projectName = rawData.name || fallbackProject?.name || (isIbiza ? 'IBIZA A14' : isHacienda ? 'HACIENDA F22' : isMq ? 'SEDE MARQUIMODA' : 'RESIDENCIA JEJÉN');
    const clientName = isMq ? 'Marquimoda S.A.S.' : isIbiza ? 'Inversionista Ibiza A14' : isHacienda ? 'Inversionista Hacienda F22' : ((rawData as any).clientName || 'Edinson Jején');

    // Renders
    let renders = (mediaRows || []).filter(m => m.type === 'render' && !m.storage_path.includes('unsplash.com'));
    if (renders.length === 0) {
      if (fallbackProject?.renders && fallbackProject.renders.length > 0) {
        renders = fallbackProject.renders
          .filter(r => r.storage_path && !r.storage_path.includes('unsplash.com'))
          .map(r => ({
            id: r.id,
            project_id: projectId,
            type: 'render' as const,
            title: r.title,
            storage_path: r.storage_path,
            category: r.category,
            order_index: r.order_index,
            metadata: { description: r.description }
          }));
      }
      if (renders.length === 0) {
        if (isIbiza) {
          renders = IBIZA_A14_RENDERS;
        } else if (isHacienda) {
          renders = HACIENDA_F22_RENDERS;
        }
      }
    }

    // Planos
    let blueprints = (mediaRows || []).filter(m => m.type === 'blueprint');
    if (blueprints.length === 0) {
      if (isIbiza) {
        blueprints = IBIZA_A14_BLUEPRINTS;
      } else if (isHacienda) {
        blueprints = HACIENDA_F22_BLUEPRINTS;
      } else {
        const minimap = rawData.minimapImage || fallbackProject?.minimapImage;
        if (minimap) {
          blueprints = [
            {
              id: 'bp-real-1',
              project_id: projectId,
              type: 'blueprint',
              title: `Plano Arquitectónico Oficial - ${projectName}`,
              storage_path: minimap,
              category: 'Plantas',
              order_index: 1,
              metadata: { level: 'Planta General', area: 'Distribución 3D', description: 'Plano técnico con correspondencia de recintos.' }
            },
            ...DEFAULT_BLUEPRINTS.slice(1)
          ];
        } else {
          blueprints = DEFAULT_BLUEPRINTS;
        }
      }
    }

    // Avances
    let progressUpdates = (progressRows || []) as ProgressUpdateItem[];
    if (progressUpdates.length === 0) {
      progressUpdates = DEFAULT_PROGRESS;
    }

    const publicSpecs = getProjectPublicSpecs(projectName);

    return {
      id: projectId,
      name: projectName,
      clientName,
      currentPhase: projRow?.current_phase || (isIbiza || isHacienda ? 'FASE 1: PREVENTA & ESTUDIOS TÉCNICOS' : isMq ? 'FASE 4: HABILITACIÓN ARQUITECTÓNICA' : 'FASE 3: ACABADOS DE LUJO'),
      currentProgress: projRow?.current_progress ?? (isIbiza || isHacienda ? 15 : isMq ? 82 : 68),
      isPublic: projRow?.published_for_client ?? true,
      architect: {
        name: projRow?.architect_name || 'Mateo Rossi',
        role: projRow?.architect_role || 'Director de Proyecto MASSA',
        avatar: projRow?.architect_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: projRow?.architect_phone || '+57 310 892 4410',
        whatsapp: projRow?.architect_whatsapp || '573108924410'
      },
      renders,
      blueprints,
      progressUpdates,
      publicSpecs,
      beforeAfterComparison: isMq ? {
        beforeImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
        beforeLabel: 'Enero 2026 • Estado Inicial de Planta Libre',
        afterImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
        afterLabel: 'Estado Actual • Habilitación Arquitectónica 82%'
      } : {
        beforeImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1600&q=80',
        beforeLabel: 'Mayo 2026 • Terreno y Cimentación',
        afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        afterLabel: 'Estado Actual • Estructura & Acabados 68%'
      }
    };
  } catch (err) {
    console.warn('Error cargando portal data, retornando fallback seguro:', err);
    const lowerId = projectId.toLowerCase();
    const isIbiza = lowerId.includes('ibiza') || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('ibiza'));
    const isHacienda = lowerId.includes('hacienda') || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('hacienda'));
    const isMqFallback = lowerId.includes('marquimoda') || projectId === 'project_1782912175010' || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('marquimoda'));
    const fallbackName = isIbiza ? 'IBIZA A14' : isHacienda ? 'HACIENDA F22' : isMqFallback ? 'SEDE MARQUIMODA' : (fallbackProject?.name || 'RESIDENCIA JEJÉN');
    return {
      id: projectId,
      name: fallbackName,
      clientName: isIbiza ? 'Inversionista Ibiza A14' : isHacienda ? 'Inversionista Hacienda F22' : isMqFallback ? 'Marquimoda S.A.S.' : 'Edinson Jején',
      currentPhase: isIbiza || isHacienda ? 'FASE 1: PREVENTA & ESTUDIOS TÉCNICOS' : isMqFallback ? 'FASE 4: HABILITACIÓN ARQUITECTÓNICA' : 'FASE 3: ACABADOS DE LUJO',
      currentProgress: isIbiza || isHacienda ? 15 : isMqFallback ? 82 : 68,
      isPublic: true,
      architect: {
        name: 'Mateo Rossi',
        role: 'Director de Proyecto MASSA',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: '+57 310 892 4410',
        whatsapp: '573108924410'
      },
      renders: isIbiza ? IBIZA_A14_RENDERS : isHacienda ? HACIENDA_F22_RENDERS : [],
      blueprints: isIbiza ? IBIZA_A14_BLUEPRINTS : isHacienda ? HACIENDA_F22_BLUEPRINTS : DEFAULT_BLUEPRINTS,
      progressUpdates: DEFAULT_PROGRESS,
      publicSpecs: getProjectPublicSpecs(fallbackName),
      beforeAfterComparison: isMqFallback ? {
        beforeImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
        beforeLabel: 'Enero 2026 • Estado Inicial de Planta Libre',
        afterImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
        afterLabel: 'Estado Actual • Habilitación Arquitectónica 82%'
      } : {
        beforeImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1600&q=80',
        beforeLabel: 'Mayo 2026 • Terreno y Cimentación',
        afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        afterLabel: 'Estado Actual • Estructura & Acabados 68%'
      }
    };
  }
}

export function getProjectPublicSpecs(projectName: string): ProjectPublicSpecs {
  const lower = projectName.toLowerCase();
  const isIbiza = lower.includes('ibiza');
  const isHacienda = lower.includes('hacienda');
  const isCommercial = lower.includes('marquimoda') || lower.includes('oficina');
  
  if (isIbiza) {
    return {
      areaBuilt: 'Por definir m²',
      lotArea: 'Lote A14',
      levels: '2 Plantas + Terraza',
      typology: 'Villa Campestre de Autor',
      location: 'Cúcuta, Norte de Santander',
      year: '2026',
      architecturalStyle: 'Arquitectura Contemporánea Tropical',
      designConcept: 'Concebida para el disfrute del clima y la luz de Cúcuta. Volumetría horizontal con generosos aleros de protección solar, ventilación cruzada continua e integración fluida entre salón, terraza y piscina.',
      keyFeatures: [
        'Distribución arquitectónica a medida con integración bioclimática',
        'Sala social a doble altura conectada directamente a la terraza exterior',
        'Cocina de autor abierta con isla central y despensa integrada',
        'Piscina privada con solárium húmedo y jardín perimetral',
        'Master Suite con vestidor privado y balcón hacia la vegetación',
        'Garaje cubierto para 3 vehículos y accesos de servicio independientes'
      ],
      materials: [
        { name: 'Piedra Natural & Concreto', category: 'Fachadas', description: 'Revestimiento pétreo térmico con acentos en concreto arquitectónico visto.' },
        { name: 'Carpintería en Roble / Teca', category: 'Interiores & Decks', description: 'Madera natural tratada para alto confort térmico y biofilia.' },
        { name: 'Porcelanato Gran Formato', category: 'Pisos & Baños', description: 'Placas rectificadas antideslizantes de textura sedosa.' },
        { name: 'Ventanería de Control Térmico', category: 'Envolvente', description: 'Perfilería hermética en aluminio anodizado con vidrio de control solar.' }
      ],
      spatialProgram: [
        { zone: 'Nivel 1 • Área Social & Relax', spaces: ['Hall de Acceso', 'Sala & Comedor en doble altura', 'Cocina Gourmet abierta', 'Terraza Apergolada con BBQ', 'Piscina & Deck', 'Baño Social', 'Zona de Ropas & Cuarto de Servicio'] },
        { zone: 'Nivel 2 • Área Íntima', spaces: ['Master Suite con Vestidor y Baño Spa', 'Habitación 2 con Baño Privado', 'Habitación 3 con Baño Privado', 'Estar de Alcobas / Sala TV'] }
      ],
      locationDetails: {
        city: 'Cúcuta, NDS',
        neighborhood: 'Condominio Campestre Ibiza',
        lotNumber: 'Lote A14',
        environment: 'Condominio cerrado de alta plusvalía, vigilancia 24/7, vías pavimentadas y club social campestre.'
      },
      finishes: {
        flooring: 'Porcelanato rectificado de gran formato 120x60 cm mate.',
        carpentry: 'Puertas de piso a techo en madera natural con cerraduras magnéticas.',
        kitchen: 'Muebles termoformados de cierre lento con mesón en cuarzo / granito exótico.',
        bathrooms: 'Sanitarios suspendidos y grifería monocontrol de alta gama en negro mate.',
        facade: 'Envolvente mixta en revoque hidrófugo, lamas de aluminio y piedra natural.',
        automation: 'Puntos domóticos previstos para iluminación, cortinas y sonido.'
      },
      financials: {
        priceCOP: 'A consultar con el arquitecto',
        priceUSD: 'Inversión personalizada',
        downPayment: '30% Cuota Inicial durante planeación',
        milestones: '50% en cuotas mensuales durante construcción',
        delivery: '20% contra entrega de llaves y escrituración',
        customTerms: [
          'Presupuesto cerrado llave en mano',
          'Acompañamiento en trámites fiduciarios o bancarios',
          'Plan de pagos adaptable al cronograma de obra'
        ]
      }
    };
  }

  if (isHacienda) {
    return {
      areaBuilt: 'Por definir m²',
      lotArea: 'Lote F22',
      levels: '2 Plantas + Rooftop',
      typology: 'Residencia Campestre Luxury',
      location: 'Cúcuta, Norte de Santander',
      year: '2026',
      architecturalStyle: 'Minimalismo Escultórico de Vanguardia',
      designConcept: 'Composición de voladizos y patios interiores que tamizan la radiación solar mientras enmarcan las visuales hacia el entorno campestre. Espacios diáfanos que priorizan la serenidad, la ventilación pasiva y la nobleza de los materiales.',
      keyFeatures: [
        'Diseño volumétrico con grandes luces y ausencia de columnas intermedias',
        'Atrio central con jardín interior y espejo de agua',
        'Cocina de alta gama con isla social en mármol y alacena oculta',
        'Piscina infinity con desborde perimetral y playa de bronceado',
        'Master Suite con terraza privada panorámica y baño tipo spa',
        'Parqueadero cubierto para 4 vehículos con estación de carga'
      ],
      materials: [
        { name: 'Concreto Visto & Mármol', category: 'Estructura & Acentos', description: 'Muros portantes en concreto arquitectónico con encofrado fino.' },
        { name: 'Maderas Finas Sostenibles', category: 'Carpintería', description: 'Revestimientos acústicos interiores y decks perimetrales.' },
        { name: 'Ventanería Piso a Techo', category: 'Fachadas', description: 'Sistemas corredizos de perfil oculto y cristales bajo emisivos.' },
        { name: 'Piedras Naturales', category: 'Zonas Húmedas', description: 'Mármol travertino y pizarra en áreas de agua y terrazas.' }
      ],
      spatialProgram: [
        { zone: 'Nivel 1 • Convivencia & Paisaje', spaces: ['Acceso con Espejo de Agua', 'Gran Salón Social con Doble Altura', 'Comedor Formal', 'Cocina Abierta de Chef', 'Cava de Vinos', 'Terraza Lounge & Asador', 'Piscina Infinity & Jacuzzi', 'Parqueaderos'] },
        { zone: 'Nivel 2 • Descanso & Privacidad', spaces: ['Master Suite Presidencial con Doble Vestidor', '3 Suites Auxiliares con Baño', 'Estudio de Trabajo / Biblioteca', 'Family Room'] },
        { zone: 'Nivel Superior • Rooftop', spaces: ['Terraza Mirador 360°', 'Área de Fuego (Fire Pit)', 'Bar Exterior'] }
      ],
      locationDetails: {
        city: 'Cúcuta, NDS',
        neighborhood: 'Condominio Hacienda',
        lotNumber: 'Lote F22',
        environment: 'Sector campestre exclusivo con máxima seguridad, senderos verdes y entorno natural protegido.'
      },
      finishes: {
        flooring: 'Mármol nacional / porcelanato de ultra gran formato 160x80 cm.',
        carpentry: 'Carpintería arquitectónica en roble alistonado y herrajes europeos.',
        kitchen: 'Cocina italiana con electrodomésticos empotrados y mesón Neolith / Dekton.',
        bathrooms: 'Duchas efecto lluvia, división en cristal templado y grifería de autor.',
        facade: 'Concreto blanco aparente, lamas bioclimáticas y piedra laja pulida.',
        automation: 'Domótica integral Lutron / Control4 para escenas de iluminación y climatización.'
      },
      financials: {
        priceCOP: 'A consultar con el arquitecto',
        priceUSD: 'Inversión personalizada',
        downPayment: '30% Inicial fraccionada',
        milestones: '50% durante los meses de construcción',
        delivery: '20% contra recibo a satisfacción',
        customTerms: [
          'Garantía estructural decenal por MASSA GROUP',
          'Personalización de acabados en sala de diseño',
          'Flexibilidad en hitos de desembolso'
        ]
      }
    };
  }

  if (isCommercial) {
    return {
      areaBuilt: '620 m²',
      lotArea: 'Nivel Corporativo Completo',
      levels: '2 Niveles Integrados',
      typology: 'Sede Corporativa & Oficinas de Diseño',
      location: 'Valle del Cauca, Colombia',
      year: '2026',
      architecturalStyle: 'Minimalismo Corporativo & Biofilia Laboral',
      designConcept: 'Espacios diáfanos de trabajo colaborativo que maximizan el confort lumínico y acústico, integrando áreas gerenciales privadas, cafetería lounge y zonas operativas con ergonomía avanzada.',
      keyFeatures: [
        'Zonas de trabajo colaborativo tipo open-space para equipos multidisciplinarios',
        'Oficina de gerencia privada con sala de estar y terraza',
        'Sala de juntas ejecutiva con conectividad audiovisual oculta',
        'Cafetería y lounge social para colaboradores con iluminación biofílica',
        'Aislamiento acústico de 42 dB en divisiones de cristal templado',
        'Climatización zonificada de bajo consumo energético'
      ],
      materials: [
        { name: 'Microcemento Pulido', category: 'Pisos', description: 'Acabado continuo mate de alta resistencia al tráfico peatonal.' },
        { name: 'Roble Natural Acústico', category: 'Mobiliario & Paneles', description: 'Revestimiento fonoabsorbente en muros y cielorrasos técnicos.' },
        { name: 'Vidrio Laminado Doble', category: 'Divisiones', description: 'Transparencia visual con atenuación sonora certificada.' },
        { name: 'Acero Electroestático Negro', category: 'Estructura & Perfilería', description: 'Perfiles ultradelgados con acabado negro mate microtexturizado.' }
      ],
      spatialProgram: [
        { zone: 'Área Operativa', spaces: ['Zona de Trabajo Abierta (24 puestos)', 'Estaciones de Diseño & Patronaje', 'Área de Importaciones'] },
        { zone: 'Área Directiva', spaces: ['Gerencia General', 'Oficinas de Dirección', 'Sala de Juntas Ejecutiva'] },
        { zone: 'Servicios & Bienestar', spaces: ['Cafetería Lounge', 'Baterías de Baños', 'Archivo Técnico'] }
      ],
      locationDetails: {
        city: 'Valle del Cauca',
        neighborhood: 'Distrito Empresarial',
        lotNumber: 'Sede Propia',
        environment: 'Ubicación estratégica con acceso a vías arterias y zona financiera.'
      },
      finishes: {
        flooring: 'Microcemento sellado con poliuretano de alta resistencia.',
        carpentry: 'Mobiliario ergonómico a medida en madera técnica fonoabsorbente.',
        kitchen: 'Cafetería equipada con encimera de acero inoxidable y barra de café.',
        bathrooms: 'Baterías sanitarias automatizadas de bajo consumo hídrico.',
        facade: 'Muro cortina vidriado con lamas de aluminio automatizadas.',
        automation: 'Control lumínico DALI y sensores de presencia.'
      },
      financials: {
        priceCOP: 'Inversión Corporativa a Medida',
        priceUSD: 'Cotización según programa arquitectónico',
        downPayment: '35% al inicio',
        milestones: '45% contra actas de obra',
        delivery: '20% entrega final de instalaciones operativas'
      }
    };
  }

  return {
    areaBuilt: '480 m²',
    lotArea: '850 m²',
    levels: '2 Plantas + Terraza Spa',
    typology: 'Residencia Unifamiliar Luxury',
    location: 'Cali / Valle del Cauca, Colombia',
    year: '2026',
    architecturalStyle: 'Arquitectura Contemporánea Biofílica',
    designConcept: 'Composición de volúmenes en voladizo que abrazan la luz natural y el paisaje circundante. La fluidez entre el interior y la terraza exterior crea una experiencia de bienestar donde el concreto aparente, la madera noble y el agua dialogan en armonía.',
    keyFeatures: [
      'Sala principal con ventanales de doble altura (5.80 m)',
      'Cocina gourmet integrada con isla monolítica en mármol Calacatta',
      'Piscina infinity de 62 m² orientada al poniente con deck flotante',
      'Spa privado con baño turco revestido en piedra y domo cenital',
      'Master Suite con vestidor walk-in y baño tipo resort con vista al jardín',
      'Estrategia bioclimática pasiva con ventilación cruzada y aleros de sombra'
    ],
    materials: [
      { name: 'Concreto Visto Arquitectónico', category: 'Estructura & Fachadas', description: 'Textura encofrada con sellado hidrófugo mate y juntas alineadas.' },
      { name: 'Madera Tecnológica & Roble Europeo', category: 'Carpintería & Decks', description: 'Deck resistente al intemperismo y paneles acústicos interiores.' },
      { name: 'Mármol Calacatta & Pizarra Natural', category: 'Revestimientos Nobles', description: 'Placas de gran formato en zonas sociales, baños y cocina.' },
      { name: 'Ventanería de Control Solar', category: 'Envolvente', description: 'Cristal templado bajo emisivo con perfilería oculta en muro.' }
    ],
    spatialProgram: [
      { zone: 'Zona Social (Nivel 1)', spaces: ['Hall de acceso en doble altura', 'Sala y Comedor integrados', 'Cocina gourmet abierta con alacena', 'Terraza apergolada con BBQ', 'Piscina infinity y solárium'] },
      { zone: 'Zona Privada (Nivel 2)', spaces: ['Master Suite con vestidor y baño spa', '2 Suites auxiliares con baño privado', 'Estar de alcobas y televisión'] },
      { zone: 'Bienestar & Relax', spaces: ['Baño Turco / Spa térmico', 'Terraza lounge en cubierta', 'Espejo de agua perimetral'] }
    ],
    locationDetails: {
      city: 'Cali, Valle del Cauca',
      neighborhood: 'Sector Campestre Exclusivo',
      lotNumber: 'Obra Privada',
      environment: 'Zona residencial privada de alta reserva natural y clima privilegiado.'
    },
    finishes: {
      flooring: 'Pisos en mármol apomazado y tablones de madera natural en alcobas.',
      carpentry: 'Carpintería artesanal en roble ahumado con herrajes ocultos.',
      kitchen: 'Isla monolítica en Calacatta con muebles termoformados alemanes.',
      bathrooms: 'Revestimiento en piedra volcánica, grifería empotrada y tinas exentas.',
      facade: 'Concreto visto pigmentado, brise-soleil en madera y grandes ventanales.',
      automation: 'Automatización integral de iluminación, sonido y climatización.'
    },
    financials: {
      priceCOP: 'Obra Privada',
      priceUSD: 'Proyecto Personalizado',
      downPayment: 'Estructura por hitos de ejecución',
      milestones: 'Desembolsos contra actas de interventoría técnica',
      delivery: 'Entrega llave en mano con acabados de autor'
    }
  };
}
