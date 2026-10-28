import { GlassCard } from '../ui/GlassCard';
import { NavTab } from '../ui/Dock';
import { 
  Layers, 
  Rotate3d, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Phone,
  Compass,
  CreditCard,
  CheckCircle2,
  MapPin
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
  onBackToPortfolio?: () => void;
}

export function GuestHome({
  projectName,
  specs,
  onNavigateSection,
  onOpen360Tour,
  publicProjects = [],
  activeProjectId,
  onSelectProject,
  heroImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
  onBackToPortfolio,
}: GuestHomeProps) {
  const whatsappUrl = `https://wa.me/573108924410?text=${encodeURIComponent(`Hola Massa Group, estuve viendo el proyecto ${projectName} en su portal público VIEW y me gustaría cotizar un diseño.`)}`;

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-36">
      
      {/* Header Público con Selector de Proyectos */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            {onBackToPortfolio && (
              <button
                type="button"
                onClick={onBackToPortfolio}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] hover:bg-[#9CD01A] text-xs font-bold text-white hover:text-[#0D0D0E] border border-white/10 hover:border-[#9CD01A] transition cursor-pointer shadow-md active:scale-95"
              >
                <span>← Portafolio</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_8px_#9CD01A] animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-[#9CD01A] tracking-wider uppercase">
                Portafolio Público • MASSA GROUP
              </span>
            </div>
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
        <div className="relative w-full h-[280px] sm:h-[380px] md:h-[440px] overflow-hidden bg-gradient-to-br from-[#12141a] via-[#0d0e12] to-black">
          {heroImage ? (
            <img
              src={heroImage}
              alt={projectName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
              <div 
                className="absolute inset-0 opacity-[0.12] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#9CD01A 1px, transparent 1px), linear-gradient(90deg, #9CD01A 1px, transparent 1px)`,
                  backgroundSize: '28px 28px'
                }}
              />
              <div className="w-16 h-16 rounded-3xl bg-[#9CD01A]/10 border border-[#9CD01A]/30 flex items-center justify-center text-[#9CD01A] mb-3 shadow-[0_0_25px_rgba(156,208,26,0.25)] relative z-10">
                <Sparkles className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#9CD01A] font-bold relative z-10">
                OBRA EN DISEÑO & PREVENTA 2026
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-1 relative z-10">
                {projectName}
              </h2>
              <span className="text-xs text-white/50 mt-1 relative z-10">
                Espacio preparado para render fotorrealista de portada
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-black/30 to-black/40 pointer-events-none" />

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

      {/* SECCIÓN: Experiencia de Exploración del Proyecto (6 Módulos Arquitectónicos) */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F5F5F5] tracking-tight">
              Visualización Integral de la Obra
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3] font-medium mt-0.5">
              Planos, renders, recorrido 360°, acabados, ubicación y plan de inversión
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 text-xs font-mono font-bold text-[#9CD01A]">
            6 ESPACIOS DISPONIBLES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          
          {/* Módulo 1: Planos Arquitectónicos */}
          <div
            onClick={() => onNavigateSection('blueprints')}
            className="group relative min-h-[175px] sm:min-h-[220px] rounded-3xl overflow-hidden bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.18)] cursor-pointer flex flex-col justify-end active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-[#0c0d10] opacity-95 group-hover:opacity-100 transition-opacity" />
            <div 
              className="absolute inset-0 opacity-[0.14] group-hover:opacity-[0.22] transition-opacity pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#9CD01A 1px, transparent 1px), linear-gradient(90deg, #9CD01A 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/70 to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.04]" />

            <div className="relative z-10 p-5 sm:p-7 flex items-end justify-between gap-3 sm:gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-1.5 sm:mb-2">
                  <Compass className="w-3 h-3" /> Distribución Acotada
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-0.5 sm:mb-1 group-hover:text-[#9CD01A] transition-colors">
                  Planos Arquitectónicos
                </h3>
                <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed">
                  Plantas por niveles, cotas y zonificación funcional
                </p>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-black text-white border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 group-hover:scale-110">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* Módulo 2: Renders Fotorrealistas */}
          <div
            onClick={() => onNavigateSection('renders')}
            className="group relative min-h-[175px] sm:min-h-[220px] rounded-3xl overflow-hidden bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.18)] cursor-pointer flex flex-col justify-end active:scale-[0.98]"
          >
            {heroImage ? (
              <img
                src={heroImage}
                alt="Renders"
                className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-65 group-hover:scale-108 transition-all duration-700 ease-out"
              />
            ) : (
              <div
                className="absolute inset-0 opacity-[0.14] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#9CD01A 1px, transparent 1px), linear-gradient(90deg, #9CD01A 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/60 to-black/20" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.04]" />

            <div className="relative z-10 p-5 sm:p-7 flex items-end justify-between gap-3 sm:gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-1.5 sm:mb-2">
                  <Sparkles className="w-3 h-3" /> Alta Definición 4K
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-0.5 sm:mb-1 group-hover:text-[#9CD01A] transition-colors">
                  Renders & Vistas
                </h3>
                <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed">
                  Fachadas, áreas sociales y materialidad en HD
                </p>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-black text-white border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 group-hover:scale-110">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* Módulo 3: Recorrido 360° */}
          <div
            onClick={onOpen360Tour}
            className="group relative min-h-[175px] sm:min-h-[220px] rounded-3xl overflow-hidden bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.18)] cursor-pointer flex flex-col justify-end active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-[#0e0f14]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/60 to-black/20" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.04]" />

            <div className="relative z-10 p-5 sm:p-7 flex items-end justify-between gap-3 sm:gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-1.5 sm:mb-2">
                  <Rotate3d className="w-3 h-3" /> Inmersión Espacial
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-0.5 sm:mb-1 group-hover:text-[#9CD01A] transition-colors">
                  Recorrido 360°
                </h3>
                <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed">
                  Visor interactivo con puntos de navegación
                </p>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#9CD01A] text-black border border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(156,208,26,0.4)] shrink-0 group-hover:scale-110">
                <Rotate3d className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Módulo 4: Ficha Técnica & Acabados */}
          <div
            onClick={() => onNavigateSection('specs')}
            className="group relative min-h-[175px] sm:min-h-[220px] rounded-3xl overflow-hidden bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.18)] cursor-pointer flex flex-col justify-end active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-[#0e0f14]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/70 to-black/30" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.04]" />

            <div className="relative z-10 p-5 sm:p-7 flex items-end justify-between gap-3 sm:gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-1.5 sm:mb-2">
                  <FileText className="w-3 h-3" /> Acabados & Materiales
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-0.5 sm:mb-1 group-hover:text-[#9CD01A] transition-colors">
                  Ficha Técnica
                </h3>
                <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed">
                  Porcelanatos, maderas nobles y carpintería
                </p>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-black text-white border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 group-hover:scale-110">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* Módulo 5: Ubicación del Conjunto o Casa */}
          <a
            href="#seccion-ubicacion"
            className="group relative min-h-[175px] sm:min-h-[220px] rounded-3xl overflow-hidden bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.18)] cursor-pointer flex flex-col justify-end active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-[#0e0f14]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/70 to-black/30" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.04]" />

            <div className="relative z-10 p-5 sm:p-7 flex items-end justify-between gap-3 sm:gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-1.5 sm:mb-2">
                  <MapPin className="w-3 h-3" /> Conjunto & Sector
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-0.5 sm:mb-1 group-hover:text-[#9CD01A] transition-colors">
                  Ubicación & Lote
                </h3>
                <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed">
                  {specs.locationDetails?.neighborhood || specs.location} • {specs.locationDetails?.lotNumber || 'Lote Privado'}
                </p>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-black text-white border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 group-hover:scale-110">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </a>

          {/* Módulo 6: Valor del Proyecto y Forma de Pago */}
          <a
            href="#seccion-pagos"
            className="group relative min-h-[175px] sm:min-h-[220px] rounded-3xl overflow-hidden bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.18)] cursor-pointer flex flex-col justify-end active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-[#0e0f14]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/70 to-black/30" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.04]" />

            <div className="relative z-10 p-5 sm:p-7 flex items-end justify-between gap-3 sm:gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-1.5 sm:mb-2">
                  <CreditCard className="w-3 h-3" /> Presupuesto Llave en Mano
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-0.5 sm:mb-1 group-hover:text-[#9CD01A] transition-colors">
                  Valor & Forma de Pago
                </h3>
                <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed">
                  Inversión estimada, cuota inicial e hitos de obra
                </p>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-black text-white border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 group-hover:scale-110">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </a>

        </div>
      </div>

      {/* SECCIÓN DETALLADA: Ubicación del Conjunto o Casa */}
      <div id="seccion-ubicacion" className="rounded-3xl bg-[#141416]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/30 flex items-center justify-center text-[#9CD01A] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CD01A] font-bold">
                LOCALIZACIÓN GEORREFERENCIADA
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ubicación del Conjunto & Lote
              </h3>
            </div>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70 self-start sm:self-auto">
            {specs.locationDetails?.city || specs.location}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Sector o Condominio</span>
            <div className="text-base font-bold text-white">
              {specs.locationDetails?.neighborhood || specs.location}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Identificación del Terreno</span>
            <div className="text-base font-bold text-[#9CD01A]">
              {specs.locationDetails?.lotNumber || specs.lotArea || 'Lote Exclusivo'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Área y Tipología</span>
            <div className="text-base font-bold text-white">
              {specs.areaBuilt} • {specs.typology}
            </div>
          </div>
        </div>

        {specs.locationDetails?.environment && (
          <p className="mt-5 text-xs sm:text-sm text-white/70 leading-relaxed font-normal p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <strong className="text-white font-semibold">Entorno y Privacidad:</strong> {specs.locationDetails.environment}
          </p>
        )}
      </div>

      {/* SECCIÓN DETALLADA: Valor del Proyecto y Forma de Pago */}
      <div id="seccion-pagos" className="rounded-3xl bg-gradient-to-br from-[#161720] via-[#111217] to-[#0c0d11] border border-[#9CD01A]/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#9CD01A] text-black flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(156,208,26,0.35)]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CD01A] font-bold">
                ESTRUCTURA DE INVERSIÓN MASSA
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Valor del Proyecto & Forma de Pago
              </h3>
            </div>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 text-xs font-mono font-bold text-[#9CD01A] self-start sm:self-auto">
            PRESUPUESTO CERRADO
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">
              01 • Cuota Inicial / Separación
            </span>
            <div className="text-lg font-black text-white mb-1">
              {specs.financials?.downPayment || '30% Durante Planeación'}
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Firma de contrato, estudios geotécnicos y radicación de licencias.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">
              02 • Durante Construcción
            </span>
            <div className="text-lg font-black text-white mb-1">
              {specs.financials?.milestones || '50% en Hitos de Obra'}
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Cuotas distribuidas según actas de avance e interventoría técnica.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">
              03 • Contra Entrega de Llaves
            </span>
            <div className="text-lg font-black text-white mb-1">
              {specs.financials?.delivery || '20% Contra Entrega'}
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Revisión a satisfacción, entrega de garantías y escrituración.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#9CD01A] shrink-0" />
            <div className="text-xs text-white/80">
              <strong className="text-white">Garantía Total Llave en Mano:</strong> Sin sobrecostos imprevistos. Cotización respaldada por contrato de obra a precio cerrado.
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="px-5 py-2.5 rounded-xl bg-[#9CD01A] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shrink-0"
          >
            Cotizar Plan de Pagos
          </button>
        </div>
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
