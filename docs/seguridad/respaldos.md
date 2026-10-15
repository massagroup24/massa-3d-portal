# Manual de Operaciones ("Runbook"): Sistema de Respaldos y Restauración
**Proyecto:** MASSA VIEW (MASSA GROUP)  
**Versión del Manual:** 2.0  
**Fecha:** 15 de Octubre, 2026  
**Clasificación de Información:** CONFIDENCIAL / OPERACIONES DE SEGURIDAD  

---

## 1. Alcance y Filosofía del Respaldo

Los respaldos automáticos de la infraestructura de Supabase (especialmente en planes gratuitos o básicos) **no son descargables** por defecto ni cubren los archivos multimedia binarios de Storage. Este sistema implementa un procedimiento híbrido, descargable, verificable y criptográficamente sellado.

> [!CAUTION]
> **Advertencia de Datos Sensibles**: Debido a la arquitectura de la base de datos previa a la migración (contraseñas en texto plano en `massa_3d_users` y posibles valores de PIN en `projects.data`), los respaldos generados **contienen información de máxima sensibilidad**. Todo archivo generado debe almacenarse cifrado en reposo y fuera del repositorio.

### Qué se respalda exactamente
1. **Base de Datos PostgreSQL (Esquema y Datos Completos)**:
   - `public.projects` (todos los proyectos, metadatos, configuraciones de recorridos 360°, fases y avances).
   - `public.massa_3d_users` (cuentas, nombres registrados, roles institucionales y credenciales).
   - `public.tour_visits` (histórico de analíticas y visitas a recorridos).
   - `public.user_profiles`, `public.project_members`, `public.project_media`, `public.progress_updates`, `public.progress_media`.
   - `pg_policies`, vistas públicas (`public_tours_360`) e información del esquema.
2. **Archivos de Almacenamiento (Supabase Storage)**:
   - Bucket `tour-images`: todos los panoramas 360°, renders y assets públicos.
   - Bucket `project-vault`: documentos ejecutivos, planos técnicos y archivos de avance privado.
3. **Manifiesto de Integridad Criptográfica (`manifest.json`)**:
   - Conteos exactos de registros por tabla.
   - Sumas de verificación SHA-256 de cada archivo individual de Storage.
   - Marcas de tiempo de generación.

---

## 2. Dónde se Guardan y Estrategia de Cifrado

### Ubicación Física
- **Ruta Local Predeterminada**: `../massa-backups/` (ubicado a nivel hermano de la raíz del proyecto, garantizando que **jamás** sea indexado ni añadido accidentalmente al repositorio Git).
- **Nombre de archivo**: `massa-backup-YYYY-MM-DDTHH-mm-ss-sssZ.tar.gz.enc`.

### Estándar Criptográfico
- **Algoritmo**: `AES-256-GCM` (Advanced Encryption Standard con Galois/Counter Mode para autenticación de integridad de bloques).
- **Derivación de Llave**: `PBKDF2` con 100,000 iteraciones, salt criptográfico aleatorio de 16 bytes y función hash `SHA-512`.
- **Compresión**: Compresión `gzip` (nivel 9) aplicada previo al cifrado.
- **Alternativa por CLI**: Si el operador dispone de `age` o `gpg`, puede aplicar cifrado de sobrecapa con:
  ```bash
  # Con age:
  age -p -o backup.age massa-backup-*.tar.gz
  # Con gpg:
  gpg -c --cipher-algo AES256 massa-backup-*.tar.gz
  ```

### Gestión de la Passphrase (`BACKUP_PASSPHRASE`)
- **Almacenamiento obligatorio**: La passphrase de cifrado debe guardarse en un **gestor de contraseñas corporativo** (1Password, Bitwarden, KeePassXC) bajo la etiqueta `MASSA_VIEW_BACKUP_ENCRYPTION_KEY`.
- **¿Qué pasa si se pierde?**: Debido al diseño de cifrado cero-conocimiento con AES-256-GCM, **si la passphrase se pierde, el respaldo es matemáticamente irrecuperable**. No existe puerta trasera ni mecanismo de restablecimiento. Por ello, la passphrase debe compartirse exclusivamente entre el Arquitecto Principal y el Administrador Técnico.

---

## 3. Política de Rotación y Destrucción Segura

### Regla de Retención Activa
El script `npm run backup` aplica automáticamente la regla de rotación al finalizar cada ejecución:
- **Diarios**: Conserva todos los respaldos generados en los últimos **7 días**.
- **Semanales**: Conserva **1 respaldo por semana** durante las últimas **4 semanas**.
- **Mensuales**: Conserva **1 respaldo por mes** durante los últimos **6 meses**.
- Archivos anteriores a 6 meses son purgados de forma automática para evitar saturación de disco.

### Plan de Destrucción de Respaldos Antiguos (Post-Migración)
Una vez ejecutada la migración definitiva a **Supabase Auth** (donde las contraseñas se almacenan mediante hashes bcrypt en `auth.users` y se purga `massa_3d_users`):
1. Se generará un respaldo limpio V3.
2. Los respaldos antiguos generados durante la vigencia de la tabla en texto plano deben ser eliminados de manera segura utilizando borrado seguro (shredding):
   - En Windows (PowerShell): Eliminar y sobrescribir con herramientas como `sdelete -p 3` o purgar el contenedor local tras verificar la nueva suita de pruebas.
   - En Linux/macOS: `shred -u -z -n 3 massa-backup-antiguo.tar.gz.enc`.

---

## 4. Instrucciones Paso a Paso para Operar

### A. Preparación Inicial (Una sola vez)
Crear el archivo local `.env.backup.local` en la raíz del proyecto (ignorado por Git):
```ini
# Cadena de conexión directa a PostgreSQL (en Supabase: Settings -> Database -> Connection string -> URI)
SUPABASE_DB_URL=postgresql://postgres:[TU-PASSWORD-DE-BD]@db.nsiglkllgsgilwmdxkuu.supabase.co:5432/postgres

# URL del proyecto Supabase
SUPABASE_URL=https://nsiglkllgsgilwmdxkuu.supabase.co

# Service Role Key (en Supabase: Settings -> API -> Project API keys -> service_role)
SUPABASE_SERVICE_ROLE_KEY=[TU-SERVICE-ROLE-KEY-SECRETA]

# Carpeta de destino externa al repositorio
BACKUP_DIR=../massa-backups

# Frase secreta de cifrado robusta (mínimo 16 caracteres recomendados)
BACKUP_PASSPHRASE=[TU-PASSPHRASE-GUARDADA-EN-GESTOR]
```

### B. Generar un Respaldo Completo
Ejecutar en la terminal:
```bash
npm run backup
```
**Salida esperada:**
- Conexión directa a Postgres y extracción de todas las tablas `public.*`.
- Descarga paginada de objetos de `tour-images` y `project-vault`.
- Generación del archivo cifrado `massa-backup-*.tar.gz.enc` en `../massa-backups/`.
- Ejecución automática de la rotación.

### C. Verificar Integridad del Respaldo ("Audit Check")
Un respaldo no verificado no es un respaldo. Para verificar sin alterar nada:
```bash
npm run backup:verify
```
Para verificar un archivo específico:
```bash
node scripts/verify-backup.mjs ../massa-backups/massa-backup-2026-10-15T...tar.gz.enc
```
El script descifra en memoria, valida los hashes SHA-256 de cada archivo binario de Storage y confirma la concordancia de filas con el manifiesto.

### D. Procedimiento de Restauración (Hacia Entorno de Pruebas)
> [!IMPORTANT]
> **REGLA DE ORO**: La restauración automática tiene un bloqueo de hardware y software que **impide** correr hacia producción (`PROD_SUPABASE_URL`). Solo se permite restaurar hacia el proyecto separado de pruebas configurado en `.env.test.local`.

1. Configurar `.env.test.local` con las credenciales del proyecto de pruebas creado en el Paso 3.
2. Ejecutar:
   ```bash
   npm run backup:restore
   ```
3. El sistema volcará el esquema, las filas y re-subirá los archivos a los buckets de prueba, verificando que los conteos sean 100% idénticos.

---

## 5. Automatización Propuesta (Sin Filtración de Secretos)

Para no depender de ejecuciones manuales:
1. **Opción Local (Windows Task Scheduler / Cron)**:
   - Crear una tarea programada que ejecute `npm run backup` a las 02:00 AM UTC diariamente. Las variables se leen del archivo local `.env.backup.local`.
2. **Opción Cloud (GitHub Actions Programado - Opcional)**:
   - Configurar un workflow con `schedule: - cron: '0 3 * * *'`.
   - Inyectar `SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `BACKUP_PASSPHRASE` como **GitHub Repository Secrets**.
   - Almacenar el artefacto cifrado en un bucket S3 / Cloudflare R2 privado con cifrado del lado del servidor.

---

## 6. Protocolo ante Emergencias

### Caso 1: Borrado Accidental de Datos en Producción
1. **Detener tráfico de escritura**: Activar ventana de mantenimiento breve en Vercel o redirigir temporalmente a página de estado.
2. **Identificar el último respaldo íntegro**:
   ```bash
   npm run backup:verify
   ```
3. **Restaurar primero en el entorno de pruebas** para validar que la información requerida está intacta.
4. **Extraer selectivamente las filas afectadas** o restaurar la tabla específica mediante el volcado JSON contenido en el bundle.

### Caso 2: Filtración de Service Role Key o Llaves Comprometidas
1. **Revocación inmediata en Supabase**: Ir a `Dashboard -> Settings -> API -> Project API keys` y rotar la `service_role` key de inmediato.
2. **Actualizar `.env.backup.local`** con la nueva llave.
3. **Auditar logs de acceso de Supabase**: Ir a `Logs -> Auth / Storage / PostgREST` para comprobar si hubo descargas no autorizadas de `project-vault`.
