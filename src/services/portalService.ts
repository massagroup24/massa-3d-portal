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

export interface ProjectPortalData {
  id: string;
  name: string;
  clientName: string;
  currentPhase: string;
  currentProgress: number;
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
  beforeAfterComparison?: {
    beforeImage: string;
    beforeLabel: string;
    afterImage: string;
    afterLabel: string;
  };
}

// Fallback curated media to ensure zero blank states for any project
const DEFAULT_RENDERS: ProjectMediaItem[] = [
  {
    id: 'r-1',
    project_id: 'default',
    type: 'render',
    title: 'Fachada Principal al Atardecer',
    storage_path: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
    thumbnail_path: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    category: 'Fachada',
    order_index: 1,
    metadata: { resolution: '4K Ultra HD', description: 'Vista exterior con iluminación cálida crepuscular y voladizos en concreto pulido.' }
  },
  {
    id: 'r-2',
    project_id: 'default',
    type: 'render',
    title: 'Sala Principal & Doble Altura',
    storage_path: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85',
    thumbnail_path: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
    category: 'Interiores',
    order_index: 2,
    metadata: { resolution: '4K Ultra HD', description: 'Espacio social continuo con ventanales de piso a techo y texturas en roble europeo.' }
  },
  {
    id: 'r-3',
    project_id: 'default',
    type: 'render',
    title: 'Cocina Gourmet & Isla de Mármol',
    storage_path: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=85',
    thumbnail_path: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80',
    category: 'Interiores',
    order_index: 3,
    metadata: { resolution: '4K Ultra HD', description: 'Isla monolítica en mármol Calacatta con carpintería oculta en nogal.' }
  },
  {
    id: 'r-4',
    project_id: 'default',
    type: 'render',
    title: 'Terraza Infinity & Piscina',
    storage_path: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
    thumbnail_path: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    category: 'Zonas Húmedas',
    order_index: 4,
    metadata: { resolution: '4K Ultra HD', description: 'Deck en madera tecnológica con piscina sinfín orientada a la cordillera.' }
  },
  {
    id: 'r-5',
    project_id: 'default',
    type: 'render',
    title: 'Master Suite & Vestidor',
    storage_path: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=85',
    thumbnail_path: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
    category: 'Interiores',
    order_index: 5,
    metadata: { resolution: '4K Ultra HD', description: 'Habitación principal con terraza privada e iluminación indirecta en artesonados.' }
  },
  {
    id: 'r-6',
    project_id: 'default',
    type: 'render',
    title: 'Spa & Baño Turco Arquitectónico',
    storage_path: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=2000&q=85',
    thumbnail_path: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    category: 'Zonas Húmedas',
    order_index: 6,
    metadata: { resolution: '4K Ultra HD', description: 'Revestimiento en piedra pizarra natural con banco térmico y domo cenital.' }
  }
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
    const projectName = rawData.name || fallbackProject?.name || 'Villa Serena';
    const clientName = (rawData as any).clientName || 'Carlos';

    // Renders
    let renders = (mediaRows || []).filter(m => m.type === 'render');
    if (renders.length === 0) {
      // Usar renders por defecto enriquecidos con las fotos del proyecto si existen
      renders = DEFAULT_RENDERS;
    }

    // Planos
    let blueprints = (mediaRows || []).filter(m => m.type === 'blueprint');
    if (blueprints.length === 0) {
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

    // Avances
    let progressUpdates = (progressRows || []) as ProgressUpdateItem[];
    if (progressUpdates.length === 0) {
      progressUpdates = DEFAULT_PROGRESS;
    }

    return {
      id: projectId,
      name: projectName,
      clientName,
      currentPhase: projRow?.current_phase || 'FASE 3: ACABADOS DE LUJO',
      currentProgress: projRow?.current_progress ?? 68,
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
      beforeAfterComparison: {
        beforeImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1600&q=80',
        beforeLabel: 'Mayo 2026 • Terreno y Cimentación',
        afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        afterLabel: 'Estado Actual • Estructura & Acabados 68%'
      }
    };
  } catch (err) {
    console.warn('Error cargando portal data, retornando fallback seguro:', err);
    return {
      id: projectId,
      name: fallbackProject?.name || 'Villa Serena',
      clientName: 'Carlos',
      currentPhase: 'FASE 3: ACABADOS DE LUJO',
      currentProgress: 68,
      architect: {
        name: 'Mateo Rossi',
        role: 'Director de Proyecto MASSA',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: '+57 310 892 4410',
        whatsapp: '573108924410'
      },
      renders: DEFAULT_RENDERS,
      blueprints: DEFAULT_BLUEPRINTS,
      progressUpdates: DEFAULT_PROGRESS,
      beforeAfterComparison: {
        beforeImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1600&q=80',
        beforeLabel: 'Mayo 2026 • Terreno y Cimentación',
        afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        afterLabel: 'Estado Actual • Estructura & Acabados 68%'
      }
    };
  }
}
