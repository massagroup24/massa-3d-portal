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
}

export const projectsData: Record<string, Project> = {
  'edinson-jejen': {
    id: 'edinson-jejen',
    name: 'EDINSON JEJEN',
    description: 'Proyecto residencial con acabados modernos, iluminación natural y espacios integrados.',
    thumbnail: '/3ER PISO 360.png', // Usamos la primera toma como portada del proyecto
    minimapImage: '/PLANO.jpg', 
    initialRoomId: 'tercer_piso',
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
