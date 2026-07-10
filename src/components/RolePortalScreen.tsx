import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  ArrowRight, 
  Compass, 
  Sparkles, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { verifyEditorLogin } from '../supabase';

interface RolePortalScreenProps {
  onSelectVisitor: () => void;
  onLoginEditor: () => void;
}

export function RolePortalScreen({ onSelectVisitor, onLoginEditor }: RolePortalScreenProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const handleEditorLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingLogin(true);

    try {
      const result = await verifyEditorLogin(username, password);
      if (result.success) {
        localStorage.setItem('massa_3d_role', 'editor');
        if (result.user) {
          localStorage.setItem('massa_3d_username', result.user.username);
          localStorage.setItem('massa_3d_name', result.user.name);
        }
        onLoginEditor();
      } else {
        setError(result.error || 'Usuario o contraseña incorrectos.');
      }
    } catch (err: any) {
      setError('Error validando credenciales: ' + err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleVisitorClick = () => {
    try {
      localStorage.setItem('massa_3d_role', 'visitor');
    } catch (err) {
      console.error(err);
    }
    onSelectVisitor();
  };

  return (
    <div className="min-h-screen w-full bg-[#06060a] text-white flex flex-col justify-between relative overflow-hidden selection:bg-[#99cc33] selection:text-black font-sans">
      
      {/* Luces Ambientales y Grid Arquitectónico */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_900px_at_50%_30%,rgba(153,204,51,0.16),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Cabecera Corporativa */}
      <header className="w-full max-w-7xl mx-auto px-6 py-7 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shadow-xl">
            <img 
              src="/MASSA_REBRANDING_PROFILE_REDES_ENTREGABLE_2023_003.png" 
              alt="Massa Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <span className="block text-[10px] font-black tracking-[0.3em] text-[#99cc33] uppercase">
              MASSA GROUP INGENIERÍA
            </span>
            <span className="block text-xs sm:text-sm font-black tracking-wide text-white uppercase">
              PORTAL INMERSIVO 360°
            </span>
          </div>
        </div>

        {/* Botón pequeño de Inicio de Sesión arriba a la derecha */}
        <button
          onClick={() => setShowLoginModal(true)}
          className="bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-[#99cc33]/40 text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all group"
          title="Iniciar Sesión (Editor / Admin)"
        >
          <Lock className="w-3 h-3 text-[#99cc33] group-hover:scale-110 transition-transform" />
          <span>Login Editor</span>
        </button>
      </header>

      {/* Contenido Principal - Héroe Central de Bienvenida */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10 max-w-4xl mx-auto w-full text-center">
        
        {/* Insignia Premium */}
        <div className="inline-flex items-center gap-2 bg-[#99cc33]/10 border border-[#99cc33]/30 px-4 py-1.5 rounded-full text-[#99cc33] text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_25px_rgba(153,204,51,0.2)] animate-in fade-in slide-in-from-top duration-700">
          <Sparkles className="w-3.5 h-3.5" /> Arquitectura & Recorridos Virtuales
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white uppercase leading-[1.08] mb-6 max-w-3xl">
          EXPLORA EL PORTAFOLIO <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#99cc33] via-green-400 to-emerald-400 drop-shadow-[0_0_35px_rgba(153,204,51,0.35)]">
            MASSA 360°
          </span>
        </h1>

        {/* Subtítulo Descriptivo */}
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-12">
          Bienvenido a la experiencia interactiva de visualización arquitectónica. Sumérgete en recorridos virtuales 360° de alta fidelidad desde cualquier dispositivo móvil o escritorio.
        </p>

        {/* ÚNICO BOTÓN GIGANTE EN EL CENTRO: VER PROYECTOS 360 */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleVisitorClick}
            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#99cc33] via-[#a6db38] to-green-500 hover:from-[#a6db38] hover:to-emerald-400 text-black font-black text-sm sm:text-base md:text-lg uppercase tracking-widest px-9 sm:px-12 py-5 sm:py-6 rounded-2xl shadow-[0_0_45px_rgba(153,204,51,0.45)] hover:shadow-[0_0_65px_rgba(153,204,51,0.65)] transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-[#99cc33]"
          >
            <Compass className="w-6 h-6 animate-spin-slow group-hover:rotate-45 transition-transform duration-500" />
            <span>VER PROYECTOS 360°</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
          </button>
          
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-2">
            Acceso Libre al Catálogo Virtual
          </span>
        </div>

      </main>

      {/* Pie de Página */}
      <footer className="w-full text-center py-6 px-4 border-t border-white/5 text-xs text-gray-500 font-mono">
        © {new Date().getFullYear()} MASSA GROUP • SISTEMA DE RECORRIDOS VIRTUALES 360°
      </footer>

      {/* MODAL DE INICIO DE SESIÓN PARA EL EDITOR */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0e110f] border border-[#99cc33]/40 rounded-3xl p-7 max-w-md w-full shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative animate-in zoom-in-95 duration-300"
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-[#99cc33]/20 border border-[#99cc33]/40 flex items-center justify-center text-[#99cc33]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white uppercase tracking-wide">
                    Acceso de Editor
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Introduce tus credenciales corporativas
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de Autenticación */}
            <form onSubmit={handleEditorLoginSubmit} className="space-y-4">
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Usuario o Correo
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. editor"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#99cc33] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#99cc33] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl border border-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingLogin}
                  className="flex-1 bg-[#99cc33] hover:bg-[#a6db38] disabled:opacity-60 text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-[0_0_20px_rgba(153,204,51,0.4)] transition-all"
                >
                  {loadingLogin ? 'Verificando...' : 'Entrar como Editor'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
