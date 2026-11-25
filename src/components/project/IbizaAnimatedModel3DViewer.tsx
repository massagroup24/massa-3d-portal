import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectIdentity, resolveActiveProject3DModel } from '../../config/projectIdentityConfig';
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
  ArrowLeft,
  Sparkles,
  Camera,
  X,
} from 'lucide-react';
import {
  ProjectARModal,
  getARScaleFactor,
  type ARPosePreset,
  type ARScalePreset,
} from './ProjectARModal';

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

// Calcula el porcentaje real de apertura/despliegue (alcanza el 100% estable en el segundo 7.5)
function computeExplosionPercent(time: number, duration: number): number {
  const dur = duration || 15;
  const t = Math.max(0, Math.min(dur, time));
  const peakStart = Math.min(7.5, dur * 0.5);
  const peakEnd = Math.min(dur * 0.62, Math.max(peakStart + 1.0, dur - 5.0));
  if (t <= 0.05) return 0;
  if (t < peakStart) return Math.min(100, Math.round((t / peakStart) * 100));
  if (t <= peakEnd) return 100;
  return Math.round(Math.max(0, (1 - (t - peakEnd) / Math.max(0.1, dur - peakEnd)) * 100));
}

// Rota una posición de cámara base [x, y, z] según el giro acumulado de Rotador_General_Obra en el segundo `time`
function rotateCameraPositionForTime(
  basePosition: [number, number, number],
  time: number,
  duration: number
): [number, number, number] {
  const dur = duration > 0 ? duration : 15;
  const angle = ((time % dur) / dur) * Math.PI * 2;
  const [x0, y0, z0] = basePosition;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    Number((x0 * cos + z0 * sin).toFixed(3)),
    y0,
    Number((-x0 * sin + z0 * cos).toFixed(3)),
  ];
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
  onRegisterARBridge?: (
    prepareFn: (pose: ARPosePreset, scalePreset: ARScalePreset) => Promise<THREE.Object3D | null>
  ) => void;
}

function AnimatedIbizaBuilding({
  modelUrl,
  isPlaying,
  playbackSpeed,
  isMobileDevice,
  seekRequest,
  onDurationReady,
  onSyncTimeDom,
  onRegisterARBridge,
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

  useEffect(() => {
    if (!onRegisterARBridge) return;
    onRegisterARBridge(async (pose: ARPosePreset, scalePreset: ARScalePreset) => {
      const actionList = Object.values(actions).filter(
        (action): action is THREE.AnimationAction => Boolean(action)
      );
      const targetTime = pose === 'exploded_75' ? 7.5 : 0;
      const prevTimeScale = mixer.timeScale;
      mixer.timeScale = 1;
      actionList.forEach((action) => {
        action.paused = false;
        action.time = targetTime;
      });
      mixer.update(0);
      mixer.timeScale = prevTimeScale;

      // Clonar escena con las transformaciones del segundo elegido (0s o 7.5s) y enderezar Rotador_General_Obra
      const clonedScene = scene.clone(true);
      clonedScene.traverse((node) => {
        if (node.name && node.name.includes('Rotador_General_Obra')) {
          node.rotation.set(0, 0, 0);
          node.quaternion.identity();
        }
      });

      const arWrapper = new THREE.Group();
      arWrapper.name = 'AR_Maqueta_Root';
      const factor = getARScaleFactor(scalePreset);
      arWrapper.scale.setScalar(factor);
      arWrapper.add(clonedScene);
      arWrapper.updateMatrixWorld(true);
      return arWrapper;
    });
  }, [onRegisterARBridge, actions, mixer, scene]);

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
  projectSlug?: string;
  accentColor?: string;
  modelUrl?: string;
  className?: string;
  fullViewport?: boolean;
  onBackToProject?: () => void;
}

export function IbizaAnimatedModel3DViewer({
  projectName = 'IBIZA A14',
  projectSlug = 'ibiza-a14',
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
  const [isARModalOpen, setIsARModalOpen] = useState<boolean>(false);
  const [isLiveCameraAR, setIsLiveCameraAR] = useState<boolean>(false);
  const [liveARScale, setLiveARScale] = useState<number>(1);

  const arPrepareBridgeRef = useRef<
    ((pose: ARPosePreset, scalePreset: ARScalePreset) => Promise<THREE.Object3D | null>) | null
  >(null);
  const arVideoRef = useRef<HTMLVideoElement | null>(null);
  const arStreamRef = useRef<MediaStream | null>(null);
  const isGoldTheme = accentColor.toUpperCase() === '#DFC47B';
  const primaryBubbleClass = isGoldTheme ? 'apple-aqua-bubble-gold text-[#060608]' : 'apple-aqua-bubble-lime text-[#060804]';
  const lightAccentHex = isGoldTheme ? '#F1E29B' : '#D9FF66';

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
    (
      presetName: string,
      basePosition: [number, number, number],
      target: [number, number, number],
      atTime?: number
    ) => {
      const effectiveTime = typeof atTime === 'number' ? atTime : currentTimeRef.current;
      const rotatedPos = rotateCameraPositionForTime(basePosition, effectiveTime, duration);
      setActiveCamPresetName(presetName);
      setCameraPreset((prev) => ({
        position: rotatedPos,
        target,
        seq: (prev?.seq || 0) + 1,
      }));
    },
    [duration]
  );

  // Selecciona una vista arquitectónica lateral con lógica de estado (pausa en 7.5s cuando se requiere ver la obra desplegada)
  const handleSelectCameraView = useCallback(
    (
      presetName: 'general' | 'fachada' | 'interior' | 'piscina',
      basePosition: [number, number, number],
      target: [number, number, number]
    ) => {
      if (presetName === 'interior') {
        // Planta 3D / Interior siempre se pausa en el segundo 7.5 donde todos los elementos ya se acomodaron al 100%
        triggerSeek(7.5, true, 'exploded');
        applyCameraPreset('interior', basePosition, target, 7.5);
        return;
      }

      // En Hacienda Club F22 (secuencia constructiva), si está antes de 7.5s o desensamblándose (>10.5s),
      // llevamos la obra al segundo 7.5 para que la fachada, piscina o isometría se vean 100% construidas y acomodadas.
      const cur = currentTimeRef.current;
      if (isGoldTheme && (cur < 7.4 || cur > 10.5)) {
        triggerSeek(7.5, true, 'exploded');
        applyCameraPreset(presetName, basePosition, target, 7.5);
        return;
      }

      // En Ibiza A14, al pedir Fachada o Piscina si está en giro automático, pausamos en el estado actual (o 0s para fachada cerrada)
      if (!isGoldTheme && presetName === 'fachada' && isPlaying) {
        triggerSeek(0, true, 'closed');
        applyCameraPreset('fachada', basePosition, target, 0);
        return;
      }

      setIsPlaying(false);
      applyCameraPreset(presetName, basePosition, target, cur);
    },
    [applyCameraPreset, isGoldTheme, isPlaying, triggerSeek]
  );

  const handleResetCamera = () => {
    triggerSeek(0, false, 'auto');
    setIsPlaying(true);
    applyCameraPreset('general', [20, 14, 20], [0, 2.5, 0], 0);
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

  const togglePlaybackSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 0.5 : prev === 0.5 ? 1.5 : 1));
  };

  const stopLiveCameraAR = useCallback(() => {
    if (arStreamRef.current) {
      arStreamRef.current.getTracks().forEach((t) => t.stop());
      arStreamRef.current = null;
    }
    setIsLiveCameraAR(false);
    setLiveARScale(1);
  }, []);

  const startLiveCameraAR = useCallback(
    async (pose: ARPosePreset, scalePreset: ARScalePreset) => {
      // Ajustar pose de la maqueta (7.5s desplegada o 0s inicial)
      if (pose === 'exploded_75') {
        triggerSeek(7.5, true, 'exploded');
        applyCameraPreset('interior', [18, 16, 18], [0, 2.5, 0], 7.5);
      } else {
        triggerSeek(0, true, 'closed');
        applyCameraPreset('general', [20, 14, 20], [0, 2.5, 0], 0);
      }

      // Escala visual relativa en cámara en vivo para simular maqueta sobre la mesa
      const visualScale =
        scalePreset === 'tabletop_1_50' ? 0.72 : scalePreset === 'salon_1_20' ? 0.9 : 1.15;
      setLiveARScale(visualScale);
      setIsLiveCameraAR(true);

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
          arStreamRef.current = stream;
          if (arVideoRef.current) {
            arVideoRef.current.srcObject = stream;
            await arVideoRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        console.warn('No se pudo acceder a la cámara trasera para AR en vivo:', err);
      }
    },
    [applyCameraPreset, triggerSeek]
  );

  // Si la URL incluye ?ar=1 (por ejemplo al escanear el código QR desde el celular), abrir automáticamente el asistente AR
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('ar') === '1') {
      setIsARModalOpen(true);
    }
    return () => {
      if (arStreamRef.current) {
        arStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

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
          1. BARRA SUPERIOR FLOTANTE: ADAPTADA A SAFE-AREA DE IPHONE 16e (VERTICAL Y HORIZONTAL)
          ========================================================================= */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          top: 'max(10px, env(safe-area-inset-top, 10px))',
          left: 'max(10px, env(safe-area-inset-left, 10px))',
          right: 'max(10px, env(safe-area-inset-right, 10px))',
        }}
        className="absolute z-20 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-1.5 sm:gap-2 pointer-events-none"
      >
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 pointer-events-auto min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {onBackToProject && (
              <button
                type="button"
                onClick={onBackToProject}
                className="apple-aqua-bubble px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-white/90 hover:text-white cursor-pointer shrink-0"
                title={`Volver a la ficha de ${projectName}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Ficha</span>
              </button>
            )}

            <div className="apple-aqua-bubble-studio px-2.5 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-[9.5px] sm:text-xs font-mono font-bold uppercase tracking-wider text-white min-w-0">
              <span
                className="w-2 h-2 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <span className="truncate">{projectName} • 3D</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 text-[10px] font-mono text-white/80 shrink-0">
            <Layers className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Apertura Niveles:</span>
            <strong ref={explosionPercentRef} className="text-white tabular-nums">
              0%
            </strong>
          </div>
        </div>

        {/* Selector Rápido de Apertura de Pisos + AR + Pantalla Completa */}
        <div className="flex items-center gap-1.5 pointer-events-auto overflow-x-auto no-scrollbar max-w-full pb-0.5">
          <button
            type="button"
            onClick={() => {
              triggerSeek(0, true, 'closed');
              applyCameraPreset('general', [20, 14, 20], [0, 2.5, 0], 0);
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all ${
              activeFloorMode === 'closed' && !isPlaying
                ? `${primaryBubbleClass} font-black`
                : 'apple-aqua-bubble text-white/85 hover:text-white'
            }`}
            title="Ir al segundo 0.0s (0%) y enfocar vista general"
          >
            Cerrado (0%)
          </button>

          <button
            type="button"
            onClick={() => {
              triggerSeek(7.5, true, 'exploded');
              applyCameraPreset('interior', [14, 22, 14], [0, 3.5, 0], 7.5);
            }}
            style={
              !(activeFloorMode === 'exploded' && !isPlaying)
                ? { color: lightAccentHex }
                : undefined
            }
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all flex items-center gap-1 ${
              activeFloorMode === 'exploded' && !isPlaying
                ? `${primaryBubbleClass} font-black`
                : 'apple-aqua-bubble-studio'
            }`}
            title="Pausar en el segundo 7.5s (100% acomodado) y enfocar cámara al interior"
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
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all flex items-center gap-1 ${
              isPlaying
                ? `${primaryBubbleClass} font-black`
                : 'apple-aqua-bubble text-white/85 hover:text-white'
            }`}
            title="Reanudar ciclo continuo de giro 360°"
          >
            <Compass className="w-3 h-3 shrink-0" />
            <span>Ciclo 360°</span>
          </button>

          <button
            type="button"
            onClick={() => setIsARModalOpen(true)}
            style={{
              borderColor: `${accentColor}80`,
              color: lightAccentHex,
            }}
            className="apple-aqua-bubble-studio px-2.5 sm:px-3 py-1.5 rounded-full text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all flex items-center gap-1 border"
            title="Proyectar modelo 3D en Realidad Aumentada (AR)"
          >
            <Sparkles className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
            <span className="sm:hidden">AR</span>
            <span className="hidden sm:inline">Realidad Aumentada (AR)</span>
          </button>

          {isLiveCameraAR && (
            <button
              type="button"
              onClick={stopLiveCameraAR}
              className="px-2.5 py-1.5 rounded-full bg-red-500/90 hover:bg-red-500 text-white text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all flex items-center gap-1 shadow-lg"
              title="Salir del modo Cámara AR en Vivo"
            >
              <X className="w-3 h-3 shrink-0" />
              <span>Salir AR</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="apple-aqua-bubble w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/85 hover:text-white cursor-pointer shrink-0 ml-auto sm:ml-0"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. PANEL LATERAL FLOTANTE: VISTAS DE CÁMARA & ZOOM (1 TOQUE)
          ========================================================================= */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          right: 'max(8px, env(safe-area-inset-right, 8px))',
        }}
        className="absolute top-[52%] -translate-y-1/2 z-20 flex flex-col items-end gap-1 pointer-events-none"
      >
        <div className="pointer-events-auto flex flex-col gap-1 p-1 sm:p-1.5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-xl">
          <button
            type="button"
            onClick={() => handleSelectCameraView('general', [20, 14, 20], [0, 2.5, 0])}
            style={
              activeCamPresetName === 'general'
                ? { backgroundColor: accentColor, color: '#060608' }
                : undefined
            }
            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[8.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCamPresetName === 'general'
                ? ''
                : 'text-white/75 hover:text-white hover:bg-white/10'
            }`}
            title="Vista isométrica general"
          >
            Isométrica
          </button>
          <button
            type="button"
            onClick={() => handleSelectCameraView('fachada', [0, 7.5, 25], [0, 3, 0])}
            style={
              activeCamPresetName === 'fachada'
                ? { backgroundColor: accentColor, color: '#060608' }
                : undefined
            }
            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[8.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCamPresetName === 'fachada'
                ? ''
                : 'text-white/75 hover:text-white hover:bg-white/10'
            }`}
            title="Enfocar fachada principal"
          >
            Fachada
          </button>
          <button
            type="button"
            onClick={() => handleSelectCameraView('interior', [14, 22, 14], [0, 3.5, 0])}
            style={
              activeCamPresetName === 'interior'
                ? { backgroundColor: accentColor, color: '#060608' }
                : undefined
            }
            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[8.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCamPresetName === 'interior'
                ? ''
                : 'text-white/75 hover:text-white hover:bg-white/10'
            }`}
            title="Pausar en 7.5s y elevar cámara para inspeccionar distribución interior"
          >
            Planta 3D
          </button>
          <button
            type="button"
            onClick={() => handleSelectCameraView('piscina', [-19, 9.5, -19], [0, 2.5, 0])}
            style={
              activeCamPresetName === 'piscina'
                ? { backgroundColor: accentColor, color: '#060608' }
                : undefined
            }
            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[8.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCamPresetName === 'piscina'
                ? ''
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
      {showTouchHint && (
        <div className="pointer-events-none absolute top-24 sm:top-16 left-1/2 -translate-x-1/2 z-10 w-max max-w-[90vw]">
          <div className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[9px] sm:text-[10px] font-mono text-white/80 flex items-center gap-1.5 shadow-lg">
            <Hand className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
            <span className="truncate">Arrastra para girar 360° • Pellizca para Zoom</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. ESCENA 3D WEBGL + CÁMARA TRASERA EN VIVO PARA MODO REALIDAD AUMENTADA
          (Activa tanto en vertical como en horizontal en iPhone 16e)
          ========================================================================= */}
      <div
        onPointerDown={() => {
          if (showTouchHint) setShowTouchHint(false);
        }}
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
      >
        {isLiveCameraAR && (
          <>
            <video
              ref={arVideoRef}
              autoPlay
              playsInline
              muted
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
            />
            {/* Retícula arquitectónica sutil para ubicar la maqueta sobre la mesa */}
            <div className="pointer-events-none absolute top-24 sm:top-14 left-1/2 -translate-x-1/2 z-10 max-w-[92vw] px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[9px] sm:text-[10px] font-mono text-white/90 flex items-center gap-1.5 shadow-xl">
              <Camera className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
              <span className="truncate">Maqueta AR en Vivo • 1 dedo gira · 2 dedos escalan</span>
            </div>
          </>
        )}

        <Canvas
          shadows={!isMobileDevice}
          dpr={isMobileDevice ? [1, 1.35] : [1, 1.85]}
          camera={{ position: isPortraitMobile ? [26, 18, 26] : [20, 14, 20], fov: isPortraitMobile ? 52 : 45 }}
          gl={{
            alpha: true,
            antialias: !isMobileDevice,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          }}
          className="relative z-[1]"
        >
            {!isLiveCameraAR && <color attach="background" args={['#07090C']} />}

            <AdaptiveDpr pixelated />
            <AdaptiveEvents />

            {/* Iluminación y Entorno Arquitectónico (Regla 4) */}
            <ambientLight intensity={isLiveCameraAR ? 0.85 : isMobileDevice ? 0.65 : 0.45} />
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
              <group scale={liveARScale}>
                <AnimatedIbizaBuilding
                  modelUrl={modelUrl}
                  isPlaying={isPlaying}
                  playbackSpeed={playbackSpeed}
                  isMobileDevice={isMobileDevice}
                  seekRequest={seekRequest}
                  onDurationReady={handleDurationReady}
                  onSyncTimeDom={handleSyncTimeDom}
                  onRegisterARBridge={(fn) => {
                    arPrepareBridgeRef.current = fn;
                  }}
                />
              </group>
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
      </div>

      {/* =========================================================================
          4. CONTROLES FLOTANTES INFERIORES DE ALTA PRECISIÓN TÁCTIL (SAFE-AREA IPHONE 16e)
          ========================================================================= */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          bottom: 'max(10px, env(safe-area-inset-bottom, 10px))',
          left: 'max(10px, env(safe-area-inset-left, 10px))',
          right: 'max(10px, env(safe-area-inset-right, 10px))',
        }}
        className="absolute z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none"
      >
        <div className="pointer-events-auto flex-1 max-w-4xl mx-auto w-full px-2.5 py-2 sm:px-5 sm:py-3 rounded-full bg-black/80 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex items-center gap-1.5 sm:gap-3">
          {/* Botón Pausar / Reanudar */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying((prev) => !prev);
              setActiveFloorMode('auto');
            }}
            className={`${primaryBubbleClass} px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono text-[9.5px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0`}
            title={isPlaying ? 'Pausar animación para inspeccionar interior' : 'Reanudar animación 360°'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Botón Retroceder (-1.5s) — oculto en pantallas muy estrechas para dar espacio al slider */}
          <button
            type="button"
            onClick={() => handleStepTime(-1.5)}
            className="hidden sm:flex apple-aqua-bubble w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center text-white/85 hover:text-white cursor-pointer shrink-0"
            title="Retroceder animación (-1.5s)"
          >
            <Rewind className="w-3.5 h-3.5" />
          </button>

          {/* Slider interactivo táctil (action.time) sincronizado por Ref */}
          <div className="flex-1 flex flex-col justify-center min-w-[80px]">
            <div className="flex items-center justify-between text-[8.5px] sm:text-[10px] font-mono text-white/70 mb-0.5 sm:mb-1">
              <span className="truncate">Niveles &amp; Giro 360°</span>
              <span
                ref={timeReadoutRef}
                className="tabular-nums font-bold text-white ml-1.5 shrink-0"
              >
                0.0s / {duration.toFixed(1)}s
              </span>
            </div>

            <div className="relative w-full h-4 sm:h-5 flex items-center">
              <div className="pointer-events-none absolute inset-x-0 h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  ref={sliderProgressFillRef}
                  className="h-full rounded-full"
                  style={{
                    width: '0%',
                    background: isGoldTheme
                      ? 'linear-gradient(90deg, #9E7D3B 0%, #DFC47B 55%, #F7E8A8 100%)'
                      : 'linear-gradient(90deg, #7CB010 0%, #9CD01A 55%, #D9FF66 100%)',
                  }}
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
                style={{ accentColor }}
                className="relative z-10 w-full h-5 appearance-none bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Botón Adelantar (+1.5s) */}
          <button
            type="button"
            onClick={() => handleStepTime(1.5)}
            className="hidden sm:flex apple-aqua-bubble w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center text-white/85 hover:text-white cursor-pointer shrink-0"
            title="Adelantar animación (+1.5s)"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>

          {/* Selector de velocidad de animación (0.5x / 1x / 1.5x) */}
          <button
            type="button"
            onClick={togglePlaybackSpeed}
            style={{ color: lightAccentHex }}
            className="apple-aqua-bubble px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full text-[9.5px] sm:text-[10px] font-mono font-bold cursor-pointer shrink-0"
            title="Cambiar velocidad de la animación"
          >
            {playbackSpeed}x
          </button>

          {/* Botón Resetear Cámara */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="apple-aqua-bubble px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-white/90 hover:text-white font-mono text-[9.5px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Resetear cámara a la vista original"
          >
            <RotateCcw className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="hidden md:inline">Resetear</span>
          </button>
        </div>
      </div>

      {/* Modal de Realidad Aumentada (iOS AR Quick Look, Android Scene Viewer, Cámara AR en Vivo y Puente QR) */}
      <ProjectARModal
        isOpen={isARModalOpen}
        onClose={() => setIsARModalOpen(false)}
        projectName={projectName}
        projectSlug={projectSlug}
        accentColor={accentColor}
        modelUrl={modelUrl}
        getPreparedARScene={async (pose, scalePreset) => {
          // Si el modelo .glb aún se está descargando en <Suspense> (ej. al entrar en vertical o con ?ar=1),
          // esperamos hasta que AnimatedIbizaBuilding termine de montar y registre el puente AR.
          let attempts = 0;
          while (!arPrepareBridgeRef.current && attempts < 100) {
            await new Promise((r) => setTimeout(r, 150));
            attempts++;
          }
          if (!arPrepareBridgeRef.current) return null;
          return arPrepareBridgeRef.current(pose, scalePreset);
        }}
        onStartLiveCameraAR={startLiveCameraAR}
      />
    </div>
  );
}

/**
 * Página dedicada en pestaña independiente (/proyecto/:id/3d):
 * Carga exclusivamente el visor 3D del proyecto solicitado sin videos, carruseles ni otros recursos pesados en memoria.
 */
export function IbizaStandalone3DPage() {
  const { id } = useParams<{ id: string }>();

  const resolved3D = useMemo(
    () => resolveActiveProject3DModel(id || 'ibiza-a14') || resolveActiveProject3DModel('project_ibiza_a14')!,
    [id]
  );

  const identity = useMemo(() => getProjectIdentity(id || 'ibiza-a14'), [id]);

  useEffect(() => {
    const prevTitle = document.title;
    const isF22 = resolved3D.accentColor.toUpperCase() === '#DFC47B';
    document.title = `${resolved3D.name} • Visor 3D Interactivo | ${isF22 ? 'AMHO CONSTRUCCIONES' : 'MASSA HOME'}`;
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const prevIcon = icon?.getAttribute('href');
    if (icon && identity.clientBrand?.logoIcon) {
      icon.href = encodeURI(identity.clientBrand.logoIcon);
    }
    return () => {
      document.title = prevTitle;
      if (icon && prevIcon != null) icon.setAttribute('href', prevIcon);
    };
  }, [resolved3D.name, resolved3D.accentColor, identity]);

  const handleBack = () => {
    if (window.opener || window.history.length <= 1) {
      window.close();
      // Si el navegador no permite cerrar la pestaña por seguridad, redirigir a la ficha del proyecto
      window.location.href = resolved3D.projectUrl;
    } else {
      window.location.href = resolved3D.projectUrl;
    }
  };

  return (
    <main className="w-screen h-[100dvh] bg-[#050608] overflow-hidden select-none">
      <IbizaAnimatedModel3DViewer
        projectName={resolved3D.name}
        projectSlug={resolved3D.slug}
        accentColor={resolved3D.accentColor}
        modelUrl={resolved3D.modelUrl}
        fullViewport={true}
        onBackToProject={handleBack}
      />
    </main>
  );
}

export default IbizaAnimatedModel3DViewer;
