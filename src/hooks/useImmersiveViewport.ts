import { useEffect } from 'react';

// El visor ocupa la ventana de la PWA sin mover el documento situado detrás.
// Al salir se recuperan los estilos y la posición anterior, también en iOS.
export function useImmersiveViewport() {
  useEffect(() => {
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position, top: body.style.top, left: body.style.left,
      width: body.style.width, overflow: body.style.overflow,
      scrollBehavior: document.documentElement.style.scrollBehavior,
    };
    Object.assign(body.style, { position: 'fixed', top: `-${scrollY}px`, left: `-${scrollX}px`, width: '100%', overflow: 'hidden' });
    return () => {
      Object.assign(body.style, { position: previous.position, top: previous.top, left: previous.left, width: previous.width, overflow: previous.overflow });
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(scrollX, scrollY);
      document.documentElement.style.scrollBehavior = previous.scrollBehavior;
    };
  }, []);
}
