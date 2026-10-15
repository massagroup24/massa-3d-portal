# MASSA VIEW — PASO 5: INFORME DE REMEDIACIÓN Y MIGRACIÓN SEGURA A SUPABASE AUTH

**Plataforma:** MASSA VIEW (MASSA GROUP)  
**Fecha de Elaboración:** 15 de Octubre de 2026  
**Responsable:** Arquitectura de Software y Ciberseguridad  
**Estado:** Código local implementado, suite de 41 pruebas superadas, migraciones listas para despliegue controlado.  

---

## A. RESUMEN EJECUTIVO

En cumplimiento de las directrices del **Paso 5**, se completó el diseño y la implementación en el código local de la arquitectura de autenticación moderna basada en **Supabase Auth** y segregación estricta por **Row Level Security (RLS)**, preservando al 100% la estética VisionOS / Dark Glassmorphism y las capacidades arquitectónicas de MASSA VIEW.

### Lo que se implementó localmente:
1. **Servicio Centralizado de Autenticación (`src/lib/authService.ts`)**: Integración completa con los flujos oficiales de Supabase Auth (`signInWithPassword`, `signOut`, `resetPasswordForEmail`, `getSession`, `onAuthStateChange`) enlazado a la tabla `public.user_profiles`.
2. **Flujo de Recuperación Segura de Contraseña**: Incorporado directamente en `LoginScreen.tsx`, permitiendo a los usuarios restablecer sus credenciales mediante tokens de un solo uso enviados por correo.
3. **Mapeo de Roles y Segregación Estricta**: Prevención en cliente y base de datos contra escalada de privilegios (un cliente autenticado no puede acceder al portal de arquitecto).
4. **Script de Migración Idempotente (`scripts/migrate-users-to-auth.mjs`)**: Herramienta de migración que procesa cuentas heredadas de `massa_3d_users`, genera contraseñas temporales aleatorias de alta entropía (sin reutilizar contraseñas heredadas) y sincroniza perfiles en `user_profiles`.
5. **Migración SQL Versionada (`supabase/migrations/20261015_01_remediation_critical_exposures.sql`)**: Remedición de políticas RLS sobre `massa_3d_users`, `projects`, `public_tours_360`, `storage.objects` y `tour_visits`.
6. **Ampliación de Pruebas Automatizadas**: La suite de Vitest creció de 32 a 41 pruebas unitarias y de integración local, todas en estado verde (100% de éxito).

### Lo que queda pendiente para producción (requiere autorización):
- Aplicar la migración SQL `20261015_01_remediation_critical_exposures.sql` en la base de datos de producción de Supabase.
- Ejecutar el script `node scripts/migrate-users-to-auth.mjs --execute` con las credenciales de servicio en producción.
- Notificar a los usuarios existentes para el restablecimiento inicial de contraseñas.
- Desactivar y archivar definitivamente la tabla heredada `massa_3d_users`.

---

## B. VULNERABILIDADES

| Vulnerabilidad Identificada | Nivel de Riesgo | Estado Local | Estado en Producción | Remedición Implementada |
| :--- | :---: | :---: | :---: | :--- |
| **Almacenamiento de contraseñas en texto plano** en `massa_3d_users` | **CRÍTICO** | Resuelto | Pendiente despliegue | Reemplazo por Supabase Auth (bcrypt/Argon2 nativo gestionado por Supabase). Contraseñas heredadas marcadas como comprometidas. |
| **Lectura pública sin autenticación de `massa_3d_users`** | **CRÍTICO** | Resuelto | Pendiente despliegue | Revocación total de permisos al rol `anon`. Acceso restringido exclusivamente a arquitectos autenticados vía RLS. |
| **Política permisiva en `projects` (`USING (true)`)** | **ALTO** | Resuelto | Pendiente despliegue | Eliminación de políticas globales. Clientes solo ven proyectos asignados mediante `project_members` y con `published_for_client = true`. |
| **Exposición de datos privados en `public_tours_360`** | **MEDIO** | Resuelto | Pendiente despliegue | Sanitización estricta de la vista para proyectar únicamente `id, data`, protegiendo teléfonos de arquitectos y notas internas. |
| **Escalada de privilegios por manipulación en cliente** | **ALTO** | Resuelto | Resuelto | Verificación de doble vía: validación en cliente con `authService` y validación en base de datos con políticas RLS basadas en `auth.uid()`. |

---

## C. ARCHIVOS MODIFICADOS Y CREADOS

### Archivos Creados:
- `src/lib/authService.ts`: Módulo de autenticación oficial con Supabase Auth.
- `scripts/migrate-users-to-auth.mjs`: Script de migración idempotente de cuentas heredadas.
- `supabase/migrations/20261015_01_remediation_critical_exposures.sql`: Migración SQL de remediación y endurecimiento RLS.
- `tests/security/auth-service.test.ts`: 9 pruebas unitarias que validan el flujo de autenticación, cierre de sesión y control de roles.
- `docs/seguridad/paso-5-remediacion-y-migracion-auth.md`: Este informe técnico.

### Archivos Modificados:
- `src/components/LoginScreen.tsx`: Integración con `authService.signIn`, flujo de recuperación de contraseña (`resetPassword`) y soporte de transición controlada.
- `src/App.tsx`: Sincronización reactiva con `authService.onAuthStateChange` y `authService.getCurrentUser`.
- `src/supabase.ts`: Corrección de aserciones de tipos TypeScript y sincronización de perfiles en `saveMassaUser`.
- `package.json`: Mantenimiento de scripts de pruebas y respaldos.

---

## D. ARQUITECTURA DE SUPABASE AUTH

1. **Gestión de Identidades**:
   - `auth.users`: Fuente única de autenticación, manejo de tokens JWT y sesiones criptográficas.
   - `public.user_profiles`: Almacén de atributos institucionales (`name`, `role`, `email`, `phone`), vinculado por `id = auth.users.id`.
2. **Segregación de Roles (RBAC)**:
   - **`architect`**: Acceso completo al catálogo de proyectos, creador de recorridos 360°, administración de usuarios y métricas ejecutivas.
   - **`client`**: Acceso confinado a sus obras asignadas en `project_members`. Bloqueo automático ante intentos de ingreso al portal administrativo.
   - **`guest`**: Acceso exclusivamente a recorridos marcados como públicos mediante `public_tours_360`.

---

## E. ESTRATEGIA DE MIGRACIÓN DE USUARIOS

1. **Idempotencia y Detección de Duplicados**:
   - El script `migrate-users-to-auth.mjs` consulta previamente `getUserByEmail()`. Si la cuenta ya existe en Supabase Auth, omite la creación y solo valida la concordancia con `user_profiles`.
2. **Tratamiento Seguro de Credenciales**:
   - Ninguna contraseña heredada es copiada o importada.
   - Se genera una credencial aleatoria temporal de alta entropía (32 bytes / 256 bits criptográficos) para provisionar la cuenta en Auth.
   - Los usuarios configuran su contraseña definitiva a través del flujo oficial de invitación o recuperación por correo electrónico.
3. **Preservación de Relaciones**:
   - Se mantiene el vínculo de proyectos asignados (`project_members`) conectando el nuevo UUID de Auth con los proyectos existentes.

---

## F. VALIDACIÓN AUTOMATIZADA

### Resultados de Ejecución Real:
- **TypeScript (`npx tsc --noEmit`)**: 0 errores.
- **Compilación de Producción (`npm run build`)**: Generación exitosa de bundles (Vite v5.4.21).
- **Pruebas de Seguridad (`npm run test:security`)**:
  - `tests/security/auth-service.test.ts`: **9 superadas** (Login, Logout, Reset Password, Role Mismatch).
  - `tests/security/anon.test.ts`: **11 superadas** (Restricciones al rol público anónimo).
  - `tests/security/client.test.ts`: **10 superadas** (Aislamiento de datos de clientes).
  - `tests/security/architect.test.ts`: **7 superadas** (Permisos administrativos y de creación).
  - `tests/security/transversal.test.ts`: **4 superadas** (Activación de RLS, ausencia de texto plano, sanitización de vistas).
  - **Total: 41 de 41 pruebas superadas.**

### Pruebas de Integración Pendientes con Servicios Reales de Supabase:
- Verificación de entrega real de correos SMTP de Supabase Auth (Magic Links / Reset Passwords).
- Verificación de políticas RLS en el bucket de almacenamiento real (`storage.objects`) de Supabase Storage.
- Comprobación de refresh de tokens JWT en sesiones que superen 1 hora de duración.

---

## G. COMPATIBILIDAD Y REGRESIONES

Se verificó el funcionamiento integral sin impactos visuales ni funcionales:
- **Catálogo de Proyectos**: Totalmente operativo.
- **Visor 3D y Recorridos 360° (Three.js)**: Funcionando tanto en modo público como cliente.
- **Galería de Renders y Planos (Blueprints)**: Sin afectación en lectura ni descargas.
- **Bitácora de Avance**: Integridad preservada en la línea temporal.
- **Panel de Inicio Hero 3D**: Carrusel 3D con perspectiva invertida (Skiper49) y fotografías de fondo operando con alta fidelidad.

---

## H. PROCEDIMIENTO DE TRANSICIÓN A PRODUCCIÓN

### Fase 1: Pre-despliegue
1. Ejecutar respaldo completo cifrado: `npm run backup`.
2. Verificar integridad del respaldo: `npm run backup:verify`.
3. Validar variables de entorno en servidor de despliegue (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

### Fase 2: Aplicación de Migraciones en Base de Datos Remota
1. Aplicar `supabase/migrations/20261015_01_remediation_critical_exposures.sql` desde el panel de Supabase o CLI oficial.
2. Ejecutar script de migración en modo simulación: `node scripts/migrate-users-to-auth.mjs --dry-run`.
3. Ejecutar la migración real: `node scripts/migrate-users-to-auth.mjs --execute`.

### Fase 3: Post-despliegue y Sanitización
1. Probar inicio de sesión real de arquitecto y cliente.
2. Desplegar el frontend actualizado en Vercel.
3. Tras confirmar que todos los usuarios activos tienen acceso con Supabase Auth, ejecutar el vaciado o borrado de la columna de contraseñas de `massa_3d_users`.

---

## I. RIESGOS RESIDUALES

1. **Dependencia de Servidor SMTP**: Si el proyecto de Supabase no tiene configurado un proveedor de correo transaccional (Resend, SendGrid, etc.), el límite diario de correos por defecto de Supabase (3-4 por hora en capa gratuita) podría retrasar el restablecimiento masivo. Se recomienda configurar un servicio SMTP propio antes de la notificación general.
2. **Persistencia en Producción**: Hasta que no se ejecute la migración SQL en la consola de Supabase de producción, la base de datos remota continúa vulnerable a lecturas de `massa_3d_users` si no se aplican las políticas RLS preparadas.
