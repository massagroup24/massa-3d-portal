import React, { type ReactNode } from 'react';
import { 
  Building2, 
  Search, 
  Camera, 
  Layers, 
  Users, 
  Activity, 
  Compass, 
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';

export type EmptyStateVariant = 
  | 'projects' 
  | 'search' 
  | 'rooms' 
  | 'renders' 
  | 'blueprints' 
  | 'users' 
  | 'visits' 
  | 'generic';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description: string;
  badge?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  icon?: ReactNode;
  className?: string;
  compact?: boolean;
}

const variantConfig: Record<EmptyStateVariant, { icon: React.ComponentType<{ className?: string }>; defaultBadge: string }> = {
  projects: { icon: Building2, defaultBadge: 'CATÁLOGO ARQUITECTÓNICO' },
  search: { icon: Search, defaultBadge: 'BÚSQUEDA SIN COINCIDENCIAS' },
  rooms: { icon: Compass, defaultBadge: 'RECORRIDO 360°' },
  renders: { icon: Camera, defaultBadge: 'GALERÍA DE RENDERS' },
  blueprints: { icon: Layers, defaultBadge: 'PLANOS TÉCNICOS' },
  users: { icon: Users, defaultBadge: 'REGISTRO DE USUARIOS' },
  visits: { icon: Activity, defaultBadge: 'ANALÍTICA DE VISITAS' },
  generic: { icon: Sparkles, defaultBadge: 'SISTEMA MASSA' }
};

export function EmptyState({
  variant = 'generic',
  title,
  description,
  badge,
  primaryAction,
  secondaryAction,
  icon: customIcon,
  className = '',
  compact = false,
}: EmptyStateProps) {
  const config = variantConfig[variant] || variantConfig.generic;
  const IconComponent = config.icon;
  const displayBadge = badge || config.defaultBadge;

  return (
    <div
      className={`
        relative w-full rounded-3xl overflow-hidden
        bg-[#111114]/85 backdrop-blur-2xl border border-white/[0.08]
        flex flex-col items-center justify-center text-center
        transition-all duration-300 hover:border-white/15
        shadow-[0_20px_50px_rgba(0,0,0,0.7)]
        ${compact ? 'p-8 sm:p-10' : 'p-10 sm:p-16 lg:p-20'}
        ${className}
      `}
    >
      {/* Trama milimétrica CAD / Blueprint de fondo arquitectónico */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#9CD01A 1px, transparent 1px),
            linear-gradient(90deg, #9CD01A 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Resplandor radial de ambiente */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#9CD01A]/[0.06] blur-[90px] pointer-events-none" />

      {/* Ícono de Estado Vacío con cápsula de vidrio y micro-anillo */}
      <div className="relative mb-5 z-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#18191E]/90 border border-white/15 p-4 flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(156,208,26,0.15)] group transition-transform duration-500 hover:scale-105">
          {customIcon ? (
            customIcon
          ) : (
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-[#9CD01A] stroke-[1.75] filter drop-shadow-[0_2px_10px_rgba(156,208,26,0.4)]" />
          )}
        </div>
        
        {/* Marcador orbital sutil */}
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#9CD01A]/20 border border-[#9CD01A]/60 flex items-center justify-center shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A] animate-ping" />
        </span>
      </div>

      {/* Badge Técnico */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono font-bold tracking-widest text-[#9CD01A] uppercase mb-3 relative z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
        <span>{displayBadge}</span>
      </div>

      {/* Título Monumental & Subtítulo */}
      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight relative z-10 max-w-lg mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed max-w-md relative z-10 mb-6">
        {description}
      </p>

      {/* Botones de Acción (Call to Action) */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white/80 hover:text-white text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          )}

          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.loading}
              className="px-6 py-3 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-[#09090B] text-xs font-black tracking-wider uppercase transition-all duration-200 shadow-[0_0_25px_rgba(156,208,26,0.35)] hover:shadow-[0_0_35px_rgba(156,208,26,0.55)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {primaryAction.loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
              ) : (
                primaryAction.icon || <Plus className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
