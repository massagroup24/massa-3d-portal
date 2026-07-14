import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  X, 
  Key, 
  UserCheck, 
  RefreshCw, 
  AlertCircle,
  Check,
  UserPlus
} from 'lucide-react';
import { MassaUser, getMassaUsers, saveMassaUser, deleteMassaUser } from '../supabase';

interface UserAccessModalProps {
  onClose: () => void;
}

export function UserAccessModal({ onClose }: UserAccessModalProps) {
  const [users, setUsers] = useState<MassaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'editor' | 'admin'>('editor');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMassaUsers();
      setUsers(data);
    } catch (err: any) {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await saveMassaUser({
        username: username.trim(),
        password: password.trim(),
        name: name.trim(),
        role,
        active: true
      });
      setUsername('');
      setPassword('');
      setName('');
      setShowAddForm(false);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al guardar usuario en Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, usernameTarget: string) => {
    if (usernameTarget === 'editor' || usernameTarget === 'admin' || usernameTarget === 'juan') {
      alert('Los usuarios corporativos principales no se pueden eliminar.');
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar el acceso para el usuario "${usernameTarget}"?`)) return;

    try {
      await deleteMassaUser(id);
      await fetchUsers();
    } catch (err: any) {
      alert('Error eliminando usuario: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0e110f] border border-[#99cc33]/30 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative max-h-[88vh] flex flex-col"
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#99cc33]/20 border border-[#99cc33]/40 flex items-center justify-center text-[#99cc33]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Tabla de Usuarios y Accesos MASSA
              </h3>
              <p className="text-xs text-gray-400">
                Administra qué editores y directores pueden configurar recorridos 360°
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mensaje de error si ocurre */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-2xl text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Contenedor central desplazable (Formulario + Tabla) */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 my-3 pr-1">
          {/* Barra de acción superior */}
          <div className="flex items-center justify-between shrink-0">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Editores Autorizados ({users.length})
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#99cc33] hover:bg-[#a6db38] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(153,204,51,0.3)] shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'Cerrar Formulario' : '+ Nuevo Usuario'}</span>
            </button>
          </div>

          {/* Formulario desplegable para agregar un usuario */}
          {showAddForm && (
            <form onSubmit={handleCreateUser} className="bg-white/[0.03] border border-[#99cc33]/30 p-5 rounded-2xl space-y-4 animate-in fade-in duration-200 shrink-0">
              <h4 className="text-xs font-black text-[#99cc33] uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" /> Registrar Nuevo Editor en la Nube
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Usuario / ID</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. carlos.garcia"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#99cc33] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Carlos García - Arquitectura"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#99cc33] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Contraseña</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ej. massa360"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#99cc33] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#99cc33] hover:bg-[#a6db38] text-black text-xs font-black rounded-xl shadow-lg"
                >
                  {saving ? 'Guardando...' : 'Crear Acceso'}
                </button>
              </div>
            </form>
          )}

          {/* Tabla de usuarios */}
          <div className="flex-1 overflow-y-auto border border-white/10 rounded-2xl bg-black/40 min-h-[180px]">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin text-[#99cc33]" />
                <span className="text-xs">Cargando tabla de usuarios...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-black uppercase tracking-wider text-gray-400">
                    <th className="py-3.5 px-4">Usuario</th>
                    <th className="py-3.5 px-4">Nombre Completo</th>
                    <th className="py-3.5 px-4">Rol</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#99cc33]">
                        {u.username}
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium">
                        {u.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'admin' 
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                            : 'bg-[#99cc33]/15 text-[#99cc33] border border-[#99cc33]/30'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Activo
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {['editor', 'admin', 'juan'].includes(u.username) ? (
                          <span className="text-[10px] font-mono text-gray-500 uppercase">Sistema</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pie del modal */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 shrink-0">
          <span>Los usuarios de esta tabla pueden ingresar con sus credenciales desde el botón superior derecha.</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
