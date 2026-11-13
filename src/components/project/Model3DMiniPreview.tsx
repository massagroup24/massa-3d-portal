import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from 'lucide-react';

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

const TRANSPARENT_1PX_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function extendGltfLoader(loader: any) {
  loader.register((parser: any) => {
    const json = parser.json;
    if (json && Array.isArray(json.textures)) {
      let fallbackImageIndex = -1;
      for (const tex of json.textures) {
        if (!tex) continue;
        const hasValidStdSource =
          typeof tex.source === 'number' &&
          Array.isArray(json.images) &&
          Boolean(json.images[tex.source]);
        const webpExtSource = tex.extensions?.EXT_texture_webp?.source;
        const hasValidWebpSource =
          typeof webpExtSource === 'number' &&
          Array.isArray(json.images) &&
          Boolean(json.images[webpExtSource]);

        if (!hasValidStdSource && hasValidWebpSource) {
          tex.source = webpExtSource;
        } else if (!hasValidStdSource && !hasValidWebpSource) {
          if (!Array.isArray(json.images)) {
            json.images = [];
          }
          if (fallbackImageIndex === -1) {
            fallbackImageIndex = json.images.length;
            json.images.push({ uri: TRANSPARENT_1PX_PNG });
          }
          tex.source = fallbackImageIndex;
        }
      }
    }
    return { name: 'MASSA_MINI_PREVIEW_SAFE_TEXTURE_GUARD' };
  });
}

function MiniAnimatedHouseScene({
  modelUrl,
  onReady,
}: {
  modelUrl: string;
  onReady: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl, DRACO_DECODER_PATH, true, extendGltfLoader);
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    onReady();
  }, [onReady]);

  // Reproducir todas las animaciones (giro 360° + elevación de pisos) en bucle continuo
  useEffect(() => {
    if (!names || names.length === 0) return;
    names.forEach((clipName) => {
      const action = actions[clipName];
      if (action) {
        action.reset();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
        action.timeScale = 1.15; // Ritmo fluido para vista previa miniatura
        action.play();
      }
    });
    return () => {
      names.forEach((clipName) => {
        actions[clipName]?.stop();
      });
    };
  }, [actions, names]);

  // Si en un futuro se sube un modelo .glb sin animación de giro embebida, rotarlo suavemente
  useFrame((_, delta) => {
    if ((!names || names.length === 0) && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <Center top>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

interface Model3DMiniPreviewProps {
  modelUrl: string;
  posterUrl: string;
  projectName: string;
  accentColor?: string;
}

/**
 * Vista previa 3D en movimiento miniatura (ultra-ligera, sin sombras costosas ni cubemaps pesados)
 * para tarjetas compactas de la Biblioteca de Modelos 3D.
 */
export function Model3DMiniPreview({
  modelUrl,
  posterUrl,
  projectName,
  accentColor = '#9CD01A',
}: Model3DMiniPreviewProps) {
  const [isModelReady, setIsModelReady] = useState(false);

  return (
    <div className="relative w-full h-full bg-[#06080C] overflow-hidden select-none">
      {/* Imagen de respaldo arquitectónico mientras decodifica el .glb */}
      <img
        src={encodeURI(posterUrl)}
        alt={projectName}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 pointer-events-none ${
          isModelReady ? 'opacity-15 blur-[2px]' : 'opacity-65'
        }`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(156,208,26,0.14),rgba(5,7,10,0.92)_78%)] pointer-events-none" />

      {/* Canvas 3D Miniatura de bajo consumo */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [19, 12.5, 19], fov: 40, near: 0.5, far: 150 }}
          dpr={[0.8, 1.25]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'low-power',
          }}
        >
          {/* Iluminación arquitectónica ligera (0 sobrecarga de shaders) */}
          <ambientLight intensity={1.15} />
          <hemisphereLight args={['#ffffff', '#182218', 0.95]} />
          <directionalLight position={[18, 28, 16]} intensity={2.1} color="#fff9eb" />
          <directionalLight position={[-16, 14, -14]} intensity={0.95} color="#c7e8ff" />

          {/* Grilla base sutil bajo la casa */}
          <gridHelper
            args={[26, 20, accentColor, '#1b2430']}
            position={[0, -0.02, 0]}
          />

          <Suspense fallback={null}>
            <MiniAnimatedHouseScene
              modelUrl={modelUrl}
              onReady={() => setIsModelReady(true)}
            />
          </Suspense>

          <OrbitControls
            makeDefault
            target={[0, 2.3, 0]}
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minPolarAngle={0.35}
            maxPolarAngle={Math.PI / 2 - 0.06}
          />
        </Canvas>
      </div>

      {/* Indicador sutil mientras carga */}
      {!isModelReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#9CD01A]/40 text-[9px] font-mono text-[#D9FF66] uppercase tracking-wider">
            <Box className="w-3 h-3 text-[#9CD01A] animate-spin" />
            <span>Cargando 3D en vivo...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Model3DMiniPreview;

