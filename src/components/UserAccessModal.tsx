import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Shield, 
  X, 
  RefreshCw, 
  AlertCircle,
  UserPlus,
  Edit2,
  Check,
  Building2,
  User as UserIcon,
  Search,
  KeyRound,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { 
  MassaUser, 
  UserRole, 
  AllowedProfile, 
  getMassaUsers, 
  saveMassaUser, 
  deleteMassaUser 
} from '../supabase';

interface UserAccessModalProps {
  onClose: () => void;
  onUserUpdated?: () => void;
}

export function UserAccessModal({ onClose, onUserUpdated }: UserAccessModalProps) {
  const [users, setUsers] = useState<MassaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'architect' | 'client'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      setError('No se pudieron cargar los usuarios de la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Al cambiar el rol, ajustar por defecto el perfil de ingreso permitido
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
  };

  const handleOpenEdit = (user: MassaUser) => {
    setEditingUserId(user.id);
    setUsername(user.username);
    setPassword(''); // Dejar vacío para indicar que se mantiene si no se escribe
    setName(user.name);
    setRole(user.role || 'architect');
    setAllowedProfile(user.allowed_profile || (user.role === 'client' ? 'client' : user.role === 'admin' ? 'both' : 'architect'));
    setActive(user.active ?? true);
    setError(null);
    setSuccessMsg(null);
    setShowForm(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) {
      setError('El usuario y el nombre completo son obligatorios.');
      return;
    }
    if (!editingUserId && !password.trim()) {
      setError('La contraseña es obligatoria para nuevos usuarios.');
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

      setSuccessMsg(editingUserId ? 'Usuario modificado exitosamente.' : 'Usuario registrado exitosamente.');
      setShowForm(false);
      await fetchUsers();
      if (onUserUpdated) onUserUpdated();
    } catch (err: any) {
      setError(err.message || 'Error al guardar usuario en la base de datos.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, targetUsername: string, targetName: string) => {
    if (['juan', 'admin'].includes(targetUsername.toLowerCase())) {
      alert('Las cuentas principales de dirección y administración no se pueden eliminar.');
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar permanentemente al usuario "${targetName}" (${targetUsername})?\nEsta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await deleteMassaUser(id);
      setSuccessMsg(`Usuario "${targetName}" eliminado correctamente.`);
      await fetchUsers();
      if (onUserUpdated) onUserUpdated();
    } catch (err: any) {
      alert('Error eliminando usuario: ' + err.message);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterRole === 'architect') return u.role === 'architect' || u.role === 'editor';
    if (filterRole === 'client') return u.role === 'client';
    return true;
  });

  const architectCount = users.filter(u => u.role === 'architect' || u.role === 'editor' || u.role === 'admin').length;
  const clientCount = users.filter(u => u.role === 'client').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0D0D10] border border-[#9CD01A]/30 rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#9CD01A]/15 border border-[#9CD01A]/40 flex items-center justify-center text-[#9CD01A] shadow-[0_0_20px_rgba(156,208,26,0.2)]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Base de Datos de Usuarios y Accesos
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#9CD01A]/20 text-[#9CD01A] border border-[#9CD01A]/30 font-bold">
                  MASSA CLOUD
                </span>
              </div>
              <p className="text-xs text-white/50">
                Gestiona usuarios, roles y define por cuál perfil pueden ingresar (Arquitecto o Cliente).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notificaciones de error o éxito */}
        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-2xl text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 bg-lime-500/10 border border-lime-500/30 text-lime-300 p-3 rounded-2xl text-xs flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 shrink-0 text-lime-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Contenedor Central Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 py-4 space-y-4 pr-1">
          
          {/* Barra de Estadísticas y Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre registrado o usuario..."
                className="w-full bg-black/40 border border-white/10 focus:border-[#9CD01A] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none transition-all"
              />
            </div>

            {/* Píldoras de Filtro */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterRole('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterRole === 'all' 
                    ? 'bg-white/15 text-white border border-white/20' 
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                Todos ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterRole('architect')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterRole === 'architect' 
                    ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40' 
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                Arquitectos ({architectCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterRole('client')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterRole === 'client' 
                    ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40' 
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                Clientes ({clientCount})
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="ml-2 bg-[#9CD01A] hover:bg-[#aee620] text-[#0D0D0E] font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(156,208,26,0.3)] cursor-pointer whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Nuevo Usuario</span>
              </button>
            </div>
          </div>

          {/* Formulario Desplegable (Para Crear o Modificar) */}
          {showForm && (
            <form 
              onSubmit={handleSaveUser} 
              className="bg-[#141418] border-2 border-[#9CD01A]/40 p-5 rounded-2xl space-y-4 shadow-2xl animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#9CD01A] font-extrabold text-sm uppercase tracking-wide">
                  {editingUserId ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{editingUserId ? 'Modificar Usuario Existente' : 'Registrar Nuevo Usuario'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-white/40 hover:text-white text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Nombre Registrado (Este es el que aparece en el título grande de bienvenida) */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>Nombre Propio Registrado</span>
                    <Sparkles className="w-3 h-3 text-[#9CD01A]" />
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan David o Arq. Andrés Pérez"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] focus:ring-1 focus:ring-[#9CD01A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none font-medium"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">
                    * Nombre que aparecerá en el título de bienvenida ("BIENVENIDO, [NOMBRE]")
                  </span>
                </div>

                {/* Usuario o Correo de Acceso */}
                <div>
                  <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                    Usuario / Email de Acceso
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. juan o cliente@empresa.com"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] focus:ring-1 focus:ring-[#9CD01A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none font-mono"
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Contraseña</span>
                    {editingUserId && (
                      <span className="text-[10px] text-white/40 lowercase">(vacío = mantener)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={!editingUserId}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingUserId ? "Dejar en blanco para no cambiarla" : "Ej. massa2026"}
                      className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] focus:ring-1 focus:ring-[#9CD01A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none"
                    />
                    <KeyRound className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>

                {/* Selector de Rol / Tipo de Usuario */}
                <div>
                  <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                    Tipo de Usuario (Rol)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-medium cursor-pointer"
                  >
                    <option value="architect" className="bg-[#141418] text-white">🏢 Arquitecto / Editor de Obras</option>
                    <option value="client" className="bg-[#141418] text-white">👤 Cliente (Propietario / Comprador)</option>
                    <option value="admin" className="bg-[#141418] text-white">⚡ Administrador General</option>
                  </select>
                </div>

                {/* Perfil de Ingreso Permitido (Restricción Estricta) */}
                <div>
                  <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span>Perfil de Ingreso Autorizado</span>
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                  </label>
                  <select
                    value={allowedProfile}
                    onChange={(e) => setAllowedProfile(e.target.value as AllowedProfile)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#9CD01A] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-medium cursor-pointer"
                  >
                    <option value="architect" className="bg-[#141418] text-lime-400">Solo Perfil Arquitecto</option>
                    <option value="client" className="bg-[#141418] text-sky-400">Solo Perfil Cliente (Bloqueado en Arquitecto)</option>
                    <option value="both" className="bg-[#141418] text-amber-400">Ambos Perfiles (Acceso Total)</option>
                  </select>
                </div>

                {/* Estado Activo / Inactivo */}
                <div className="flex flex-col justify-center">
                  <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-2">
                    Estado de la Cuenta
                  </label>
                  <label className="inline-flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#9CD01A] focus:ring-0 focus:ring-offset-0 bg-black/60 border-white/20 cursor-pointer accent-[#9CD01A]"
                    />
                    <span className="text-xs font-semibold text-white/90">
                      {active ? 'Usuario Activo (Permite Login)' : 'Usuario Inactivo (Bloqueado)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Botones de acción del formulario */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="text-[11px] text-white/40">
                  {role === 'client' && (
                    <span className="text-sky-300 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Este usuario NO podrá iniciar sesión en la pestaña de Arquitecto.
                    </span>
                  )}
                  {role === 'architect' && (
                    <span className="text-lime-300 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Tendrá acceso de edición y visualización al portafolio de arquitectura.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#9CD01A] hover:bg-[#aee620] text-[#0D0D0E] text-xs font-black rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(156,208,26,0.35)] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{editingUserId ? 'Guardar Modificación' : 'Crear Usuario'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Tabla de Usuarios Registrados */}
          <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-white/40">
                <RefreshCw className="w-7 h-7 animate-spin text-[#9CD01A]" />
                <span className="text-xs font-mono tracking-wider">Cargando base de datos de usuarios...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-xs font-mono">
                No se encontraron usuarios que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-black uppercase tracking-wider text-white/50">
                      <th className="py-3 px-4">Usuario</th>
                      <th className="py-3 px-4">Nombre Registrado (Bienvenida)</th>
                      <th className="py-3 px-4">Tipo de Usuario</th>
                      <th className="py-3 px-4">Perfil Permitido</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredUsers.map((u) => {
                      const isClient = u.role === 'client';
                      const isAdmin = u.role === 'admin';
                      const isSystemProtected = ['juan', 'admin'].includes(u.username.toLowerCase());

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                          {/* Columna Usuario */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isClient 
                                  ? 'bg-sky-500/20 text-sky-400' 
                                  : isAdmin 
                                  ? 'bg-amber-500/20 text-amber-400' 
                                  : 'bg-lime-500/20 text-lime-400'
                              }`}>
                                {isClient ? <UserIcon className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                              </div>
                              <span className="font-mono font-bold text-white">
                                {u.username}
                              </span>
                            </div>
                          </td>

                          {/* Columna Nombre Registrado */}
                          <td className="py-3.5 px-4">
                            <span className="text-white font-semibold flex items-center gap-1.5">
                              {u.name}
                            </span>
                          </td>

                          {/* Columna Rol */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isAdmin
                                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                                : isClient
                                ? 'bg-sky-400/15 text-sky-300 border border-sky-400/30'
                                : 'bg-lime-400/15 text-lime-300 border border-lime-400/30'
                            }`}>
                              <Shield className="w-3 h-3" />
                              {isAdmin ? 'Admin' : isClient ? 'Cliente' : 'Arquitecto'}
                            </span>
                          </td>

                          {/* Columna Perfil Permitido */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                              u.allowed_profile === 'client' || isClient
                                ? 'text-sky-300'
                                : u.allowed_profile === 'both' || isAdmin
                                ? 'text-amber-300'
                                : 'text-lime-300'
                            }`}>
                              {u.allowed_profile === 'client' || isClient ? (
                                'Solo Cliente'
                              ) : u.allowed_profile === 'both' || isAdmin ? (
                                'Ambos Perfiles'
                              ) : (
                                'Solo Arquitecto'
                              )}
                            </span>
                          </td>

                          {/* Columna Estado */}
                          <td className="py-3.5 px-4">
                            {u.active ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-red-400 text-[11px] font-semibold">
                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                Inactivo
                              </span>
                            )}
                          </td>

                          {/* Columna Acciones */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Botón Editar */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(u)}
                                className="p-1.5 bg-white/5 hover:bg-[#9CD01A]/20 text-white/60 hover:text-[#9CD01A] rounded-lg transition-colors cursor-pointer"
                                title="Modificar usuario"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Botón Eliminar */}
                              {isSystemProtected ? (
                                <span className="text-[10px] font-mono text-white/30 uppercase px-1">
                                  Sistema
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id, u.username, u.name)}
                                  className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
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
            )}
          </div>
        </div>

        {/* Pie del modal */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40 shrink-0">
          <span>* Los cambios se aplican en tiempo real en Supabase para el control de acceso en el Login.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
