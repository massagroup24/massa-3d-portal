import { useState, useEffect } from 'react';
import { Smartphone, X, Share2, PlusSquare } from 'lucide-react';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si ya está en modo standalone (instalada en escritorio)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsInstalled(standalone);

    // Detectar si el usuario ya cerró el banner en esta sesión o anteriormente
    const isDismissed = localStorage.getItem('massa_3d_pwa_dismissed') === 'true';

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (!standalone && !isDismissed) {
      // En iOS mostramos el banner tras 2 segundos si no está instalada
      if (isIosDevice) {
        const timer = setTimeout(() => setShowBanner(true), 2000);
        return () => clearTimeout(timer);
      }
    }

    // Capturar evento nativo beforeinstallprompt en Android / Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standalone && !isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem('massa_3d_pwa_dismissed', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* Banner flotante de instalación */}
      <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm animate-in slide-in-from-bottom duration-500">
        <div className="bg-[#0b140d]/95 border border-[#99cc33]/40 p-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] flex items-center justify-between gap-3 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/massa-cube-transparent.png"
              alt="Massa 3D Logo"
              className="h-11 w-11 rounded-xl object-contain bg-white/5 p-1 border border-white/10 shrink-0 shadow-sm"
            />
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[9px] font-black text-[#99cc33] uppercase tracking-widest">
                <Smartphone size={11} /> App Nativa Móvil
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wide truncate">
                Instalar Massa 3D
              </h4>
              <p className="text-[10px] text-gray-300 font-medium leading-tight">
                Añadir al escritorio de tu celular
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-[#99cc33] hover:bg-[#a6db38] text-black px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(153,204,51,0.4)] transition-all cursor-pointer"
            >
              {isIOS ? 'Instalar' : 'Instalar'}
            </button>
            <button
              onClick={handleDismiss}
              title="Cerrar"
              className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Guía para iPhone / iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#111913] border border-[#99cc33]/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#99cc33] font-black text-xs uppercase tracking-widest">
                <Smartphone size={16} /> Instalar en iPhone / iPad
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/10">
              <img
                src="/massa-cube-transparent.png"
                alt="Logo App"
                className="w-12 h-12 rounded-lg object-contain bg-white/5 p-1"
              />
              <div>
                <h5 className="text-white font-bold text-xs">Massa Group 3D</h5>
                <p className="text-[11px] text-gray-400">Recorrido Virtual 360°</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Sigue estos 2 rápidos pasos en Safari para añadir la app a tu escritorio:
            </p>

            <ol className="text-xs text-white space-y-3 font-bold">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#99cc33]/20 text-[#99cc33] flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Toca el ícono de <strong className="text-[#99cc33]">Compartir</strong> abajo en
                  tu navegador Safari (<Share2 className="inline w-3.5 h-3.5" />).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#99cc33]/20 text-[#99cc33] flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Desliza y selecciona <strong className="text-[#99cc33]">Añadir a pantalla de inicio</strong> (<PlusSquare className="inline w-3.5 h-3.5" />).
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-[#99cc33] text-black font-black text-xs uppercase tracking-widest py-3 rounded-xl mt-2 hover:bg-[#a6db38] transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
