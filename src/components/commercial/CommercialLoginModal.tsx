import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, KeyRound, Mail, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../lib/authService';

interface CommercialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: 'architect' | 'client' | 'guest', userEmail?: string) => void;
}

export function CommercialLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: CommercialLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);

  // Recuperación de contraseña
  const [isForgot, setIsForgot] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Único inicio de sesión conservado: Administrador (rol arquitecto)
      const authResult = await authService.signIn(email, password, 'architect');

      if (authResult.success && authResult.user) {
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess('architect', authResult.user?.name);
          onClose();
        }, 650);
        return;
      }

      setErrorMessage(
        authResult.error || 'Credenciales de administrador incorrectas. Verifica tu correo y contraseña.'
      );
      triggerShake();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryStatus(null);
    try {
      const res = await authService.resetPassword(recoveryEmail);
      setRecoveryStatus(res);
    } catch (err: any) {
      setRecoveryStatus({
        success: false,
        message: err.message || 'Error al enviar recuperación.'
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl">
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-md bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(156,208,26,0.12)] overflow-hidden transition-all ${shakeCard ? 'animate-shake' : ''}`}
        >
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer active:scale-95 z-20"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo Massa & Encabezado */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1A1E] border border-white/10 p-2 mb-3 flex items-center justify-center shadow-[0_0_20px_rgba(156,208,26,0.2)] group hover:border-[#9CD01A]/50 transition-colors">
              <img
                src="/massa-cube-transparent.png"
                alt="Massa"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(156,208,26,0.4)] group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#9CD01A] uppercase">
              MASSA VIEW • PANEL DE CONTROL
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              Acceso Administrador
            </h3>
            <p className="text-xs text-white/50 mt-1 max-w-xs">
              Gestión comercial, edición de proyectos en venta, recorridos 3D y renders de la web
            </p>
          </div>

          {/* ESTADO 1: ÉXITO CINEMÁTICO */}
          {isSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-350">
              <div className="w-16 h-16 rounded-full bg-[#9CD01A]/20 border border-[#9CD01A]/60 flex items-center justify-center shadow-[0_0_30px_rgba(156,208,26,0.4)] animate-glow-pulse">
                <CheckCircle2 className="w-9 h-9 text-[#9CD01A]" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-wider">
                  Acceso Autorizado
                </h4>
                <p className="text-xs text-white/60 mt-1">
                  Abriendo consola de administración ejecutiva...
                </p>
              </div>
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                <div className="w-full h-full bg-[#9CD01A] rounded-full animate-pulse" />
              </div>
            </div>
          ) : isForgot ? (
            /* ESTADO 2: RECUPERACIÓN DE CONTRASEÑA */
            <form onSubmit={handlePasswordRecovery} className="space-y-4">
              <p className="text-xs text-white/70">
                Ingresa tu correo de administrador para recibir el enlace de recuperación.
              </p>
              <div>
                <label className="block text-[11px] font-mono uppercase text-white/60 mb-1.5 font-semibold">
                  Correo Registrado
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
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
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

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgot(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition cursor-pointer active:scale-95"
                >
                  Volver al Login
                </button>
                <button
                  type="submit"
                  disabled={recoveryLoading || !recoveryEmail.trim()}
                  className="flex-1 py-3 rounded-xl bg-[#9CD01A] hover:bg-[#aee620] text-black text-xs font-bold transition shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {recoveryLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar Enlace</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ESTADO 3: FORMULARIO PRINCIPAL DE LOGIN */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Banner de Error con icono */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Input Correo */}
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

              {/* Input Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/60 font-semibold">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
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

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full py-3.5 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-extrabold text-xs tracking-wider uppercase transition-all duration-200 shadow-[0_4px_20px_rgba(156,208,26,0.35)] hover:shadow-[0_4px_30px_rgba(156,208,26,0.6)] hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 group"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Verificando Administrador...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar como Administrador</span>
                    <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[10px] text-white/40 font-mono tracking-wider">
                  ACCESO RESTRINGIDO AL EQUIPO ADMINISTRATIVO MASSA
                </span>
              </div>
            </form>
          )}
        </m.div>
      </div>
    </AnimatePresence>
  );
}
