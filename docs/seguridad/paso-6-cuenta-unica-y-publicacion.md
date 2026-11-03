# Paso 1 del plan: cuenta única y contenido publicado

Fecha: 2026-11-03.

## Decisiones confirmadas

- Única cuenta de acceso: `juandavidfigueroa4@gmail.com`.
- El usuario confirmó que el acceso real en Supabase Auth funciona.
- La consulta remota de solo lectura confirmó el perfil `admin`, la cuenta
  confirmada y habilitada, y las columnas requeridas de las tablas de avances.
- Los visitantes solo deben consultar proyectos y contenido publicados.
- Publicación inicial: Hacienda F22 e Ibiza A14. Edinson Jejen y Marquimoda
  permanecen como borradores, según la elección posterior del usuario.
- No se eliminan cuentas ni proyectos existentes. Las demás cuentas pierden
  autorización administrativa; no se reutilizan contraseñas alternativas.

## Implementación local

`authService` exige una sesión de Supabase Auth, un perfil `admin` coincidente y
la respuesta positiva de `is_platform_admin()`. El servidor vincula la identidad
autorizada al UUID de Auth en una tabla de una sola fila sin acceso desde la API.
El correo, los metadatos editables y localStorage no conceden permisos.

La migración `20261103_06_single_owner_and_published_catalog.sql` sustituye las
políticas anteriores de las tablas del portal, restringe escrituras al dueño y
expone el catálogo mediante vistas filtradas. El campo existente
`projects.published_for_client` se usa como decisión de publicación del proyecto.
`project_media.published` y `progress_updates.published` controlan sus contenidos.
Los nuevos proyectos sin publicación explícita son borradores.

La interfaz incluye «Publicar al guardar» en el configurador. Las páginas de
proyectos y recorridos verifican disponibilidad en el servidor y no recuperan
proyectos ocultos desde localStorage ni desde el catálogo compilado.

Se cierran las RPC de altas, bajas y cambios de usuarios y se retira la consulta
de contraseñas heredadas. La ruta `/reset-password` permite completar una
recuperación para la cuenta autorizada con un enlace válido de Supabase.

## Archivos

Los buckets `tour-images` y `project-vault` pasan a privados. Las lecturas públicas
requieren que el archivo esté referenciado por contenido publicado; las
escrituras solo se permiten al dueño. No se borran ni se mueven archivos.

Las URLs públicas antiguas actúan como referencias persistentes: la aplicación
las convierte en URLs firmadas de cinco minutos y no guarda tokens temporales
en la base de datos. Los visores y el editor renuevan las firmas periódicamente.
Una URL ya firmada puede seguir funcionando hasta su vencimiento tras retirar
la publicación. El contenido ya descargado no se puede revocar.

Los archivos de `public/`, los datos definidos en TypeScript y los archivos de
servidores externos ya son públicos por su distribución. No deben contener
material confidencial. Esta migración protege los archivos de Supabase y la
selección del catálogo; no convierte los assets del repositorio en archivos
privados. El traslado de material que deba ser privado requiere identificarlo
antes de la siguiente publicación.

## Aplicación al servidor: en curso

El usuario ejecutó el procedimiento guiado en SQL Editor y compartió el
resultado de publicación inicial: Hacienda F22 e Ibiza A14 públicos y Edinson
Jejen y Marquimoda como borradores. Una captura posterior confirma el hook de
cuenta única habilitado con esquema `public` y función
`platform_access_token_hook`. El cierre de nuevos registros y de Auth anónimo
no se ha confirmado todavía. La aplicación web y las reglas remotas aún
necesitan una comprobación funcional posterior al cambio.
El entorno de trabajo no tiene conexión SQL administrativa configurada ni un
conector de Supabase; esta evidencia procede de las capturas del usuario.

La aplicación nueva depende de la migración. Preparar una ventana de cambio
para aplicar el SQL y servir el build nuevo juntos: los buckets privados dejan
de funcionar con las URLs públicas del frontend anterior.

Antes de ejecutar, revisar en SQL Editor:

```sql
SELECT id, email, email_confirmed_at IS NOT NULL AS confirmed,
       banned_until IS NULL OR banned_until <= now() AS usable
FROM auth.users WHERE lower(email) = 'juandavidfigueroa4@gmail.com';

SELECT id, data->>'name' AS name, published_for_client
FROM public.projects ORDER BY id;

SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('progress_updates', 'progress_media')
ORDER BY table_name, ordinal_position;
```

La migración espera el esquema versionado: `progress_media.update_id` y
`progress_updates.recorded_at`. Revisar cualquier diferencia del servidor antes
de aplicarla. La consulta de proyectos permite decidir qué proyectos ya están
publicados; el SQL no publica automáticamente los borradores existentes ni
importa proyectos que solo estén en archivos locales.

1. Guardar una copia de esquema, políticas y datos usando el procedimiento de
   respaldos existente. Revisar el estado de los proyectos de la consulta anterior.
2. Ejecutar el archivo completo de migración en SQL Editor con el propietario
   de la base de datos. Si no existe la cuenta confirmada o está bloqueada, la
   transacción aborta. No omitir ese control.
   Después, ejecutar `supabase/publicacion_inicial_paso_1.sql` para establecer la
   selección inicial de los cuatro proyectos. Este archivo no publica medios
   relacionales no aprobados ni modifica otros proyectos. No reejecutarlo tras
   cambiar manualmente las decisiones de publicación en el editor.
3. En Authentication, deshabilitar registros nuevos y acceso anónimo de Auth.
   Los visitantes públicos utilizan el rol API `anon` sin crear cuentas de Auth.
4. En Authentication > Hooks, activar como Custom Access Token Hook la función
   `public.platform_access_token_hook`. Esto impide emitir y renovar sesiones
   para otros UUID. Crear la función SQL por sí solo no activa el hook.
5. Autorizar las URLs `/reset-password` del dominio de producción y del entorno
   de desarrollo en la configuración de redirecciones de Auth.
6. Publicar el build nuevo y comprobar el acceso del dueño en una sesión nueva.
   Publicar desde el editor únicamente los proyectos que deban estar visibles.
7. Comprobar en una sesión sin iniciar sesión: catálogo publicado, enlaces
   directos de borradores rechazados e imágenes publicadas disponibles.

No volver a ejecutar las migraciones 04 o 05 después de la 06: reabrirían reglas
anteriores. Una reversión no debe restablecer contraseñas alternativas ni
escrituras públicas; debe conservar los cierres de seguridad.

## Verificación local

Resultado del 2026-11-03: 90 pruebas aprobadas en ocho suites, comprobación de
tipos aprobada y build de producción generado. El build avisa del tamaño del
bundle; su reducción forma parte del paso 5.

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
npm.cmd run test:security
npm.cmd run build
```

La suite `published-catalog.test.ts` aplica las migraciones reales 04, 05 y 06
sobre PostgreSQL PGlite y repite la correctiva para verificar idempotencia.
Incluye lectura pública, ocultación de borradores, metadatos no confiables,
escrituras de Storage, permisos del dueño y el contrato del hook de Auth.
Las cuatro suites originales de RLS siguen documentando el esquema histórico;
no representan por sí solas la política actual de cuenta única.

La ejecución en PGlite no sustituye la verificación del servicio HTTP de Storage,
la activación del hook, los enlaces de recuperación ni el esquema remoto real.
ESLint queda pendiente del paso 6; la división del bundle queda para el paso 5.

Referencias: [buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals),
[hooks de Auth](https://supabase.com/docs/guides/auth/auth-hooks),
[políticas restrictivas](https://www.postgresql.org/docs/current/sql-createpolicy.html).
