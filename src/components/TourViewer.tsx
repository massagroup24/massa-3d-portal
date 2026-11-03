import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useProgress, DeviceOrientationControls } from '@react-three/drei';
import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { RoomSphere } from './RoomSphere';
import { Room } from '../data/tourData';

function ViewerUnavailable({ onRetry }: { onRetry: () => void }) {
  return <div className="absolute inset-0 flex items-center justify-center p-5 pointer-events-none">
    <div role="alert" className="max-w-sm rounded-2xl border border-white/20 bg-black/90 p-5 text-center text-white pointer-events-auto">
      <h2 className="font-semibold">El visor necesita reiniciarse</h2>
      <p className="mt-2 text-sm text-white/65">Vuelve a intentarlo para continuar el recorrido. También puedes regresar al proyecto.</p>
      <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl bg-white px-5 text-sm font-bold text-black touch-manipulation">Reintentar recorrido</button>
    </div>
  </div>;
}

class ViewerBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <ViewerUnavailable onRetry={this.props.onRetry} /> : this.props.children; }
}

function RendererLifecycle({ onLost, onRestored }: { onLost: () => void; onRestored: () => void }) {
  const renderer = useThree(state => state.gl);
  useEffect(() => {
    const canvas = renderer.domElement;
    const lost = (event: Event) => { event.preventDefault(); onLost(); };
    const resume = () => {
      if (document.visibilityState === 'visible' && renderer.getContext().isContextLost()) onLost();
    };
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    document.addEventListener('visibilitychange', resume);
    return () => {
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [renderer, onLost, onRestored]);
  return null;
}

interface CameraControllerProps {
  isTransitioning?: boolean;
  targetPosition?: [number, number, number] | null;
  room: Room;
}

function CameraController({ isTransitioning, targetPosition, room }: CameraControllerProps) {
  const { camera } = useThree();
  const targetVecRef = useRef<THREE.Vector3 | null>(null);

  // Mantener un FOV óptimo y fiel (75°) tanto en PC como en móviles sin distorsión ojo de pez
  useEffect(() => {
    (camera as any).fov = 75;
    camera.position.set(0, 0, 0.1);
    camera.updateProjectionMatrix();
  }, [camera, room.id]);

  // Manejo de transiciones cinemáticas fluidas hacia el hotspot seleccionado
  useEffect(() => {
    if (!isTransitioning) {
      camera.position.set(0, 0, 0.1);
      (camera as any).fov = 75;
      camera.updateProjectionMatrix();
      targetVecRef.current = null;
    } else {
      if (targetPosition && targetPosition.length === 3) {
        // Moverse hacia el hotspot en 3D
        const vec = new THREE.Vector3(...targetPosition).normalize().multiplyScalar(35);
        targetVecRef.current = vec;
      } else {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        targetVecRef.current = forward.normalize().multiplyScalar(35);
      }
    }
  }, [isTransitioning, targetPosition, camera, room.id]);

  useFrame(() => {
    if (isTransitioning && targetVecRef.current) {
      camera.position.lerp(targetVecRef.current, 0.08);
      const currentFov = (camera as any).fov;
      const targetFov = 42;
      if (Math.abs(currentFov - targetFov) > 0.1) {
        (camera as any).fov = THREE.MathUtils.lerp(currentFov, targetFov, 0.08);
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}

function Loader({ brandColor = '#9CD01A' }: { brandColor?: string }) {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2.5 select-none pointer-events-none">
        <div className="text-white text-xs sm:text-base font-semibold whitespace-nowrap bg-black/80 px-4 py-2 sm:px-6 sm:py-3 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl tracking-wide flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full animate-ping" 
            style={{ backgroundColor: brandColor }}
          />
          <span>Cargando 360° {Math.round(progress)}%</span>
        </div>
        <div className="w-32 sm:w-48 h-1 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
          <div 
            className="h-full transition-all duration-300 ease-out" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: brandColor,
              boxShadow: `0 0 8px ${brandColor}`
            }}
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
  isGyroEnabled?: boolean;
  brandColor?: string;
  brandName?: string;
}

export function TourViewer({
  room,
  onNavigate,
  isTransitioning,
  targetPosition,
  isIdle,
  isGyroEnabled = false,
  brandColor = '#9CD01A',
  brandName
}: TourViewerProps) {
  const [touchDevice] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  const [rendererKey, setRendererKey] = useState(0);
  const [contextLost, setContextLost] = useState(false);
  const restart = useCallback(() => { setContextLost(false); setRendererKey(value => value + 1); }, []);
  const markLost = useCallback(() => setContextLost(true), []);
  if (!room) return null;

  return (
    <ViewerBoundary key={rendererKey} onRetry={restart}>
    <Canvas 
      camera={{ position: [0, 0, 0.1], fov: 75 }}
      dpr={[1, touchDevice ? 1.5 : 2]}
      gl={{ 
        powerPreference: touchDevice ? 'default' : 'high-performance',
        antialias: !touchDevice,
        alpha: false 
      }}
      fallback={<ViewerUnavailable onRetry={restart} />}
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#08080A']} />
      <RendererLifecycle onLost={markLost} onRestored={restart} />
      <CameraController isTransitioning={isTransitioning} targetPosition={targetPosition} room={room} />
      <ambientLight intensity={1} />
      
      <Suspense fallback={<Loader brandColor={brandColor} />}>
        {room.imageUrl ? (
          <RoomSphere room={room} onNavigate={onNavigate} brandColor={brandColor} />
        ) : (
          <Html center>
            <div 
              className="flex flex-col items-center text-center p-5 sm:p-8 rounded-3xl bg-[#0D0D0E]/90 backdrop-blur-2xl border shadow-2xl max-w-[85vw] sm:max-w-md pointer-events-none select-none"
              style={{
                borderColor: `${brandColor}66`,
                boxShadow: `0 20px 50px rgba(0,0,0,0.9), 0 0 30px ${brandColor}33`
              }}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full animate-ping mb-3" 
                style={{ backgroundColor: brandColor, boxShadow: `0 0 10px ${brandColor}` }}
              />
              <span 
                className="text-[10px] font-mono uppercase tracking-[0.25em] font-bold mb-1"
                style={{ color: brandColor }}
              >
                {brandName || 'AMHO CONSTRUCCIONES'} • VISTA 360°
              </span>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-2">
                {room.name || 'Ambiente Arquitectónico'}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed mb-3">
                {room.description || 'Espacio preparado y listo para recibir la imagen equirectangular 360°.'}
              </p>
            </div>
          </Html>
        )}
      </Suspense>

      {/* 
        Controles de Navegación 360° Adaptativos:
        1. Si el usuario activa el giroscopio en celular, la cámara rota físicamente al mover el teléfono.
        2. Si no, OrbitControls gestiona el arrastre táctil natural sin bloquear el navegador.
      */}
      {isGyroEnabled ? (
        <DeviceOrientationControls makeDefault />
      ) : (
        <OrbitControls 
          enabled={!isTransitioning}
          enableZoom={false} 
          enablePan={false} 
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
          enableDamping={true}
          dampingFactor={0.08}
          rotateSpeed={-0.65}
          autoRotate={isIdle && !isTransitioning}
          autoRotateSpeed={0.35}
        />
      )}
    </Canvas>
    {contextLost && <ViewerUnavailable onRetry={restart} />}
    </ViewerBoundary>
  );
}
