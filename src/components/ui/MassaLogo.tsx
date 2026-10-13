interface MassaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

export function MassaLogo({ 
  className = '', 
  size = 'md',
  glow = true 
}: MassaLogoProps) {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-[#9CD01A]/20 blur-md pointer-events-none transform scale-90 group-hover:scale-125 group-hover:bg-[#9CD01A]/35 transition-all duration-300" />
      )}
      <img
        src="/massa-cube-transparent.png"
        alt="MASSA GROUP"
        className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(156,208,26,0.35)] transition-transform duration-300 group-hover:scale-108"
      />
    </div>
  );
}
