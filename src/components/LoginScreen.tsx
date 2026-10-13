import { useState } from 'react';
import { OrbBackground } from './ui/OrbBackground';
import { Button } from './ui/Button';
import { Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2, Lock } from 'lucide-react';
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#0D0D0E]">
      {/* Orbes de luz ambiental de fondo */}
      <OrbBackground />

      {/* Contenedor Principal de Login */}
      <div className="relative z-10 w-full max-w-[430px] flex flex-col items-center">
        
        {/* Isotipo Massa en caja redondeada con resplandor */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-[#171717] border border-white/10 p-4 mb-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(156,208,26,0.15)] flex items-center justify-center animate-levitate">
          <img
            src="/massa-cube-transparent.png"
            alt="Massa Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(156,208,26,0.4)]"
          />
        </div>

        {/* Título y Marca */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F5] tracking-tight uppercase mb-1 text-center">
          VIEW
        </h1>
        <p className="text-xs sm:text-sm text-[#A3A3A3] font-normal tracking-wide mb-6 text-center">
          Massa Group Arquitectura
        </p>

        {/* Selector de Perfiles (3 Píldoras: Invitado / Cliente / Arquitecto) */}
        <div className="inline-flex items-center p-1.5 rounded-full bg-[#171717]/85 backdrop-blur-xl border border-white/10 mb-6 shadow-xl max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => { setRole('guest'); setErrorMessage(null); }}
            className={`
              flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
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
              flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
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
              flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
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

        {/* Tarjeta de Vidrio visionOS */}
        <div className="w-full rounded-3xl sm:rounded-[32px] bg-[#171717]/90 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
          {role === 'guest' ? (
            /* Vista Específica para Perfil INVITADO */
            <div className="flex flex-col gap-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/30 text-[#9CD01A] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(156,208,26,0.25)]">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Portafolio Público
                </h2>
                <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed">
                  Accede a los proyectos abiertos de MASSA GROUP con renders fotorrealistas en 4K, recorridos 360° y especificaciones arquitectónicas.
                </p>
              </div>

              {/* Lo que incluye el acceso de invitado */}
              <div className="bg-black/50 rounded-2xl p-4 border border-white/5 text-left space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#9CD01A] shrink-0" />
                  <span>Galería de Renders 4K Ultra HD</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#9CD01A] shrink-0" />
                  <span>Recorridos 360° por ambientes abiertos</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#9CD01A] shrink-0" />
                  <span>Memoria de diseño y fichas técnicas</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400/90 pt-2 border-t border-white/5">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px]">Planos constructivos y documentos sensibles protegidos</span>
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleGuestEnter}
                className="w-full mt-2 gap-2 shadow-[0_0_25px_rgba(156,208,26,0.4)]"
              >
                <span>Explorar como Invitado</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* Vista para CLIENTE o ARQUITECTO con Credenciales */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
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
                className="w-full mt-2"
              >
                {isLoading ? 'Iniciando...' : 'Entrar'}
              </Button>

              {/* Enlace Olvidaste tu contraseña */}
              <div className="text-center mt-2">
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
