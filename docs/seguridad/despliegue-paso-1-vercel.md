# Aplicación coordinada del paso 1 en Vercel y Supabase

Estado inicial: cambios locales validados; el usuario confirmó que la web está
publicada en Vercel y eligió ejecutar el SQL de forma guiada. No se han aplicado
migraciones al servidor ni publicado el frontend nuevo.

Comprobaciones realizadas:

- El repositorio local tiene como origen `massagroup24/massa-3d-portal` en GitHub.
- Vercel CLI está instalado (versión 50.32.5).
- No hay sesión activa de Vercel CLI ni carpeta `.vercel` vinculada.
- La cuenta de Supabase aparece con perfil `admin`, confirmada y habilitada.
- La selección inicial es Hacienda F22 e Ibiza A14 publicados, y Edinson Jejen
  y Marquimoda como borradores.

## 1. Vincular el proyecto existente

Desde la terminal de VS Code, en la raíz del proyecto, ejecutar por separado:

```powershell
vercel.cmd login
vercel.cmd link
```

Completar el ingreso con la cuenta que administra el sitio. En la vinculación,
seleccionar el equipo propietario y responder que se vinculará un proyecto
existente. Elegir el que corresponde al sitio actual y al repositorio indicado.
La vinculación no publica el código. No crear otro proyecto para esta operación.

## 2. Preparar el frontend sin cambiar los dominios

Después de verificar la identidad del proyecto vinculado:

```powershell
vercel.cmd deploy --prod --skip-domain
```

Esto construye con el entorno de producción y deja un despliegue preparado sin
asignarle los dominios de la web actual. Guardar su URL y esperar estado Ready.
No hacer push a la rama de producción para preparar este despliegue: Vercel
podría publicar los cambios automáticamente antes de coordinar el SQL.

El frontend nuevo depende de la migración; que se genere correctamente el build
no garantiza que el catálogo y el editor funcionen antes de aplicarla.

## 3. Aplicar el SQL y activar el frontend nuevo

Con el despliegue preparado y listo para promover, aplicar desde Supabase SQL
Editor, en este orden:

1. `supabase/migrations/20261103_06_single_owner_and_published_catalog.sql`.
2. `supabase/publicacion_inicial_paso_1.sql`.

Revisar que terminen sin errores. Después promover inmediatamente la URL exacta
del despliegue preparado:

```powershell
vercel.cmd promote <URL_DEL_DESPLIEGUE_PREPARADO>
```

Hay un intervalo entre sistemas: desde el cambio de buckets a privados hasta
que se activa el frontend nuevo, la versión anterior podría no cargar imágenes.
No existe una transacción única entre PostgreSQL y Vercel. Coordinar estos pasos
en una ventana corta con ambos paneles preparados.

## 4. Completar Auth y verificar

Seguir las opciones de Authentication y las verificaciones del documento
`paso-6-cuenta-unica-y-publicacion.md`: deshabilitar nuevos registros, activar el
hook de cuenta única, configurar la URL de recuperación y comprobar el acceso
real del dueño y el catálogo público. El hook no queda activo por crear su
función en SQL.

Una reversión del frontend antiguo no es compatible con los buckets privados.
Si aparece un problema, corregir el frontend nuevo manteniendo los cierres de
seguridad; no reabrir escrituras públicas ni restaurar accesos alternativos.

Referencias: [vinculación](https://vercel.com/docs/cli/project-linking),
[deploy con --skip-domain](https://vercel.com/docs/cli/deploy#skip-domain),
[promoción](https://vercel.com/docs/cli/promote).
