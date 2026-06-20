import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useTexture, Html } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { BackSide } from 'three';
import { Room } from '../data/tourData';

interface HotspotEditorProps {
  room: Room;
  onAddHotspot: (position: [number, number, number]) => void;
}

function EditableSphere({ imageUrl, onClick }: { imageUrl: string; onClick: (p: [number, number, number]) => void }) {
  const texture = useTexture(imageUrl);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // Intersected point in 3D space
    const point = e.intersections[0].point;
    onClick([point.x, point.y, point.z]);
  };

  return (
    <mesh scale={[-1, 1, 1]} onClick={handleClick} onPointerOver={() => document.body.style.cursor = 'crosshair'} onPointerOut={() => document.body.style.cursor = 'auto'}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
}

export function HotspotEditor3D({ room, onAddHotspot }: HotspotEditorProps) {
  const [addingPoint, setAddingPoint] = useState(false);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/20">
      
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={() => setAddingPoint(!addingPoint)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg backdrop-blur-md border ${
            addingPoint 
              ? 'bg-lime-500 text-black border-lime-400 animate-pulse' 
              : 'bg-black/60 text-white border-white/20 hover:bg-white/10'
          }`}
        >
          {addingPoint ? 'Haz clic en la imagen 360' : '+ Añadir Punto de Navegación'}
        </button>
      </div>

      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <ambientLight intensity={1} />
        <Suspense fallback={
          <Html center>
            <div className="text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
              Cargando 360...
            </div>
          </Html>
        }>
          {room.imageUrl ? (
            <EditableSphere 
              imageUrl={room.imageUrl} 
              onClick={(pos) => {
                if (addingPoint) {
                  onAddHotspot(pos);
                  setAddingPoint(false);
                }
              }} 
            />
          ) : (
            <Html center>
              <div className="text-white text-sm bg-black/60 border border-white/20 px-6 py-3 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-2 animate-bounce">
                👆 Sube tu imagen 360 en el menú de la izquierda
              </div>
            </Html>
          )}
        </Suspense>
        
        {/* Render existing hotspots as ghost markers */}
        {room.hotspots.map((hotspot) => (
          <Html key={hotspot.id} position={hotspot.position} center>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white flex items-center justify-center opacity-50 pointer-events-none">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </Html>
        ))}

        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={-0.5} 
        />
      </Canvas>
      
      {addingPoint && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm border border-white/10 animate-bounce">
          Gira la cámara y haz clic donde quieras poner el botón
        </div>
      )}
    </div>
  );
}
