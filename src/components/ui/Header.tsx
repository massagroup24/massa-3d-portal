import { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, ChevronDown, Check, MessageSquare, Sparkles } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  projectName?: string;
  userRole?: 'client' | 'architect' | 'guest';
  onLogout?: () => void;
  publicProjects?: { id: string; name: string }[];
  onSelectProject?: (id: string) => void;
  onContact?: () => void;
  onBackToPortfolio?: () => void;
  className?: string;
}

export function Header({
  projectName = 'Villa Serena',
  userRole = 'client',
  onLogout,
  publicProjects = [],
  onSelectProject,
  onContact,
  onBackToPortfolio,
  className = '',
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWhatsApp = () => {
    if (onContact) {
      onContact();
    } else {
      const msg = encodeURIComponent(`Hola Massa Group, estoy explorando el proyecto ${projectName} en su portal VIEW y quisiera agendar una asesoría de diseño.`);
      window.open(`https://wa.me/573108924410?text=${msg}`, '_blank');
    }
  };

  return (
    <header
      className={`
        sticky top-0 z-30 w-full
        bg-[#0D0D0E]/90 backdrop-blur-2xl
        border-b border-white/[0.08]
        transition-all duration-300
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Lado Izquierdo: Isotipo Massa Transparente + Marca + Selector de Proyecto */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Tile VisionOS del Isotipo */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#161618] border border-white/10 p-2 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.6)] shrink-0 group hover:border-[#9CD01A]/40 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-[#9CD01A]/10 opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
            <img
              src="/massa-cube-transparent.png"
              alt="Massa Logo"
              className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(156,208,26,0.35)] transform duration-300 group-hover:scale-110"
            />
          </div>

          <div className="flex flex-col justify-center">
            {/* Tagline Corporativo */}
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] sm:text-[11px] font-black tracking-[0.25em] text-[#9CD01A] uppercase">
                MASSA GROUP
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/10 text-white/80 font-mono tracking-wider">
                VIEW
              </span>
            </div>

            {/* Nombre del Proyecto / Selector visionOS */}
            {userRole === 'guest' && publicProjects.length > 1 && onSelectProject ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="inline-flex items-center gap-2 px-2 py-0.5 -ml-2 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all cursor-pointer group text-left focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-extrabold text-[#F5F5F5] tracking-tight group-hover:text-[#9CD01A] transition-colors">
                    {projectName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-white/70 group-hover:bg-[#9CD01A]/20 group-hover:text-[#9CD01A] transition-colors">
                    <span>Cambiar</span>
                    <ChevronDown className={`w-3 h-3 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {/* Menú Desplegable Frosted Glass para Cambiar de Proyecto */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <m.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#141416]/95 backdrop-blur-2xl border border-white/15 p-2 shadow-[0_25px_50px_rgba(0,0,0,0.85)] z-50 space-y-1"
                    >
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3] border-b border-white/5 mb-1">
                        Proyectos Públicos Disponibles
                      </div>

                      {publicProjects.map((p) => {
                        const isSelected = p.name === projectName || p.id === projectName;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              onSelectProject(p.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#9CD01A]/15 text-[#9CD01A] border border-[#9CD01A]/30'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span>{p.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#9CD01A]" />}
                          </button>
                        );
                      })}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-[#F5F5F5] tracking-tight">
                {projectName}
              </span>
            )}
          </div>
        </div>

        {/* Centro / Badge de Perfil visionOS o Botón Volver a Portafolio */}
        {userRole === 'guest' && onBackToPortfolio ? (
          <button
            type="button"
            onClick={onBackToPortfolio}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-[#9CD01A]/20 border border-white/10 hover:border-[#9CD01A]/40 text-xs font-bold text-white hover:text-[#9CD01A] shadow-inner transition cursor-pointer hover:scale-103 active:scale-97"
            title="Ver todas las obras disponibles"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9CD01A]" />
            <span>Ver Portafolio de Obras ↗</span>
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-white/80 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_8px_rgba(156,208,26,0.9)] animate-pulse" />
            <span>
              {userRole === 'guest' 
                ? 'Portafolio Público' 
                : userRole === 'architect' 
                ? 'Panel Arquitecto' 
                : 'Portal Propietario'}
            </span>
          </div>
        )}

        {/* Lado Derecho: Acciones (Contacto Comercial + Notificaciones + Salir) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Botón de Contacto Comercial en Modo Invitado */}
          {userRole === 'guest' && (
            <button
              onClick={handleWhatsApp}
              type="button"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#9CD01A]/15 hover:bg-[#9CD01A] border border-[#9CD01A]/30 text-xs font-bold text-[#9CD01A] hover:text-[#0D0D0E] shadow-[0_0_15px_rgba(156,208,26,0.15)] hover:shadow-[0_0_25px_rgba(156,208,26,0.4)] transition-all cursor-pointer hover:scale-103 active:scale-97"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contactar MASSA</span>
            </button>
          )}

          {/* Campana de Notificaciones */}
          <button
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-[#F5F5F5] transition-all relative cursor-pointer hover:scale-105 active:scale-95"
            title="Novedades del proyecto"
          >
            <Bell className="w-4 h-4 text-white/80" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#9CD01A] shadow-[0_0_6px_#9CD01A]" />
          </button>

          {/* Botón Salir */}
          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/[0.05] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-white/70 hover:text-red-400 transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Salir o cambiar de perfil"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
