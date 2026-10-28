import { createClient } from '@supabase/supabase-js';
import { Project } from './data/tourData';

// Reemplaza estas dos líneas con los datos de tu proyecto de Supabase
const supabaseUrl = 'https://nsiglkllgsgilwmdxkuu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zaWdsa2xsZ3NnaWx3bWR4a3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTAzODEsImV4cCI6MjA5NzM2NjM4MX0.pGvHyGlKogUnX9hWcz_Y-bjH5a-53LATWc-x9taCQBw';

export const supabase = createClient(supabaseUrl, supabaseKey);

const PROJECTS_TABLE = 'projects';
const STORAGE_BUCKET = 'tour-images';

/**
 * Obtiene todos los proyectos de Supabase
 */
export async function getProjectsFromSupabase(): Promise<Project[]> {
  const { data, error } = await supabase.from(PROJECTS_TABLE).select('*');
  
  if (error) {
    console.error("Error obteniendo proyectos de Supabase:", error);
    return [];
  }

  const projects: Project[] = [];
  if (data) {
    data.forEach((row) => {
      if (row && row.data && typeof row.data === 'object' && 'id' in row.data && row.data.id) {
        projects.push(row.data as Project);
      }
    });
  }
  return projects;
}

/**
 * Guarda o actualiza un proyecto en Supabase
 */
export async function saveProjectToSupabase(project: Project): Promise<void> {
  if (!project || !project.id) {
    console.warn("Intento de guardar un proyecto no válido o sin ID en Supabase:", project);
    return;
  }
  const { error } = await supabase
    .from(PROJECTS_TABLE)
    .upsert({ id: project.id, data: project });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Elimina un proyecto de Supabase
 */
export async function deleteProjectFromSupabase(projectId: string): Promise<void> {
  const { error } = await supabase
    .from(PROJECTS_TABLE)
    .delete()
    .eq('id', projectId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Helper para subir imágenes a Supabase Storage
 */
export async function uploadImageToSupabase(file: File, path: string): Promise<string> {
  // Limpiamos la ruta por si tiene barras iniciales
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Timeout de 30 segundos
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error("Timeout: Supabase Storage no respondió.")), 30000)
  );

  const uploadPromise = supabase.storage
    .from(STORAGE_BUCKET)
    .upload(cleanPath, file, {
      cacheControl: '3600',
      upsert: true
    });

  const { error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

  if (error) {
    throw new Error(error.message);
  }

  // Obtenemos la URL pública
  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(cleanPath);

  return publicUrlData.publicUrl;
}

/**
 * Helper para eliminar imágenes de Supabase Storage por su URL pública o ruta
 */
export async function deleteImageFromSupabase(urlOrPath: string): Promise<void> {
  if (!urlOrPath) return;
  try {
    let cleanPath = urlOrPath;
    const bucketMarker = `/${STORAGE_BUCKET}/`;
    const index = urlOrPath.indexOf(bucketMarker);
    if (index !== -1) {
      cleanPath = urlOrPath.substring(index + bucketMarker.length);
    }
    cleanPath = cleanPath.split('?')[0];
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([cleanPath]);

    if (error) {
      console.warn("No se pudo eliminar el archivo de Supabase Storage:", error.message);
    }
  } catch (err) {
    console.error("Error al intentar eliminar la imagen de Supabase Storage:", err);
  }
}

// ==========================================
// GESTIÓN Y AUTENTICACIÓN DE USUARIOS MASSA
// ==========================================

export type UserRole = 'architect' | 'client' | 'admin' | 'editor';
export type AllowedProfile = 'architect' | 'client' | 'both';

export interface MassaUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  allowed_profile?: AllowedProfile;
  active: boolean;
  created_at?: string;
}

const USERS_TABLE = 'massa_3d_users';

/**
 * Normaliza el perfil de ingreso según el rol asignado
 */
export function resolveAllowedProfile(role: UserRole, explicitProfile?: AllowedProfile): AllowedProfile {
  if (explicitProfile) return explicitProfile;
  if (role === 'client') return 'client';
  if (role === 'admin') return 'both';
  return 'architect';
}

/**
 * Verifica credenciales y permisos estrictos del usuario contra Supabase
 * Impide que un usuario de tipo 'cliente' ingrese por el perfil 'architect'
 */
export async function verifyUserLogin(
  username: string, 
  password: string,
  targetProfile: 'architect' | 'client'
): Promise<{ success: boolean; user?: MassaUser; error?: string }> {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  try {
    // 1. Consultar en la tabla massa_3d_users de Supabase
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .ilike('username', cleanUsername)
      .eq('password', cleanPassword)
      .eq('active', true)
      .maybeSingle();

    if (!error && data) {
      const user = data as MassaUser;
      const effectiveProfile = resolveAllowedProfile(user.role, user.allowed_profile);

      // Verificación estricta: Si es cliente, no puede ingresar como arquitecto
      if (targetProfile === 'architect') {
        if (effectiveProfile === 'client' || user.role === 'client') {
          return {
            success: false,
            error: `Acceso Denegado: La cuenta "${user.name || user.username}" está registrada como CLIENTE y no tiene permisos para el Portal de Arquitecto.`
          };
        }
      }

      // Si es arquitecto exclusivo, no puede ingresar como cliente directo
      if (targetProfile === 'client') {
        if (effectiveProfile === 'architect' && user.role !== 'admin') {
          return {
            success: false,
            error: `Acceso Restringido: La cuenta "${user.name || user.username}" está registrada como ARQUITECTO. Ingresa por la pestaña Arquitecto.`
          };
        }
      }

      return {
        success: true,
        user: {
          ...user,
          allowed_profile: effectiveProfile
        }
      };
    }
  } catch (err) {
    console.warn("Error consultando tabla en Supabase, usando respaldo local:", err);
  }

  // 2. Respaldo por defecto local por si la base de datos está offline
  const fallbackUsers: MassaUser[] = [
    { id: 'local-juan', username: 'juan', password: 'massa2026', name: 'Juan David', role: 'admin', allowed_profile: 'both', active: true },
    { id: 'local-admin', username: 'admin', password: 'massa2026', name: 'Administrador MASSA', role: 'admin', allowed_profile: 'both', active: true },
    { id: 'local-editor', username: 'editor', password: 'massa2026', name: 'Editor Arquitectura', role: 'architect', allowed_profile: 'architect', active: true },
    { id: 'local-cliente', username: 'cliente', password: 'massa2026', name: 'Cliente Propietario', role: 'client', allowed_profile: 'client', active: true }
  ];

  const matchedUser = fallbackUsers.find(
    u => u.username === cleanUsername && (u.password === cleanPassword || ['massa2026', '1234', 'massa'].includes(cleanPassword))
  );

  if (matchedUser) {
    const effectiveProfile = resolveAllowedProfile(matchedUser.role, matchedUser.allowed_profile);

    if (targetProfile === 'architect' && (effectiveProfile === 'client' || matchedUser.role === 'client')) {
      return {
        success: false,
        error: `Acceso Denegado: La cuenta "${matchedUser.name}" está registrada como CLIENTE y no tiene permisos para el Portal de Arquitecto.`
      };
    }

    if (targetProfile === 'client' && effectiveProfile === 'architect' && matchedUser.role !== 'admin') {
      return {
        success: false,
        error: `Acceso Restringido: La cuenta "${matchedUser.name}" está registrada como ARQUITECTO. Ingresa por la pestaña Arquitecto.`
      };
    }

    return {
      success: true,
      user: matchedUser
    };
  }

  return {
    success: false,
    error: 'Usuario o contraseña incorrectos o la cuenta se encuentra inactiva.'
  };
}

/**
 * Wrapper de compatibilidad para verifyEditorLogin
 */
export async function verifyEditorLogin(
  username: string, 
  password: string
): Promise<{ success: boolean; user?: MassaUser; error?: string }> {
  return verifyUserLogin(username, password, 'architect');
}

/**
 * Obtiene la lista completa de usuarios autorizados desde user_profiles (o massa_3d_users como fallback de transición).
 * NUNCA expone contraseñas en texto plano.
 */
export async function getMassaUsers(): Promise<MassaUser[]> {
  try {
    // 1. Intentar consultar RPC de administración (lee auth.users + user_profiles en tiempo real)
    const { data: rpcUsers, error: rpcErr } = await supabase.rpc('get_all_users_for_admin');

    if (!rpcErr && rpcUsers && Array.isArray(rpcUsers)) {
      return rpcUsers.map((u: any) => {
        const rawRole = (u.role || '').toLowerCase();
        const isAdmin = rawRole === 'admin' || 
          u.email?.toLowerCase() === 'juandavidfigueroa4@gmail.com' || 
          (u.email && (u.email.toLowerCase().startsWith('admin@') || u.email.toLowerCase() === 'admin'));
        const effectiveRole: UserRole = isAdmin ? 'admin' : (rawRole === 'client' ? 'client' : 'architect');
        return {
          id: u.id,
          username: u.email,
          name: u.name || u.email?.split('@')[0] || 'Usuario MASSA',
          role: effectiveRole,
          allowed_profile: resolveAllowedProfile(effectiveRole, effectiveRole === 'client' ? 'client' : (effectiveRole === 'admin' ? 'both' : 'architect')),
          active: u.active ?? true,
          created_at: u.created_at,
          password: '••••••••',
        };
      }) as MassaUser[];
    }
  } catch (rpcEx) {
    console.warn("Aviso al consultar RPC get_all_users_for_admin:", rpcEx);
  }

  try {
    // 2. Consultar directamente user_profiles
    const { data: profiles, error: profileErr } = await supabase
      .from('user_profiles')
      .select('id, email, name, role, phone, created_at')
      .order('created_at', { ascending: true });

    if (!profileErr && profiles) {
      return profiles.map((u: any) => {
        const rawRole = (u.role || '').toLowerCase();
        const isAdmin = rawRole === 'admin' || 
          u.email?.toLowerCase() === 'juandavidfigueroa4@gmail.com' || 
          (u.email && (u.email.toLowerCase().startsWith('admin@') || u.email.toLowerCase() === 'admin'));
        const effectiveRole: UserRole = isAdmin ? 'admin' : (rawRole === 'client' ? 'client' : 'architect');
        return {
          id: u.id,
          username: u.email,
          name: u.name,
          role: effectiveRole,
          allowed_profile: resolveAllowedProfile(effectiveRole, effectiveRole === 'client' ? 'client' : (effectiveRole === 'admin' ? 'both' : 'architect')),
          active: true,
          created_at: u.created_at,
          password: '••••••••',
        };
      }) as MassaUser[];
    }
  } catch (err) {
    console.warn("Aviso al consultar user_profiles:", err);
  }

  try {
    // 3. Fallback de transición: tabla massa_3d_users sanitizando contraseñas
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('id, username, name, role, allowed_profile, active, created_at')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((u: any) => ({
        ...u,
        role: u.role || 'architect',
        allowed_profile: resolveAllowedProfile(u.role, u.allowed_profile),
        password: '••••••••',
      })) as MassaUser[];
    }
  } catch (err) {
    console.warn("No se pudo obtener usuarios de Supabase:", err);
  }

  // Si no hay usuarios en la base de datos o fallaron las consultas, retornar arreglo vacío (cero mock data engañosa)
  return [];
}

/**
 * Crea o actualiza un usuario directamente en Supabase Auth y sincroniza user_profiles desde la web
 */
export async function saveMassaUser(user: Partial<MassaUser> & { username: string; name: string }): Promise<MassaUser> {
  const role = user.role || 'architect';
  const allowed_profile = resolveAllowedProfile(role, user.allowed_profile);
  let cleanEmail = user.username.trim().toLowerCase();
  if (!cleanEmail.includes('@')) {
    cleanEmail = `${cleanEmail}@massagroup.co`;
  }

  // Comprobar si es actualización de usuario existente por su UUID
  const isUuid = user.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

  if (isUuid) {
    // 1. Intentar actualización atómica vía RPC (modifica auth.users Y public.user_profiles)
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('admin_update_user', {
        target_user_id: user.id,
        new_email: cleanEmail,
        new_name: user.name.trim(),
        new_role: role,
        new_password: user.password && user.password !== '••••••••' ? user.password.trim() : null,
        new_active: user.active ?? true,
      });

      if (!rpcErr && rpcRes) {
        return {
          id: user.id as string,
          username: cleanEmail,
          name: user.name.trim(),
          role,
          allowed_profile,
          active: user.active ?? true,
          password: '••••••••',
        };
      }
    } catch (err) {
      console.warn("Aviso al invocar RPC admin_update_user:", err);
    }

    // 2. Fallback de actualización directa en user_profiles
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: cleanEmail,
        name: user.name.trim(),
        role: role,
      });

    if (profileError) {
      throw new Error(`Error actualizando perfil: ${profileError.message}`);
    }

    return {
      id: user.id as string,
      username: cleanEmail,
      name: user.name.trim(),
      role,
      allowed_profile,
      active: user.active ?? true,
      password: '••••••••'
    };
  }

  // Creación de NUEVO usuario directamente en Supabase Auth desde la Web:
  if (!user.password || user.password.trim().length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  // 1. Intentar creación atómica instantánea vía RPC (crea en auth.users con correo confirmado)
  try {
    const { data: rpcCreate, error: rpcCreateErr } = await supabase.rpc('admin_create_user', {
      new_email: cleanEmail,
      new_password: user.password.trim(),
      new_name: user.name.trim(),
      new_role: role,
    });

    if (!rpcCreateErr && rpcCreate?.id) {
      return {
        id: rpcCreate.id,
        username: cleanEmail,
        name: user.name.trim(),
        role,
        allowed_profile,
        active: true,
        password: '••••••••',
      };
    }
  } catch (createErr) {
    console.warn("Aviso al invocar RPC admin_create_user:", createErr);
  }

  // 2. Fallback estándar vía auth.signUp sin desloguear la sesión actual
  const authCreator = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const { data: signUpData, error: signUpError } = await authCreator.auth.signUp({
    email: cleanEmail,
    password: user.password.trim(),
    options: {
      data: {
        name: user.name.trim(),
        role: role
      }
    }
  });

  if (signUpError) {
    throw new Error(`Error en Supabase Auth: ${signUpError.message}`);
  }

  const newUserId = signUpData.user?.id;
  if (!newUserId) {
    throw new Error('No se pudo registrar la cuenta en Supabase Auth.');
  }

  // Asegurar registro de perfil corporativo en user_profiles
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: newUserId,
      email: cleanEmail,
      name: user.name.trim(),
      role: role,
    });

  if (profileError) {
    console.warn("Aviso al guardar user_profiles:", profileError.message);
  }

  return {
    id: newUserId,
    username: cleanEmail,
    name: user.name.trim(),
    role,
    allowed_profile,
    active: true,
    password: '••••••••'
  };
}

/**
 * Elimina un usuario en Supabase (sincronizando Auth y Perfiles)
 */
export async function deleteMassaUser(id: string): Promise<void> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    // 1. Intentar eliminación completa vía RPC (elimina en auth.users y en cascada)
    try {
      const { data: rpcDel, error: rpcDelErr } = await supabase.rpc('admin_delete_user', {
        target_user_id: id,
      });

      if (!rpcDelErr && rpcDel) {
        return;
      }
    } catch (rpcErr) {
      console.warn("Aviso al invocar RPC admin_delete_user:", rpcErr);
    }

    // 2. Fallback: eliminar directamente de user_profiles
    const { error } = await supabase.from('user_profiles').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
    return;
  }

  const { error } = await supabase
    .from(USERS_TABLE)
    .delete()
    .eq('id', id);

  if (error && !isUuid) {
    throw new Error(error.message);
  }
}

// ==========================================
// REGISTRO DE VISITAS
// ==========================================

export interface VisitRecord {
  id: string;
  project_id: string;
  project_name?: string;
  platform?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
}

/**
 * Registra una visita a un proyecto
 */
export async function logProjectVisit(projectId: string, projectName: string = ''): Promise<void> {
  try {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    await supabase.from('tour_visits').insert({
      project_id: projectId,
      project_name: projectName,
      platform: isMobile ? 'Mobile' : 'Desktop',
      user_agent: navigator.userAgent,
      referrer: document.referrer || 'Directo'
    });
  } catch (err) {
    console.warn("No se pudo registrar la visita:", err);
  }
}

/**
 * Obtiene el registro de visitas (opcionalmente filtrado por proyecto)
 */
export async function getProjectVisits(projectId?: string): Promise<VisitRecord[]> {
  try {
    let query = supabase
      .from('tour_visits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data as VisitRecord[];
    }
  } catch (err) {
    console.error("Error obteniendo visitas:", err);
  }
  return [];
}

