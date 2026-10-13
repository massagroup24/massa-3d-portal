import type { ReactNode } from 'react';
import { Header } from '../ui/Header';
import { Dock, NavTab } from '../ui/Dock';
import { MobileNavBar } from '../ui/MobileNavBar';
import { OrbBackground } from '../ui/OrbBackground';

interface PortalLayoutProps {
  children: ReactNode;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  projectName?: string;
  userRole?: 'client' | 'architect';
  onLogout?: () => void;
  hideNav?: boolean;
}

export function PortalLayout({
  children,
  activeTab,
  onSelectTab,
  projectName = 'Villa Serena',
  userRole = 'client',
  onLogout,
  hideNav = false,
}: PortalLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#0D0D0E] text-[#F5F5F5] flex flex-col overflow-x-hidden selection:bg-[#9CD01A] selection:text-[#0D0D0E]">
      {/* Fondo de Orbes Ambientales */}
      <OrbBackground />

      {/* Cabecera Corporativa */}
      <Header
        projectName={projectName}
        userRole={userRole}
        onLogout={onLogout}
      />

      {/* Área Principal de Contenido con Espaciado para el Dock / Barra Móvil */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-28 md:pb-24">
        {children}
      </main>

      {/* Navegación Adaptativa: Dock en Escritorio y Barra en Móvil */}
      {!hideNav && (
        <>
          {/* Dock centrado en escritorio */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <Dock activeTab={activeTab} onSelectTab={onSelectTab} />
          </div>

          {/* Barra inferior de vidrio en móvil */}
          <MobileNavBar activeTab={activeTab} onSelectTab={onSelectTab} />
        </>
      )}
    </div>
  );
}
