import { supabase, supabaseUrl } from '../supabase';
import { resolveStorageReferences } from '../lib/storageReferences';
import { Project } from '../data/tourData';
import { F22_AREA_BUILT, F22_LOT_AREA, F22_SUMMARY, F22_LEVELS, F22_HIGHLIGHTS, HACIENDA_F22_TECHNICAL, f22RenderTitle, type ProjectTechnicalSpecs } from '../data/haciendaF22Specs';
import { A14_AREA_BUILT, A14_LOT_AREA, A14_SUMMARY, A14_HIGHLIGHTS, IBIZA_A14_TECHNICAL } from '../data/ibizaA14Specs';
import { HACIENDA_F22_RENDERS as F22_RENDER_IDENTITIES, IBIZA_A14_RENDERS as IBIZA_A14_RENDER_IDENTITIES } from '../config/projectIdentityConfig';

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
  technicalSpecs?: ProjectTechnicalSpecs;
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
    storage_path: '/IBIZA A14/PLANTA 1.jpg',
    category: 'Plantas',
    order_index: 1,
    metadata: { level: 'Nivel 1', area: '236,89 m²', description: 'Salón social, comedor, cocina con isla, estudio, habitación auxiliar, deck, piscina (59,32 m²) y parqueadero.' }
  },
  {
    id: 'bp-ibiza-2',
    project_id: 'project_ibiza_a14',
    type: 'blueprint',
    title: 'Planta Nivel 2 • Área Íntima & Suites',
    storage_path: '/IBIZA A14/PLANTA 2.jpg',
    category: 'Plantas',
    order_index: 2,
    metadata: { level: 'Nivel 2', area: '168,00 m²', description: 'Master Suite con vestier y baño privado, doble altura central, escalera y dos suites auxiliares con baños y balcones.' }
  }
];

export const HACIENDA_F22_BLUEPRINTS: ProjectMediaItem[] = F22_LEVELS.map((level, index) => ({
  id: 'bp-hacienda-' + (index + 1), project_id: 'project_hacienda_f22', type: 'blueprint',
  title: 'Planta axonométrica • ' + level.name,
  storage_path: '/HACIENDA F22/360/PLANOS/P1-' + (index + 1) + '.png',
  category: 'Plantas', order_index: index + 1,
  metadata: { level: level.name, area: level.area, description: level.spaces.join(' • ') }
}));

export const IBIZA_A14_RENDERS: ProjectMediaItem[] = IBIZA_A14_RENDER_IDENTITIES.map((render, index) => ({
  id: render.id, project_id: 'project_ibiza_a14', type: 'render', title: render.title,
  storage_path: render.url, category: render.category, order_index: index + 1,
  metadata: { resolution: '4K UHD', description: render.description }
}));

export const HACIENDA_F22_RENDERS: ProjectMediaItem[] = F22_RENDER_IDENTITIES.map((render, index) => ({
  id: render.id, project_id: 'project_hacienda_f22', type: 'render', title: render.title,
  storage_path: render.url, category: render.category, order_index: index + 1,
  metadata: { description: render.description }
}));
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

const DEFAULT_PROGRESS: ProgressUpdateItem[] = [];

export async function getProjectPortalData(projectId: string, fallbackProject?: Project): Promise<ProjectPortalData> {
  const { data: allowed, error: accessError } = await supabase.rpc('is_platform_admin');
  const isAdmin = !accessError && allowed === true;
  const { data: available, error: projectError } = await supabase.from(isAdmin ? 'projects' : 'public_projects')
    .select('*').eq('id', projectId).maybeSingle();
  if (projectError || !available) throw new Error('Proyecto no disponible.');
  const result = await loadPortalData();
  if (['project_hacienda_f22', 'hacienda-f22'].includes(projectId)) {
    result.publicSpecs = getProjectPublicSpecs('HACIENDA CLUB F22');
    result.renders = result.renders.map(render => ({ ...render, title: f22RenderTitle(render.storage_path), metadata: { ...render.metadata, description: 'Visualización arquitectónica de Hacienda Club F22.' } }));
    result.blueprints = result.blueprints.map(blueprint => {
      const index = ['P1-1.png', 'P1-2.png', 'P1-3.png'].findIndex(filename => blueprint.storage_path.split('?')[0].endsWith('/' + filename));
      const { area: _area, description: _description, ...metadata } = blueprint.metadata || {};
      const level = F22_LEVELS[index];
      return { ...blueprint, title: level ? 'Planta axonométrica • ' + level.name : 'Plano de Hacienda Club F22', metadata: level ? { ...metadata, level: level.name, area: level.area, description: level.spaces.join(' • ') } : metadata };
    });
  }
  return resolveStorageReferences(supabase, result, supabaseUrl, 'project-vault');

  async function loadPortalData(): Promise<ProjectPortalData> {
  try {
    // 1. Obtener datos de la tabla 'projects'
    const projRow = available;

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
      .order('recorded_at', { ascending: false });

    const rawData = projRow?.data || fallbackProject || {};
    const lowerId = projectId.toLowerCase();
    const isIbiza = lowerId.includes('ibiza') || (rawData.name && rawData.name.toLowerCase().includes('ibiza')) || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('ibiza'));
    const isHacienda = lowerId.includes('hacienda') || (rawData.name && rawData.name.toLowerCase().includes('hacienda')) || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('hacienda'));
    const isMq = lowerId.includes('marquimoda') || projectId === 'project_1782912175010' || (rawData.name && rawData.name.toLowerCase().includes('marquimoda'));

    const projectName = isHacienda ? 'HACIENDA CLUB F22' : rawData.name || fallbackProject?.name || (isIbiza ? 'IBIZA A14' : isMq ? 'SEDE MARQUIMODA' : 'IBIZA A14');
    const clientName = isMq ? 'Marquimoda S.A.S.' : isIbiza ? 'Inversionista Ibiza A14' : isHacienda ? 'Inversionista Hacienda Club F22' : ((rawData as any).clientName || 'Cliente MASSA');

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
    if (isAdmin && progressUpdates.length === 0) {
      progressUpdates = DEFAULT_PROGRESS;
    }

    const publicSpecs = getProjectPublicSpecs(projectName);

    return {
      id: projectId,
      name: projectName,
      clientName,
      currentPhase: projRow?.current_phase || (isIbiza || isHacienda ? 'FASE 1: PREVENTA & ESTUDIOS TÉCNICOS' : isMq ? 'FASE 4: HABILITACIÓN ARQUITECTÓNICA' : 'FASE 3: ACABADOS DE LUJO'),
      currentProgress: projRow?.current_progress ?? (isIbiza || isHacienda ? 15 : isMq ? 82 : 68),
      isPublic: projRow?.published_for_client === true,
      architect: {
        name: projRow?.architect_name || 'Massa Group',
        role: projRow?.architect_role || 'Dirección de Arquitectura e Ingeniería',
        avatar: projRow?.architect_avatar || '/MASSA_USO.png',
        phone: projRow?.architect_phone || '+57 310 477 1967 / +57 304 588 2770',
        whatsapp: projRow?.architect_whatsapp || '573104771967'
      },
      renders,
      blueprints,
      progressUpdates,
      publicSpecs,
      beforeAfterComparison: undefined
    };
  } catch (err) {
    console.warn('Error cargando portal data, retornando fallback seguro:', err);
    const lowerId = projectId.toLowerCase();
    const isIbiza = lowerId.includes('ibiza') || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('ibiza'));
    const isHacienda = lowerId.includes('hacienda') || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('hacienda'));
    const isMqFallback = lowerId.includes('marquimoda') || projectId === 'project_1782912175010' || (fallbackProject?.name && fallbackProject.name.toLowerCase().includes('marquimoda'));
    const fallbackName = isIbiza ? 'IBIZA A14' : isHacienda ? 'HACIENDA CLUB F22' : isMqFallback ? 'SEDE MARQUIMODA' : (fallbackProject?.name || 'IBIZA A14');
    return {
      id: projectId,
      name: fallbackName,
      clientName: isIbiza ? 'Inversionista Ibiza A14' : isHacienda ? 'Inversionista Hacienda Club F22' : isMqFallback ? 'Marquimoda S.A.S.' : 'Cliente MASSA',
      currentPhase: isIbiza || isHacienda ? 'FASE 1: PREVENTA & ESTUDIOS TÉCNICOS' : isMqFallback ? 'FASE 4: HABILITACIÓN ARQUITECTÓNICA' : 'FASE 3: ACABADOS DE LUJO',
      currentProgress: isIbiza || isHacienda ? 15 : isMqFallback ? 82 : 68,
      isPublic: available.published_for_client === true,
      architect: {
        name: 'Massa Group',
        role: 'Dirección de Arquitectura e Ingeniería',
        avatar: '/MASSA_USO.png',
        phone: '+57 310 477 1967 / +57 304 588 2770',
        whatsapp: '573104771967'
      },
      renders: isIbiza ? IBIZA_A14_RENDERS : isHacienda ? HACIENDA_F22_RENDERS : [],
      blueprints: isIbiza ? IBIZA_A14_BLUEPRINTS : isHacienda ? HACIENDA_F22_BLUEPRINTS : DEFAULT_BLUEPRINTS,
      progressUpdates: isAdmin ? DEFAULT_PROGRESS : [],
      publicSpecs: getProjectPublicSpecs(fallbackName),
      beforeAfterComparison: undefined
    };
  }
}
}

export function getProjectPublicSpecs(projectName: string): ProjectPublicSpecs {
  const lower = projectName.toLowerCase();
  const isIbiza = lower.includes('ibiza');
  const isHacienda = lower.includes('hacienda');
  const isCommercial = lower.includes('marquimoda') || lower.includes('oficina');
  
  if (isIbiza) {
    return {
      areaBuilt: A14_AREA_BUILT,
      lotArea: A14_LOT_AREA,
      levels: '2 niveles',
      typology: IBIZA_A14_TECHNICAL.typology,
      location: 'Cúcuta, Norte de Santander',
      year: '2026',
      architecturalStyle: 'Vivienda unifamiliar de 2 niveles',
      designConcept: A14_SUMMARY,
      keyFeatures: A14_HIGHLIGHTS,
      materials: [],
      technicalSpecs: IBIZA_A14_TECHNICAL,
      spatialProgram: [],
      locationDetails: {
        city: 'Cúcuta, Norte de Santander',
        neighborhood: 'Condominio Ibiza',
        lotNumber: 'Lote A14',
        environment: '20,00 x 35,00 m'
      }
    };
  }

  if (isHacienda) {
    return {
      areaBuilt: F22_AREA_BUILT, lotArea: F22_LOT_AREA, levels: '3 pisos',
      typology: HACIENDA_F22_TECHNICAL.typology, location: 'Villa del Rosario (Boconó) / Norte de Santander',
      year: '', architecturalStyle: 'Proyecto residencial', designConcept: F22_SUMMARY,
      keyFeatures: F22_HIGHLIGHTS, materials: [], technicalSpecs: HACIENDA_F22_TECHNICAL,
      spatialProgram: F22_LEVELS.map(level => ({ zone: level.name, spaces: level.spaces })),
      locationDetails: { city: 'Villa del Rosario (Boconó) / Norte de Santander', neighborhood: 'Hacienda Club', lotNumber: 'Lote F22', environment: '' }
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
      delivery: 'Entrega integral con acabados de autor'
    }
  };
}
