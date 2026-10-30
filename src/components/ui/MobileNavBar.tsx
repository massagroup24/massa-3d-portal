import { Home, TrendingUp, Image as ImageIcon, Compass, Phone, Rotate3d, FileText } from 'lucide-react';
import { NavTab } from './Dock';

interface MobileNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole?: 'client' | 'architect' | 'guest';
  brandColor?: string;
  className?: string;
}

const CLIENT_NAV_ITEMS = [
  { id: 'home' as NavTab, label: 'Inicio', icon: Home },
  { id: 'progress' as NavTab, label: 'Avance', icon: TrendingUp },
  { id: 'renders' as NavTab, label: 'Renders', icon: ImageIcon },
  { id: 'blueprints' as NavTab, label: 'Planos', icon: Compass },
  { id: 'contact' as NavTab, label: 'Contacto', icon: Phone },
];

const GUEST_NAV_ITEMS = [
  { id: 'home' as NavTab, label: 'Inicio', icon: Home },
  { id: 'blueprints' as NavTab, label: 'Planos', icon: Compass },
  { id: 'renders' as NavTab, label: 'Renders', icon: ImageIcon },
  { id: 'tour360' as NavTab, label: 'Tour 360°', icon: Rotate3d },
  { id: 'specs' as NavTab, label: 'Ficha', icon: FileText },
  { id: 'contact' as NavTab, label: 'Contacto', icon: Phone },
];

export function MobileNavBar({ activeTab, onSelectTab, userRole = 'client', brandColor = '#9CD01A', className = '' }: MobileNavBarProps) {
  const items = userRole === 'guest' ? GUEST_NAV_ITEMS : CLIENT_NAV_ITEMS;
  return (
    <nav
      aria-label="Navegación móvil inferior"
      className={`
        md:hidden fixed bottom-2.5 left-2.5 right-2.5 z-40
        bg-[#141416]/92 backdrop-blur-2xl
        border border-white/[0.12] rounded-3xl
        shadow-[0_-5px_30px_rgba(0,0,0,0.85),0_15px_35px_rgba(0,0,0,0.7)]
        px-1 sm:px-2 py-1.5 pb-[max(0.65rem,env(safe-area-inset-bottom))]
        flex items-center justify-around gap-0.5
        ${className}
      `}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            style={isActive ? { color: brandColor } : undefined}
            className={`
              relative flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-2xl
              min-w-[48px] min-h-[44px] transition-all duration-200 cursor-pointer select-none active:scale-95
              ${isActive ? '' : 'text-[#8E8E93] hover:text-[#F5F5F5]'}
            `}
          >
            {/* Fondo activo sutil */}
            {isActive && (
              <span className="absolute inset-0 rounded-2xl border" style={{ backgroundColor: `${brandColor}1F`, borderColor: `${brandColor}40`, boxShadow: `0 0 12px ${brandColor}33` }} />
            )}

            {/* Ícono */}
            <div className="relative">
              <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
            </div>

            {/* Etiqueta */}
            <span className={`text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-medium whitespace-nowrap leading-none ${isActive ? 'font-bold text-[#9CD01A]' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
