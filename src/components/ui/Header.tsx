import { Bell, LogOut } from 'lucide-react';

interface HeaderProps {
  projectName?: string;
  userRole?: 'client' | 'architect' | 'guest';
  onLogout?: () => void;
  publicProjects?: { id: string; name: string }[];
  onSelectProject?: (id: string) => void;
  className?: string;
}

export function Header({
  projectName = 'Villa Serena',
  userRole = 'client',
  onLogout,
  publicProjects,
  onSelectProject,
  className = '',
}: HeaderProps) {
  return (
    <header
      className={`
        sticky top-0 z-30 w-full
        bg-[#0D0D0E]/80 backdrop-blur-2xl
        border-b border-white/[0.08]
        transition-all duration-300
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Lado Izquierdo: Isotipo Massa + Título / Proyecto */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#171717] border border-white/10 p-2 flex items-center justify-center shadow-lg shrink-0">
            <img
              src="/MASSA_REBRANDING_PROFILE_REDES_ENTREGABLE_2023_003.png"
              alt="Massa Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] text-[#9CD01A] uppercase">
                MASSA GROUP
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono">
                VIEW
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-[#F5F5F5] tracking-tight truncate max-w-[150px] sm:max-w-none">
                {projectName}
              </span>
              {userRole === 'guest' && publicProjects && publicProjects.length > 1 && onSelectProject && (
                <select
                  value={publicProjects.find(p => p.name === projectName)?.id || ''}
                  onChange={(e) => onSelectProject(e.target.value)}
                  className="bg-[#171717] border border-white/15 text-white/80 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#9CD01A] cursor-pointer hidden md:inline-block"
                  title="Cambiar proyecto público"
                >
                  {publicProjects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#171717] text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Centro / Badge de Perfil (Oculto en móvil muy pequeño) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-white/80">
          <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_8px_rgba(156,208,26,0.8)]" />
          <span>
            {userRole === 'guest' 
              ? 'Portafolio Público • Invitado' 
              : userRole === 'architect' 
              ? 'Panel Arquitecto' 
              : 'Home Cliente'}
          </span>
        </div>

        {/* Lado Derecho: Acciones (Notificaciones & Salir) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Campana de Notificaciones con dot */}
          <button
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-[#F5F5F5] transition-colors relative cursor-pointer"
            title="Notificaciones"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/80" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
          </button>

          {/* Botón Salir */}
          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/[0.05] hover:bg-red-500/15 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-white/70 hover:text-red-400 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
