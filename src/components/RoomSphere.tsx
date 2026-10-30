import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Room } from '../data/tourData';
import { HotspotMarker } from './HotspotMarker';
import { generateProceduralPanorama } from '../utils/panoramaFallback';

interface RoomSphereProps {
  room: Room;
  onNavigate: (roomId: string, targetPosition?: [number, number, number]) => void;
  brandColor?: string;
}

// Activar caché de texturas a nivel Three.js para evitar re-descargas
THREE.Cache.enabled = true;

// Caché de texturas para cambio instantáneo entre ambientes ya visitados
const textureCache = new Map<string, THREE.Texture>();

function SphereMesh({ texture }: { texture: THREE.Texture | null }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    if (matRef.current) {
      matRef.current.needsUpdate = true;
    }
  }, [texture]);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial 
        ref={matRef}
        key={texture ? texture.uuid : 'empty-sphere'}
        map={texture || undefined}
        color={texture ? '#FFFFFF' : '#0D0D0E'}
        side={THREE.DoubleSide} 
        toneMapped={false}
      />
    </mesh>
  );
}

export function RoomSphere({ room, onNavigate, brandColor }: RoomSphereProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(() => {
    if (room?.imageUrl && textureCache.has(room.imageUrl)) {
      return textureCache.get(room.imageUrl)!;
    }
    return null;
  });

  const currentLoadingUrlRef = useRef<string>('');

  useEffect(() => {
    let isCancelled = false;
    const rawUrl = room?.imageUrl?.trim();

    if (!rawUrl) {
      // Si no hay imagen configurada, generar textura arquitectónica de respaldo
      const fallbackUrl = generateProceduralPanorama(room?.name || 'Ambiente 360');
      const loader = new THREE.TextureLoader();
      loader.load(fallbackUrl, (tex) => {
        if (!isCancelled) {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = THREE.RepeatWrapping;
          tex.repeat.x = -1;
          setTexture(tex);
        }
      });
      return;
    }

    // Si ya está en caché, usarla directamente sin re-descargar
    if (textureCache.has(rawUrl)) {
      setTexture(textureCache.get(rawUrl)!);
      return;
    }

    currentLoadingUrlRef.current = rawUrl;

    // Codificar URL para soportar rutas con espacios como "/HACIENDA F22/360/ZONA SOCIAL.jpg"
    const safeUrl = encodeURI(rawUrl);
    const loader = new THREE.TextureLoader();
    
    // Solo activar crossOrigin si es una URL remota http/https
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      loader.setCrossOrigin('anonymous');
    }

    loader.load(
      safeUrl,
      (loadedTexture) => {
        if (isCancelled || currentLoadingUrlRef.current !== rawUrl) return;

        // Configuración de ultralujo y alto rendimiento para Three.js:
        // 1. Espacio de color sRGB para colores vivos y fieles a los renders 3D
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        // 2. LinearFilter sin mipmaps para evitar sobrecarga de GPU en texturas 4K (4096x2048)
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.generateMipmaps = false;
        // 3. Ajuste de repetición y actualización inmediata
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        loadedTexture.needsUpdate = true;

        textureCache.set(rawUrl, loadedTexture);
        setTexture(loadedTexture);
      },
      undefined,
      (err) => {
        if (isCancelled) return;
        console.warn(`[MASSA 3D] Error cargando esfera 360 de "${room?.name}" (${safeUrl}):`, err);

        // Si falla, generar panorama arquitectónico elegante de respaldo
        const fallbackUrl = generateProceduralPanorama(room?.name || 'Ambiente 360');
        const fallbackLoader = new THREE.TextureLoader();
        fallbackLoader.load(fallbackUrl, (fallbackTex) => {
          if (!isCancelled) {
            fallbackTex.colorSpace = THREE.SRGBColorSpace;
            fallbackTex.minFilter = THREE.LinearFilter;
            fallbackTex.generateMipmaps = false;
            setTexture(fallbackTex);
          }
        });
      }
    );

    return () => {
      isCancelled = true;
    };
  }, [room?.id, room?.imageUrl, room?.name]);

  if (!room) return null;

  return (
    <group>
      {/* 
        Esfera de 500 unidades para proyección equirectangular.
        SphereMesh garantiza montaje limpio con material reactivo y needsUpdate forzado.
      */}
      <SphereMesh texture={texture} />

      {/* Hotspots interactivos de navegación entre ambientes */}
      {(room.hotspots || []).filter(Boolean).map((hotspot) => (
        <HotspotMarker 
          key={hotspot.id} 
          hotspot={hotspot} 
          brandColor={brandColor}
          onClick={() => onNavigate(hotspot.targetRoom, hotspot.position)} 
        />
      ))}
    </group>
  );
}
