import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useProgress } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import { RoomSphere } from './RoomSphere';
import { Room } from '../data/tourData';

function ResponsiveCamera() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    const aspect = size.width / size.height;
    // Si la pantalla es vertical (modo retrato en celular),
    // aumentamos el FOV vertical dinámicamente para dar un campo de visión horizontal amplio e inmersivo.
    if (aspect < 1) {
      (camera as any).fov = Math.max(90, Math.min(105, 75 / aspect * 0.65));
    } else {
      (camera as any).fov = 75;
    }
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="text-white text-base md:text-lg font-medium whitespace-nowrap bg-black/70 px-6 py-3 rounded-xl backdrop-blur-md border border-white/20 shadow-2xl">
          Descargando HD... {Math.round(progress)}%
        </div>
        <div className="w-40 md:w-48 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
          <div 
            className="h-full bg-lime-500 transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  );
}

interface TourViewerProps {
  room: Room;
  onNavigate: (roomId: string) => void;
}

export function TourViewer({ room, onNavigate }: TourViewerProps) {
  return (
    <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
      <ResponsiveCamera />
      <ambientLight intensity={1} />
      <Suspense fallback={<Loader />}>
        {room.imageUrl ? (
          <RoomSphere room={room} onNavigate={onNavigate} />
        ) : (
          <Html center>
            <div className="text-white text-base md:text-xl font-medium whitespace-nowrap bg-black/80 px-6 py-3 rounded-full backdrop-blur-md border border-red-500/50 shadow-2xl">
              Esta habitación no tiene imagen 360 aún.
            </div>
          </Html>
        )}
      </Suspense>
      {/* 
        OrbitControls configurado para experiencia 360 inmersiva en móvil y escritorio:
        - enableZoom={false}: Evita desplazarse fuera de la esfera.
        - enablePan={false}: Mantiene la cámara en el centro.
        - rotateSpeed={-0.6}: Velocidad natural para arrastrar la escena en pantallas táctiles y ratón.
      */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        enableDamping={true}
        dampingFactor={0.08}
        rotateSpeed={-0.6} 
      />
    </Canvas>
  );
}
