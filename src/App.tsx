import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { TourContainer } from './components/TourContainer';
import { Home } from './components/Home';
import { AdminProjectEditor } from './components/AdminProjectEditor';
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
import { VipCommercialLanding } from './components/commercial/VipCommercialLanding';
import { ProjectSpecs } from './components/portal/ProjectSpecs';
import { getProjectPortalData, getProjectPublicSpecs, ProjectPortalData } from './services/portalService';
import { NavTab } from './components/ui/Dock';
import { projectsData, Project, normalizeProject, resolveCanonicalProjectId, CANONICAL_PROJECT_ORDER } from './data/tourData';
import { getProjectsFromSupabase, saveProjectToSupabase } from './supabase';
import { Lock } from 'lucide-react';
import { UsersManagementPortal } from './components/UsersManagementPortal';
import { ProjectsManagementPortal } from './components/ProjectsManagementPortal';
import { authService } from './lib/authService';
import { ProjectDedicatedView } from './components/project/ProjectDedicatedView';
import { openProjectInNewTab } from './config/projectIdentityConfig';

function MainPortal({ initialTab }: { initialTab?: 'inicio' | 'proyectos' | 'usuarios' }) {
  const navigate = useNavigate();

  // Estado de rol: 'guest' (acceso abierto comercial VIP por defecto), 'portal' (login), 'client' (portal cliente), 'architect' (panel arquitecto)
  const [userRole, setUserRole] = useState<'portal' | 'guest' | 'client' | 'architect'>(() => {
    try {
      const saved = sessionStorage.getItem('massa_3d_role') || localStorage.getItem('massa_3d_role');
      if (saved === 'editor') return 'architect';
      if (saved === 'visitor') return 'client';
      if (saved === 'guest') return 'guest';
      return 'guest'; // Entrada directa sin barreras a la plataforma comercial VIP
    } catch {
      return 'guest';
    }
  });

  // Validar y sincronizar sesión activa de Supabase Auth
  useEffect(() => {
    let isMounted = true;

    const syncSessionUser = (user: { role: string } | null) => {
      if (!isMounted) return;
      if (!user) {
        setUserRole(prev => (prev === 'architect' || prev === 'client' ? 'guest' : prev));
        return;
      }

      // Verificación estricta: proteger la sesión activa de arquitecto
      const savedRole = sessionStorage.getItem('massa_3d_role') || localStorage.getItem('massa_3d_role');
      const savedLevel = sessionStorage.getItem('massa_3d_user_level') || localStorage.getItem('massa_3d_user_level');
      const isArchitectSession = savedRole === 'editor' || savedLevel === 'architect' || savedLevel === 'admin';

      if (user.role === 'architect' || isArchitectSession) {
        setUserRole('architect');
      } else if (user.role === 'client') {
        setUserRole('client');
      }
    };

    authService.getCurrentUser().then(syncSessionUser).catch(() => {
      // ignore
    });

    const { data: authListener } = authService.onAuthStateChange(syncSessionUser);

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

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
      const path = window.location.pathname;
      if (path.includes('/admin/usuarios')) return 'usuarios';
      if (path.includes('/admin/proyectos')) return 'proyectos';

      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'usuarios') return 'usuarios';
      if (params.get('tab') === 'proyectos') return 'proyectos';

      const saved = sessionStorage.getItem('massa_3d_architect_tab');
      if (saved === 'usuarios' || saved === 'proyectos' || saved === 'inicio') {
        return saved as 'inicio' | 'proyectos' | 'usuarios';
      }
    } catch {
      // ignore
    }
    return 'inicio';
  });

  // Si cambia el initialTab de la ruta activa, sincronizar el estado y persistir
  useEffect(() => {
    if (initialTab) {
      setArchitectTab(initialTab);
      try {
        sessionStorage.setItem('massa_3d_architect_tab', initialTab);
      } catch {}
    }
  }, [initialTab]);

  // Si la ruta en el navegador es '/', pero en sessionStorage teníamos una pestaña activa, sincronizar URL
  useEffect(() => {
    try {
      const path = window.location.pathname;
      if (path === '/' && userRole === 'architect') {
        const saved = sessionStorage.getItem('massa_3d_architect_tab');
        if (saved === 'usuarios') navigate('/admin/usuarios', { replace: true });
        else if (saved === 'proyectos') navigate('/admin/proyectos', { replace: true });
      }
    } catch {}
  }, [userRole, navigate]);

  // Función unificada para navegar entre pestañas del arquitecto manteniendo URL y persistencia al refrescar
  const changeArchitectTab = (tab: 'inicio' | 'proyectos' | 'usuarios') => {
    setArchitectTab(tab);
    try {
      sessionStorage.setItem('massa_3d_architect_tab', tab);
    } catch {}
    if (tab === 'usuarios') {
      navigate('/admin/usuarios');
    } else if (tab === 'proyectos') {
      navigate('/admin/proyectos');
    } else {
      navigate('/');
    }
  };

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    try {
      const saved = sessionStorage.getItem('massa_3d_client_tab') as NavTab;
      if (saved && ['home', 'gallery', 'blueprints', 'model3d', 'tour360', 'progress'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'home';
  });
  const [projects, setProjects] = useState<Record<string, Project>>(() => {
    const normalized: Record<string, Project> = {};
    CANONICAL_PROJECT_ORDER.forEach(id => {
      if (projectsData[id]) {
        normalized[id] = normalizeProject(projectsData[id]);
      }
    });
    Object.keys(projectsData).forEach(key => {
      if (!normalized[key]) {
        normalized[key] = normalizeProject(projectsData[key]);
      }
    });
    return normalized;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return 'project_hacienda_f22';
  });
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [configuringProjectId, setConfiguringProjectId] = useState<string | null>(null);
  const [draftNewProject, setDraftNewProject] = useState<Project | null>(null);
  const [tourStarted, setTourStarted] = useState(false);
  const [guestView, setGuestView] = useState<'commercial' | 'showcase' | 'project'>('commercial');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<ProjectPortalData | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Cargar proyectos desde Supabase con normalización defensiva
  useEffect(() => {
    async function loadData() {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de espera agotado (límite 10s)")), 10000)
        );

        const fbProjects = await Promise.race([
          getProjectsFromSupabase(),
          timeoutPromise
        ]);
        
        const rawLoaded: Record<string, Project> = {};
        // 1. Base con todas las residencias oficiales de MASSA (solo proyectos canónicos únicos)
        Object.values(projectsData).forEach(p => {
          if (p && p.id) {
            rawLoaded[p.id] = normalizeProject(p);
          }
        });

        // 2. Proyectos personalizados guardados localmente (limpiando dummies y aliases antiguos)
        try {
          const stored = localStorage.getItem('massa_custom_projects');
          if (stored) {
            const custom = JSON.parse(stored);
            const legacyDummies = new Set([
              'villa-serena', 'altos-del-valle', 'penthouse-massa',
              'casa-del-lago', 'residencia-bambu', 'torre-horizonte',
              'casa-cantera', 'edinson-jejen', 'marquimoda'
            ]);
            Object.keys(custom).forEach(k => {
              const item = custom[k];
              if (item && item.id && !legacyDummies.has(k) && !legacyDummies.has(item.id)) {
                rawLoaded[item.id] = normalizeProject(item);
              }
            });
          }
        } catch {}

        // 3. Proyectos sincronizados en la nube de Supabase
        if (fbProjects && fbProjects.length > 0) {
          fbProjects.forEach(p => {
            if (p && p.id) {
              const canonicalId = resolveCanonicalProjectId(p.id);
              rawLoaded[canonicalId] = normalizeProject({ ...p, id: canonicalId });
            }
          });
        }

        // Ordenar respetando estrictamente el orden canónico oficial:
        // 1. Hacienda F22, 2. Ibiza A14, 3. Edinson Jején, 4. Marquimoda
        const loadedProjects: Record<string, Project> = {};
        CANONICAL_PROJECT_ORDER.forEach(id => {
          if (rawLoaded[id]) {
            loadedProjects[id] = rawLoaded[id];
          }
        });
        Object.keys(rawLoaded).forEach(id => {
          if (!loadedProjects[id]) {
            loadedProjects[id] = rawLoaded[id];
          }
        });

        setProjects(loadedProjects);

        if (!activeProjectId || !loadedProjects[activeProjectId]) {
          const firstId = Object.keys(loadedProjects)[0];
          if (firstId) setActiveProjectId(firstId);
        }
        setSyncError(null);
      } catch (error: any) {
        console.warn("Usando datos locales por desconexión de Supabase:", error);
        setSyncError("Conexión con Supabase en modo local.");
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

  const handleStart360Tour = (customProjId?: string) => {
    const projId = customProjId || activeProjectId || Object.keys(projects)[0];
    const proj = projects[projId] || projectsData[projId] || Object.values(projects)[0] || Object.values(projectsData)[0];
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
      localStorage.removeItem('massa_3d_role');
    } catch {}
    setUserRole('guest');
    setGuestView('commercial');
    setTourStarted(false);
    setActiveTab('home');
    setArchitectTab('inicio');
    setDraftNewProject(null);
    setConfiguringProjectId(null);
    navigate('/', { replace: true });
  };

  const handleLoginSuccess = (role: 'guest' | 'client' | 'architect') => {
    setUserRole(role);
    if (role === 'guest') {
      setGuestView('commercial');
    }
    try {
      sessionStorage.removeItem('massa_3d_architect_tab');
      sessionStorage.removeItem('massa_3d_client_tab');
    } catch {}
    setActiveTab('home');
    setArchitectTab('inicio');
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

  const handleCreateNewProject = () => {
    const newId = `project_${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: "Nueva Residencia MASSA",
      tagline: "Exclusiva residencia de autor lista para construcción",
      category: "villa",
      categoryLabel: "Villa Campestre",
      location: "Valle del Cauca, Colombia",
      zone: "Zona Exclusiva",
      areaBuilt: "480 m²",
      areaLot: "1.500 m²",
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 4,
      priceCOP: "$1.850.000.000 COP",
      priceUSD: "~$460.000 USD",
      status: "disponible",
      statusLabel: "Disponible para Construcción",
      hasTour360: true,
      featured: false,
      heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85",
      thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      description: "Concebida como una escultura habitable frente a la calma del paisaje. Volumetría horizontal con vigas en concreto visto, carpintería de aluminio hermético y bioclimática pasiva.",
      minimapImage: "/PLANO.jpg",
      initialRoomId: "room_1",
      tourType: "360_spheres",
      highlights: [
        "Piscina infinity climatizada con borde flotante",
        "Voladizos en concreto visto y ventanería hermética",
        "Master suite con terraza panorámica",
        "Domótica Lutron integral y paneles solares"
      ],
      renders: [],
      rooms: {
        "room_1": {
          id: "room_1",
          name: "Sala Principal",
          description: "Punto de partida del recorrido 3D",
          imageUrl: "",
          minimapPosition: { x: 50, y: 50 },
          hotspots: []
        }
      }
    };
    setDraftNewProject(newProject);
    setConfiguringProjectId(null);
  };

  const handleConfigureProject = (projectId: string) => {
    setDraftNewProject(null);
    setConfiguringProjectId(projectId);
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este proyecto de forma permanente?");
    if (!confirmDelete) return;

    try {
      const { deleteProjectFromSupabase } = await import('./supabase');
      await deleteProjectFromSupabase(projectId).catch(err => {
        console.warn("No se pudo eliminar de Supabase (posiblemente existía solo en memoria):", err);
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
    }

    setProjects(prev => {
      const copy = { ...prev };
      delete copy[projectId];
      return copy;
    });

    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
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

  // 2. Editor de Proyectos, Renders y Recorridos 3D (Panel Administrador)
  const projectToConfigure = draftNewProject || (configuringProjectId ? projects[configuringProjectId] : null);

  if (projectToConfigure) {
    return (
      <AdminProjectEditor
        initialProject={projectToConfigure}
        isNewProject={!!draftNewProject}
        onClose={() => {
          setDraftNewProject(null);
          setConfiguringProjectId(null);
        }}
        onSave={(savedProject) => {
          handleSaveProject(savedProject);
          setDraftNewProject(null);
          setConfiguringProjectId(savedProject.id);
        }}
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

  if (tourStarted && currentProject) {
    return (
      <TourContainer
        currentRoom={currentRoom}
        rooms={currentProject.rooms || {}}
        minimapImage={currentProject.minimapImage}
        onNavigate={(roomId) => setCurrentRoomId(roomId)}
        onBackToHome={handleBackToPortal}
        tourEmbedUrl={currentProject.tourType === 'matterport_iframe' ? currentProject.tourEmbedUrl : undefined}
        projectName={currentProject.name}
      />
    );
  }

  // 4. Panel de Administrador / Arquitecto (si seleccionó rol Arquitecto)
  if (userRole === 'architect') {
    if (architectTab === 'usuarios') {
      return (
        <UsersManagementPortal
          onBackToHome={() => changeArchitectTab('inicio')}
          onNavigateToProjects={() => changeArchitectTab('proyectos')}
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
          onConfigureProject={handleConfigureProject}
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
          onBackToHome={() => changeArchitectTab('inicio')}
          onNavigateToUsers={() => changeArchitectTab('usuarios')}
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
          onSwitchRole={() => {
            setUserRole('guest');
            setGuestView('commercial');
          }}
          onLogout={handleLogout}
          onNavigateToProjects={() => changeArchitectTab('proyectos')}
          onNavigateToUsers={() => changeArchitectTab('usuarios')}
        />
      </div>
    );
  }

  const currentDisplayName = portalData?.name || currentProject?.name || (activeProjectId && (projects[activeProjectId]?.name || projectsData[activeProjectId]?.name)) || 'RESIDENCIA JEJÉN';

  // 5. Plataforma Comercial VIP para Invitados (Entrada Abierta de Alto Impacto)
  if (userRole === 'guest' && guestView === 'commercial') {
    return (
      <VipCommercialLanding
        projects={projects}
        onSelectProjectForPortal={handleSelectProjectForCommercial}
        onLaunch360Tour={(projId) => handleStart360Tour(projId)}
        onOpenMonumentalShowcase={() => setGuestView('showcase')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 6. Pantalla de Bienvenida y Portafolio Monumental para Invitados (Modo Galería)
  if (userRole === 'guest' && guestView === 'showcase') {
    return (
      <>
        <GuestPortfolioShowcase
          onSelectProject={(projectId) => {
            openProjectInNewTab(projectId);
          }}
          onOpenLogin={() => {
            setUserRole('portal');
          }}
          onContactCommercial={() => setIsContactModalOpen(true)}
          onBackToCommercial={() => setGuestView('commercial')}
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

  // 7. Portal con Sistema de Diseño visionOS (Cliente & Invitado en Obra Activa)

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
            clientName={portalData?.clientName || 'Edinson Jején'}
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
        <Route path="/admin/proyectos" element={<MainPortal initialTab="proyectos" />} />
        <Route path="/admin/usuarios" element={<MainPortal initialTab="usuarios" />} />
        <Route path="/tour/:id" element={<ClientViewer />} />
        <Route path="/proyecto/:id" element={<ProjectDedicatedView />} />
        <Route path="/project/:id" element={<ProjectDedicatedView />} />
        <Route path="/obra/:id" element={<ProjectDedicatedView />} />
      </Routes>
    </LazyMotion>
  );
}
