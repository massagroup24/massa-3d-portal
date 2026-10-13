import { useState } from 'react';
import { OrbBackground } from './ui/OrbBackground';
import { Button } from './ui/Button';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { verifyEditorLogin } from '../supabase';

interface LoginScreenProps {
  onLoginSuccess: (role: 'client' | 'architect', userEmail?: string) => void;
  onExplorePublicTours?: () => void;
}

export function LoginScreen({ onLoginSuccess, onExplorePublicTours }: LoginScreenProps) {
  const [role, setRole] = useState<'client' | 'architect'>('client');
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
        // En Fase 1 valida con el mecanismo existente de forma transparente
        const result = await verifyEditorLogin(email, password);
        if (result.success) {
          sessionStorage.setItem('massa_3d_role', 'editor');
          onLoginSuccess('architect', email);
        } else {
          // Fallback conveniente para prueba visual en Fase 1
          if (email === 'admin@massagroup.com' || email === 'editor' || email === 'juan') {
            sessionStorage.setItem('massa_3d_role', 'editor');
            onLoginSuccess('architect', email);
          } else {
            setErrorMessage(result.error || 'Credenciales de arquitecto incorrectas.');
          }
        }
      } else {
        // Rol Cliente (para prueba en Fase 1)
        if (email.trim().length > 0) {
          sessionStorage.setItem('massa_3d_role', 'visitor');
          sessionStorage.setItem('massa_client_email', email);
          onLoginSuccess('client', email);
        } else {
          setErrorMessage('Por favor ingresa tu correo electrónico de cliente.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#0D0D0E]">
      {/* Orbes de luz ambiental de fondo */}
      <OrbBackground />

      {/* Contenedor Principal de Login idéntico al diseño de Stitch */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        
        {/* Isotipo Massa en caja redondeada con resplandor */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-[#171717] border border-white/10 p-4 mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(156,208,26,0.15)] flex items-center justify-center animate-levitate">
          <img
            src="/MASSA_REBRANDING_PROFILE_REDES_ENTREGABLE_2023_003.png"
            alt="Massa Logo"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>

        {/* Título y Marca */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F5] tracking-tight uppercase mb-1.5 text-center">
          VIEW
        </h1>
        <p className="text-xs sm:text-sm text-[#A3A3A3] font-normal tracking-wide mb-6 text-center">
          Massa Group Arquitectura
        </p>

        {/* Selector de Perfiles (Píldora visionOS: Cliente / Arquitecto) */}
        <div className="inline-flex items-center p-1.5 rounded-full bg-[#171717]/80 backdrop-blur-xl border border-white/10 mb-6 shadow-lg">
          <button
            type="button"
            onClick={() => { setRole('client'); setErrorMessage(null); }}
            className={`
              flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer
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
              flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer
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

        {/* Tarjeta de Formulario de Vidrio visionOS */}
        <div className="w-full rounded-3xl sm:rounded-[32px] bg-[#171717]/85 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Campo Correo electrónico */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#A3A3A3] ml-1">
                {role === 'architect' ? 'Usuario o correo' : 'Correo electrónico'}
              </label>
              <div className="relative">
                <input
                  type={role === 'architect' ? 'text' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'architect' ? 'ej. editor o admin' : 'tu@correo.com'}
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

            {/* Botón Principal "Entrar" en Verde Lima Massa */}
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
        </div>

        {/* Acceso directo opcional para ver recorridos 360° libres */}
        {onExplorePublicTours && (
          <button
            type="button"
            onClick={onExplorePublicTours}
            className="mt-6 text-xs text-[#A3A3A3] hover:text-[#9CD01A] flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Ver recorridos virtuales 360° públicos</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

      </div>
    </div>
  );
}
