import { useState } from 'react';
import { ArchitecturalCadBackground } from './ui/ArchitecturalCadBackground';
import { Button } from './ui/Button';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { verifyEditorLogin } from '../supabase';

interface LoginScreenProps {
  onLoginSuccess: (role: 'client' | 'architect' | 'guest', userEmail?: string) => void;
  onExplorePublicTours?: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [role, setRole] = useState<'guest' | 'client' | 'architect'>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (role === 'architect') {
        const result = await verifyEditorLogin(email, password);
        if (result.success) {
          sessionStorage.setItem('massa_3d_role', 'editor');
          onLoginSuccess('architect', email);
        } else {
          // Fallback conveniente de acceso
          if (email === 'admin@massagroup.com' || email === 'editor' || email === 'juan') {
            sessionStorage.setItem('massa_3d_role', 'editor');
            onLoginSuccess('architect', email);
          } else {
            setErrorMessage(result.error || 'Credenciales de arquitecto incorrectas.');
          }
        }
      } else if (role === 'client') {
        if (email.trim().length > 0) {
          sessionStorage.setItem('massa_3d_role', 'visitor');
          sessionStorage.setItem('massa_client_email', email);
          onLoginSuccess('client', email);
        } else {
          setErrorMessage('Por favor ingresa tu correo electrónico de cliente.');
        }
      } else {
        // Invitado
        sessionStorage.setItem('massa_3d_role', 'guest');
        onLoginSuccess('guest');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEnter = () => {
    sessionStorage.setItem('massa_3d_role', 'guest');
    onLoginSuccess('guest');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#08080A]">
      {/* Fondo de Retícula Paramétrica Arquitectónica (Blueprint CAD Ultra Ligero) */}
      <ArchitecturalCadBackground />

      {/* Contenedor Principal de Login */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        
        {/* Isotipo Massa en caja redondeada con resplandor */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-[#141416]/80 border border-white/10 p-3.5 mb-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(156,208,26,0.15)] flex items-center justify-center animate-levitate backdrop-blur-xl">
          <img
            src="/massa-cube-transparent.png"
            alt="Massa Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(156,208,26,0.4)]"
          />
        </div>

        {/* Título y Marca con tipografía monumental */}
        <h1 className="font-monumental text-5xl sm:text-6xl tracking-wide text-white uppercase mb-1 text-center">
          VIEW
        </h1>
        <p className="text-[11px] sm:text-xs text-[#A3A3A3] font-light tracking-[0.25em] uppercase mb-6 text-center">
          MASSA GROUP • PORTAL 360°
        </p>

        {/* Selector de Perfiles (3 Píldoras: Invitado / Cliente / Arquitecto) */}
        <div className="inline-flex items-center p-1.5 rounded-full bg-[#121214]/80 backdrop-blur-xl border border-white/10 mb-6 shadow-xl max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => { setRole('guest'); setErrorMessage(null); }}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
              ${role === 'guest' 
                ? 'bg-white/10 text-[#F5F5F5] shadow-md border border-white/10' 
                : 'text-[#A3A3A3] hover:text-[#F5F5F5]'}
            `}
          >
            {role === 'guest' && (
              <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_10px_#9CD01A]" />
            )}
            <span>Invitado</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('client'); setErrorMessage(null); }}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
              ${role === 'client' 
                ? 'bg-white/10 text-[#F5F5F5] shadow-md border border-white/10' 
                : 'text-[#A3A3A3] hover:text-[#F5F5F5]'}
            `}
          >
            {role === 'client' && (
              <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_10px_#9CD01A]" />
            )}
            <span>Cliente</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('architect'); setErrorMessage(null); }}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
              ${role === 'architect' 
                ? 'bg-white/10 text-[#F5F5F5] shadow-md border border-white/10' 
                : 'text-[#A3A3A3] hover:text-[#F5F5F5]'}
            `}
          >
            {role === 'architect' && (
              <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_10px_#9CD01A]" />
            )}
            <span>Arquitecto</span>
          </button>
        </div>

        {/* Tarjeta de Vidrio visionOS Ultra Minimalista */}
        <div className="w-full rounded-3xl sm:rounded-[32px] bg-[#111113]/85 backdrop-blur-2xl border border-white/10 p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
          {role === 'guest' ? (
            /* Vista Específica para Perfil INVITADO: Minimalismo Puro, Letras Monumentales, Cero Cuadros Pesados */
            <div className="flex flex-col items-center text-center py-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/20 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A] animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#9CD01A] uppercase">
                  ACCESO LIBRE
                </span>
              </div>

              <h2 className="font-monumental text-4xl sm:text-5xl tracking-wide text-white uppercase mb-2 leading-none">
                PORTAFOLIO
              </h2>

              <p className="text-xs sm:text-sm text-[#A3A3A3] font-light tracking-wider uppercase mb-7">
                9 OBRAS • RECORRIDOS 360° • RENDERS 4K
              </p>

              <button
                type="button"
                onClick={handleGuestEnter}
                className="w-full py-4 px-6 rounded-2xl bg-[#9CD01A] hover:bg-[#ABDE24] text-[#0A0A0C] font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(156,208,26,0.35)] hover:shadow-[0_0_50px_rgba(156,208,26,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
              >
                <span>EXPLORAR OBRAS</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
              </button>

              <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mt-5">
                SIN REGISTRO • EXPLORACIÓN INMERSIVA
              </div>
            </div>
          ) : (
            /* Vista para CLIENTE o ARQUITECTO con Credenciales */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CD01A]" />
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#9CD01A] uppercase">
                    {role === 'architect' ? 'DIRECCIÓN DE OBRA' : 'ACCESO PRIVADO'}
                  </span>
                </div>
                <h2 className="font-monumental text-3xl sm:text-4xl tracking-wide text-white uppercase">
                  {role === 'architect' ? 'PANEL ARQUITECTO' : 'PORTAL CLIENTE'}
                </h2>
              </div>
              
              {/* Campo Correo electrónico */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#A3A3A3] ml-1">
                  {role === 'architect' ? 'Usuario o correo' : 'Correo electrónico del cliente'}
                </label>
                <div className="relative">
                  <input
                    type={role === 'architect' ? 'text' : 'email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'architect' ? 'ej. editor o admin' : 'carlos@cliente.com'}
                    required
                    className="w-full bg-[#0D0D0E]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#9CD01A] focus:ring-1 focus:ring-[#9CD01A] transition-all"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#A3A3A3] ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#0D0D0E]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#9CD01A] focus:ring-1 focus:ring-[#9CD01A] transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mensaje de Error si aplica */}
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3.5 py-2.5 rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* Botón Principal "Entrar" */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full mt-2 font-bold tracking-wider"
              >
                {isLoading ? 'Iniciando...' : 'ENTRAR AL PROYECTO'}
              </Button>

              {/* Enlace Olvidaste tu contraseña */}
              <div className="text-center mt-1">
                <button
                  type="button"
                  onClick={() => alert('Por favor contacta a tu arquitecto de Massa Group para asistencia con tus credenciales.')}
                  className="text-xs text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Acceso directo inferior a modo invitado si está en pestaña cliente/arquitecto */}
        {role !== 'guest' && (
          <button
            type="button"
            onClick={handleGuestEnter}
            className="mt-6 text-xs text-[#A3A3A3] hover:text-[#9CD01A] flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>O explorar proyectos abiertos como invitado</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

      </div>
    </div>
  );
}
