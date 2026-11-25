import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import {
  Box,
  Camera,
  Check,
  Copy,
  Eye,
  Layers,
  Loader2,
  QrCode,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';

export type ARScalePreset = 'tabletop_1_50' | 'salon_1_20' | 'real_1_1';
export type ARPosePreset = 'exploded_75' | 'closed_0';

export interface ProjectARModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectSlug: string;
  accentColor: string;
  modelUrl: string;
  /** Escena Three.js ya cargada en el visor 3D para exportar a USDZ en el estado/escala exactos */
  getPreparedARScene?: (pose: ARPosePreset, scalePreset: ARScalePreset) => Promise<THREE.Object3D | null>;
  /** Activa el modo Cámara AR en Vivo directamente sobre el lienzo 3D */
  onStartLiveCameraAR?: (pose: ARPosePreset, scalePreset: ARScalePreset) => void;
}

const SCALE_OPTIONS: {
  id: ARScalePreset;
  label: string;
  badge: string;
  factor: number;
  description: string;
}[] = [
  {
    id: 'tabletop_1_50',
    label: 'Maqueta de Mesa',
    badge: 'Escala 1:50 (~65 cm)',
    factor: 0.02,
    description: 'Ideal para proyectar sobre escritorio, comedor o mesa de juntas.',
  },
  {
    id: 'salon_1_20',
    label: 'Maqueta Gran Formato',
    badge: 'Escala 1:20 (~1.6 m)',
    factor: 0.05,
    description: 'Para colocar sobre el piso de una sala o terraza y apreciar detalles.',
  },
  {
    id: 'real_1_1',
    label: 'Escala Real 1:1',
    badge: 'Tamaño Real (1:1)',
    factor: 1.0,
    description: 'Para visualizar la volumetría real directamente en el lote o exterior abierto.',
  },
];

export function getARScaleFactor(preset: ARScalePreset): number {
  return SCALE_OPTIONS.find((o) => o.id === preset)?.factor ?? 0.02;
}

export function ProjectARModal({
  isOpen,
  onClose,
  projectName,
  projectSlug,
  accentColor = '#9CD01A',
  modelUrl,
  getPreparedARScene,
  onStartLiveCameraAR,
}: ProjectARModalProps) {
  const [scalePreset, setScalePreset] = useState<ARScalePreset>('tabletop_1_50');
  const [posePreset, setPosePreset] = useState<ARPosePreset>('exploded_75');
  const [isExportingUsdz, setIsExportingUsdz] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [customHost, setCustomHost] = useState<string>('');

  const isGoldTheme = accentColor.toUpperCase() === '#DFC47B';
  const brandLabel = isGoldTheme ? 'AMHO CONSTRUCCIONES' : 'MASSA HOME';
  const primaryBubbleClass = isGoldTheme
    ? 'apple-aqua-bubble-gold text-[#060608]'
    : 'apple-aqua-bubble-lime text-[#060804]';
  const metallicTextClass = isGoldTheme ? 'gold-metallic-text' : 'massa-metallic-text';

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

  const buildShareArUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const origin =
      isLocalhost && customHost.trim()
        ? `${window.location.protocol}//${customHost.trim().replace(/^https?:\/\//, '')}`
        : window.location.origin;
    const cleanSlug = encodeURIComponent(projectSlug || 'ibiza-a14');
    return `${origin}/proyecto/${cleanSlug}/3d?ar=1&pose=${posePreset}&scale=${scalePreset}`;
  }, [isLocalhost, customHost, projectSlug, posePreset, scalePreset]);

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

  // Lanza Apple AR Quick Look en iPhone / iPad exportando la escena actual a USDZ en memoria
  const handleLaunchIOSQuickLook = async () => {
    if (!getPreparedARScene) {
      setExportError('Abre primero el visor 3D para preparar la geometría AR.');
      return;
    }
    setIsExportingUsdz(true);
    setExportError(null);
    try {
      const preparedRoot = await getPreparedARScene(posePreset, scalePreset);
      if (!preparedRoot) {
        throw new Error('No se pudo preparar la escena 3D para AR.');
      }

      const exporter = new USDZExporter();
      const arraybuffer = await exporter.parseAsync(preparedRoot, {
        quickLookCompatible: true,
        maxTextureSize: 1024,
        ar: {
          anchoring: { type: 'plane' },
          planeAnchoring: { alignment: 'horizontal' },
        },
      } as any);

      const blob = new Blob([arraybuffer as unknown as BlobPart], { type: 'model/vnd.usdz+zip' });
      const blobUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.setAttribute('rel', 'ar');
      anchor.setAttribute(
        'download',
        `${projectName.toLowerCase().replace(/\s+/g, '-')}-maqueta.usdz`
      );
      anchor.href = blobUrl;

      // Apple Safari requiere un elemento <img> dentro del <a rel="ar"> para disparar AR Quick Look directo
      const img = document.createElement('img');
      anchor.appendChild(img);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err: any) {
      console.error('Error exportando USDZ para AR Quick Look:', err);
      setExportError(
        'Tu navegador bloqueó AR Quick Look o la conversión USDZ. Usa el botón "Cámara AR en Vivo" abajo.'
      );
    } finally {
      setIsExportingUsdz(false);
    }
  };

  // Lanza Google Scene Viewer nativo en Android
  const handleLaunchAndroidSceneViewer = () => {
    if (typeof window === 'undefined') return;
    const absoluteGlbUrl = new URL(encodeURI(modelUrl), window.location.origin).href;
    const title = encodeURIComponent(`${projectName} • ${brandLabel}`);
    const fallback = encodeURIComponent(window.location.href);
    const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
      absoluteGlbUrl
    )}&mode=ar_preferred&title=${title}#Intent;scheme=https;package=com.google.android.gms;action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end;`;
    window.location.href = intentUrl;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Realidad Aumentada • ${projectName}`}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-3 sm:p-6 overflow-y-auto"
    >
      <div
        style={{
          borderColor: `${accentColor}55`,
          boxShadow: `0 30px 100px rgba(0,0,0,0.95), 0 0 60px ${accentColor}24`,
        }}
        className="relative w-full max-w-3xl rounded-3xl border bg-[#080A0F]/95 p-5 sm:p-8 text-left text-white my-auto"
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana de Realidad Aumentada"
          className="apple-aqua-bubble absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
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
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className={`${metallicTextClass} text-[10px] font-mono font-bold uppercase tracking-[0.22em]`}>
              EXPERIENCIA ARQUITECTÓNICA EN REALIDAD AUMENTADA • {brandLabel}
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Proyecta <span className={metallicTextClass}>{projectName}</span> en tu Espacio
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-white/70 leading-relaxed">
            Coloca la maqueta 3D sobre tu mesa o escritorio, recórrela en 360° con tu teléfono y explora la distribución interior sin instalar aplicaciones.
          </p>
        </div>

        {/* Selectores de Configuración AR (Estado de la Obra + Escala) */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Estado de la maqueta */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white/60 mb-2.5">
              <Layers className="w-3.5 h-3.5" style={{ color: accentColor }} />
              1. Estado del Modelo 3D
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPosePreset('exploded_75')}
                style={
                  posePreset === 'exploded_75'
                    ? { borderColor: accentColor, backgroundColor: `${accentColor}1F` }
                    : undefined
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  posePreset === 'exploded_75'
                    ? 'text-white shadow-lg'
                    : 'border-white/10 bg-black/40 text-white/65 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase">
                  <Eye className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <span>100% Desplegado</span>
                </div>
                <span className="mt-1 block text-[10px] text-white/55 leading-snug">
                  Pausado en 7.5s con todas las etapas/niveles acomodados.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPosePreset('closed_0')}
                style={
                  posePreset === 'closed_0'
                    ? { borderColor: accentColor, backgroundColor: `${accentColor}1F` }
                    : undefined
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  posePreset === 'closed_0'
                    ? 'text-white shadow-lg'
                    : 'border-white/10 bg-black/40 text-white/65 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase">
                  <Box className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <span>Estado Inicial (0s)</span>
                </div>
                <span className="mt-1 block text-[10px] text-white/55 leading-snug">
                  Volumetría en el segundo 0.0s del modelo.
                </span>
              </button>
            </div>
          </div>

          {/* 2. Escala física */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white/60 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
              2. Escala de Proyección
            </span>

            <div className="flex flex-col gap-1.5">
              {SCALE_OPTIONS.map((opt) => {
                const active = scalePreset === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setScalePreset(opt.id)}
                    style={
                      active
                        ? { borderColor: accentColor, backgroundColor: `${accentColor}1F` }
                        : undefined
                    }
                    className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      active
                        ? 'text-white'
                        : 'border-white/10 bg-black/40 text-white/65 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="block text-[11px] font-mono font-bold uppercase">
                        {opt.label}
                      </span>
                      <span className="block text-[10px] text-white/50">{opt.description}</span>
                    </div>
                    <span
                      style={{ color: accentColor }}
                      className="text-[10px] font-mono font-bold shrink-0"
                    >
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bloque de Lanzamiento AR en Móvil + Cámara AR en Vivo */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-black/50 p-4 sm:p-5 flex flex-col justify-between gap-4">
            <div>
              <span
                style={{ color: accentColor }}
                className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] block mb-1"
              >
                {isMobile ? 'DISPOSITIVO MÓVIL DETECTADO' : 'MODOS INTERACTIVOS DISPONIBLES'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Lanzar Maqueta en Realidad Aumentada
              </h3>
              <p className="mt-1 text-xs text-white/65 leading-relaxed">
                Puedes usar la <strong>Cámara AR en Vivo</strong> directamente dentro de este visor (con control táctil de pisos y giro en tiempo real sobre tu mesa), o abrir el visor AR nativo de tu teléfono.
              </p>
            </div>

            {exportError && (
              <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
                {exportError}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {/* Opción 1: Cámara AR en Vivo integrada (funciona en el 100% de dispositivos con cámara y conserva las etapas/controles) */}
              {onStartLiveCameraAR && (
                <button
                  type="button"
                  onClick={() => {
                    onStartLiveCameraAR(posePreset, scalePreset);
                    onClose();
                  }}
                  className={`${primaryBubbleClass} w-full py-3.5 px-5 rounded-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-xl`}
                >
                  <Camera className="w-4 h-4 shrink-0" />
                  <span>Activar Cámara AR en Vivo (Maqueta Interactiva)</span>
                </button>
              )}

              {/* Opción 2: Visor Nativo iOS (AR Quick Look USDZ) */}
              {(isIOS || !isAndroid) && getPreparedARScene && (
                <button
                  type="button"
                  disabled={isExportingUsdz}
                  onClick={handleLaunchIOSQuickLook}
                  className="apple-aqua-bubble w-full py-3 px-4 rounded-2xl font-mono text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isExportingUsdz ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
                      <span>Generando Maqueta USDZ para Apple AR...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                      <span>
                        {isIOS
                          ? 'Abrir en Apple AR Quick Look (iPhone / iPad)'
                          : 'Exportar / Abrir Apple AR Quick Look (.USDZ)'}
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Opción 3: Visor Nativo Android (Google Scene Viewer) */}
              {isAndroid && (
                <button
                  type="button"
                  onClick={handleLaunchAndroidSceneViewer}
                  className="apple-aqua-bubble w-full py-3 px-4 rounded-2xl font-mono text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                  <span>Abrir en Google AR Nativo (Scene Viewer)</span>
                </button>
              )}
            </div>
          </div>

          {/* Puente Código QR para escanear desde el celular si está en PC */}
          <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-white/[0.03] p-4 flex flex-col items-center justify-between text-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white/75">
              <QrCode className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>Escanea con tu Celular</span>
            </div>

            {qrImageUrl && (
              <div className="p-2.5 rounded-2xl bg-white shadow-xl">
                <img
                  src={qrImageUrl}
                  alt={`Código QR Realidad Aumentada ${projectName}`}
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                />
              </div>
            )}

            {isLocalhost && (
              <div className="w-full text-left">
                <label className="block text-[9px] font-mono uppercase tracking-wider text-white/50 mb-1">
                  IP Wi-Fi local (opcional en pruebas locales):
                </label>
                <input
                  type="text"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  placeholder="Ej: 192.168.1.15:5173"
                  className="w-full rounded-lg border border-white/15 bg-black/60 px-2.5 py-1.5 text-[11px] font-mono text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="apple-aqua-bubble w-full py-2 px-3 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider text-white/90 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span>Enlace AR Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span>Copiar Enlace AR Móvil</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
