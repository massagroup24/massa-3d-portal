# Plan de mejoras de MASSA VIEW

Fecha de inicio: 2026-11-03.

Las seis etapas se implementarán de forma incremental. Antes de cada etapa se
consultarán las decisiones de producto que afecten su comportamiento. Al cerrar
cada etapa se registrarán los cambios, las verificaciones y los pendientes.

## Estado inicial

- TypeScript: `tsc --noEmit` aprobado durante la revisión inicial.
- Seguridad: 41 pruebas aprobadas y 1 fallida. La prueba fallida espera impedir
  que un arquitecto acceda por el perfil de cliente; hay que acordar la regla
  actual de negocio antes de conservar o modificar esa expectativa.
- Lint: falla por falta de configuración de ESLint.
- Las pruebas de base de datos usan `supabase/schema_test_env.sql`; no prueban
  por sí solas el resultado de todas las migraciones del repositorio.
- No se ha verificado el esquema ni las cuentas del servidor de producción.

## 1. Acceso y autorización

Estado: implementación local validada (90 pruebas aprobadas, TypeScript y build
correctos). Aplicación al servidor en curso: el usuario eligió ejecución guiada
desde SQL Editor. La captura de la consulta inicial confirma las columnas de
avances requeridas y el perfil `admin`. El usuario eligió publicar Hacienda F22 e
Ibiza A14 y conservar Edinson Jejen y Marquimoda como borradores; la configuración
inicial está preparada en `supabase/publicacion_inicial_paso_1.sql`. La segunda
captura confirma `confirmada = true` y `habilitada = true`. El usuario confirmó
que la web está publicada en Vercel y prefirió actualizarla mediante Git.
El commit local de implementación es `c0ad004`. Una nueva captura del resultado
de `publicacion_inicial_paso_1.sql` confirma Hacienda F22 e Ibiza A14 publicados
y los otros dos proyectos como borradores en el servidor. La captura posterior
confirma el hook de Auth habilitado con `public.platform_access_token_hook`.
Quedan pendientes confirmar el cierre de registros nuevos y de Auth anónimo,
y comprobar funcionalmente una sesión nueva y el catálogo público.

Decisiones confirmadas: única cuenta `juandavidfigueroa4@gmail.com`, con acceso
real confirmado por el usuario; visitantes limitados a contenido publicado.
Detalles de implementación y aplicación al servidor:
[cuenta única y publicación](seguridad/paso-6-cuenta-unica-y-publicacion.md).

Decisiones consultadas:

- Quién administra: solo administradores o administradores y arquitectos.
- Qué se publica: solo contenido publicado o todo el catálogo.
- Qué cuenta tiene acceso real a Supabase Auth para asegurar la continuidad
  del acceso al retirar el mecanismo alternativo.

Trabajo previsto:

- Retirar contraseñas alternativas y roles deducidos del correo, metadatos
  editables o almacenamiento del navegador.
- Unificar la comprobación del perfil y el acceso al editor.
- Revisar el flujo de creación y gestión de usuarios y las funciones SQL de
  autorización y sincronización de perfiles.
- Preparar una nueva migración correctiva, sin reescribir migraciones ya usadas.
- Limitar las escrituras en Storage al personal autorizado y ajustar las
  lecturas a la decisión de publicación.
- Añadir pruebas de regresión para los accesos rechazados y permitidos.

Cierre: comprobación de tipos y pruebas pertinentes aprobadas; documentar por
separado la preparación local y la aplicación/verificación en el servidor.

## 2. Guardado confiable

Antes de esta etapa, el usuario solicitó retirar el reel incorrecto de F22 y
reforzar el recorrido 360° en su PWA de iPhone 16e y en otros dispositivos.
La implementación y las pruebas específicas se documentan en
[video y recorrido móvil](video-f22-y-recorrido-movil.md). Estos cambios no
sustituyen las etapas de guardado, organización, datos y rendimiento pendientes.
Tras el reporte de pantalla blanca en iPhone se corrigió la creación del material
sin textura, con regresión reproducida antes del cambio. Se añadieron 12 copias
ligeras de panoramas F22 para móvil. Verificación actual: 39 pruebas de recorrido,
TypeScript y build completo aprobados; pendiente probar la nueva versión en el
iPhone del usuario tras desplegarla.

El usuario aportó el cuadro real de áreas y ocupaciones de F22. Se reemplazaron
las especificaciones provisionales del catálogo, portada, niveles, planos,
renders y ficha por los valores transcritos en una fuente compartida. Los campos
no confirmados se retiraron. El SQL de actualización de contenido está preparado;
su ejecución en Supabase y la publicación siguen pendientes. Detalles y resultados:
[especificaciones reales F22](especificaciones-reales-hacienda-f22.md).

Estado: pendiente.

Consultar: política de borradores locales, recuperación y comportamiento al salir
con cambios pendientes.

Trabajo previsto: distinguir borrador local y guardado remoto, mostrar errores de
sincronización, permitir reintentos y proteger cambios pendientes. Validar fallos
de red, persistencia local y confirmación remota sin mostrar éxito incorrecto.

## 3. Organización del código

Estado: pendiente.

Consultar: acordar el primer flujo a reorganizar y cualquier cambio de interfaz
que se quiera incluir.

Trabajo previsto: extraer servicios y hooks de persistencia y dividir componentes
por responsabilidad, empezando por el configurador. Separar cambios estructurales
de cambios funcionales para facilitar la revisión y validar los flujos afectados.

## 4. Fuente principal de datos

Estado: pendiente.

Consultar: precedencia de nube y borradores, funcionamiento sin conexión y
resolución de cambios desde distintos equipos.

Trabajo previsto: definir una política única de lectura y escritura, consolidar
las claves locales y migrar borradores existentes sin descartarlos. Validar carga,
recuperación y conflictos según la política acordada.

## 5. Rendimiento en móviles

Estado: pendiente.

Consultar: dispositivos prioritarios y calidad visual requerida para panoramas,
imágenes y videos.

Trabajo previsto: medir el build y la carga inicial, separar la carga del editor
y los visores, optimizar medios y revisar el uso de recursos del recorrido.
Conservar los originales y documentar mediciones antes y después.

## 6. Calidad y verificaciones automáticas

Estado: pendiente; se añadirán las regresiones necesarias durante las otras etapas.

Consultar: plataforma de integración continua y flujos críticos que deben
bloquear una entrega si fallan.

Trabajo previsto: configurar ESLint y comprobación de tipos, validar migraciones
reales en un entorno aislado, cubrir los flujos críticos y automatizar las
verificaciones de entrega. Actualizar instrucciones reproducibles de desarrollo.
