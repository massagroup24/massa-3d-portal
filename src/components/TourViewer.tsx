import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { RoomSphere } from './RoomSphere';
import { Room } from '../data/tourData';
import { Html } from '@react-three/drei';

interface TourViewerProps {
  room: Room;
  onNavigate: (roomId: string) => void;
}

export function TourViewer({ room, onNavigate }: TourViewerProps) {
  return (
    <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
      <ambientLight intensity={1} />
      <Suspense fallback={
        <Html center>
          <div className="text-white text-xl font-medium whitespace-nowrap bg-black/50 px-6 py-3 rounded-full backdrop-blur-md border border-white/20">
            Cargando 360...
          </div>
        </Html>
      }>
        {room.imageUrl ? (
          <RoomSphere room={room} onNavigate={onNavigate} />
        ) : (
          <Html center>
            <div className="text-white text-xl font-medium whitespace-nowrap bg-black/80 px-6 py-3 rounded-full backdrop-blur-md border border-red-500/50 shadow-2xl">
              Esta habitación no tiene imagen 360 aún.
            </div>
          </Html>
        )}
      </Suspense>
      {/* 
        OrbitControls configuration for 360 viewer:
        - enableZoom={false}: Prevents scrolling to zoom in/out, keeping camera at center.
        - enablePan={false}: Prevents moving the camera off-center.
        - rotateSpeed={-0.5}: Negative speed inverts the drag direction so it feels like grabbing the world.
      */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={-0.5} 
      />
    </Canvas>
  );
}
