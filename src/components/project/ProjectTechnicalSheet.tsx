import { technicalRowGroups, type ProjectTechnicalSpecs } from '../../data/haciendaF22Specs';

export function ProjectTechnicalSheet({ specs, accentColor = '#DFC47B' }: { specs: ProjectTechnicalSpecs; accentColor?: string }) {
  return <section aria-label="Especificaciones técnicas del proyecto" className="space-y-5">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white">Especificaciones técnicas</h2>
      <p className="mt-1 text-sm text-white/70">{specs.typology}</p>
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
    <p className="text-xs leading-relaxed text-white/55">Valores transcritos del cuadro de áreas y del cuadro de ocupaciones y cargas del proyecto. El total del primer piso incluye primer piso, kiosco y zona piscina. La construcción total corresponde a los tres pisos y al kiosco; la zona piscina se presenta por separado.</p>
  </section>;
}
