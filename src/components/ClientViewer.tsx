import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Project } from '../data/tourData';
import { TourViewer } from './TourViewer';
import { OverlayUI } from './OverlayUI';
import { WelcomeScreen } from './WelcomeScreen';

export function ClientViewer() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          setError("Proyecto no encontrado o enlace inválido.");
          return;
        }

        const proj = data.data as Project;
        setProject(proj);
        setCurrentRoomId(proj.initialRoomId);
      } catch (err) {
        setError("Error de conexión al cargar el proyecto.");
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#050508] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(163,230,53,0.5)]"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="fixed inset-0 bg-[#050508] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-4xl text-red-400 font-bold">¡Oops!</h1>
        <p className="text-white/70">{error || "Proyecto no encontrado"}</p>
      </div>
    );
  }

  if (!started) {
    return <WelcomeScreen projectName={project.name} onStart={() => setStarted(true)} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {currentRoomId && project.rooms[currentRoomId] && (
          <TourViewer 
            room={project.rooms[currentRoomId]} 
            onNavigate={setCurrentRoomId}
          />
        )}
      </div>

      {/* 2D UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {currentRoomId && project.rooms[currentRoomId] && (
          <OverlayUI 
            currentRoom={project.rooms[currentRoomId]} 
            rooms={project.rooms}
            minimapImage={project.minimapImage}
            onNavigate={setCurrentRoomId}
          />
        )}
      </div>
    </div>
  );
}
