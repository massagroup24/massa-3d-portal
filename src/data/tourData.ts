export interface Hotspot {
  id: string;
  position: [number, number, number];
  targetRoom: string; // The ID of the room this hotspot leads to
  label: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  hotspots: Hotspot[];
  // Coordenadas X e Y (en porcentaje, 0 a 100) para posicionar el punto en el plano 2D
  minimapPosition: { x: number; y: number };
}

export interface Project {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  minimapImage: string;
  initialRoomId: string;
  rooms: Record<string, Room>;
  pin?: string; // PIN de seguridad para acceder al Creador Visual
  status?: 'in_progress' | 'completed'; // Estado: en proceso o terminado
  clientName?: string; // Nombre del cliente propietario
  phase?: string; // Fase actual del proyecto
  progress?: number; // Porcentaje de avance de obra (0 a 100)
}

export const projectsData: Record<string, Project> = {
  'marquimoda': {
    id: 'marquimoda',
    name: 'MARQUIMODA',
    description: 'Sede corporativa y oficinas de diseño con espacios diáfanos, áreas directivas y arquitectura biofílica.',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    minimapImage: '/PLANO.jpg',
    initialRoomId: 'sede_corporativa',
    status: 'in_progress',
    clientName: 'MarquiModa S.A.',
    phase: 'Fase 3: Mobiliario & Biofilia',
    progress: 78,
    rooms: {
      sede_corporativa: {
        id: 'sede_corporativa',
        name: 'Sede Corporativa & Open Space',
        description: 'Planta abierta de diseño y trabajo colaborativo.',
        imageUrl: '/3ER PISO 360.png',
        minimapPosition: { x: 50, y: 50 },
        hotspots: []
      }
    }
  },
  'edinson-jejen': {
    id: 'edinson-jejen',
    name: 'EDINSON JEJEN',
    description: 'Proyecto residencial con acabados modernos, iluminación natural y espacios integrados.',
    thumbnail: '/3ER PISO 360.png', // Usamos la primera toma como portada del proyecto
    minimapImage: '/PLANO.jpg', 
    initialRoomId: 'tercer_piso',
    status: 'in_progress',
    clientName: 'Edinson Jején',
    phase: 'Fase 4: Acabados & Iluminación',
    progress: 92,
    rooms: {
      tercer_piso: {
        id: 'tercer_piso',
        name: '3er Piso',
        description: 'Vista general del tercer piso.',
        imageUrl: '/3ER PISO 360.png', 
        minimapPosition: { x: 50, y: 50 }, 
        hotspots: [
          {
            id: 'h-turco',
            position: [10, -1, 5],
            targetRoom: 'bano_turco',
            label: 'Ir al Baño Turco'
          },
          {
            id: 'h-wc',
            position: [-10, -1, 5],
            targetRoom: 'tercer_piso_wc',
            label: 'Ir al WC'
          }
        ]
      },
      bano_turco: {
        id: 'bano_turco',
        name: 'Baño Turco',
        description: 'Vista principal del baño turco.',
        imageUrl: '/Baño turco 360.png',
        minimapPosition: { x: 30, y: 30 },
        hotspots: [
          {
            id: 'h-turco-2',
            position: [5, 0, -10],
            targetRoom: 'bano_turco_2',
            label: 'Ver otro ángulo'
          },
          {
            id: 'h-tercer-piso',
            position: [-10, 0, 0],
            targetRoom: 'tercer_piso',
            label: 'Volver al pasillo'
          }
        ]
      },
      bano_turco_2: {
        id: 'bano_turco_2',
        name: 'Baño Turco (Ángulo 2)',
        description: 'Segunda vista del baño turco.',
        imageUrl: '/Baño turco 360 2.png',
        minimapPosition: { x: 32, y: 28 }, 
        hotspots: [
          {
            id: 'h-turco-1',
            position: [-5, 0, 10],
            targetRoom: 'bano_turco',
            label: 'Volver al ángulo 1'
          }
        ]
      },
      bano_v3: {
        id: 'bano_v3',
        name: 'Baño V3',
        description: 'Vista del baño V3.',
        imageUrl: '/Baño V3.png',
        minimapPosition: { x: 70, y: 30 },
        hotspots: [
          {
            id: 'h-tercer-piso',
            position: [0, 0, 10],
            targetRoom: 'tercer_piso',
            label: 'Volver al 3er Piso'
          }
        ]
      },
      tercer_piso_wc: {
        id: 'tercer_piso_wc',
        name: 'WC Tercer Piso',
        description: 'Vista del cuarto de baño.',
        imageUrl: '/Tercer piso WC 360.png',
        minimapPosition: { x: 60, y: 70 },
        hotspots: [
          {
            id: 'h-tercer-piso',
            position: [0, 0, 10],
            targetRoom: 'tercer_piso',
            label: 'Volver al 3er Piso'
          }
        ]
      }
    }
  }
};

/**
 * Normaliza defensivamente un proyecto garantizando retrocompatibilidad con tours antiguos.
 */
export function normalizeProject(raw: any): Project {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `project_${Date.now()}`,
      name: 'Proyecto',
      description: '',
      thumbnail: '',
      minimapImage: '',
      initialRoomId: 'room_1',
      rooms: {
        room_1: {
          id: 'room_1',
          name: 'Habitación Inicial',
          description: '',
          imageUrl: '',
          minimapPosition: { x: 50, y: 50 },
          hotspots: []
        }
      }
    };
  }

  const id = String(raw.id || `project_${Date.now()}`);
  const name = String(raw.name || 'Proyecto sin título');
  const description = String(raw.description || '');
  const thumbnail = String(raw.thumbnail || '');
  const minimapImage = String(raw.minimapImage || '');

  const rawRooms = raw.rooms && typeof raw.rooms === 'object' ? raw.rooms : {};
  const rooms: Record<string, Room> = {};

  for (const [roomId, roomData] of Object.entries<any>(rawRooms)) {
    if (!roomData) continue;
    const hotspots: Hotspot[] = Array.isArray(roomData.hotspots)
      ? roomData.hotspots
          .filter((h: any) => h && Array.isArray(h.position) && h.position.length === 3)
          .map((h: any) => ({
            id: String(h.id || `h_${Math.random()}`),
            position: [
              Number(h.position[0]) || 0,
              Number(h.position[1]) || 0,
              Number(h.position[2]) || 0
            ] as [number, number, number],
            targetRoom: String(h.targetRoom || ''),
            label: String(h.label || '')
          }))
      : [];

    rooms[roomId] = {
      id: roomId,
      name: String(roomData.name || 'Habitación'),
      description: String(roomData.description || ''),
      imageUrl: String(roomData.imageUrl || ''),
      minimapPosition: {
        x: typeof roomData.minimapPosition?.x === 'number' ? roomData.minimapPosition.x : 50,
        y: typeof roomData.minimapPosition?.y === 'number' ? roomData.minimapPosition.y : 50,
      },
      hotspots
    };
  }

  const roomKeys = Object.keys(rooms);
  const initialRoomId = raw.initialRoomId && rooms[raw.initialRoomId]
    ? raw.initialRoomId
    : (roomKeys[0] || 'room_1');

  return {
    id,
    name,
    description,
    thumbnail,
    minimapImage,
    initialRoomId,
    rooms,
    pin: raw.pin,
    status: raw.status || 'in_progress',
    clientName: raw.clientName || '',
    phase: raw.phase || 'Fase 3: Ejecución',
    progress: typeof raw.progress === 'number' ? raw.progress : 75
  };
}

