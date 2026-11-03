import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Room } from '../data/tourData';
import { HotspotMarker } from './HotspotMarker';
import { loadPanoramaTexture } from '../utils/panoramaTexture';

interface RoomSphereProps {
  room: Room;
  onNavigate: (roomId: string, targetPosition?: [number, number, number]) => void;
  brandColor?: string;
}

export function RoomSphere({ room, onNavigate, brandColor = '#9CD01A' }: RoomSphereProps) {
  const maxTextureSize = useThree(state => state.gl.capabilities.maxTextureSize);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let ownedTexture: THREE.Texture | null = null;
    setTexture(null);
    setStatus('loading');
    const touchDevice = window.matchMedia('(pointer: coarse)').matches;
    void loadPanoramaTexture(room.imageUrl, maxTextureSize, touchDevice, controller.signal)
      .then(loaded => {
        if (controller.signal.aborted) { loaded.dispose(); return; }
        ownedTexture = loaded;
        setTexture(loaded);
        setStatus('ready');
      })
      .catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => {
      controller.abort();
      ownedTexture?.dispose();
    };
  }, [room.id, room.imageUrl, maxTextureSize, retry]);

  return <group>
    {/* Crear el material con su mapa desde el primer dibujo. Añadir map después
        de compilarlo sin textura deja el shader sin USE_MAP en cargas lentas. */}
    {texture && status === 'ready' && <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} color="#FFFFFF" side={THREE.DoubleSide} toneMapped={false} />
    </mesh>}
    {status !== 'ready' && <Html center zIndexRange={[20, 0]}>
      <div className="w-64 max-w-[80vw] rounded-2xl border border-white/20 bg-black/90 p-5 text-center text-white shadow-xl">
        <p role="status" className="text-sm font-semibold">{status === 'loading' ? 'Cargando ambiente 360°…' : 'No se pudo cargar este ambiente'}</p>
        {status === 'error' && <>
          <p className="mt-2 text-xs text-white/65">Revisa tu conexión y vuelve a intentarlo. También puedes elegir otro ambiente.</p>
          <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-4 min-h-11 rounded-xl px-5 text-sm font-bold touch-manipulation" style={{ backgroundColor: brandColor, color: '#08080A' }}>Reintentar</button>
        </>}
      </div>
    </Html>}
    {status === 'ready' && (room.hotspots || []).filter(Boolean).map(hotspot =>
      <HotspotMarker key={hotspot.id} hotspot={hotspot} brandColor={brandColor}
        onClick={() => onNavigate(hotspot.targetRoom, hotspot.position)} />
    )}
  </group>;
}
