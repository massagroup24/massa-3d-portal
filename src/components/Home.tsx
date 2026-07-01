import { Project } from '../data/tourData';
import { ArrowRight, Settings, Plus, Trash2, Link as LinkIcon, Check, Lock, AlertCircle, Building2, Globe, Shield, Compass, Layers, Monitor } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';

interface HomeProps {
  projects: Record<string, Project>;
  onSelectProject: (projectId: string) => void;
  onConfigureProject: (projectId: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

export function Home({ projects, onSelectProject, onConfigureProject, onCreateProject, onDeleteProject }: HomeProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pinModalProject, setPinModalProject] = useState<Project | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleOpenConfiguratorClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setPinModalProject(project);
    setEnteredPin('');
    setPinError(false);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalProject) return;
    const correctPin = pinModalProject.pin || "1234";
    if (enteredPin === correctPin) {
      const targetId = pinModalProject.id;
      setPinModalProject(null);
      setEnteredPin('');
      setPinError(false);
      onConfigureProject(targetId);
    } else {
      setPinError(true);
    }
  };

  const handleCopyLink = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tour/${projectId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Obtenemos foto para fondo difuminado ambiental
  const ambientBackground = Object.values(projects)[0]?.thumbnail || '';
  const totalProjects = Object.keys(projects).length;
  const totalRooms = Object.values(projects).reduce((acc, p) => acc + Object.keys(p.rooms || {}).length, 0);

  return (
    <div className="w-full h-screen bg-[#060609] text-white selection:bg-lime-500 selection:text-black font-sans relative overflow-y-auto overflow-x-hidden">
      
      {/* Executive Navbar */}
      <header className="sticky top-0 z-40 w-full bg-[#060609]/80 backdrop-blur-2xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-white px-5 py-2.5 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.15)] border border-white/20 flex items-center justify-center">
              <img 
                src="/MASSA_REBRANDING.png" 
                alt="MASSA GROUP" 
                className="h-7 md:h-8 object-contain"
                onError={(e) => { e.currentTarget.src = '/MASSA_REBRANDING_PROFILE_REDES_ENTREGABLE_2023_001.png' }}
              />
            </div>
            <div className="hidden sm:flex flex-col border-l border-white/15 pl-6">
              <span className="text-xs font-bold tracking-[0.25em] text-white uppercase font-mono">MASSA GROUP</span>
              <span className="text-[11px] font-medium tracking-wider text-lime-400 uppercase">Executive Immersive Suite</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-medium text-white/70">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
              <span>Plataforma Activa • WebGL 8K HDR</span>
            </div>
            <button 
              onClick={onCreateProject}
              className="bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-300 hover:to-green-400 text-black font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section Ejecutivo */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        {/* Luces y Grid de Arquitectura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(163,230,53,0.12),rgba(255,255,255,0)_70%)] z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none" />
        
        {/* Fondo difuminado ambiental */}
        {ambientBackground && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 blur-[100px] scale-125 z-0 pointer-events-none" 
            style={{ backgroundImage: `url('${ambientBackground}')` }}
          />
        )}

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            {/* Executive Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-lime-400/30 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md shadow-2xl">
              <Building2 className="w-3.5 h-3.5 text-lime-400" />
              <span className="text-[11px] font-semibold tracking-[0.25em] text-lime-300 uppercase">PORTAL ARQUITECTÓNICO MASSA</span>
            </div>
            
            {/* Protagonista MASSA */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
              PORTAL INMERSIVO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-green-400 to-emerald-500 drop-shadow-[0_0_30px_rgba(163,230,53,0.3)]">
                MASSA GROUP
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/60 font-light leading-relaxed mb-10 max-w-2xl border-l-2 border-lime-400/40 pl-5">
              Gestión ejecutiva, edición espacial en tiempo real y recorridos virtuales 360° de alta fidelidad para el portafolio arquitectónico e inmobiliario de MASSA.
            </p>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/10">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <Layers className="w-3.5 h-3.5 text-lime-400" />
                  <span>Proyectos</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{totalProjects}</div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <Compass className="w-3.5 h-3.5 text-lime-400" />
                  <span>Espacios 360°</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{totalRooms}</div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <Monitor className="w-3.5 h-3.5 text-lime-400" />
                  <span>Renderización</span>
                </div>
                <div className="text-sm font-semibold text-white/90 mt-1">WebGL / R3F</div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <Shield className="w-3.5 h-3.5 text-lime-400" />
                  <span>Seguridad</span>
                </div>
                <div className="text-sm font-semibold text-lime-400 mt-1">PIN Protegido</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-5 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-lime-400 text-xs font-semibold tracking-widest uppercase mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>Exploración de Espacios</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Portafolio Arquitectónico MASSA</h2>
          </div>
          <p className="text-sm text-white/50 max-w-sm font-light">
            Selecciona un proyecto para iniciar la exploración en cliente o administra su configuración visual con acceso protegido.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(projects).map((project) => {
            const roomCount = Object.keys(project.rooms || {}).length;
            return (
              <div 
                key={project.id}
                className="group relative bg-[#0e0e14]/80 border border-white/10 hover:border-lime-400/40 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_-15px_rgba(163,230,53,0.2)] flex flex-col justify-between cursor-pointer"
                onClick={() => onSelectProject(project.id)}
              >
                <div>
                  {/* Project Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/60">
                    <img 
                      src={project.thumbnail} 
                      alt={project.name} 
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-108 transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-transparent to-black/30" />
                    
                    {/* Badge de Habitaciones */}
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-medium text-white/90 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-lime-400" />
                      <span>{roomCount} {roomCount === 1 ? 'Espacio' : 'Espacios'} 360°</span>
                    </div>

                    {/* Botón de Borrado */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                      }}
                      className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500/90 text-white/80 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 border border-white/15 hover:border-red-400 shadow-lg"
                      title="Eliminar Proyecto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Project Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold tracking-wide text-white group-hover:text-lime-400 transition-colors">
                        {project.name}
                      </h3>
                    </div>
                    <p className="text-sm text-white/50 mb-6 line-clamp-2 font-light leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-lime-400/90 group-hover:text-lime-300 transition-colors bg-lime-500/10 group-hover:bg-lime-500/20 px-4 py-2 rounded-xl border border-lime-500/20">
                      <span>Explorar Recorrido</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Botones de acción inferiores */}
                <div className="bg-black/50 px-6 py-3.5 border-t border-white/5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-4">
                    <a 
                      href={`/tour/${project.id}`} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
                      title="Abrir como lo vería un cliente"
                    >
                      <span>Ver Cliente</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                    <button 
                      onClick={(e) => handleCopyLink(e, project.id)}
                      className="font-medium text-white/60 hover:text-lime-400 transition-colors flex items-center gap-1.5"
                      title="Copiar enlace para el cliente"
                    >
                      {copiedId === project.id ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                      <span>{copiedId === project.id ? '¡Copiado!' : 'Compartir'}</span>
                    </button>
                  </div>
                  
                  <button 
                    onClick={(e) => handleOpenConfiguratorClick(e, project)}
                    className="flex items-center gap-1.5 font-semibold text-lime-400 hover:text-lime-300 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Edición 3D</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* New Project Card */}
          <div 
            onClick={onCreateProject}
            className="group cursor-pointer bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 hover:border-lime-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col items-center justify-center p-8 min-h-[360px] text-center hover:shadow-[0_0_30px_rgba(163,230,53,0.1)]"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform group-hover:bg-lime-500/20 group-hover:border-lime-500/30 text-white/60 group-hover:text-lime-400 shadow-xl">
              <Plus className="w-8 h-8 stroke-[2]" />
            </div>
            <h3 className="text-xl font-bold text-white/80 group-hover:text-white transition-colors">Crear Proyecto MASSA</h3>
            <p className="text-sm text-white/40 mt-2 max-w-xs font-light leading-relaxed">
              Configura un nuevo recorrido arquitectónico 360°, importa renders e interactúa con el creador visual.
            </p>
            <div className="mt-6 text-xs font-medium text-lime-400/80 group-hover:text-lime-400 flex items-center gap-1">
              <span>Iniciar Configuración</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer corporativo */}
      <footer className="border-t border-white/10 bg-[#040406] py-8 px-6 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span>© {new Date().getFullYear()} MASSA GROUP. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6 text-white/60">
            <span>Tecnología Inmersiva 360°</span>
            <span>•</span>
            <span>Arquitectura Digital</span>
          </div>
        </div>
      </footer>

      {/* Modal de Ingreso con PIN */}
      <Modal 
        isOpen={!!pinModalProject} 
        onClose={() => {
          setPinModalProject(null);
          setEnteredPin('');
          setPinError(false);
        }}
        title="Acceso Protegido MASSA"
      >
        <form onSubmit={handleVerifyPin} className="flex flex-col gap-5 text-center">
          <div className="w-14 h-14 bg-lime-500/10 border border-lime-500/30 rounded-full flex items-center justify-center mx-auto text-lime-400 mb-1 shadow-[0_0_20px_rgba(132,204,22,0.2)]">
            <Lock className="w-7 h-7" />
          </div>
          
          <div>
            <h4 className="text-white font-bold text-lg mb-1">Creador Visual Arquitectónico</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              Introduce el PIN de seguridad de <span className="text-white font-medium">"{pinModalProject?.name}"</span> para autorizar la edición.
            </p>
          </div>

          <div className="relative mt-2">
            <input
              type="password"
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                if (pinError) setPinError(false);
              }}
              autoFocus
              placeholder="••••"
              className={`w-full bg-black/60 border ${pinError ? 'border-red-500/80 text-red-300 focus:border-red-400' : 'border-white/20 focus:border-lime-500 text-white'} rounded-xl px-4 py-3.5 text-center text-xl tracking-[0.5em] font-mono focus:outline-none transition-all shadow-inner`}
              maxLength={10}
            />
            {pinError && (
              <p className="text-red-400 text-xs mt-2 font-medium flex items-center justify-center gap-1.5 animate-bounce">
                <AlertCircle className="w-3.5 h-3.5" /> PIN incorrecto. Inténtalo de nuevo.
              </p>
            )}
            {!pinError && (
              <p className="text-white/40 text-[11px] mt-2">
                PIN por defecto: <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/70 font-mono">1234</code> (editable en Ajustes).
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => {
                setPinModalProject(null);
                setEnteredPin('');
                setPinError(false);
              }}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 py-3 rounded-xl text-sm font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-lime-500 hover:bg-lime-400 text-black py-3 rounded-xl text-sm font-semibold shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)] transition-all flex items-center justify-center gap-2"
            >
              <span>Ingresar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
