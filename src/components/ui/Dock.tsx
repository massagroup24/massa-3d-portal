import { useRef, useState, type ComponentType, type MouseEvent } from 'react';
import { Home, TrendingUp, Image as ImageIcon, Compass, Phone } from 'lucide-react';

export type NavTab = 'home' | 'progress' | 'renders' | 'blueprints' | 'contact' | 'tour360' | 'model3d';

interface DockProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  className?: string;
}

interface DockItem {
  id: NavTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'progress', label: 'Avance', icon: TrendingUp },
  { id: 'renders', label: 'Renders', icon: ImageIcon },
  { id: 'blueprints', label: 'Planos', icon: Compass },
  { id: 'contact', label: 'Contacto', icon: Phone },
];

export function Dock({ activeTab, onSelectTab, className = '' }: DockProps) {
  const dockRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  };

  const handleMouseLeave = () => {
    setMouseX(null);
    setHoveredIndex(null);
  };

  return (
    <nav
      ref={dockRef}
      aria-label="Navegación principal de escritorio"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        hidden md:flex items-center gap-3 px-4 py-2.5
        bg-[#121214]/85 backdrop-blur-3xl
        border border-white/[0.12] rounded-full
        shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_1px_rgba(255,255,255,0.25)]
        transition-all duration-300
        ${className}
      `}
    >
      {DOCK_ITEMS.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        // Cálculo de magnificación estilo macOS según proximidad del cursor
        let scale = 1;
        if (mouseX !== null && dockRef.current) {
          const itemElement = dockRef.current.children[index] as HTMLElement;
          if (itemElement) {
            const itemCenter = itemElement.offsetLeft + itemElement.offsetWidth / 2;
            const distance = Math.abs(mouseX - itemCenter);
            const maxDistance = 110; // Radio de atracción del dock
            if (distance < maxDistance) {
              const factor = Math.cos((distance / maxDistance) * (Math.PI / 2));
              scale = 1 + factor * 0.35; // Escala máxima 1.35x
            }
          }
        }

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            onMouseEnter={() => setHoveredIndex(index)}
            style={{
              transform: `scale(${scale})`,
              transition: mouseX === null ? 'transform 0.25s ease-out' : 'transform 0.08s ease-out',
            }}
            className={`
              group relative flex flex-col items-center justify-center
              w-12 h-12 rounded-2xl cursor-pointer select-none
              transition-colors duration-200
              ${isActive ? 'bg-[#9CD01A]/15 text-[#9CD01A]' : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/[0.08]'}
            `}
            title={item.label}
          >
            {/* Tooltip superior visionOS */}
            <div className={`
              absolute -top-11 pointer-events-none transition-all duration-200
              ${hoveredIndex === index ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1'}
            `}>
              <div className="bg-[#171717]/95 backdrop-blur-xl border border-white/15 text-[#F5F5F5] px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap shadow-2xl">
                {item.label}
              </div>
            </div>

            {/* Ícono */}
            <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />

            {/* Indicador de activo: Dot verde lima Massa */}
            {isActive && (
              <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#9CD01A] shadow-[0_0_8px_rgba(156,208,26,0.9)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
