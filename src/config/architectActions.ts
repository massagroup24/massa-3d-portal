import { ComponentType } from 'react';
import { 
  Building2, 
  Compass, 
  Users, 
  Camera
} from 'lucide-react';

export type ActionKey = 'projects' | 'new_tour' | 'users' | 'upload_progress';

export interface ArchitectAction {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  actionKey: ActionKey;
  enabled: boolean;
  badge?: string;
  description?: string;
  image: string;
}

/**
 * Lista de configuración de acciones del carrusel 3D del Inicio.
 * Para agregar o quitar acciones, solo se añade o edita un elemento en esta lista.
 */
export const ARCHITECT_ACTIONS: ArchitectAction[] = [
  {
    id: 'proyectos',
    title: 'Proyectos',
    subtitle: 'Catálogo & Estado',
    icon: Building2,
    actionKey: 'projects',
    enabled: true,
    description: 'Gestiona proyectos en proceso y terminados',
    image: '/images/cards/card_projects.jpg'
  },
  {
    id: 'nuevo-recorrido',
    title: 'Nuevo Recorrido 360°',
    subtitle: 'Creador Espacial 3D',
    icon: Compass,
    actionKey: 'new_tour',
    enabled: true,
    description: 'Inicia y configura un nuevo recorrido virtual',
    image: '/images/cards/card_tour_360.jpg'
  },
  {
    id: 'usuarios',
    title: 'Usuarios',
    subtitle: 'Accesos & Seguridad',
    icon: Users,
    actionKey: 'users',
    enabled: true,
    description: 'Base de datos de clientes y arquitectos',
    image: '/images/cards/card_users.jpg'
  },
  {
    id: 'subir-avance',
    title: 'Subir Avance',
    subtitle: 'Bitácora en Terreno',
    icon: Camera,
    actionKey: 'upload_progress',
    enabled: false,
    badge: 'Próximamente',
    description: 'Subida directa de avances fotográficos',
    image: '/images/cards/card_progress.jpg'
  }
];
