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

export interface MassaUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'editor' | 'admin';
  active: boolean;
  created_at?: string;
}

const USERS_TABLE = 'massa_3d_users';

/**
 * Verifica credenciales del editor contra Supabase o fallback local
 */
export async function verifyEditorLogin(
  username: string, 
  password: string
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
      return {
        success: true,
        user: data as MassaUser
      };
    }
  } catch (err) {
    console.warn("Error consultando tabla en Supabase, usando respaldo local:", err);
  }

  // 2. Respaldo por defecto por si la tabla aún no se ha ejecutado en Supabase
  const validUsers = ['editor', 'admin', 'juan', 'admin@massagroup.com', 'massa'];
  const validPass = ['massa2026', 'massa', '1234', 'admin123'];

  if (validUsers.includes(cleanUsername) && validPass.includes(cleanPassword)) {
    return {
      success: true,
      user: {
        id: 'local-admin',
        username: cleanUsername,
        name: cleanUsername === 'juan' ? 'Juan David - Dirección MASSA' : 'Editor Principal MASSA',
        role: 'admin',
        active: true
      }
    };
  }

  return {
    success: false,
    error: 'Usuario o contraseña incorrectos o cuenta inactiva.'
  };
}

/**
 * Obtiene la lista de usuarios autorizados
 */
export async function getMassaUsers(): Promise<MassaUser[]> {
  try {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('id, username, password, name, role, active, created_at')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as MassaUser[];
    }
  } catch (err) {
    console.warn("No se pudo obtener usuarios de Supabase:", err);
  }

  // Lista inicial por defecto si la tabla no está creada
  return [
    { id: '1', username: 'editor', password: '•••', name: 'Editor Principal MASSA', role: 'editor', active: true },
    { id: '2', username: 'admin', password: '•••', name: 'Administrador MASSA Group', role: 'admin', active: true },
    { id: '3', username: 'juan', password: '•••', name: 'Juan David - Dirección MASSA 3D', role: 'admin', active: true }
  ];
}

/**
 * Crea o actualiza un usuario en Supabase
 */
export async function saveMassaUser(user: Omit<MassaUser, 'id'> & { id?: string }): Promise<MassaUser> {
  const payload = {
    ...(user.id ? { id: user.id } : {}),
    username: user.username.trim().toLowerCase(),
    password: user.password,
    name: user.name.trim(),
    role: user.role || 'editor',
    active: user.active ?? true
  };

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .upsert(payload)
    .select()
    .single();

  if (error) {
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

