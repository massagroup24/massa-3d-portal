import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Box, 
  RotateCw, 
  Moon, 
  Layers, 
  RotateCcw, 
  Eye
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface Model3DViewerProps {
  projectName: string;
}

type ViewMode = 'solid' | 'wireframe' | 'dusk';

// Architectural Residence 3D Geometry
function ArchitecturalResidence({ mode }: { mode: ViewMode }) {
  const isWireframe = mode === 'wireframe';
  const isDusk = mode === 'dusk';

  // Materials
  const concreteMat = new THREE.MeshStandardMaterial({
    color: isWireframe ? '#9CD01A' : isDusk ? '#2C3038' : '#D4D7DC',
    roughness: 0.35,
    metalness: 0.1,
    wireframe: isWireframe
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: isWireframe ? '#9CD01A' : isDusk ? '#1E1714' : '#3E2F28',
    roughness: 0.5,
    metalness: 0.05,
    wireframe: isWireframe
  });

  const tintedGlassMat = new THREE.MeshPhysicalMaterial({
    color: isWireframe ? '#9CD01A' : isDusk ? '#7EB4EA' : '#A3C4DC',
    transmission: isWireframe ? 0 : 0.85,
    opacity: isWireframe ? 1 : 0.6,
    transparent: true,
    roughness: 0.1,
    ior: 1.5,
    wireframe: isWireframe
  });

  const poolWaterMat = new THREE.MeshStandardMaterial({
    color: isWireframe ? '#9CD01A' : '#147494',
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: isWireframe ? 1 : 0.85,
    wireframe: isWireframe
  });

  const limeAccentMat = new THREE.MeshStandardMaterial({
    color: '#9CD01A',
    emissive: '#9CD01A',
    emissiveIntensity: isDusk ? 0.8 : 0.3,
    roughness: 0.2
  });

  const warmInteriorMat = new THREE.MeshStandardMaterial({
    color: '#FFE2A4',
    emissive: '#FFB84C',
    emissiveIntensity: isDusk ? 1.5 : 0.4
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. Base / Platform Foundation */}
      <mesh position={[0, 0.1, 0]} material={concreteMat} receiveShadow castShadow>
        <boxGeometry args={[10, 0.2, 8]} />
      </mesh>

      {/* 2. Swimming Pool sunken basin */}
      <mesh position={[2.8, 0.15, 2.2]} material={poolWaterMat}>
        <boxGeometry args={[3.2, 0.12, 2.4]} />
      </mesh>
      {/* Pool border */}
      <mesh position={[2.8, 0.11, 2.2]} material={darkWoodMat}>
        <boxGeometry args={[3.6, 0.1, 2.8]} />
      </mesh>

      {/* 3. Level 1 - Main Social Living Block */}
      <mesh position={[-1.2, 1.1, 0]} material={concreteMat} castShadow receiveShadow>
        <boxGeometry args={[5.2, 1.8, 4.6]} />
      </mesh>

      {/* Floor-to-ceiling glass front facing pool */}
      <mesh position={[-1.2, 1.1, 2.31]} material={tintedGlassMat}>
        <boxGeometry args={[4.8, 1.6, 0.05]} />
      </mesh>

      {/* Warm Interior core glow (visible through glass) */}
      <mesh position={[-1.2, 0.9, 1.2]} material={warmInteriorMat}>
        <boxGeometry args={[1.5, 0.8, 1.5]} />
      </mesh>

      {/* 4. Level 2 - Cantilevered Master Suite (Upper Volume projecting outward) */}
      <mesh position={[0.6, 2.5, 0.4]} material={darkWoodMat} castShadow receiveShadow>
        <boxGeometry args={[6.2, 1.4, 3.8]} />
      </mesh>

      {/* Upper floor panoramic ribbon window */}
      <mesh position={[0.6, 2.5, 2.31]} material={tintedGlassMat}>
        <boxGeometry args={[5.8, 1.1, 0.05]} />
      </mesh>

      {/* 5. Cantilevered Roof Canopy */}
      <mesh position={[0.6, 3.3, 0.4]} material={concreteMat} castShadow receiveShadow>
        <boxGeometry args={[6.8, 0.2, 4.4]} />
      </mesh>

      {/* 6. Massa Lime Architectural Accent Strip (Ground LED liner) */}
      <mesh position={[-4.8, 0.22, 0]} material={limeAccentMat}>
        <boxGeometry args={[0.08, 0.04, 7.8]} />
      </mesh>
      <mesh position={[0, 0.22, 3.8]} material={limeAccentMat}>
        <boxGeometry args={[9.8, 0.04, 0.08]} />
      </mesh>

      {/* 7. Vertical Concrete Feature Wall / Entrance Spine */}
      <mesh position={[-3.6, 1.8, 0.8]} material={concreteMat} castShadow receiveShadow>
        <boxGeometry args={[0.3, 3.2, 3.2]} />
      </mesh>
    </group>
  );
}

export function Model3DViewer({ projectName }: Model3DViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('solid');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const controlsRef = useRef<any>(null);

  // Manage WebGL context flag to notify OrbBackground and browser memory
  useEffect(() => {
    document.body.setAttribute('data-webgl-active', 'true');
    return () => {
      document.body.removeAttribute('data-webgl-active');
    };
  }, []);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#9CD01A]">
              Volumetría & Geometría BIM
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F5]">
            Modelo 3D Interactivo
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Exploración tridimensional en tiempo real para <span className="text-[#F5F5F5] font-medium">{projectName}</span>
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-[#171717]/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('solid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'solid'
                ? 'bg-[#9CD01A] text-black shadow-[0_0_15px_rgba(156,208,26,0.3)]'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Realista</span>
          </button>

          <button
            onClick={() => setViewMode('wireframe')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'wireframe'
                ? 'bg-[#9CD01A] text-black shadow-[0_0_15px_rgba(156,208,26,0.3)]'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>

          <button
            onClick={() => setViewMode('dusk')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'dusk'
                ? 'bg-[#9CD01A] text-black shadow-[0_0_15px_rgba(156,208,26,0.3)]'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Atardecer</span>
          </button>
        </div>
      </div>

      {/* 3D Viewport Glass Panel */}
      <GlassCard
        variant="card"
        glowColor="#9CD01A"
        className="p-0 overflow-hidden border-white/10 relative h-[650px] flex flex-col bg-[#0B0B0C]"
      >
        {/* Floating Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-black/70 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-[#9CD01A] animate-pulse" />
            <span className="font-semibold">{projectName} • Modelo Arquitectónico 3D</span>
            <span className="text-white/40 border-l border-white/15 pl-3 font-mono">
              Three.js 60 FPS
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2 bg-black/70 backdrop-blur-xl border border-white/15 p-1.5 rounded-2xl shadow-xl">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                autoRotate ? 'bg-white/15 text-[#9CD01A]' : 'bg-white/5 text-white/70'
              }`}
              title="Giro automático"
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span>{autoRotate ? 'Pausar Giro' : 'Auto Giro'}</span>
            </button>

            <button
              onClick={handleResetCamera}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition"
              title="Restablecer Cámara"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas WebGL Scene */}
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
          <Canvas
            shadows
            camera={{ position: [9, 6, 10], fov: 42 }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          >
            {/* Ambient Lighting depending on mode */}
            <color attach="background" args={[viewMode === 'dusk' ? '#090B10' : '#0B0B0C']} />
            
            {viewMode === 'dusk' ? (
              <>
                <ambientLight intensity={0.4} color="#5D7399" />
                <directionalLight position={[10, 8, 5]} intensity={1.5} color="#FF8C42" castShadow />
                <pointLight position={[-1.2, 1.2, 1.5]} intensity={2.5} color="#FFA24C" distance={6} />
              </>
            ) : (
              <>
                <ambientLight intensity={0.8} />
                <directionalLight
                  position={[12, 15, 8]}
                  intensity={1.4}
                  castShadow
                  shadow-mapSize={[1024, 1024]}
                />
                <directionalLight position={[-10, 8, -6]} intensity={0.4} color="#9CD01A" />
              </>
            )}

            {/* Architecture Building */}
            <ArchitecturalResidence mode={viewMode} />

            {/* Ground Grid */}
            <Grid
              position={[0, -0.21, 0]}
              args={[24, 24]}
              cellSize={0.8}
              cellThickness={0.6}
              cellColor="#333842"
              sectionSize={2.4}
              sectionThickness={1.2}
              sectionColor="#9CD01A"
              fadeDistance={22}
              fadeStrength={1.5}
            />

            {/* Contact Shadows on Ground */}
            <ContactShadows
              position={[0, -0.2, 0]}
              opacity={0.65}
              scale={20}
              blur={1.8}
              far={8}
            />

            {/* Controls */}
            <OrbitControls
              ref={controlsRef}
              autoRotate={autoRotate}
              autoRotateSpeed={0.8}
              enableDamping
              dampingFactor={0.05}
              maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
              minDistance={4}
              maxDistance={22}
            />
          </Canvas>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto bg-black/70 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-4 text-xs text-[#A3A3A3]">
            <div className="flex items-center gap-1.5 text-white/90">
              <Eye className="w-3.5 h-3.5 text-[#9CD01A]" />
              <span>Clic izquierdo: Rotar • Clic derecho: Mover • Scroll: Zoom</span>
            </div>
          </div>

          <div className="pointer-events-auto bg-black/70 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-white/40">ÁREA CUBIERTA: </span>
              <span className="text-white font-bold">440 m²</span>
            </div>
            <div className="w-[1px] h-3 bg-white/20" />
            <div>
              <span className="text-white/40">ALTURA LIBRE: </span>
              <span className="text-[#9CD01A] font-bold">3.20 m</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
