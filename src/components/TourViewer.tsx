import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useProgress } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomSphere } from './RoomSphere';
import { Room } from '../data/tourData';

interface CameraControllerProps {
  isTransitioning?: boolean;
  targetPosition?: [number, number, number] | null;
  room: Room;
}

function CameraController({ isTransitioning, targetPosition, room }: CameraControllerProps) {
  const { camera, size } = useThree();
  const initialFovRef = useRef<number>(75);
  const targetVecRef = useRef<THREE.Vector3 | null>(null);

  // Ajuste responsivo del FOV según pantalla
  useEffect(() => {
    const aspect = size.width / size.height;
    if (aspect < 1) {
      initialFovRef.current = Math.max(90, Math.min(105, 75 / aspect * 0.65));
    } else {
      initialFovRef.current = 75;
    }
    if (!isTransitioning) {
      (camera as any).fov = initialFovRef.current;
      camera.position.set(0, 0, 0.1);
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height, room.id, isTransitioning]);

  // Manejo del objetivo y reinicio de cámara en transiciones
  useEffect(() => {
    if (!isTransitioning) {
      camera.position.set(0, 0, 0.1);
      (camera as any).fov = initialFovRef.current;
      camera.updateProjectionMatrix();
      targetVecRef.current = null;
    } else {
      if (targetPosition && targetPosition.length === 3) {
        // Moverse hacia el hotspot seleccionado en el 3D
        const vec = new THREE.Vector3(...targetPosition).normalize().multiplyScalar(35);
        targetVecRef.current = vec;
      } else {
        // Moverse hacia adelante según la mirada actual (ej. si se hace clic en minimapa)
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        targetVecRef.current = forward.normalize().multiplyScalar(35);
      }
    }
  }, [isTransitioning, targetPosition, camera, room.id]);

  useFrame(() => {
    if (isTransitioning && targetVecRef.current) {
      // Lerp suave de posición para simular caminata
      camera.position.lerp(targetVecRef.current, 0.08);
      
      // Lerp de FOV para efecto cinemático Dolly/Zoom Warp
      const currentFov = (camera as any).fov;
      const targetFov = 35;
      if (Math.abs(currentFov - targetFov) > 0.1) {
        (camera as any).fov = THREE.MathUtils.lerp(currentFov, targetFov, 0.08);
        camera.updateProjectionMatrix();
      }
    }
  });

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
  onNavigate: (roomId: string, targetPosition?: [number, number, number]) => void;
  isTransitioning?: boolean;
  targetPosition?: [number, number, number] | null;
  isIdle?: boolean;
}

export function TourViewer({ room, onNavigate, isTransitioning, targetPosition, isIdle }: TourViewerProps) {
  if (!room) return null;
  return (
    <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
      <CameraController isTransitioning={isTransitioning} targetPosition={targetPosition} room={room} />
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
        - autoRotate: Rotación panorámica suave cuando el usuario está inactivo (5s).
      */}
      <OrbitControls 
        enabled={!isTransitioning}
        enableZoom={false} 
        enablePan={false} 
        enableDamping={true}
        dampingFactor={0.08}
        rotateSpeed={-0.6}
        autoRotate={isIdle && !isTransitioning}
        autoRotateSpeed={0.4}
      />
    </Canvas>
  );
}
