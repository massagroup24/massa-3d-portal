import { Project } from './data/tourData';
import { parseStorageReference, resolveStorageReferences, stableStorageReferences } from './lib/storageReferences';

import { supabase, supabaseUrl } from './lib/supabaseClient';
import { authService } from './lib/authService';
export { supabase, supabaseUrl } from './lib/supabaseClient';

const PROJECTS_TABLE = 'projects';
const STORAGE_BUCKET = 'tour-images';

/**
 * Obtiene todos los proyectos de Supabase
 */
export async function getProjectsFromSupabase(): Promise<Project[]> {
  const { data: allowed, error: accessError } = await supabase.rpc('is_platform_admin');
  const isAdmin = !accessError && allowed === true;
  const { data, error } = await supabase.from(isAdmin ? PROJECTS_TABLE : 'public_projects')
    .select('id, data, published_for_client');
  if (error) throw new Error('No se pudo cargar el catálogo: ' + error.message);
  const projects = (data || []).filter(row => row.data && typeof row.data === 'object')
    .map(row => ({ ...row.data, id: row.id, published: row.published_for_client === true } as Project));
  return resolveStorageReferences(supabase, projects, supabaseUrl);
}

export async function getProjectFromSupabase(id: string): Promise<Project | null> {
  return (await getProjectsFromSupabase()).find(project => project.id === id) || null;
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
    .upsert({ id: project.id, data: stableStorageReferences(project, supabaseUrl), published_for_client: project.published === true });

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

  return resolveStorageReferences(supabase, publicUrlData.publicUrl, supabaseUrl);
}

/**
 * Helper para eliminar imágenes de Supabase Storage por su URL pública o ruta
 */
export async function deleteImageFromSupabase(urlOrPath: string): Promise<void> {
  if (!urlOrPath) return;
  try {
    let cleanPath = parseStorageReference(urlOrPath, supabaseUrl)?.path || urlOrPath;
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
export async function verifyUserLogin(username: string, password: string, targetProfile: 'architect' | 'client'):
  Promise<{ success: boolean; user?: MassaUser; error?: string }> {
  const result = await authService.signIn(username, password, targetProfile);
  if (!result.success || !result.user) return { success: false, error: result.error };
  return { success: true, user: { id: result.user.id, username: result.user.email,
    name: result.user.name, role: 'admin', allowed_profile: 'architect', active: true } };
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
 * Devuelve únicamente la identidad administradora verificada.
 */
export async function getMassaUsers(): Promise<MassaUser[]> {
  const user = await authService.getCurrentUser();
  return user ? [{ id: user.id, username: user.email, name: user.name, role: 'admin',
    allowed_profile: 'architect', active: true }] : [];
}

// El modelo de cuenta única no admite altas, cambios de identidad ni bajas desde el navegador.
export async function saveMassaUser(_user: Partial<MassaUser> & { username: string; name: string }): Promise<MassaUser> {
  throw new Error('La plataforma utiliza una única cuenta administradora. Gestiona su identidad desde Supabase Auth.');
}
export async function deleteMassaUser(_id: string): Promise<void> {
  throw new Error('No se puede eliminar la única cuenta administradora desde la plataforma.');
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

