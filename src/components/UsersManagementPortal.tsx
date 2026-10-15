import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Shield, 
  RefreshCw, 
  AlertCircle,
  UserPlus,
  Edit2,
  Check,
  Building2,
  User as UserIcon,
  Search,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  MassaUser, 
  UserRole, 
  AllowedProfile, 
  getMassaUsers, 
  saveMassaUser, 
  deleteMassaUser 
} from '../supabase';
import { ArchitectHeader } from './layout/ArchitectHeader';

interface UsersManagementPortalProps {
  onBackToObras?: () => void;
  onBackToHome?: () => void;
  onNavigateToProjects?: () => void;
  onLogout?: () => void;
  currentUserName?: string;
  onUserSaved?: () => void;
  totalProjects?: number;
  onCreateProject?: () => void;
}

export function UsersManagementPortal({ 
  onBackToObras, 
  onBackToHome,
  onNavigateToProjects,
  onLogout,
  currentUserName,
  onUserSaved,
  totalProjects = 2,
  onCreateProject
}: UsersManagementPortalProps) {
  const handleGoBack = () => {
    if (onBackToHome) onBackToHome();
    else if (onBackToObras) onBackToObras();
  };
  const [users, setUsers] = useState<MassaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'architect' | 'client' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Form state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('architect');
  const [allowedProfile, setAllowedProfile] = useState<AllowedProfile>('architect');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMassaUsers();
      setUsers(data);
    } catch (err: any) {
      setError('No se pudieron sincronizar los usuarios desde la base de datos de Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Al cambiar el rol en el formulario, sugerir el perfil permitido
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'client') {
      setAllowedProfile('client');
    } else if (newRole === 'admin') {
      setAllowedProfile('both');
    } else {
      setAllowedProfile('architect');
    }
  };

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setUsername('');
    setPassword('');
    setName('');
    setRole('architect');
    setAllowedProfile('architect');
    setActive(true);
    setError(null);
    setSuccessMsg(null);
    setShowForm(true);
    // Scroll suave hacia el formulario
    setTimeout(() => {
      document.getElementById('user-form-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpenEdit = (user: MassaUser) => {
    setEditingUserId(user.id);
    setUsername(user.username);
    setPassword('');
    setName(user.name);
    setRole(user.role || 'architect');
    setAllowedProfile(user.allowed_profile || (user.role === 'client' ? 'client' : user.role === 'admin' ? 'both' : 'architect'));
    setActive(user.active ?? true);
    setError(null);
    setSuccessMsg(null);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('user-form-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) {
      setError('El usuario de acceso y el nombre completo son campos obligatorios.');
      return;
    }
    if (!editingUserId && !password.trim()) {
      setError('Para usuarios nuevos es obligatorio asignar una contraseña.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await saveMassaUser({
        ...(editingUserId ? { id: editingUserId } : {}),
        username: username.trim(),
        name: name.trim(),
        password: password.trim() || undefined,
        role,
        allowed_profile: allowedProfile,
        active
      });

      // Si el usuario modificado es el usuario actualmente en sesión, actualizar sessionStorage
      const currentStoredUsername = sessionStorage.getItem('massa_3d_username');
      if (currentStoredUsername && currentStoredUsername.toLowerCase() === username.trim().toLowerCase()) {
        sessionStorage.setItem('massa_3d_name', name.trim());
      }

      setSuccessMsg(editingUserId ? `Usuario "${name.trim()}" modificado exitosamente.` : `Usuario "${name.trim()}" registrado en la nube.`);
      setShowForm(false);
      await fetchUsers();
      if (onUserSaved) onUserSaved();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el usuario en Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, targetUsername: string, targetName: string) => {
    if (['juan', 'admin'].includes(targetUsername.toLowerCase())) {
      alert('Las cuentas principales de dirección técnica y administración general están protegidas del sistema.');
      return;
    }

    const confirmDelete = window.confirm(
      `¿Deseas eliminar permanentemente a "${targetName}" (@${targetUsername})?\nEsta cuenta ya no podrá iniciar sesión en ningún portal.`
    );
    if (!confirmDelete) return;

    try {
      await deleteMassaUser(id);
      setSuccessMsg(`Usuario "${targetName}" eliminado correctamente de la base de datos.`);
      await fetchUsers();
      if (onUserSaved) onUserSaved();
    } catch (err: any) {
      alert('Error eliminando usuario: ' + err.message);
    }
  };

  // Filtrado reactivo
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query));
    
    if (!matchesSearch) return false;
    if (filterRole === 'architect') return u.role === 'architect' || u.role === 'editor';
    if (filterRole === 'client') return u.role === 'client';
    if (filterRole === 'admin') return u.role === 'admin';
    return true;
  });

  const totalUsers = users.length;
  const architectCount = users.filter(u => u.role === 'architect' || u.role === 'editor').length;
  const clientCount = users.filter(u => u.role === 'client').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.active !== false).length;

  return (
    <div className="w-full min-h-screen bg-[#0D0D0E] text-white selection:bg-[#9CD01A] selection:text-[#0D0D0E] font-sans relative overflow-x-hidden pb-24">
      {/* Fondo de rejilla CAD y halo de iluminación */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(163,230,53,0.1),rgba(255,255,255,0)_70%)] z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none" />

      {/* Executive Studio Navbar Universal con Drawer de Navegación por Isotipo */}
      <ArchitectHeader
        currentTab="usuarios"
        totalProjects={totalProjects}
        onNavigateToHome={handleGoBack}
        onNavigateToProjects={onNavigateToProjects || handleGoBack}
        onNavigateToUsers={() => {}}
        onCreateProject={onCreateProject || (() => {})}
        onLogout={onLogout}
      />

      {/* Contenido Principal del Portal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 relative z-10">
        
        {/* Hero Monumental del Portal de Usuarios */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#9CD01A]/10 border border-[#9CD01A]/30 px-4 py-1.5 rounded-full mb-5 backdrop-blur-md shadow-[0_0_20px_rgba(156,208,26,0.15)]">
            <ShieldCheck className="w-4 h-4 text-[#9CD01A]" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#9CD01A] uppercase">
              PORTAL DE ADMINISTRACIÓN DE USUARIOS • MASSA VIEW{currentUserName ? ` • SESIÓN: ${currentUserName}` : ''}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-4">
            GESTIÓN DE USUARIOS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-green-400 to-emerald-500 drop-shadow-[0_0_30px_rgba(163,230,53,0.3)]">
              & ACCESOS CLOUD
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 font-light leading-relaxed max-w-3xl border-l-2 border-[#9CD01A]/40 pl-5">
            Base de datos y control de credenciales. Cada usuario tiene su nombre propio registrado, su rol y su perfil autorizado de ingreso. Si un usuario se define como <span className="text-sky-400 font-semibold">Cliente</span>, el sistema bloqueará su entrada al portal de Arquitecto.
          </p>
        </div>

        {/* Dashboard de Métricas / KPIs del Portal */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {/* KPI 1: Total Usuarios */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-white/50 text-xs mb-2">
              <span>Total Cuentas</span>
              <Users className="w-4 h-4 text-[#9CD01A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalUsers}</div>
            <div className="text-[11px] text-white/40 mt-1">Registros en Supabase</div>
          </div>

          {/* KPI 2: Arquitectos */}
          <div className="bg-white/[0.03] border border-lime-400/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-lime-300/70 text-xs mb-2">
              <span>Arquitectos</span>
              <Building2 className="w-4 h-4 text-lime-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-lime-400 font-mono">{architectCount}</div>
            <div className="text-[11px] text-lime-300/50 mt-1">Gestión & Edición 360°</div>
          </div>

          {/* KPI 3: Clientes */}
          <div className="bg-white/[0.03] border border-sky-400/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-sky-300/70 text-xs mb-2">
              <span>Clientes</span>
              <UserIcon className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">{clientCount}</div>
            <div className="text-[11px] text-sky-300/50 mt-1">Solo Vista Cliente</div>
          </div>

          {/* KPI 4: Administradores */}
          <div className="bg-white/[0.03] border border-amber-400/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-amber-300/70 text-xs mb-2">
              <span>Admins</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{adminCount}</div>
            <div className="text-[11px] text-amber-300/50 mt-1">Acceso Universal</div>
          </div>

          {/* KPI 5: Cuentas Activas */}
          <div className="col-span-2 lg:col-span-1 bg-white/[0.03] border border-emerald-400/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-emerald-300/70 text-xs mb-2">
              <span>Activas</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{activeCount}</div>
            <div className="text-[11px] text-emerald-300/50 mt-1">Habilitadas para Login</div>
          </div>
        </div>

        {/* Notificaciones */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 bg-lime-500/10 border border-lime-500/30 text-lime-300 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 shadow-[0_0_20px_rgba(156,208,26,0.15)]">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-lime-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario Integrado (Crear o Modificar) */}
        {showForm && (
          <div id="user-form-panel" className="mb-8">
            <form 
              onSubmit={handleSaveUser} 
              className="bg-[#121215] border-2 border-[#9CD01A]/50 p-6 sm:p-8 rounded-3xl space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(156,208,26,0.15)] animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 text-[#9CD01A]">
                  <div className="w-10 h-10 rounded-xl bg-[#9CD01A]/20 border border-[#9CD01A]/40 flex items-center justify-center">
                    {editingUserId ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                      {editingUserId ? 'Modificar Datos de Usuario' : 'Registrar Nuevo Usuario en la Nube'}
                    </h2>
                    <p className="text-xs text-white/50">
                      Configura el nombre registrado, usuario, contraseña y permisos de perfil.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold cursor-pointer transition-all"
                >
                  Cerrar Formulario
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Nombre Propio Registrado */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      Nombre Propio Registrado
                      <Sparkles className="w-3.5 h-3.5 text-[#9CD01A]" />
                    </span>
                    <span className="text-[10px] text-[#9CD01A] font-mono font-normal">Bienvenida</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan David o Arq. Carlos Gómez"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] focus:ring-1 focus:ring-[#9CD01A] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none font-medium transition-all"
                  />
                  <span className="text-[11px] text-white/40 mt-1.5 block">
                    * Este es el nombre que aparecerá en el título de bienvenida ("BIENVENIDO, [NOMBRE]")
                  </span>
                </div>

                {/* 2. Usuario / Correo de Ingreso */}
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Usuario / Email de Acceso
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. juan o cliente@empresa.com"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] focus:ring-1 focus:ring-[#9CD01A] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none font-mono transition-all"
                  />
                  <span className="text-[11px] text-white/40 mt-1.5 block">
                    * El usuario o correo con el que la persona iniciará sesión.
                  </span>
                </div>

                {/* 3. Contraseña */}
                <div>
                  <label className="text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Contraseña</span>
                    {editingUserId && (
                      <span className="text-[10px] text-white/40 lowercase">(vacío = mantener actual)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUserId}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingUserId ? "Dejar en blanco para no cambiarla" : "Ej. massa2026"}
                      className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] focus:ring-1 focus:ring-[#9CD01A] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none pr-12 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer text-xs"
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                  <span className="text-[11px] text-white/40 mt-1.5 block">
                    * Clave segura para autenticarse en el login.
                  </span>
                </div>

                {/* 4. Tipo de Usuario (Rol) */}
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Tipo de Usuario (Rol)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] rounded-xl px-4 py-3 text-sm text-white outline-none font-medium cursor-pointer"
                  >
                    <option value="architect" className="bg-[#141418] text-white">🏢 Arquitecto / Editor de Obras</option>
                    <option value="client" className="bg-[#141418] text-white">👤 Cliente (Propietario)</option>
                    <option value="admin" className="bg-[#141418] text-white">⚡ Administrador General</option>
                  </select>
                  <span className="text-[11px] text-white/40 mt-1.5 block">
                    * Define el perfil institucional de la cuenta.
                  </span>
                </div>

                {/* 5. Perfil de Ingreso Autorizado */}
                <div>
                  <label className="text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span>Perfil de Ingreso Autorizado</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  </label>
                  <select
                    value={allowedProfile}
                    onChange={(e) => setAllowedProfile(e.target.value as AllowedProfile)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] rounded-xl px-4 py-3 text-sm text-white outline-none font-medium cursor-pointer"
                  >
                    <option value="architect" className="bg-[#141418] text-lime-400">Solo Perfil Arquitecto</option>
                    <option value="client" className="bg-[#141418] text-sky-400">Solo Perfil Cliente (Bloqueado en Arquitecto)</option>
                    <option value="both" className="bg-[#141418] text-amber-400">Ambos Perfiles (Acceso Total)</option>
                  </select>
                  <span className="text-[11px] text-white/40 mt-1.5 block">
                    * Regla de validación estricta al iniciar sesión.
                  </span>
                </div>

                {/* 6. Estado Activo / Inactivo */}
                <div className="flex flex-col justify-center">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Estado de la Cuenta
                  </label>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-xs font-semibold text-white">
                        {active ? 'Usuario Activo' : 'Usuario Inactivo'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9CD01A]" />
                    </label>
                  </div>
                  <span className="text-[11px] text-white/40 mt-1.5 block">
                    * Si está inactivo, el usuario no podrá iniciar sesión.
                  </span>
                </div>
              </div>

              {/* Pie del Formulario con Botones */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="text-xs text-white/50 flex items-center gap-2">
                  {role === 'client' ? (
                    <span className="text-sky-300 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      Este usuario está marcado como Cliente. NO podrá ingresar al Portal de Arquitecto.
                    </span>
                  ) : (
                    <span className="text-lime-300 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      Este usuario tendrá permisos para explorar y editar el portafolio arquitectónico.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-7 py-2.5 bg-[#9CD01A] hover:bg-[#aee620] text-[#09090B] text-xs font-black rounded-xl shadow-[0_0_20px_rgba(156,208,26,0.35)] hover:shadow-[0_0_30px_rgba(156,208,26,0.5)] transition-all cursor-pointer flex items-center gap-2 hover:scale-102 active:scale-98"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Guardando en la Nube...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{editingUserId ? 'Guardar Cambios' : 'Registrar Usuario'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Barra de Búsqueda, Filtros y Botón de Creación */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 bg-[#121215] border border-white/10 p-3.5 sm:p-4 rounded-2xl shadow-xl">
          {/* Buscador en tiempo real */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre registrado, usuario o rol..."
              className="w-full bg-black/50 border border-white/10 focus:border-[#9CD01A] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 outline-none transition-all font-medium"
            />
          </div>

          {/* Filtros por Rol */}
          <div className="flex items-center gap-1.5 overflow-x-auto self-start md:self-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setFilterRole('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterRole === 'all' 
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm' 
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('architect')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterRole === 'architect' 
                  ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40 shadow-sm' 
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              Arquitectos ({architectCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('client')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterRole === 'client' 
                  ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40 shadow-sm' 
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              Clientes ({clientCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('admin')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterRole === 'admin' 
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm' 
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              Admins ({adminCount})
            </button>
          </div>

          {/* Toggle de Vista: Tarjetas Cuadradas vs Tabla */}
          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#9CD01A] text-[#0D0D0E] shadow-sm font-black'
                  : 'text-white/50 hover:text-white'
              }`}
              title="Vista de Tarjetas Cuadradas"
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#9CD01A] text-[#0D0D0E] shadow-sm font-black'
                  : 'text-white/50 hover:text-white'
              }`}
              title="Vista de Tabla"
            >
              <List className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
          </div>

          {/* Botón Principal "+ Nuevo Usuario" */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-[#9CD01A] hover:bg-[#aee620] text-[#09090B] font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(156,208,26,0.35)] hover:shadow-[0_0_30px_rgba(156,208,26,0.5)] cursor-pointer whitespace-nowrap shrink-0 hover:scale-102 active:scale-98"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nuevo Usuario</span>
          </button>
        </div>

        {/* Contenido: Tarjetas Cuadradas de Contacto o Tabla */}
        {loading ? (
          <div className="border border-white/10 rounded-3xl bg-[#121215]/80 backdrop-blur-xl p-24 flex flex-col items-center justify-center gap-4 text-white/40 shadow-2xl">
            <RefreshCw className="w-8 h-8 animate-spin text-[#9CD01A]" />
            <span className="text-sm font-mono tracking-wider">Cargando base de datos de usuarios de MASSA...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="border border-white/10 rounded-3xl bg-[#121215]/80 backdrop-blur-xl py-20 text-center text-white/40 text-sm font-mono shadow-2xl">
            No se encontraron usuarios registrados con el criterio de búsqueda actual.
          </div>
        ) : viewMode === 'cards' ? (
          /* Cuadrícula de Tarjetas Cuadradas de Contacto */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredUsers.map((u) => {
              const isClient = u.role === 'client';
              const isAdmin = u.role === 'admin';
              const isSystemProtected = ['juan', 'admin'].includes(u.username.toLowerCase());

              return (
                <div 
                  key={u.id}
                  className="group relative bg-gradient-to-b from-[#18181B]/95 via-[#141416]/90 to-[#0F0F11]/98 border border-white/10 hover:border-[#9CD01A]/60 rounded-3xl p-6 flex flex-col justify-between aspect-square min-h-[300px] transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(156,208,26,0.2)] hover:-translate-y-1 overflow-hidden"
                >
                  {/* Resplandor decorativo de esquina */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#9CD01A]/[0.05] rounded-full blur-2xl pointer-events-none group-hover:bg-[#9CD01A]/[0.16] transition-all duration-300" />

                  {/* Header: Avatar con icono/iniciales + Estado */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-transform group-hover:scale-105 ${
                        isClient 
                          ? 'bg-sky-500/15 text-sky-400 border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.2)]' 
                          : isAdmin 
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                          : 'bg-[#9CD01A]/15 text-[#9CD01A] border-[#9CD01A]/30 shadow-[0_0_20px_rgba(156,208,26,0.2)]'
                      }`}>
                        {isClient ? (
                          <UserIcon className="w-6 h-6 stroke-[2.2]" />
                        ) : isAdmin ? (
                          <Shield className="w-6 h-6 stroke-[2.2]" />
                        ) : (
                          <Building2 className="w-6 h-6 stroke-[2.2]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-mono font-bold text-white/60 block truncate">
                          @{u.username}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-0.5 border ${
                          isAdmin
                            ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                            : isClient
                            ? 'bg-sky-400/15 text-sky-300 border-sky-400/30'
                            : 'bg-lime-400/15 text-lime-300 border-lime-400/30'
                        }`}>
                          {isAdmin ? 'Admin' : isClient ? 'Cliente' : 'Arquitecto'}
                        </span>
                      </div>
                    </div>

                    {/* Badge de Estado Activo/Inactivo */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          INACTIVO
                        </span>
                      )}
                      {isSystemProtected && (
                        <span className="text-[9px] font-mono font-bold uppercase text-white/30 tracking-wider">
                          SISTEMA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo Central: Nombre Registrado + Bienvenida Personalizada + Perfil */}
                  <div className="my-auto py-2 relative z-10">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug line-clamp-2">
                      {u.name}
                    </h3>
                    
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-[#9CD01A] font-mono max-w-full">
                      <Sparkles className="w-3 h-3 text-[#9CD01A] shrink-0" />
                      <span className="truncate">"BIENVENIDO, {u.name.toUpperCase()}"</span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2 text-xs text-white/60">
                      <Lock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span className="text-[11px] font-medium truncate">
                        {u.allowed_profile === 'client' || isClient ? (
                          'Acceso: Solo Portal Cliente'
                        ) : u.allowed_profile === 'both' || isAdmin ? (
                          'Acceso: Ambos Portales'
                        ) : (
                          'Acceso: Solo Portal Arquitecto'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Footer: Acciones Modificar y Eliminar */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-[#9CD01A] text-white/80 hover:text-[#0D0D0E] border border-white/10 hover:border-[#9CD01A] rounded-xl transition-all cursor-pointer font-extrabold text-xs group/btn shadow-sm hover:shadow-[0_0_15px_rgba(156,208,26,0.35)]"
                    >
                      <Edit2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                      <span>Modificar</span>
                    </button>

                    {isSystemProtected ? (
                      <div className="p-2 text-white/20" title="Usuario del sistema protegido">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id, u.username, u.name)}
                        className="p-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-xl transition-all cursor-pointer"
                        title="Eliminar usuario de Supabase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Tabla Alternativa de Usuarios */
          <div className="border border-white/10 rounded-3xl bg-[#121215]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-black uppercase tracking-wider text-white/50">
                    <th className="py-4 px-5">Usuario de Acceso</th>
                    <th className="py-4 px-5">Nombre Registrado (Bienvenida)</th>
                    <th className="py-4 px-5">Rol / Tipo</th>
                    <th className="py-4 px-5">Perfil de Ingreso</th>
                    <th className="py-4 px-5">Estado</th>
                    <th className="py-4 px-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                  {filteredUsers.map((u) => {
                    const isClient = u.role === 'client';
                    const isAdmin = u.role === 'admin';
                    const isSystemProtected = ['juan', 'admin'].includes(u.username.toLowerCase());

                    return (
                      <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                        {/* Usuario */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                              isClient 
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                                : isAdmin 
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                : 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                            }`}>
                              {isClient ? <UserIcon className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-mono font-bold text-white text-xs sm:text-sm">
                                {u.username}
                              </div>
                              <div className="text-[10px] text-white/40 font-mono">
                                ID: {u.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Nombre Registrado */}
                        <td className="py-4 px-5">
                          <div>
                            <span className="text-white font-bold text-xs sm:text-sm">
                              {u.name}
                            </span>
                            <div className="text-[10px] text-[#9CD01A] font-mono flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>"BIENVENIDO, {u.name.toUpperCase()}"</span>
                            </div>
                          </div>
                        </td>

                        {/* Tipo de Usuario */}
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                            isAdmin
                              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                              : isClient
                              ? 'bg-sky-400/15 text-sky-300 border border-sky-400/30'
                              : 'bg-lime-400/15 text-lime-300 border border-lime-400/30'
                          }`}>
                            <Shield className="w-3 h-3" />
                            {isAdmin ? 'Admin General' : isClient ? 'Cliente' : 'Arquitecto'}
                          </span>
                        </td>

                        {/* Perfil Permitido */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              u.allowed_profile === 'client' || isClient
                                ? 'text-sky-300'
                                : u.allowed_profile === 'both' || isAdmin
                                ? 'text-amber-300'
                                : 'text-lime-300'
                            }`}>
                              <Lock className="w-3 h-3" />
                              {u.allowed_profile === 'client' || isClient ? (
                                'Solo Cliente'
                              ) : u.allowed_profile === 'both' || isAdmin ? (
                                'Ambos Perfiles'
                              ) : (
                                'Solo Arquitecto'
                              )}
                            </span>
                            {isClient && (
                              <span className="text-[10px] text-red-400/80 font-mono mt-0.5">
                                Bloqueado en Arquitecto
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-5">
                          {u.active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-red-400" />
                              Inactivo
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Botón Modificar */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#9CD01A]/20 text-white/70 hover:text-[#9CD01A] border border-white/10 hover:border-[#9CD01A]/40 rounded-xl transition-all cursor-pointer font-bold text-xs"
                              title="Modificar usuario"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Modificar</span>
                            </button>

                            {/* Botón Eliminar */}
                            {isSystemProtected ? (
                              <span className="text-[10px] font-mono text-white/30 uppercase px-2 py-1 rounded bg-white/5">
                                Sistema
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.username, u.name)}
                                className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded-xl transition-all cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer del Portal */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 border-t border-white/10 pt-6">
          <span>MASSA GROUP • Sistema de Control de Acceso y Gestión de Identidades V2.0</span>
          <button
            onClick={onBackToObras}
            type="button"
            className="flex items-center gap-2 text-white/70 hover:text-[#9CD01A] transition-colors cursor-pointer font-semibold"
          >
            <span>Volver al Portafolio de Obras</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
