import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProjectBrandSignature, ProjectPresentationHero } from '../../src/components/project/ProjectPresentationHero';
import { ProjectFichaTecnica } from '../../src/components/project/ProjectFichaTecnica';
import { CANONICAL_PROJECTS, getCanonicalProjectBySlugOrId } from '../../src/data/canonicalProjects';
import { getProjectIdentity, HACIENDA_F22_RENDERS } from '../../src/config/projectIdentityConfig';
import { technicalRowGroups, HACIENDA_F22_TECHNICAL } from '../../src/data/haciendaF22Specs';
import { buildParallaxColumns } from '../../src/utils/parallaxLayout';

const f22 = CANONICAL_PROJECTS.find(project => project.slug === 'hacienda-f22')!;
const a14 = CANONICAL_PROJECTS.find(project => project.slug === 'ibiza-a14')!;

describe('Presentación independiente de cada proyecto', () => {
  it('reproduce el video oficial F22 y muestra la firma AMHO sin introducir Ibiza ni el catálogo', () => {
    const html = renderToStaticMarkup(<ProjectPresentationHero project={f22} identity={getProjectIdentity(f22.id)} renderCount={33} onOpenTour={() => {}} />);
    expect(html).toContain('project-hero-video-stage');
    expect(html).toContain('<video');
    expect(html).toContain('src="/HACIENDA%20F22/HACIENDA%20CLUB%20F22.mp4"');
    expect(html).toContain('poster="/HACIENDA%20F22/FACHADA.png"');
    expect(html).toContain('autoplay=""');
    expect(html).toContain('muted=""');
    expect(html).toContain('playsinline=""');
    expect(html).toContain('Reproducir video');
    expect(html).toContain('Activar sonido');
    expect(html).toContain('Pantalla completa');
    expect(f22.video).toBe(getProjectIdentity(f22.id).heroVideoUrl);
    expect(existsSync(resolve('public', f22.video!.slice(1)))).toBe(true);
    expect(html).toContain('AMHO CONSTRUCCIONES');
    expect(html).toContain('amho-horizontal-white.png');
    expect(html).toContain('font-family:&#x27;Inter&#x27;');
    expect(html).toContain('project-f22-title');
    expect(html).toContain('aria-label="HACIENDA CLUB F22"');
    expect(html).toContain('>Hacienda</span>');
    expect(html).toContain('>Club <span style="color:#DFC47B">F22</span>');
    expect(html).not.toContain('text-[1.55em]');
    expect(html.match(/<video[^>]*>/)?.[0]).not.toContain('loop=');
    expect(html).not.toContain('id="sello-constructora-amho"');
    expect(html).toContain('Recorrido 360°');
    expect(html).not.toMatch(/Próximamente|Ibiza|A14|Catálogo|MASSA HOME/);
  });

  it('conserva el reel y la identidad de Ibiza sin usar el branding ni el tour de F22', () => {
    const html = renderToStaticMarkup(<ProjectPresentationHero project={a14} identity={getProjectIdentity(a14.id)} renderCount={9} onOpenTour={() => {}} />);
    expect(html).toContain('<video');
    expect(html).toContain('src="/A14.mp4"');
    expect(html.match(/<video[^>]*>/)?.[0]).toContain('loop=""');
    expect(html).toContain('MASSA HOME');
    expect(html).not.toMatch(/AMHO|HACIENDA|Recorrido 360°|592,09/);
  });

  it('conserva la firma AMHO como sección independiente del encabezado visual', () => {
    const html = renderToStaticMarkup(<ProjectBrandSignature project={f22} identity={getProjectIdentity(f22.id)} />);
    expect(html).toContain('id="sello-constructora-amho"');
    expect(html).toContain('amho-vertical-white.png');
    expect(html).toContain('AMHO CONSTRUCCIONES');
    expect(html).not.toMatch(/Ibiza|MASSA HOME/);
  });

  it('activa el video oficial configurado en la identidad sin eliminar su escenario', () => {
    const identity = { ...getProjectIdentity(f22.id), heroVideoUrl: '/f22-oficial.mp4' };
    const html = renderToStaticMarkup(<ProjectPresentationHero project={{ ...f22, video: undefined }} identity={identity} renderCount={33} onOpenTour={() => {}} />);
    expect(html).toContain('src="/f22-oficial.mp4"');
    expect(html).not.toContain('Video · Próximamente');
  });

  it('conserva el espacio reservado cuando un proyecto no tiene video configurado', () => {
    const identity = { ...getProjectIdentity(f22.id), heroVideoUrl: '' };
    const html = renderToStaticMarkup(<ProjectPresentationHero project={{ ...f22, video: undefined }} identity={identity} renderCount={33} onOpenTour={() => {}} />);
    expect(html).toContain('project-hero-video-stage');
    expect(html).toContain('Video · Próximamente');
    expect(html).not.toContain('<video');
  });

  it('mantiene todos los datos documentados en la ficha rediseñada', () => {
    const html = renderToStaticMarkup(<ProjectFichaTecnica project={f22} technicalSpecs={HACIENDA_F22_TECHNICAL} />);
    for (const [label, value] of technicalRowGroups(HACIENDA_F22_TECHNICAL).flatMap(group => group.rows)) {
      expect(html).toContain(label);
      expect(html).toContain(value);
    }
    expect(html).toContain('<details');
    expect(html).toContain('Consultar información complementaria del proyecto');
    expect(html).not.toContain('<details open');
    const ibizaHtml = renderToStaticMarkup(<ProjectFichaTecnica project={a14} />);
    expect(ibizaHtml).not.toMatch(/592,09|644,00|Carga ocupacional|AMHO/);
  });

  it('resuelve nombres visibles además de IDs y slugs sin recurrir a otro proyecto', () => {
    expect(getCanonicalProjectBySlugOrId('HACIENDA F22')).toBe(f22);
    expect(getCanonicalProjectBySlugOrId(' Ibiza A14 ')).toBe(a14);
    expect(getCanonicalProjectBySlugOrId('no-existe')).toBeUndefined();
  });
});

describe('Cobertura del muro parallax durante todo el desplazamiento', () => {
  it.each([320, 390, 768, 1024, 1440, 1920])('no deja vacíos a %ipx y conserva las referencias del lightbox', width => {
    const height = width < 640 ? 650 : 1100;
    const gap = width < 640 ? 10 : 24;
    for (const renders of [HACIENDA_F22_RENDERS, HACIENDA_F22_RENDERS.slice(0, 1), HACIENDA_F22_RENDERS.slice(0, 9)]) {
      const columns = buildParallaxColumns(renders, width, height, gap);
      expect(columns).toHaveLength(width < 640 ? 2 : width < 1024 ? 3 : 4);
      for (const column of columns) {
        expect(column.top + column.travel).toBeLessThanOrEqual(0);
        expect(column.top - column.travel + column.contentHeight).toBeGreaterThanOrEqual(height - 0.001);
        expect(column.items.every(render => renders.includes(render))).toBe(true);
      }
      expect(renders.every(render => columns.some(column => column.items.includes(render)))).toBe(true);
    }
  });
});
