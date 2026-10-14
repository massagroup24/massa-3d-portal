import { useState, useEffect } from 'react';

interface ArchitecturalCadBackgroundProps {
  className?: string;
  glowColor?: string;
}

export function ArchitecturalCadBackground({
  className = '',
  glowColor = '#9CD01A',
}: ArchitecturalCadBackgroundProps) {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Posición inicial centrada
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#08080A] ${className}`}
      aria-hidden="true"
    >
      {/* 1. Malla CAD Secundaria (24px x 24px) - Líneas ultrafinas de 1px */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 2. Malla CAD Primaria / Ejes Estructurales (96px x 96px) con crucetas */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '96px 96px',
        }}
      />

      {/* 3. Crucetas de Ejes / Coordenadas Blueprint (+) */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(156, 208, 26, 0.8) 1.2px, transparent 1.2px)
          `,
          backgroundSize: '96px 96px',
          backgroundPosition: '-0.5px -0.5px'
        }}
      />

      {/* 4. Linterna / Foco Arquitectónico Interactivo que reacciona suavemente al mouse */}
      {isClient && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(156, 208, 26, 0.12), transparent 70%)`,
          }}
        />
      )}

      {/* 5. Orbe Ambiental Central Cálido/Lime para resaltar la tarjeta de vidrio */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: glowColor }}
      />
      
      {/* 6. Viñeta Cinematográfica en bordes para centrar el enfoque */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,8,0.85)_100%)] pointer-events-none" />

      {/* 7. Datos y Marcadores Técnicos de Plano Arquitectónico en las esquinas */}
      <div className="absolute top-5 left-6 text-[10px] font-mono tracking-widest text-white/35 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A] animate-pulse" />
        <span>MASSA // ARCHITECTURAL SUITE</span>
      </div>

      <div className="absolute top-5 right-6 text-[10px] font-mono tracking-wider text-white/30 hidden md:block">
        GRID: PARAMETRIC 96M • SYS: BIM
      </div>

      <div className="absolute bottom-5 left-6 text-[10px] font-mono tracking-wider text-white/30 hidden sm:block">
        ELEV: 2,600M • 04°38'N 74°04'W
      </div>

      <div className="absolute bottom-5 right-6 text-[10px] font-mono tracking-widest text-[#9CD01A]/50">
        VIEW V2.0 // FAST & LIGHT
      </div>
    </div>
  );
}
