import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, extend, type RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomSphere } from '../../src/components/RoomSphere';
import type { Room } from '../../src/data/tourData';
import { loadPanoramaTexture } from '../../src/utils/panoramaTexture';

vi.mock('@react-three/drei', () => ({ Html: () => null }));
vi.mock('../../src/components/HotspotMarker', () => ({ HotspotMarker: () => null }));
vi.mock('../../src/utils/panoramaTexture', () => ({ loadPanoramaTexture: vi.fn() }));
extend(THREE);

const room: Room = {
  id: 'living', name: 'Sala', description: '', imageUrl: '/living.jpg',
  hotspots: [], minimapPosition: { x: 50, y: 50 },
};

describe('Esfera 360 con descarga retrasada', () => {
  let root: ReturnType<typeof createRoot>;
  let state: RootState;
  let finish: (texture: THREE.Texture) => void;
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }), devicePixelRatio: 1 });
    vi.mocked(loadPanoramaTexture).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const canvas = { width: 390, height: 844, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    const gl = {
      render: vi.fn(), setPixelRatio: vi.fn(), setSize: vi.fn(),
      capabilities: { maxTextureSize: 8192 }, domElement: canvas,
      xr: { enabled: false, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      shadowMap: {},
    };
    root = createRoot(canvas as unknown as HTMLCanvasElement);
    root.configure({ gl: gl as any, frameloop: 'never', size: { width: 390, height: 844, top: 0, left: 0 }, onCreated: value => { state = value; } });
  });
  afterEach(async () => {
    await act(async () => { root.unmount(); });
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function sphere() {
    let found: THREE.Mesh | undefined;
    state.scene.traverse(object => { if (object instanceof THREE.Mesh) found = object; });
    return found;
  }

  it('compila un material con textura cuando la foto llega después del primer dibujo', async () => {
    await act(async () => { root.render(<RoomSphere room={room} onNavigate={() => {}} />); });
    const before = sphere()?.material as THREE.MeshBasicMaterial | undefined;
    const initialVersion = before?.version;
    const texture = new THREE.Texture();
    await act(async () => { finish(texture); });
    const after = sphere()?.material as THREE.MeshBasicMaterial;
    expect(after.map).toBe(texture);
    // Cambiar de map=null a una foto exige material nuevo o needsUpdate.
    expect(after !== before || after.version > initialVersion!).toBe(true);
  });

  it('libera la foto anterior y no la reutiliza como escena nueva durante la descarga', async () => {
    await act(async () => { root.render(<RoomSphere room={room} onNavigate={() => {}} />); });
    const texture = new THREE.Texture();
    const dispose = vi.spyOn(texture, 'dispose');
    await act(async () => { finish(texture); });
    await act(async () => { root.render(<RoomSphere room={{ ...room, id: 'bedroom', imageUrl: '/bedroom.jpg' }} onNavigate={() => {}} />); });
    expect(dispose).toHaveBeenCalledOnce();
    expect((sphere()?.material as THREE.MeshBasicMaterial | undefined)?.map).not.toBe(texture);
  });
});
