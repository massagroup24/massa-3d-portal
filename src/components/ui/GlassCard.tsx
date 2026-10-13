import { useRef, type ReactNode, type HTMLAttributes, type MouseEvent } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  spotlight?: boolean;
  interactive?: boolean;
  rounded?: '2xl' | '3xl' | '4xl';
}

export function GlassCard({
  children,
  className = '',
  spotlight = false,
  interactive = false,
  rounded = '3xl',
  onMouseMove,
  ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const roundedClasses = {
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl sm:rounded-[28px]',
    '4xl': 'rounded-3xl sm:rounded-[32px]',
  }[rounded];

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!spotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--card-mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--card-mouse-y', `${y}px`);
    if (onMouseMove) onMouseMove(e);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`
        relative overflow-hidden
        bg-[#171717]/75 backdrop-blur-2xl
        border border-white/[0.08]
        shadow-[0_20px_50px_rgba(0,0,0,0.65)]
        ${roundedClasses}
        ${interactive ? 'transition-all duration-300 hover:border-[#9CD01A]/35 hover:shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_25px_rgba(156,208,26,0.12)] hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Resplandor Spotlight Seguidor de Cursor (Solo Escritorio) */}
      {spotlight && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:opacity-100"
          style={{
            background: 'radial-gradient(400px circle at var(--card-mouse-x, -500px) var(--card-mouse-y, -500px), rgba(156, 208, 26, 0.12), transparent 80%)',
          }}
        />
      )}

      {/* Borde sutil de luz interior visionOS */}
      <div className={`pointer-events-none absolute inset-0 ${roundedClasses} border border-white/[0.04]`} />

      {/* Contenido */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
