import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { TourContainer } from './components/TourContainer';
import { Home } from './components/Home';
import { ProjectConfigurator } from './components/ProjectConfigurator';
import { ClientViewer } from './components/ClientViewer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { LoginScreen } from './components/LoginScreen';
import { PortalLayout } from './components/layout/PortalLayout';
import { ClientHome } from './components/ClientHome';
import { RendersGallery } from './components/portal/RendersGallery';
import { BlueprintsViewer } from './components/portal/BlueprintsViewer';
import { Model3DViewer } from './components/portal/Model3DViewer';
import { Tour360Section } from './components/portal/Tour360Section';
import { ProgressTimeline } from './components/portal/ProgressTimeline';
import { ArchitectContactModal } from './components/portal/ArchitectContactModal';
import { getProjectPortalData, ProjectPortalData } from './services/portalService';
import { NavTab } from './components/ui/Dock';
import { projectsData, Project, normalizeProject } from './data/tourData';
import { getProjectsFromSupabase, saveProjectToSupabase } from './supabase';

function MainPortal() {
  // Estado de rol: 'portal' (muestra login), 'client' (portal cliente), 'architect' (panel arquitecto)
  const [userRole, setUserRole] = useState<'portal' | 'client' | 'architect'>(() => {
    try {
      const saved = sessionStorage.getItem('massa_3d_role');
      if (saved === 'editor') return 'architect';
      if (saved === 'visitor') return 'client';
      return 'portal';
    } catch {
      return 'portal';
    }
  });

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [projects, setProjects] = useState<Record<string, Project>>(() => {
    const normalized: Record<string, Project> = {};
    Object.keys(projectsData).forEach(key => {
      normalized[key] = normalizeProject(projectsData[key]);
    });
    return normalized;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return Object.keys(projectsData)[0] || null;
  });
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [configuringProjectId, setConfiguringProjectId] = useState<string | null>(null);
  const [tourStarted, setTourStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<ProjectPortalData | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Cargar proyectos desde Supabase con normalización defensiva
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de espera agotado (límite 10s)")), 10000)
        );

        const fbProjects = await Promise.race([
          getProjectsFromSupabase(),
          timeoutPromise
        ]);
        
        if (fbProjects.length === 0) {
          for (const key of Object.keys(projectsData)) {
            await saveProjectToSupabase(projectsData[key]);
          }
          const normalized: Record<string, Project> = {};
          Object.keys(projectsData).forEach(key => {
            normalized[key] = normalizeProject(projectsData[key]);
          });
          setProjects(normalized);
        } else {
          const loadedProjects: Record<string, Project> = {};
          fbProjects.forEach(p => {
            if (p && p.id) {
              loadedProjects[p.id] = normalizeProject(p);
            }
          });
          setProjects(loadedProjects);
          if (!activeProjectId && fbProjects[0]?.id) {
            setActiveProjectId(fbProjects[0].id);
          }
        }
        setSyncError(null);
      } catch (error: any) {
        console.warn("Usando datos locales por desconexión de Supabase:", error);
        setSyncError("Conexión con Supabase en modo local.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cargar datos de proyecto extendidos (Renders, Planos, Avances) para el portal
  useEffect(() => {
    if (!activeProjectId) return;
    const currentProj = projects[activeProjectId];
    getProjectPortalData(activeProjectId, currentProj)
      .then((data) => setPortalData(data))
      .catch((err) => console.warn("Error cargando portal data:", err));
  }, [activeProjectId, projects]);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setTourStarted(false);
    const proj = projects[projectId];
    if (proj) {
      const firstRoomId = proj.rooms ? Object.keys(proj.rooms)[0] : null;
      const validRoomId = (proj.rooms && proj.rooms[proj.initialRoomId]) ? proj.initialRoomId : firstRoomId;
      setCurrentRoomId(validRoomId || null);
    }
  };

  const handleStart360Tour = () => {
    const projId = activeProjectId || Object.keys(projects)[0];
    if (projId && projects[projId]) {
      const proj = projects[projId];
      const firstRoomId = proj.rooms ? Object.keys(proj.rooms)[0] : null;
      const validRoomId = (proj.rooms && proj.rooms[proj.initialRoomId]) ? proj.initialRoomId : firstRoomId;
      setCurrentRoomId(validRoomId || null);
      setActiveProjectId(projId);
      setTourStarted(true);
    }
  };

  const handleBackToPortal = () => {
    setTourStarted(false);
    setActiveTab('home');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('massa_3d_role');
    sessionStorage.removeItem('massa_client_email');
    setUserRole('portal');
    setTourStarted(false);
    setActiveTab('home');
  };

  const handleLoginSuccess = (role: 'client' | 'architect') => {
    setUserRole(role);
    setActiveTab('home');
  };

  const handleSaveProject = (updatedProject: Project) => {
    if (!updatedProject || !updatedProject.id) return;
    setProjects(prev => ({
      ...prev,
      [updatedProject.id]: normalizeProject(updatedProject)
    }));
  };

  const handleCreateNewProject = () => {
    const newId = `project_${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: "Nuevo Proyecto MASSA",
      description: "Descripción de tu proyecto arquitectónico.",
      thumbnail: "",
      minimapImage: "",
      initialRoomId: "room_1",
      rooms: {
        "room_1": {
          id: "room_1",
          name: "Habitación Inicial",
          description: "Punto de partida",
          imageUrl: "",
          minimapPosition: { x: 50, y: 50 },
          hotspots: []
        }
      }
    };
    setProjects(prev => ({ ...prev, [newId]: newProject }));
    setConfiguringProjectId(newId);
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este proyecto de forma permanente?");
    if (!confirmDelete) return;

    try {
      const { deleteProjectFromSupabase } = await import('./supabase');
      await deleteProjectFromSupabase(projectId);
      setProjects(prev => {
        const copy = { ...prev };
        delete copy[projectId];
        return copy;
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Hubo un error al eliminar el proyecto.");
    }
  };

  // Pantalla de carga mientras conecta
  if (loading) {
    return (
      <div className="w-full h-screen bg-[#0D0D0E] text-white flex flex-col items-center justify-center gap-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-[#9CD01A]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#9CD01A] animate-spin"></div>
        </div>
        <div className="text-xs font-semibold tracking-widest text-[#9CD01A] animate-pulse uppercase">
          VIEW by MASSA GROUP
        </div>
      </div>
    );
  }

  // 1. Pantalla de Login si no ha iniciado sesión
  if (userRole === 'portal') {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onExplorePublicTours={() => {
          setUserRole('client');
        }}
      />
    );
  }

  // 2. Editor de Recorridos 360 (Si está activo por el arquitecto)
  if (configuringProjectId) {
    const projectToConfigure = projects[configuringProjectId];
    if (!projectToConfigure) {
      return (
        <div className="w-full h-screen bg-[#0D0D0E] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#9CD01A]/20 border-t-[#9CD01A] rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <ProjectConfigurator
        initialProject={projectToConfigure}
        onClose={() => setConfiguringProjectId(null)}
        onSave={handleSaveProject}
      />
    );
  }

  // 3. Recorrido 360° en pantalla completa (Reutilizando motor Three.js existente)
  const currentProject = (activeProjectId && projects[activeProjectId]) ? projects[activeProjectId] : Object.values(projects)[0];
  const firstAvailableRoomId = currentProject?.rooms ? Object.keys(currentProject.rooms)[0] : null;
  const currentRoom = currentProject?.rooms 
    ? (currentRoomId && currentProject.rooms[currentRoomId] ? currentProject.rooms[currentRoomId] : (firstAvailableRoomId ? currentProject.rooms[firstAvailableRoomId] : undefined)) 
    : undefined;

  if (tourStarted && currentProject && currentRoom) {
    return (
      <TourContainer
        currentRoom={currentRoom}
        rooms={currentProject.rooms}
        minimapImage={currentProject.minimapImage}
        onNavigate={(roomId) => setCurrentRoomId(roomId)}
        onBackToHome={handleBackToPortal}
      />
    );
  }

  // 4. Panel de Administrador / Arquitecto (si seleccionó rol Arquitecto)
  if (userRole === 'architect') {
    return (
      <div className="relative w-full min-h-screen bg-[#0D0D0E] text-white">
        {/* Banner de barra superior para alternar a vista de cliente */}
        <div className="bg-[#171717]/90 border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9CD01A]" />
            <span className="font-bold text-[#F5F5F5]">Modo Arquitecto MASSA</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUserRole('client')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F5F5] font-semibold transition"
            >
              Ver Portal como Cliente
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 font-semibold transition"
            >
              Salir
            </button>
          </div>
        </div>

        <Home
          projects={projects}
          onSelectProject={handleSelectProject}
          onConfigureProject={setConfiguringProjectId}
          onCreateProject={handleCreateNewProject}
          onDeleteProject={handleDeleteProject}
          userRole="editor"
          onSwitchRole={() => setUserRole('portal')}
        />
      </div>
    );
  }

  // 5. Portal del Cliente con Sistema de Diseño visionOS (Fase 2)
  const currentDisplayName = portalData?.name || currentProject?.name || 'Villa Serena';

  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'contact') {
      setIsContactModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <PortalLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      projectName={currentDisplayName}
      userRole="client"
      onLogout={handleLogout}
    >
      {syncError && (
        <div className="mb-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3.5 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>{syncError}</span>
        </div>
      )}

      {/* SECCIÓN 0: HOME / DASHBOARD */}
      {activeTab === 'home' && (
        <ClientHome
          projectName={currentDisplayName}
          clientName={portalData?.clientName || 'Carlos'}
          phase={portalData?.currentPhase || 'FASE 3'}
          progressPercentage={portalData?.currentProgress ?? 68}
          architect={portalData?.architect}
          onContactArchitect={() => setIsContactModalOpen(true)}
          onNavigateSection={handleSelectTab}
          onOpen360Tour={handleStart360Tour}
        />
      )}

      {/* SECCIÓN 1: RENDERS */}
      {activeTab === 'renders' && (
        <RendersGallery
          renders={portalData?.renders || []}
          projectName={currentDisplayName}
        />
      )}

      {/* SECCIÓN 2: PLANOS */}
      {activeTab === 'blueprints' && (
        <BlueprintsViewer
          blueprints={portalData?.blueprints || []}
          projectName={currentDisplayName}
        />
      )}

      {/* SECCIÓN 3: MODELO 3D */}
      {activeTab === 'model3d' && (
        <Model3DViewer
          projectName={currentDisplayName}
        />
      )}

      {/* SECCIÓN 4: RECORRIDO 360° */}
      {activeTab === 'tour360' && (
        <Tour360Section
          projectName={currentDisplayName}
          rooms={currentProject?.rooms || {}}
          minimapImage={currentProject?.minimapImage || ''}
          onLaunchTour={(roomId) => {
            if (roomId) setCurrentRoomId(roomId);
            setTourStarted(true);
          }}
        />
      )}

      {/* SECCIÓN 5: AVANCE DE OBRA */}
      {activeTab === 'progress' && (
        <ProgressTimeline
          progressUpdates={portalData?.progressUpdates || []}
          currentPhase={portalData?.currentPhase || 'FASE 3'}
          currentProgress={portalData?.currentProgress ?? 68}
          projectName={currentDisplayName}
          beforeAfterComparison={portalData?.beforeAfterComparison}
        />
      )}

      {/* MODAL DE CONTACTO CON EL ARQUITECTO */}
      {portalData?.architect && (
        <ArchitectContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          architect={portalData.architect}
          projectName={currentDisplayName}
        />
      )}
    </PortalLayout>
  );
}

export default function App() {
  return (
    <LazyMotion features={domAnimation}>
      <PWAInstallBanner />
      <Routes>
        <Route path="/" element={<MainPortal />} />
        <Route path="/tour/:id" element={<ClientViewer />} />
      </Routes>
    </LazyMotion>
  );
}
