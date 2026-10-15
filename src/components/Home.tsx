import { useState } from 'react';
import { Project } from '../data/tourData';
import { 
  Building2, 
  Layers 
} from 'lucide-react';
import { VisitsDashboard } from './VisitsDashboard';
import { ActionCarousel3D } from './home/ActionCarousel3D';
import { ArchitectHeader } from './layout/ArchitectHeader';

// Icono de barra lateral exacto al usado en la plataforma MASSA


interface HomeProps {
  projects: Record<string, Project>;
  onCreateProject: () => void;
  userRole?: 'visitor' | 'editor';
  userName?: string;
  onSwitchRole?: () => void;
  onSwitchToClient?: () => void;
  onLogout?: () => void;
  onNavigateToProjects: () => void;
  onNavigateToUsers: () => void;
}

export function Home({ 
  projects, 
  onCreateProject, 
  userName,
  onSwitchRole,
  onSwitchToClient,
  onLogout,
  onNavigateToProjects,
  onNavigateToUsers
}: HomeProps) {
  const [sessionUserName] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('massa_3d_name') : null;
  });

  // Obtener nombre del arquitecto autenticado para bienvenida personalizada
  const getDisplayName = () => {
    if (sessionUserName && sessionUserName.trim()) {
      return sessionUserName.split('-')[0].trim();
    }
    if (userName && userName.trim()) {
      return userName.split('-')[0].trim();
    }
    const storedName = typeof window !== 'undefined' ? sessionStorage.getItem('massa_3d_name') : null;
    if (storedName && storedName.trim()) {
      return storedName.split('-')[0].trim();
    }
    const storedUsername = typeof window !== 'undefined' ? sessionStorage.getItem('massa_3d_username') : null;
    if (storedUsername && storedUsername.trim()) {
      if (storedUsername.toLowerCase().includes('juan')) return 'Juan David';
      return storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1);
    }
    return 'Juan David';
  };

  const displayName = getDisplayName();
  const userLevel = typeof window !== 'undefined' ? sessionStorage.getItem('massa_3d_user_level') : null;
  const isAdmin = userLevel === 'admin';
  const [showVisitsModal, setShowVisitsModal] = useState(false);

  const totalProjects = Object.keys(projects).length;

  return (
    <div className="w-full h-full min-h-screen bg-[#0D0D0E] text-white selection:bg-[#9CD01A] selection:text-[#0D0D0E] font-sans relative overflow-y-auto overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* Executive Studio Navbar Universal con Drawer de Navegación por Isotipo */}
      <ArchitectHeader
        currentTab="inicio"
        totalProjects={totalProjects}
        onNavigateToHome={() => {}}
        onNavigateToProjects={onNavigateToProjects}
        onNavigateToUsers={onNavigateToUsers}
        onCreateProject={onCreateProject}
        onLogout={onLogout}
        onSwitchRole={onSwitchRole}
        onSwitchToClient={onSwitchToClient}
        isAdmin={isAdmin}
        onOpenVisits={() => setShowVisitsModal(true)}
      />

      {/* Hero Section Ejecutivo */}
      <section className="relative pt-14 sm:pt-16 pb-16 px-6 overflow-hidden">
        {/* Luces y Grid de Arquitectura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(163,230,53,0.12),rgba(255,255,255,0)_70%)] z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mb-4 sm:mb-6">
            {/* Executive Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-lime-400/30 px-4 py-1.5 rounded-full mb-5 backdrop-blur-md shadow-2xl">
              <Building2 className="w-3.5 h-3.5 text-lime-400" />
              <span className="text-[11px] font-semibold tracking-[0.25em] text-lime-300 uppercase">PORTAL ARQUITECTÓNICO MASSA</span>
            </div>
            
            {/* Protagonista MASSA - Bienvenida con Nombre Propio */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-4">
              BIENVENIDO, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-green-400 to-emerald-500 drop-shadow-[0_0_30px_rgba(163,230,53,0.3)]">
                {displayName.toUpperCase()}
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-white/60 font-light leading-relaxed max-w-2xl border-l-2 border-lime-400/40 pl-5">
              Gestión ejecutiva, edición espacial en tiempo real y administración integral de proyectos arquitectónicos para el portafolio de MASSA.
            </p>
          </div>

          {/* Carrusel 3D Coverflow de Acciones Principales (Protagonista de la pantalla) */}
          <div className="my-2 sm:my-4">
            <ActionCarousel3D
              onNavigateToProjects={onNavigateToProjects}
              onCreateProject={onCreateProject}
              onNavigateToUsers={onNavigateToUsers}
            />
          </div>

          {/* Indicador discreto de Proyectos en Catálogo */}
          <div className="flex justify-center pt-8 sm:pt-10 border-t border-white/10">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-3.5 backdrop-blur-md flex items-center gap-4 shadow-lg">
              <div className="flex items-center gap-2.5 text-white/60 text-xs sm:text-sm font-medium">
                <Layers className="w-4 h-4 text-[#9CD01A]" />
                <span>Proyectos Registrados</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono pl-3 border-l border-white/10">
                {totalProjects}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Registro de Visitas */}
      {showVisitsModal && (
        <VisitsDashboard onClose={() => setShowVisitsModal(false)} />
      )}
    </div>
  );
}
