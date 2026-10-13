
interface OrbBackgroundProps {
  className?: string;
}

export function OrbBackground({ className = '' }: OrbBackgroundProps) {
  return (
    <div 
      className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Fondo base oscuro profundo */}
      <div className="absolute inset-0 bg-[#0D0D0E]" />

      {/* Orbe 1: Verde Lima Massa - Superior Derecho */}
      <div 
        className="absolute -top-[10%] -right-[10%] w-[550px] h-[550px] sm:w-[700px] sm:h-[700px] rounded-full bg-[#9CD01A] opacity-[0.11] blur-[120px] animate-orb-1" 
      />

      {/* Orbe 2: Esmeralda Profundo - Inferior Izquierdo */}
      <div 
        className="absolute -bottom-[15%] -left-[10%] w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full bg-[#10b981] opacity-[0.08] blur-[130px] animate-orb-2" 
      />

      {/* Orbe 3: Brillo Central Arquitectónico */}
      <div 
        className="absolute top-[35%] left-[25%] w-[400px] h-[400px] rounded-full bg-[#9CD01A] opacity-[0.06] blur-[110px] animate-orb-3" 
      />

      {/* Textura sutil de rejilla arquitectónica (Grid) */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_65%,transparent_100%)] opacity-70" 
      />
    </div>
  );
}
