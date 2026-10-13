import { useRef, useState, type ReactNode, type ButtonHTMLAttributes, type MouseEvent } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
  className?: string;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  magnetic = false,
  className = '',
  icon,
  onMouseMove,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Manejo de atracción magnética suave (solo en escritorio)
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (magnetic && window.matchMedia('(pointer: fine)').matches && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.22;
      const deltaY = (e.clientY - centerY) * 0.22;
      setOffset({ x: deltaX, y: deltaY });
    }
    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    if (magnetic) {
      setOffset({ x: 0, y: 0 });
    }
    if (onMouseLeave) onMouseLeave(e);
  };

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-2xl sm:rounded-3xl gap-2.5',
  }[size];

  const variantClasses = {
    primary: `
      bg-[#9CD01A] text-[#0D0D0E] font-bold
      shadow-[0_0_20px_rgba(156,208,26,0.35)]
      hover:bg-[#ABDE24] hover:shadow-[0_0_35px_rgba(156,208,26,0.55)]
      active:scale-95
    `,
    secondary: `
      bg-white/[0.06] hover:bg-white/[0.12]
      border border-white/10 hover:border-[#9CD01A]/35
      text-[#F5F5F5] font-semibold
      backdrop-blur-md shadow-lg
      active:scale-95
    `,
    ghost: `
      bg-transparent hover:bg-white/[0.08]
      text-white/80 hover:text-white
      active:scale-95
    `,
    outline: `
      bg-transparent hover:bg-[#9CD01A]/10
      border border-white/20 hover:border-[#9CD01A]
      text-[#F5F5F5] hover:text-[#9CD01A]
      active:scale-95
    `
  }[variant];

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: magnetic ? `translate3d(${offset.x}px, ${offset.y}px, 0)` : undefined,
        transition: offset.x === 0 && offset.y === 0 ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
      }}
      className={`
        inline-flex items-center justify-center select-none cursor-pointer
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#9CD01A]/50
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
