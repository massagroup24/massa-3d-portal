import { Project } from '../data/tourData';
import { ArrowRight, Box, Settings, Plus, Trash2, Link as LinkIcon, Check, Lock, AlertCircle } from 'lucide-react';
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

  // Obtenemos la foto del primer proyecto para usarla como fondo desenfocado
  const ambientBackground = Object.values(projects)[0]?.thumbnail || '';

  return (
    <div className="w-full h-screen bg-[#0a0a0f] text-white overflow-y-auto">
      {/* Navbar con Logo MASSA */}
      <div className="absolute top-0 left-0 w-full p-6 z-30 flex justify-between items-center pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.15)] border border-white/20">
          <img 
            src="/MASSA_REBRANDING.png" 
            alt="MASSA" 
            className="h-7 md:h-9 object-contain"
            onError={(e) => { e.currentTarget.src = '/MASSA_REBRANDING_PROFILE_REDES_ENTREGABLE_2023_001.png' }} // Fallback por si la extensión es diferente
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        {/* Fondo con gradiente oscuro y malla sutil */}
        <div className="absolute inset-0 bg-[#050508] z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.08)_0%,transparent_70%)] z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] z-0" />
        
        {/* Fondo dinámico basado en el proyecto actual, con blur extremo */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl scale-150 z-0" 
          style={{ backgroundImage: `url('${ambientBackground}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/80 to-[#0a0a0f] z-10" />
        
        <div className="relative z-20 text-center px-4 mt-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-black/40 border border-lime-500/30 px-5 py-2 rounded-full mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(163,230,53,0.1)]">
            <Box className="w-4 h-4 text-lime-400" />
            <span className="text-xs font-semibold tracking-[0.2em] text-white/90 uppercase">MASSA GROUP PORTAL</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-2xl">
            Experiencias <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500">Inmersivas</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Gestión y visualización avanzada de proyectos arquitectónicos interactivos en 360°.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-8 border-b border-white/10 pb-4">Tus Recorridos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(projects).map((project) => (
            <div 
              key={project.id}
              className="relative group cursor-pointer bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-lime-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-lime-900/20"
              onClick={() => onSelectProject(project.id)}
            >
              {/* Project Image */}
              <div className="relative aspect-video overflow-hidden bg-black/50">
                <img 
                  src={project.thumbnail} 
                  alt={project.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
              </div>
              
              {/* Botón de Borrado */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 border border-white/10 hover:border-red-400"
                title="Eliminar Proyecto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              {/* Project Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 tracking-wide group-hover:text-lime-400 transition-colors">{project.name}</h3>
                <p className="text-sm text-white/50 mb-6 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Iniciar Recorrido
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Botones de acción inferiores */}
              <div className="bg-black/40 px-6 py-3 border-t border-white/5 flex justify-between items-center">
                <div className="flex gap-3">
                  <a 
                    href={`/tour/${project.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-medium text-white/50 hover:text-white transition-colors flex items-center gap-1"
                    title="Abrir como lo vería un cliente"
                  >
                    Ver ↗
                  </a>
                  <button 
                    onClick={(e) => handleCopyLink(e, project.id)}
                    className="text-xs font-medium text-white/50 hover:text-lime-400 transition-colors flex items-center gap-1"
                    title="Copiar enlace para el cliente"
                  >
                    {copiedId === project.id ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    {copiedId === project.id ? '¡Copiado!' : 'Compartir'}
                  </button>
                </div>
                <button 
                  onClick={(e) => handleOpenConfiguratorClick(e, project)}
                  className="flex items-center gap-2 text-xs font-medium text-lime-500 hover:text-lime-400 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Abrir Creador Visual
                </button>
              </div>
            </div>
          ))}

          {/* New Project Card */}
          <div 
            onClick={onCreateProject}
            className="group cursor-pointer bg-white/5 border border-white/10 border-dashed rounded-2xl overflow-hidden hover:bg-white/10 hover:border-lime-500/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-lime-500/20 text-white/50 group-hover:text-lime-400">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-white/70 group-hover:text-white transition-colors">Nuevo Proyecto</h3>
            <p className="text-sm text-white/40 mt-2 text-center px-6">Comienza un nuevo recorrido 360 desde cero</p>
          </div>

        </div>
      </div>

      {/* Modal de Ingreso con PIN */}
      <Modal 
        isOpen={!!pinModalProject} 
        onClose={() => {
          setPinModalProject(null);
          setEnteredPin('');
          setPinError(false);
        }}
        title="Acceso Protegido"
      >
        <form onSubmit={handleVerifyPin} className="flex flex-col gap-5 text-center">
          <div className="w-14 h-14 bg-lime-500/10 border border-lime-500/30 rounded-full flex items-center justify-center mx-auto text-lime-400 mb-1 shadow-[0_0_20px_rgba(132,204,22,0.2)]">
            <Lock className="w-7 h-7" />
          </div>
          
          <div>
            <h4 className="text-white font-semibold text-lg mb-1">Creador Visual 3D</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              Introduce el PIN de seguridad de <span className="text-white font-medium">"{pinModalProject?.name}"</span> para ingresar a la edición.
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
