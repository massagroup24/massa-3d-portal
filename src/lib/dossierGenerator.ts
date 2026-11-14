import { type CanonicalProject, formatAreaMetric } from '../data/canonicalProjects';
import { technicalRowGroups, formatArea, type ProjectTechnicalSpecs } from '../data/haciendaF22Specs';
import { PROJECT_VISUAL_PLANS } from '../config/projectVisualPlans';
import { getOptimizedWebpUrl } from './imageOptimization';

interface DossierOptions {
  project?: CanonicalProject | null;
  technicalSpecs?: ProjectTechnicalSpecs | null;
  projectName?: string;
  accentColor?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Genera y abre el diálogo de impresión / guardado como PDF para el Dossier Técnico del proyecto.
 */
export function downloadProjectDossierPdf({
  project,
  technicalSpecs,
  projectName,
  accentColor = '#9CD01A',
}: DossierOptions): void {
  const title = projectName || project?.nombre || 'Proyecto Arquitectónico';
  const isF22 = project?.id === 'project_hacienda_f22' || accentColor.toUpperCase() === '#DFC47B' || title.toLowerCase().includes('hacienda');
  const brandLabel = isF22 ? 'AMHO CONSTRUCCIONES' : 'MASSA GROUP';
  const brandFooter = isF22
    ? 'AMHO CONSTRUCCIONES • Arquitectura, Ingeniería & Construcción de Autor'
    : 'MASSA GROUP • Arquitectura, Ingeniería & Construcción';
  const typology = technicalSpecs?.typology || (project?.tipo ? project.tipo.charAt(0).toUpperCase() + project.tipo.slice(1) : 'Residencial');
  const location = [project?.ciudad, project?.departamento].filter(Boolean).join(' / ');
  const areaBuilt = technicalSpecs
    ? formatArea(technicalSpecs.areas.totalConstruction)
    : formatAreaMetric(project?.area_construida) || '—';
  const lotArea = technicalSpecs
    ? formatArea(technicalSpecs.areas.lot)
    : formatAreaMetric(project?.area_lote) || '—';

  const groups = technicalSpecs ? technicalRowGroups(technicalSpecs) : [];
  const featuredRenders = (project?.galeria || [])
    .filter((item) => item.url)
    .slice(0, 4);
  const visualPlans = (project?.id ? PROJECT_VISUAL_PLANS[project.id] : undefined)?.filter((p) => p.imageUrl) || [];

  const origin = window.location.origin;
  const resolveUrl = (path: string) => {
    const opt = getOptimizedWebpUrl(path);
    return opt.startsWith('http') ? opt : `${origin}${encodeURI(opt)}`;
  };

  const groupsHtml = groups
    .map(
      (g) => `
      <div class="spec-card">
        <h3>${escapeHtml(g.title)}</h3>
        <table>
          ${g.rows
            .map(
              ([label, value]) => `
            <tr>
              <td class="lbl">${escapeHtml(label)}</td>
              <td class="val">${escapeHtml(value)}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      </div>
    `
    )
    .join('');

  const rendersHtml = featuredRenders.length
    ? `
      <div class="section page-break-avoid">
        <h2>Visualización Arquitectónica</h2>
        <div class="renders-grid">
          ${featuredRenders
            .map(
              (r) => `
            <figure>
              <img src="${resolveUrl(r.url)}" alt="${escapeHtml(r.alt || title)}" />
              <figcaption>${escapeHtml(r.alt || title)}</figcaption>
            </figure>
          `
            )
            .join('')}
        </div>
      </div>
    `
    : '';

  const plansHtml = visualPlans.length
    ? `
      <div class="section page-break-before">
        <h2>Plantas Arquitectónicas</h2>
        <div class="plans-grid ${visualPlans.length === 2 ? 'two-cols' : ''}">
          ${visualPlans
            .map(
              (p) => `
            <figure class="plan-card">
              <img src="${resolveUrl(p.imageUrl)}" alt="${escapeHtml(p.title)}" />
              <figcaption>${escapeHtml(p.title)}</figcaption>
            </figure>
          `
            )
            .join('')}
        </div>
      </div>
    `
    : '';

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Dossier Técnico • ${escapeHtml(title)}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #14161a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      padding: 6mm 8mm;
    }
    .header {
      border-bottom: 2px solid ${accentColor};
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }
    .header > div:first-child {
      min-width: 0;
      flex: 1 1 auto;
    }
    .kicker {
      font-size: 9.5px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #555b66;
      font-weight: 700;
      margin-bottom: 4px;
    }
    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0d0e12;
    }
    .meta {
      text-align: right;
      font-size: 10.5px;
      color: #4b5563;
      line-height: 1.45;
      flex: 0 0 auto;
      max-width: 42%;
    }
    .summary {
      font-size: 12px;
      line-height: 1.6;
      color: #374151;
      margin: 0 0 18px 0;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .kpi {
      border: 1px solid #e5e7eb;
      border-top: 3px solid ${accentColor};
      border-radius: 8px;
      padding: 10px 12px;
      background: #fafafa;
    }
    .kpi span {
      display: block;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .kpi strong {
      font-size: 15px;
      color: #111827;
    }
    .section { margin-top: 18px; }
    h2 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #111827;
      border-left: 3px solid ${accentColor};
      padding-left: 8px;
      margin: 0 0 12px 0;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .spec-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px 12px;
      break-inside: avoid;
    }
    .spec-card h3 {
      margin: 0 0 8px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #111827;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 5px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    td { padding: 4px 0; border-bottom: 1px solid #f3f4f6; }
    tr:last-child td { border-bottom: none; }
    td.lbl { color: #4b5563; }
    td.val { text-align: right; font-weight: 600; color: #111827; font-variant-numeric: tabular-nums; }
    .renders-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    figure { margin: 0; break-inside: avoid; }
    .renders-grid img {
      width: 100%;
      height: 155px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    figcaption {
      margin-top: 4px;
      font-size: 10px;
      color: #4b5563;
    }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .plan-card img {
      width: 100%;
      max-height: 460px;
      object-fit: contain;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      background: #ffffff;
    }
    .footer {
      margin-top: 22px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 9.5px;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
    }
    .page-break-before { page-break-before: always; }
    .page-break-avoid { page-break-inside: avoid; }
  </style>
</head>
<body>
  <header class="header">
    <div>
      <div class="kicker">Dossier Arquitectónico &amp; Ficha Técnica • ${escapeHtml(brandLabel)}</div>
      <h1>${escapeHtml(title)}</h1>
    </div>
    <div class="meta">
      <div><strong>${escapeHtml(typology)}</strong></div>
      ${location ? `<div>${escapeHtml(location)}</div>` : ''}
      ${project?.barrio_o_sector ? `<div>${escapeHtml(project.barrio_o_sector)}</div>` : ''}
    </div>
  </header>

  ${project?.descripcion_larga || project?.descripcion_corta ? `<p class="summary">${escapeHtml(project.descripcion_larga || project.descripcion_corta || '')}</p>` : ''}

  <div class="kpi-grid">
    <div class="kpi"><span>Construcción total</span><strong>${escapeHtml(areaBuilt)}</strong></div>
    <div class="kpi"><span>Superficie del lote</span><strong>${escapeHtml(lotArea)}</strong></div>
    <div class="kpi"><span>Niveles</span><strong>${project?.numero_pisos ? `${project.numero_pisos} niveles` : '—'}</strong></div>
    <div class="kpi"><span>Estado / Alcance</span><strong>${escapeHtml(project?.estado || project?.alcance || '—')}</strong></div>
  </div>

  ${groupsHtml ? `<div class="section"><h2>Cuadro de Áreas y Parámetros Técnicos</h2><div class="specs-grid">${groupsHtml}</div></div>` : ''}

  ${rendersHtml}
  ${plansHtml}

  <footer class="footer">
    <span>${escapeHtml(brandFooter)}</span>
    <span>Documento generado desde el portal oficial • ${new Date().toLocaleDateString('es-CO')}</span>
  </footer>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 2500);
    }
  };

  // Esperar a que carguen las imágenes del dossier antes de lanzar la vista de PDF
  const imgs = Array.from(doc.images);
  if (imgs.length === 0) {
    setTimeout(triggerPrint, 150);
    return;
  }
  let pending = imgs.length;
  let printed = false;
  const done = () => {
    pending -= 1;
    if (pending <= 0 && !printed) {
      printed = true;
      setTimeout(triggerPrint, 120);
    }
  };
  imgs.forEach((img) => {
    if (img.complete) done();
    else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });
  // Respaldo de seguridad si alguna imagen tarda más de 4s
  setTimeout(() => {
    if (!printed) {
      printed = true;
      triggerPrint();
    }
  }, 4000);
}

