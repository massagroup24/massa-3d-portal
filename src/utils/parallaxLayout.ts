import type { ProjectRender } from '../config/projectIdentityConfig';

export function getRenderAspectRatio(render: ProjectRender): number {
  const ratio = render.aspectRatio || (render.width && render.height ? render.width / render.height : 4 / 3);
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 4 / 3;
}

// Cada pista cubre el encuadre incluso en los dos extremos de su desplazamiento.
// Se conservan las proporciones y los IDs originales para abrir el lightbox correcto.
export function buildParallaxColumns(renders: ProjectRender[], width: number, height: number, gap: number) {
  const count = width < 640 ? 2 : width < 1024 ? 3 : 4;
  const columnWidth = Math.max(1, (width - gap * (count + 1)) / count);
  // Desplazamiento de parallax controlado y armónico
  const travel = Math.min(180, Math.round(height * 0.08));

  return Array.from({ length: count }, (_, columnIndex) => {
    const source = renders.filter((_, index) => index % count === columnIndex);
    if (!source.length && renders.length) source.push(renders[columnIndex % renders.length]);
    // Escalonamiento moderado y balanceado para evitar que las tarjetas queden cortadas fuera de vista
    const stagger = [0, 48, 24, 72][columnIndex % 4];
    const minimumHeight = height + travel * 2 + stagger + gap * 2;
    const items = [...source];
    const heightOf = (render: ProjectRender) => columnWidth / getRenderAspectRatio(render) + gap;
    let contentHeight = items.reduce((total, render) => total + heightOf(render), 0) - gap;
    let cursor = 0;
    while (source.length && contentHeight < minimumHeight) {
      const render = source[cursor++ % source.length];
      items.push(render);
      contentHeight += heightOf(render);
    }
    return { items, top: -travel - stagger, travel, contentHeight, columnWidth };
  });
}
