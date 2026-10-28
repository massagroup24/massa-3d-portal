/**
 * Configuración de Identidad Visual para Proyectos MASSA
 * Cada proyecto cuenta con su propia identidad cromática, tipográfica y de recursos
 * para sentirse como una nueva web independiente al abrirse en una pestaña nueva.
 */

export interface ProjectTheme {
  primaryColor: string;     // Color de acento primario (ej. #9CD01A)
  primaryHover: string;     // Color hover de acento (ej. #ABDE24)
  accentGlow: string;       // Resplandor / sombra ambiental (ej. rgba(156,208,26,0.25))
  bgColor: string;          // Fondo base profundo (ej. #08090C)
  surfaceColor: string;     // Color de paneles / tarjetas de cristal
  borderColor: string;      // Bordes de interfaz
  badgeBg: string;          // Fondo de la píldora de obra
  badgeText: string;        // Color de texto de la píldora de obra
  fontFamilyTitle: string;  // Tipografía para el título monumental
  fontFamilyBody: string;   // Tipografía de lectura
}

export interface ProjectRender {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

export interface ProjectIdentity {
  id: string;
  slug: string;
  code: string;             // Ej: 'OBRA 04'
  name: string;             // Ej: 'HACIENDA F22'
  categoryLabel: string;    // Ej: 'RESIDENCIA CAMPESTRE LUXURY'
  urbanization: string;     // Ej: 'CONDOMINIO HACIENDA'
  lot: string;              // Ej: 'LOTE F22'
  location: string;         // Ej: 'CÚCUTA / NORTE DE SANTANDER'
  locationFull: string;     // Ej: 'CÚCUTA / NORTE DE SANTANDER • CONDOMINIO HACIENDA • LOTE F22'
  statusBadge: string;      // Ej: '360° ACTIVO'
  statusLabel: string;      // Ej: 'En Preventa & Diseño'
  brandName: string;        // Ej: 'MASSA HOME'
  tagline: string;          // Breve memoria conceptual
  heroVideoUrl: string;     // Video horizontal principal de la primera pantalla
  heroVideoPoster?: string; // Poster o fallback del video
  theme: ProjectTheme;
  specs: {
    areaBuilt: string;
    lotArea: string;
    bedrooms: number;
    bathrooms: number;
    parkingSpaces: number;
    modality: string;
    levels: string;
  };
  tourEmbedUrl?: string;    // URL para incrustar el Gemelo Digital 360° (Matterport, Kuula, CloudPano, etc.)
  renders: ProjectRender[];
}

// Colección completa de los 33 renders arquitectónicos de HACIENDA F22 con proporciones nativas exactas
export const HACIENDA_F22_RENDERS: ProjectRender[] = [
  // 1. FACHADAS & EXTERIORES (8)
  {
    id: 'f22-fachada-dron',
    title: 'Vista Aérea Panorámica Dron & Entorno',
    url: '/HACIENDA F22/FACHADA DRON.png',
    category: 'Fachada & Exteriores',
    description: 'Toma aérea monumental con dron mostrando la implantación en el lote F22, piscina infinity, quincho apergolado y campo de golf.',
    width: 1536,
    height: 1024,
    aspectRatio: 1.50
  },
  {
    id: 'f22-fachada-1',
    title: 'Fachada Principal & Emblema F22',
    url: '/HACIENDA F22/FACHADA.png',
    category: 'Fachada & Exteriores',
    description: 'Volumetría monumental en piedra sinterizada, losa en voladizo e iluminación cálida con emblema F22 retroiluminado.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-fachada-2',
    title: 'Perspectiva Escultórica Frontal',
    url: '/HACIENDA F22/FACHADA 2.png',
    category: 'Fachada & Exteriores',
    description: 'Geometría pura de volúmenes desfasados, pérgola en concreto y celosías de privacidad.',
    width: 1446,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-3',
    title: 'Iluminación Crepuscular & Paisajismo',
    url: '/HACIENDA F22/FACHADA 3.png',
    category: 'Fachada & Exteriores',
    description: 'Diseño lumínico rasante al atardecer realzando texturas de travertino y jardinería tropical.',
    width: 1446,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-noche-1',
    title: 'Fachada Nocturna & Iluminación Escénica',
    url: '/HACIENDA F22/FACHADA NOCHE.png',
    category: 'Fachada & Exteriores',
    description: 'Composición nocturna de alto impacto con iluminación rasante cálida 2700K y relieve arquitectónico.',
    width: 1446,
    height: 1088,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-noche-2',
    title: 'Perspectiva Nocturna Frontal',
    url: '/HACIENDA F22/FACHADA NOCHE 2.png',
    category: 'Fachada & Exteriores',
    description: 'Visual nocturna frontal que destaca la volumetría de la residencia y su diálogo con el cielo estrellado.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-fachada-trasera-1',
    title: 'Fachada Posterior & Apertura al Patio',
    url: '/HACIENDA F22/FACHADA TRASERA.jpg',
    category: 'Fachada & Exteriores',
    description: 'Grandes paños acristalados de piso a techo que desvanecen los límites con la piscina.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-trasera-2',
    title: 'Perspectiva Posterior & Deck Superior',
    url: '/HACIENDA F22/FACHADA TRASERA 2.jpg',
    category: 'Fachada & Exteriores',
    description: 'Vista diagonal de terrazas y conexión bioclimática cruzada hacia el entorno natural.',
    width: 1619,
    height: 971,
    aspectRatio: 1.67
  },

  // 2. BIENVENIDA & SALÓN DOBLE ALTURA (5)
  {
    id: 'f22-vestibulo-1',
    title: 'Atrio y Vestíbulo de Acceso',
    url: '/HACIENDA F22/VESTIBULO.jpg',
    category: 'Bienvenida & Salón',
    description: 'Pórtico monumental de recibo con puerta pivotante de gran formato y muro en madera noble.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-vestibulo-2',
    title: 'Detalle Arquitectónico de Entrada',
    url: '/HACIENDA F22/VESTIBULO 2.jpg',
    category: 'Bienvenida & Salón',
    description: 'Transición entre exterior e interior con iluminación escenográfica vertical.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-sala-1',
    title: 'Gran Salón Monumental & Doble Altura',
    url: '/HACIENDA F22/SALA.jpg',
    category: 'Bienvenida & Salón',
    description: 'Espacio central de doble altura con sofá orgánico bouclé, escalera flotante en madera y puente mezzanine.',
    width: 1671,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-sala-2',
    title: 'Perspectiva de Doble Altura & Mezzanine',
    url: '/HACIENDA F22/SALA 2.jpg',
    category: 'Bienvenida & Salón',
    description: 'Juego de luces cenitales y sombras proyectadas a través de la pasarela acristalada superior.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-sala-3',
    title: 'Comedor Formal & Integración Espacial',
    url: '/HACIENDA F22/SALA 3.png',
    category: 'Bienvenida & Salón',
    description: 'Mesa de comedor en roble natural integrada con visual abierta hacia los jardines.',
    width: 1521,
    height: 1034,
    aspectRatio: 1.47
  },

  // 3. COCINA DE AUTOR (3)
  {
    id: 'f22-cocina-1',
    title: 'Cocina de Chef con Isla de Cuarcita',
    url: '/HACIENDA F22/COCINA.jpg',
    category: 'Cocina de Autor',
    description: 'Isla monolítica en cuarcita exótica, campana oculta y lámpara escultórica suspendida en ondas doradas.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-cocina-2',
    title: 'Cava de Vinos & Vitrina de Cristal',
    url: '/HACIENDA F22/COCINA 2.jpg',
    category: 'Cocina de Autor',
    description: 'Mueble vertical acanalado en madera con iluminación perimetral para cristalería y vinos selectos.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-cocina-3',
    title: 'Perspectiva Integral de Cocina Gourmet',
    url: '/HACIENDA F22/COCINA 3.jpg',
    category: 'Cocina de Autor',
    description: 'Diálogo armónico entre la barra de desayuno, el piso travertino y carpintería oculta.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },

  // 4. PISCINA & BBQ (4)
  {
    id: 'f22-piscina-1',
    title: 'Piscina Turquesa & Muros de Travertino',
    url: '/HACIENDA F22/PISCINA.jpg',
    category: 'Piscina & BBQ',
    description: 'Piscina desbordante con zona de bronceado, jacuzzi y muros perimetrales con cinta LED rasante.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-piscina-2',
    title: 'Espejo de Agua al Atardecer',
    url: '/HACIENDA F22/PISCINA 2.jpg',
    category: 'Piscina & BBQ',
    description: 'Atardecer dorado reflejado sobre el agua con pabellón exterior iluminado.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-terraza-1',
    title: 'Pabellón Gourmet / Quincho de Chef',
    url: '/HACIENDA F22/TERRAZA.png',
    category: 'Piscina & BBQ',
    description: 'Cocina exterior cubierta con asador BBQ empotrado, cava de frío y comedor al aire libre.',
    width: 1448,
    height: 1086,
    aspectRatio: 1.33
  },
  {
    id: 'f22-terraza-2',
    title: 'Lounge Apergolado en Teca',
    url: '/HACIENDA F22/TERRAZA 2.jpg',
    category: 'Piscina & BBQ',
    description: 'Estructura apergolada con ventilación natural y living exterior para veladas privadas.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },

  // 5. ENTRETENIMIENTO & HOME OFFICE (4)
  {
    id: 'f22-tv-1',
    title: 'Family Lounge & Media Room',
    url: '/HACIENDA F22/SALA TV.jpg',
    category: 'Entretenimiento & Estudio',
    description: 'Ambiente íntimo de descanso con panelado en madera acústica e iluminación indirecta cálida.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-tv-2',
    title: 'Sala de Cine y TV Familiar',
    url: '/HACIENDA F22/SALA TV 2.jpg',
    category: 'Entretenimiento & Estudio',
    description: 'Mobiliario envolvente low-profile diseñado para el relax total de la familia.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-tv-3',
    title: 'Detalle de Texturas y Boiserie Contemporánea',
    url: '/HACIENDA F22/SALA TV 3.jpg',
    category: 'Entretenimiento & Estudio',
    description: 'Carpintería artesanal a medida con hornacinas iluminadas y detalles en bronce.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-oficina-1',
    title: 'Home Office / Estudio de Dirección',
    url: '/HACIENDA F22/OFICINA.jpg',
    category: 'Entretenimiento & Estudio',
    description: 'Despacho privado de alto estándar con aislamiento acústico y luz natural directa.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },

  // 6. SUITES PRIVADAS, VESTIER & BAÑOS SPA (9)
  {
    id: 'f22-dormitorio-1',
    title: 'Master Suite Presidencial',
    url: '/HACIENDA F22/DORMITORIO.jpg',
    category: 'Suites & Baños Spa',
    description: 'Habitación principal con cabecero en lino cálido, ranura de luz vertical 2700K y terraza privada.',
    width: 1522,
    height: 1033,
    aspectRatio: 1.47
  },
  {
    id: 'f22-dormitorio-2',
    title: 'Perspectiva de Suite Principal',
    url: '/HACIENDA F22/DORMITORIO 2.jpg',
    category: 'Suites & Baños Spa',
    description: 'Cama suspendida, ventanales de piso a techo y texturas serenas de relajación.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-habitacion-1',
    title: 'Suite Familiar 01',
    url: '/HACIENDA F22/HABITACION.jpg',
    category: 'Suites & Baños Spa',
    description: 'Dormitorio secundario con baño privado, acabados neutros y armarios integrados.',
    width: 1536,
    height: 1024,
    aspectRatio: 1.50
  },
  {
    id: 'f22-habitacion-2',
    title: 'Suite de Huéspedes 02',
    url: '/HACIENDA F22/HABITACION 2.jpg',
    category: 'Suites & Baños Spa',
    description: 'Espacio sereno con control solar pasivo y luz matutina indirecta.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-habitacion-3',
    title: 'Suite Panorámica 03',
    url: '/HACIENDA F22/HABITACION 3.jpg',
    category: 'Suites & Baños Spa',
    description: 'Habitación con vista perimetral y salida a balcón superior.',
    width: 1448,
    height: 1086,
    aspectRatio: 1.33
  },
  {
    id: 'f22-vestier-1',
    title: 'Walk-in Closet Presidencial',
    url: '/HACIENDA F22/VESTIER.jpg',
    category: 'Suites & Baños Spa',
    description: 'Vestier tipo boutique con vitrinas de vidrio ahumado, iluminación interna y módulo de accesorios.',
    width: 941,
    height: 1672,
    aspectRatio: 0.56 // Vertical / Portrait
  },
  {
    id: 'f22-bano-1',
    title: 'Master Bath & Spa',
    url: '/HACIENDA F22/BANO.jpg',
    category: 'Suites & Baños Spa',
    description: 'Baño principal en mármol con doble lavamanos flotante, espejos con halo LED y grifería negro mate.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-bano-2',
    title: 'Ducha Pluvial de Gran Formato & Cabina Spa',
    url: '/HACIENDA F22/BANO 2.png',
    category: 'Suites & Baños Spa',
    description: 'Zona de ducha húmeda con nicho empotrado y acabado en piedra natural.',
    width: 1521,
    height: 1034,
    aspectRatio: 1.47
  },
  {
    id: 'f22-bano-3',
    title: 'Tocador & Baño Secundario',
    url: '/HACIENDA F22/BANO 3.jpg',
    category: 'Suites & Baños Spa',
    description: 'Mobiliario de baño en roble alistonado y encimera pulida de fácil mantenimiento.',
    width: 1521,
    height: 1034,
    aspectRatio: 1.47
  }
];

// Registro oficial de identidades de proyecto
export const PROJECT_IDENTITIES: Record<string, ProjectIdentity> = {
  // PROYECTO 1: HACIENDA F22 (Identidad independiente de alta gama)
  'project_hacienda_f22': {
    id: 'project_hacienda_f22',
    slug: 'hacienda-f22',
    code: 'F22',
    name: 'HACIENDA F22',
    categoryLabel: 'RESIDENCIA CAMPESTRE DE AUTOR',
    urbanization: 'CONDOMINIO HACIENDA',
    lot: 'LOTE F22',
    location: 'CÚCUTA / NORTE DE SANTANDER',
    locationFull: 'CÚCUTA / NORTE DE SANTANDER • CONDOMINIO HACIENDA • LOTE F22',
    statusBadge: 'PROYECTO EJECUTIVO • PREVENTA',
    statusLabel: 'Diseño Aprobado • Listo para Construcción',
    brandName: 'RESIDENCIA F22',
    tagline: 'Escultura habitable concebida en diálogo entre volúmenes en voladizo, travertino natural, cuarcita exótica y un oasis exterior con piscina desbordante y pabellón gourmet.',
    heroVideoUrl: '/VIDEO H4.mp4',
    heroVideoPoster: '/HACIENDA F22/FACHADA.png',
    theme: {
      primaryColor: '#D4A359',        // Oro champaña / ámbar cálido extraído de la iluminación de la fachada
      primaryHover: '#E5B76C',
      accentGlow: 'rgba(212, 163, 89, 0.35)',
      bgColor: '#08080A',
      surfaceColor: 'rgba(18, 18, 23, 0.85)',
      borderColor: 'rgba(212, 163, 89, 0.22)',
      badgeBg: '#D4A359',
      badgeText: '#0A0A0C',
      fontFamilyTitle: "'Syne', 'Montserrat', 'Inter', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    specs: {
      areaBuilt: '560 m²',
      lotArea: '1.200 m² (Lote F22)',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 4,
      modality: 'Llave en Mano / Obra Privada',
      levels: '2 Plantas + Rooftop Mirador'
    },
    renders: HACIENDA_F22_RENDERS
  },

  // PROYECTO 2: IBIZA A14 (Obra 02)
  'project_ibiza_a14': {
    id: 'project_ibiza_a14',
    slug: 'ibiza-a14',
    code: 'OBRA 02',
    name: 'IBIZA A14',
    categoryLabel: 'VILLA CAMPESTRE DE AUTOR',
    urbanization: 'CONDOMINIO IBIZA',
    lot: 'LOTE A14',
    location: 'CÚCUTA / NORTE DE SANTANDER',
    locationFull: 'CÚCUTA / NORTE DE SANTANDER • CONDOMINIO IBIZA • LOTE A14',
    statusBadge: '360° ACTIVO',
    statusLabel: 'En Preventa & Diseño',
    brandName: 'MASSA HOME',
    tagline: 'Concebida para el clima y la luz de Cúcuta. Volumetría horizontal con generosos aleros de protección solar, ventilación bioclimática pasiva e integración fluida.',
    heroVideoUrl: '/VIDEO H4.mp4',
    heroVideoPoster: '',
    theme: {
      primaryColor: '#9CD01A',
      primaryHover: '#ABDE24',
      accentGlow: 'rgba(156, 208, 26, 0.28)',
      bgColor: '#08090C',
      surfaceColor: 'rgba(18, 19, 24, 0.75)',
      borderColor: 'rgba(156, 208, 26, 0.22)',
      badgeBg: '#9CD01A',
      badgeText: '#000000',
      fontFamilyTitle: "'Syne', 'Montserrat', 'Inter', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    specs: {
      areaBuilt: 'Por definir m²',
      lotArea: 'Lote A14',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 3,
      modality: 'A consultar',
      levels: '2 Plantas + Terraza'
    },
    renders: []
  },

  // PROYECTO 3: RESIDENCIA JEJÉN (Obra 03)
  'project_1781963945215': {
    id: 'project_1781963945215',
    slug: 'edinson-jejen',
    code: 'OBRA 03',
    name: 'RESIDENCIA JEJÉN',
    categoryLabel: 'RESIDENCIA URBANA DE AUTOR',
    urbanization: 'CALI EXCLUSIVO',
    lot: 'LOTE 07',
    location: 'CALI / VALLE DEL CAUCA',
    locationFull: 'CALI / VALLE DEL CAUCA • CALI EXCLUSIVO • OBRA DE AUTOR',
    statusBadge: 'TOUR 360° EN VIVO',
    statusLabel: 'En Ejecución • 92% Avance',
    brandName: 'MASSA HOME',
    tagline: 'Casa contemporánea de triple altura con spa turco, ventanales motorizados y terraza rooftop con jacuzzi panorámico.',
    heroVideoUrl: '/VIDEO H4.mp4',
    heroVideoPoster: '/images/projects/edinson_jejen_terraza.jpg',
    theme: {
      primaryColor: '#9CD01A',
      primaryHover: '#ABDE24',
      accentGlow: 'rgba(156, 208, 26, 0.3)',
      bgColor: '#08090C',
      surfaceColor: 'rgba(23, 23, 23, 0.8)',
      borderColor: 'rgba(156, 208, 26, 0.3)',
      badgeBg: '#9CD01A',
      badgeText: '#000000',
      fontFamilyTitle: "'Syne', 'Montserrat', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    specs: {
      areaBuilt: '420 m²',
      lotArea: '550 m²',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 3,
      modality: 'Obra Privada',
      levels: '3 Niveles'
    },
    renders: []
  },

  // PROYECTO 4: SEDE MARQUIMODA (Obra 04)
  'project_1782912175010': {
    id: 'project_1782912175010',
    slug: 'marquimoda',
    code: 'OBRA 04',
    name: 'SEDE MARQUIMODA',
    categoryLabel: 'SEDE CORPORATIVA & ATELIER',
    urbanization: 'DISTRITO EMPRESARIAL',
    lot: 'SECTOR INDUSTRIAL',
    location: 'VALLE DEL CAUCA',
    locationFull: 'VALLE DEL CAUCA • DISTRITO EMPRESARIAL • ATELIER DE ALTA COSTURA',
    statusBadge: 'TOUR 360° ACTIVO',
    statusLabel: 'En Obra • 78% Avance',
    brandName: 'MASSA HOME',
    tagline: 'Sede corporativa y atelier de alta costura con arquitectura bioclimática pasiva y fachada con lamas en aluminio anodizado.',
    heroVideoUrl: '/VIDEO H4.mp4',
    heroVideoPoster: '/images/projects/marquimoda_isometria.webp',
    theme: {
      primaryColor: '#9CD01A',
      primaryHover: '#ABDE24',
      accentGlow: 'rgba(156, 208, 26, 0.3)',
      bgColor: '#08090C',
      surfaceColor: 'rgba(23, 23, 23, 0.8)',
      borderColor: 'rgba(156, 208, 26, 0.3)',
      badgeBg: '#9CD01A',
      badgeText: '#000000',
      fontFamilyTitle: "'Syne', 'Montserrat', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    specs: {
      areaBuilt: '620 m²',
      lotArea: '800 m²',
      bedrooms: 0,
      bathrooms: 6,
      parkingSpaces: 8,
      modality: 'Inversión Comercial',
      levels: '2 Plantas + Atrio Central'
    },
    renders: []
  }
};

/**
 * Resuelve la identidad visual completa de un proyecto.
 * Si el proyecto fue creado dinámicamente o aún no tiene perfil estático,
 * sintetiza una identidad visual coherente y elegante con fallback defensivo.
 */
export function getProjectIdentity(idOrSlug?: string): ProjectIdentity {
  if (!idOrSlug) return PROJECT_IDENTITIES['project_hacienda_f22'];

  const normalized = idOrSlug.trim().toLowerCase();

  // Búsqueda directa o por alias
  if (PROJECT_IDENTITIES[idOrSlug]) return PROJECT_IDENTITIES[idOrSlug];

  for (const key of Object.keys(PROJECT_IDENTITIES)) {
    const item = PROJECT_IDENTITIES[key];
    if (
      item.id.toLowerCase() === normalized ||
      item.slug.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized ||
      normalized.includes(item.slug.toLowerCase()) ||
      normalized.includes(item.id.toLowerCase())
    ) {
      return item;
    }
  }

  // Alias específicos conocidos
  if (normalized.includes('hacienda')) return PROJECT_IDENTITIES['project_hacienda_f22'];
  if (normalized.includes('ibiza')) return PROJECT_IDENTITIES['project_ibiza_a14'];
  if (normalized.includes('jejen') || normalized.includes('edinson')) return PROJECT_IDENTITIES['project_1781963945215'];
  if (normalized.includes('marquimoda')) return PROJECT_IDENTITIES['project_1782912175010'];

  // Identidad dinámica por defecto
  const cleanedTitle = idOrSlug
    .replace(/^project_/, '')
    .replace(/[_-]/g, ' ')
    .toUpperCase();

  return {
    id: idOrSlug,
    slug: idOrSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    code: 'OBRA MASSA',
    name: cleanedTitle,
    categoryLabel: 'RESIDENCIA DE AUTOR',
    urbanization: 'ZONA EXCLUSIVA',
    lot: 'LOTE PRIVADO',
    location: 'COLOMBIA',
    locationFull: `COLOMBIA • ZONA EXCLUSIVA • ${cleanedTitle}`,
    statusBadge: 'PROYECTO EN VIVO',
    statusLabel: 'En Desarrollo & Diseño',
    brandName: 'MASSA HOME',
    tagline: 'Residencia arquitectónica de autor con diseño bioclimático e ingeniería de precisión por MASSA GROUP.',
    heroVideoUrl: '/VIDEO H4.mp4',
    theme: {
      primaryColor: '#9CD01A',
      primaryHover: '#ABDE24',
      accentGlow: 'rgba(156, 208, 26, 0.25)',
      bgColor: '#08090C',
      surfaceColor: 'rgba(18, 19, 24, 0.75)',
      borderColor: 'rgba(156, 208, 26, 0.20)',
      badgeBg: '#9CD01A',
      badgeText: '#000000',
      fontFamilyTitle: "'Syne', 'Montserrat', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    specs: {
      areaBuilt: 'Por definir m²',
      lotArea: 'Por definir',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 3,
      modality: 'A consultar',
      levels: '2 Plantas'
    },
    renders: []
  };
}

/**
 * Abre el proyecto en una pestaña nueva con su URL dedicada.
 */
export function openProjectInNewTab(projectId: string) {
  const identity = getProjectIdentity(projectId);
  const targetSlug = identity.slug || identity.id || projectId;
  const url = `/proyecto/${encodeURIComponent(targetSlug)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
