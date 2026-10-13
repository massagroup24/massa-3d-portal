import type { ComponentType } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { NavTab } from './ui/Dock';
import { 
  Layers, 
  Compass, 
  Box, 
  TrendingUp, 
  Phone, 
  Sparkles, 
  ArrowLeft 
} from 'lucide-react';

interface SectionPlaceholderProps {
  tab: NavTab;
  onBackToHome: () => void;
}

const SECTION_METADATA: Record<NavTab, { title: string; subtitle: string; icon: ComponentType<{ className?: string }>; description: string }> = {
  home: {
    title: 'Inicio',
    subtitle: 'Resumen ejecutivo del proyecto',
    icon: Sparkles,
    description: 'Vista principal del proyecto.',
  },
  renders: {
    title: 'Galería de Renders',
    subtitle: 'Visualizaciones fotorrealistas de alta definición',
    icon: Layers,
    description: 'En la Fase 2 aquí se activará la galería inmersiva a pantalla completa con navegación por swipe y selector en carrusel.',
  },
  blueprints: {
    title: 'Planos Arquitectónicos',
    subtitle: 'Documentación técnica por niveles',
    icon: Compass,
    description: 'En la Fase 2 aquí se activará el visor interactivo con zoom, paneo, selector de plantas/pisos y descarga directa en PDF.',
  },
  model3d: {
    title: 'Modelo 3D Interactivo',
    subtitle: 'Visualizador orbital con Three.js',
    icon: Box,
    description: 'En la Fase 2 aquí se activará el visor 3D para archivos .glb con control de capas (estructura, envolvente, acabados).',
  },
  progress: {
    title: 'Avance de Obra',
    subtitle: 'Seguimiento fotográfico y de video semanal',
    icon: TrendingUp,
    description: 'En la Fase 2 aquí se activará el feed cronológico vertical de hitos constructivos con el comparador interactivo "Antes / Ahora".',
  },
  contact: {
    title: 'Tu Arquitecto',
    subtitle: 'Canal de comunicación directo',
    icon: Phone,
    description: 'Contacta a tu arquitecto asignado directamente vía llamada telefónica o WhatsApp para coordinar visitas a obra.',
  },
  tour360: {
    title: 'Recorrido Virtual 360°',
    subtitle: 'Inmersión espacial completa',
    icon: Sparkles,
    description: 'Recorrido fotográfico 360° con puntos de navegación interactivos.',
  },
};

export function SectionPlaceholder({ tab, onBackToHome }: SectionPlaceholderProps) {
  const meta = SECTION_METADATA[tab] || SECTION_METADATA.home;
  const Icon = meta.icon;

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 flex flex-col items-center">
      <GlassCard className="w-full p-8 sm:p-12 text-center flex flex-col items-center">
        {/* Ícono de sección en caja de vidrio con brillo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#9CD01A]/15 border border-[#9CD01A]/30 flex items-center justify-center text-[#9CD01A] shadow-[0_0_30px_rgba(156,208,26,0.3)] mb-6 animate-levitate">
          <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white/70 font-mono uppercase tracking-wider mb-3">
          <span>VIEW by MASSA GROUP</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F5] tracking-tight mb-2">
          {meta.title}
        </h2>

        <p className="text-sm sm:text-base text-[#9CD01A] font-medium mb-4">
          {meta.subtitle}
        </p>

        <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-md mx-auto leading-relaxed mb-8">
          {meta.description}
        </p>

        <Button
          onClick={onBackToHome}
          variant="secondary"
          size="md"
          icon={<ArrowLeft className="w-4 h-4 text-[#9CD01A]" />}
        >
          Volver al Inicio
        </Button>
      </GlassCard>
    </div>
  );
}
