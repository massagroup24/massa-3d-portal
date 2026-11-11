import { useEffect } from 'react';

declare global {
  interface Window {
    clarity?: (action: string, ...args: string[]) => void;
  }
}

export function trackClarityEvent(eventName: string): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    try {
      window.clarity('event', eventName);
    } catch {
      // No-op if blocked by browser extension
    }
  }
}

export function setClarityTag(key: string, value: string | string[]): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    try {
      const normalized = Array.isArray(value) ? value.join(',') : value;
      window.clarity('set', key, normalized);
    } catch {
      // No-op if blocked by browser extension
    }
  }
}

/**
 * Rastrea automáticamente qué secciones de la página fueron vistas por el usuario
 * durante al menos 1.2 segundos para identificar qué bloques tienen mayor o menor uso
 * en Microsoft Clarity.
 */
export function useClaritySectionTracker(pageContext: string, sectionIds: string[]): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    setClarityTag('vista_actual', pageContext);
    const seenSections = new Set<string>();
    const timers = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id || seenSections.has(id)) continue;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            if (!timers.has(id)) {
              const timerId = window.setTimeout(() => {
                seenSections.add(id);
                timers.delete(id);
                trackClarityEvent(`seccion_vista_${pageContext}_${id}`);
                setClarityTag('secciones_vistas', Array.from(seenSections));
                setClarityTag('ultima_seccion_vista', id);
              }, 1200);
              timers.set(id, timerId);
            }
          } else {
            const pending = timers.get(id);
            if (pending !== undefined) {
              window.clearTimeout(pending);
              timers.delete(id);
            }
          }
        }
      },
      { threshold: [0.25] }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
      for (const timerId of timers.values()) {
        window.clearTimeout(timerId);
      }
      timers.clear();
    };
  }, [pageContext, sectionIds.join('|')]);
}

