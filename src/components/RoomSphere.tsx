import { useTexture } from '@react-three/drei';
import { BackSide } from 'three';
import { Room } from '../data/tourData';
import { HotspotMarker } from './HotspotMarker';

interface RoomSphereProps {
  room: Room;
  onNavigate: (roomId: string, targetPosition?: [number, number, number]) => void;
}

export function RoomSphere({ room, onNavigate }: RoomSphereProps) {
  if (!room || !room.imageUrl) return null;
  // Load the equirectangular texture
  const texture = useTexture(room.imageUrl);

  return (
    <group>
      {/* 
        The giant sphere that acts as the room environment.
        We scale X by -1 so that the image is rendered correctly when viewed from the inside.
        Without this, text and features in the image would be mirrored.
      */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 60, 40]} />
        {/* We map the texture to the inside of the sphere */}
        <meshBasicMaterial map={texture} side={BackSide} />
      </mesh>

      {/* Render all hotspots for the current room */}
      {(room.hotspots || []).filter(Boolean).map((hotspot) => (
        <HotspotMarker 
          key={hotspot.id} 
          hotspot={hotspot} 
          onClick={() => onNavigate(hotspot.targetRoom, hotspot.position)} 
        />
      ))}
    </group>
  );
}
