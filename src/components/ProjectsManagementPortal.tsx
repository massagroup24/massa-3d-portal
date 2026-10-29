import { useState } from 'react';
import { 
  Check, 
  Compass, 
  Share2, 
  Eye,
  LogOut,
  Globe,
  BookmarkCheck,
  Sparkles,
  PlusCircle,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { Project, projectsData } from '../data/tourData';
import { getProjectIdentity } from '../config/projectIdentityConfig';

interface ProjectsManagementPortalProps {
  projects: Record<string, Project>;
  onSelectProject: (projectId: string) => void;
  onStart360Tour: (projectId: string) => void;
  onConfigureProject: (projectId: string) => void;
  onBackToHome: () => void;
  onLogout?: () => void;
  currentUserName?: string;
}

// IDs de los proyectos actualmente creados en el portafolio comercial
const ACTIVE_CURRENT_PROJECT_IDS = ['project_hacienda_f22', 'project_ibiza_a14'];

// IDs de los recorridos 360° guardados históricos (Marquimoda y Edinson Jején)
const SAVED_360_TOUR_IDS = ['project_1782912175010', 'project_1781963945215'];

export function ProjectsManagementPortal({
  projects,
  onSelectProject,
  onStart360Tour,
  onConfigureProject,
  onBackToHome,
  onLogout,
  currentUserName = 'Juan David'
}: ProjectsManagementPortalProps) {
  const [activeSection, setActiveSection] = useState<'create' | 'saved'>('create');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Resolver lista de proyectos actuales para crear/configurar sus recorridos 360°
  const activeCurrentProjects: Project[] = ACTIVE_CURRENT_PROJECT_IDS
    .map((id) => projects[id] || projectsData[id])
    .filter((p): p is Project => Boolean(p));

  // Resolver lista de recorridos 360° guardados (Marquimoda, Edinson Jején + proyectos actuales que ya tengan escenas 360°)
  const savedToursList: Project[] = [
    ...SAVED_360_TOUR_IDS
      .map((id) => projects[id] || projectsData[id])
      .filter((p): p is Project => Boolean(p)),
    ...activeCurrentProjects.filter((p) => Object.keys(p.rooms || {}).length > 0),
  ];

  const totalSavedScenes = savedToursList.reduce(
    (acc, p) => acc + Object.keys(p.rooms || {}).length,
    0
  );

  const handleCopyLink = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tour/${projectId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const resolveProjectPreview = (project: Project): string => {
    const identity = getProjectIdentity(project.id);
    if (project.id === 'project_hacienda_f22') {
      return identity.heroVideoPoster || '/HACIENDA F22/FACHADA.png';
    }
    if (project.heroImage) return project.heroImage;
    if (project.thumbnail) return project.thumbnail;
    if (identity.heroVideoPoster) return identity.heroVideoPoster;
    const firstRoom = project.rooms ? Object.values(project.rooms)[0] : undefined;
    if (firstRoom?.imageUrl) return firstRoom.imageUrl;
    return '/IBIZA A14/01-F004.jpg';
  };

  // Renderizador de tarjeta de proyecto personalizada con la identidad de marca propia de cada proyecto
  const renderProjectCard = (project: Project, mode: 'create' | 'saved') => {
    const identity = getProjectIdentity(project.id);
    const brand = identity.clientBrand;
    const isCustomBrand = Boolean(brand);
    const primaryColor = identity.theme.primaryColor || '#9CD01A';
    const metallicGradient =
      brand?.metallicGradient ||
      `linear-gradient(135deg, ${primaryColor} 0%, ${identity.theme.primaryHover || primaryColor} 100%)`;

    const rooms = Object.values(project.rooms || {});
    const roomCount = rooms.length;
    const totalHotspots = rooms.reduce((acc, r) => acc + (r.hotspots?.length || 0), 0);
    const previewImg = resolveProjectPreview(project);
    const isArchivedTour = SAVED_360_TOUR_IDS.includes(project.id);

    return (
      <div
        key={`${mode}-${project.id}`}
        className={`group relative rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between border ${
          isCustomBrand
            ? 'bg-[#09090D] border-[#DFC47B]/35 hover:border-[#DFC47B]/80 shadow-[0_25px_65px_rgba(0,0,0,0.9),0_0_40px_rgba(223,196,123,0.14)]'
            : 'bg-[#121318] border-white/10 hover:border-[#9CD01A]/60 shadow-2xl'
        }`}
      >
        <div>
          {/* Imagen de Portada del Proyecto con Sello de Marca Propia */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
            <img
              src={encodeURI(previewImg)}
              alt={project.name}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
            <div
              className={`absolute inset-0 ${
                isCustomBrand
                  ? 'bg-gradient-to-t from-[#09090D] via-black/45 to-black/35'
                  : 'bg-gradient-to-t from-[#121318] via-black/35 to-black/30'
              }`}
            />

            {/* Barra Superior de Identidad de Marca & Estado 360° */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
              {brand?.logoHorizontalWhite ? (
                <div className="px-3.5 py-1.5 rounded-2xl bg-black/75 backdrop-blur-xl border border-[#DFC47B]/45 flex items-center gap-2 shadow-xl">
                  <img
                    src={encodeURI(brand.logoHorizontalWhite)}
                    alt={brand.companyName}
                    className="h-5 sm:h-6 w-auto object-contain"
                  />
                </div>
              ) : (
                <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#9CD01A]/40 text-[#9CD01A] text-[10px] font-mono font-bold uppercase tracking-wider">
                  {mode === 'saved' && isArchivedTour ? 'RECORRIDO 360° GUARDADO' : `${identity.brandName} • ACTIVO`}
                </span>
              )}

              <span
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                  roomCount > 0
                    ? isCustomBrand
                      ? 'bg-black/75 border-[#DFC47B]/55 text-[#F1E29B]'
                      : 'bg-[#9CD01A]/20 border-[#9CD01A]/50 text-[#9CD01A]'
                    : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                }`}
              >
                {roomCount > 0 ? `${roomCount} ESCENAS 360° CREADAS` : 'PENDIENTE SUBIR ESCENAS 360°'}
              </span>
            </div>

            {/* Título & Ubicación sobre la imagen con tipografía e identidad del proyecto */}
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
              <div>
                <div
                  className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1 ${
                    isCustomBrand ? 'text-[#F1E29B]' : 'text-[#9CD01A]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                  <span>
                    {identity.urbanization} • {identity.lot} • {identity.location}
                  </span>
                </div>

                {project.id === 'project_hacienda_f22' ? (
                  <h2
                    style={{ fontFamily: identity.theme.fontFamilyTitle }}
                    className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none"
                  >
                    <span className="text-white">HACIENDA</span>{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: metallicGradient }}
                    >
                      F22
                    </span>
                  </h2>
                ) : (
                  <h2
                    style={{ fontFamily: identity.theme.fontFamilyTitle }}
                    className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none"
                  >
                    {project.name}
                  </h2>
                )}
              </div>

              {brand?.logoIcon && (
                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-black/70 backdrop-blur-md border border-[#DFC47B]/40 items-center justify-center p-1.5 shrink-0 shadow-lg">
                  <img
                    src={encodeURI(brand.logoIcon)}
                    alt={brand.shortName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Resumen Técnico de Escenas 360° */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  isCustomBrand ? 'text-[#DFC47B]' : 'text-[#9CD01A]'
                }`}
              >
                • {brand ? `${brand.companyName} • ${identity.categoryLabel}` : identity.categoryLabel}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white/65 leading-relaxed mb-5 line-clamp-2">
              {identity.tagline || project.description}
            </p>

            <div
              className={`grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-black/45 border mb-5 text-center ${
                isCustomBrand ? 'border-[#DFC47B]/25' : 'border-white/[0.07]'
              }`}
            >
              <div>
                <div
                  className="text-lg sm:text-xl font-black font-mono"
                  style={{ color: primaryColor }}
                >
                  {roomCount}
                </div>
                <div className="text-[10px] font-mono uppercase text-white/45">
                  Escenas 360°
                </div>
              </div>
              <div className={`border-x ${isCustomBrand ? 'border-[#DFC47B]/20' : 'border-white/[0.07]'}`}>
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  {totalHotspots}
                </div>
                <div className="text-[10px] font-mono uppercase text-white/45">
                  Hotspots 3D
                </div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  {project.minimapImage ? 'Sí' : 'No'}
                </div>
                <div className="text-[10px] font-mono uppercase text-white/45">
                  Minimapa
                </div>
              </div>
            </div>

            {/* Lista rápida de habitaciones 360° */}
            {roomCount > 0 ? (
              <div className="mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-2">
                  Habitaciones 360° configuradas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {rooms.map((r, i) => (
                    <span
                      key={r.id}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                        isCustomBrand
                          ? 'bg-[#DFC47B]/[0.08] border-[#DFC47B]/30 text-[#F5F2EB]'
                          : 'bg-white/[0.05] border-white/10 text-white/80'
                      }`}
                    >
                      {i + 1}. {r.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90">
                Aún no has subido panorámicas 360° a este proyecto. Haz clic en{' '}
                <strong>Crear Recorrido 360°</strong> para añadir la primera habitación.
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción personalizados según la identidad de marca */}
        <div className="p-5 sm:p-6 pt-0 flex flex-col gap-2.5">
          {mode === 'create' ? (
            <>
              <button
                type="button"
                onClick={() => onConfigureProject(project.id)}
                className={`w-full py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 cursor-pointer ${
                  isCustomBrand
                    ? 'text-[#060608] border border-[#F7E8A8]/50 shadow-[0_8px_25px_rgba(223,196,123,0.32)]'
                    : 'bg-[#9CD01A] hover:bg-[#b0eb1e] text-black shadow-[0_8px_25px_rgba(156,208,26,0.3)]'
                }`}
                style={isCustomBrand ? { backgroundImage: metallicGradient } : undefined}
              >
                <Compass className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {roomCount > 0 ? 'Editar / Añadir Escenas 360°' : 'Crear Recorrido 360°'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (roomCount > 0) {
                      onStart360Tour(project.id);
                    } else {
                      onSelectProject(project.id);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isCustomBrand ? 'border-[#DFC47B]/30 hover:border-[#DFC47B]/60' : 'border-white/10'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>{roomCount > 0 ? 'Probar Tour 360°' : 'Ver Proyecto'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleCopyLink(e, project.id)}
                  className={`py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isCustomBrand ? 'border-[#DFC47B]/30 hover:border-[#DFC47B]/60' : 'border-white/10'
                  }`}
                >
                  {copiedId === project.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                      <span style={{ color: primaryColor }}>¡Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-white/70" />
                      <span>Copiar Link 360°</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onStart360Tour(project.id)}
                className={`w-full py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 cursor-pointer ${
                  isCustomBrand
                    ? 'text-[#060608] border border-[#F7E8A8]/50 shadow-[0_8px_25px_rgba(223,196,123,0.32)]'
                    : 'bg-[#9CD01A] hover:bg-[#b0eb1e] text-black shadow-[0_8px_25px_rgba(156,208,26,0.3)]'
                }`}
                style={isCustomBrand ? { backgroundImage: metallicGradient } : undefined}
              >
                <Compass className="w-4 h-4 stroke-[2.5]" />
                <span>Abrir Recorrido 360° Interactivo</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onConfigureProject(project.id)}
                  className={`py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isCustomBrand ? 'border-[#DFC47B]/30 hover:border-[#DFC47B]/60' : 'border-white/10'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Editar 360°</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleCopyLink(e, project.id)}
                  className={`py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isCustomBrand ? 'border-[#DFC47B]/30 hover:border-[#DFC47B]/60' : 'border-white/10'
                  }`}
                >
                  {copiedId === project.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                      <span style={{ color: primaryColor }}>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-white/70" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`/tour/${project.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border text-xs font-bold text-white flex items-center justify-center gap-1.5 transition ${
                    isCustomBrand ? 'border-[#DFC47B]/30 hover:border-[#DFC47B]/60' : 'border-white/10'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                  <span>Nueva Pestaña</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#090A0E] text-white selection:bg-[#9CD01A] selection:text-[#090A0E] font-sans relative overflow-x-hidden pb-24">
      {/* Fondo Arquitectónico CAD Sutil */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(156,208,26,0.10),transparent_70%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />

      {/* Header Minimalista Exclusivo del Estudio de Recorridos 360° */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090A0E]/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#9CD01A]/15 border border-[#9CD01A]/40 flex items-center justify-center text-[#9CD01A] shadow-[0_0_20px_rgba(156,208,26,0.2)] shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-white uppercase truncate">
                  ESTUDIO DE RECORRIDOS <span className="text-[#9CD01A]">360°</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-[#9CD01A]/15 text-[#9CD01A] border border-[#9CD01A]/30">
                  MASSA VIEW
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/45 block truncate">
                Sesión activa: {currentUserName} • Creador y Archivo 360°
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onBackToHome}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white/85 hover:text-white flex items-center gap-2 transition cursor-pointer"
              title="Volver a la página principal"
            >
              <Globe className="w-3.5 h-3.5 text-[#9CD01A]" />
              <span className="hidden sm:inline">Ver Web Pública</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs font-semibold text-red-300 hover:text-red-200 flex items-center gap-1.5 transition cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 relative z-10">
        {/* Encabezado & Selector de Apartados */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#9CD01A]/10 border border-[#9CD01A]/30 px-3.5 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#9CD01A]" />
              <span className="text-[10px] font-mono font-bold tracking-[0.22em] text-[#9CD01A] uppercase">
                PLATAFORMA EXCLUSIVA DE RECORRIDOS 360°
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-tight">
              {activeSection === 'create' ? (
                <>
                  Crear Recorridos <span className="text-[#9CD01A]">360°</span>
                </>
              ) : (
                <>
                  Recorridos 360° <span className="text-[#9CD01A]">Guardados</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
              {activeSection === 'create'
                ? 'Selecciona cualquiera de los proyectos creados actualmente (Hacienda F22 de AMHO Construcciones o Residencia Ibiza A14) para subir sus esferas 360°, enlazar puntos de navegación (hotspots) y configurar su plano interactivo.'
                : 'Apartado de recorridos 360° creados y guardados en tu biblioteca (incluyendo Sede Marquimoda y Residencia Edinson Jején). Puedes visualizarlos en pantalla completa, compartir su link directo o editar sus escenas.'}
            </p>
          </div>

          {/* Pestañas Principales: 1. Crear 360 (Proyectos Actuales) | 2. Recorridos 360 Guardados */}
          <div className="flex items-center p-1.5 rounded-2xl bg-[#13141A] border border-white/10 self-start lg:self-end shrink-0 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveSection('create')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSection === 'create'
                  ? 'bg-[#9CD01A] text-black shadow-[0_0_20px_rgba(156,208,26,0.35)]'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Proyectos Actuales ({activeCurrentProjects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('saved')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSection === 'saved'
                  ? 'bg-[#9CD01A] text-black shadow-[0_0_20px_rgba(156,208,26,0.35)]'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Recorridos 360° Guardados ({savedToursList.length})</span>
            </button>
          </div>
        </div>

        {/* Notificación de enlace copiado */}
        {copiedId && (
          <div className="mb-6 p-3.5 rounded-2xl bg-[#9CD01A]/15 border border-[#9CD01A]/40 text-[#9CD01A] text-xs font-bold flex items-center gap-2 shadow-lg">
            <Check className="w-4 h-4" />
            <span>Enlace directo del recorrido 360° copiado al portapapeles.</span>
          </div>
        )}

        {/* APARTADO 1: CREAR / CONFIGURAR RECORRIDOS 360° (SOLO PROYECTOS ACTUALES) */}
        {activeSection === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {activeCurrentProjects.map((project) => renderProjectCard(project, 'create'))}
          </div>
        )}

        {/* APARTADO 2: RECORRIDOS 360° GUARDADOS (MARQUIMODA, EDINSON JEJÉN, ETC.) */}
        {activeSection === 'saved' && (
          <div>
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#121318] border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#9CD01A]/15 border border-[#9CD01A]/35 flex items-center justify-center text-[#9CD01A]">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Biblioteca de Recorridos 360° Guardados
                  </h3>
                  <p className="text-xs text-white/55">
                    Aquí se conservan guardados los recorridos 360° de <strong>Sede Marquimoda</strong> y <strong>Residencia Edinson Jején</strong> junto con los recorridos activos.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white/80">
                  Recorridos: <strong className="text-[#9CD01A]">{savedToursList.length}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white/80">
                  Total Escenas 360°: <strong className="text-[#9CD01A]">{totalSavedScenes}</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {savedToursList.map((project) => renderProjectCard(project, 'saved'))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
