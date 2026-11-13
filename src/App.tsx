import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { TourContainer } from './components/TourContainer';
import { ProjectConfigurator } from './components/ProjectConfigurator';
import { ClientViewer } from './components/ClientViewer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { LoginScreen } from './components/LoginScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { PortalLayout } from './components/layout/PortalLayout';
import { ClientHome } from './components/ClientHome';
import { RendersGallery } from './components/portal/RendersGallery';
import { BlueprintsViewer } from './components/portal/BlueprintsViewer';
import { Model3DViewer } from './components/portal/Model3DViewer';
import { Tour360Section } from './components/portal/Tour360Section';
import { ProgressTimeline } from './components/portal/ProgressTimeline';
import { ArchitectContactModal } from './components/portal/ArchitectContactModal';
import { GuestHome } from './components/portal/GuestHome';
import { VipCommercialLanding } from './components/commercial/VipCommercialLanding';
import { ProjectSpecs } from './components/portal/ProjectSpecs';
import { getProjectPortalData, getProjectPublicSpecs, ProjectPortalData } from './services/portalService';
import { NavTab } from './components/ui/Dock';
import { Project, projectsData, normalizeProject, resolveCanonicalProjectId, CANONICAL_PROJECT_ORDER } from './data/tourData';
import { getProjectsFromSupabase, saveProjectToSupabase } from './supabase';
import { Lock } from 'lucide-react';
import { ProjectsManagementPortal } from './components/ProjectsManagementPortal';
import { authService } from './lib/authService';
import { ProjectDedicatedView } from './components/project/ProjectDedicatedView';
import { openProjectInNewTab } from './config/projectIdentityConfig';

const IbizaStandalone3DPage = lazy(() =>
  import('./components/project/IbizaAnimatedModel3DViewer').then(mod => ({
    default: mod.IbizaStandalone3DPage
  }))
);

function MainPortal() {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<'portal' | 'guest' | 'client' | 'architect'>('guest');
  useEffect(() => {
    let active = true;
    const sync = (user: { role: string } | null) => {
      if (!active) return;
      setUserRole(previous => user?.role === 'admin' ? 'architect' : previous === 'portal' ? 'portal' : 'guest');
      if (!user) setConfiguringProjectId(null);
    };
    void authService.getCurrentUser().then(sync);
    const { data } = authService.onAuthStateChange(sync);
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    try {
      const saved = sessionStorage.getItem('massa_3d_client_tab') as NavTab;
      if (saved && ['home', 'gallery', 'blueprints', 'model3d', 'tour360', 'progress'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'home';
  });

  const [loadedProjects, setProjects] = useState<Record<string, Project>>({});
  const projects = userRole === 'architect' ? loadedProjects
    : Object.fromEntries(Object.entries(loadedProjects).filter(([, project]) => project.published === true));

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return 'project_hacienda_f22';
  });
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [configuringProjectId, setConfiguringProjectId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('massa_configuring_project_id');
    } catch {
      return null;
    }
  });
  const [tourStarted, setTourStarted] = useState(false);
  const [guestView, setGuestView] = useState<'commercial' | 'project'>('commercial');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<ProjectPortalData | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Las vistas de PostgreSQL deciden qué contenido se puede leer.
  // Nunca recuperar proyectos ocultos desde una copia local o datos compilados.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const rows = await getProjectsFromSupabase();
        if (cancelled) return;
        const sorted = [...rows].sort((a, b) => {
          const rank = (id: string) => {
            const index = CANONICAL_PROJECT_ORDER.indexOf(id);
            return index < 0 ? Number.MAX_SAFE_INTEGER : index;
          };
          return rank(a.id) - rank(b.id);
        });
        setProjects(Object.fromEntries(sorted.map(project => [project.id, normalizeProject(project)])));
        setSyncError(null);
      } catch {
        if (!cancelled) { setProjects({}); setSyncError('No se pudo consultar el catálogo. Intenta recargar la página.'); }
      }
    };
    const resume = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', resume);
    void load();
    const interval = window.setInterval(() => { void load(); }, 240000);
    return () => { cancelled = true; window.clearInterval(interval); document.removeEventListener('visibilitychange', resume); };
  }, [userRole]);

  // Cargar datos de proyecto extendidos (Renders, Planos, Avances) para el portal
  useEffect(() => {
    if (!activeProjectId) return;
    const currentProj = projects[activeProjectId];
    if (!currentProj) { setPortalData(null); return; }
    let cancelled = false;
    getProjectPortalData(activeProjectId, currentProj)
      .then((data) => { if (!cancelled) setPortalData(data); })
      .catch((err) => console.warn("Error cargando portal data:", err));
    return () => { cancelled = true; };
  }, [activeProjectId, loadedProjects, userRole]);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setTourStarted(false);
    const proj = projects[projectId];
    if (proj) {
      const firstRoomId = proj.rooms ? Object.keys(proj.rooms)[0] : null;
      const validRoomId = (proj.rooms && proj.rooms[proj.initialRoomId]) ? proj.initialRoomId : firstRoomId;
      setCurrentRoomId(validRoomId || null);
    } else {
      const fallback = projects[Object.keys(projects)[0]];
      if (fallback) {
        const firstRoomId = fallback.rooms ? Object.keys(fallback.rooms)[0] : null;
        setCurrentRoomId(firstRoomId || null);
      }
    }
  };

  const handleStart360Tour = (customProjId?: string) => {
    const projId = customProjId || activeProjectId || Object.keys(projects)[0];
    const proj = projects[projId] || (projId ? projectsData[projId] : undefined);
    if (proj) {
      const firstRoomId = proj.rooms ? Object.keys(proj.rooms)[0] : null;
      const validRoomId = (proj.rooms && proj.rooms[proj.initialRoomId]) ? proj.initialRoomId : firstRoomId;
      setCurrentRoomId(validRoomId || null);
      setActiveProjectId(proj.id);
      setTourStarted(true);
    }
  };

  const handleSelectProjectForCommercial = (projectNameOrId: string) => {
    const canonical = resolveCanonicalProjectId(projectNameOrId);
    openProjectInNewTab(canonical || projectNameOrId);
  };

  const handleBackToPortal = () => {
    setTourStarted(false);
    setActiveTab('home');
  };

  const handleLogout = async () => {
    await authService.signOut();
    try {
      sessionStorage.removeItem('massa_3d_architect_tab');
      sessionStorage.removeItem('massa_3d_client_tab');
      sessionStorage.removeItem('massa_3d_role');
      sessionStorage.removeItem('massa_configuring_project_id');
      localStorage.removeItem('massa_3d_role');
    } catch {}
    setUserRole('guest');
    setGuestView('commercial');
    setTourStarted(false);
    setActiveTab('home');
    setConfiguringProjectId(null);
    navigate('/', { replace: true });
  };

  const handleLoginSuccess = async (role: 'guest' | 'client' | 'architect') => {
    const user = role === 'architect' ? await authService.getCurrentUser() : null;
    if (role === 'architect' && !user) return;
    setUserRole(role);
    if (role === 'guest') {
      setGuestView('commercial');
    }
    try {
      sessionStorage.removeItem('massa_3d_architect_tab');
      sessionStorage.removeItem('massa_3d_client_tab');
    } catch {}
    setActiveTab('home');
    navigate('/', { replace: true });
  };

  const handleSaveProject = (updatedProject: Project) => {
    if (!updatedProject || !updatedProject.id) return;
    const normalized = normalizeProject(updatedProject);
    setProjects(prev => {
      const copy = { ...prev, [normalized.id]: normalized };
      try {
        const stored = localStorage.getItem('massa_custom_projects');
        const custom = stored ? JSON.parse(stored) : {};
        custom[normalized.id] = normalized;
        localStorage.setItem('massa_custom_projects', JSON.stringify(custom));
      } catch {}
      return copy;
    });
    saveProjectToSupabase(normalized).catch(err => {
      console.warn("Error guardando en Supabase:", err);
    });
  };

  const handleConfigureProject = (projectId: string) => {
    setConfiguringProjectId(projectId);
    try {
      sessionStorage.setItem('massa_configuring_project_id', projectId);
    } catch {}
  };

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

  // 2. Creador Interactivo de Recorridos 360° (Proyectos Actuales y Guardados)
  const projectToConfigure = configuringProjectId
    ? (projects[configuringProjectId] || null)
    : null;

  if (userRole === 'architect' && projectToConfigure) {
    return (
      <ProjectConfigurator
        initialProject={projectToConfigure}
        isNewProject={false}
        onClose={() => {
          setConfiguringProjectId(null);
          try {
            sessionStorage.removeItem('massa_configuring_project_id');
          } catch {}
        }}
        onSave={(savedProject) => {
          handleSaveProject(savedProject);
          setConfiguringProjectId(savedProject.id);
          try {
            sessionStorage.setItem('massa_configuring_project_id', savedProject.id);
          } catch {}
        }}
      />
    );
  }

  // 3. Recorrido 360° en pantalla completa (Reutilizando motor Three.js existente)
  const currentProject = (activeProjectId && (projects[activeProjectId] || projectsData[activeProjectId]))
    ? (projects[activeProjectId] || projectsData[activeProjectId])
    : (Object.values(projects)[0]);
  const firstAvailableRoomId = currentProject?.rooms ? Object.keys(currentProject.rooms)[0] : null;
  const currentRoom = currentProject?.rooms 
    ? (currentRoomId && currentProject.rooms[currentRoomId] ? currentProject.rooms[currentRoomId] : (firstAvailableRoomId ? currentProject.rooms[firstAvailableRoomId] : undefined)) 
    : undefined;

  if (tourStarted && currentProject) {
    return (
      <TourContainer
        currentRoom={currentRoom}
        rooms={currentProject.rooms || {}}
        minimapImage={currentProject.minimapImage}
        floorPlans={currentProject.floorPlans}
        onNavigate={(roomId) => setCurrentRoomId(roomId)}
        onBackToHome={handleBackToPortal}
        tourEmbedUrl={currentProject.tourType === 'matterport_iframe' ? currentProject.tourEmbedUrl : undefined}
        projectName={currentProject.name}
        brandLogo={currentProject.id === 'project_hacienda_f22' ? '/branding/amho-horizontal-white.png' : undefined}
        brandColor={currentProject.id === 'project_hacienda_f22' ? '#DFC47B' : undefined}
      />
    );
  }

  // 4. Estudio de Recorridos 360° (Crear recorridos 360° de proyectos actuales y consultar recorridos 360° guardados)
  if (userRole === 'architect') {
    return (
      <ProjectsManagementPortal
        projects={projects}
        onSelectProject={(projId) => {
          openProjectInNewTab(projId);
        }}
        onStart360Tour={(projId) => {
          handleStart360Tour(projId);
        }}
        onConfigureProject={handleConfigureProject}
        onBackToHome={() => {
          setUserRole('guest');
          setGuestView('commercial');
        }}
        onLogout={handleLogout}
        currentUserName={sessionStorage.getItem('massa_3d_name') || localStorage.getItem('massa_3d_name') || undefined}
      />
    );
  }

  const currentDisplayName = portalData?.name || currentProject?.name || (activeProjectId && (projects[activeProjectId]?.name)) || 'IBIZA A14';

  // 5. Plataforma Comercial VIP para Invitados (Entrada Abierta de Alto Impacto por Defecto)
  if (userRole === 'guest' && guestView !== 'project') {
    return (
      <VipCommercialLanding
        projects={projects}
        onSelectProjectForPortal={handleSelectProjectForCommercial}
        onLaunch360Tour={(projId) => handleStart360Tour(projId)}
        onLoginSuccess={handleLoginSuccess}
      />
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
    try {
      sessionStorage.setItem('massa_3d_client_tab', tab);
    } catch {}
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
      onBackToPortfolio={() => setGuestView('commercial')}
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
            onBackToPortfolio={() => setGuestView('commercial')}
          />
        ) : (
          <ClientHome
            projectName={currentDisplayName}
            clientName={portalData?.clientName || 'Cliente MASSA'}
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

      {/* SECCIÓN 2: PLANOS ARQUITECTÓNICOS */}
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
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route path="/admin/proyectos" element={<MainPortal />} />
        <Route path="/admin/usuarios" element={<MainPortal />} />
        <Route path="/tour/:id" element={<ClientViewer />} />
        <Route
          path="/proyecto/:id/3d"
          element={
            <Suspense
              fallback={
                <div className="fixed inset-0 bg-[#05070A] flex items-center justify-center">
                  <span className="text-xs font-mono text-[#9CD01A] uppercase tracking-[0.22em] animate-pulse">
                    Cargando Visor 3D Exclusivo • Casa Ibiza A14...
                  </span>
                </div>
              }
            >
              <IbizaStandalone3DPage />
            </Suspense>
          }
        />
        <Route
          path="/visor-3d/ibiza-a14"
          element={
            <Suspense
              fallback={
                <div className="fixed inset-0 bg-[#05070A] flex items-center justify-center">
                  <span className="text-xs font-mono text-[#9CD01A] uppercase tracking-[0.22em] animate-pulse">
                    Cargando Visor 3D Exclusivo • Casa Ibiza A14...
                  </span>
                </div>
              }
            >
              <IbizaStandalone3DPage />
            </Suspense>
          }
        />
        <Route path="/proyecto/:id" element={<ProjectDedicatedView />} />
        <Route path="/project/:id" element={<ProjectDedicatedView />} />
        <Route path="/obra/:id" element={<ProjectDedicatedView />} />
        <Route path="/a14" element={<Navigate to="/proyecto/ibiza-a14" replace />} />
        <Route path="/ibiza-a14" element={<Navigate to="/proyecto/ibiza-a14" replace />} />
        <Route path="/f22" element={<Navigate to="/proyecto/hacienda-f22" replace />} />
        <Route path="/hacienda-f22" element={<Navigate to="/proyecto/hacienda-f22" replace />} />
      </Routes>
    </LazyMotion>
  );
}
