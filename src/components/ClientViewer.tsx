import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Project } from '../data/tourData';
import { TourContainer } from './TourContainer';
import { WelcomeScreen } from './WelcomeScreen';
import { useTexture } from '@react-three/drei';
import { ArrowLeft } from 'lucide-react';

export function ClientViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        if (!proj || !proj.rooms) {
          setError("El proyecto está incompleto o corrupto en la nube.");
          return;
        }
        setProject(proj);
        const firstRoomId = Object.keys(proj.rooms)[0];
        const validRoomId = proj.rooms[proj.initialRoomId] ? proj.initialRoomId : firstRoomId;
        setCurrentRoomId(validRoomId || null);
      } catch (err) {
        setError("Error de conexión al cargar el proyecto.");
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  // Pre-cargar imágenes para mejorar la velocidad percibida
  useEffect(() => {
    if (project && currentRoomId) {
      const currentRoom = project.rooms[currentRoomId];
      
      // 1. Pre-cargar la imagen de la habitación actual (muy útil mientras se muestra el WelcomeScreen)
      if (currentRoom?.imageUrl) {
        useTexture.preload(currentRoom.imageUrl);
      }
      
      // 2. Pre-cargar las habitaciones adyacentes (a las que se puede acceder por hotspots)
      if (currentRoom?.hotspots) {
        currentRoom.hotspots.forEach(hotspot => {
          const target = project.rooms[hotspot.targetRoom];
          if (target?.imageUrl) {
            useTexture.preload(target.imageUrl);
          }
        });
      }

      // 3. Pre-cargar el minimapa
      if (project.minimapImage) {
        const img = new Image();
        img.src = project.minimapImage;
      }
    }
  }, [project, currentRoomId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#050508] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(163,230,53,0.5)]"></div>
      </div>
    );
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
