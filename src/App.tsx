import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TourViewer } from './components/TourViewer';
import { OverlayUI } from './components/OverlayUI';
import { Home } from './components/Home';
import { ProjectConfigurator } from './components/ProjectConfigurator';
import { ClientViewer } from './components/ClientViewer';
import { projectsData, Project } from './data/tourData';
import { getProjectsFromSupabase, saveProjectToSupabase } from './supabase';

function AdminPanel() {
  const [projects, setProjects] = useState<Record<string, Project>>(projectsData);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [configuringProjectId, setConfiguringProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Cargar proyectos desde Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Promesa de timeout para evitar que la app se quede colgada
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de espera agotado (límite 10s)")), 10000)
        );

        const fbProjects = await Promise.race([
          getProjectsFromSupabase(),
          timeoutPromise
        ]);
        
        if (fbProjects.length === 0) {
          // Si no hay datos en la nube, subimos los locales inicialmente para poblar la BD
          console.log("Base de datos de Supabase vacía. Sincronizando datos locales...");
          for (const key of Object.keys(projectsData)) {
            await saveProjectToSupabase(projectsData[key]);
          }
          setProjects(projectsData);
        } else {
          // Mapeamos el arreglo a un Record<string, Project>
          const loadedProjects: Record<string, Project> = {};
          fbProjects.forEach(p => {
            loadedProjects[p.id] = p;
          });
          setProjects(loadedProjects);
        }
        setSyncError(null);
      } catch (error: any) {
        console.error("Error conectando a Supabase, usando datos locales:", error);
        setSyncError("Conexión con Supabase fallida. Revisa si creaste la tabla 'projects'.");
        // Fallback a datos locales ya configurados por defecto
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentRoomId(projects[projectId].initialRoomId);
  };

  const handleBackToHome = () => {
    setActiveProjectId(null);
    setCurrentRoomId(null);
  };

  const handleRoomChange = (roomId: string) => {
    setCurrentRoomId(roomId);
  };

  // Guardar proyecto actualizado en el estado local
  const handleSaveProject = (updatedProject: Project) => {
    setProjects(prev => ({
      ...prev,
      [updatedProject.id]: updatedProject
    }));
  };

  const handleCreateNewProject = () => {
    const newId = `project_${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: "Nuevo Proyecto",
      description: "Descripción de tu nuevo recorrido 360.",
      thumbnail: "", // Sin imagen por defecto
      minimapImage: "", // Sin plano por defecto
      initialRoomId: "room_1",
      rooms: {
        "room_1": {
          id: "room_1",
          name: "Habitación Inicial",
          description: "Punto de partida",
          imageUrl: "", // El usuario la subirá
          minimapPosition: { x: 50, y: 50 },
          hotspots: []
        }
      }
    };
    
    // Guardamos el proyecto de forma temporal en la memoria
    setProjects(prev => ({
      ...prev,
      [newId]: newProject
    }));
    
    // Abrimos el configurador para ese nuevo proyecto
    setConfiguringProjectId(newId);
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este proyecto de forma permanente? Se borrará de la nube.");
    if (!confirmDelete) return;

    try {
      // 1. Lo borramos en Supabase
      import('./supabase').then(async (m) => {
        await m.deleteProjectFromSupabase(projectId);
      });

      // 2. Lo borramos de la interfaz (estado local)
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

  // Renderizar pantalla de carga premium mientras conecta con la nube
  if (loading) {
    return (
      <div className="w-full h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center gap-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-lime-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-lime-400 animate-spin"></div>
        </div>
        <div className="text-sm font-light tracking-widest text-lime-400 animate-pulse uppercase">
          Estableciendo conexión en la nube...
        </div>
      </div>
    );
  }

  // Renderizar Configurator si está activo
  if (configuringProjectId) {
    const projectToConfigure = projects[configuringProjectId];
    
    // Protección contra race conditions (si React aún no actualiza el estado 'projects')
    if (!projectToConfigure) {
      return (
        <div className="w-full h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-lime-500/20 border-t-lime-400 rounded-full animate-spin"></div>
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

  // Renderizar Home si no hay proyecto seleccionado
  if (!activeProjectId || !currentRoomId) {
    return (
      <div className="relative">
        {syncError && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 backdrop-blur-md shadow-lg animate-bounce">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            {syncError}
          </div>
        )}
        <Home 
          projects={projects} 
          onSelectProject={handleSelectProject} 
          onConfigureProject={setConfiguringProjectId}
          onCreateProject={handleCreateNewProject}
          onDeleteProject={handleDeleteProject}
        />
      </div>
    );
  }

  const currentProject = projects[activeProjectId];
  const currentRoom = currentProject.rooms[currentRoomId];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <TourViewer room={currentRoom} onNavigate={handleRoomChange} />
      </div>

      {/* 2D UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <OverlayUI 
          currentRoom={currentRoom} 
          rooms={currentProject.rooms}
          minimapImage={currentProject.minimapImage}
          onNavigate={handleRoomChange} 
          onBackToHome={handleBackToHome}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminPanel />} />
      <Route path="/tour/:id" element={<ClientViewer />} />
    </Routes>
  );
}

