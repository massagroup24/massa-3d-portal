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
      projects.push(row.data as Project);
    });
  }
  return projects;
}

/**
 * Guarda o actualiza un proyecto en Supabase
 */
export async function saveProjectToSupabase(project: Project): Promise<void> {
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
