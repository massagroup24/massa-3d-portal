import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleBackground() {
  const ref = useRef<THREE.Points>(null);
  
  const particlesCount = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 15; // Spread particles
    }
    return pos;
  }, [particlesCount]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.05;
      ref.current.rotation.y -= delta * 0.07;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#a3e635" size={0.02} sizeAttenuation={true} depthWrite={false} opacity={0.6} />
    </Points>
  );
}

interface WelcomeScreenProps {
  projectName: string;
  onStart: () => void;
}

export function WelcomeScreen({ projectName, onStart }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#050508] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ParticleBackground />
        </Canvas>
      </div>
      
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h2 className="text-lime-400 text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
            Bienvenido al recorrido de
          </h2>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight drop-shadow-2xl">
            {projectName}
          </h1>
        </div>
        
        <button 
          onClick={onStart}
          className="mt-8 px-10 py-4 bg-lime-500 text-black text-lg font-semibold rounded-full hover:bg-lime-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(163,230,53,0.3)]"
        >
          Iniciar Recorrido
        </button>
      </div>
    </div>
  );
}
