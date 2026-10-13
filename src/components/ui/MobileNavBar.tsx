import { Home, TrendingUp, Image as ImageIcon, Compass, Phone } from 'lucide-react';
import { NavTab } from './Dock';

interface MobileNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  className?: string;
}

const NAV_ITEMS = [
  { id: 'home' as NavTab, label: 'Inicio', icon: Home },
  { id: 'progress' as NavTab, label: 'Avance', icon: TrendingUp },
  { id: 'renders' as NavTab, label: 'Renders', icon: ImageIcon },
  { id: 'blueprints' as NavTab, label: 'Planos', icon: Compass },
  { id: 'contact' as NavTab, label: 'Contacto', icon: Phone },
];

export function MobileNavBar({ activeTab, onSelectTab, className = '' }: MobileNavBarProps) {
  return (
    <nav
      aria-label="Navegación móvil inferior"
      className={`
        md:hidden fixed bottom-3 left-3 right-3 z-40
        bg-[#141416]/90 backdrop-blur-2xl
        border border-white/[0.12] rounded-3xl
        shadow-[0_-5px_30px_rgba(0,0,0,0.8),0_15px_35px_rgba(0,0,0,0.6)]
        px-2 py-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))]
        flex items-center justify-around
        ${className}
      `}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`
              relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl
              transition-all duration-200 cursor-pointer select-none
              ${isActive ? 'text-[#9CD01A]' : 'text-[#8E8E93] hover:text-[#F5F5F5]'}
            `}
          >
            {/* Fondo activo sutil */}
            {isActive && (
              <span className="absolute inset-0 bg-[#9CD01A]/10 rounded-2xl border border-[#9CD01A]/20" />
            )}

            {/* Ícono */}
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
            </div>

            {/* Etiqueta */}
            <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold text-[#9CD01A]' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
