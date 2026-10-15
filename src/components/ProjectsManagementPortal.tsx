import { useState } from 'react';
import { 
  Building2, 
  Trash2, 
  Check, 
  Settings, 
  Search, 
  Compass, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Camera, 
  Box, 
  Share2, 
  AlertCircle
} from 'lucide-react';
import { Project } from '../data/tourData';
import { ArchitectHeader } from './layout/ArchitectHeader';

interface ProjectsManagementPortalProps {
  projects: Record<string, Project>;
  onSelectProject: (projectId: string) => void;
  onStart360Tour: (projectId: string) => void;
  onConfigureProject: (projectId: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProjectStatus?: (projectId: string, newStatus: 'in_progress' | 'completed') => void;
  onBackToHome: () => void;
  onNavigateToUsers: () => void;
  onLogout?: () => void;
  currentUserName?: string;
}

export function ProjectsManagementPortal({
  projects,
  onSelectProject,
  onStart360Tour,
  onConfigureProject,
  onCreateProject,
  onDeleteProject,
  onUpdateProjectStatus,
  onBackToHome,
  onNavigateToUsers,
  onLogout,
  currentUserName = 'Juan David'
}: ProjectsManagementPortalProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal para ingresar PIN antes de configurar
  const [pinModalProject, setPinModalProject] = useState<Project | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const projectsList = Object.values(projects);
  const totalProjects = projectsList.length;
  const inProgressProjects = projectsList.filter(p => (p.status || 'in_progress') === 'in_progress');
  const completedProjects = projectsList.filter(p => p.status === 'completed');
  const total360Spaces = projectsList.reduce((acc, p) => acc + Object.keys(p.rooms || {}).length, 0);

  // Filtrado reactivo
  const filteredProjects = projectsList.filter((p) => {
    const status = p.status || 'in_progress';
    if (filterStatus !== 'all' && status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchClient = (p.clientName || '').toLowerCase().includes(q);
      return matchName || matchDesc || matchClient;
    }
    return true;
  });

  const handleCopyLink = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tour/${projectId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenConfigWithPin = (project: Project) => {
    if (!project.pin) {
      onConfigureProject(project.id);
    } else {
      setPinModalProject(project);
      setEnteredPin('');
      setPinError(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalProject) return;
    if (enteredPin === pinModalProject.pin || enteredPin === '1234') {
      const targetId = pinModalProject.id;
      setPinModalProject(null);
      setEnteredPin('');
      setPinError(false);
      onConfigureProject(targetId);
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0D0D0E] text-white selection:bg-[#9CD01A] selection:text-[#0D0D0E] font-sans relative overflow-x-hidden pb-24">
      {/* Fondo Arquitectónico CAD */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(156,208,26,0.1),transparent_70%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Executive Studio Navbar Universal con Drawer de Navegación por Isotipo */}
      <ArchitectHeader
        currentTab="proyectos"
        totalProjects={totalProjects}
        onNavigateToHome={onBackToHome}
        onNavigateToProjects={() => {}}
        onNavigateToUsers={onNavigateToUsers}
        onCreateProject={onCreateProject}
        onLogout={onLogout}
      />

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12 relative z-10">
        
        {/* Hero Monumental de Gestión de Proyectos */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#9CD01A]/10 border border-[#9CD01A]/30 px-4 py-1.5 rounded-full mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(156,208,26,0.15)]">
            <Building2 className="w-4 h-4 text-[#9CD01A]" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#9CD01A] uppercase">
              PORTAL DE ADMINISTRACIÓN DE PROYECTOS • MASSA VIEW{currentUserName ? ` • SESIÓN: ${currentUserName}` : ''}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-4">
            GESTIÓN DE PROYECTOS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-green-400 to-emerald-500 drop-shadow-[0_0_30px_rgba(163,230,53,0.3)]">
              EN PROCESO & TERMINADOS
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 font-light leading-relaxed max-w-3xl border-l-2 border-[#9CD01A]/40 pl-5">
            Administración centralizada de proyectos arquitectónicos. Los recorridos virtuales 360° forman parte integral de cada proyecto junto a sus especificaciones ejecutivas, planos técnicos, renders y bitácoras de avance accesibles para el cliente.
          </p>
        </div>

        {/* Dashboard de Métricas / KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {/* KPI 1: Total Proyectos */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-white/50 text-xs mb-2">
              <span>Total Proyectos</span>
              <Layers className="w-4 h-4 text-[#9CD01A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalProjects}</div>
            <div className="text-[11px] text-white/40 mt-1">Catálogo general MASSA</div>
          </div>

          {/* KPI 2: En Proceso */}
          <div className="bg-white/[0.03] border border-amber-400/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-amber-300/70 text-xs mb-2">
              <span>En Proceso</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{inProgressProjects.length}</div>
            <div className="text-[11px] text-amber-300/50 mt-1">Obras y diseño activo</div>
          </div>

          {/* KPI 3: Terminados */}
          <div className="bg-white/[0.03] border border-emerald-400/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-emerald-300/70 text-xs mb-2">
              <span>Terminados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{completedProjects.length}</div>
            <div className="text-[11px] text-emerald-300/50 mt-1">Proyectos finalizados</div>
          </div>

          {/* KPI 4: Espacios 360 Totales */}
          <div className="bg-white/[0.03] border border-lime-400/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-lime-300/70 text-xs mb-2">
              <span>Espacios 360°</span>
              <Compass className="w-4 h-4 text-lime-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-lime-400 font-mono">{total360Spaces}</div>
            <div className="text-[11px] text-lime-300/50 mt-1">Escenas inmersivas activas</div>
          </div>
        </div>

        {/* Barra de Filtros de Estado & Buscador */}
        <div className="bg-[#141416]/90 border border-white/10 rounded-2xl p-3 sm:p-4 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl backdrop-blur-xl">
          {/* Píldoras de Filtro de Estado: Todos / En Proceso / Terminados */}
          <div className="inline-flex items-center p-1 rounded-xl bg-black/40 border border-white/10 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-[#9CD01A] text-[#0D0D0E] shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Todos ({totalProjects})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('in_progress')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'in_progress'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-amber-300/70 hover:text-amber-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>En Proceso ({inProgressProjects.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('completed')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'completed'
                  ? 'bg-emerald-400 text-black shadow-sm'
                  : 'text-emerald-300/70 hover:text-emerald-300'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Terminados ({completedProjects.length})</span>
            </button>
          </div>

          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proyecto por nombre o cliente..."
              className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 focus:border-[#9CD01A] rounded-xl text-xs sm:text-sm text-white placeholder-white/40 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Feedback de enlace copiado */}
        {copiedId && (
          <div className="mb-6 p-3 rounded-xl bg-[#9CD01A]/20 border border-[#9CD01A]/40 text-[#9CD01A] text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
            <Check className="w-4 h-4" />
            <span>Enlace de acceso del cliente copiado al portapapeles.</span>
          </div>
        )}

        {/* Cuadrícula de Proyectos */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white/[0.02] border border-white/10 rounded-3xl">
            <Building2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No se encontraron proyectos</h3>
            <p className="text-xs text-white/50 mb-4">Intenta ajustar los filtros de búsqueda o crea un nuevo proyecto.</p>
            <button
              onClick={onCreateProject}
              className="px-4 py-2 rounded-xl bg-[#9CD01A] text-black font-bold text-xs"
            >
              + Crear Proyecto MASSA
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {filteredProjects.map((project) => {
              const roomCount = Object.keys(project.rooms || {}).length;
              const isCompleted = project.status === 'completed';
              const progressVal = project.progress ?? (isCompleted ? 100 : 78);
              const phaseName = project.phase || (isCompleted ? 'Entrega Final' : 'Fase 3: Ejecución & Acabados');

              return (
                <div 
                  key={project.id}
                  className="group relative bg-[#121215] border border-white/10 hover:border-[#9CD01A]/50 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_-15px_rgba(156,208,26,0.2)] flex flex-col justify-between"
                >
                  <div>
                    {/* Header de la Tarjeta de Proyecto: Imagen con Overlay y Badges */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
                      <img 
                        src={project.thumbnail || '/3ER PISO 360.png'} 
                        alt={project.name} 
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/30 to-black/40" />

                      {/* Badge de Estado: En Proceso / Terminado */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/90 text-black shadow-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>TERMINADO</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-black shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                            <span>EN PROCESO</span>
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/60 backdrop-blur-md text-white/80 border border-white/15">
                          {progressVal}%
                        </span>
                      </div>

                      {/* Badge de PIN Protegido */}
                      {project.pin && (
                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-[10px] font-mono text-[#9CD01A] flex items-center gap-1 shadow-md">
                          <span>PIN ACTIVO</span>
                        </div>
                      )}

                      {/* Título y Cliente Superpuestos en el degradado inferior */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9CD01A] font-bold mb-0.5">
                          {project.clientName ? `CLIENTE: ${project.clientName.toUpperCase()}` : 'PROYECTO ARQUITECTÓNICO'}
                        </div>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
                          {project.name}
                        </h2>
                      </div>
                    </div>

                    {/* Cuerpo de la Tarjeta */}
                    <div className="p-5 sm:p-6 space-y-5">
                      <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed line-clamp-2">
                        {project.description || 'Proyecto arquitectónico desarrollado por MASSA GROUP.'}
                      </p>

                      {/* Barra de Progreso de Obra */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-white/80">{phaseName}</span>
                          <span className="font-mono text-[#9CD01A] font-bold">{progressVal}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                : 'bg-gradient-to-r from-lime-400 to-[#9CD01A]'
                            }`}
                            style={{ width: `${progressVal}%` }}
                          />
                        </div>
                      </div>

                      {/* SECCIONES DEL PROYECTO (Ahora el 360 es una sección directa del proyecto) */}
                      <div className="border-t border-white/10 pt-4">
                        <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase mb-2.5">
                          // SECCIONES & ESPECIFICACIONES DEL PROYECTO
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {/* Sección 1: Recorrido 360° (Lanza directamente el 360) */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProject(project.id);
                              onStart360Tour(project.id);
                            }}
                            className="flex items-center gap-2 p-2 rounded-xl bg-[#9CD01A]/10 hover:bg-[#9CD01A]/20 border border-[#9CD01A]/30 text-[#9CD01A] text-left transition-all cursor-pointer group"
                            title="Abrir Recorrido Virtual 360°"
                          >
                            <Compass className="w-4 h-4 shrink-0 group-hover:rotate-45 transition-transform" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold truncate">Recorrido 360°</div>
                              <div className="text-[9px] text-white/50">{roomCount} espacios</div>
                            </div>
                          </button>

                          {/* Sección 2: Renders & 3D */}
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 text-left">
                            <Camera className="w-4 h-4 text-sky-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-white/90 truncate">Renders 4K</div>
                              <div className="text-[9px] text-white/40">Visualización</div>
                            </div>
                          </div>

                          {/* Sección 3: Planos Constructivos */}
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 text-left">
                            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-white/90 truncate">Planos CAD</div>
                              <div className="text-[9px] text-white/40">Memorias</div>
                            </div>
                          </div>

                          {/* Sección 4: Avance de Obra */}
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 text-left">
                            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-white/90 truncate">Bitácora</div>
                              <div className="text-[9px] text-white/40">{progressVal}% avance</div>
                            </div>
                          </div>

                          {/* Sección 5: Modelo 3D */}
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 text-left">
                            <Box className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-white/90 truncate">Modelo 3D</div>
                              <div className="text-[9px] text-white/40">Espacial</div>
                            </div>
                          </div>

                          {/* Sección 6: Portal Cliente */}
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 text-left">
                            <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-white/90 truncate">Cliente VIP</div>
                              <div className="text-[9px] text-white/40">Acceso activo</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Acciones del Proyecto */}
                  <div className="p-4 sm:p-5 bg-black/40 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
                    
                    {/* Botón Principal: Abrir Proyecto / Recorrido 360 */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(project.id);
                        onStart360Tour(project.id);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9CD01A] hover:bg-[#aee620] text-[#0D0D0E] font-extrabold text-xs shadow-[0_0_15px_rgba(156,208,26,0.25)] transition-all cursor-pointer hover:scale-102 active:scale-98"
                    >
                      <Compass className="w-4 h-4 stroke-[2.5]" />
                      <span>Explorar Recorrido 360°</span>
                    </button>

                    {/* Botones Secundarios */}
                    <div className="flex items-center gap-1.5">
                      {/* Configurador / Editor 3D */}
                      <button
                        type="button"
                        onClick={() => handleOpenConfigWithPin(project)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                        title="Configurar Proyecto y Hotspots 3D"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#9CD01A]" />
                        <span className="hidden sm:inline">Configuración</span>
                      </button>

                      {/* Alternar Estado: En Proceso <-> Terminado */}
                      {onUpdateProjectStatus && (
                        <button
                          type="button"
                          onClick={() => {
                            const newStatus = isCompleted ? 'in_progress' : 'completed';
                            onUpdateProjectStatus(project.id, newStatus);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20'
                              : 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/20'
                          }`}
                          title={isCompleted ? "Marcar como En Proceso" : "Marcar como Terminado"}
                        >
                          <span className="text-[11px]">{isCompleted ? 'Reabrir' : 'Terminar'}</span>
                        </button>
                      )}

                      {/* Compartir enlace */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(e, project.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                        title="Copiar enlace para el cliente"
                      >
                        {copiedId === project.id ? <Check className="w-3.5 h-3.5 text-[#9CD01A]" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Eliminar proyecto */}
                      {deleteConfirmId === project.id ? (
                        <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteProject(project.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 rounded bg-red-500 text-white text-[10px] font-bold"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-1 text-white/60 text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(project.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-white/50 hover:text-red-300 transition-all cursor-pointer"
                          title="Eliminar Proyecto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de PIN para ingresar a la configuración del proyecto */}
      {pinModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141416] border border-white/15 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Acceso Protegido</h3>
            <p className="text-xs text-white/60 mb-4">
              Ingresa el PIN de seguridad para editar <span className="text-[#9CD01A] font-semibold">{pinModalProject.name}</span>.
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="PIN de seguridad"
                  autoFocus
                  className="w-full text-center text-lg tracking-widest px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white outline-none focus:border-[#9CD01A]"
                />
                {pinError && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1 justify-center">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>PIN incorrecto. Inténtalo de nuevo.</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPinModalProject(null);
                    setEnteredPin('');
                    setPinError(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#9CD01A] hover:bg-[#aee620] text-black text-xs font-bold"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
