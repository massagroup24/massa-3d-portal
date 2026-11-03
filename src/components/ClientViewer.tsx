import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectFromSupabase, logProjectVisit } from '../supabase';
import { Project } from '../data/tourData';
import { TourContainer } from './TourContainer';
import { WelcomeScreen } from './WelcomeScreen';
import { ArrowLeft } from 'lucide-react';
import { MassaLoadingScreen } from './common/MassaLoadingScreen';

export function ClientViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProject(refresh = false) {
      if (!id) return;
      try {
        if (!refresh) setLoading(true);
        setError(null);
        const proj = await getProjectFromSupabase(id);
        if (cancelled) return;
        if (!proj || !proj.rooms) {
          setProject(null);
          setError("Proyecto no disponible o recorrido no publicado.");
          return;
        }
        setProject(proj);
        if (!refresh) logProjectVisit(proj.id, proj.name);
        const firstRoomId = Object.keys(proj.rooms)[0];
        const validRoomId = proj.rooms[proj.initialRoomId] ? proj.initialRoomId : firstRoomId;
        setCurrentRoomId(previous => previous && proj.rooms[previous] ? previous : validRoomId || null);
      } catch (err) {
        if (!cancelled) { setProject(null); setError("Error de conexión al cargar el proyecto."); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    setProject(null);
    setStarted(false);
    const resume = () => { if (document.visibilityState === 'visible') void loadProject(true); };
    document.addEventListener('visibilitychange', resume);
    void loadProject();
    const timer = window.setInterval(() => { void loadProject(true); }, 240000);
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener('visibilitychange', resume); };
  }, [id]);

  if (loading) {
    return <MassaLoadingScreen message="MASSA 360°" subMessage="CARGANDO RECORRIDO INMERSIVO" />;
  }

  if (error || !project) {
    return (
      <div className="fixed inset-0 bg-[#050508] flex flex-col items-center justify-center gap-5 text-center px-4 overflow-y-auto">
        <h1 className="text-4xl text-red-400 font-bold">¡Oops!</h1>
        <p className="text-white/70 max-w-md">{error || "Proyecto no encontrado"}</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-semibold flex items-center gap-2 transition-all shadow-xl mt-2"
        >
          <ArrowLeft className="w-5 h-5 text-lime-400" />
          <span>Volver al Portal Principal</span>
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <WelcomeScreen 
        projectName={project.name} 
        onStart={() => setStarted(true)} 
        onBack={() => navigate('/')} 
      />
    );
  }

  if (!currentRoomId || !project.rooms[currentRoomId]) {
    return null;
  }

  return (
    <TourContainer 
      currentRoom={project.rooms[currentRoomId]} 
      rooms={project.rooms}
      minimapImage={project.minimapImage}
      onNavigate={setCurrentRoomId}
      onBackToHome={() => navigate('/')}
    />
  );
}
