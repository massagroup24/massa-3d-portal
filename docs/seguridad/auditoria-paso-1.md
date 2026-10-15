# Informe de Auditoría de Exposición Actual (Paso 1)
**Proyecto:** MASSA VIEW (Supabase Backend)  
**Fecha:** 15 de Octubre, 2026  
**Rama:** `chore/seguridad-respaldos-pruebas`  
**Modalidad:** Solo Lectura con llave pública (`anon`) de Producción  

---

## 1. Resumen Ejecutivo de Hallazgos

| # | Recurso / Componente | Hallazgo | Gravedad | Estado RLS / Permisos | Evidencia Enmascarada | Corrección Recomendada |
|---|----------------------|----------|----------|-----------------------|-----------------------|------------------------|
| **H1** | `public.massa_3d_users` | Exposición de credenciales completas en texto plano (contraseñas legibles y modificables por anon) | **CRÍTICA** | RLS activo con política permisiva `USING (true)` y `WITH CHECK (true)` | Usuarios: `editor`, `admin`, `juan`. Contraseñas visibles: `••••••••` | Migrar a Supabase Auth (`auth.users`), eliminar contraseñas en texto plano, revocar políticas públicas y restringir a función RPC / Edge Function con service role. |
| **H2** | `public.projects` | Proyectos con `published_for_client = false` y metadatos de contacto son 100% legibles por anon | **ALTA** | Lectura abierta sin RLS restrictivo (`USING (true)`) | 2 proyectos recuperados (`project_1781...`, `project_1782...`), ambos con `published_for_client = false` | Restringir `SELECT` en `projects` mediante RLS: anon solo debe ver el recorrido 360° mediante la vista sanitizada `public.tours_360` o `public_tours_360`. |
| **H3** | `public.projects.data` | Arquitectura de guardado de PIN en el JSON de proyectos | **ALTA** | El PIN de creador visual se almacena en el cliente / JSON de `projects.data` | Código en `ProjectConfigurator.tsx` asocia `pin: "••••"` dentro del payload JSON | Desacoplar la autenticación del configurador del JSON del proyecto; usar roles basados en sesión Supabase Auth y eliminar la clave `pin` de `projects.data`. |
| **H4** | `public.tour_visits` | Visitante anon puede consultar el historial completo de visitas, agentes y orígenes | **MEDIA** | RLS activo con política `Allow anonymous reads of tour_visits USING (true)` | Consulta `SELECT *` responde status 200 con `Content-Range: */0` | Eliminar política `SELECT` para `anon`. Crear únicamente política `FOR INSERT WITH CHECK (true)`. Solo el rol `architect` puede consultar `tour_visits`. |
| **H5** | Storage (`project-vault`) | Bucket de bóveda privada responde con status 200 a peticiones de listado anónimas | **ALTA** | Storage RLS permisivo en `storage.objects` | Petición `POST /storage/v1/object/list/project-vault` responde `200 OK []` sin autenticar | Configurar `project-vault` como bucket privado (`public = false`) y aplicar políticas RLS estrictas en `storage.objects` que requieran membresía activa de proyecto y URLs firmadas. |
| **H6** | Storage (`tour-images`) | Bucket de imágenes 360° permite listado completo de rutas y proyectos | **BAJA / ACEPTABLE** | Público para renders de recorridos 360° | Carpetas detectadas: `projects/project_1781...`, `projects/project_1782...` | Mantener lectura de objetos para que los recorridos compartidos funcionen, pero restringir `INSERT/UPDATE/DELETE` a `authenticated` con rol arquitecto. |
| **H7** | Código fuente (`src/`, `dist/`) | Búsqueda de `service_role` o JWTs de servicio | **INFORMATIVO / CONFORME** | Protegido | No se encontraron llaves `service_role` en `src/` ni en `dist/` | Mantener la regla: la service role key solo se almacena en variables de entorno locales ignoradas por git. |
| **H8** | Historial de Git | Búsqueda de archivos `.env` o secretos en commits pasados | **INFORMATIVO / CONFORME** | Protegido | 0 archivos `.env` commiteados en el árbol histórico de Git | Mantener actualizados `.gitignore` con `.env`, `.env.*`, `.env.test.local`, `.env.backup.local`. |

---

## 2. Detalle de Pruebas Realizadas

### A. Consulta a Tablas de Usuarios: `massa_users` vs `massa_3d_users`
- **Resultado:** La tabla `massa_users` **NO existe** en Supabase (error `PGRST205: Could not find the table 'public.massa_users' in the schema cache`). No hay tablas duplicadas.
- **Tabla real activa:** `public.massa_3d_users`.
- **Vulnerabilidad detectada:** Una petición `GET /rest/v1/massa_3d_users?select=*` con el header `apikey: <anon_key>` devuelve el listado completo de usuarios con columnas:
  `["id", "username", "password", "name", "role", "active", "created_at"]`.
  Las contraseñas de las cuentas institucionales y de administración general están almacenadas en texto plano y expuestas a cualquier cliente web.

### B. Consulta a `public.projects`
- **Resultado:** Petición `GET /rest/v1/projects?select=*` devuelve los 2 proyectos existentes en base de datos.
- Ambas filas presentan `published_for_client = false`. Un visitante sin sesión puede leer la bitácora, teléfonos del arquitecto, estados de avance y estructura espacial de proyectos no publicados.

### C. Consulta a `public.tour_visits`
- **Resultado:** Petición `GET /rest/v1/tour_visits?select=*` con `anon` responde `200 OK`. La política actual `Allow anonymous reads of tour_visits` otorga permisos de lectura indiscriminada.

### D. Buckets de Storage
- `tour-images`: Operativo y accesible para visualización de recorridos 360°.
- `project-vault`: Responde `200 OK` a peticiones de listado. Requiere blindaje para restringir descargas únicamente a URLs firmadas generadas por miembros autorizados.

---

## 3. Próximos Pasos (Pendiente de Aprobación)
Una vez recibido el **OK** del usuario:
1. **Paso 2:** Diseño e implementación del sistema de respaldos descargables (BD + Storage), cifrado con retención y prueba de restauración.
2. **Paso 3:** Configuración paso a paso del proyecto de pruebas aislado y script de siembra.
3. **Paso 4:** Creación de la suita de pruebas de permisos en Vitest (`tests/security/`).
