import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Center,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useAnimations,
  useGLTF,
  useProgress,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Rewind,
  FastForward,
  Layers,
  Maximize2,
  Minimize2,
  Box,
} from 'lucide-react';

export const DRACO_DECODER_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
export const IBIZA_MODEL_URL = '/models/modelo_animado_web_360.glb';

// Salvaguarda para texturas exportadas desde Blender sin fuente asignada (evita crash en GLTFParser.loadTexture)
const extendGltfLoader = (loader: any) => {
  if (!loader || typeof loader.register !== 'function') return;
  loader.register((parser: any) => ({
    name: 'MASSA_SAFE_EMPTY_TEXTURE_GUARD',
    loadTexture(textureIndex: number) {
      const textureDef = parser?.json?.textures?.[textureIndex];
      if (!textureDef) return Promise.resolve(new THREE.Texture());
      const hasWebpSource = textureDef.extensions?.EXT_texture_webp?.source !== undefined;
      const hasStandardSource = textureDef.source !== undefined;
      if (!hasWebpSource && !hasStandardSource) {
        return Promise.resolve(new THREE.Texture());
      }
      return null;
    },
  }));
};

// Precarga del modelo con el decodificador Draco 1.5.7
useGLTF.preload(IBIZA_MODEL_URL, DRACO_DECODER_URL, true, extendGltfLoader);

interface AnimatedIbizaBuildingProps {
  modelUrl: string;
  isPlaying: boolean;
  seekRequest: { time: number; seq: number } | null;
  onDurationReady: (duration: number) => void;
  onTimeUpdate: (time: number) => void;
}

function AnimatedIbizaBuilding({
  modelUrl,
  isPlaying,
  seekRequest,
  onDurationReady,
  onTimeUpdate,
}: AnimatedIbizaBuildingProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl, DRACO_DECODER_URL, true, extendGltfLoader);
  const { actions, mixer } = useAnimations(animations, group);
  const durationRef = useRef<number>(15);
  const lastUiReportRef = useRef<number>(0);

  // Configurar sombras realistas en las mallas del modelo arquitectónico
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  // Extraer e iniciar automáticamente todas las animaciones en bucle (THREE.LoopRepeat)
  useEffect(() => {
    const actionList = Object.values(actions).filter(
      (action): action is THREE.AnimationAction => Boolean(action)
    );
    if (actionList.length === 0) return;

    let maxDuration = 0;
    actionList.forEach((action) => {
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.enabled = true;
      action.paused = false;
      action.play();
      const clipDuration = action.getClip().duration;
      if (clipDuration > maxDuration) {
        maxDuration = clipDuration;
      }
    });

    if (maxDuration > 0) {
      durationRef.current = maxDuration;
      onDurationReady(maxDuration);
    }
  }, [actions, onDurationReady]);

  // Pausar / Reanudar conservando capacidad de scrubbing en tiempo real
  useEffect(() => {
    mixer.timeScale = isPlaying ? 1 : 0;
  }, [isPlaying, mixer]);

  // Saltar / Scrubbing manual del tiempo de la animación (action.time) en todas las pistas sincronizadas
  useEffect(() => {
    if (!seekRequest) return;
    const actionList = Object.values(actions).filter(
      (action): action is THREE.AnimationAction => Boolean(action)
    );
    if (actionList.length === 0) return;

    const maxDur = durationRef.current || 15;
    const clampedTime = ((seekRequest.time % maxDur) + maxDur) % maxDur;

    const prevTimeScale = mixer.timeScale;
    mixer.timeScale = 1;
    actionList.forEach((action) => {
      action.paused = false;
      action.time = clampedTime;
    });
    mixer.update(0);
    mixer.timeScale = prevTimeScale;
    onTimeUpdate(clampedTime);
  }, [seekRequest, actions, mixer, onTimeUpdate]);

  // Reportar progreso actual al Slider de la UI de forma fluida
  useFrame((state) => {
    if (!isPlaying) return;
    const now = state.clock.elapsedTime;
    if (now - lastUiReportRef.current < 0.05) return;
    lastUiReportRef.current = now;

    const firstAction = Object.values(actions).find(
      (action): action is THREE.AnimationAction => Boolean(action)
    );
    if (firstAction) {
      onTimeUpdate(firstAction.time);
    }
  });

  return (
    <Center top>
      <group ref={group} dispose={null}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

function ElegantModelLoader({ accentColor = '#9CD01A' }: { accentColor?: string }) {
  const { progress } = useProgress();
  const rounded = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <Html center>
      <div className="w-72 sm:w-80 p-5 rounded-3xl bg-[#090B0F]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-center select-none pointer-events-none">
        <div
          className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center border"
          style={{
            backgroundColor: `${accentColor}18`,
            borderColor: `${accentColor}45`,
            boxShadow: `0 0 24px ${accentColor}30`,
          }}
        >
          <Box className="w-6 h-6 animate-pulse" style={{ color: accentColor }} />
        </div>
        <span
          className="block text-[10px] font-mono font-bold uppercase tracking-[0.22em] mb-1"
          style={{ color: accentColor }}
        >
          GEMELO 3D DRACO • WEBP
        </span>
        <p className="text-xs sm:text-sm font-bold text-white mb-3">
          Descargando Modelo Arquitectónico ({rounded}%)
        </p>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${rounded}%`,
              backgroundColor: accentColor,
              boxShadow: `0 0 12px ${accentColor}`,
            }}
          />
        </div>
        <span className="block text-[10px] font-mono text-white/45 mt-2">
          ~5.05 MB • Compresión Draco 1.5.7
        </span>
      </div>
    </Html>
  );
}

export interface IbizaAnimatedModel3DViewerProps {
  projectName?: string;
  accentColor?: string;
  modelUrl?: string;
  className?: string;
}

export function IbizaAnimatedModel3DViewer({
  projectName = 'IBIZA A14',
  accentColor = '#9CD01A',
  modelUrl = IBIZA_MODEL_URL,
  className = '',
}: IbizaAnimatedModel3DViewerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(15);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [seekRequest, setSeekRequest] = useState<{ time: number; seq: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.setAttribute('data-webgl-active', 'true');
    return () => {
      document.body.removeAttribute('data-webgl-active');
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleDurationReady = useCallback((dur: number) => {
    if (dur > 0) setDuration(dur);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const triggerSeek = useCallback(
    (targetTime: number, pauseOnSeek = false) => {
      const clamped = Math.max(0, Math.min(duration, targetTime));
      if (pauseOnSeek) {
        setIsPlaying(false);
      }
      setCurrentTime(clamped);
      setSeekRequest((prev) => ({ time: clamped, seq: (prev?.seq || 0) + 1 }));
    },
    [duration]
  );

  const handleStepTime = (deltaSeconds: number) => {
    const nextTime = ((currentTime + deltaSeconds) % duration + duration) % duration;
    triggerSeek(nextTime, false);
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Porcentaje real de apertura de Ctrl_Nivel2 (+4.5m) y Ctrl_Nivel3_Cubierta (+9.0m):
  // 0s -> 5s: sube de 0% a 100% | 5s -> 10s: se mantiene en 100% | 10s -> 15s: baja de 100% a 0%
  const explosionRatio = (() => {
    const dur = duration || 15;
    const t = Math.max(0, Math.min(dur, currentTime));
    const third = dur / 3;
    if (t <= third) return Math.round((t / third) * 100);
    if (t <= third * 2) return 100;
    return Math.round(Math.max(0, (1 - (t - third * 2) / third) * 100));
  })();

  return (
    <div
      ref={containerRef}
      style={{
        borderColor: `${accentColor}45`,
        boxShadow: `0 25px 80px rgba(0,0,0,0.92), 0 0 45px ${accentColor}18`,
      }}
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#0A0D12] via-[#07090C] to-[#050608] border select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen w-screen'
          : 'h-[520px] sm:h-[640px] lg:h-[720px]'
      } ${className}`}
    >
      {/* Barra flotante superior informativa */}
      <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="apple-aqua-bubble-studio px-3.5 py-1.5 rounded-full flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-white">
            <span
              className="w-2 h-2 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <span>{projectName} • VISTA EXPLOSIVA 3D</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-xl border border-white/15 text-[10px] font-mono text-white/75">
            <Layers className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Apertura Pisos 2 &amp; Cubierta:</span>
            <strong className="text-white">{explosionRatio}%</strong>
          </div>
        </div>

        {/* Acciones rápidas superiores: Presets de Pisos + Pantalla Completa */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => triggerSeek(0, true)}
            className="apple-aqua-bubble px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-white/85 hover:text-white cursor-pointer"
            title="Ver edificio con todos los pisos cerrados"
          >
            Pisos Cerrados
          </button>
          <button
            type="button"
            onClick={() => triggerSeek(duration / 2, true)}
            className="apple-aqua-bubble-studio px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-[#D9FF66] cursor-pointer"
            title="Pausar con Nivel 2 y Nivel 3 Cubierta elevados al máximo para inspeccionar el interior"
          >
            Inspeccionar Interior
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="apple-aqua-bubble w-9 h-9 rounded-full flex items-center justify-center text-white/85 hover:text-white cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ESCENA 3D WEBGL (@react-three/fiber + @react-three/drei) */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          shadows
          camera={{ position: [20, 14, 20], fov: 45 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#07090C']} />

          {/* Iluminación y Entorno Arquitectónico (Regla 4) */}
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[18, 28, 16]}
            intensity={1.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          >
            <orthographicCamera attach="shadow-camera" args={[-28, 28, 28, -28, 1, 80]} />
          </directionalLight>

          <Environment preset="city" />

          {/* Modelo 3D envuelto en Suspense con Center top (Regla 5) */}
          <Suspense fallback={<ElegantModelLoader accentColor={accentColor} />}>
            <AnimatedIbizaBuilding
              modelUrl={modelUrl}
              isPlaying={isPlaying}
              seekRequest={seekRequest}
              onDurationReady={handleDurationReady}
              onTimeUpdate={handleTimeUpdate}
            />
          </Suspense>

          {/* Sombras de contacto suaves sobre el plano base en y={-0.01} (Regla 4) */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.6}
            scale={55}
            blur={2.2}
            far={20}
          />

          {/* OrbitControls con límites de distancia y ángulo polar (Regla 4) */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            minDistance={6}
            maxDistance={45}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
      </div>

      {/* CONTROLES FLOTANTES MINIMALISTAS EN LA ESQUINA INFERIOR (Regla 3) */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pointer-events-none">
        <div className="pointer-events-auto flex-1 max-w-3xl mx-auto w-full px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-full bg-black/75 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex items-center gap-2.5 sm:gap-3.5">
          {/* Botón Pausar / Reanudar */}
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className="apple-aqua-bubble-lime px-3.5 sm:px-4 py-2 rounded-full text-[#060804] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
            title={isPlaying ? 'Pausar animación para inspeccionar interior' : 'Reanudar animación 360°'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Reanudar</span>
              </>
            )}
          </button>

          {/* Botón Retroceder (-1.5s) */}
          <button
            type="button"
            onClick={() => handleStepTime(-1.5)}
            className="apple-aqua-bubble w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/85 hover:text-white cursor-pointer shrink-0"
            title="Retroceder animación (-1.5s)"
          >
            <Rewind className="w-3.5 h-3.5" />
          </button>

          {/* Slider interactivo (action.time) para abrir/cerrar los pisos a voluntad */}
          <div className="flex-1 flex flex-col justify-center min-w-[90px]">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/65 mb-1">
              <span className="truncate">Giro 360° &amp; Elevación de Niveles</span>
              <span className="tabular-nums font-bold text-white ml-2">
                {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.04}
              value={currentTime}
              onChange={(e) => triggerSeek(parseFloat(e.target.value), true)}
              aria-label="Control de tiempo de animación y apertura de niveles"
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/20 accent-[#9CD01A]"
            />
          </div>

          {/* Botón Adelantar (+1.5s) */}
          <button
            type="button"
            onClick={() => handleStepTime(1.5)}
            className="apple-aqua-bubble w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/85 hover:text-white cursor-pointer shrink-0"
            title="Adelantar animación (+1.5s)"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>

          {/* Botón Resetear Cámara */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="apple-aqua-bubble px-3 sm:px-3.5 py-2 rounded-full text-white/90 hover:text-white font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Resetear cámara a la posición inicial"
          >
            <RotateCcw className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="hidden md:inline">Resetear Cámara</span>
          </button>
        </div>
      </div>
    </div>
  );
}

