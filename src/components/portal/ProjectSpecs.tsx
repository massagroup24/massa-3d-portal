import { 
  Building2, 
  MapPin, 
  Calendar, 
  Maximize, 
  Layers, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  MessageSquare, 
  ShieldAlert, 
  ArrowRight 
} from 'lucide-react';
import { ProjectPublicSpecs } from '../../services/portalService';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface ProjectSpecsProps {
  projectName: string;
  specs: ProjectPublicSpecs;
  onContactCommercial?: () => void;
}

export function ProjectSpecs({ projectName, specs, onContactCommercial }: ProjectSpecsProps) {
  const whatsappMsg = encodeURIComponent(
    `Hola Massa Group, estuve viendo las especificaciones públicas del proyecto ${projectName} en su portal VIEW y me gustaría recibir asesoría para un proyecto similar.`
  );
  const whatsappUrl = `https://wa.me/573108924410?text=${whatsappMsg}`;

  const handleAction = () => {
    if (onContactCommercial) {
      onContactCommercial();
    } else {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#9CD01A]">
              Memoria & Ficha Técnica
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
            Especificaciones del Proyecto
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Ficha arquitectónica pública y detalles de diseño para <span className="text-[#F5F5F5] font-medium">{projectName}</span>
          </p>
        </div>

        {/* Commercial action */}
        <Button
          variant="primary"
          onClick={handleAction}
          className="gap-2 shadow-[0_0_25px_rgba(156,208,26,0.35)]"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Consultar con MASSA</span>
        </Button>
      </div>

      {/* 1. Métricas Clave Principales (Grid de 4 a 6 cajas visionOS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Área</span>
            <Maximize className="w-4 h-4 text-[#9CD01A]" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">{specs.areaBuilt}</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">Construida</div>
          </div>
        </GlassCard>

        {specs.lotArea && (
          <GlassCard className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold">Lote</span>
              <Compass className="w-4 h-4 text-[#9CD01A]" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white">{specs.lotArea}</div>
              <div className="text-[11px] text-[#A3A3A3] mt-0.5">Superficie</div>
            </div>
          </GlassCard>
        )}

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Niveles</span>
            <Layers className="w-4 h-4 text-[#9CD01A]" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">{specs.levels}</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">Plantas</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Ubicación</span>
            <MapPin className="w-4 h-4 text-[#9CD01A]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">{specs.location}</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">Región</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Tipología</span>
            <Building2 className="w-4 h-4 text-[#9CD01A]" />
          </div>
          <div>
            <div className="text-xs font-bold text-white line-clamp-2 leading-tight">{specs.typology}</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">Uso</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Año</span>
            <Calendar className="w-4 h-4 text-[#9CD01A]" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">{specs.year}</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">Diseño MASSA</div>
          </div>
        </GlassCard>
      </div>

      {/* 2. Memoria Conceptual & Atributos de Diseño */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#9CD01A]" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Concepto & Memoria Arquitectónica
          </h3>
        </div>

        <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light mb-6">
          {specs.designConcept}
        </p>

        {/* Lista de atributos de diseño clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-white/10">
          {specs.keyFeatures.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#A3A3A3]">
              <CheckCircle2 className="w-4 h-4 text-[#9CD01A] shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 3. Paleta de Materiales & Acabados Nobles */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#9CD01A]" />
          <span>Paleta de Materiales & Acabados</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {specs.materials.map((mat, idx) => (
            <GlassCard key={idx} className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider">
                  {mat.category}
                </span>
                <h4 className="text-base font-bold text-white mt-1 mb-2">
                  {mat.name}
                </h4>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  {mat.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* 4. Programa Espacial Funcional (Zonificación Pública) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#9CD01A]" />
          <span>Programa Espacial General</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {specs.spatialProgram.map((prog, idx) => (
            <GlassCard key={idx} className="p-5">
              <h4 className="text-sm font-bold text-white mb-3 pb-2 border-b border-white/10 flex items-center justify-between">
                <span>{prog.zone}</span>
                <span className="text-[11px] font-mono text-[#9CD01A]">{prog.spaces.length} áreas</span>
              </h4>

              <ul className="space-y-2">
                {prog.spaces.map((space, sIdx) => (
                  <li key={sIdx} className="text-xs text-[#A3A3A3] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span>{space}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* 5. Banner de Privacidad & Propiedad Intelectual */}
      <div className="bg-[#171717]/60 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#A3A3A3]">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Privacidad y Propiedad Intelectual:</strong> Los planos constructivos acotados, memorias de cálculo estructural, presupuestos y licencias están protegidos bajo acuerdos de confidencialidad y solo son accesibles para el cliente propietario del proyecto.
        </div>
      </div>

      {/* 6. Banner Comercial: Diseña con MASSA GROUP */}
      <GlassCard className="p-6 sm:p-8 bg-gradient-to-br from-[#171717] via-[#1A1E14] to-[#171717] border-[#9CD01A]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-[#9CD01A] uppercase tracking-widest mb-1 block">
              DISEÑO & CONSTRUCCIÓN MASSA GROUP
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ¿Deseas desarrollar un proyecto arquitectónico con este nivel de excelencia?
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] mt-2">
              Creamos experiencias de vida y espacios comerciales de vanguardia con renders fotorrealistas, visualizaciones 360° y dirección técnica integral.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              variant="primary"
              size="lg"
              className="gap-2 shadow-[0_0_30px_rgba(156,208,26,0.4)]"
            >
              <span>Agendar Asesoría</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </GlassCard>
    </div>
  );
}
