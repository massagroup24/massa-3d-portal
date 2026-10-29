export interface CommercialResidence {
  id: string;
  projectId?: string; // Links to projectsData key if 360 tour is available
  name: string;
  tagline: string;
  category: 'villa' | 'urbana' | 'penthouse' | 'corporativo';
  categoryLabel: string;
  location: string;
  zone: string;
  areaBuilt: string;
  areaLot?: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  priceCOP: string;
  priceUSD: string;
  status: 'disponible' | 'en_obra' | 'entregado';
  statusLabel: string;
  progressPercentage?: number;
  hasTour360: boolean;
  featured: boolean;
  heroImage: string;
  galleryImages: string[];
  highlights: string[];
  description: string;
}

export const COMMERCIAL_RESIDENCES: CommercialResidence[] = [
  {
    id: 'project_hacienda_f22',
    projectId: 'project_hacienda_f22',
    name: 'HACIENDA F22',
    tagline: 'Residencia campestre de autor con arquitectura escultórica en Condominio Hacienda • Lote F22',
    category: 'villa',
    categoryLabel: 'Residencia Campestre Luxury',
    location: 'Cúcuta / Norte de Santander',
    zone: 'Condominio Hacienda • Lote F22',
    areaBuilt: '560 m²',
    areaLot: '1.200 m² (Lote F22)',
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 4,
    priceCOP: 'Inversión Privada',
    priceUSD: 'Dossier Confidencial',
    status: 'disponible',
    statusLabel: 'Proyecto Ejecutivo Aprobado',
    progressPercentage: 25,
    hasTour360: true,
    featured: true,
    heroImage: '/HACIENDA F22/FACHADA.png',
    galleryImages: [
      '/HACIENDA F22/FACHADA DRON.png',
      '/HACIENDA F22/FACHADA.png',
      '/HACIENDA F22/FACHADA NOCHE.png',
      '/HACIENDA F22/SALA.jpg',
      '/HACIENDA F22/PISCINA.jpg',
      '/HACIENDA F22/COCINA.jpg',
      '/HACIENDA F22/DORMITORIO.jpg',
      '/HACIENDA F22/TERRAZA.png',
    ],
    highlights: [
      '33 Renders de autor fotorrealistas en ultra definición (diurnos, nocturnos y aéreos)',
      'Perspectiva aérea monumental con dron capturando la volumetría y el entorno de golf',
      'Piscina turquesa con jacuzzi integrado y muros perimetrales en travertino',
      'Gran salón con doble altura monumental y escalera flotante en madera',
      'Cocina de chef con isla monolítica en cuarcita exótica y cava vertical',
      'Pabellón exterior cubierto con quincho BBQ y lounge apergolado',
      'Master suite presidencial con vestier boutique y baño spa en piedra',
    ],
    description: 'Escultura habitable de 560 m² concebida en Condominio Hacienda. Diálogo entre volúmenes puros en concreto arquitectónico, maderas nobles y grandes paños vidriados.',
  },
  {
    id: 'project_ibiza_a14',
    projectId: 'project_ibiza_a14',
    name: 'IBIZA A14',
    tagline: 'Residencia de autor contemporánea en Condominio Ibiza • Lote A14',
    category: 'villa',
    categoryLabel: 'Villa Campestre de Autor',
    location: 'Cúcuta / Norte de Santander',
    zone: 'Condominio Ibiza • Lote A14',
    areaBuilt: 'Por definir m²',
    areaLot: 'Lote A14',
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 3,
    priceCOP: 'A consultar',
    priceUSD: 'Inversión Personalizada',
    status: 'disponible',
    statusLabel: 'En Preventa & Diseño',
    progressPercentage: 15,
    hasTour360: true,
    featured: true,
    heroImage: '/IBIZA A14/01-F004.jpg',
    galleryImages: [
      '/IBIZA A14/01-F004.jpg',
      '/IBIZA A14/02-F005.jpg',
      '/IBIZA A14/03-F006.jpg',
      '/IBIZA A14/04-F007.jpg',
      '/IBIZA A14/05-F12.jpg',
      '/IBIZA A14/06-S2.jpg',
      '/IBIZA A14/07-S1.jpg',
      '/IBIZA A14/08-C01.jpg',
      '/IBIZA A14/09-C02.jpg',
    ],
    highlights: [
      'Planos arquitectónicos y distribución espacial personalizada',
      'Renders fotorrealistas en alta definición',
      'Recorrido virtual 360° interactivo por todos los ambientes',
      'Ficha técnica y cuadro de acabados de lujo',
      'Ubicación privilegiada en Condominio Ibiza (Lote A14)',
      'Esquema de pago flexible por hitos de avance de obra',
    ],
    description: 'Exclusiva residencia diseñada a medida por MASSA GROUP en el prestigioso Condominio Ibiza. Espacio concebido para maximizar la ventilación bioclimática, la privacidad y el confort de alta gama.',
  },
  {
    id: 'project_1781963945215',
    projectId: 'project_1781963945215',
    name: 'RESIDENCIA JEJÉN',
    tagline: 'Casa contemporánea de triple altura con spa turco y terraza rooftop',
    category: 'urbana',
    categoryLabel: 'Residencia Urbana de Autor',
    location: 'Cali / Valle del Cauca',
    zone: 'Cali Exclusivo',
    areaBuilt: '420 m²',
    areaLot: '550 m²',
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 3,
    priceCOP: 'Obra Privada',
    priceUSD: 'Proyecto Personalizado',
    status: 'en_obra',
    statusLabel: 'En Ejecución • 92% Avance',
    progressPercentage: 92,
    hasTour360: true,
    featured: true,
    heroImage: '/images/projects/edinson_jejen_terraza.jpg',
    galleryImages: ['/images/projects/edinson_jejen_terraza.jpg'],
    highlights: [
      'Recorrido 360° interactivo en 5 ambientes con navegación por hotspots',
      'Baño turco arquitectónico con revestimiento en piedra natural',
      'Sala social a triple altura con ventanales motorizados',
      'Terraza rooftop con jacuzzi y área de descanso superior',
    ],
    description: 'Ejemplo insignia de precisión constructiva MASSA. Cada detalle de iluminación, mármol y carpintería metálica fue diseñado de manera artesanal y digital.',
  },
  {
    id: 'project_1782912175010',
    projectId: 'project_1782912175010',
    name: 'SEDE MARQUIMODA',
    tagline: 'Sede corporativa y atelier de alta costura con arquitectura bioclimática',
    category: 'corporativo',
    categoryLabel: 'Sede Corporativa & Oficinas',
    location: 'Valle del Cauca',
    zone: 'Distrito Empresarial',
    areaBuilt: '620 m²',
    areaLot: '800 m²',
    bedrooms: 0,
    bathrooms: 6,
    parkingSpaces: 8,
    priceCOP: 'Sede a Medida',
    priceUSD: 'Inversión Comercial',
    status: 'en_obra',
    statusLabel: 'En Obra • 78% Avance',
    progressPercentage: 78,
    hasTour360: true,
    featured: true,
    heroImage: '/images/projects/marquimoda_isometria.webp',
    galleryImages: ['/images/projects/marquimoda_isometria.webp'],
    highlights: [
      'Recorrido 360° por plantas abiertas, gerencia, oficinas y cafetería',
      'Fachada con lamas móviles en aluminio anodizado',
      'Atrio central con jardín interior y luz cenital regulada',
      'Certificación de eficiencia energética y ahorro hídrico',
    ],
    description: 'Instalaciones de alto nivel para marcas que exigen proyectar solvencia, sofisticación e innovación espacial ante clientes y socios internacionales.',
  },
];

export const COMMERCIAL_METRICS = [
  { value: '18.500+', label: 'Metros Cuadrados Proyectados', detail: 'En residencias de ultralujo y sedes' },
  { value: '100%', label: 'Llave en Mano Garantizado', detail: 'Presupuesto cerrado sin sorpresas' },
  { value: '360°', label: 'Gemelo Digital y Tour Virtual', detail: 'Camina tu residencia antes de construir' },
  { value: '14 Años', label: 'Liderazgo en Arquitectura', detail: 'Cúcuta, NDS y Colombia' },
];

export const PRIME_LOCATIONS = [
  {
    name: 'Lago Calima',
    sub: 'Villas Náuticas & Campestres',
    desc: 'El enclave náutico por excelencia. Terrenos con acceso directo al lago y vientos constantes para deportes acuáticos y descanso de élite.',
    avgTemp: '22°C',
    distCali: '1h 15m',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    tag: 'Mayor Plusvalía',
  },
  {
    name: 'Dapa',
    sub: 'Alta Montaña & Clima Frío',
    desc: 'A solo 20 minutos del norte de Cali. Panorámica insuperable de 180° sobre todo el valle geográfico y clima fresco de 18°C.',
    avgTemp: '18°C',
    distCali: '20 min',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    tag: 'Exclusividad Total',
  },
  {
    name: 'Cali / Pance & Peñón',
    sub: 'Residencial Urbano & Sky Villas',
    desc: 'Lotes campestres urbanos en Pance junto a los mejores colegios y universidades, y penthouses exclusivos en el tradicional barrio El Peñón.',
    avgTemp: '25°C',
    distCali: 'Urbano',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1000&q=80',
    tag: 'Ubicación Estratégica',
  },
  {
    name: 'Rozo / Cerrito',
    sub: 'Haciendas & Villas de Veraneo',
    desc: 'Terrenos planos de gran extensión, ideales para casas campestres de un solo nivel con caballerizas, canchas y piscinas olímpicas.',
    avgTemp: '27°C',
    distCali: '25 min',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    tag: 'Grandes Lotes',
  },
];

export interface TrustedPartner {
  name: string;
  logo: string;
}

export const TRUSTED_PARTNERS_ROW1: TrustedPartner[] = [
  { name: 'Terpel', logo: '/logos/Logo_terpel.png' },
  { name: 'Dollarcity', logo: '/logos/dollarcity-logo.png' },
  { name: 'Faranda Hotels', logo: '/logos/SmciECr1.png' },
  { name: 'Construrama', logo: '/logos/construrama-logo-png_seeklogo-227227.png' },
  { name: 'Diomar García Eventos', logo: '/logos/logo.png' },
  { name: 'Clínica Santa Ana S.A.', logo: '/logos/MANEJO-DE-HERIDAS-1-2048.png' },
  { name: 'Palcasa', logo: '/logos/palcasa.png' },
  { name: 'Lukeoil Extractora', logo: '/logos/SOCIO-ALIANZA-LUKEOIL.webp' },
  { name: 'Synerflow', logo: '/logos/SYNERFLOW.png' },
  { name: 'Dubó', logo: '/logos/DUBO.png' },
  { name: 'Viwo Stay & Work', logo: '/logos/WhatsApp%20Image%202026-02-27%20at%2012.13.15%20PM.png' },
  { name: 'Leone', logo: '/logos/242022819_363586325461188_5883950162131200925_n.png' },
  { name: 'Río', logo: '/logos/800x800cc.png' },
  { name: 'Ingelcol S.A.', logo: '/logos/images.png' },
  { name: 'El Retén', logo: '/logos/elreten-ere-10.png' },
];

export const TRUSTED_PARTNERS_ROW2: TrustedPartner[] = [
  { name: 'Palnorte S.A.S.', logo: '/logos/305494681_483332970468358_205199070786225288_n.png' },
  { name: 'Grupo Surtitex S.A.', logo: '/logos/325779548_5942322762495612_7261240858182625003_n.png' },
  { name: 'Spezia', logo: '/logos/475437634_793270506329843_6136987787314938255_n.png' },
  { name: 'Tintorería La Roca', logo: '/logos/247902843_113607237774395_3371655457367365570_n.png' },
  { name: 'Skarcha', logo: '/logos/311566703_563704298870084_1384925464546808243_n.png' },
  { name: 'Decor Alvarez', logo: '/logos/313361047_555576386573302_2908882530352114794_n.png' },
  { name: 'Renew', logo: '/logos/368172010_649651340447686_6984167553677370507_n.png' },
  { name: "D'moda", logo: '/logos/376751772_685003803659632_6097670840865882095_n.png' },
  { name: 'Partcar', logo: '/logos/431894042_352105667815908_1191164120809286285_n.png' },
  { name: 'La María', logo: '/logos/462468849_122103669206559154_495338746926332711_n.png' },
  { name: 'Droguería Denach', logo: '/logos/463426875_561864616373222_4754960062164751279_n.png' },
  { name: 'Supermercado Alejandro', logo: '/logos/489381838_1608326783442259_6045952335802192271_n.png' },
  { name: 'Almacén Surtidor', logo: '/logos/1647346273-82-almac-n-surtidor.png' },
  { name: 'Surtidor', logo: '/logos/channels4_profile.png' },
  { name: 'Dark Rabbit', logo: '/logos/cropped-logo-dark-1.webp' },
];

