import { supabase } from './supabaseClient';
import { ADMIN_EMAIL } from '../config/adminAccess';

export type UserRole = 'architect' | 'client' | 'admin';
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}
export interface AuthResult { success: boolean; user?: UserProfile; error?: string }
const DISPLAY_KEYS = ['massa_3d_role', 'massa_client_email', 'massa_3d_username', 'massa_3d_name', 'massa_3d_user_level'];
let isAuthenticating = false;
let sessionRevision = 0;

function clearDisplayIdentity() {
  for (const storageName of ['sessionStorage', 'localStorage'] as const) {
    try {
      const storage = globalThis[storageName];
      DISPLAY_KEYS.forEach(key => storage?.removeItem(key));
    } catch { /* El navegador puede impedir el almacenamiento. */ }
  }
}
async function readAuthorizedProfile(id: string, email?: string): Promise<UserProfile | null> {
  if (email?.toLowerCase() !== ADMIN_EMAIL) return null;
  const { data: profile, error } = await supabase.from('user_profiles')
    .select('id, email, name, role, phone, created_at, updated_at').eq('id', id).maybeSingle();
  if (error || !profile || profile.id !== id || profile.role !== 'admin' ||
      profile.email?.toLowerCase() !== ADMIN_EMAIL) return null;
  // El servidor valida el JWT y el UUID autorizado. El correo y los metadatos no conceden acceso.
  const { data: allowed, error: accessError } = await supabase.rpc('is_platform_admin');
  return !accessError && allowed === true ? profile as UserProfile : null;
}
export const authService = {
  async signIn(email: string, password: string, targetRole?: 'architect' | 'client'): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) return { success: false, error: 'Por favor ingresa correo y contraseña.' };
    if (targetRole === 'client' || cleanEmail !== ADMIN_EMAIL) {
      return { success: false, error: 'Acceso denegado. El ingreso está reservado a la cuenta administradora autorizada.' };
    }
    isAuthenticating = true;
    sessionRevision++;
    clearDisplayIdentity();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error || !data.user) return { success: false, error: 'No se pudo iniciar sesión. Verifica tus credenciales de Supabase Auth.' };
      const user = await readAuthorizedProfile(data.user.id, data.user.email);
      if (!user) {
        await supabase.auth.signOut();
        return { success: false, error: 'Acceso denegado. La cuenta no tiene una autorización administrativa verificada.' };
      }
      // Compatibilidad visual únicamente. Las decisiones de acceso no leen estas claves.
      for (const storageName of ['sessionStorage', 'localStorage'] as const) {
        try {
          const storage = globalThis[storageName];
          storage?.setItem('massa_3d_name', user.name);
          storage?.setItem('massa_3d_username', user.email);
        } catch { /* Auth sigue siendo válido sin estas claves. */ }
      }
      return { success: true, user };
    } catch {
      await supabase.auth.signOut().catch(() => undefined);
      return { success: false, error: 'No se pudo verificar el acceso. Revisa la conexión e inténtalo de nuevo.' };
    } finally { isAuthenticating = false; sessionRevision++; }
  },
  async signOut(): Promise<void> {
    sessionRevision++;
    clearDisplayIdentity();
    await supabase.auth.signOut();
  },
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return { success: false, message: 'Por favor ingresa un correo electrónico válido.' };
    if (cleanEmail !== ADMIN_EMAIL) return { success: false, message: 'Usa el correo de la cuenta administradora autorizada.' };
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin + '/reset-password' : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
      return error ? { success: false, message: error.message }
        : { success: true, message: 'Se ha enviado un enlace de recuperación seguro a ' + cleanEmail + '.' };
    } catch { return { success: false, message: 'Error solicitando recuperación de contraseña.' }; }
  },
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const user = !error && session?.user;
      return user ? await readAuthorizedProfile(user.id, user.email) : null;
    } catch { return null; }
  },
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    let disposed = false;
    let generation = 0;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentGeneration = ++generation;
      if (isAuthenticating) return;
      const revision = sessionRevision;
      if (!session?.user) { callback(null); return; }
      // Consultar fuera del callback de Auth para no bloquear la sesión.
      setTimeout(() => {
        if (disposed || revision !== sessionRevision || isAuthenticating) return;
        void authService.getCurrentUser().then(user => {
          if (!disposed && currentGeneration === generation && revision === sessionRevision && !isAuthenticating) callback(user);
        });
      }, 0);
    });
    return { data: { subscription: { unsubscribe() {
      disposed = true;
      generation++;
      data.subscription.unsubscribe();
    } } } };
  },
};
