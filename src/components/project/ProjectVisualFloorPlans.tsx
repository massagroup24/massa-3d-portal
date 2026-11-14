import { useMemo, useRef, useState } from 'react';
import { Image as ImageIcon, Layers, Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { PROJECT_VISUAL_PLANS, type ProjectVisualPlan } from '../../config/projectVisualPlans';
import { trackClarityEvent } from '../../utils/clarityAnalytics';
import { getOptimizedWebpUrl } from '../../lib/imageOptimization';

interface ProjectVisualFloorPlansProps {
  projectId: string;
  projectName: string;
  levels?: { id: string; name: string }[];
  accentColor?: string;
}

export function ProjectVisualFloorPlans({
  projectId,
  projectName,
  levels = [],
  accentColor = '#9CD01A',
}: ProjectVisualFloorPlansProps) {
  const plans = useMemo<ProjectVisualPlan[]>(() => {
    const configured = PROJECT_VISUAL_PLANS[projectId];
    if (configured?.length) return configured;
    return levels.length
      ? levels.map(level => ({ id: level.id, title: level.name, imageUrl: '' }))
      : [{ id: 'general', title: 'Distribución general', imageUrl: '' }];
  }, [projectId, levels]);
  const [selectedId, setSelectedId] = useState('');
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [modalZoom, setModalZoom] = useState<number>(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const activePlan = plans.find(plan => plan.id === selectedId) || plans[0];
  const hasImage = Boolean(activePlan.imageUrl.trim()) && failedImage !== activePlan.imageUrl;
  const isGold = accentColor.toUpperCase() === '#DFC47B';

  const openModal = () => {
    setModalZoom(1);
    trackClarityEvent(`ampliar_plano_2d_${projectId}_${activePlan.id}`);
    dialog.current?.showModal();
  };

  return (
    <section
      id="planos-2d"
      aria-labelledby="planos-2d-title"
      className="relative mx-auto w-full max-w-7xl scroll-mt-28 sm:scroll-mt-40 px-3 py-10 sm:px-8 sm:py-20"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-9 sm:flex-row sm:items-end px-1 sm:px-0">
        <div>
          <p className="mb-2 sm:mb-3 flex items-center gap-2.5 sm:gap-3 text-[10px] font-medium uppercase tracking-[0.22em] sm:tracking-[0.24em]" style={{ color: accentColor }}>
            <span aria-hidden="true" className="h-px w-6 sm:w-8" style={{ backgroundColor: accentColor }} />
            <span className={isGold ? 'gold-metallic-text' : ''}>El proyecto, desde arriba</span>
          </p>
          <h2 id="planos-2d-title" className="text-2xl font-medium tracking-[-0.04em] text-white sm:text-5xl">
            Planos <span className={isGold ? 'gold-metallic-text' : ''} style={{ color: accentColor }}>2D.</span>
          </h2>
        </div>
        <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-white/60 sm:text-right">
          Descubre cómo se conectan los espacios de cada nivel en una vista clara de su distribución.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-[#0B0B0E] sm:rounded-[24px]" style={{ borderColor: `${accentColor}30` }}>
        {/* Selector de nivel optimizado para móvil (3 columnas iguales en móvil, fila flexible en desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 p-2.5 sm:px-6 sm:py-4">
          <div
            role="group"
            aria-label="Seleccionar piso del plano 2D"
            className={`grid ${plans.length === 2 ? 'grid-cols-2' : plans.length === 1 ? 'grid-cols-1' : 'grid-cols-3'} sm:flex sm:flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto`}
          >
            {plans.map((plan, index) => (
              <button
                key={plan.id}
                type="button"
                aria-pressed={activePlan.id === plan.id}
                aria-controls="plano-2d-preview"
                onClick={() => {
                  setSelectedId(plan.id);
                  setFailedImage(null);
                  trackClarityEvent(`seleccionar_plano_2d_${projectId}_${plan.id}`);
                }}
                className="flex min-h-10 sm:min-h-11 items-center justify-center sm:justify-start gap-1.5 sm:gap-2 rounded-xl px-2 py-2 sm:px-4 text-[11px] sm:text-xs font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 cursor-pointer active:scale-95 whitespace-nowrap"
                style={activePlan.id === plan.id
                  ? { backgroundColor: accentColor, color: '#060608' }
                  : { backgroundColor: '#FFFFFF08', color: '#FFFFFFA6' }}
              >
                <span aria-hidden="true" className="font-mono text-[10px] opacity-65">{String(index + 1).padStart(2, '0')}</span>
                <span className="truncate">{plan.title}</span>
              </button>
            ))}
          </div>
          <span className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/45 shrink-0">
            <Layers aria-hidden="true" className="h-3.5 w-3.5" /> Vista superior
          </span>
        </div>

        <div
          id="plano-2d-preview"
          className={`relative p-1.5 sm:p-6 ${hasImage ? 'bg-[#07080A]' : 'bg-[#EDEBE5]'}`}
          aria-label={`Plano 2D: ${activePlan.title}`}
        >
          {hasImage ? (
            <div className="relative flex flex-col items-center justify-center sm:min-h-[540px]">
              <img
                key={activePlan.imageUrl}
                src={encodeURI(getOptimizedWebpUrl(activePlan.imageUrl))}
                alt={`Plano ilustrado en 2D de ${activePlan.title.toLowerCase()} · ${projectName}`}
                loading="lazy"
                decoding="async"
                onClick={openModal}
                onError={(e) => {
                  const fallback = encodeURI(activePlan.imageUrl);
                  if (e.currentTarget.src !== new URL(fallback, window.location.origin).href) {
                    e.currentTarget.src = fallback;
                  } else {
                    setFailedImage(activePlan.imageUrl);
                  }
                }}
                className="w-full max-h-[760px] object-contain rounded-xl cursor-zoom-in shadow-2xl"
              />
              {/* En desktop flota en la esquina inferior derecha sin tapar la brújula Norte; en móvil se integra debajo de la imagen */}
              <button
                type="button"
                onClick={openModal}
                className="mt-2.5 sm:mt-0 sm:absolute sm:right-3 sm:bottom-3 w-full sm:w-auto flex min-h-10 sm:min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#0B0B0E]/92 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md hover:bg-[#0B0B0E] active:scale-[0.99] transition-all cursor-pointer"
                style={{ borderColor: `${accentColor}45` }}
              >
                <Maximize2 aria-hidden="true" className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
                <span>Ampliar plano y cotas</span>
              </button>
            </div>
          ) : (
            <div className="relative flex min-h-[280px] sm:min-h-[480px] flex-col items-center justify-center border border-dashed border-[#232320]/20 px-4 py-12 sm:px-6 sm:py-16 text-center">
              <div aria-hidden="true" className="mb-5 sm:mb-6 flex h-16 w-14 sm:h-20 sm:w-16 items-center justify-center rounded-sm border border-[#232320]/15 bg-[#F9F8F4] shadow-[4px_5px_0_#23232008]">
                <ImageIcon className="h-6 w-6 sm:h-7 sm:w-7 text-[#77766F]" strokeWidth={1.25} />
              </div>
              <span className="mb-2.5 sm:mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#6D6B63]">{activePlan.title}</span>
              <p className="max-w-xs text-lg sm:text-2xl font-medium tracking-tight text-[#34342F]">
                {failedImage && failedImage === activePlan.imageUrl ? 'El plano no está disponible' : 'Plano ilustrado en preparación'}
              </p>
              <p className="mt-2.5 sm:mt-3 max-w-xs text-xs sm:text-sm leading-relaxed text-[#6D6B63]">
                {failedImage && failedImage === activePlan.imageUrl
                  ? 'Puedes consultar los demás niveles o volver más tarde.'
                  : 'Próximamente podrás explorar los ambientes y su distribución en este nivel.'}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3.5 py-3 sm:px-6 sm:py-4">
          <span className="text-[11px] sm:text-xs text-white/65 truncate">{projectName}</span>
          <span aria-live="polite" className="text-[11px] sm:text-xs font-medium" style={{ color: accentColor }}>
            {activePlan.title} · Plano 2D
          </span>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-label={`Plano 2D ampliado · ${projectName}`}
        onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        className="fixed inset-0 m-auto max-h-[95dvh] w-[calc(100%_-_0.75rem)] sm:w-[calc(100%_-_2rem)] max-w-6xl overflow-hidden rounded-2xl border border-white/15 bg-[#0B0B0E] p-0 text-white backdrop:bg-black/90 shadow-2xl"
      >
        <div className="flex flex-col max-h-[95dvh]">
          {/* Barra superior del visor ampliado con selector de pisos y zoom táctil */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0B0B0E] px-3 py-2.5 sm:px-5 sm:py-3.5">
            <div className="min-w-0">
              <span className="block text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/60 truncate">
                {projectName}
              </span>
              <span className="text-xs sm:text-sm font-bold" style={{ color: accentColor }}>
                {activePlan.title} · Plano 2D
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setModalZoom(z => Math.max(1, Number((z - 0.5).toFixed(2))))}
                disabled={modalZoom <= 1}
                aria-label="Alejar plano"
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 disabled:opacity-35 text-white cursor-pointer"
              >
                <ZoomOut aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setModalZoom(z => (z >= 2.5 ? 1 : Number((z + 0.75).toFixed(2))))}
                aria-label="Acercar plano"
                className="flex h-9 px-2.5 sm:h-10 sm:px-3 items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-[11px] font-mono font-bold text-white cursor-pointer"
              >
                <ZoomIn aria-hidden="true" className="h-3.5 w-3.5" style={{ color: accentColor }} />
                <span>{Math.round(modalZoom * 100)}%</span>
              </button>
              {modalZoom > 1 && (
                <button
                  type="button"
                  onClick={() => setModalZoom(1)}
                  aria-label="Restablecer zoom"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-white cursor-pointer"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="Cerrar plano ampliado"
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Selector rápido de pisos dentro del modal ampliado */}
          <div className={`grid ${plans.length === 2 ? 'grid-cols-2' : plans.length === 1 ? 'grid-cols-1' : 'grid-cols-3'} gap-1.5 border-b border-white/10 bg-[#08080B] px-3 py-2 sm:flex sm:px-5`}>
            {plans.map((plan, index) => (
              <button
                key={`modal-${plan.id}`}
                type="button"
                onClick={() => {
                  setSelectedId(plan.id);
                  setModalZoom(1);
                }}
                className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap sm:px-3.5"
                style={activePlan.id === plan.id
                  ? { backgroundColor: accentColor, color: '#060608' }
                  : { backgroundColor: '#FFFFFF08', color: '#FFFFFFA6' }}
              >
                <span className="font-mono text-[10px] opacity-65">{String(index + 1).padStart(2, '0')}</span>
                <span className="truncate">{plan.title}</span>
              </button>
            ))}
          </div>

          {/* Área de desplazamiento táctil para inspeccionar cotas en móvil */}
          <div className="flex-1 overflow-auto p-2 sm:p-5 bg-[#060709] touch-pan-x touch-pan-y">
            {hasImage && (
              <div
                className="mx-auto flex items-center justify-center transition-all duration-200"
                style={{
                  width: modalZoom > 1 ? `${modalZoom * 100}%` : '100%',
                }}
              >
                <img
                  src={encodeURI(activePlan.imageUrl)}
                  alt={`Plano ampliado de ${activePlan.title.toLowerCase()}`}
                  onClick={() => setModalZoom(z => (z === 1 ? 1.75 : 1))}
                  className={`h-auto w-full max-w-full object-contain rounded-xl select-none ${
                    modalZoom === 1 ? 'max-h-[72dvh] cursor-zoom-in' : 'cursor-zoom-out'
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </dialog>
    </section>
  );
}
