import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Compass, MousePointerClick, Clock, ArrowRight, Eye, ArrowLeft } from 'lucide-react';

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
  onBack?: () => void;
}

export function WelcomeScreen({ projectName, onStart, onBack }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#050508] flex flex-col items-center justify-center overflow-y-auto p-4 sm:p-6 select-none">
      {/* Botón superior Volver al Portal */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-30 bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 backdrop-blur-md shadow-lg group hover:border-lime-400/40"
          title="Regresar al Portal Principal"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-lime-400" />
          <span>Volver al Menú</span>
        </button>
      )}

      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ParticleBackground />
        </Canvas>
      </div>
      
      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-7 text-center max-w-3xl mx-auto my-auto py-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/30 px-4 py-1.5 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(163,230,53,0.15)]">
          <Eye className="w-4 h-4 text-lime-400 animate-pulse" />
          <span className="text-lime-400 text-xs tracking-[0.2em] uppercase font-semibold">
            Bienvenido al Recorrido 360°
          </span>
        </div>

        {/* Título del proyecto */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl">
            {projectName}
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto font-light">
            Prepárate para explorar cada espacio de manera interactiva y totalmente inmersiva.
          </p>
        </div>

        {/* Tarjeta de Instrucciones de Navegación */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row gap-6 text-left">
          <div className="flex-1 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 flex-shrink-0 mt-0.5 shadow-lg">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Explora a tu ritmo</h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                Haz clic y arrastra en cualquier dirección con tu ratón (o desliza el dedo en tu pantalla) para girar y mirar en 360°.
              </p>
            </div>
          </div>

          <div className="w-px bg-white/10 hidden sm:block" />

          <div className="flex-1 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 flex-shrink-0 mt-0.5 shadow-lg">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Puntos de Navegación</h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                Pulsa sobre los círculos parpadeantes (<span className="text-white font-medium">hotspots</span>) o utiliza el plano inferior para moverte entre habitaciones.
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de paciencia / aviso de carga */}
        <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md text-left flex items-start gap-4 shadow-lg">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5 animate-pulse">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-amber-300 font-semibold text-xs sm:text-sm tracking-wide uppercase flex items-center gap-2">
              Aviso Importante de Carga
            </h4>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Por favor, <span className="text-amber-300 font-semibold">ten un poco de paciencia si el sistema tarda unos segundos en cargar las imágenes</span>. 
              No cierres el programa ni la ventana; es <span className="underline decoration-amber-500/50">completamente normal</span> que tome un breve momento descargar y procesar la alta resolución en 360° de todo el proyecto.
            </p>
          </div>
        </div>
        
        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-3 w-full">
          <button 
            onClick={onStart}
            className="px-10 py-4 bg-lime-500 text-black text-base sm:text-lg font-bold rounded-full hover:bg-lime-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(163,230,53,0.3)] hover:shadow-[0_0_40px_rgba(163,230,53,0.6)] flex items-center gap-3 group"
          >
            <span>Comenzar Recorrido</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium rounded-full border border-white/15 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-white/60" />
              <span>Volver al Menú Principal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
