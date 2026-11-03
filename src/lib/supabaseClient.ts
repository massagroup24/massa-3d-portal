import { createClient } from '@supabase/supabase-js';

// La clave anon es pública. Las autorizaciones se aplican con RLS en PostgreSQL.
export const supabaseUrl = 'https://nsiglkllgsgilwmdxkuu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zaWdsa2xsZ3NnaWx3bWR4a3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTAzODEsImV4cCI6MjA5NzM2NjM4MX0.pGvHyGlKogUnX9hWcz_Y-bjH5a-53LATWc-x9taCQBw';

export const supabase = createClient(supabaseUrl, supabaseKey);

