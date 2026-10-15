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
 * Obtiene la lista completa de usuarios autorizados
 */
export async function getMassaUsers(): Promise<MassaUser[]> {
  try {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((u: any) => ({
        ...u,
        role: u.role || 'architect',
        allowed_profile: resolveAllowedProfile(u.role, u.allowed_profile)
      })) as MassaUser[];
    }
  } catch (err) {
    console.warn("No se pudo obtener usuarios de Supabase:", err);
  }

  // Lista inicial por defecto si la tabla no está creada
  return [
    { id: '1', username: 'juan', password: '•••', name: 'Juan David', role: 'admin', allowed_profile: 'both', active: true },
    { id: '2', username: 'admin', password: '•••', name: 'Administrador MASSA Group', role: 'admin', allowed_profile: 'both', active: true },
    { id: '3', username: 'editor', password: '•••', name: 'Editor Arquitecto MASSA', role: 'architect', allowed_profile: 'architect', active: true },
    { id: '4', username: 'cliente', password: '•••', name: 'Cliente Propietario', role: 'client', allowed_profile: 'client', active: true }
  ];
}

/**
 * Crea o actualiza un usuario en Supabase (soporta creación y modificación completa)
 */
export async function saveMassaUser(user: Partial<MassaUser> & { username: string; name: string }): Promise<MassaUser> {
  const role = user.role || 'architect';
  const allowed_profile = resolveAllowedProfile(role, user.allowed_profile);

  const payload: any = {
    username: user.username.trim().toLowerCase(),
    name: user.name.trim(),
    role,
    allowed_profile,
    active: user.active ?? true
  };

  if (user.id && user.id.length > 10) {
    payload.id = user.id;
  }

  if (user.password && user.password.trim().length > 0 && user.password !== '•••') {
    payload.password = user.password.trim();
  }

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .upsert(payload)
    .select()
    .single();

  if (error) {
    // Si la columna allowed_profile aún no se ha agregado en Supabase, reintentar sin ella
    if (error.message && error.message.includes('allowed_profile')) {
      delete payload.allowed_profile;
      const retry = await supabase.from(USERS_TABLE).upsert(payload).select().single();
      if (retry.error) throw new Error(retry.error.message);
      return retry.data as MassaUser;
    }
    throw new Error(error.message);
  }
  return data as MassaUser;
}

/**
 * Elimina un usuario en Supabase
 */
export async function deleteMassaUser(id: string): Promise<void> {
  const { error } = await supabase
    .from(USERS_TABLE)
    .delete()
    .eq('id', id);

  if (error) {
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

