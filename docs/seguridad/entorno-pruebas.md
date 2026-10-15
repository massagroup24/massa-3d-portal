# Manual de Configuración: Entorno Aislado de Pruebas y Siembra de Datos (Paso 3)
**Proyecto:** MASSA VIEW (MASSA GROUP)  
**Versión:** 1.0  
**Fecha:** 15 de Octubre, 2026  
**Rama de Trabajo:** `chore/seguridad-respaldos-pruebas`  

---

## 1. Objetivo del Entorno de Pruebas

El propósito de este entorno es disponer de una **instancia de Supabase 100% aislada e independiente de producción**, donde sea posible:
1. Validar el esquema relacional v2.2 y todas las políticas RLS.
2. Ejecutar la suita automatizada de pruebas de permisos (Paso 4) con usuarios autenticados reales mediante sesiones legítimas de Supabase Auth.
3. Evaluar escenarios de aislamiento estricto (Cliente A ↔ Proyecto 1 vs Cliente B ↔ Proyecto 2), contenido publicado vs borradores internos y URLs firmadas en `project-vault`.
4. Garantizar que **bajo ninguna circunstancia se alteren, borren o consulten datos reales de producción**.

---

## 2. Guía Paso a Paso para Crear la Instancia Separada de Pruebas

Sigue estos pasos en el panel web de Supabase para crear tu proyecto aislado de pruebas:

1. Ingresa a tu cuenta de Supabase en [https://supabase.com/dashboard/projects](https://supabase.com/dashboard/projects).
2. Haz clic en el botón verde **"New project"**.
3. Configura el proyecto con los siguientes parámetros:
   - **Organization**: Tu organización de MASSA GROUP.
   - **Name**: `massa-view-test` (o un nombre que identifique claramente que es de pruebas).
   - **Database Password**: Genera una contraseña segura y guárdala temporalmente en tu gestor de contraseñas.
   - **Region**: Selecciona la misma región de tu proyecto de producción (ej. `East US / us-east-1` o `South America / sa-east-1`).
   - **Pricing Plan**: Free Plan (suficiente para pruebas de seguridad y desarrollo).
4. Haz clic en **"Create new project"** y espera ~2 minutos a que el aprovisionamiento termine.

### Extracción de Credenciales del Proyecto de Pruebas
Una vez creado el proyecto:
- Ve a **Project Settings (ícono de engranaje) -> API**:
  - **Project URL**: Copia la URL (ej. `https://[ID-PRUEBAS].supabase.co`).
  - **Project API keys -> `anon` (public)**: Copia la llave pública anon.
  - **Project API keys -> `service_role` (secret)**: Copia la llave secreta service_role (usada solo localmente para sembrar datos).
- Ve a **Project Settings -> Database -> Connection string -> URI**:
  - Copia la URL de conexión directa (reemplazando `[YOUR-PASSWORD]` por la contraseña que creaste).

---

## 3. Configuración Segura de Variables Locales

En la raíz del proyecto, crea el archivo local **`.env.test.local`** (el cual ya se encuentra estrictamente ignorado en `.gitignore` para evitar filtraciones):

```ini
# Control de aislamiento estricto (OBLIGATORIO)
PROD_SUPABASE_URL=https://nsiglkllgsgilwmdxkuu.supabase.co
ALLOW_PROD_TESTS=false

# Credenciales del Proyecto Aislado de Pruebas
TEST_SUPABASE_URL=https://[TU-ID-DE-PRUEBAS].supabase.co
TEST_SUPABASE_ANON_KEY=[TU-ANON-KEY-DE-PRUEBAS]
TEST_SUPABASE_SERVICE_ROLE_KEY=[TU-SERVICE-ROLE-KEY-DE-PRUEBAS]
TEST_DB_URL=postgresql://postgres:[PASSWORD]@db.[TU-ID-DE-PRUEBAS].supabase.co:5432/postgres

# Contraseñas de Usuarios de Prueba (Opcional - por defecto usa valores seguros predefinidos)
TEST_ARCHITECT_PASSWORD=MassaArch2026!#Secure
TEST_CLIENT_A_PASSWORD=MassaClientA2026!#
TEST_CLIENT_B_PASSWORD=MassaClientB2026!#
```

---

## 4. Inicialización del Esquema de Base de Datos

Hemos preparado el script SQL maestro consolidado e idempotente en:
`supabase/schema_test_env.sql`

Para aplicarlo en tu nuevo proyecto de pruebas:
1. En el Dashboard de tu proyecto de pruebas de Supabase, ve al menú lateral izquierdo y abre el **SQL Editor**.
2. Haz clic en **"New query"**.
3. Copia y pega el contenido completo de [supabase/schema_test_env.sql](file:///c:/Users/Juan%20David/Desktop/PROYECTO%20OBRAS%20Y%20CLIENTES%20MASSA/supabase/schema_test_env.sql).
4. Haz clic en **"Run"** (o presiona `Ctrl + Enter`).
5. Verifica que la salida reporte `Success. No rows returned`.

Este script crea automáticamente:
- La tabla `public.projects` con sus columnas extendidas.
- Las tablas relacionales `user_profiles`, `project_members`, `project_media`, `progress_updates`, `progress_media`, `tour_visits`.
- Las funciones `is_architect()`, `client_has_project()` con `search_path` seguro.
- La vista `public_tours_360`.
- Todas las políticas RLS habilitadas.
- Los buckets `tour-images` (público) y `project-vault` (privado con RLS).

---

## 5. Siembra Automatizada de Datos de Prueba (Idempotente)

Una vez aplicado el esquema y configurado `.env.test.local`, ejecuta el comando de siembra:

```bash
npm run seed:test
```

### Qué crea el script de siembra:
1. **Usuarios en Supabase Auth y `user_profiles`**:
   - `test_arquitecto@massagroup.test` (Rol: `architect`, Dirección de proyectos).
   - `test_cliente_a@massagroup.test` (Rol: `client`, Propietario de Proyecto A).
   - `test_cliente_b@massagroup.test` (Rol: `client`, Propietario de Proyecto B).
2. **Proyectos de Prueba**:
   - **P1 (`massa-test-p1`)**: "MASSA TEST — PROYECTO A (VILLA SERENA)", asignado exclusivamente a Cliente A (`published_for_client = true`).
   - **P2 (`massa-test-p2`)**: "MASSA TEST — PROYECTO B (SEDE CORPORATIVA MARQUIMODA)", asignado exclusivamente a Cliente B (`published_for_client = true`).
   - **P3 (`massa-test-p3-unpublished`)**: Proyecto despublicado (`published_for_client = false`) para pruebas de control de acceso.
3. **Contenido Relacional (Medios y Avances)**:
   - Renders y planos **publicados** (`published = true`).
   - Renders y planos **borradores / privados** (`published = false`).
   - Avances de obra publicados (hitos y porcentajes) y notas técnicas internas no publicadas.
4. **Almacenamiento (Storage)**:
   - Archivos de prueba subidos al bucket privado `project-vault` bajo `projects/massa-test-p1/...` y `projects/massa-test-p2/...`.

> [!NOTE]
> **Idempotencia Garantizada**: Puedes ejecutar `npm run seed:test` tantas veces como desees. Si los usuarios o proyectos ya existen, el script actualiza sus datos en lugar de duplicar registros o romper restricciones de unicidad.

---

## 6. Verificación del Entorno de Pruebas

Para comprobar que los datos, relaciones y archivos quedaron sembrados correctamente:

```bash
npm run verify:test-env
```

**Comprobaciones automáticas que realiza:**
1. Confirma que existen los 3 usuarios con sus respectivos roles (`architect` y `client`).
2. Confirma que existen los 3 proyectos y sus estados de publicación.
3. Valida el aislamiento cruzado de membresías (Cliente A solo en P1, Cliente B solo en P2).
4. Valida la coexistencia de elementos publicados y borradores.
5. Comprueba que las carpetas de Storage existen en `project-vault`.
6. **Audita producción en modo solo lectura**: Comprueba contra `PROD_SUPABASE_URL` que la base de datos de producción permanece intacta con sus 2 proyectos reales originales.

---

## 7. Barreras y Controles de Seguridad de Producción

Los scripts contienen tres barreras independientes de interrupción:
1. **Comparación estricta de URLs**: Si `TEST_SUPABASE_URL === PROD_SUPABASE_URL`, el script lanza un error fatal y se aborta inmediatamente con código de salida 1.
2. **Detección de Subcadena**: Si la URL contiene el ID `nsiglkllgsgilwmdxkuu` (identificador único del proyecto de producción de MASSA), el script aborta inmediatamente.
3. **Bandera de Aislamiento**: Se requiere explícitamente `ALLOW_PROD_TESTS=false`. Si se define en `true` o se omite, se bloquea la ejecución.
4. **Conexión Directa a Postgres**: Si `TEST_DB_URL` contiene el host o usuario de producción, el proceso de restauración/siembra aborta de inmediato.
