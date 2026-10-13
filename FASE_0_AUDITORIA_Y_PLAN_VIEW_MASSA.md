# PLAN ARQUITECTÓNICO CORREGIDO - FASE 0 (v2.0)
## PLATAFORMA "VIEW" by MASSA GROUP
**Documento Técnico de Aprobación Final**
**Fecha:** 13 de Octubre de 2026 | **Versión:** 2.0.0 (Fase 0: Auditoría & Arquitectura de Producción)

---

## 1. MODELO DE DATOS RELACIONAL Y POLÍTICAS RLS EN SUPABASE

### 1.1 Principio de Separación Arquitectónica
- **`projects.data` (JSONB existente):** Se mantiene **intacto y exclusivo** para la metadata del recorrido 360° (`rooms`, `initialRoomId`, `minimapImage`, `thumbnail`, `name`, `description`). **NO** se almacenan renders, planos, modelos 3D ni avances dentro de este JSON.
- **Tablas Relacionales Nuevas:** Todo el contenido del portal cliente/arquitecto se gestiona en tablas relacionales normalizadas con claves foráneas, índices y seguridad a nivel de fila (RLS).
- **Filtrado en Base de Datos:** El estado de publicación (`published = true`) y la asignación de cliente se evalúan mediante políticas RLS en PostgreSQL, impidiendo que datos no autorizados viajen al navegador.

### 1.2 Script SQL de Migración (Esquema Completo)

```sql
-- =========================================================================
-- ESQUEMA RELACIONAL Y RLS PARA "VIEW" BY MASSA GROUP (v2.0)
-- =========================================================================

-- 1. EXTENDER TABLA 'projects' EXISTENTE CON COLUMNAS RELACIONALES
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS current_phase TEXT DEFAULT 'Fase 1',
  ADD COLUMN IF NOT EXISTS current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0 AND current_progress <= 100),
  ADD COLUMN IF NOT EXISTS architect_name TEXT DEFAULT 'Mateo Rossi',
  ADD COLUMN IF NOT EXISTS architect_role TEXT DEFAULT 'Arquitecto Líder MASSA',
  ADD COLUMN IF NOT EXISTS architect_avatar TEXT,
  ADD COLUMN IF NOT EXISTS architect_phone TEXT,
  ADD COLUMN IF NOT EXISTS architect_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS published_for_client BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. TABLA DE PERFILES DE USUARIO (Vinculada a Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'architect', 'admin')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE ASIGNACIÓN: MIEMBROS DE PROYECTOS (Clientes ↔ Proyectos)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'architect', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, user_id)
);

-- 4. TABLA DE MEDIOS: RENDERS, PLANOS Y MODELO 3D
CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('render', 'blueprint', 'model_3d')),
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Ruta privada en el bucket 'project-vault'
  thumbnail_path TEXT,
  category TEXT,              -- ej: 'Fachada', 'Interior', 'Nivel 1 - Planta Baja'
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb, -- Capas 3D, archivo PDF de planos, etc.
  published BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA DE AVANCE DE OBRA (SEGUIMIENTO CRONOLÓGICO)
CREATE TABLE IF NOT EXISTS public.progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  phase_title TEXT NOT NULL,
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array de rutas privadas de Storage
  before_after JSONB, -- { before_path, after_path, label_before, label_after }
  published BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_media_proj ON public.project_media(project_id, type, published);
CREATE INDEX IF NOT EXISTS idx_progress_updates_proj ON public.progress_updates(project_id, published, recorded_at DESC);

-- =========================================================================
-- FUNCIONES AUXILIARES Y POLÍTICAS RLS (SEGURIDAD EN BASE DE DATOS)
-- =========================================================================

-- Función para verificar si el usuario es staff (Arquitecto o Admin)
CREATE OR REPLACE FUNCTION public.is_massa_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('architect', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si el usuario tiene acceso al proyecto
CREATE OR REPLACE FUNCTION public.has_project_access(p_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT public.is_massa_staff() OR EXISTS (
    SELECT 1 FROM public.project_members pm
    JOIN public.projects p ON p.id = pm.project_id
    WHERE pm.project_id = p_id 
      AND pm.user_id = auth.uid() 
      AND p.published_for_client = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: user_profiles
CREATE POLICY "Users can read own profile or staff reads all"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id OR public.is_massa_staff());

CREATE POLICY "Staff can manage user profiles"
  ON public.user_profiles FOR ALL
  USING (public.is_massa_staff())
  WITH CHECK (public.is_massa_staff());

-- POLÍTICAS: projects
CREATE POLICY "Staff full access on projects"
  ON public.projects FOR ALL
  USING (public.is_massa_staff())
  WITH CHECK (public.is_massa_staff());

CREATE POLICY "Clients can view assigned and published projects"
  ON public.projects FOR SELECT
  USING (
    published_for_client = true AND EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- POLÍTICAS: project_members
CREATE POLICY "Staff manages project members"
  ON public.project_members FOR ALL
  USING (public.is_massa_staff())
  WITH CHECK (public.is_massa_staff());

CREATE POLICY "Clients can view their own memberships"
  ON public.project_members FOR SELECT
  USING (user_id = auth.uid());

-- POLÍTICAS: project_media
CREATE POLICY "Staff full access on project_media"
  ON public.project_media FOR ALL
  USING (public.is_massa_staff())
  WITH CHECK (public.is_massa_staff());

CREATE POLICY "Clients can view only published media of their projects"
  ON public.project_media FOR SELECT
  USING (
    published = true AND public.has_project_access(project_id)
  );

-- POLÍTICAS: progress_updates
CREATE POLICY "Staff full access on progress_updates"
  ON public.progress_updates FOR ALL
  USING (public.is_massa_staff())
  WITH CHECK (public.is_massa_staff());

CREATE POLICY "Clients can view only published progress updates of their projects"
  ON public.progress_updates FOR SELECT
  USING (
    published = true AND public.has_project_access(project_id)
  );
```

---

## 2. SEGURIDAD Y PLAN DE MIGRACIÓN A SUPABASE AUTH

### 2.1 Diagnóstico de Vulnerabilidades Actuales
1. **Fuga de PIN en Payload JSON:** En el estado actual, el atributo `pin: "1234"` viaja embebido dentro de `projects.data`. Cualquier visitante con DevTools abierto en la pestaña Red puede extraer el PIN del configurador.
2. **Contraseñas en Texto Plano:** La tabla transitoria `massa_3d_users` almacena y verifica contraseñas en texto claro sin hashing bcrypt/argon2.
3. **Archivos Expuestos Públicamente:** El bucket `tour-images` tiene acceso anónimo de lectura pública (`getPublicUrl`), lo que expondría planos y avances confidenciales de clientes.

### 2.2 Estrategia de Migración Suave (Sin Romper Accesos)
1. **Fase Puente (Dual Authentication):**
   - Se activan las cuentas de arquitecto (`admin@massagroup.com`, `juan@massagroup.com`) en `auth.users` de Supabase con contraseñas seguras y perfiles en `user_profiles`.
   - Se mantiene un adaptador en `src/supabase.ts` que primero intenta `supabase.auth.signInWithPassword()`. Si no existe sesión en Supabase Auth, efectúa la validación transitoria con `massa_3d_users` emitiendo advertencia de actualización.
2. **Eliminación del PIN del Front-End:**
   - La autorización para editar o configurar proyectos deja de depender de un PIN en el cliente. Se valida estrictamente mediante el JWT del usuario autenticado (`role === 'architect' || role === 'admin'`).
3. **Almacenamiento Privado con URLs Firmadas:**
   - Se crea el bucket privado **`project-vault`** con RLS habilitado.
   - Las imágenes y PDFs confidenciales de clientes nunca tienen URL pública directa. El cliente solicita una URL firmada temporal:
     ```typescript
     export async function getSignedMediaUrl(path: string, expiresIn = 3600): Promise<string> {
       const { data, error } = await supabase.storage
         .from('project-vault')
         .createSignedUrl(path, expiresIn);
       if (error || !data) throw error;
       return data.signedUrl;
     }
     ```
   - Las URLs firmadas se cachean en memoria con un TTL de 50 minutos para evitar peticiones repetitivas a la API de Storage.
   - El bucket existente `tour-images` permanece abierto únicamente para las texturas equirectangulares de recorridos 360° ya publicados.

---

## 3. RETROCOMPATIBILIDAD Y NORMALIZACIÓN DEFENSIVA

### 3.1 Puntos de Guardado de `projects.data`
Se auditaron todos los puntos donde se invoca `saveProjectToSupabase` (`ProjectConfigurator.tsx` y `App.tsx`):
- Se constata que la operación `upsert({ id: project.id, data: project })` sustituye el objeto `data`.
- **Garantía:** Los componentes que editan recorridos 360° (`ProjectConfigurator.tsx`) seguirán guardando exactamente la misma estructura `{ id, name, thumbnail, description, minimapImage, initialRoomId, rooms }`. No se inyectará ningún campo relacional en `data`.

### 3.2 Función de Normalización Defensiva (`normalizeProject`)
Para blindar la app contra tours antiguos con datos ausentes o campos incompletos, se implementa la función en `src/data/tourData.ts`:

```typescript
export function normalizeProject(raw: any): Project {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Formato de proyecto inválido.');
  }

  const id = String(raw.id || `project_${Date.now()}`);
  const name = String(raw.name || 'Proyecto sin título');
  const description = String(raw.description || '');
  const thumbnail = String(raw.thumbnail || '/placeholder.svg');
  const minimapImage = String(raw.minimapImage || '');
  
  // Normalización estricta de habitaciones y hotspots
  const rawRooms = raw.rooms && typeof raw.rooms === 'object' ? raw.rooms : {};
  const rooms: Record<string, Room> = {};

  for (const [roomId, roomData] of Object.entries<any>(rawRooms)) {
    if (!roomData) continue;
    const hotspots: Hotspot[] = Array.isArray(roomData.hotspots)
      ? roomData.hotspots
          .filter((h: any) => h && Array.isArray(h.position) && h.position.length === 3)
          .map((h: any) => ({
            id: String(h.id || `h_${Math.random()}`),
            position: [Number(h.position[0]) || 0, Number(h.position[1]) || 0, Number(h.position[2]) || 0] as [number, number, number],
            targetRoom: String(h.targetRoom || ''),
            label: String(h.label || '')
          }))
      : [];

    rooms[roomId] = {
      id: roomId,
      name: String(roomData.name || 'Habitación'),
      description: String(roomData.description || ''),
      imageUrl: String(roomData.imageUrl || ''),
      minimapPosition: {
        x: typeof roomData.minimapPosition?.x === 'number' ? roomData.minimapPosition.x : 50,
        y: typeof roomData.minimapPosition?.y === 'number' ? roomData.minimapPosition.y : 50,
      },
      hotspots
    };
  }

  const roomKeys = Object.keys(rooms);
  const initialRoomId = raw.initialRoomId && rooms[raw.initialRoomId] 
    ? raw.initialRoomId 
    : (roomKeys[0] || 'room_1');

  return {
    id,
    name,
    description,
    thumbnail,
    minimapImage,
    initialRoomId,
    rooms
  };
}
```

---

## 4. ARQUITECTURA WEBGL Y CICLO DE VIDA DE MEMORIA

### 4.1 Principio de Contexto Único
En ningún momento conviven dos instancias activas de `<Canvas>` en el DOM:
- **Carga diferida:** Tanto el visor 360° (`TourContainer.tsx`) como el visor de modelo 3D (`Model3DViewer.tsx`) se cargan mediante `React.lazy()` y `<Suspense>`.
- Al cambiar de sección en el portal, el visor previo se desmonta completamente antes de instanciar el nuevo.

### 4.2 Liberación Explícita de Recursos (Disposal)
Al desmontar cualquier componente Three.js, se ejecuta un hook de limpieza profunda que recorre el grafo de la escena y destruye texturas, geometrías y materiales:

```typescript
export function disposeThreeScene(scene: THREE.Scene, renderer?: THREE.WebGLRenderer) {
  scene.traverse((object: any) => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(m => disposeMaterial(m));
      } else {
        disposeMaterial(object.material);
      }
    }
  });

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
}

function disposeMaterial(mat: THREE.Material) {
  mat.dispose();
  for (const key of Object.keys(mat)) {
    const value = (mat as any)[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      (value as THREE.Texture).dispose();
    }
  }
}
```

### 4.3 Optimizaciones Clave para Móviles
- **Límite de Resolución de Textura:** Detección de dispositivos móviles (`window.innerWidth < 768` o GPU con memoria restringida) para limitar texturas equirectangulares a máximo 4096×2048 o 2048×1024 px.
- **On-Demand Rendering en Modelo 3D:** El visor de modelo `.glb` utiliza `<Canvas frameloop="demand">`. No ejecuta bucle continuo de 60fps; solo redibuja cuando el usuario interactúa con `OrbitControls` o conmuta una capa arquitectónica.
- **Compresión Draco / Meshopt:** Uso de `useGLTF` con decodificador Draco en Web Workers para no bloquear el hilo principal.
- **Gestión de Context Lost:** Escucha activa de `webglcontextlost` (invocando `event.preventDefault()`) y `webglcontextrestored` para reanudar el render sin fallo crítico.
- **Verificación en Desarrollo:** Exposición de métricas vía `renderer.info.memory` (`geometries`, `textures`) en consola durante pruebas.

---

## 5. ANIMACIONES Y RENDIMIENTO (ESTRATEGIA 60 FPS)

1. **LazyMotion en Framer Motion:**
   - La aplicación se encapsula en `<LazyMotion features={domAnimation} strict>`, reduciendo el peso del bundle de animaciones en ~35 kB.
2. **Efectos Continuos Fuera del Hilo de React:**
   - **Burbujas/Orbes difusos de fondo:** Ejecutados en CSS puro con `@keyframes` y aceleración por GPU (`transform: translate3d(...)`).
   - **Brillo verde de cursor (Spotlight):** Actualiza variables CSS `--mouse-x` y `--mouse-y` vía listener directo en `window` con `requestAnimationFrame`, sin disparar re-renders en componentes de React.
   - **Levitación de iconos flotantes:** Animación CSS sutil con `animation-timing-function: ease-in-out`.
3. **Condicional Táctil Estricto (Sin Tilt en Móvil):**
   - El efecto 3D tilt/parallax se activa **únicamente** ante punteros tipo mouse (`window.matchMedia('(pointer: fine)').matches`). En pantallas táctiles queda desactivado para evitar interferir con el scroll vertical y ahorrar ciclos de GPU.
4. **Pausa de Efectos con WebGL Activo:**
   - Cuando la sección activa es "Recorrido 360°" o "Modelo 3D", se añade la clase `data-webgl-active="true"`, la cual:
     - Pausa las animaciones de los orbes difusos de fondo (`animation-play-state: paused`).
     - Desactiva el filtro pesado `backdrop-filter: blur(25px)` sobre los paneles superpuestos al canvas, sustituyéndolo por un fondo sólido carbón translúcido (`rgba(23, 23, 23, 0.88)`).

---

## 6. SISTEMA DE SUBIDAS RESILIENTE EN OBRA (INDEXEDDB + TUS)

Para garantizar que los arquitectos puedan registrar avances desde la obra sin pérdida de información ante micro-cortes 4G/3G:

```
[Smartphone en Obra]
       │ (1) Selección de foto/video o cámara
       ▼
[Compresión WebP en Cliente (imageCompressor.ts)]
       │ (2) Generación de idempotency key: crypto.randomUUID()
       ▼
[Registro en IndexedDB: Cola Local (upload_queue)]
       │ (3) Estado inicial: 'queued'
       ▼
[Subida Reanudable vía TUS (Supabase Storage)]
       │── Reintentos automáticos con espera exponencial
       │── Opción configurable: "Subir solo con Wi-Fi"
       │── Reanudación al detectar 'window.online' o reabrir la app (sin depender de Background Sync de iOS)
       ▼ (4) Éxito en Storage (HTTP 200/201)
[Inserción Relacional en Supabase (project_media / progress_updates)]
       │ (5) Estado final: 'published' o 'draft'
       ▼
[Limpieza de la Cola Local en IndexedDB]
```

### 6.1 Estructura del Registro en IndexedDB
```typescript
export interface QueuedUpload {
  id: string; // crypto.randomUUID()
  projectId: string;
  type: 'render' | 'blueprint' | 'progress_photo' | 'model_3d';
  fileBlob: Blob;
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata: Record<string, any>;
  status: 'queued' | 'compressing' | 'uploading' | 'completed' | 'failed';
  progressPercentage: number;
  retryCount: number;
  errorMessage?: string;
  createdAt: number;
}
```

### 6.2 Reglas de Transaccionalidad
1. **Nunca se publica contenido huérfano:** La fila en `project_media` o `progress_updates` **solo** se inserta después de recibir confirmación exitosa de la subida a Storage.
2. **Interfaz de Cola Visible:** Un indicador flotante en la vista del arquitecto muestra el progreso individual por archivo, con botón para pausar o reintentar individualmente.
3. **Escucha de Conectividad:** Se asocia a `window.addEventListener('online', resumeUploadQueue)`.

---

## 7. CÁLCULO DINÁMICO DE FECHAS ("Actualizado hoy")

En la base de datos se almacena la marca de tiempo ISO real `updated_at: TIMESTAMPTZ`.
La etiqueta del Héroe se calcula en tiempo de ejecución en el cliente:

```typescript
export function formatProjectUpdateTag(updatedAtString?: string): string {
  if (!updatedAtString) return 'RECIENTE';

  const updateDate = new Date(updatedAtString);
  const now = new Date();
  const diffMs = now.getTime() - updateDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24 && updateDate.getDate() === now.getDate()) {
    return 'ACTUALIZADO HOY';
  }
  if (diffHours < 48) {
    return 'ACTUALIZADO AYER';
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `ACTUALIZADO HACE ${diffDays} DÍAS`;
  }
  return `ACTUALIZADO EL ${updateDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).toUpperCase()}`;
}
```

---

## 8. PLAN DE TRANSICIÓN Y PRÓXIMOS PASOS

```
[FASE 0: COMPLETADA Y CORREGIDA]
   - Aprobación de la arquitectura relacional, RLS, WebGL, Framer Motion y subidas IndexedDB.
   - Espera de confirmación final del usuario.
       ↓
[FASE 1: INICIO INMEDIATO TRAS CONFIRMACIÓN]
   1. Creación de la rama Git: `feature/portal-view-massa`.
   2. Configuración de tokens en `src/index.css` y variables de Tailwind.
   3. Creación del kit de componentes visionOS: `GlassCard`, `Button`, `OrbBackground`, `Dock`, `MobileNavBar`.
   4. Creación de la pantalla de Login con selector de perfiles (Cliente / Arquitecto) y diseño de Stitch.
```
