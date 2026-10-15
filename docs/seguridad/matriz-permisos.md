# MASSA VIEW — MATRIZ DE PERMISOS Y SUITE DE PRUEBAS DE SEGURIDAD

> **Estado**: Validado con 32 pruebas automatizadas en Vitest (100% aprobadas)  
> **Fecha de verificación**: 15 de Octubre de 2026  
> **Entorno**: Base de datos PostgreSQL aislada en memoria vía `@electric-sql/pglite` (Zero Cloud Quota, Zero Docker, Zero riesgo a producción)

---

## 1. Resumen Ejecutivo

Para resolver de manera definitiva la exposición de datos y garantizar la segregación de accesos en **MASSA VIEW**, se implementó y validó la matriz de permisos basada en **Row Level Security (RLS)** y funciones `SECURITY DEFINER` con `search_path` protegido.

Dado el límite de proyectos de la capa gratuita de Supabase (máximo 2 proyectos por organización), la suite de pruebas se ejecuta de forma autónoma, reproducible y ultrarrápida usando **PGlite** (PostgreSQL compilado a WebAssembly en Node.js), simulando exactamente los roles y políticas de Supabase (`anon` y `authenticated` con claims JWT `sub`).

---

## 2. Matriz General de Permisos (Por Rol y Objeto)

| Objeto / Tabla | Visitante Anónimo (`anon`) | Cliente Asignado (`client`) | Arquitecto Líder (`architect`) |
| :--- | :--- | :--- | :--- |
| **`public.projects`** | ❌ Denegado (`0 rows`) | 👁️ SELECT solo asignados y `published_for_client = true` | ⚡ CRUD Total (Publicados y Borradores) |
| **`public.public_tours_360`** *(Vista)* | 👁️ SELECT Sanitizado (`id`, `data`) | 👁️ SELECT Sanitizado (`id`, `data`) | ⚡ CRUD sobre tabla base |
| **`public.user_profiles`** | ❌ Denegado (`0 rows`) | 👁️ SELECT solo su propio registro (`id = auth.uid()`) | ⚡ CRUD Total (Gestión de usuarios y clientes) |
| **`public.project_members`** | ❌ Denegado (`0 rows`) | 👁️ SELECT solo sus asignaciones (`user_id = auth.uid()`) | ⚡ CRUD Total (Asignar/Desasignar clientes) |
| **`public.project_media`** | ❌ Denegado (`0 rows`) | 👁️ SELECT solo si `published = true` y tiene acceso al proyecto | ⚡ CRUD Total (Renders, planos y modelos) |
| **`public.progress_updates`** | ❌ Denegado (`0 rows`) | 👁️ SELECT solo si `published = true` y tiene acceso al proyecto | ⚡ CRUD Total (Crear, publicar y editar hitos) |
| **`public.progress_media`** | ❌ Denegado (`0 rows`) | 👁️ SELECT solo si el hito padre está publicado | ⚡ CRUD Total (Subir fotos y videos de obra) |
| **`public.tour_visits`** | ✍️ INSERT Only (Registro de analítica de tours) | ✍️ INSERT Only | 👁️ SELECT y Análisis de Métricas |
| **Storage: `tour-images`** | 👁️ Lectura Pública (360° panos) | 👁️ Lectura Pública | ⚡ Subida y administración total |
| **Storage: `project-vault`** | ❌ Denegado | 👁️ SELECT solo carpeta de su proyecto (`projects/:id/*`) | ⚡ Subida y administración total |

---

## 3. Escenarios Críticos Verificados por la Suite

### A. Visitante Anónimo (`tests/security/anon.test.ts` — 11 pruebas)
1. **Preservación de Tours 360°**: El visitante puede abrir cualquier enlace `/tour/:id` consultando la vista sanitizada `public.public_tours_360` y descargando los panoramas del bucket `tour-images`.
2. **Protección de Datos Privados**: No puede consultar la tabla `projects` directamente; no tiene visibilidad de teléfonos, WhatsApps, notas ni borradores del arquitecto.
3. **Bloqueo Total de Tablas Internas**: Intentos de `SELECT` en `user_profiles`, `project_members`, `project_media`, `progress_updates` y `progress_media` devuelven estrictamente 0 filas.
4. **Analítica Segura**: Puede insertar un nuevo evento en `tour_visits`, pero la política deniega `SELECT`, `UPDATE` y `DELETE` para evitar manipulación o lectura de estadísticas por terceros.
5. **Bóveda Privada Protegida**: Intentos de acceso a archivos del bucket `project-vault` devuelven 0 filas.

### B. Clientes Autenticados y Aislamiento Cruzado (`tests/security/client.test.ts` — 10 pruebas)
1. **Visibilidad Estricta de Proyectos**: El Cliente A únicamente ve su proyecto asignado (`PROY-ALPHA`) y solo si `published_for_client = true`.
2. **Aislamiento Multinquilino**: El Cliente A no puede ver proyectos de otros clientes (`PROY-BETA`) ni borradores internos (`PROY-GAMMA`). El Cliente B únicamente ve `PROY-BETA`.
3. **Filtrado de Contenido No Publicado**: Dentro de su propio proyecto, el cliente solo ve los medios técnicos (`project_media`) e hitos (`progress_updates`) con la bandera `published = true`. Planos confidenciales o notas preliminares permanecen invisibles.
4. **Protección de Identidad y Perfil**: El cliente solo puede leer su propio perfil.
5. **Inmunidad contra Escalada de Privilegios**: Cualquier intento de actualizar su propio registro a `role = 'architect'` es rechazado por las políticas `WITH CHECK (is_architect())`.
6. **Inmutabilidad de Proyectos**: Los clientes no tienen permiso de `INSERT`, `UPDATE` ni `DELETE` sobre proyectos.
7. **Bóveda de Archivos Aislada**: En Storage (`project-vault`), el cliente solo puede listar y descargar objetos bajo la ruta `projects/PROY-ALPHA/*`.

### C. Arquitecto Líder (`tests/security/architect.test.ts` — 7 pruebas)
1. **Control Total de Proyectos**: Acceso irrestricto a proyectos publicados y en borrador (`PROY-ALPHA`, `PROY-BETA`, `PROY-GAMMA`).
2. **Operaciones CRUD**: Permisos completos para crear nuevos proyectos, actualizar estados, porcentajes y eliminar registros.
3. **Gestión de Personal y Clientes**: Puede consultar y administrar todos los perfiles en `user_profiles`.
4. **Gestión Técnica y Avances**: Control total sobre medios y bitácora de obra, incluyendo elementos no publicados.
5. **Métricas de Visitas**: Lectura completa de analíticas en `tour_visits`.
6. **Acceso a Bóveda**: Acceso global de lectura y escritura en `project-vault` y `tour-images`.

### D. Seguridad e Integridad Transversal (`tests/security/transversal.test.ts` — 4 pruebas)
1. **RLS Forzado en Esquema Público**: Se verifica mediante el catálogo de PostgreSQL (`pg_tables.rowsecurity = true`) que todas las tablas del modelo tienen RLS activado.
2. **Cero Contraseñas en Texto Plano**: Se verifica mediante `information_schema.columns` que la nueva estructura `user_profiles` no contiene columnas de contraseñas ni PINs.
3. **Proyección Sanitizada de Tours**: La vista `public_tours_360` solo proyecta `id` y `data`, excluyendo datos de contacto del arquitecto y metadatos internos.
4. **Protección contra Search Path Hijacking**: Todas las funciones `SECURITY DEFINER` (`is_architect`, `client_has_project`, `handle_updated_at`) tienen fijado explícitamente su `search_path = public, auth`.

---

## 4. Resultados de Ejecución de la Suite Automatizada

```bash
$ npm run test:security

 RUN  v2.1.9 C:/Users/Juan David/Desktop/PROYECTO OBRAS Y CLIENTES MASSA

 ✓ tests/security/transversal.test.ts (4 tests) 12.7s
 ✓ tests/security/anon.test.ts (11 tests) 12.7s
 ✓ tests/security/architect.test.ts (7 tests) 12.7s
 ✓ tests/security/client.test.ts (10 tests) 12.8s

 Test Files  4 passed (4)
      Tests  32 passed (32)
   Duration  15.04s
```

---

## 5. Integración Continua (GitHub Actions)

Para asegurar que ninguna migración futura rompa las políticas de seguridad, se puede incorporar el siguiente workflow en `.github/workflows/security-tests.yml`:

```yaml
name: Security & Permissions Test Suite

on:
  push:
    branches: [main, chore/*, feat/*]
  pull_request:
    branches: [main]

jobs:
  test-security:
    name: Verify RLS & Permission Matrix
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Security Permission Suite
        run: npm run test:security
```
