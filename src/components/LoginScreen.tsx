import { useState } from 'react';
import { ArchitecturalCadBackground } from './ui/ArchitecturalCadBackground';
import { Eye, EyeOff, ArrowRight, Mail, KeyRound, ArrowLeft, Shield, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../lib/authService';

interface LoginScreenProps {
  onLoginSuccess: (role: 'architect' | 'client' | 'guest', userEmail?: string) => void;
  onExplorePublicTours?: () => void;
}

export function LoginScreen({ onLoginSuccess, onExplorePublicTours }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);

  // Estado para recuperación de contraseña
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<{ success: boolean; message: string } | null>(null);

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Único rol de acceso: Administrador ('architect')
      const authResult = await authService.signIn(email, password, 'architect');

      if (authResult.success && authResult.user) {
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess('architect', authResult.user?.name);
        }, 700);
        return;
      }

      setErrorMessage(
        authResult.error || 'Credenciales incorrectas. Solo administradores autorizados pueden acceder.'
      );
      triggerShake();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor de autenticación.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryStatus(null);
    setRecoveryLoading(true);

    try {
      const result = await authService.resetPassword(recoveryEmail);
      setRecoveryStatus(result);
    } catch (err: any) {
      setRecoveryStatus({
        success: false,
        message: err.message || 'Error enviando solicitud de recuperación.',
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-[#08080A]">
      {/* Fondo de Retícula Paramétrica Arquitectónica */}
      <ArchitecturalCadBackground />

      {/* Contenedor Principal de Login con Shake reactivo en caso de error */}
      <div className={`relative z-10 w-full max-w-[440px] flex flex-col items-center transition-transform ${shakeCard ? 'animate-shake' : ''}`}>
        
        {/* Isotipo Massa en caja redondeada con resplandor */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-[#141416]/90 border border-white/10 p-2.5 sm:p-3 mb-3 sm:mb-4 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.2)] flex items-center justify-center animate-levitate backdrop-blur-xl shrink-0 group hover:border-[#9CD01A]/50 transition-colors">
          <img
            src="/massa-cube-transparent.png"
            alt="Massa Logo"
            className="w-full h-full max-w-[48px] max-h-[48px] sm:max-w-[54px] sm:max-h-[54px] object-contain filter drop-shadow-[0_4px_12px_rgba(156,208,26,0.45)] group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Título y Subtítulo de ultralujo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 text-[#9CD01A] text-[10px] font-mono font-bold tracking-widest uppercase mb-2">
            <Shield className="w-3 h-3 text-[#9CD01A]" />
            <span>PANEL DE ADMINISTRACIÓN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Acceso Administrador
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-xs mx-auto">
            Edición integral de proyectos en venta, recorridos 3D y renders
          </p>
        </div>

        {/* Tarjeta de Formulario con Glassmorphism */}
        <div className="w-full bg-[#121214]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(156,208,26,0.1)] transition-all">
          
          {/* ESTADO 1: ÉXITO CINEMÁTICO */}
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-400">
              <div className="w-16 h-16 rounded-full bg-[#9CD01A]/20 border border-[#9CD01A]/60 flex items-center justify-center shadow-[0_0_30px_rgba(156,208,26,0.4)] animate-glow-pulse">
                <CheckCircle2 className="w-9 h-9 text-[#9CD01A]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Acceso Concedido
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  Iniciando sesión segura en el panel de control...
                </p>
              </div>
              <div className="w-36 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                <div className="w-full h-full bg-[#9CD01A] rounded-full animate-pulse" />
              </div>
            </div>
          ) : showForgotPassword ? (
            /* ESTADO 2: RECUPERACIÓN DE CONTRASEÑA */
            <form onSubmit={handlePasswordRecovery} className="space-y-4">
              <div className="text-left mb-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-xs text-[#9CD01A] hover:underline flex items-center gap-1 cursor-pointer font-bold mb-2 group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  <span>Volver al Inicio de Sesión</span>
                </button>
                <h2 className="text-lg font-bold text-white">Recuperar Contraseña</h2>
                <p className="text-xs text-white/60 mt-1">
                  Ingresa tu correo de administrador para recibir el enlace de restablecimiento.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1.5 font-semibold">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    disabled={recoveryLoading}
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="admin@massagroup.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9CD01A] focus:ring-2 focus:ring-[#9CD01A]/20 transition disabled:opacity-50"
                  />
                </div>
              </div>

              {recoveryStatus && (
                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                  recoveryStatus.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  {recoveryStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{recoveryStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={recoveryLoading || !recoveryEmail.trim()}
                className="w-full py-3.5 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-extrabold text-xs tracking-wider uppercase transition-all duration-200 shadow-[0_4px_20px_rgba(156,208,26,0.35)] hover:shadow-[0_4px_30px_rgba(156,208,26,0.55)] hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {recoveryLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Enviando Solicitud...</span>
                  </>
                ) : (
                  <span>Enviar Enlace de Recuperación</span>
                )}
              </button>
            </form>
          ) : (
            /* ESTADO 3: FORMULARIO PRINCIPAL DE LOGIN */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error Banner con icono y borde rojo */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Correo Electrónico */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1.5 font-semibold">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-[#9CD01A] transition-colors" />
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@massagroup.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9CD01A] focus:ring-2 focus:ring-[#9CD01A]/20 transition disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/60 font-semibold">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[10px] text-[#9CD01A] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative group">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-[#9CD01A] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9CD01A] focus:ring-2 focus:ring-[#9CD01A]/20 transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer transition-colors p-1"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón de Ingreso con Estados Táctiles */}
              <button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full py-3.5 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-extrabold text-xs tracking-wider uppercase transition-all duration-200 shadow-[0_4px_20px_rgba(156,208,26,0.35)] hover:shadow-[0_4px_30px_rgba(156,208,26,0.6)] hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 group"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Verificando Credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión como Administrador</span>
                    <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Enlace para volver a la plataforma pública */}
          {onExplorePublicTours && !isSuccess && (
            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <button
                type="button"
                onClick={onExplorePublicTours}
                className="text-xs text-white/60 hover:text-[#9CD01A] transition flex items-center justify-center gap-1.5 mx-auto font-medium cursor-pointer group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>Volver al Catálogo Público de Proyectos en Venta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
