import { useState, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import {
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Layers,
  Loader2,
  Maximize2,
  QrCode,
  Ruler,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';

export type ARScalePreset = 'desk_1_75' | 'tabletop_1_50' | 'salon_1_20' | 'real_1_1';
export type ARPosePreset =
  | 'exploded_75'
  | 'closed_0'
  | 'mid_45'
  | 'semi_22';

export interface ProjectARModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectSlug: string;
  accentColor: string;
  modelUrl: string;
  /** Permite previsualizar en vivo el segundo elegido en el visor 3D mientras el cliente decide */
  onPreviewTimeChange?: (timeSec: number) => void;
  /** Escena Three.js ya cargada en el visor 3D para exportar a USDZ en el segundo/escala exactos */
  getPreparedARScene?: (
    pose: ARPosePreset,
    scalePreset: ARScalePreset,
    exactTimeSec: number
  ) => Promise<THREE.Object3D | null>;
  /** Activa el modo Cámara AR en Vivo directamente sobre el lienzo 3D */
  onStartLiveCameraAR?: (
    pose: ARPosePreset,
    scalePreset: ARScalePreset,
    exactTimeSec: number
  ) => void;
}

interface ScaleOptionInfo {
  id: ARScalePreset;
  label: string;
  dimensionsLabel: string;
  scaleRatioLabel: string;
  whereToPlace: string;
  whatYouWillSee: string;
  factor: number;
  recommended?: boolean;
}

interface PoseOptionInfo {
  id: ARPosePreset;
  timeSec: number;
  title: string;
  subtitle: string;
  whatYouWillSee: string;
  idealFor: string;
  badge: string;
}

const SCALE_OPTIONS: ScaleOptionInfo[] = [
  {
    id: 'desk_1_75',
    label: 'Maqueta Compacta de Escritorio',
    dimensionsLabel: '45 cm × 26 cm aprox.',
    scaleRatioLabel: 'Escala 1:75',
    whereToPlace: 'Escritorio, mesa de centro o mesa auxiliar',
    whatYouWillSee: 'Cabe en el espacio de un portátil. Ideal para espacios reducidos.',
    factor: 0.013,
  },
  {
    id: 'tabletop_1_50',
    label: 'Maqueta de Mesa o Comedor',
    dimensionsLabel: '70 cm × 40 cm aprox.',
    scaleRatioLabel: 'Escala 1:50',
    whereToPlace: 'Mesa de comedor, isla de cocina o sala de juntas',
    whatYouWillSee: 'Tamaño ideal para rodear la casa caminando y acercarse a ver cada ambiente.',
    factor: 0.02,
    recommended: true,
  },
  {
    id: 'salon_1_20',
    label: 'Maqueta Monumental de Piso',
    dimensionsLabel: '1,75 m × 1,00 m aprox.',
    scaleRatioLabel: 'Escala 1:20',
    whereToPlace: 'En el piso libre de una sala grande, terraza o jardín',
    whatYouWillSee: 'Maqueta de gran formato (casi 2 metros) para inspeccionar detalles constructivos.',
    factor: 0.05,
  },
  {
    id: 'real_1_1',
    label: 'Tamaño Real de Construcción (1:1)',
    dimensionsLabel: '20 m × 35 m (Tamaño real)',
    scaleRatioLabel: 'Escala 1:1',
    whereToPlace: 'Únicamente al aire libre en el lote o terreno despejado',
    whatYouWillSee: 'La casa a su escala humana real. No usar dentro de una habitación cerrada.',
    factor: 1.0,
  },
];

export function getARScaleFactor(preset: ARScalePreset): number {
  return SCALE_OPTIONS.find((o) => o.id === preset)?.factor ?? 0.02;
}

export function getARPoseTimeSeconds(pose: ARPosePreset, isF22: boolean): number {
  if (pose === 'exploded_75') return 7.5;
  if (pose === 'mid_45') return isF22 ? 4.5 : 2.2;
  if (pose === 'semi_22') return 2.2;
  return 0;
}

export function ProjectARModal({
  isOpen,
  onClose,
  projectName,
  projectSlug,
  accentColor = '#9CD01A',
  modelUrl,
  onPreviewTimeChange,
  getPreparedARScene,
  onStartLiveCameraAR,
}: ProjectARModalProps) {
  const isGoldTheme = accentColor.toUpperCase() === '#DFC47B';
  const isF22 =
    isGoldTheme ||
    projectSlug.toLowerCase().includes('f22') ||
    projectName.toLowerCase().includes('hacienda');
  const brandLabel = isF22 ? 'AMHO CONSTRUCCIONES' : 'MASSA HOME';
  const primaryBubbleClass = isGoldTheme
    ? 'apple-aqua-bubble-gold text-[#060608]'
    : 'apple-aqua-bubble-lime text-[#060804]';
  const metallicTextClass = isGoldTheme ? 'gold-metallic-text' : 'massa-metallic-text';

  // Opciones de vista específicas y 100% reales según la animación de cada proyecto
  const poseOptions = useMemo<PoseOptionInfo[]>(() => {
    if (isF22) {
      return [
        {
          id: 'exploded_75',
          timeSec: 7.5,
          title: 'Residencia 100% Terminada (Exterior & Piscina)',
          subtitle: 'Las 4 etapas constructivas ensambladas',
          whatYouWillSee:
            'Verás la casa completa con sus 3 pisos, cubierta superior, fachadas, carpintería, acabados y zona de piscina terminados.',
          idealFor: 'Apreciar el diseño arquitectónico final, fachadas y volumetría.',
          badge: 'Obra Completa (100%)',
        },
        {
          id: 'mid_45',
          timeSec: 4.5,
          title: 'Interior Abierto sin Techo (Muros y Distribución)',
          subtitle: 'Estructura y divisiones interiores descubiertas',
          whatYouWillSee:
            'Se retira la cubierta superior para que puedas mirar desde arriba cómo se distribuyen las salas, habitaciones y muros interiores.',
          idealFor: 'Inspeccionar la distribución interior de los pisos desde arriba.',
          badge: 'Vista Interior (Sin Techo)',
        },
        {
          id: 'closed_0',
          timeSec: 0.0,
          title: 'Etapa 1: Implantación, Plazoleta & Piscina',
          subtitle: 'Base del lote, terraza y espejo de agua',
          whatYouWillSee:
            'Muestra únicamente la plataforma del terreno (644 m²), la ubicación de la piscina, terraza y cimentación de primer piso.',
          idealFor: 'Entender cómo se implanta la casa y el área libre sobre el lote.',
          badge: 'Planta Base & Lote',
        },
      ];
    }

    return [
      {
        id: 'closed_0',
        timeSec: 0.0,
        title: 'Casa Cerrada (Fachadas, Aleros & Piscina)',
        subtitle: 'Volumetría exterior en su posición real',
        whatYouWillSee:
          'Los 2 pisos y la cubierta están unidos normalmente. Verás la fachada principal, los aleros bioclimáticos, terraza y piscina.',
        idealFor: 'Ver cómo luce la casa terminada por fuera desde cualquier ángulo.',
        badge: 'Exterior Cerrado',
      },
      {
        id: 'exploded_75',
        timeSec: 7.5,
        title: 'Pisos Separados en el Aire (Ver Interior Piso 1 y 2)',
        subtitle: 'Nivel 2 (+4.5 m) y Cubierta (+9.0 m) elevados',
        whatYouWillSee:
          'El segundo piso y el techo flotan separados hacia arriba para que puedas asomarte y ver por dentro la sala, cocina y las suites.',
        idealFor: 'Explorar todas las habitaciones, camas, baños y sala por dentro.',
        badge: 'Interior Desplegado',
      },
      {
        id: 'semi_22',
        timeSec: 2.2,
        title: 'Apertura Media de Niveles (Vista en Corte)',
        subtitle: 'Elevación intermedia de entrepiso y cubierta',
        whatYouWillSee:
          'Los niveles se abren a media altura, manteniendo la proporción exterior mientras dejan asomar el interior de ambos pisos.',
        idealFor: 'Entender la conexión entre el primer piso social y el segundo nivel.',
        badge: 'Semi-Abierta (50%)',
      },
    ];
  }, [isF22]);

  const [scalePreset, setScalePreset] = useState<ARScalePreset>('tabletop_1_50');
  const [posePreset, setPosePreset] = useState<ARPosePreset>('exploded_75');
  const [isExportingUsdz, setIsExportingUsdz] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [customHost, setCustomHost] = useState<string>('');
  const [usdzCache, setUsdzCache] = useState<Record<string, string>>({});

  const selectedPoseInfo =
    poseOptions.find((p) => p.id === posePreset) || poseOptions[0];
  const selectedScaleInfo =
    SCALE_OPTIONS.find((s) => s.id === scalePreset) || SCALE_OPTIONS[1];

  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const isAndroid =
    typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  const isMobile = isIOS || isAndroid;

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  useEffect(() => {
    if (!isOpen) {
      setExportError(null);
      setIsExportingUsdz(false);
    }
  }, [isOpen]);

  const handleSelectPose = (option: PoseOptionInfo) => {
    setPosePreset(option.id);
    onPreviewTimeChange?.(option.timeSec);
  };

  const buildShareArUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const origin =
      isLocalhost && customHost.trim()
        ? `${window.location.protocol}//${customHost.trim().replace(/^https?:\/\//, '')}`
        : window.location.origin;
    const cleanSlug = encodeURIComponent(projectSlug || 'ibiza-a14');
    return `${origin}/proyecto/${cleanSlug}/3d?ar=1&pose=${selectedPoseInfo.id}&scale=${scalePreset}`;
  }, [isLocalhost, customHost, projectSlug, selectedPoseInfo.id, scalePreset]);

  const arShareUrl = buildShareArUrl();
  const qrImageUrl = arShareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=060608&bgcolor=FFFFFF&data=${encodeURIComponent(
        arShareUrl
      )}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(arShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      // Ignorar si clipboard no está disponible
    }
  };

  // Dispara el enlace nativo <a rel="ar"> en iOS Safari con el Blob URL del USDZ
  const triggerIOSQuickLookAnchor = useCallback(
    (blobUrl: string) => {
      const anchor = document.createElement('a');
      anchor.setAttribute('rel', 'ar');
      anchor.setAttribute(
        'download',
        `${projectName.toLowerCase().replace(/\s+/g, '-')}-maqueta.usdz`
      );
      anchor.href = blobUrl;

      const img = document.createElement('img');
      anchor.appendChild(img);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    },
    [projectName]
  );

  // Lanza Apple AR Quick Look en iPhone / iPad exportando la escena actual a USDZ en memoria
  const handleLaunchIOSQuickLook = async () => {
    const cacheKey = `${projectSlug}_${selectedPoseInfo.id}_${scalePreset}_${selectedPoseInfo.timeSec}`;
    if (usdzCache[cacheKey]) {
      setExportError(null);
      triggerIOSQuickLookAnchor(usdzCache[cacheKey]);
      return;
    }

    if (!getPreparedARScene) {
      setExportError('Abre primero el visor 3D para preparar la geometría AR.');
      return;
    }
    setIsExportingUsdz(true);
    setExportError(null);
    try {
      const preparedRoot = await getPreparedARScene(
        selectedPoseInfo.id,
        scalePreset,
        selectedPoseInfo.timeSec
      );
      if (!preparedRoot) {
        throw new Error('No se pudo preparar la escena 3D para AR.');
      }

      const exporter = new USDZExporter();
      let arraybuffer: Uint8Array;
      try {
        arraybuffer = await exporter.parseAsync(preparedRoot, {
          quickLookCompatible: true,
          maxTextureSize: isIOS ? 512 : 1024,
          ar: {
            anchoring: { type: 'plane' },
            planeAnchoring: { alignment: 'horizontal' },
          },
        } as any);
      } catch (firstErr) {
        console.warn('Reintentando exportación USDZ en modo ligero de texturas (iOS Safari RAM):', firstErr);
        preparedRoot.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh && mesh.material) {
            const cloneMat = (m: THREE.Material) => {
              const c = m.clone() as THREE.MeshStandardMaterial;
              if ('map' in c) c.map = null;
              if ('normalMap' in c) c.normalMap = null;
              if ('roughnessMap' in c) c.roughnessMap = null;
              if ('metalnessMap' in c) c.metalnessMap = null;
              if ('aoMap' in c) c.aoMap = null;
              return c;
            };
            mesh.material = Array.isArray(mesh.material)
              ? mesh.material.map(cloneMat)
              : cloneMat(mesh.material);
          }
        });
        arraybuffer = await exporter.parseAsync(preparedRoot, {
          quickLookCompatible: true,
          maxTextureSize: 256,
          ar: {
            anchoring: { type: 'plane' },
            planeAnchoring: { alignment: 'horizontal' },
          },
        } as any);
      }

      const blob = new Blob([arraybuffer as unknown as BlobPart], {
        type: 'model/vnd.usdz+zip',
      });
      const blobUrl = URL.createObjectURL(blob);
      setUsdzCache((prev) => ({ ...prev, [cacheKey]: blobUrl }));
      triggerIOSQuickLookAnchor(blobUrl);
    } catch (err: any) {
      console.error('Error exportando USDZ para AR Quick Look:', err);
      setExportError(
        'Tu navegador bloqueó AR Quick Look o la conversión USDZ. Usa el botón "Cámara AR en Vivo" abajo.'
      );
    } finally {
      setIsExportingUsdz(false);
    }
  };

  // Lanza Google Scene Viewer nativo en Android usando el modelo AR pre-ensamblado
  const handleLaunchAndroidSceneViewer = () => {
    if (typeof window === 'undefined') return;
    const arGlbUrl = isF22
      ? '/models/hacienda_f22_ar.glb'
      : modelUrl.includes('modelo_animado')
      ? '/models/ibiza_a14_ar.glb'
      : modelUrl || '/models/ibiza_a14_ar.glb';
    const absoluteGlbUrl = new URL(encodeURI(arGlbUrl), window.location.origin).href;
    const title = encodeURIComponent(
      `${projectName} • ${selectedPoseInfo.badge} (${selectedScaleInfo.dimensionsLabel})`
    );
    const fallback = encodeURIComponent(window.location.href);
    const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
      absoluteGlbUrl
    )}&mode=ar_preferred&resizable=true&title=${title}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end;`;
    window.location.href = intentUrl;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Configurador de Realidad Aumentada • ${projectName}`}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
        paddingLeft: 'max(12px, env(safe-area-inset-left, 12px))',
        paddingRight: 'max(12px, env(safe-area-inset-right, 12px))',
      }}
      className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-2xl overflow-y-auto"
    >
      <div
        style={{
          borderColor: `${accentColor}55`,
          boxShadow: `0 30px 100px rgba(0,0,0,0.95), 0 0 60px ${accentColor}24`,
        }}
        className="relative w-full max-w-4xl max-h-[92dvh] overflow-y-auto rounded-2xl sm:rounded-3xl border bg-[#080A0F]/95 p-4 sm:p-7 text-left text-white my-auto"
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana de Realidad Aumentada"
          className="apple-aqua-bubble absolute top-3.5 right-3.5 sm:top-6 sm:right-6 w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="pr-10">
          <div
            style={{
              backgroundColor: `${accentColor}1F`,
              borderColor: `${accentColor}66`,
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-2.5"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className={`${metallicTextClass} text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.2em]`}>
              CONFIGURADOR DE MAQUETA EN REALIDAD AUMENTADA • {brandLabel}
            </span>
          </div>

          <h2 className="text-lg sm:text-3xl font-black uppercase tracking-tight text-white">
            Elige Cómo Verás <span className={metallicTextClass}>{projectName}</span> en tu Espacio
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-white/70 leading-relaxed">
            Selecciona en los pasos <strong>1</strong> y <strong>2</strong> qué vista de la casa y qué tamaño físico deseas cargar antes de abrir tu cámara.
          </p>
        </div>

        {/* PASO 1 Y PASO 2: SELECCIÓN EXPLÍCITA Y DETALLADA */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* PASO 1: ¿QUÉ VISTA DE LA CASA QUIERES PROYECTAR? */}
          <div className="lg:col-span-6 rounded-2xl border border-white/15 bg-white/[0.03] p-3.5 sm:p-4 flex flex-col gap-2.5">
            <div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white/90">
                <Layers className="w-3.5 h-3.5" style={{ color: accentColor }} />
                PASO 1 · ¿QUÉ VISTA DE LA CASA QUIERES VER?
              </span>
              <p className="text-[11px] text-white/55 mt-0.5">
                Elige si quieres ver la casa cerrada por fuera o abierta por dentro:
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {poseOptions.map((opt) => {
                const active = selectedPoseInfo.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectPose(opt)}
                    style={
                      active
                        ? {
                            borderColor: accentColor,
                            backgroundColor: `${accentColor}1C`,
                            boxShadow: `0 0 25px ${accentColor}20`,
                          }
                        : undefined
                    }
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'text-white'
                        : 'border-white/10 bg-black/45 text-white/70 hover:text-white hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                        {active ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                        ) : (
                          <Eye className="w-4 h-4 shrink-0 text-white/40" />
                        )}
                        <span>{opt.title}</span>
                      </div>
                      <span
                        style={{
                          borderColor: `${accentColor}55`,
                          color: accentColor,
                          backgroundColor: `${accentColor}14`,
                        }}
                        className="px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase shrink-0"
                      >
                        {opt.badge}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[11px] text-white/80 leading-relaxed">
                      <strong>Qué verás:</strong> {opt.whatYouWillSee}
                    </p>
                    <p className="mt-1 text-[10px] font-mono text-white/50">
                      Ideal para: {opt.idealFor}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 2: ¿DE QUÉ TAMAÑO FÍSICO APARECERÁ FRENTE A TI? */}
          <div className="lg:col-span-6 rounded-2xl border border-white/15 bg-white/[0.03] p-3.5 sm:p-4 flex flex-col gap-2.5">
            <div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white/90">
                <Ruler className="w-3.5 h-3.5" style={{ color: accentColor }} />
                PASO 2 · ¿QUÉ TAMAÑO TENDRÁ EN TU ESPACIO?
              </span>
              <p className="text-[11px] text-white/55 mt-0.5">
                Selecciona el tamaño en centímetros o metros según dónde estés:
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {SCALE_OPTIONS.map((opt) => {
                const active = scalePreset === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setScalePreset(opt.id)}
                    style={
                      active
                        ? {
                            borderColor: accentColor,
                            backgroundColor: `${accentColor}1C`,
                            boxShadow: `0 0 25px ${accentColor}20`,
                          }
                        : undefined
                    }
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'text-white'
                        : 'border-white/10 bg-black/45 text-white/70 hover:text-white hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {active ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5 shrink-0 text-white/40" />
                        )}
                        <span className="text-xs font-mono font-bold text-white">
                          {opt.label}
                        </span>
                      </div>
                      <span
                        style={{ color: accentColor }}
                        className="text-[10px] font-mono font-black shrink-0"
                      >
                        {opt.dimensionsLabel}
                      </span>
                    </div>

                    <div className="mt-1 pl-5.5 text-[11px] text-white/80 leading-snug">
                      <div>
                        <strong>Dónde colocarla:</strong> {opt.whereToPlace}.
                      </div>
                      <div className="text-[10px] text-white/55 mt-0.5">
                        {opt.whatYouWillSee} ({opt.scaleRatioLabel}).
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PASO 3: RESUMEN DE CONFIRMACIÓN ("LO QUE VAS A CARGAR CON CERTEZA") + BOTONES */}
        <div
          style={{
            borderColor: `${accentColor}66`,
            background: `linear-gradient(135deg, ${accentColor}16 0%, rgba(10,12,18,0.92) 65%)`,
          }}
          className="mt-4 rounded-2xl border p-4 sm:p-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  style={{ backgroundColor: accentColor, color: '#060608' }}
                  className="px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-black uppercase tracking-wider"
                >
                  RESUMEN LISTO PARA CARGAR
                </span>
                <span className="text-[11px] font-mono text-white/75">
                  {projectName} • Maqueta fija 360° (sin giro loco)
                </span>
              </div>

              <p className="text-xs sm:text-sm text-white leading-relaxed">
                Al pulsar el botón cargarás: <strong style={{ color: accentColor }}>{selectedPoseInfo.title}</strong> con un tamaño físico inicial de{' '}
                <strong style={{ color: accentColor }}>{selectedScaleInfo.dimensionsLabel}</strong> ({selectedScaleInfo.scaleRatioLabel}), lista para colocar sobre{' '}
                <strong className="text-white">{selectedScaleInfo.whereToPlace.toLowerCase()}</strong>.
              </p>
              <p className="text-[11px] text-white/60">
                Una vez proyectada en tu cámara, podrás caminar alrededor de ella o usar 2 dedos para ajustarle el tamaño y girarla.
              </p>
            </div>

            {!isMobile && qrImageUrl && (
              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/50 p-2.5 shrink-0">
                <div className="p-1.5 rounded-lg bg-white">
                  <img
                    src={qrImageUrl}
                    alt={`Código QR Realidad Aumentada ${projectName}`}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div className="text-left max-w-[165px]">
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-white">
                    <QrCode className="w-3 h-3" style={{ color: accentColor }} />
                    <span>Escanea en tu Celular</span>
                  </div>
                  <p className="mt-1 text-[10px] text-white/60 leading-snug">
                    Este código QR ya incluye la vista y el tamaño que acabas de elegir.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase hover:underline cursor-pointer"
                    style={{ color: accentColor }}
                  >
                    {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Copiado' : 'Copiar enlace'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {exportError && (
            <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
              {exportError}
            </div>
          )}

          {/* BOTONES DE ACCIÓN (BOTÓN NATIVO DE PRIMERO Y EN VERDE/DORADO CON EL RESUMEN EXACTO) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {isAndroid ? (
              <button
                type="button"
                onClick={handleLaunchAndroidSceneViewer}
                className={`${primaryBubbleClass} sm:col-span-7 w-full py-3.5 px-5 rounded-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-xl`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>
                  Abrir en Google AR Nativo · {selectedPoseInfo.badge} ({selectedScaleInfo.dimensionsLabel})
                </span>
              </button>
            ) : (
              getPreparedARScene && (
                <button
                  type="button"
                  disabled={isExportingUsdz}
                  onClick={handleLaunchIOSQuickLook}
                  className={`${primaryBubbleClass} sm:col-span-7 w-full py-3.5 px-5 rounded-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-xl disabled:opacity-50`}
                >
                  {isExportingUsdz ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>
                        Cargando {selectedPoseInfo.badge} ({selectedScaleInfo.dimensionsLabel})...
                      </span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 shrink-0" />
                      <span>
                        {isIOS ? 'Abrir en Apple AR Quick Look' : 'Abrir en Apple AR (.USDZ)'} ·{' '}
                        {selectedPoseInfo.badge} ({selectedScaleInfo.dimensionsLabel})
                      </span>
                    </>
                  )}
                </button>
              )
            )}

            {onStartLiveCameraAR && (
              <button
                type="button"
                onClick={() => {
                  onStartLiveCameraAR(
                    selectedPoseInfo.id,
                    scalePreset,
                    selectedPoseInfo.timeSec
                  );
                  onClose();
                }}
                className="apple-aqua-bubble sm:col-span-5 w-full py-3.5 px-4 rounded-2xl font-mono text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                <span>Cámara AR en Vivo ({selectedPoseInfo.badge})</span>
              </button>
            )}
          </div>

          {isLocalhost && (
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 pt-2.5 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 shrink-0">
                IP Wi-Fi local para QR en pruebas locales:
              </span>
              <input
                type="text"
                value={customHost}
                onChange={(e) => setCustomHost(e.target.value)}
                placeholder="Ej: 192.168.1.15:5173"
                className="w-full sm:max-w-xs rounded-lg border border-white/15 bg-black/60 px-2.5 py-1 text-[11px] font-mono text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
