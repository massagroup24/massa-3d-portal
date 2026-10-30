/**
 * Configuración de Identidad Visual para Proyectos MASSA
 * Cada proyecto cuenta con su propia identidad cromática, tipográfica y de recursos
 * para sentirse como una nueva web independiente al abrirse en una pestaña nueva.
 */

export interface ProjectTheme {
  primaryColor: string;     // Color de acento primario (ej. #9CD01A o #DFC47B)
  primaryHover: string;     // Color hover de acento (ej. #ABDE24 o #F1E29B)
  accentGlow: string;       // Resplandor / sombra ambiental
  bgColor: string;          // Fondo base profundo
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

export interface ClientBrandConfig {
  companyName: string;
  shortName: string;
  subtitle: string;
  tagline: string;
  logoHorizontalWhite: string;
  logoHorizontalDark: string;
  logoVerticalWhite: string;
  logoVerticalDark: string;
  logoIcon: string;
  metallicGradient: string;
}

export interface ProjectLevelInfo {
  id: string;
  label: string;
  area: string;
  height: string;
  summary: string;
  spaces: string[];
}

export interface ProjectHotspot360 {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  targetRoomId?: string;
}

export interface ProjectRoom360 {
  id: string;
  name: string;
  level: string;
  area: string;
  materials: string;
  previewUrl: string;
  hotspots: ProjectHotspot360[];
}

export interface ProjectIdentity {
  id: string;
  slug: string;
  code: string;             // Ej: 'F22' o 'A14'
  name: string;             // Ej: 'HACIENDA F22' o 'IBIZA A14'
  titlePrefix: string;      // Ej: 'HACIENDA' o 'IBIZA'
  titleHighlight: string;   // Ej: 'F22' o 'A14'
  categoryLabel: string;    // Ej: 'RESIDENCIA CAMPESTRE DE AUTOR'
  urbanization: string;     // Ej: 'CONDOMINIO HACIENDA' o 'CONDOMINIO IBIZA'
  lot: string;              // Ej: 'LOTE F22' o 'LOTE A14'
  location: string;         // Ej: 'CÚCUTA / NORTE DE SANTANDER'
  locationFull: string;     // Ej: 'CÚCUTA / NORTE DE SANTANDER • CONDOMINIO HACIENDA • LOTE F22'
  statusBadge: string;      // Ej: 'AMHO CONSTRUCCIONES • OBRA EXCLUSIVA'
  statusLabel: string;      // Ej: 'Diseño Aprobado • Listo para Construcción'
  brandName: string;        // Ej: 'AMHO CONSTRUCCIONES' o 'MASSA HOME'
  tagline: string;          // Breve memoria conceptual
  heroVideoUrl: string;     // Video horizontal principal de la primera pantalla
  heroVideoPoster?: string; // Poster o fallback del video
  theme: ProjectTheme;
  clientBrand?: ClientBrandConfig;
  specs: {
    areaBuilt: string;
    lotArea: string;
    lotMetricValue?: string;
    suitesLabel?: string;
    wellnessLabel?: string;
    bedrooms: number;
    bathrooms: number;
    parkingSpaces: number;
    modality: string;
    levels: string;
  };
  tourEmbedUrl?: string;    // URL para incrustar el Gemelo Digital 360°
  renders: ProjectRender[];
  levels?: ProjectLevelInfo[];
  rooms360?: ProjectRoom360[];
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
    title: 'Game Room & Sala de TV Integrada',
    url: '/HACIENDA F22/SALA TV 3.png',
    category: 'Entretenimiento & Estudio',
    description: 'Espacio de entretenimiento con mesa de ping-pong de diseño, sala de TV al fondo e iluminación lineal perimetral en plafón.',
    width: 1254,
    height: 1114,
    aspectRatio: 1.13
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

export const HACIENDA_F22_LEVELS: ProjectLevelInfo[] = [
  {
    id: 'nivel-1',
    label: 'Planta Piso 1 • Social, Deck & Piscina',
    area: '340 m² + 220 m² Terrazas',
    height: 'Doble altura 6.20 m en salón principal',
    summary: 'Integración total entre el atrio de acceso con espejo de agua, gran salón de doble altura, cocina de autor con isla de cuarcita y apertura total hacia la piscina infinity y el quincho apergolado.',
    spaces: [
      'Pórtico de acceso con espejo de agua y puerta pivotante de 3.20 m',
      'Gran Salón-Comedor en doble altura con ventanales corredizos ocultos',
      'Cocina de Chef con isla monolítica, cava climatizada y despensa oculta',
      'Home Office / Estudio privado con vista al jardín frontal',
      'Piscina desbordante climatizada, Jacuzzi y Deck en madera teca',
      'Pabellón BBQ / Quincho gourmet cubierto con baño social exterior',
      'Garaje cubierto para 4 vehículos + cuarto de máquinas y zona de servicio'
    ]
  },
  {
    id: 'nivel-2',
    label: 'Planta Piso 2 • Suites Privadas & Mezzanine',
    area: '220 m²',
    height: 'Altura libre 3.20 m',
    summary: 'Ala residencial íntima conectada por un puente-galería flotante con baranda en cristal templado y vistas sobre la doble altura del salón y la piscina.',
    spaces: [
      'Master Suite Presidencial (68 m²) con terraza privada hacia el jardín',
      'Walk-in Closet tipo boutique con iluminación LED integrada e isla central',
      'Master Bath tipo Spa con doble ducha pluvial, tina exenta y mármol sinterizado',
      '3 Suites secundarias, cada una con vestier independiente, baño privado y balcón',
      'Sala de TV / Family Lounge insonorizado con iluminación indirecta'
    ]
  },
  {
    id: 'nivel-3',
    label: 'Planta Piso 3 • Sky Lounge & Mirador 360°',
    area: '110 m²',
    height: 'Cielo abierto 360°',
    summary: 'Espacio contemplativo superior para atardeceres sobre el Condominio Hacienda, equipado con preinstalación solar fotovoltaica y lounge de fuego.',
    spaces: [
      'Sky Lounge & Firepit para reuniones nocturnas bajo las estrellas',
      'Mirador panorámico 360° hacia los cerros de Cúcuta',
      'Área técnica aislada acústicamente para equipos VRF y paneles solares'
    ]
  }
];

export const HACIENDA_F22_ROOMS_360: ProjectRoom360[] = [
  {
    id: 'room_f22_zona_social',
    name: 'Oasis Exterior & Piscina Infinity',
    level: 'Planta Nivel 1 • Exterior',
    area: '220 m² Exteriores',
    materials: 'Deck en madera teca, piedra Bali en piscina, muros travertino y jacuzzi climatizado',
    previewUrl: '/HACIENDA F22/360/ZONA SOCIAL.jpg',
    hotspots: [
      { id: 'hs-zs-1', label: 'Piscina Infinity & Jacuzzi', detail: 'Espejo de agua desbordante con hidromasaje y asoleadero húmedo.', x: 38, y: 64 },
      { id: 'hs-zs-2', label: 'Pabellón Quincho BBQ', detail: 'Conectar con el pabellón de asados cubierto →', x: 22, y: 52, targetRoomId: 'room_f22_bbq' },
      { id: 'hs-zs-3', label: 'Ingresar al Gran Salón', detail: 'Abrir ventanales hacia el salón central →', x: 74, y: 52, targetRoomId: 'room_f22_sala' }
    ]
  },
  {
    id: 'room_f22_bbq',
    name: 'Pabellón BBQ & Quincho Gourmet',
    level: 'Planta Nivel 1 • Exterior Gourmet',
    area: '48 m²',
    materials: 'Pérgola en concreto arquitectónico, asador en acero inox 304 y mesón en granito',
    previewUrl: '/HACIENDA F22/360/BBQ.jpg',
    hotspots: [
      { id: 'hs-bbq-1', label: 'Asador & Campana Integrada', detail: 'Parrilla a gas y carbón con estación de corte y refrigerador bar.', x: 86, y: 54 },
      { id: 'hs-bbq-2', label: 'Deck y Piscina', detail: 'Volver a la piscina desbordante →', x: 52, y: 60, targetRoomId: 'room_f22_zona_social' },
      { id: 'hs-bbq-3', label: 'Ingresar a la Residencia', detail: 'Entrar al salón social →', x: 28, y: 48, targetRoomId: 'room_f22_sala' }
    ]
  },
  {
    id: 'room_f22_sala',
    name: 'Gran Salón de Doble Altura & Comedor',
    level: 'Planta Nivel 1 • Social',
    area: '96 m² (Doble Altura 6.20 m)',
    materials: 'Travertino Fiorito, listones de roble natural, chimenea lineal y cristal laminado',
    previewUrl: '/HACIENDA F22/360/SALA.jpg',
    hotspots: [
      { id: 'hs-s-1', label: 'Chimenea Lineal de Bioetanol', detail: 'Muro central en piedra sinterizada e iluminación perimetral.', x: 50, y: 58 },
      { id: 'hs-s-2', label: 'Cocina de Chef', detail: 'Pasar a la cocina y cava de vinos →', x: 20, y: 52, targetRoomId: 'room_f22_cocina' },
      { id: 'hs-s-3', label: 'Subir a Nivel 2', detail: 'Ir a escaleras flotantes y suites →', x: 62, y: 46, targetRoomId: 'room_f22_escaleras' },
      { id: 'hs-s-4', label: 'Estudio Privado', detail: 'Entrar al despacho ejecutivo →', x: 32, y: 50, targetRoomId: 'room_f22_estudio' },
      { id: 'hs-s-5', label: 'Salir a Piscina', detail: 'Apertura hacia el oasis exterior →', x: 82, y: 52, targetRoomId: 'room_f22_zona_social' }
    ]
  },
  {
    id: 'room_f22_cocina',
    name: 'Cocina de Chef & Cava Climatizada',
    level: 'Planta Nivel 1 • Gastronomía',
    area: '44 m²',
    materials: 'Cuarcita Taj Mahal en cascada, vitrina de vinos con vidrio bronce y carpintería soft-close',
    previewUrl: '/HACIENDA F22/360/COCINA_1.jpg',
    hotspots: [
      { id: 'hs-c-1', label: 'Isla Monolítica en Cascada', detail: 'Cuarcita exótica con estufa de inducción y barra de desayuno.', x: 50, y: 68 },
      { id: 'hs-c-2', label: 'Cava de Vinos Iluminada', detail: 'Vitrina climatizada con control térmico y copero integrado.', x: 28, y: 46 },
      { id: 'hs-c-3', label: 'Volver al Gran Salón', detail: 'Regresar al área social →', x: 42, y: 48, targetRoomId: 'room_f22_sala' },
      { id: 'hs-c-4', label: 'Salir al Deck', detail: 'Acceso directo a terraza y piscina →', x: 74, y: 50, targetRoomId: 'room_f22_zona_social' }
    ]
  },
  {
    id: 'room_f22_estudio',
    name: 'Estudio & Home Office Ejecutivo',
    level: 'Planta Nivel 1 • Despacho',
    area: '24 m²',
    materials: 'Panelado acústico en madera clara, escritorio curvo y biblioteca retroiluminada',
    previewUrl: '/HACIENDA F22/360/ESTUDIO.jpg',
    hotspots: [
      { id: 'hs-est-1', label: 'Escritorio Curvo Flotante', detail: 'Área de trabajo ergonómica con conexiones ocultas y vista al frente.', x: 26, y: 64 },
      { id: 'hs-est-2', label: 'Biblioteca Iluminada', detail: 'Estantería curva con luces led rasantes cálidas 2700K.', x: 48, y: 50 },
      { id: 'hs-est-3', label: 'Salir al Salón', detail: 'Volver al salón central →', x: 88, y: 52, targetRoomId: 'room_f22_sala' }
    ]
  },
  {
    id: 'room_f22_escaleras',
    name: 'Atrio Escultórico & Escalera Flotante',
    level: 'Planta Nivel 1 • Transición',
    area: '32 m²',
    materials: 'Peldaños macizos en madera noble, estructura metálica oculta y vidrio templado',
    previewUrl: '/HACIENDA F22/360/ESCALERAS.jpg',
    hotspots: [
      { id: 'hs-esc-1', label: 'Escalera Flotante', detail: 'Peldaños suspendidos en voladizo sobre jardín interior seco.', x: 50, y: 46 },
      { id: 'hs-esc-2', label: 'Subir al Mezzanine', detail: 'Acceder a Planta Nivel 2 y suites →', x: 50, y: 32, targetRoomId: 'room_f22_pasillo' },
      { id: 'hs-esc-3', label: 'Bajar al Gran Salón', detail: 'Volver a la estancia principal →', x: 22, y: 60, targetRoomId: 'room_f22_sala' }
    ]
  },
  {
    id: 'room_f22_pasillo',
    name: 'Puente Mezzanine & Galería Nivel 2',
    level: 'Planta Nivel 2 • Distribución',
    area: '28 m²',
    materials: 'Pasarela en voladizo con baranda panorámica en cristal y vista sobre el salón',
    previewUrl: '/HACIENDA F22/360/PASILLO 2P.jpg',
    hotspots: [
      { id: 'hs-pas-1', label: 'Visual a Doble Altura', detail: 'Vista aérea privilegiada sobre la sala social y araña de diseño.', x: 32, y: 64 },
      { id: 'hs-pas-2', label: 'Family Room & Juegos', detail: 'Entrar a la sala de entretenimiento →', x: 24, y: 48, targetRoomId: 'room_f22_sala_tv' },
      { id: 'hs-pas-3', label: 'Master Suite Presidencial', detail: 'Ingresar a la suite principal →', x: 50, y: 44, targetRoomId: 'room_f22_master' },
      { id: 'hs-pas-4', label: 'Suite Auxiliar Huéspedes', detail: 'Ir a habitación secundaria →', x: 78, y: 48, targetRoomId: 'room_f22_hab_aux' },
      { id: 'hs-pas-5', label: 'Bajar al Nivel 1', detail: 'Descender por la escalera flotante →', x: 68, y: 62, targetRoomId: 'room_f22_escaleras' }
    ]
  },
  {
    id: 'room_f22_sala_tv',
    name: 'Sky Lounge, Juegos & Mirador 360°',
    level: 'Planta Piso 3 • Rooftop & Entretenimiento',
    area: '60 m² Cubiertos + 110 m² Terraza Mirador',
    materials: 'Piso en madera cálida, iluminación perimetral curva, mesa de ping pong y ventanales a la gran terraza mirador 360°',
    previewUrl: '/HACIENDA F22/360/SALA TV.jpg',
    hotspots: [
      { id: 'hs-tv-1', label: 'Mesa de Ping Pong / Juegos', detail: 'Zona lúdica con iluminación decorativa y amplio espacio de circulación.', x: 50, y: 56 },
      { id: 'hs-tv-2', label: 'Gran Terraza Mirador 360°', detail: 'Salida directa a la cubierta mirador panorámica hacia las colinas.', x: 68, y: 48 },
      { id: 'hs-tv-3', label: 'Bajar a Piso 2 (Suites)', detail: 'Descender al pasillo distribuidor de habitaciones →', x: 84, y: 52, targetRoomId: 'room_f22_pasillo' },
      { id: 'hs-tv-4', label: 'Master Suite', detail: 'Pasar a la suite principal en Piso 2 →', x: 22, y: 48, targetRoomId: 'room_f22_master' }
    ]
  },
  {
    id: 'room_f22_master',
    name: 'Master Suite Presidencial',
    level: 'Planta Nivel 2 • Privado',
    area: '68 m² Suite Completa',
    materials: 'Panelado en roble natural, cabecero acolchado, iluminación 2700K y terraza privada',
    previewUrl: '/HACIENDA F22/360/HAB PPAL 1.jpg',
    hotspots: [
      { id: 'hs-m-1', label: 'Cama King & Panelado', detail: 'Cabecero escultórico con iluminación rasante indirecta.', x: 50, y: 58 },
      { id: 'hs-m-2', label: 'Terraza Privada Exterior', detail: 'Salida directa a balcón con vistas al jardín y piscina.', x: 24, y: 48 },
      { id: 'hs-m-3', label: 'Vestier Boutique', detail: 'Entrar al walk-in closet con vitrinas ahumadas →', x: 82, y: 50, targetRoomId: 'room_f22_vestier' },
      { id: 'hs-m-4', label: 'Salir a Mezzanine', detail: 'Volver al pasillo distribuidor →', x: 88, y: 56, targetRoomId: 'room_f22_pasillo' }
    ]
  },
  {
    id: 'room_f22_vestier',
    name: 'Vestier Boutique & Walk-In Closet',
    level: 'Planta Nivel 2 • Vestier',
    area: '26 m²',
    materials: 'Vitrinas en vidrio ahumado bronce, iluminación led oculta y tocador doble con espejo',
    previewUrl: '/HACIENDA F22/360/VESTIER.jpg',
    hotspots: [
      { id: 'hs-v-1', label: 'Vitrinas Boutique Iluminadas', detail: 'Armarios cerrados en cristal con iluminación de tienda de alta costura.', x: 74, y: 52 },
      { id: 'hs-v-2', label: 'Tocador con Espejo LED', detail: 'Estación de maquillaje con luz neutra perimetral.', x: 18, y: 56 },
      { id: 'hs-v-3', label: 'Master Bath & Spa', detail: 'Pasar al baño principal con tina exenta →', x: 50, y: 48, targetRoomId: 'room_f22_wc_ppal' },
      { id: 'hs-v-4', label: 'Volver a Master Suite', detail: 'Regresar al dormitorio principal →', x: 38, y: 54, targetRoomId: 'room_f22_master' }
    ]
  },
  {
    id: 'room_f22_wc_ppal',
    name: 'Master Bath & Spa Privado',
    level: 'Planta Nivel 2 • Spa',
    area: '24 m²',
    materials: 'Tina exenta ergonómica, claraboya cenital natural, mesón suspendido y ducha de lluvia',
    previewUrl: '/HACIENDA F22/360/WCPPAL.jpg',
    hotspots: [
      { id: 'hs-wc-1', label: 'Tina Exenta & Claraboya', detail: 'Bañera escultórica bajo tragaluz cenital de luz natural.', x: 26, y: 72 },
      { id: 'hs-wc-2', label: 'Lavamanos Doble Flotante', detail: 'Mueble suspendido con grifería negra empotrada y espejo con luz cálida.', x: 54, y: 50 },
      { id: 'hs-wc-3', label: 'Cabina Ducha Spa', detail: 'Doble regadera de techo con panel de cristal esmerilado.', x: 76, y: 52 },
      { id: 'hs-wc-4', label: 'Regresar al Vestier', detail: 'Volver al walk-in closet boutique →', x: 42, y: 48, targetRoomId: 'room_f22_vestier' }
    ]
  },
  {
    id: 'room_f22_hab_aux',
    name: 'Suite Auxiliar / Huéspedes',
    level: 'Planta Nivel 2 • Suite',
    area: '32 m²',
    materials: 'Mueble bajo en roble, pantalla empotrada, cama central y ventanales de piso a techo',
    previewUrl: '/HACIENDA F22/360/HAB AUX.jpg',
    hotspots: [
      { id: 'hs-aux-1', label: 'Cama Circular de Diseño', detail: 'Mobiliario vanguardista en tonos arena y textiles naturales.', x: 50, y: 64 },
      { id: 'hs-aux-2', label: 'Ventanales Panorámicos', detail: 'Apertura directa de luz natural con vista a los árboles perimetrales.', x: 66, y: 48 },
      { id: 'hs-aux-3', label: 'Volver a Mezzanine', detail: 'Salir al pasillo distribuidor de Nivel 2 →', x: 88, y: 50, targetRoomId: 'room_f22_pasillo' }
    ]
  }
];

// Colección completa de los 9 renders arquitectónicos oficiales de IBIZA A14 en resolución 4K/5K Widescreen
export const IBIZA_A14_RENDERS: ProjectRender[] = [
  // 1. FACHADAS & EXTERIORES (5)
  {
    id: 'a14-fachada-1',
    title: 'Fachada Principal & Volumetría Bioclimática',
    url: '/IBIZA A14/01-F004.jpg',
    category: 'Fachada & Exteriores',
    description: 'Composición arquitectónica horizontal con generosos aleros de control solar y materiales nobles en Condominio Ibiza.',
    width: 4096,
    height: 2312,
    aspectRatio: 1.77
  },
  {
    id: 'a14-fachada-2',
    title: 'Perspectiva Frontal & Aleros de Sombra',
    url: '/IBIZA A14/02-F005.jpg',
    category: 'Fachada & Exteriores',
    description: 'Diálogo entre volúmenes en voladizo, celosías de protección térmica e integración bioclimática con el paisaje.',
    width: 4096,
    height: 2312,
    aspectRatio: 1.77
  },
  {
    id: 'a14-piscina-1',
    title: 'Piscina & Terraza Social Exterior',
    url: '/IBIZA A14/03-F006.jpg',
    category: 'Piscina & BBQ',
    description: 'Oasis exterior con solárium húmedo, espejo de agua cristalina y conexión fluida hacia los salones interiores.',
    width: 4096,
    height: 2312,
    aspectRatio: 1.77
  },
  {
    id: 'a14-fachada-3',
    title: 'Atrio de Entrada & Paisajismo',
    url: '/IBIZA A14/04-F007.jpg',
    category: 'Fachada & Exteriores',
    description: 'Pórtico de recibo con muros en piedra natural, vegetación tropical y control solar pasivo.',
    width: 3340,
    height: 1882,
    aspectRatio: 1.77
  },
  {
    id: 'a14-fachada-4',
    title: 'Fachada Posterior & Jardín Perimetral',
    url: '/IBIZA A14/05-F12.jpg',
    category: 'Fachada & Exteriores',
    description: 'Perspectiva monumental posterior con grandes paños acristalados de piso a techo y voladizos protectores.',
    width: 5376,
    height: 3040,
    aspectRatio: 1.77
  },

  // 2. BIENVENIDA & SALÓN (2)
  {
    id: 'a14-salon-1',
    title: 'Gran Salón Social & Ventanales Panorámicos',
    url: '/IBIZA A14/06-S2.jpg',
    category: 'Bienvenida & Salón',
    description: 'Espacio diáfano principal con ventilación bioclimática cruzada y apertura total hacia el jardín.',
    width: 5376,
    height: 3040,
    aspectRatio: 1.77
  },
  {
    id: 'a14-salon-2',
    title: 'Salón Principal & Comedor Integrado',
    url: '/IBIZA A14/07-S1.jpg',
    category: 'Bienvenida & Salón',
    description: 'Integración espacial de sala y comedor con mobiliario contemporáneo e iluminación arquitectónica lineal.',
    width: 4096,
    height: 2316,
    aspectRatio: 1.77
  },

  // 3. COCINA DE AUTOR (2)
  {
    id: 'a14-cocina-1',
    title: 'Cocina de Chef con Isla Central',
    url: '/IBIZA A14/08-C01.jpg',
    category: 'Cocina de Autor',
    description: 'Cocina de alto estándar con isla monolítica, acabados de poro cerrado y barra social conectada al exterior.',
    width: 4096,
    height: 2316,
    aspectRatio: 1.77
  },
  {
    id: 'a14-cocina-2',
    title: 'Cocina Gourmet & Conexión al Comedor',
    url: '/IBIZA A14/09-C02.jpg',
    category: 'Cocina de Autor',
    description: 'Diálogo armónico entre la zona gastronómica y las áreas sociales de la residencia.',
    width: 5376,
    height: 3040,
    aspectRatio: 1.77
  }
];

export const IBIZA_A14_LEVELS: ProjectLevelInfo[] = [
  {
    id: 'a14-nivel-1',
    label: 'Planta Nivel 1 • Social & Bioclimática',
    area: 'Por definir m² • Nivel Social',
    height: 'Doble altura en salón principal y pórtico',
    summary: 'Planta social concebida para el clima cálido de Cúcuta en el Condominio Ibiza (Lote A14), privilegiando la ventilación cruzada, aleros profundos de control solar e integración directa con terraza y piscina.',
    spaces: [
      'Pórtico de ingreso monumental con jardines tropicales y espejo de agua',
      'Gran Salón-Comedor con apertura total hacia la terraza cubierta',
      'Cocina de autor con isla central y conexión funcional hacia zona BBQ',
      'Estudio / Suite de huéspedes en primer nivel con baño completo',
      'Piscina con playa húmeda, solárium y lounge bioclimático exterior',
      'Parqueadero cubierto para vehículos + zona de ropas y servicios'
    ]
  },
  {
    id: 'a14-nivel-2',
    label: 'Planta Nivel 2 • Suites & Descanso',
    area: 'Por definir m² • Nivel Privado',
    height: 'Altura libre 3.10 m con protección solar',
    summary: 'Nivel íntimo residencial con circulación ventilada naturalmente, sala de estar familiar y suites con balcones profundos orientados hacia las visuales del Condominio Ibiza.',
    spaces: [
      'Master Suite Principal A14 con terraza privada y control lumínico',
      'Walk-in Closet de gran capacidad y baño principal con doble lavamanos',
      'Suites secundarias con baño privado, vestier y ventilación natural',
      'Family Room / Sala de TV íntima en segundo nivel'
    ]
  },
  {
    id: 'a14-nivel-3',
    label: 'Cubierta & Terrazas • Ingeniería Bioclimática',
    area: 'Cubierta Termoacústica & Aleros',
    height: 'Protección solar pasiva',
    summary: 'Sistema de cubierta proyectada con grandes voladizos perimetrales para mitigar la radiación solar directa y optimizar el confort térmico interior todo el año.',
    spaces: [
      'Aleros arquitectónicos en voladizo para sombra proyectada sobre fachadas',
      'Preinstalación técnica para energía solar fotovoltaica y climatización',
      'Aislamiento termoacústico de alto desempeño para máximo confort'
    ]
  }
];

export const IBIZA_A14_ROOMS_360: ProjectRoom360[] = [
  {
    id: 'a14-room-fachada',
    name: 'Acceso Principal & Fachada Ibiza A14',
    level: 'Planta Nivel 1 • Exterior',
    area: 'Lote A14 • Condominio Ibiza',
    materials: 'Concreto arquitectónico, aleros de protección solar, piedra natural y madera',
    previewUrl: '/IBIZA A14/01-F004.jpg',
    hotspots: [
      { id: 'a14-hs-1', label: 'Alero Bioclimático A14', detail: 'Voladizo diseñado para protección solar pasiva en el clima de Cúcuta.', x: 46, y: 38 },
      { id: 'a14-hs-2', label: 'Ingresar al Nivel Social', detail: 'Explorar Gran Salón & Terraza →', x: 55, y: 64, targetRoomId: 'a14-room-social' }
    ]
  },
  {
    id: 'a14-room-social',
    name: 'Gran Salón Social & Cocina Integrada',
    level: 'Planta Nivel 1 • Social',
    area: 'Zona Social Integrada',
    materials: 'Pisos de gran formato, carpintería arquitectónica y ventanales piso a techo',
    previewUrl: '/IBIZA A14/07-S1.jpg',
    hotspots: [
      { id: 'a14-hs-3', label: 'Salir a Terraza & Piscina', detail: 'Conectar con Oasis Exterior A14 →', x: 74, y: 58, targetRoomId: 'a14-room-piscina' },
      { id: 'a14-hs-4', label: 'Subir a Nivel de Suites', detail: 'Explorar Planta Nivel 2 →', x: 28, y: 42, targetRoomId: 'a14-room-master' }
    ]
  },
  {
    id: 'a14-room-piscina',
    name: 'Terraza Cubierta, Piscina & Zona BBQ',
    level: 'Planta Nivel 1 • Oasis Exterior',
    area: 'Exterior & Paisajismo',
    materials: 'Deck antideslizante, espejo de agua y pérgola de control solar',
    previewUrl: '/IBIZA A14/03-F006.jpg',
    hotspots: [
      { id: 'a14-hs-5', label: 'Piscina & Solárium', detail: 'Integración fluida con el salón y jardines del Lote A14.', x: 52, y: 70 },
      { id: 'a14-hs-6', label: 'Volver al Salón Social', detail: 'Regresar al Interior →', x: 24, y: 50, targetRoomId: 'a14-room-social' }
    ]
  },
  {
    id: 'a14-room-master',
    name: 'Master Suite A14 & Balcón Privado',
    level: 'Planta Nivel 2 • Privado',
    area: 'Suite Principal',
    materials: 'Maderas cálidas, iluminación indirecta y ventanales con quiebrasoles',
    previewUrl: '/IBIZA A14/06-S2.jpg',
    hotspots: [
      { id: 'a14-hs-7', label: 'Balcón & Visuales Ibiza', detail: 'Vista abierta hacia el entorno campestre del Condominio Ibiza.', x: 65, y: 48 },
      { id: 'a14-hs-8', label: 'Regresar al Nivel 1', detail: 'Bajar al Gran Salón →', x: 22, y: 60, targetRoomId: 'a14-room-social' }
    ]
  }
];

// Registro oficial de identidades de proyecto
export const PROJECT_IDENTITIES: Record<string, ProjectIdentity> = {
  // PROYECTO 1: HACIENDA F22 (Identidad independiente White-Label para AMHO CONSTRUCCIONES)
  'project_hacienda_f22': {
    id: 'project_hacienda_f22',
    slug: 'hacienda-f22',
    code: 'F22',
    name: 'HACIENDA F22',
    titlePrefix: 'HACIENDA',
    titleHighlight: 'F22',
    categoryLabel: 'RESIDENCIA CAMPESTRE DE AUTOR',
    urbanization: 'CONDOMINIO HACIENDA',
    lot: 'LOTE F22',
    location: 'CÚCUTA / NORTE DE SANTANDER',
    locationFull: 'CÚCUTA / NORTE DE SANTANDER • CONDOMINIO HACIENDA • LOTE F22',
    statusBadge: 'AMHO CONSTRUCCIONES • OBRA EXCLUSIVA',
    statusLabel: 'Diseño Aprobado • Listo para Construcción',
    brandName: 'AMHO CONSTRUCCIONES',
    tagline: 'Escultura habitable concebida por AMHO Construcciones en diálogo entre volúmenes en voladizo, travertino natural, cuarcita exótica y un oasis exterior con piscina desbordante y pabellón gourmet.',
    heroVideoUrl: '/HACIENDA F22/VIDEO_HACIENDA_F22.mp4',
    heroVideoPoster: '/HACIENDA F22/FACHADA.png',
    theme: {
      primaryColor: '#DFC47B',        // Oro champaña metálico oficial extraído del isotipo AMHO Construcciones
      primaryHover: '#F1E29B',        // Destello oro luminoso del bisel superior del logo AMHO
      accentGlow: 'rgba(223, 196, 123, 0.35)',
      bgColor: '#060608',             // Obsidiana profunda de contraste arquitectónico
      surfaceColor: 'rgba(14, 14, 19, 0.88)',
      borderColor: 'rgba(223, 196, 123, 0.28)',
      badgeBg: '#DFC47B',
      badgeText: '#060608',
      fontFamilyTitle: "'Syne', 'Montserrat', 'Inter', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    clientBrand: {
      companyName: 'AMHO CONSTRUCCIONES',
      shortName: 'AMHO',
      subtitle: 'ARQUITECTURA • INGENIERÍA • CONSTRUCCIÓN DE AUTOR',
      tagline: 'Excelencia constructiva, precisión estructural y diseño residencial de ultra-lujo.',
      logoHorizontalWhite: '/HACIENDA F22/branding/amho-horizontal-white.png',
      logoHorizontalDark: '/HACIENDA F22/branding/amho-horizontal-dark.png',
      logoVerticalWhite: '/HACIENDA F22/branding/amho-vertical-white.png',
      logoVerticalDark: '/HACIENDA F22/branding/amho-vertical-dark.png',
      logoIcon: '/HACIENDA F22/branding/amho-icon.png',
      metallicGradient: 'linear-gradient(135deg, #B89752 0%, #DFC47B 32%, #F7E8A8 50%, #D1B16B 74%, #9E7D3B 100%)'
    },
    specs: {
      areaBuilt: '560 m²',
      lotArea: '1.200 m² (Lote F22)',
      lotMetricValue: '1.200 m²',
      suitesLabel: '4 Master',
      wellnessLabel: 'Piscina + Spa',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 4,
      modality: 'Llave en Mano • AMHO Construcciones',
      levels: '3 Plantas (Piso 1 Social, Piso 2 Suites, Piso 3 Sky Lounge)'
    },
    renders: HACIENDA_F22_RENDERS,
    levels: HACIENDA_F22_LEVELS,
    rooms360: HACIENDA_F22_ROOMS_360
  },

  // PROYECTO 2: IBIZA A14 (Obra 02 - Condominio Ibiza • Lote A14)
  'project_ibiza_a14': {
    id: 'project_ibiza_a14',
    slug: 'ibiza-a14',
    code: 'A14',
    name: 'IBIZA A14',
    titlePrefix: 'IBIZA',
    titleHighlight: 'A14',
    categoryLabel: 'VILLA CAMPESTRE DE AUTOR',
    urbanization: 'CONDOMINIO IBIZA',
    lot: 'LOTE A14',
    location: 'CÚCUTA / NORTE DE SANTANDER',
    locationFull: 'CÚCUTA / NORTE DE SANTANDER • CONDOMINIO IBIZA • LOTE A14',
    statusBadge: 'MASSA HOME • 9 RENDERS 4K & VIDEO',
    statusLabel: 'En Preventa & Diseño • Portafolio Activo',
    brandName: 'MASSA HOME',
    tagline: 'Villa campestre de autor concebida para la luz y el clima de Cúcuta en el Condominio Ibiza • Lote A14. Volumetría horizontal con grandes aleros de protección solar, ventilación bioclimática pasiva e integración interior-exterior.',
    heroVideoUrl: '/A14.mp4',
    heroVideoPoster: '/IBIZA A14/01-F004.jpg',
    theme: {
      primaryColor: '#9CD01A',
      primaryHover: '#C2F23E',
      accentGlow: 'rgba(156, 208, 26, 0.32)',
      bgColor: '#070906',
      surfaceColor: 'rgba(14, 18, 14, 0.88)',
      borderColor: 'rgba(156, 208, 26, 0.26)',
      badgeBg: '#9CD01A',
      badgeText: '#060804',
      fontFamilyTitle: "'Syne', 'Montserrat', 'Inter', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    clientBrand: {
      companyName: 'MASSA HOME',
      shortName: 'MASSA',
      subtitle: 'ARQUITECTURA BIOCLIMÁTICA • INGENIERÍA • GEMELOS DIGITALES',
      tagline: 'Diseño residencial contemporáneo de alto estándar, confort térmico pasivo y precisión técnica en cada detalle.',
      logoHorizontalWhite: '/MASSA_USO.png',
      logoHorizontalDark: '/MASSA_USO.png',
      logoVerticalWhite: '/MASSA_USO.png',
      logoVerticalDark: '/MASSA_USO.png',
      logoIcon: '/massa-cube-transparent.png',
      metallicGradient: 'linear-gradient(135deg, #729B0E 0%, #9CD01A 35%, #D4FF5E 52%, #8CBF14 76%, #5B7E08 100%)'
    },
    specs: {
      areaBuilt: 'Por definir m²',
      lotArea: 'Condominio Ibiza • Lote A14',
      lotMetricValue: 'Lote A14',
      suitesLabel: '4 Suites',
      wellnessLabel: 'Piscina & BBQ',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 3,
      modality: 'En Preventa & Diseño • Personalizable',
      levels: '2 Plantas + Terrazas'
    },
    renders: IBIZA_A14_RENDERS,
    levels: IBIZA_A14_LEVELS,
    rooms360: IBIZA_A14_ROOMS_360
  },

  // PROYECTO 3: RESIDENCIA JEJÉN (Obra 03)
  'project_1781963945215': {
    id: 'project_1781963945215',
    slug: 'edinson-jejen',
    code: 'OBRA 03',
    name: 'RESIDENCIA JEJÉN',
    titlePrefix: 'RESIDENCIA',
    titleHighlight: 'JEJÉN',
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
      lotMetricValue: '550 m²',
      suitesLabel: '4 Suites',
      wellnessLabel: 'Jacuzzi & Turco',
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
    titlePrefix: 'SEDE',
    titleHighlight: 'MARQUIMODA',
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
      lotMetricValue: '800 m²',
      suitesLabel: 'Atelier VIP',
      wellnessLabel: 'Terraza Lounge',
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

  // Alias específicos conocidos (prioridad rápida)
  if (normalized === 'a14' || normalized === 'ibiza-a14' || normalized === 'ibiza_a14' || normalized.includes('ibiza') || normalized.includes('a14')) {
    return PROJECT_IDENTITIES['project_ibiza_a14'];
  }
  if (normalized === 'f22' || normalized === 'hacienda-f22' || normalized === 'hacienda_f22' || normalized.includes('hacienda') || normalized.includes('f22')) {
    return PROJECT_IDENTITIES['project_hacienda_f22'];
  }
  if (normalized.includes('jejen') || normalized.includes('edinson')) {
    return PROJECT_IDENTITIES['project_1781963945215'];
  }
  if (normalized.includes('marquimoda')) {
    return PROJECT_IDENTITIES['project_1782912175010'];
  }

  // Búsqueda directa por clave o propiedades
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

  // Identidad dinámica por defecto
  const cleanedTitle = idOrSlug
    .replace(/^project_/, '')
    .replace(/[_-]/g, ' ')
    .toUpperCase();

  const words = cleanedTitle.split(' ').filter(Boolean);
  const titlePrefix = words.length > 1 ? words.slice(0, -1).join(' ') : cleanedTitle;
  const titleHighlight = words.length > 1 ? words[words.length - 1] : 'VIP';

  return {
    id: idOrSlug,
    slug: idOrSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    code: 'OBRA',
    name: cleanedTitle,
    titlePrefix,
    titleHighlight,
    categoryLabel: 'RESIDENCIA DE AUTOR',
    urbanization: 'ZONA EXCLUSIVA',
    lot: 'LOTE PRIVADO',
    location: 'COLOMBIA',
    locationFull: `COLOMBIA • ZONA EXCLUSIVA • ${cleanedTitle}`,
    statusBadge: 'PROYECTO EN VIVO',
    statusLabel: 'En Desarrollo & Diseño',
    brandName: 'MASSA HOME',
    tagline: 'Residencia arquitectónica de autor con diseño bioclimático e ingeniería de precisión por MASSA HOME.',
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
      lotMetricValue: 'Por definir',
      suitesLabel: '4 Suites',
      wellnessLabel: 'Piscina & BBQ',
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
