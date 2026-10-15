import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalActions);
  }, [totalActions]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalActions) % totalActions);
  }, [totalActions]);

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
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const currentAction = ARCHITECT_ACTIONS[activeIndex];
      if (currentAction && currentAction.enabled) {
        executeAction(currentAction);
      }
    }
  }, [activeIndex, goToPrev, goToNext, executeAction]);

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

  // Efecto de brillo verde lima seguidor de cursor (solo tarjeta activa en escritorio)
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

  // Eventos de arrastre táctil / mouse (Swipe)
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
        goToNext();
      } else {
        goToPrev();
      }
    }
    isHorizontalSwipeRef.current = null;
  };

  return (
    <section 
      ref={containerRef}
      role="region" 
      aria-roledescription="carrusel 3d" 
      aria-label="Acciones destacadas del portal arquitectónico"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full py-4 sm:py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9CD01A] select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Mensaje accesible para lectores de pantalla */}
      <div className="sr-only" aria-live="polite">
        Acción {activeIndex + 1} de {totalActions}: {ARCHITECT_ACTIONS[activeIndex]?.title}
      </div>

      {/* Flechas de Navegación Flotantes (Visibles en pantallas medianas y grandes) */}
      <button
        type="button"
        onClick={goToPrev}
        aria-label="Tarjeta anterior"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#9CD01A] hover:text-[#0D0D0E] text-white/80 border border-white/15 hover:border-[#9CD01A] backdrop-blur-xl flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group"
      >
        <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        type="button"
        onClick={goToNext}
        aria-label="Tarjeta siguiente"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#9CD01A] hover:text-[#0D0D0E] text-white/80 border border-white/15 hover:border-[#9CD01A] backdrop-blur-xl flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group"
      >
        <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Contenedor con Perspectiva 3D Estilo Skiper49 */}
      <div 
        className="relative w-full h-[400px] sm:h-[450px] md:h-[480px] flex items-center justify-center overflow-visible"
        style={{ perspective: prefersReducedMotion ? 'none' : '1100px' }}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {ARCHITECT_ACTIONS.map((action, index) => {
          // Cálculo de distancia circular para que siempre haya 3 tarjetas activas
          let diff = index - activeIndex;
          if (diff > totalActions / 2) {
            diff -= totalActions;
          } else if (diff < -totalActions / 2) {
            diff += totalActions;
          }

          const isActive = diff === 0;
          const isLeft = diff === -1;
          const isRight = diff === 1;
          const isVisible = Math.abs(diff) <= 1;

          const Icon = action.icon;

          // Cálculo del estilo 3D Coverflow Invertido (Skiper49)
          let transformStyle = '';
          let zIndex = 20;
          let opacity = 1;

          if (prefersReducedMotion) {
            if (isActive) {
              transformStyle = 'translateX(0%) scale(1)';
              zIndex = 30;
              opacity = 1;
            } else if (isLeft) {
              transformStyle = 'translateX(-85%) scale(0.88)';
              zIndex = 10;
              opacity = 0.6;
            } else if (isRight) {
              transformStyle = 'translateX(85%) scale(0.88)';
              zIndex = 10;
              opacity = 0.6;
            } else {
              transformStyle = 'translateX(0%) scale(0.7)';
              zIndex = 0;
              opacity = 0;
            }
          } else {
            // COVERFLOW 3D PERSPECTIVA INVERTIDA (Skiper UI Skiper49):
            // - Tarjeta Central: rotateY(0deg), en primer plano
            // - Tarjeta Izquierda: rotateY(36deg), su borde izquierdo queda adelante y el derecho se hunde
            // - Tarjeta Derecha: rotateY(-36deg), su borde derecho queda adelante y el izquierdo se hunde
            if (isActive) {
              transformStyle = 'translateX(0%) translateZ(0px) rotateY(0deg) scale(1)';
              zIndex = 30;
              opacity = 1;
            } else if (isLeft) {
              // Colocada inmediatamente a la izquierda con rotación 36deg
              transformStyle = 'translateX(calc(-96% - 12px)) translateZ(-70px) rotateY(36deg) scale(0.90)';
              zIndex = 15;
              opacity = 0.82;
            } else if (isRight) {
              // Colocada inmediatamente a la derecha con rotación -36deg
              transformStyle = 'translateX(calc(96% + 12px)) translateZ(-70px) rotateY(-36deg) scale(0.90)';
              zIndex = 15;
              opacity = 0.82;
            } else {
              // Tarjetas restantes se ocultan en el fondo
              transformStyle = 'translateX(0%) translateZ(-250px) rotateY(0deg) scale(0.7)';
              zIndex = 5;
              opacity = 0;
            }
          }

          return (
            <div
              key={action.id}
              ref={isActive ? activeCardRef : undefined}
              onPointerMove={isActive ? handlePointerMove : undefined}
              onClick={(e) => {
                if (!isActive) {
                  // Clic en lateral la enfoca al centro
                  setActiveIndex(index);
                } else if (action.enabled) {
                  // Clic en central ejecuta acción
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
                group absolute 
                w-[76vw] max-w-[310px] sm:w-[330px] md:w-[350px]
                h-[390px] sm:h-[430px] md:h-[460px]
                rounded-[28px] overflow-hidden
                flex flex-col justify-between
                transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]
                cursor-pointer
                ${isActive 
                  ? 'border-2 border-[#9CD01A] shadow-[0_0_40px_rgba(156,208,26,0.35),0_30px_70px_rgba(0,0,0,0.9)] ring-1 ring-[#9CD01A]/30' 
                  : 'border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:border-white/30'
                }
              `}
            >
              {/* IMAGEN DE FONDO VIBRANTE (Fotografía Arquitectónica HD de MASSA) */}
              <img
                src={action.image}
                alt={action.title}
                className={`
                  absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out
                  ${isActive ? 'group-hover:scale-105' : 'filter brightness-90 group-hover:brightness-100'}
                `}
                loading="eager"
              />

              {/* OVERLAYS DE GRADIENTE CINEMATOGRÁFICO */}
              {/* Gradiente Superior: Resalta badges e ícono */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/25 to-transparent h-[45%] pointer-events-none z-10" />

              {/* Gradiente Inferior: Proporciona contraste cristalino para textos y botón */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E]/95 via-[#0D0D0E]/65 via-35% to-transparent pointer-events-none z-10" />

              {/* Sombra de Profundidad 3D en Tarjetas Laterales (Efecto Skiper49 Coverflow) */}
              {!isActive && (
                <div 
                  className={`
                    absolute inset-0 pointer-events-none z-15 transition-opacity duration-500
                    ${isLeft ? 'bg-gradient-to-r from-black/20 via-black/40 to-black/65' : ''}
                    ${isRight ? 'bg-gradient-to-l from-black/20 via-black/40 to-black/65' : ''}
                    group-hover:opacity-40
                  `}
                />
              )}

              {/* Resplandor Spotlight Seguidor de Cursor (Solo Tarjeta Activa) */}
              {isActive && (
                <div 
                  className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 opacity-90"
                  style={{
                    background: 'radial-gradient(320px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(156, 208, 26, 0.18), transparent 70%)'
                  }}
                />
              )}

              {/* Efecto de Onda (Ripple) al hacer clic */}
              {isActive && ripples.map((r) => (
                <span
                  key={r.id}
                  className="pointer-events-none absolute z-30 rounded-full bg-[#9CD01A]/40 animate-ping"
                  style={{
                    left: r.x - 35,
                    top: r.y - 35,
                    width: 70,
                    height: 70,
                    animationDuration: '650ms'
                  }}
                />
              ))}

              {/* PARTE SUPERIOR: Ícono de Glassmorphism & Status Badge */}
              <div className="relative z-20 p-5 sm:p-6 flex items-start justify-between">
                <div 
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-md
                    ${isActive 
                      ? 'bg-[#9CD01A] text-[#0D0D0E] shadow-[0_0_25px_rgba(156,208,26,0.55)] scale-105' 
                      : 'bg-black/50 border border-white/20 text-white/80 group-hover:border-white/40'
                    }
                  `}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                </div>

                <div className="flex items-center gap-2">
                  {/* Badge de Estado */}
                  {action.badge ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold bg-black/60 border border-white/20 text-white/70 uppercase backdrop-blur-md">
                      {action.badge}
                    </span>
                  ) : isActive ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider font-extrabold bg-[#9CD01A]/20 text-[#9CD01A] border border-[#9CD01A]/50 uppercase backdrop-blur-md shadow-[0_0_15px_rgba(156,208,26,0.25)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A] animate-pulse" />
                      <span>ACTIVO</span>
                    </span>
                  ) : null}

                  {/* Número de Tarjeta */}
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-white/60 bg-black/50 border border-white/10 backdrop-blur-md">
                    0{index + 1}
                  </span>
                </div>
              </div>

              {/* PARTE INFERIOR: Títulos, Subtítulos y Botón de Acción */}
              <div className="relative z-20 p-5 sm:p-6 pt-0">
                {/* Overline de Identidad */}
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#9CD01A] uppercase block mb-1">
                  PORTAL MASSA
                </span>

                <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors leading-tight drop-shadow-md ${
                  isActive ? 'text-white' : 'text-white/85'
                }`}>
                  {action.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-white/75 font-medium mt-1 mb-4 line-clamp-1 drop-shadow">
                  {action.subtitle}
                </p>

                {/* Fila de Acción */}
                <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                  {isActive ? (
                    action.enabled ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerRipple(e);
                          executeAction(action);
                        }}
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-[#9CD01A] hover:bg-[#ABDE24] text-[#0D0D0E] font-black text-xs sm:text-sm tracking-wide shadow-[0_0_22px_rgba(156,208,26,0.45)] transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <span>Abrir</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-white/50 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                        En desarrollo
                      </span>
                    )
                  ) : (
                    <div className="flex items-center gap-1.5 text-white/50 group-hover:text-white/80 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono tracking-wider uppercase">
                        Tocar para enfocar
                      </span>
                    </div>
                  )}

                  <span className="text-[11px] font-mono font-bold text-white/40">
                    0{index + 1} / 0{totalActions}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación de Puntos Estilo Skiper UI */}
      <div 
        role="tablist" 
        aria-label="Paginación de tarjetas 3D"
        className="flex items-center justify-center gap-2.5 mt-5 sm:mt-6"
      >
        {ARCHITECT_ACTIONS.map((action, i) => {
          const isCurrent = i === activeIndex;
          return (
            <button
              key={action.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              aria-label={`Ir a tarjeta ${i + 1}: ${action.title}`}
              onClick={() => setActiveIndex(i)}
              className={`
                h-2.5 rounded-full transition-all duration-300 cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9CD01A]
                ${isCurrent 
                  ? 'w-8 bg-[#9CD01A] shadow-[0_0_14px_#9CD01A]' 
                  : 'w-2.5 bg-white/20 hover:bg-white/40'
                }
              `}
            />
          );
        })}
      </div>
    </section>
  );
}
