import React from 'react';

interface MassaLoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

/**
 * Pantalla de carga ejecutiva MASSA VIEW
 * - Logotipo oficial MASSA™ con efecto de pulso / respiración intermitente y resplandor neón lima.
 * - Ruleta radial segmentada de 12 cápsulas de alta precisión (inspirada en la referencia enviada).
 * - Fondo arquitectónico con cuadrícula milimétrica CAD y gradiente radial.
 */
export const MassaLoadingScreen: React.FC<MassaLoadingScreenProps> = ({
  message = 'VIEW BY MASSA GROUP',
  subMessage = 'CARGANDO ENTORNO ARQUITECTÓNICO',
  fullScreen = true
}) => {
  return (
    <div
      className={`w-full ${
        fullScreen ? 'fixed inset-0 min-h-screen z-50' : 'min-h-[360px] py-16'
      } bg-[#0D0D0E] text-white flex flex-col items-center justify-center select-none overflow-hidden`}
    >
      {/* Fondo Arquitectónico CAD con Gradiente e Iluminación Radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(156,208,26,0.12),transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Halo de luz ambiental pulsante detrás del logo */}
      <div className="absolute w-72 h-36 bg-[#9CD01A]/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        
        {/* LOGO MASSA™ INTERMITENTE / RESPIRACIÓN LUMINOSA */}
        <div className="relative mb-8 group">
          {/* Resplandor trasero difuminado sincronizado */}
          <img
            src="/MASSA_USO.png"
            alt="MASSA GROUP"
            className="w-48 sm:w-56 md:w-64 h-auto object-contain blur-lg opacity-40 absolute inset-0 animate-pulse pointer-events-none"
            aria-hidden="true"
          />
          {/* Logo frontal nítido con animación de pulso elegante */}
          <img
            src="/MASSA_USO.png"
            alt="MASSA GROUP"
            className="relative w-48 sm:w-56 md:w-64 h-auto object-contain drop-shadow-[0_0_24px_rgba(156,208,26,0.35)] animate-[massaPulse_2.2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          />
        </div>

        {/* RULETA RADIAL SEGMENTADA (12 segmentos con degradé de opacidad y acento lima) */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Resplandor suave del spinner */}
          <div className="absolute w-10 h-10 rounded-full bg-[#9CD01A]/20 blur-md pointer-events-none" />
          
          <svg
            className="w-9 h-9 sm:w-10 sm:h-10 animate-spin text-white"
            style={{ animationDuration: '0.95s' }}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 12 cápsulas radiales con opacidades escalonadas y punta en verde lima */}
            {[
              { angle: 0, opacity: 1.0, color: '#9CD01A' },
              { angle: 30, opacity: 0.9, color: '#bbf03a' },
              { angle: 60, opacity: 0.82, color: '#d8ff68' },
              { angle: 90, opacity: 0.72, color: '#f0fdf4' },
              { angle: 120, opacity: 0.62, color: '#ffffff' },
              { angle: 150, opacity: 0.52, color: '#ffffff' },
              { angle: 180, opacity: 0.42, color: '#ffffff' },
              { angle: 210, opacity: 0.34, color: '#ffffff' },
              { angle: 240, opacity: 0.26, color: '#ffffff' },
              { angle: 270, opacity: 0.20, color: '#ffffff' },
              { angle: 300, opacity: 0.14, color: '#ffffff' },
              { angle: 330, opacity: 0.08, color: '#ffffff' },
            ].map(({ angle, opacity, color }) => (
              <line
                key={angle}
                x1="24"
                y1="5"
                x2="24"
                y2="13"
                stroke={color}
                strokeWidth="3.2"
                strokeLinecap="round"
                opacity={opacity}
                transform={`rotate(${angle} 24 24)`}
              />
            ))}
          </svg>
        </div>

        {/* TÍTULO Y BADGE TÉCNICO CAD */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-[11px] sm:text-xs font-bold tracking-[0.28em] text-[#9CD01A] uppercase drop-shadow-[0_0_10px_rgba(156,208,26,0.3)]">
            {message}
          </div>

          {subMessage && (
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] tracking-wider text-white/40 font-mono uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A] animate-ping" />
              <span>{subMessage}</span>
            </div>
          )}
        </div>

        {/* Barra de progreso sutil y limpia */}
        <div className="w-36 sm:w-44 h-[2px] bg-white/10 rounded-full mt-5 overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-[#9CD01A] to-transparent w-24 animate-[massaLaser_1.6s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Estilos CSS Inline para animaciones fluidas y autónomas */}
      <style>{`
        @keyframes massaPulse {
          0%, 100% {
            opacity: 0.75;
            transform: scale(0.985);
            filter: drop-shadow(0 0 16px rgba(156, 208, 26, 0.25));
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
            filter: drop-shadow(0 0 32px rgba(156, 208, 26, 0.6));
          }
        }

        @keyframes massaLaser {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  );
};
