import { FileDown } from 'lucide-react';
import { technicalRowGroups, type ProjectTechnicalSpecs } from '../../data/haciendaF22Specs';
import { CANONICAL_PROJECTS } from '../../data/canonicalProjects';
import { downloadProjectDossierPdf } from '../../lib/dossierGenerator';

export function ProjectTechnicalSheet({ specs, accentColor = '#DFC47B', projectId }: { specs: ProjectTechnicalSpecs; accentColor?: string; projectId?: string }) {
  const isF22 = projectId === 'project_hacienda_f22' || accentColor.toUpperCase() === '#DFC47B';
  const canonicalProject = CANONICAL_PROJECTS.find(
    (p) => p.id === (projectId || (isF22 ? 'project_hacienda_f22' : 'project_ibiza_a14'))
  );

  return <section aria-label="Especificaciones técnicas del proyecto" className="space-y-5">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Especificaciones técnicas</h2>
        <p className="mt-1 text-sm text-white/70">{specs.typology}</p>
      </div>
      <button
        type="button"
        onClick={() => downloadProjectDossierPdf({
          project: canonicalProject,
          technicalSpecs: specs,
          projectName: canonicalProject?.nombre || (isF22 ? 'HACIENDA CLUB F22' : 'IBIZA A14'),
          accentColor,
        })}
        className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-white/[0.09] active:scale-[0.98] cursor-pointer"
        style={{ borderColor: `${accentColor}55` }}
      >
        <FileDown className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />
        <span>Descargar Dossier PDF</span>
      </button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {technicalRowGroups(specs).map(group => <div key={group.title} className="rounded-2xl border border-white/15 bg-[#0D0D12] p-4 sm:p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: accentColor }}>{group.title}</h3>
        <dl className="divide-y divide-white/10">
          {group.rows.map(([label, value]) => <div key={label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
            <dt className="text-white/65">{label}</dt><dd className="shrink-0 text-right font-semibold text-white tabular-nums">{value}</dd>
          </div>)}
        </dl>
      </div>)}
    </div>
    <p className="text-xs leading-relaxed text-white/55">{specs.areas.kiosk !== undefined ? 'Valores transcritos del cuadro de áreas y del cuadro de ocupaciones y cargas del proyecto. El total del primer piso incluye primer piso, kiosco y zona piscina. La construcción total corresponde a los tres pisos y al kiosco; la zona piscina se presenta por separado.' : 'Valores transcritos de la documentación técnica y el cuadro de áreas oficial del proyecto.'}</p>
  </section>;
}
