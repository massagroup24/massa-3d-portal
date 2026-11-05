import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Link2, Share2, X } from 'lucide-react';
import { getProjectShareUrl, shareProjectLink } from '../../utils/projectSharing';

interface ProjectShareButtonProps {
  slug: string;
  projectName: string;
  brandName: string;
  accentColor: string;
  className?: string;
}

export function ProjectShareButton({ slug, projectName, brandName, accentColor, className }: ProjectShareButtonProps) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!manualUrl) return;
    dialog.current?.showModal();
    linkInput.current?.focus();
    linkInput.current?.select();
  }, [manualUrl]);

  const handleShare = async () => {
    if (busy) return;
    setBusy(true);
    setCopied(false);
    try {
      const url = getProjectShareUrl(slug, window.location.origin);
      const result = await shareProjectLink({ title: `${projectName} | ${brandName}`, text: `Conoce ${projectName}, un proyecto de ${brandName}.`, url }, {
        share: navigator.share?.bind(navigator),
        writeText: navigator.clipboard?.writeText.bind(navigator.clipboard),
      });
      if (result === 'copied') setCopied(true);
      if (result === 'manual') setManualUrl(url);
    } finally {
      setBusy(false);
    }
  };

  return <div className={className}>
    <button type="button" onClick={() => void handleShare()} disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border bg-white/[0.04] px-4 py-2 text-[11px] font-medium tracking-wide text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60" style={{ borderColor: `${accentColor}65`, outlineColor: accentColor }}>
      {copied ? <Check aria-hidden="true" className="h-3.5 w-3.5" style={{ color: accentColor }} /> : <Share2 aria-hidden="true" className="h-3.5 w-3.5" style={{ color: accentColor }} />}
      {busy ? 'Abriendo…' : copied ? 'Enlace copiado' : 'Compartir proyecto'}
    </button>
    <span role="status" aria-live="polite" className="sr-only">{copied ? 'Enlace directo del proyecto copiado al portapapeles.' : ''}</span>
    {manualUrl && createPortal(<dialog ref={dialog} aria-labelledby="project-share-title" onClose={() => setManualUrl(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border border-white/15 bg-[#101014] p-6 text-white shadow-2xl backdrop:bg-black/75">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="project-share-title" className="text-lg font-medium">Compartir {projectName}</h2>
        <button type="button" aria-label="Cerrar enlace del proyecto" onClick={() => dialog.current?.close()} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-white/60">Copia este enlace para compartir la presentación completa del proyecto.</p>
      <label className="mb-2 flex items-center gap-2 text-xs text-white/60" htmlFor="project-share-url"><Link2 className="h-3.5 w-3.5" /> Enlace directo</label>
      <input ref={linkInput} id="project-share-url" value={manualUrl} readOnly onFocus={event => event.currentTarget.select()} className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-3 text-sm text-white focus:outline focus:outline-2" style={{ outlineColor: accentColor }} />
      <form method="dialog" className="mt-5 flex justify-end"><button className="rounded-full px-5 py-2.5 text-sm font-medium text-black" style={{ backgroundColor: accentColor }}>Listo</button></form>
    </dialog>, document.body)}
  </div>;
}
