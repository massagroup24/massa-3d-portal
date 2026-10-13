import { GlassCard } from '../ui/GlassCard';
import { NavTab } from '../ui/Dock';
import { 
  Layers, 
  Rotate3d, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Phone,
  Lock
} from 'lucide-react';
import { ProjectPublicSpecs } from '../../services/portalService';

interface GuestHomeProps {
  projectName: string;
  specs: ProjectPublicSpecs;
  onNavigateSection: (tab: NavTab) => void;
  onOpen360Tour: () => void;
  publicProjects?: { id: string; name: string }[];
  activeProjectId?: string;
  onSelectProject?: (id: string) => void;
  heroImage?: string;
}

export function GuestHome({
  projectName,
  specs,
  onNavigateSection,
  onOpen360Tour,
  publicProjects = [],
  activeProjectId,
  onSelectProject,
  heroImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop'
}: GuestHomeProps) {
  const whatsappUrl = `https://wa.me/573108924410?text=${encodeURIComponent(`Hola Massa Group, estuve viendo el proyecto ${projectName} en su portal público VIEW y me gustaría cotizar un diseño.`)}`;

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-36">
      
      {/* Header Público con Selector de Proyectos */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_8px_#9CD01A] animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-[#9CD01A] tracking-wider uppercase">
              Portafolio Público • MASSA GROUP
            </span>
          </div>

          {/* Selector de Proyectos Públicos si hay varios */}
          {publicProjects.length > 1 && onSelectProject && (
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 text-xs overflow-x-auto max-w-full">
              <span className="text-white/40 px-2 text-[11px] hidden sm:inline">Explorar:</span>
              {publicProjects.map((p) => {
                const isSelected = p.id === activeProjectId;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#9CD01A] text-black shadow-[0_0_12px_rgba(156,208,26,0.4)]'
                        : 'text-[#A3A3A3] hover:text-white'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F5F5F5] tracking-tight">
              {projectName}
            </h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1 font-medium">
              {specs.typology} • {specs.location} • {specs.areaBuilt}
            </p>
          </div>

          <span className="px-3.5 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 text-xs sm:text-sm font-mono font-bold tracking-wider text-[#9CD01A]">
            ACCESO PÚBLICO
          </span>
        </div>
      </div>

      {/* TARJETA HERO: Render Principal del Proyecto */}
      <div className="group relative rounded-3xl sm:rounded-[32px] overflow-hidden bg-[#171717] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        <div className="relative w-full h-[280px] sm:h-[380px] md:h-[440px] overflow-hidden">
          <img
            src={heroImage}
            alt={projectName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-black/30 to-black/40" />

          {/* Badges superiores */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/20 text-xs font-bold text-white tracking-wide shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-[#9CD01A]" />
              <span>PROYECTO DESTACADO</span>
            </div>
          </div>

          {/* Bottom details on hero image */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="max-w-xl">
              <span className="text-[11px] font-mono text-[#9CD01A] uppercase tracking-wider">
                {specs.architecturalStyle}
              </span>
              <p className="text-xs sm:text-sm text-white/90 line-clamp-2 mt-1 drop-shadow">
                {specs.designConcept}
              </p>
            </div>

            <button
              onClick={onOpen360Tour}
              className="px-4 py-2.5 rounded-2xl bg-[#9CD01A] text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(156,208,26,0.5)] hover:bg-[#b0eb1e] transition cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Rotate3d className="w-4 h-4" />
              <span>Abrir Tour 360°</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN: Experiencia de Exploración para Invitados (3 Secciones Públicas) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">
            Explorar este proyecto
          </h2>
          <span className="text-xs sm:text-sm text-[#A3A3A3] font-medium">
            3 áreas disponibles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          
          {/* Tarjeta 1: Renders Fotorrealistas (Full-bleed edge-to-edge) */}
          <div
            onClick={() => onNavigateSection('renders')}
            className="group relative min-h-[220px] rounded-3xl overflow-hidden bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.18)] cursor-pointer flex flex-col justify-end active:scale-[0.98]"
          >
            {/* Foto a sangre completa sin bordes negros internos */}
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
              alt="Renders"
              className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-65 group-hover:scale-108 transition-all duration-700 ease-out"
            />
            {/* Gradiente cinemático de alto contraste para lectura perfecta */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/60 to-black/20" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.04]" />

            <div className="relative z-10 p-6 sm:p-7 flex items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" /> Alta Definición 4K
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1 group-hover:text-[#9CD01A] transition-colors">
                  Renders
                </h3>
                <p className="text-xs text-[#A3A3A3] font-medium">
                  Galería exterior e interior en ultra definición
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-black text-white border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 group-hover:scale-110">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Recorrido 360° (Full-bleed edge-to-edge) */}
          <div
            onClick={onOpen360Tour}
            className="group relative min-h-[220px] rounded-3xl overflow-hidden bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.18)] cursor-pointer flex flex-col justify-end active:scale-[0.98]"
          >
            {/* Foto a sangre completa sin bordes negros internos */}
            <img
              src="https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop"
              alt="Recorrido 360"
              className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-65 group-hover:scale-108 transition-all duration-700 ease-out"
            />
            {/* Gradiente cinemático de alto contraste */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/60 to-black/20" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.04]" />

            <div className="relative z-10 p-6 sm:p-7 flex items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-2">
                  <Rotate3d className="w-3 h-3" /> Inmersión Espacial
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1 group-hover:text-[#9CD01A] transition-colors">
                  Recorrido 360°
                </h3>
                <p className="text-xs text-[#A3A3A3] font-medium">
                  Visor esférico interactivo de todas las estancias
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#9CD01A] text-black border border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(156,208,26,0.4)] shrink-0 group-hover:scale-110">
                <Rotate3d className="w-6 h-6 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Especificaciones del Proyecto (Armónica y Full-bleed) */}
          <div
            onClick={() => onNavigateSection('specs')}
            className="group relative min-h-[220px] rounded-3xl overflow-hidden bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.18)] cursor-pointer flex flex-col justify-end active:scale-[0.98]"
          >
            {/* Fondo arquitectónico sutil con plano / grid */}
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
              alt="Especificaciones"
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 group-hover:scale-108 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/70 to-black/30" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.04]" />

            <div className="relative z-10 p-6 sm:p-7 flex items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-2">
                  <FileText className="w-3 h-3" /> Ficha Técnica & Datos
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1 group-hover:text-[#9CD01A] transition-colors">
                  Especificaciones
                </h3>
                <p className="text-xs text-[#A3A3A3] font-medium">
                  Áreas, materiales nobles, zonificación y bioclimática
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-black text-white border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 group-hover:scale-110">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AVISO DE PRIVACIDAD: Planos y documentos reservados */}
      <div className="rounded-2xl bg-[#171717]/60 border border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 shrink-0">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs text-[#A3A3A3]">
            <strong className="text-white block font-medium">Documentación técnica protegida:</strong>
            Los planos constructivos, memorias ejecutivas y avances semanales de obra están restringidos exclusivamente al cliente propietario.
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 shrink-0 hidden md:inline">
          MODO INVITADO
        </span>
      </div>

      {/* TARJETA DE CONTACTO COMERCIAL CON MASSA GROUP */}
      <GlassCard className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 border-[#9CD01A]/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#171717] border border-white/15 p-2.5 flex items-center justify-center shrink-0 shadow-lg">
            <img
              src="/massa-cube-transparent.png"
              alt="Massa Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(156,208,26,0.3)]"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold tracking-wider text-[#9CD01A] uppercase">
              MASSA GROUP ARQUITECTURA
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              ¿Te interesa cotizar un proyecto como {projectName}?
            </h3>
            <p className="text-xs text-[#A3A3A3] mt-0.5">
              Habla directamente con nuestro equipo de arquitectura y diseño.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-[#9CD01A] hover:bg-[#abde24] text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(156,208,26,0.35)] transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consultar por WhatsApp</span>
          </a>

          <a
            href="tel:+573108924410"
            className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition cursor-pointer"
            title="Llamar a Massa Group"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </GlassCard>

    </div>
  );
}
