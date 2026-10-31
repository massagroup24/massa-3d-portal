import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Plus, LogOut } from 'lucide-react';
import { MassaLogo } from '../ui/MassaLogo';

// Icono de barra lateral exacto al usado en la plataforma MASSA
export function SidebarToggleIcon({ className = "w-5 h-5", active = false }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect 
        x="3.5" 
        y="3.5" 
        width="17" 
        height="17" 
        rx="4.5" 
        className={active ? "stroke-[#9CD01A]" : "stroke-white/80"} 
        strokeWidth="1.8" 
      />
      <rect 
        x="6" 
        y="6" 
        width="4.5" 
        height="12" 
        rx="1.8" 
        className={active ? "fill-[#9CD01A]" : "fill-white/80"} 
      />
    </svg>
  );
}

export type ArchitectTab = 'inicio' | 'proyectos' | 'usuarios';

export interface ArchitectHeaderProps {
  currentTab: ArchitectTab;
  totalProjects: number;
  onNavigateToHome: () => void;
  onNavigateToProjects: () => void;
  onNavigateToUsers: () => void;
  onCreateProject: () => void;
  onLogout?: () => void;
  onSwitchRole?: () => void;
  onSwitchToClient?: () => void;
  isAdmin?: boolean;
  onOpenVisits?: () => void;
}

export function ArchitectHeader({
  currentTab,
  totalProjects,
  onNavigateToHome,
  onNavigateToProjects,
  onNavigateToUsers,
  onCreateProject,
  onLogout,
  onSwitchRole,
  isAdmin = false,
  onOpenVisits
}: ArchitectHeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileIcon, setMobileIcon] = useState<'logo' | 'sidebar'>('logo');

  // Alternancia suave del icono del logo en móviles cada 3.2s
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setMobileIcon((prev) => (prev === 'logo' ? 'sidebar' : 'logo'));
    }, 3200);
    return () => clearInterval(iconInterval);
  }, []);

  // Cerrar drawer con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <>
      {/* Executive Studio Navbar Universal */}
      <header
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
        className="sticky top-0 z-40 w-full bg-[#0D0D0E]/90 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* LADO IZQUIERDO (flex-1): Botón de Menú Isotipo MASSA para abrir la barra de navegación */}
          <div className="flex-1 flex items-center justify-start gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              type="button"
              className="group relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#161618] border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer hover:scale-103 active:scale-97 shrink-0"
              title="Abrir menú de navegación"
            >
              {/* Isotipo normal */}
              <div className={`transition-all duration-500 pointer-events-none ${
                mobileIcon === 'sidebar' 
                  ? 'opacity-0 scale-75 md:opacity-100 md:scale-100 md:group-hover:opacity-0 md:group-hover:scale-75' 
                  : 'opacity-100 scale-100 md:group-hover:opacity-0 md:group-hover:scale-75'
              }`}>
                <MassaLogo size="md" glow={false} />
              </div>

              {/* Icono de barra lateral */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none ${
                mobileIcon === 'sidebar' 
                  ? 'opacity-100 scale-100 md:opacity-0 md:scale-75 md:group-hover:opacity-100 md:group-hover:scale-100' 
                  : 'opacity-0 scale-75 md:opacity-0 md:scale-75 md:group-hover:opacity-100 md:group-hover:scale-100'
              }`}>
                <SidebarToggleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#9CD01A]" active={true} />
              </div>

              {/* Micro-anillo de pulso verde en móvil */}
              <span className="md:hidden absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9CD01A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9CD01A]" />
              </span>
            </button>
          </div>

          {/* CENTRO (shrink-0): Logo Oficial MASSA GROUP 100% Centrado */}
          <div className="shrink-0 flex items-center justify-center px-1 sm:px-4">
            <img 
              src="/MASSA_USO.png" 
              alt="MASSA GROUP" 
              onClick={onNavigateToHome}
              className="h-5 sm:h-7 md:h-8 w-auto object-contain filter drop-shadow-[0_2px_14px_rgba(156,208,26,0.3)] transition-all duration-300 hover:scale-103 cursor-pointer"
            />
          </div>

          {/* LADO DERECHO (flex-1): Botón Nuevo Proyecto y Salir */}
          <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2.5">
            <button 
              onClick={onCreateProject}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-[#9CD01A] hover:bg-[#aee620] text-[#0D0D0E] font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(156,208,26,0.25)] hover:shadow-[0_0_30px_rgba(156,208,26,0.45)] transition-all hover:scale-103 active:scale-97 cursor-pointer shrink-0"
              title="Crear Nuevo Proyecto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Nuevo Proyecto</span>
              <span className="sm:hidden text-xs">Proyecto</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                type="button"
                className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-11 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#161618] hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-xs font-semibold text-white/80 hover:text-red-300 transition-all cursor-pointer hover:scale-103 active:scale-98 shrink-0"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Drawer Lateral de Navegación Arquitectónica CAD */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex pointer-events-auto">
            {/* Backdrop oscuro */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Panel de navegación lateral */}
            <m.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="relative z-10 w-[84vw] max-w-xs sm:w-96 h-[100dvh] max-h-screen bg-[#0D0D0E]/98 backdrop-blur-2xl border-r border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden"
            >
              {/* Header del drawer */}
              <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  type="button"
                  className="w-11 h-11 rounded-2xl bg-[#161618] border border-[#9CD01A]/40 flex items-center justify-center shadow-lg cursor-pointer hover:scale-103 active:scale-97 group transition-all"
                  title="Cerrar navegación"
                >
                  <SidebarToggleIcon className="w-5 h-5 text-[#9CD01A]" active={true} />
                </button>

                <div className="text-right">
                  <span className="text-[11px] font-black tracking-[0.25em] text-[#9CD01A] uppercase block">
                    MASSA GROUP
                  </span>
                  <span className="text-[9px] font-mono text-white/40 tracking-wider">
                    PANEL ADMINISTRADOR // CONTROL
                  </span>
                </div>
              </div>

              {/* Lista Vertical con Ticks de Regla Arquitectónica CAD: INICIO, PROYECTOS y USUARIOS */}
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-6 px-3 sm:px-4 flex flex-col">
                
                <div className="text-[10px] font-mono tracking-widest text-white/30 uppercase px-3 mb-3">
                  // BARRA DE NAVEGACIÓN
                </div>

                <div className="space-y-2">
                  {/* Item 0: INICIO */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (currentTab !== 'inicio') onNavigateToHome();
                    }}
                    className={`w-full group flex items-center text-left py-3 px-2 rounded-xl transition-all cursor-pointer ${
                      currentTab === 'inicio' 
                        ? 'text-[#9CD01A] font-bold bg-[#9CD01A]/[0.08]' 
                        : 'text-white/60 hover:text-white/95 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                      {currentTab === 'inicio' ? (
                        <div className="w-8 h-[2px] bg-[#9CD01A] shadow-[0_0_8px_#9CD01A]" />
                      ) : (
                        <div className="w-3 h-[1px] bg-white/20 group-hover:w-5 group-hover:bg-[#9CD01A] transition-all" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-3 min-w-0 flex-1">
                      <span className={`text-xs font-mono shrink-0 ${
                        currentTab === 'inicio' ? 'text-[#9CD01A] font-bold' : 'text-white/30 group-hover:text-[#9CD01A]'
                      }`}>
                        00
                      </span>
                      <span className="text-sm tracking-widest uppercase font-extrabold truncate">
                        INICIO
                      </span>
                    </div>
                    {currentTab === 'inicio' && (
                      <span className="text-[10px] font-mono shrink-0 ml-2 px-2 py-0.5 rounded-full bg-[#9CD01A]/20 text-[#9CD01A]">
                        ACTUAL
                      </span>
                    )}
                  </button>

                  {/* Item 1: PROYECTOS */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (currentTab !== 'proyectos') onNavigateToProjects();
                    }}
                    className={`w-full group flex items-center text-left py-3 px-2 rounded-xl transition-all cursor-pointer ${
                      currentTab === 'proyectos' 
                        ? 'text-[#9CD01A] font-bold bg-[#9CD01A]/[0.08]' 
                        : 'text-white/60 hover:text-white/95 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                      {currentTab === 'proyectos' ? (
                        <div className="w-8 h-[2px] bg-[#9CD01A] shadow-[0_0_8px_#9CD01A]" />
                      ) : (
                        <div className="w-3 h-[1px] bg-white/20 group-hover:w-5 group-hover:bg-[#9CD01A] transition-all" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-3 min-w-0 flex-1">
                      <span className={`text-xs font-mono shrink-0 ${
                        currentTab === 'proyectos' ? 'text-[#9CD01A] font-bold' : 'text-white/30 group-hover:text-[#9CD01A]'
                      }`}>
                        01
                      </span>
                      <span className="text-sm tracking-widest uppercase font-extrabold truncate">
                        PROYECTOS
                      </span>
                    </div>
                    {currentTab === 'proyectos' ? (
                      <span className="text-[10px] font-mono shrink-0 ml-2 px-2 py-0.5 rounded-full bg-[#9CD01A]/20 text-[#9CD01A]">
                        ACTUAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono shrink-0 ml-2 px-2 py-0.5 rounded-full bg-white/5 text-white/35 group-hover:bg-[#9CD01A]/20 group-hover:text-[#9CD01A]">
                        {totalProjects}
                      </span>
                    )}
                  </button>

                  {/* Item 2: USUARIOS */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (currentTab !== 'usuarios') onNavigateToUsers();
                    }}
                    className={`w-full group flex items-center text-left py-3 px-2 rounded-xl transition-all cursor-pointer ${
                      currentTab === 'usuarios' 
                        ? 'text-[#9CD01A] font-bold bg-[#9CD01A]/[0.08]' 
                        : 'text-white/60 hover:text-white/95 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                      {currentTab === 'usuarios' ? (
                        <div className="w-8 h-[2px] bg-[#9CD01A] shadow-[0_0_8px_#9CD01A]" />
                      ) : (
                        <div className="w-3 h-[1px] bg-white/20 group-hover:w-5 group-hover:bg-[#9CD01A] transition-all" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-3 min-w-0 flex-1">
                      <span className={`text-xs font-mono shrink-0 ${
                        currentTab === 'usuarios' ? 'text-[#9CD01A] font-bold' : 'text-white/30 group-hover:text-[#9CD01A]'
                      }`}>
                        02
                      </span>
                      <span className="text-sm tracking-widest uppercase font-extrabold truncate">
                        USUARIOS
                      </span>
                    </div>
                    {currentTab === 'usuarios' ? (
                      <span className="text-[10px] font-mono shrink-0 ml-2 px-2 py-0.5 rounded-full bg-[#9CD01A]/20 text-[#9CD01A]">
                        ACTUAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono shrink-0 ml-2 px-2 py-0.5 rounded-full bg-white/5 text-white/35 group-hover:bg-[#9CD01A]/20 group-hover:text-[#9CD01A]">
                        PORTAL
                      </span>
                    )}
                  </button>
                </div>

                {/* Separador de regla */}
                <div className="my-5 px-2">
                  <div className="h-[1px] bg-gradient-to-r from-[#9CD01A]/30 via-white/10 to-transparent" />
                </div>

                {/* Acciones Secundarias en la barra lateral */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      onCreateProject();
                    }}
                    className="w-full group flex items-center text-left py-2 px-2 rounded-xl text-[#9CD01A] hover:bg-[#9CD01A]/10 transition-all cursor-pointer"
                  >
                    <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                      <Plus className="w-4 h-4 text-[#9CD01A]" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">Crear Nuevo Proyecto</span>
                  </button>

                  {isAdmin && onOpenVisits && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onOpenVisits();
                      }}
                      className="w-full group flex items-center text-left py-2 px-2 rounded-xl text-white/50 hover:text-white/90 hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                        <div className="w-3 h-[1px] bg-white/20 group-hover:w-5 group-hover:bg-white/60 transition-all" />
                      </div>
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="text-xs font-medium tracking-wide">Métricas & Visitas</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#9CD01A]/10 text-[#9CD01A] font-mono">KPI</span>
                      </div>
                    </button>
                  )}

                  {onSwitchRole && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onSwitchRole();
                      }}
                      className="w-full group flex items-center text-left py-2 px-2 rounded-xl text-[#9CD01A] hover:bg-[#9CD01A]/10 transition-all cursor-pointer"
                    >
                      <div className="w-10 shrink-0 flex items-center justify-start pr-2">
                        <div className="w-3 h-[1px] bg-[#9CD01A]/40 group-hover:w-5 group-hover:bg-[#9CD01A] transition-all" />
                      </div>
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="text-xs font-semibold tracking-wide">Ver Catálogo Público en Venta</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#9CD01A]/20 text-[#9CD01A] font-mono">EN VIVO</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Footer con atajo para salir */}
              <div className="p-4 sm:p-5 border-t border-white/[0.06] bg-[#0A0A0B] flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>ESC para cerrar</span>
                <span className="text-[#9CD01A]">PANEL ADMINISTRADOR MASSA</span>
              </div>
            </m.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
