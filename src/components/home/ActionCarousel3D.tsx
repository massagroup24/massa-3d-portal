import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { ArchitectAction, ARCHITECT_ACTIONS } from '../../config/architectActions';

interface ActionCarousel3DProps {
  onNavigateToProjects: () => void;
  onCreateProject: () => void;
  onNavigateToUsers: () => void;
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export function ActionCarousel3D({
  onNavigateToProjects,
  onCreateProject,
  onNavigateToUsers,
  className = ''
}: ActionCarousel3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Referencias para interacción táctil y arrastre
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Detección de arrastre y swipe
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  // Escuchar preferencia de movimiento reducido
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const totalActions = ARCHITECT_ACTIONS.length;

  // Ejecución de la acción asignada
  const executeAction = useCallback((action: ArchitectAction) => {
    if (!action.enabled) return;

    switch (action.actionKey) {
      case 'projects':
        onNavigateToProjects();
        break;
      case 'new_tour':
        onCreateProject();
        break;
      case 'users':
        onNavigateToUsers();
        break;
      case 'upload_progress':
      default:
        break;
    }
  }, [onNavigateToProjects, onCreateProject, onNavigateToUsers]);

  // Manejo de teclado accesible
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(totalActions - 1, prev + 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const currentAction = ARCHITECT_ACTIONS[activeIndex];
      if (currentAction && currentAction.enabled) {
        executeAction(currentAction);
      }
    }
  }, [activeIndex, totalActions, executeAction]);

  // Efecto de onda (ripple) en la tarjeta central al hacer clic
  const triggerRipple = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const target = e.currentTarget.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const x = clientX - target.left;
    const y = clientY - target.top;
    const newRipple: Ripple = { x, y, id: Date.now() };

    setRipples((prev) => [...prev.slice(-3), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 700);
  };

  // Efecto de brillo verde lima seguidor de cursor (solo escritorio y sin re-renders)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const card = activeCardRef.current;
    if (!card) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--spotlight-x', `${x}px`);
      card.style.setProperty('--spotlight-y', `${y}px`);
    });
  };

  // Eventos de arrastre táctil / mouse (Swipe) sin bloquear scroll vertical
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDraggingRef.current = true;
    isHorizontalSwipeRef.current = null;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartXRef.current = clientX;
    dragStartYRef.current = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStartXRef.current;
    const deltaY = clientY - dragStartYRef.current;

    // Determinar si la intención del usuario es deslizar horizontalmente
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartXRef.current;

    if (isHorizontalSwipeRef.current && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        // Deslizar izquierda -> Siguiente
        setActiveIndex((prev) => Math.min(totalActions - 1, prev + 1));
      } else {
        // Deslizar derecha -> Anterior
        setActiveIndex((prev) => Math.max(0, prev - 1));
      }
    }
    isHorizontalSwipeRef.current = null;
  };

  return (
    <section 
      ref={containerRef}
      role="region" 
      aria-roledescription="carrusel" 
      aria-label="Acciones destacadas del arquitecto"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full py-4 sm:py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9CD01A] rounded-3xl select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Mensaje aria-live para lectores de pantalla */}
      <div className="sr-only" aria-live="polite">
        Acción {activeIndex + 1} de {totalActions}: {ARCHITECT_ACTIONS[activeIndex]?.title}
      </div>

      {/* Contenedor con Perspectiva 3D */}
      <div 
        className="relative w-full h-[320px] sm:h-[350px] md:h-[370px] flex items-center justify-center overflow-visible"
        style={{ perspective: prefersReducedMotion ? 'none' : '1200px' }}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {ARCHITECT_ACTIONS.map((action, index) => {
          const diff = index - activeIndex;
          const isActive = diff === 0;
          const Icon = action.icon;

          // Cálculo 3D por offset
          let transformStyle = '';
          let zIndex = 20 - Math.abs(diff);
          let opacity = 1;

          if (prefersReducedMotion) {
            // Modo movimiento reducido: sin rotación 3D, solo desplazamiento 2D
            const offsetPercent = diff * 70;
            transformStyle = `translateX(${offsetPercent}%) scale(${isActive ? 1 : 0.88})`;
            opacity = isActive ? 1 : Math.abs(diff) === 1 ? 0.45 : 0;
          } else {
            // Modo Coverflow 3D
            if (isActive) {
              transformStyle = 'translateX(0%) translateZ(0px) rotateY(0deg) scale(1)';
              zIndex = 30;
              opacity = 1;
            } else if (diff < 0) {
              // Tarjetas a la izquierda (rotadas hacia adentro +26°)
              const translateX = diff === -1 ? 'calc(-60% - 15px)' : 'calc(-110% - 20px)';
              const translateZ = diff === -1 ? '-130px' : '-220px';
              transformStyle = `translateX(${translateX}) translateZ(${translateZ}) rotateY(26deg) scale(0.85)`;
              opacity = diff === -1 ? 0.55 : 0.15;
            } else {
              // Tarjetas a la derecha (rotadas hacia adentro -26°)
              const translateX = diff === 1 ? 'calc(60% + 15px)' : 'calc(110% + 20px)';
              const translateZ = diff === 1 ? '-130px' : '-220px';
              transformStyle = `translateX(${translateX}) translateZ(${translateZ}) rotateY(-26deg) scale(0.85)`;
              opacity = diff === 1 ? 0.55 : 0.15;
            }
          }

          // Solo renderizamos con opacidad visible para ahorrar rendimiento
          const isVisible = Math.abs(diff) <= 2;

          return (
            <div
              key={action.id}
              ref={isActive ? activeCardRef : undefined}
              onPointerMove={isActive ? handlePointerMove : undefined}
              onClick={(e) => {
                if (!isActive) {
                  // Clic en lateral la lleva al centro
                  setActiveIndex(index);
                } else if (action.enabled) {
                  // Clic en central ejecuta acción y genera ripple
                  triggerRipple(e);
                  executeAction(action);
                }
              }}
              style={{
                transform: transformStyle,
                zIndex,
                opacity: isVisible ? opacity : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity'
              }}
              className={`
                absolute w-[72vw] max-w-[300px] sm:w-[310px] md:w-[320px] aspect-square
                rounded-3xl sm:rounded-4xl p-6 sm:p-7
                flex flex-col justify-between
                transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                cursor-pointer
                ${isActive 
                  ? 'bg-gradient-to-br from-[#171717]/95 via-[#131315]/90 to-[#0D0D0E]/98 border border-[#9CD01A]/60 backdrop-blur-xl shadow-[0_0_35px_rgba(156,208,26,0.22),0_25px_60px_rgba(0,0,0,0.85)]' 
                  : 'bg-[#141416]/90 border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.7)] hover:border-white/20'
                }
                ${!action.enabled && isActive ? 'opacity-85' : ''}
              `}
            >
              {/* Resplandor Spotlight Seguidor de Cursor (Solo Tarjeta Activa) */}
              {isActive && (
                <div 
                  className="pointer-events-none absolute inset-0 rounded-3xl sm:rounded-4xl transition-opacity duration-300 opacity-80"
                  style={{
                    background: 'radial-gradient(280px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(156, 208, 26, 0.12), transparent 70%)'
                  }}
                />
              )}

              {/* Efecto de Onda (Ripple) al hacer clic */}
              {isActive && ripples.map((r) => (
                <span
                  key={r.id}
                  className="pointer-events-none absolute rounded-full bg-[#9CD01A]/30 animate-ping"
                  style={{
                    left: r.x - 30,
                    top: r.y - 30,
                    width: 60,
                    height: 60,
                    animationDuration: '650ms'
                  }}
                />
              ))}

              {/* PARTE SUPERIOR: Ícono Levitante y Badge */}
              <div className="relative z-10 flex items-start justify-between">
                <div 
                  className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-transform
                    ${isActive 
                      ? 'bg-[#9CD01A] text-[#0D0D0E] shadow-[0_0_25px_rgba(156,208,26,0.5)] animate-levitate' 
                      : 'bg-white/[0.06] border border-white/10 text-white/60'
                    }
                  `}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
                </div>

                {/* Badge de Próximamente o estado */}
                {action.badge ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold bg-white/10 border border-white/15 text-white/50 uppercase">
                    {action.badge}
                  </span>
                ) : isActive ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold bg-[#9CD01A]/15 text-[#9CD01A] border border-[#9CD01A]/30 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A] animate-pulse" />
                    <span>ACTIVO</span>
                  </span>
                ) : null}
              </div>

              {/* PARTE MEDIA: Títulos en tipografía Inter / Monumental */}
              <div className="relative z-10 my-auto pt-2">
                <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight transition-colors leading-tight ${
                  isActive ? 'text-white' : 'text-white/70'
                }`}>
                  {action.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/50 font-light mt-1 truncate">
                  {action.subtitle}
                </p>
              </div>

              {/* PARTE INFERIOR: Botón de Acción o Indicador */}
              <div className="relative z-10 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                {isActive ? (
                  action.enabled ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerRipple(e);
                        executeAction(action);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#9CD01A] hover:bg-[#ABDE24] text-[#0D0D0E] font-extrabold text-xs shadow-[0_0_20px_rgba(156,208,26,0.35)] transition-all cursor-pointer hover:scale-103 active:scale-97"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-white/40">
                      En desarrollo
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Tocar para enfocar
                  </span>
                )}

                {/* Micro indicador de tarjeta */}
                <span className="text-[10px] font-mono text-white/30">
                  0{index + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Puntos de Paginación Accesibles */}
      <div 
        role="tablist" 
        aria-label="Navegación del carrusel de acciones"
        className="flex items-center justify-center gap-2 mt-4 sm:mt-5"
      >
        {ARCHITECT_ACTIONS.map((action, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={action.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Ir a tarjeta ${i + 1}: ${action.title}`}
              onClick={() => setActiveIndex(i)}
              className={`
                h-2 rounded-full transition-all duration-300 cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9CD01A]
                ${isActive 
                  ? 'w-7 bg-[#9CD01A] shadow-[0_0_12px_#9CD01A]' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
                }
              `}
            />
          );
        })}
      </div>
    </section>
  );
}
