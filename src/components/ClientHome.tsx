import { GlassCard } from './ui/GlassCard';
import { NavTab } from './ui/Dock';
import { 
  Layers, 
  Compass, 
  Box, 
  Rotate3d, 
  Camera, 
  Phone, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ClientHomeProps {
  onNavigateSection: (tab: NavTab) => void;
  projectName?: string;
  clientName?: string;
  phase?: string;
  progressPercentage?: number;
  onOpen360Tour?: () => void;
}

export function ClientHome({
  onNavigateSection,
  projectName = 'Villa Serena',
  clientName = 'Carlos',
  phase = 'FASE 3',
  progressPercentage = 68,
  onOpen360Tour,
}: ClientHomeProps) {
  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-10">
      
      {/* Saludo y Título del Proyecto con Badge de Fase */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_8px_#9CD01A]" />
          <span className="text-xs sm:text-sm font-medium text-[#9CD01A] tracking-wide">
            Hola, {clientName}
          </span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F5F5F5] tracking-tight">
            {projectName}
          </h1>

          <span className="px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/10 text-xs sm:text-sm font-mono font-bold tracking-wider text-white/90">
            {phase}
          </span>
        </div>
      </div>

      {/* TARJETA HERO: Render Principal + Barra de Avance */}
      <div className="group relative rounded-3xl sm:rounded-[32px] overflow-hidden bg-[#171717] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        {/* Imagen Héroe con gradiente de superposición */}
        <div className="relative w-full h-[260px] sm:h-[380px] md:h-[440px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop"
            alt={projectName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-black/20 to-black/50" />

          {/* Badge Superior: "• ACTUALIZADO HOY" */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-xs font-bold text-white tracking-wide shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_8px_#9CD01A] animate-pulse" />
              <span>ACTUALIZADO HOY</span>
            </div>
          </div>
        </div>

        {/* Panel Inferior de Avance de Obra */}
        <div className="p-5 sm:p-7 bg-[#171717]/95 backdrop-blur-2xl border-t border-white/[0.08] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-sm sm:text-base font-semibold">
            <span className="text-[#A3A3A3] font-medium">Avance de obra</span>
            <span className="text-[#9CD01A] font-bold text-base sm:text-lg">
              {progressPercentage}%
            </span>
          </div>

          {/* Barra de Progreso en Verde Lima */}
          <div className="w-full h-2 sm:h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-[#9CD01A] shadow-[0_0_12px_rgba(156,208,26,0.8)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN: Explorar proyecto (5 Secciones) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">
            Explorar proyecto
          </h2>
          <span className="text-xs sm:text-sm text-[#A3A3A3] font-medium">
            5 secciones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          
          {/* Tarjeta 1: Renders (Ancho completo en móvil y tablet) */}
          <GlassCard
            interactive
            spotlight
            onClick={() => onNavigateSection('renders')}
            className="md:col-span-2 group min-h-[180px] sm:min-h-[220px] p-6 sm:p-8 flex flex-col justify-end"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
                alt="Renders"
                className="w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/60 to-transparent" />
            </div>

            <div className="relative z-10 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-1">
                  Renders
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3]">
                  Galería fotorrealista de alta definición
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-[#0D0D0E] text-[#F5F5F5] border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </GlassCard>

          {/* Tarjeta 2: Planos */}
          <GlassCard
            interactive
            spotlight
            onClick={() => onNavigateSection('blueprints')}
            className="group min-h-[170px] sm:min-h-[190px] p-6 flex flex-col justify-end"
          >
            <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-40 transition-opacity">
              <div className="w-full h-full bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>

            <div className="relative z-10 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] mb-1">
                  Planos
                </h3>
                <p className="text-xs text-[#A3A3A3]">
                  Documentación técnica
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-[#0D0D0E] text-[#F5F5F5] border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0">
                <Compass className="w-5 h-5" />
              </div>
            </div>
          </GlassCard>

          {/* Tarjeta 3: Modelo 3D */}
          <GlassCard
            interactive
            spotlight
            onClick={() => onNavigateSection('model3d')}
            className="group min-h-[170px] sm:min-h-[190px] p-6 flex flex-col justify-end"
          >
            <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-40 transition-opacity">
              <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>

            <div className="relative z-10 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] mb-1">
                  Modelo 3D
                </h3>
                <p className="text-xs text-[#A3A3A3]">
                  Visualización interactiva
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-[#0D0D0E] text-[#F5F5F5] border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0">
                <Box className="w-5 h-5" />
              </div>
            </div>
          </GlassCard>

          {/* Tarjeta 4: Recorrido 360° (Motor Reutilizado) */}
          <GlassCard
            interactive
            spotlight
            onClick={onOpen360Tour || (() => onNavigateSection('tour360'))}
            className="md:col-span-2 group min-h-[180px] sm:min-h-[200px] p-6 sm:p-8 flex flex-col justify-end"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop"
                alt="Recorrido 360"
                className="w-full h-full object-cover opacity-35 group-hover:opacity-50 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/60 to-transparent" />
            </div>

            <div className="relative z-10 flex items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#9CD01A] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" /> Inmersión 360°
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-1">
                  Recorrido 360°
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3]">
                  Inmersión espacial completa
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#9CD01A] text-[#0D0D0E] border border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-[0_0_25px_rgba(156,208,26,0.5)] shrink-0">
                <Rotate3d className="w-6 h-6 animate-pulse" />
              </div>
            </div>
          </GlassCard>

          {/* Tarjeta 5: Avance de obra */}
          <GlassCard
            interactive
            spotlight
            onClick={() => onNavigateSection('progress')}
            className="md:col-span-2 group min-h-[170px] sm:min-h-[190px] p-6 sm:p-8 flex flex-col justify-end"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?q=80&w=1200&auto=format&fit=crop"
                alt="Avance de obra"
                className="w-full h-full object-cover opacity-35 group-hover:opacity-50 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/60 to-transparent" />
            </div>

            <div className="relative z-10 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-1">
                  Avance de obra
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3]">
                  Seguimiento fotográfico semanal
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-[#9CD01A] group-hover:text-[#0D0D0E] text-[#F5F5F5] border border-white/20 group-hover:border-[#9CD01A] flex items-center justify-center transition-all duration-300 shadow-xl shrink-0">
                <Camera className="w-5 h-5" />
              </div>
            </div>
          </GlassCard>

        </div>
      </div>

      {/* TARJETA DE CONTACTO: "TU ARQUITECTO" */}
      <GlassCard className="p-5 sm:p-6 flex items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* Avatar con dot verde activo */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-white/15 bg-white/5 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
              alt="Mateo Rossi"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#9CD01A] border-2 border-[#171717]" />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#A3A3A3] uppercase">
              TU ARQUITECTO
            </span>
            <span className="text-base sm:text-lg font-bold text-[#F5F5F5]">
              Mateo Rossi
            </span>
          </div>
        </div>

        {/* Botones de Contacto: Mensaje / WhatsApp y Llamada */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="https://wa.me/573000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-[#F5F5F5] flex items-center justify-center transition-all cursor-pointer"
            title="Escribir por WhatsApp"
          >
            <MessageSquare className="w-5 h-5" />
          </a>

          <a
            href="tel:+573000000000"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#9CD01A] hover:bg-[#ABDE24] text-[#0D0D0E] font-bold flex items-center justify-center transition-all shadow-[0_0_20px_rgba(156,208,26,0.45)] cursor-pointer"
            title="Llamar al arquitecto"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </GlassCard>

    </div>
  );
}
