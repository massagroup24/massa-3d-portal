import { ChevronDown, FileDown } from 'lucide-react';
import { technicalRowGroups, formatArea, type ProjectTechnicalSpecs } from '../../data/haciendaF22Specs';
import { type CanonicalProject, formatAreaMetric } from '../../data/canonicalProjects';
import { downloadProjectDossierPdf } from '../../lib/dossierGenerator';

interface ProjectFichaTecnicaProps {
  project?: CanonicalProject | null;
  technicalSpecs?: ProjectTechnicalSpecs | null;
  accentColor?: string;
  projectName?: string;
}

function SpecificationRows({ rows, accentColor }: { rows: string[][]; accentColor: string }) {
  const isGold = accentColor.toUpperCase() === '#DFC47B';
  return <dl className="divide-y divide-white/[0.07]">
    {rows.map(([label, value]) => {
      const isTotal = label === 'Construcción total' || label === 'Total área primer piso';
      return <div key={label} className={`grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-baseline gap-3 sm:gap-4 py-3 sm:py-3.5 text-xs sm:text-sm ${isTotal ? 'font-semibold' : ''}`}>
        <dt className={isTotal ? 'text-white' : 'text-white/55'}>{label}</dt>
        <dd className={`min-w-0 break-words text-right font-medium tabular-nums ${isTotal && isGold ? 'gold-metallic-text' : ''}`} style={{ color: isTotal ? accentColor : '#F5F2EB' }}>{value}</dd>
      </div>;
    })}
  </dl>;
}

export function ProjectFichaTecnica({ project, technicalSpecs, accentColor = '#DFC47B', projectName }: ProjectFichaTecnicaProps) {
  const isGold = accentColor.toUpperCase() === '#DFC47B';
  const generalRows: string[][] = [
    ...(project?.tipo ? [['Tipología', project.tipo.charAt(0).toUpperCase() + project.tipo.slice(1)]] : []),
    ...(project?.año ? [['Año', String(project.año)]] : []),
    ...(project?.ciudad ? [['Ubicación', [project.ciudad, project.departamento].filter(Boolean).join(' / ')]] : []),
    ...(project?.barrio_o_sector ? [['Sector', project.barrio_o_sector]] : []),
    ...(project?.habitaciones ? [['Habitaciones', `${project.habitaciones} habitaciones`]] : []),
    ...(project?.banos ? [['Baños', `${project.banos} baños`]] : []),
    ...(project?.alcance ? [['Alcance', project.alcance]] : []),
    ...(project?.plazo ? [['Plazo de ejecución', project.plazo]] : []),
    ...(project?.sistema_constructivo ? [['Sistema constructivo', project.sistema_constructivo]] : []),
    ...(project?.cliente ? [['Cliente', project.cliente]] : []),
    ...(project?.telefonos_contacto?.length ? [['Teléfonos de contacto', project.telefonos_contacto.map(p => p.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')).join(' / ')]] : []),
  ];
  const areaBuilt = technicalSpecs ? formatArea(technicalSpecs.areas.totalConstruction) : formatAreaMetric(project?.area_construida);
  const lotArea = technicalSpecs ? formatArea(technicalSpecs.areas.lot) : formatAreaMetric(project?.area_lote);
  const primaryHighlights = [
    ['Construcción total', areaBuilt],
    ['Superficie del lote', lotArea],
    ...(project?.habitaciones && project?.banos ? [['Configuración', `${project.habitaciones} hab. · ${project.banos} baños`]] : []),
    ...(project?.numero_pisos ? [['Distribución vertical', `${project.numero_pisos} ${project.numero_pisos === 1 ? 'nivel' : 'niveles'}`]] : []),
    ...(project?.numero_unidades ? [['Número de unidades', String(project.numero_unidades)]] : []),
  ].filter((row): row is string[] => Boolean(row[1]));
  const fallbackHighlights = [
    ...(project?.tipo ? [['Tipología', project.tipo.charAt(0).toUpperCase() + project.tipo.slice(1)]] : []),
    ...(project?.barrio_o_sector ? [['Sector', project.barrio_o_sector]] : []),
    ...(project?.estado ? [['Estado', project.estado]] : []),
    ...(project?.año ? [['Año', String(project.año)]] : []),
  ].filter((row): row is string[] => Boolean(row[1]));
  const highlights = primaryHighlights.length >= 4
    ? primaryHighlights
    : [
        ...primaryHighlights,
        ...fallbackHighlights.filter(([label]) => !primaryHighlights.some(([pLabel]) => pLabel === label)),
      ].slice(0, 4);
  const [areas, ...regulations] = technicalSpecs ? technicalRowGroups(technicalSpecs) : [];

  return <section aria-label="Ficha técnica del proyecto" className="text-left" style={{ fontFamily: "'Inter', sans-serif", fontVariantNumeric: 'lining-nums tabular-nums' }}>
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-3 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em]" style={{ color: accentColor }}><span className={`h-px w-8 ${isGold ? 'gold-metallic-bg' : ''}`} style={{ backgroundColor: accentColor }} /> <span className={isGold ? 'gold-metallic-text' : ''}>Arquitectura en detalle</span></p>
        <h2 className="text-3xl font-medium tracking-[-0.04em] text-white sm:text-5xl">Ficha técnica<span className={isGold ? 'gold-metallic-text' : ''} style={{ color: accentColor }}>.</span></h2>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-3">
        <p className="max-w-xs text-xs leading-relaxed text-white/50 sm:text-right">{projectName || project?.nombre}<span className="mt-1 block text-white/35">{technicalSpecs?.typology || project?.alcance}</span></p>
        <button
          type="button"
          onClick={() => downloadProjectDossierPdf({ project, technicalSpecs, projectName, accentColor })}
          className="inline-flex items-center gap-2 rounded-full border bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-white/[0.09] active:scale-[0.98] cursor-pointer"
          style={{ borderColor: `${accentColor}55` }}
        >
          <FileDown className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />
          <span>Descargar Dossier PDF</span>
        </button>
      </div>
    </div>

    <div className="overflow-hidden rounded-[20px] sm:rounded-[24px] border bg-[#0B0B0E]/95 shadow-[0_24px_80px_#0004]" style={{ borderColor: `${accentColor}30` }}>
      {highlights.length > 0 && <div className="grid grid-cols-2 border-b border-white/10 sm:grid-flow-col sm:auto-cols-fr" style={{ background: `linear-gradient(115deg, ${accentColor}0D, transparent 70%)` }}>
        {highlights.map(([label, value], index) => <div key={label} className="relative min-w-0 border-b border-r border-white/[0.07] px-4 py-5 even:border-r-0 sm:border-b-0 sm:even:border-r sm:last:border-r-0 sm:px-8 sm:py-9">
          <span className="mb-2 sm:mb-3 block text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.14em] sm:tracking-[0.17em] text-white/50 truncate">{label}</span>
          <span className={`block text-[clamp(1.2rem,5vw,2.6rem)] font-medium leading-tight tracking-[-0.04em] ${index === 0 && isGold ? 'gold-metallic-text' : ''}`} style={{ color: index === 0 ? accentColor : '#F5F2EB' }}>{value}</span>
        </div>)}
      </div>}

      <div className="grid lg:grid-cols-12">
        {areas && <div className="px-4 py-6 sm:p-8 lg:col-span-7">
          <div className="mb-2 flex items-center justify-between pb-3 sm:pb-4">
            <h3 className="text-sm sm:text-base font-medium tracking-tight text-white">{areas.title}</h3>
            <span className="text-[9px] uppercase tracking-widest text-white/35">Área / m²</span>
          </div>
          <SpecificationRows rows={areas.rows} accentColor={accentColor} />
        </div>}
        {generalRows.length > 0 && <div className={`${areas ? 'border-t border-white/10 lg:col-span-5 lg:border-l lg:border-t-0' : 'lg:col-span-12'} bg-white/[0.015] px-4 py-6 sm:p-8`}>
          <h3 className="mb-2 pb-3 sm:pb-4 text-sm sm:text-base font-medium tracking-tight text-white">Datos del proyecto</h3>
          <SpecificationRows rows={generalRows} accentColor={accentColor} />
          {project?.creditos?.length ? <div className="mt-7 rounded-xl border p-4" style={{ borderColor: `${accentColor}20`, backgroundColor: `${accentColor}06` }}>
            {project.creditos.map(credit => <div key={`${credit.rol}-${credit.nombre}`} className="mb-3 last:mb-0">
              <span className="block text-[9px] uppercase tracking-[0.15em] text-white/45">{credit.rol}</span>
              <span className={`mt-2 block text-sm font-medium ${isGold ? 'gold-metallic-text' : ''}`} style={{ color: accentColor }}>{credit.nombre}</span>
            </div>)}
          </div> : null}
        </div>}
      </div>

      {regulations.length > 0 && <details className="group border-t border-white/10">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-xs text-white/65 transition-colors hover:bg-white/[0.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] sm:px-8 [&::-webkit-details-marker]:hidden">
          <span>Índices y parámetros técnicos<span className="mt-1 block text-[10px] text-white/35">Consultar información complementaria del proyecto</span></span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: accentColor }} />
        </summary>
        <div className="grid gap-8 border-t border-white/[0.06] px-6 py-6 sm:px-8 lg:grid-cols-2">
          {regulations.map((group, index) => <div key={group.title}>
            <h3 className="mb-4 text-xs font-medium text-white/80">{group.title}</h3>
            {index === 0 ? <dl className="grid grid-cols-2 gap-4">
              {group.rows.map(([label, value]) => <div key={label}>
                <dt className="mb-3 text-xs leading-relaxed text-white/50">{label}</dt>
                <dd className={`text-3xl font-medium tracking-tight ${isGold ? 'gold-metallic-text' : ''}`} style={{ color: accentColor }}>{value}</dd>
              </div>)}
            </dl> : <SpecificationRows rows={group.rows} accentColor={accentColor} />}
          </div>)}
        </div>
      </details>}
    </div>
    {technicalSpecs && <p className="mt-5 max-w-3xl text-[11px] leading-relaxed text-white/40">{technicalSpecs.areas.kiosk !== undefined ? 'Áreas, índices y ocupaciones reproducidos de la documentación técnica del proyecto. El total del primer piso incluye el piso, el kiosco y la zona piscina.' : 'Áreas, índices y parámetros técnicos reproducidos de la documentación técnica oficial del proyecto.'}</p>}
    {!generalRows.length && !technicalSpecs && !highlights.length && <p className="py-6 text-sm text-white/60">La información técnica de este proyecto estará disponible próximamente.</p>}
  </section>;
}
