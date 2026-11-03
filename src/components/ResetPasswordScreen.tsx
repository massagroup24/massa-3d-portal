import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/authService';
import { supabase } from '../supabase';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    const sync = (user: unknown) => {
      if (active) { setAllowed(Boolean(user)); setLoading(false); }
    };
    void authService.getCurrentUser().then(sync);
    const { data } = authService.onAuthStateChange(sync);
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    if (password.length < 12 || password !== confirmation) {
      setMessage('Usa al menos 12 caracteres y confirma la misma contraseña.');
      return;
    }
    setSaving(true);
    try {
      if (!await authService.getCurrentUser()) throw new Error('El enlace ha vencido. Solicita otro enlace de recuperación.');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword(''); setConfirmation('');
      setMessage('Contraseña actualizada. Ya puedes volver al inicio.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.');
    } finally { setSaving(false); }
  }
  return <main className="min-h-screen bg-[#08090D] text-white flex items-center justify-center p-6">
    <div className="w-full max-w-md space-y-5">
      <h1 className="text-2xl font-bold">Nueva contraseña</h1>
      {loading ? <p role="status">Verificando enlace…</p> : !allowed ?
        <p>El enlace no es válido o ha vencido. Solicita uno nuevo desde el acceso de administrador.</p> :
        <form onSubmit={submit} className="space-y-4">
          <label className="block">Contraseña nueva
            <input type="password" autoComplete="new-password" minLength={12} required value={password}
              onChange={event => setPassword(event.target.value)} className="block w-full mt-2 p-3 bg-white/10 rounded-lg" />
          </label>
          <label className="block">Confirmar contraseña
            <input type="password" autoComplete="new-password" minLength={12} required value={confirmation}
              onChange={event => setConfirmation(event.target.value)} className="block w-full mt-2 p-3 bg-white/10 rounded-lg" />
          </label>
          <button disabled={saving} className="bg-lime-400 text-black font-bold px-5 py-3 rounded-lg disabled:opacity-50">
            {saving ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>}
      {message && <p role="status">{message}</p>}
      <button onClick={() => navigate('/')} className="underline">Volver al inicio</button>
    </div>
  </main>;
}
