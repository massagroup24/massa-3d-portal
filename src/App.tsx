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
import { GuestHome } from './components/portal/GuestHome';
import { GuestPortfolioShowcase } from './components/portal/GuestPortfolioShowcase';
import { ProjectSpecs } from './components/portal/ProjectSpecs';
import { getProjectPortalData, getProjectPublicSpecs, ProjectPortalData } from './services/portalService';
import { NavTab } from './components/ui/Dock';
import { projectsData, Project, normalizeProject } from './data/tourData';
import { getProjectsFromSupabase, saveProjectToSupabase } from './supabase';
import { Lock } from 'lucide-react';
import { UsersManagementPortal } from './components/UsersManagementPortal';
import { ProjectsManagementPortal } from './components/ProjectsManagementPortal';

function MainPortal({ initialTab }: { initialTab?: 'inicio' | 'proyectos' | 'usuarios' }) {
  // Estado de rol: 'portal' (muestra login), 'guest' (invitado portafolio público), 'client' (portal cliente), 'architect' (panel arquitecto)
  const [userRole, setUserRole] = useState<'portal' | 'guest' | 'client' | 'architect'>(() => {
    try {
      const saved = sessionStorage.getItem('massa_3d_role') || localStorage.getItem('massa_3d_role');
      if (saved === 'editor') return 'architect';
      if (saved === 'visitor') return 'client';
      if (saved === 'guest') return 'guest';
      return 'portal';
    } catch {
      return 'portal';
    }
  });

  // Mantener sincronizado localStorage para nuevas pestañas
  useEffect(() => {
    try {
      const currentRole = sessionStorage.getItem('massa_3d_role');
      if (currentRole) {
        localStorage.setItem('massa_3d_role', currentRole);
        const name = sessionStorage.getItem('massa_3d_name');
        if (name) localStorage.setItem('massa_3d_name', name);
        const username = sessionStorage.getItem('massa_3d_username');
        if (username) localStorage.setItem('massa_3d_username', username);
        const level = sessionStorage.getItem('massa_3d_user_level');
        if (level) localStorage.setItem('massa_3d_user_level', level);
      }
    } catch {
      // ignore
    }
  }, [userRole]);

  const [architectTab, setArchitectTab] = useState<'inicio' | 'proyectos' | 'usuarios'>(() => {
    if (initialTab) return initialTab;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'usuarios' || window.location.pathname.includes('/admin/usuarios')) {
        return 'usuarios';
      }
      if (params.get('tab') === 'proyectos' || window.location.pathname.includes('/admin/proyectos')) {
        return 'proyectos';
      }
    } catch {
      // ignore
    }
    return 'inicio';
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
  const [guestView, setGuestView] = useState<'showcase' | 'project'>('showcase');
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
          const normalized: Record<string, Project> = {};
          Object.keys(projectsData).forEach(key => {
            normalized[key] = normalizeProject(projectsData[key]);
          });
          setProjects(normalized);
        } else {
          // Usar estrictamente los proyectos reales creados y guardados en Supabase
          const loadedProjects: Record<string, Project> = {};
          fbProjects.forEach(p => {
            if (p && p.id) {
              loadedProjects[p.id] = normalizeProject(p);
            }
          });
          setProjects(loadedProjects);

          if (!activeProjectId || !loadedProjects[activeProjectId]) {
            const firstId = Object.keys(loadedProjects)[0];
            if (firstId) setActiveProjectId(firstId);
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
    const currentProj = projects[activeProjectId] || projectsData[activeProjectId];
    getProjectPortalData(activeProjectId, currentProj)
      .then((data) => setPortalData(data))
      .catch((err) => console.warn("Error cargando portal data:", err));
  }, [activeProjectId, projects]);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setTourStarted(false);
    const proj = projects[projectId] || projectsData[projectId];
    if (proj) {
      const firstRoomId = proj.rooms ? Object.keys(proj.rooms)[0] : null;
      const validRoomId = (proj.rooms && proj.rooms[proj.initialRoomId]) ? proj.initialRoomId : firstRoomId;
      setCurrentRoomId(validRoomId || null);
    } else {
      const fallback = projects[Object.keys(projects)[0]] || projectsData[Object.keys(projectsData)[0]];
      if (fallback) {
        const firstRoomId = fallback.rooms ? Object.keys(fallback.rooms)[0] : null;
        setCurrentRoomId(firstRoomId || null);
      }
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
    sessionStorage.removeItem('massa_3d_username');
    sessionStorage.removeItem('massa_3d_name');
    sessionStorage.removeItem('massa_3d_user_level');

    try {
      localStorage.removeItem('massa_3d_role');
      localStorage.removeItem('massa_client_email');
      localStorage.removeItem('massa_3d_username');
      localStorage.removeItem('massa_3d_name');
      localStorage.removeItem('massa_3d_user_level');
    } catch {
      // ignore
    }

    setUserRole('portal');
    setGuestView('showcase');
    setTourStarted(false);
    setActiveTab('home');
  };

  const handleLoginSuccess = (role: 'guest' | 'client' | 'architect') => {
    setUserRole(role);
    if (role === 'guest') {
      setGuestView('showcase');
    }
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
          handleLoginSuccess('guest');
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
  const currentProject = (activeProjectId && (projects[activeProjectId] || projectsData[activeProjectId])) 
    ? (projects[activeProjectId] || projectsData[activeProjectId]) 
    : (Object.values(projects)[0] || Object.values(projectsData)[0]);
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
    if (architectTab === 'usuarios') {
      return (
        <UsersManagementPortal
          onBackToHome={() => setArchitectTab('inicio')}
          onNavigateToProjects={() => setArchitectTab('proyectos')}
          onLogout={handleLogout}
          currentUserName={sessionStorage.getItem('massa_3d_name') || localStorage.getItem('massa_3d_name') || undefined}
          totalProjects={Object.keys(projects).length}
          onCreateProject={handleCreateNewProject}
        />
      );
    }

    if (architectTab === 'proyectos') {
      return (
        <ProjectsManagementPortal
          projects={projects}
          onSelectProject={handleSelectProject}
          onStart360Tour={(projId) => {
            handleSelectProject(projId);
            handleStart360Tour();
          }}
          onConfigureProject={setConfiguringProjectId}
          onCreateProject={handleCreateNewProject}
          onDeleteProject={handleDeleteProject}
          onUpdateProjectStatus={(projId, newStatus) => {
            setProjects(prev => {
              const current = prev[projId];
              if (!current) return prev;
              const updated = { ...current, status: newStatus };
              saveProjectToSupabase(updated).catch(err => console.warn("Error actualizando estado en Supabase:", err));
              return { ...prev, [projId]: updated };
            });
          }}
          onBackToHome={() => setArchitectTab('inicio')}
          onNavigateToUsers={() => setArchitectTab('usuarios')}
          onLogout={handleLogout}
          currentUserName={sessionStorage.getItem('massa_3d_name') || localStorage.getItem('massa_3d_name') || undefined}
        />
      );
    }

    return (
      <div className="relative w-full min-h-screen bg-[#0D0D0E] text-white">
        <Home
          projects={projects}
          onCreateProject={handleCreateNewProject}
          userRole="editor"
          userName={sessionStorage.getItem('massa_3d_name') || localStorage.getItem('massa_3d_name') || undefined}
          onSwitchRole={() => setUserRole('portal')}
          onSwitchToClient={() => setUserRole('client')}
          onLogout={handleLogout}
          onNavigateToProjects={() => setArchitectTab('proyectos')}
          onNavigateToUsers={() => setArchitectTab('usuarios')}
        />
      </div>
    );
  }

  const currentDisplayName = portalData?.name || currentProject?.name || (activeProjectId && (projects[activeProjectId]?.name || projectsData[activeProjectId]?.name)) || 'Villa Serena';

  // 5. Pantalla de Bienvenida y Portafolio Monumental para Invitados (Estilo Skiper6)
  if (userRole === 'guest' && guestView === 'showcase') {
    return (
      <>
        <GuestPortfolioShowcase
          onSelectProject={(projectId) => {
            handleSelectProject(projectId);
            setGuestView('project');
            setActiveTab('home');
          }}
          onOpenLogin={() => {
            setUserRole('portal');
          }}
          onContactCommercial={() => setIsContactModalOpen(true)}
        />
        {portalData?.architect && (
          <ArchitectContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            architect={portalData.architect}
            projectName={currentDisplayName}
          />
        )}
      </>
    );
  }

  // 6. Portal con Sistema de Diseño visionOS (Cliente & Invitado en Obra Activa)

  const publicProjectsList = (() => {
    const seenNames = new Set<string>();
    const list: { id: string; name: string }[] = [];
    Object.keys(projects).forEach(key => {
      const name = projects[key]?.name || key;
      const cleanName = name.toLowerCase().trim();
      if (!seenNames.has(cleanName)) {
        seenNames.add(cleanName);
        list.push({ id: key, name });
      }
    });
    return list;
  })();

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
      userRole={userRole}
      onLogout={handleLogout}
      publicProjects={publicProjectsList}
      onSelectProject={handleSelectProject}
      onContact={() => setIsContactModalOpen(true)}
      onBackToPortfolio={() => setGuestView('showcase')}
    >
      {syncError && (
        <div className="mb-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3.5 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>{syncError}</span>
        </div>
      )}

      {/* SECCIÓN 0: HOME / DASHBOARD (Diferenciado para Invitado vs Cliente) */}
      {activeTab === 'home' && (
        userRole === 'guest' ? (
          <GuestHome
            projectName={currentDisplayName}
            specs={portalData?.publicSpecs || getProjectPublicSpecs(currentDisplayName)}
            onNavigateSection={handleSelectTab}
            onOpen360Tour={handleStart360Tour}
            publicProjects={publicProjectsList}
            activeProjectId={activeProjectId || undefined}
            onSelectProject={handleSelectProject}
            heroImage={portalData?.renders[0]?.storage_path}
            onBackToPortfolio={() => setGuestView('showcase')}
          />
        ) : (
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
        )
      )}

      {/* SECCIÓN: ESPECIFICACIONES & MEMORIA TÉCNICA (Público & Cliente) */}
      {activeTab === 'specs' && (
        <ProjectSpecs
          projectName={currentDisplayName}
          specs={portalData?.publicSpecs || getProjectPublicSpecs(currentDisplayName)}
          onContactCommercial={() => setIsContactModalOpen(true)}
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

      {/* SECCIÓN 2: PLANOS (PROTEGIDO: Solo Propietario / Cliente) */}
      {activeTab === 'blueprints' && (
        userRole === 'guest' ? (
          <div className="flex flex-col items-center justify-center min-h-[440px] text-center p-8 bg-[#171717]/85 backdrop-blur-2xl rounded-3xl border border-white/10 max-w-lg mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
              DOCUMENTACIÓN TÉCNICA PROTEGIDA
            </span>
            <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
              Acceso Restringido a Propietarios
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] mb-6 leading-relaxed">
              Los planos constructivos acotados, memorias técnicas ejecutivas y licencias de obra están protegidos bajo acuerdos de confidencialidad y reservados exclusivamente para el cliente propietario.
            </p>
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-3 rounded-full bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-bold text-xs shadow-[0_0_20px_rgba(156,208,26,0.4)] transition cursor-pointer"
            >
              Volver al Portafolio Público
            </button>
          </div>
        ) : (
          <BlueprintsViewer
            blueprints={portalData?.blueprints || []}
            projectName={currentDisplayName}
          />
        )
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

      {/* SECCIÓN 5: AVANCE DE OBRA (PROTEGIDO: Solo Propietario / Cliente) */}
      {activeTab === 'progress' && (
        userRole === 'guest' ? (
          <div className="flex flex-col items-center justify-center min-h-[440px] text-center p-8 bg-[#171717]/85 backdrop-blur-2xl rounded-3xl border border-white/10 max-w-lg mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
              SEGUIMIENTO DE OBRA CONFIDENCIAL
            </span>
            <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
              Bitácora Privada de Construcción
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] mb-6 leading-relaxed">
              El cronograma detallado de hitos, avance porcentual y reportes fotográficos de obra son privados y de acceso restringido al propietario del proyecto.
            </p>
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-3 rounded-full bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-bold text-xs shadow-[0_0_20px_rgba(156,208,26,0.4)] transition cursor-pointer"
            >
              Volver al Portafolio Público
            </button>
          </div>
        ) : (
          <ProgressTimeline
            progressUpdates={portalData?.progressUpdates || []}
            currentPhase={portalData?.currentPhase || 'FASE 3'}
            currentProgress={portalData?.currentProgress ?? 68}
            projectName={currentDisplayName}
            beforeAfterComparison={portalData?.beforeAfterComparison}
          />
        )
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
        <Route path="/admin/proyectos" element={<MainPortal initialTab="proyectos" />} />
        <Route path="/admin/usuarios" element={<MainPortal initialTab="usuarios" />} />
        <Route path="/tour/:id" element={<ClientViewer />} />
      </Routes>
    </LazyMotion>
  );
}
