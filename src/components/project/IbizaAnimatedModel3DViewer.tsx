import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
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
  ZoomIn,
  ZoomOut,
  Eye,
  Compass,
  Hand,
  Smartphone,
  ArrowLeft,
} from 'lucide-react';

export const DRACO_DECODER_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
export const IBIZA_MODEL_URL = '/models/modelo_animado_web_360.glb';

// Salvaguarda para texturas exportadas desde Blender sin fuente asignada
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

// Calcula el porcentaje real de apertura de Nivel 2 (+4.5m) y Cubierta (+9.0m)
function computeExplosionPercent(time: number, duration: number): number {
  const dur = duration || 15;
  const t = Math.max(0, Math.min(dur, time));
  const third = dur / 3;
  if (t <= third) return Math.round((t / third) * 100);
  if (t <= third * 2) return 100;
  return Math.round(Math.max(0, (1 - (t - third * 2) / third) * 100));
}

export interface CameraPresetTarget {
  position: [number, number, number];
  target: [number, number, number];
  seq: number;
}

interface CameraRigControllerProps {
  controlsRef: React.MutableRefObject<any>;
  cameraPreset: CameraPresetTarget | null;
  zoomStepRequest: { delta: number; seq: number } | null;
}

function CameraRigController({
  controlsRef,
  cameraPreset,
  zoomStepRequest,
}: CameraRigControllerProps) {
  const { camera, invalidate } = useThree();
  const desiredPosRef = useRef<THREE.Vector3 | null>(null);
  const desiredTargetRef = useRef<THREE.Vector3 | null>(null);
  const isTransitioningRef = useRef<boolean>(false);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const stopTransition = () => {
      isTransitioningRef.current = false;
    };
    controls.addEventListener('start', stopTransition);
    return () => {
      controls.removeEventListener('start', stopTransition);
    };
  }, [controlsRef]);

  useEffect(() => {
    if (!cameraPreset) return;
    desiredPosRef.current = new THREE.Vector3(...cameraPreset.position);
    desiredTargetRef.current = new THREE.Vector3(...cameraPreset.target);
    isTransitioningRef.current = true;
    invalidate();
  }, [cameraPreset, invalidate]);

  useEffect(() => {
    if (!zoomStepRequest || !controlsRef.current) return;
    const controls = controlsRef.current;
    const target = controls.target as THREE.Vector3;
    const offset = camera.position.clone().sub(target);
    const currentDist = offset.length();
    const nextDist = THREE.MathUtils.clamp(currentDist + zoomStepRequest.delta, 6.5, 42);
    offset.normalize().multiplyScalar(nextDist);
    desiredPosRef.current = target.clone().add(offset);
    desiredTargetRef.current = target.clone();
    isTransitioningRef.current = true;
    invalidate();
  }, [zoomStepRequest, camera, controlsRef, invalidate]);

  useFrame((_, delta) => {
    if (!isTransitioningRef.current || !desiredPosRef.current || !desiredTargetRef.current) {
      return;
    }
    const controls = controlsRef.current;
    const step = 1 - Math.exp(-6.5 * Math.min(delta, 0.1));

    camera.position.lerp(desiredPosRef.current, step);
    if (controls && controls.target) {
      controls.target.lerp(desiredTargetRef.current, step);
      controls.update();
    }

    if (
      camera.position.distanceTo(desiredPosRef.current) < 0.08 &&
      (!controls?.target || controls.target.distanceTo(desiredTargetRef.current) < 0.08)
    ) {
      camera.position.copy(desiredPosRef.current);
      if (controls?.target) {
        controls.target.copy(desiredTargetRef.current);
        controls.update();
      }
      isTransitioningRef.current = false;
    }
  });

  return null;
}

interface AnimatedIbizaBuildingProps {
  modelUrl: string;
  isPlaying: boolean;
  playbackSpeed: number;
  isMobileDevice: boolean;
  seekRequest: { time: number; seq: number } | null;
  onDurationReady: (duration: number) => void;
  onSyncTimeDom: (time: number, duration: number) => void;
}

function AnimatedIbizaBuilding({
  modelUrl,
  isPlaying,
  playbackSpeed,
  isMobileDevice,
  seekRequest,
  onDurationReady,
  onSyncTimeDom,
}: AnimatedIbizaBuildingProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl, DRACO_DECODER_URL, true, extendGltfLoader);
  const { actions, mixer } = useAnimations(animations, group);
  const { invalidate } = useThree();
  const durationRef = useRef<number>(15);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = !isMobileDevice;
        mesh.receiveShadow = !isMobileDevice;
        mesh.frustumCulled = true;

        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && isMobileDevice) {
          const maps = [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.aoMap];
          maps.forEach((tex) => {
            if (tex) {
              tex.anisotropy = 1;
            }
          });
        }
      }
    });
  }, [scene, isMobileDevice]);

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

  useEffect(() => {
    mixer.timeScale = isPlaying ? playbackSpeed : 0;
    invalidate();
  }, [isPlaying, playbackSpeed, mixer, invalidate]);

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
    onSyncTimeDom(clampedTime, maxDur);
    invalidate();
  }, [seekRequest, actions, mixer, onSyncTimeDom, invalidate]);

  useFrame(() => {
    if (!isPlaying) return;
    const firstAction = Object.values(actions).find(
      (action): action is THREE.AnimationAction => Boolean(action)
    );
    if (firstAction) {
      onSyncTimeDom(firstAction.time, durationRef.current || 15);
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
      <div className="w-64 sm:w-80 p-5 rounded-3xl bg-[#090B0F]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-center select-none pointer-events-none">
        <div
          className="w-11 h-11 mx-auto mb-3 rounded-2xl flex items-center justify-center border"
          style={{
            backgroundColor: `${accentColor}18`,
            borderColor: `${accentColor}45`,
            boxShadow: `0 0 24px ${accentColor}30`,
          }}
        >
          <Box className="w-5 h-5 animate-pulse" style={{ color: accentColor }} />
        </div>
        <span
          className="block text-[10px] font-mono font-bold uppercase tracking-[0.22em] mb-1"
          style={{ color: accentColor }}
        >
          GEMELO 3D DRACO • WEBP
        </span>
        <p className="text-xs sm:text-sm font-bold text-white mb-3">
          Cargando Volumetría 3D ({rounded}%)
        </p>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${rounded}%`,
              backgroundColor: accentColor,
              boxShadow: `0 0 12px ${accentColor}`,
            }}
          />
        </div>
        <span className="block text-[10px] font-mono text-white/45 mt-2">
          Pestaña Dedicada de Alto Rendimiento • Draco 1.5.7
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
  fullViewport?: boolean;
  onBackToProject?: () => void;
}

export function IbizaAnimatedModel3DViewer({
  projectName = 'IBIZA A14',
  accentColor = '#9CD01A',
  modelUrl = IBIZA_MODEL_URL,
  className = '',
  fullViewport = false,
  onBackToProject,
}: IbizaAnimatedModel3DViewerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [duration, setDuration] = useState<number>(15);
  const [activeFloorMode, setActiveFloorMode] = useState<'auto' | 'closed' | 'exploded'>('auto');
  const [activeCamPresetName, setActiveCamPresetName] = useState<string>('general');
  const [seekRequest, setSeekRequest] = useState<{ time: number; seq: number } | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetTarget | null>(null);
  const [zoomStepRequest, setZoomStepRequest] = useState<{ delta: number; seq: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(false);
  const [showTouchHint, setShowTouchHint] = useState<boolean>(true);

  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<number>(0);

  const sliderInputRef = useRef<HTMLInputElement>(null);
  const sliderProgressFillRef = useRef<HTMLDivElement>(null);
  const timeReadoutRef = useRef<HTMLSpanElement>(null);
  const explosionPercentRef = useRef<HTMLElement>(null);

  // Detectar móvil y orientación (vertical vs horizontal) en tiempo real
  useEffect(() => {
    const checkDeviceAndOrientation = () => {
      const isTouchMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) ||
        (navigator.maxTouchPoints > 1 && Math.min(window.innerWidth, window.innerHeight) < 920);

      setIsMobileDevice(isTouchMobile);
      const isPortrait = isTouchMobile && window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isPortrait);
    };

    checkDeviceAndOrientation();
    window.addEventListener('resize', checkDeviceAndOrientation, { passive: true });
    window.addEventListener('orientationchange', checkDeviceAndOrientation, { passive: true });
    return () => {
      window.removeEventListener('resize', checkDeviceAndOrientation);
      window.removeEventListener('orientationchange', checkDeviceAndOrientation);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Sincronización directa al DOM sin causar re-renders de React
  const handleSyncTimeDom = useCallback((time: number, dur: number) => {
    currentTimeRef.current = time;
    if (sliderInputRef.current) {
      sliderInputRef.current.value = time.toFixed(2);
    }
    if (sliderProgressFillRef.current) {
      const pct = Math.min(100, Math.max(0, (time / (dur || 15)) * 100));
      sliderProgressFillRef.current.style.width = `${pct}%`;
    }
    if (timeReadoutRef.current) {
      timeReadoutRef.current.textContent = `${time.toFixed(1)}s / ${dur.toFixed(1)}s`;
    }
    if (explosionPercentRef.current) {
      const exp = computeExplosionPercent(time, dur);
      explosionPercentRef.current.textContent = `${exp}%`;
    }
  }, []);

  const handleDurationReady = useCallback(
    (dur: number) => {
      if (dur > 0) {
        setDuration(dur);
        handleSyncTimeDom(currentTimeRef.current, dur);
      }
    },
    [handleSyncTimeDom]
  );

  const triggerSeek = useCallback(
    (targetTime: number, pauseOnSeek = false, floorMode: 'auto' | 'closed' | 'exploded' = 'auto') => {
      const clamped = Math.max(0, Math.min(duration, targetTime));
      if (pauseOnSeek) {
        setIsPlaying(false);
      }
      setActiveFloorMode(floorMode);
      handleSyncTimeDom(clamped, duration);
      setSeekRequest((prev) => ({ time: clamped, seq: (prev?.seq || 0) + 1 }));
    },
    [duration, handleSyncTimeDom]
  );

  const handleStepTime = (deltaSeconds: number) => {
    const nextTime = ((currentTimeRef.current + deltaSeconds) % duration + duration) % duration;
    triggerSeek(nextTime, false, 'auto');
  };

  const applyCameraPreset = useCallback(
    (presetName: string, position: [number, number, number], target: [number, number, number]) => {
      setActiveCamPresetName(presetName);
      setCameraPreset((prev) => ({
        position,
        target,
        seq: (prev?.seq || 0) + 1,
      }));
    },
    []
  );

  const handleResetCamera = () => {
    applyCameraPreset('general', [20, 14, 20], [0, 2.5, 0]);
  };

  const handleZoomStep = (delta: number) => {
    setZoomStepRequest((prev) => ({ delta, seq: (prev?.seq || 0) + 1 }));
  };

  const toggleFullscreen = async () => {
    const targetEl = containerRef.current || document.documentElement;
    try {
      if (!document.fullscreenElement) {
        await targetEl.requestFullscreen();
        if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  const handleForceLandscapeFullscreen = async () => {
    const targetEl = containerRef.current || document.documentElement;
    try {
      if (!document.fullscreenElement) {
        await targetEl.requestFullscreen();
      }
      if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
        await (screen.orientation as any).lock('landscape');
      }
    } catch {
      // Si el navegador requiere giro físico manual del dispositivo, el overlay permanece activo hasta que gire
    }
  };

  const togglePlaybackSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 0.5 : prev === 0.5 ? 1.5 : 1));
  };

  return (
    <div
      ref={containerRef}
      style={
        fullViewport
          ? undefined
          : {
              borderColor: `${accentColor}45`,
              boxShadow: isMobileDevice
                ? '0 16px 40px rgba(0,0,0,0.85)'
                : `0 25px 80px rgba(0,0,0,0.92), 0 0 45px ${accentColor}18`,
            }
      }
      className={`relative w-full overflow-hidden bg-gradient-to-b from-[#0A0D12] via-[#07090C] to-[#050608] select-none ${
        fullViewport || isFullscreen
          ? 'fixed inset-0 z-50 h-[100dvh] w-screen rounded-none border-0'
          : 'rounded-2xl sm:rounded-3xl border h-[520px] sm:h-[640px] lg:h-[720px]'
      } ${className}`}
    >
      {/* =========================================================================
          BLOQUEO OBLIGATORIO DE ORIENTACIÓN HORIZONTAL EN DISPOSITIVOS MÓVILES
          ========================================================================= */}
      {isPortraitMobile && (
        <div className="fixed inset-0 z-[100] bg-[#06080B]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(#9CD01A 1px, transparent 1px), linear-gradient(90deg, #9CD01A 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 max-w-sm w-full p-7 rounded-[28px] bg-[#0B0E14] border border-[#9CD01A]/40 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(156,208,26,0.18)] flex flex-col items-center">
            <img
              src="/massa-cube-transparent.png"
              alt="MASSA"
              className="w-12 h-12 object-contain mb-4"
            />

            {/* Ícono animado indicando rotación a horizontal */}
            <div className="relative w-20 h-20 rounded-3xl bg-[#9CD01A]/15 border border-[#9CD01A]/45 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(156,208,26,0.25)]">
              <Smartphone className="w-10 h-10 text-[#9CD01A] animate-[spin_2.6s_ease-in-out_infinite] -rotate-90" />
            </div>

            <span className="massa-metallic-text text-[10px] font-mono font-bold uppercase tracking-[0.24em] mb-2">
              MODO HORIZONTAL REQUERIDO • 3D STUDIO
            </span>

            <h2 className="text-xl font-black text-white uppercase tracking-tight leading-snug mb-2.5">
              Gira tu Dispositivo Horizontalmente
            </h2>

            <p className="text-xs text-white/70 leading-relaxed mb-6">
              Para interactuar con la volumetría 3D y la vista explosiva por niveles de{' '}
              <strong className="text-white">{projectName}</strong> con máxima fluidez y espacio en
              pantalla, coloca tu teléfono en posición horizontal.
            </p>

            <button
              type="button"
              onClick={handleForceLandscapeFullscreen}
              className="apple-aqua-bubble-lime w-full py-3.5 px-5 rounded-full text-[#060804] font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mb-3"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Rotar a Horizontal Automáticamente</span>
            </button>

            {onBackToProject && (
              <button
                type="button"
                onClick={onBackToProject}
                className="apple-aqua-bubble w-full py-2.5 px-4 rounded-full text-white/80 text-[11px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la Ficha del Proyecto</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          1. BARRA SUPERIOR FLOTANTE: ESTADO DE PISOS Y MODOS DE APERTURA (1 TOQUE)
          ========================================================================= */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2.5 left-3 right-3 sm:top-4 sm:left-5 sm:right-5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none"
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          {onBackToProject && (
            <button
              type="button"
              onClick={onBackToProject}
              className="apple-aqua-bubble px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-white/90 hover:text-white cursor-pointer"
              title="Volver a la ficha de Ibiza A14"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#9CD01A]" />
              <span className="hidden sm:inline">Ficha Proyecto</span>
            </button>
          )}

          <div className="apple-aqua-bubble-studio px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-white">
            <span
              className="w-2 h-2 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <span className="truncate">{projectName} • VISOR 3D DEDICADO</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 text-[10px] font-mono text-white/80">
            <Layers className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Apertura Niveles:</span>
            <strong ref={explosionPercentRef} className="text-white tabular-nums">
              0%
            </strong>
          </div>
        </div>

        {/* Selector Rápido de Apertura de Pisos + Pantalla Completa */}
        <div className="flex items-center gap-1.5 pointer-events-auto overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => triggerSeek(0, true, 'closed')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all ${
              activeFloorMode === 'closed' && !isPlaying
                ? 'apple-aqua-bubble-lime text-[#060804] font-black'
                : 'apple-aqua-bubble text-white/85 hover:text-white'
            }`}
            title="Cerrar todos los pisos y pausar para ver fachada exterior"
          >
            Cerrado (0%)
          </button>

          <button
            type="button"
            onClick={() => {
              triggerSeek(6.5, true, 'exploded');
              applyCameraPreset('interior', [15, 20, 15], [0, 3.8, 0]);
            }}
            className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all flex items-center gap-1 ${
              activeFloorMode === 'exploded' && !isPlaying
                ? 'apple-aqua-bubble-lime text-[#060804] font-black'
                : 'apple-aqua-bubble-studio text-[#D9FF66]'
            }`}
            title="Elevar Nivel 2 y Cubierta al 100% y enfocar cámara al interior"
          >
            <Eye className="w-3 h-3 shrink-0" />
            <span>Ver Interior (100%)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFloorMode('auto');
              setIsPlaying(true);
            }}
            className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all flex items-center gap-1 ${
              isPlaying
                ? 'apple-aqua-bubble-lime text-[#060804] font-black'
                : 'apple-aqua-bubble text-white/85 hover:text-white'
            }`}
            title="Reanudar ciclo continuo de giro 360° y vista explosiva"
          >
            <Compass className="w-3 h-3 shrink-0" />
            <span>Ciclo 360°</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="apple-aqua-bubble w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/85 hover:text-white cursor-pointer shrink-0"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. PANEL LATERAL FLOTANTE: VISTAS DE CÁMARA & ZOOM (1 TOQUE)
          ========================================================================= */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end gap-1.5 pointer-events-none"
      >
        <div className="pointer-events-auto flex flex-col gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/15 shadow-xl">
          <button
            type="button"
            onClick={() => applyCameraPreset('general', [20, 14, 20], [0, 2.5, 0])}
            className={`px-2.5 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCamPresetName === 'general'
                ? 'bg-[#9CD01A] text-[#060804]'
                : 'text-white/75 hover:text-white hover:bg-white/10'
            }`}
            title="Vista isométrica general"
          >
            Isométrica
          </button>
          <button
            type="button"
            onClick={() => applyCameraPreset('fachada', [0, 7.5, 25], [0, 3, 0])}
            className={`px-2.5 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCamPresetName === 'fachada'
                ? 'bg-[#9CD01A] text-[#060804]'
                : 'text-white/75 hover:text-white hover:bg-white/10'
            }`}
            title="Enfocar fachada principal"
          >
            Fachada
          </button>
          <button
            type="button"
            onClick={() => applyCameraPreset('interior', [14, 22, 14], [0, 3.5, 0])}
            className={`px-2.5 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCamPresetName === 'interior'
                ? 'bg-[#9CD01A] text-[#060804]'
                : 'text-white/75 hover:text-white hover:bg-white/10'
            }`}
            title="Vista elevada para inspeccionar distribución interior"
          >
            Planta 3D
          </button>
          <button
            type="button"
            onClick={() => applyCameraPreset('piscina', [-19, 9.5, -19], [0, 2.5, 0])}
            className={`px-2.5 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCamPresetName === 'piscina'
                ? 'bg-[#9CD01A] text-[#060804]'
                : 'text-white/75 hover:text-white hover:bg-white/10'
            }`}
            title="Enfocar terraza posterior y piscina"
          >
            Piscina
          </button>

          <div className="h-px bg-white/10 my-0.5" />

          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => handleZoomStep(-4.5)}
              className="flex-1 py-1 sm:py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/15 text-white flex items-center justify-center cursor-pointer"
              title="Acercar cámara (Zoom +)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoomStep(4.5)}
              className="flex-1 py-1 sm:py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/15 text-white flex items-center justify-center cursor-pointer"
              title="Alejar cámara (Zoom -)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Guía táctil discreta al primer contacto */}
      {showTouchHint && !isPortraitMobile && (
        <div className="pointer-events-none absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-10">
          <div className="px-3.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/80 flex items-center gap-1.5 shadow-lg">
            <Hand className="w-3 h-3 text-[#9CD01A]" />
            <span>Arrastra para orbitar 360° • Pellizca o usa la rueda para Zoom</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. ESCENA 3D WEBGL (PAUSADA SI EL MÓVIL ESTÁ EN VERTICAL)
          ========================================================================= */}
      <div
        onPointerDown={() => {
          if (showTouchHint) setShowTouchHint(false);
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {!isPortraitMobile && (
          <Canvas
            shadows={!isMobileDevice}
            dpr={isMobileDevice ? [1, 1.35] : [1, 1.85]}
            camera={{ position: [20, 14, 20], fov: 45 }}
            gl={{
              antialias: !isMobileDevice,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false,
            }}
          >
            <color attach="background" args={['#07090C']} />

            <AdaptiveDpr pixelated />
            <AdaptiveEvents />

            {/* Iluminación y Entorno Arquitectónico (Regla 4) */}
            <ambientLight intensity={isMobileDevice ? 0.65 : 0.45} />
            <directionalLight
              position={[18, 28, 16]}
              intensity={1.6}
              castShadow={!isMobileDevice}
              shadow-mapSize={[1536, 1536]}
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
                playbackSpeed={playbackSpeed}
                isMobileDevice={isMobileDevice}
                seekRequest={seekRequest}
                onDurationReady={handleDurationReady}
                onSyncTimeDom={handleSyncTimeDom}
              />
            </Suspense>

            {/* ContactShadows horneado (frames={1}) en y={-0.01} */}
            <ContactShadows
              position={[0, -0.01, 0]}
              frames={1}
              resolution={isMobileDevice ? 256 : 512}
              opacity={0.6}
              scale={52}
              blur={2.2}
              far={20}
            />

            <CameraRigController
              controlsRef={controlsRef}
              cameraPreset={cameraPreset}
              zoomStepRequest={zoomStepRequest}
            />

            <OrbitControls
              ref={controlsRef}
              makeDefault
              target={[0, 2.5, 0]}
              enableDamping
              dampingFactor={0.07}
              rotateSpeed={isMobileDevice ? 0.8 : 0.85}
              zoomSpeed={0.95}
              panSpeed={0.8}
              minDistance={6}
              maxDistance={45}
              maxPolarAngle={Math.PI / 2 - 0.05}
              touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN,
              }}
            />
          </Canvas>
        )}
      </div>

      {/* =========================================================================
          4. CONTROLES FLOTANTES INFERIORES DE ALTA PRECISIÓN TÁCTIL (Regla 3)
          ========================================================================= */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute bottom-2.5 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none"
      >
        <div className="pointer-events-auto flex-1 max-w-4xl mx-auto w-full px-3 py-2 sm:px-5 sm:py-3 rounded-full bg-black/80 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex items-center gap-2 sm:gap-3">
          {/* Botón Pausar / Reanudar */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying((prev) => !prev);
              setActiveFloorMode('auto');
            }}
            className="apple-aqua-bubble-lime px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[#060804] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
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

          {/* Slider interactivo táctil (action.time) sincronizado por Ref */}
          <div className="flex-1 flex flex-col justify-center min-w-[95px]">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/70 mb-0.5 sm:mb-1">
              <span className="truncate">Control de Niveles &amp; Giro 360°</span>
              <span
                ref={timeReadoutRef}
                className="tabular-nums font-bold text-white ml-2 shrink-0"
              >
                0.0s / {duration.toFixed(1)}s
              </span>
            </div>

            <div className="relative w-full h-4 sm:h-5 flex items-center">
              <div className="pointer-events-none absolute inset-x-0 h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  ref={sliderProgressFillRef}
                  className="h-full rounded-full bg-gradient-to-r from-[#7CB010] via-[#9CD01A] to-[#D9FF66]"
                  style={{ width: '0%' }}
                />
              </div>

              <input
                ref={sliderInputRef}
                type="range"
                min={0}
                max={duration}
                step={0.02}
                defaultValue={0}
                onChange={(e) => triggerSeek(parseFloat(e.target.value), true, 'auto')}
                aria-label="Control de tiempo de animación y apertura de niveles"
                className="relative z-10 w-full h-5 appearance-none bg-transparent cursor-pointer accent-[#9CD01A]"
              />
            </div>
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

          {/* Selector de velocidad de animación (0.5x / 1x / 1.5x) */}
          <button
            type="button"
            onClick={togglePlaybackSpeed}
            className="apple-aqua-bubble px-2.5 py-1.5 sm:py-2 rounded-full text-[10px] font-mono font-bold text-[#D9FF66] cursor-pointer shrink-0"
            title="Cambiar velocidad de la animación"
          >
            {playbackSpeed}x
          </button>

          {/* Botón Resetear Cámara */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="apple-aqua-bubble px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-white/90 hover:text-white font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Resetear cámara a la vista original"
          >
            <RotateCcw className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="hidden md:inline">Resetear</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Página dedicada en pestaña independiente (/proyecto/ibiza-a14/3d):
 * Carga exclusivamente el visor 3D sin videos, carruseles ni otros recursos pesados en memoria.
 */
export function IbizaStandalone3DPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'IBIZA A14 • Visor 3D Interactivo | MASSA HOME';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const handleBack = () => {
    if (window.opener || window.history.length <= 1) {
      window.close();
      // Si el navegador no permite cerrar la pestaña por seguridad, redirigir a la ficha del proyecto
      window.location.href = '/proyecto/ibiza-a14';
    } else {
      window.location.href = '/proyecto/ibiza-a14';
    }
  };

  return (
    <main className="w-screen h-[100dvh] bg-[#050608] overflow-hidden select-none">
      <IbizaAnimatedModel3DViewer
        projectName="IBIZA A14"
        accentColor="#9CD01A"
        modelUrl={IBIZA_MODEL_URL}
        fullViewport={true}
        onBackToProject={handleBack}
      />
    </main>
  );
}

export default IbizaAnimatedModel3DViewer;
