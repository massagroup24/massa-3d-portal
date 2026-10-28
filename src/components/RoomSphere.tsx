import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { BackSide } from 'three';
import { Room } from '../data/tourData';
import { HotspotMarker } from './HotspotMarker';
import { generateProceduralPanorama } from '../utils/panoramaFallback';

interface RoomSphereProps {
  room: Room;
  onNavigate: (roomId: string, targetPosition?: [number, number, number]) => void;
}

export function RoomSphere({ room, onNavigate }: RoomSphereProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let isCancelled = false;

    // 1. Crear inmediatamente una textura inicial para evitar cualquier bloqueo o parpadeo
    const fallbackDataUrl = generateProceduralPanorama(room?.name || 'Ambiente 360');
    const imgFallback = new Image();
    imgFallback.onload = () => {
      if (isCancelled) return;
      const initialTex = new THREE.Texture(imgFallback);
      initialTex.needsUpdate = true;
      initialTex.wrapS = THREE.RepeatWrapping;
      initialTex.repeat.x = -1; // Mantener orientación correcta
      if (!texture) {
        setTexture(initialTex);
      }
    };
    imgFallback.src = fallbackDataUrl;

    // 2. Si hay una URL de imagen real especificada, intentar cargarla
    const rawUrl = room?.imageUrl?.trim();
    if (rawUrl && rawUrl !== fallbackDataUrl) {
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';

      loader.load(
        rawUrl,
        (loadedTexture) => {
          if (isCancelled) return;
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.needsUpdate = true;
          setTexture(loadedTexture);
        },
        undefined,
        (err) => {
          console.warn(`[MASSA 3D] Error cargando textura 360 de "${room?.name}" (${rawUrl}):`, err);
          // Mantiene la textura fallback arquitectónica generada automáticamente
        }
      );
    }

    return () => {
      isCancelled = true;
    };
  }, [room?.id, room?.imageUrl, room?.name]);

  if (!room) return null;

  return (
    <group>
      {/* 
        Esfera gigante de 500 unidades para proyección equirectangular.
        Escala X en -1 para vista interior sin espejo.
      */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 64, 40]} />
        {texture ? (
          <meshBasicMaterial map={texture} side={BackSide} />
        ) : (
          <meshBasicMaterial color="#141418" side={BackSide} />
        )}
      </mesh>

      {/* Hotspots interactivos de navegación entre ambientes */}
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
