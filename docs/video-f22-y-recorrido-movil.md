# Video de F22 y recorrido 360° en móvil

## Video oficial pendiente

Se desactivó el reel de inicio de Hacienda F22 porque el usuario indicó que no
pertenece al proyecto. Se conserva el marco 16:9 y la identidad AMHO, con el texto
«Video del proyecto» y «Próximamente». No se renderiza ni se descarga un video
vacío ni se muestran controles de reproducción cuando no hay URL configurada.

Para añadir el video real:

1. Colocar el archivo definitivo en `public/HACIENDA F22/`, o disponer de su URL.
2. En `src/config/projectIdentityConfig.ts`, dentro de
   `PROJECT_IDENTITIES.project_hacienda_f22`, asignar su ruta a `heroVideoUrl`.
   Ejemplo: `heroVideoUrl: '/HACIENDA F22/VIDEO_OFICIAL_F22.mp4'`.
3. Publicar la actualización de la web. El reproductor y sus controles aparecen
   al configurar la URL; no hay que reconstruir el espacio de la página.

El archivo anterior se conserva en disco y está desactivado en la configuración.
No volver a usarlo como video oficial sin reemplazar su contenido por el real.
Los demás proyectos conservan sus URLs de video existentes.

## Recorrido inmersivo

Dispositivo indicado por el usuario: PWA en iPhone 16e. Se implementan mejoras
basadas en capacidades del navegador, compartidas por móvil y escritorio:

- El visor usa la altura dinámica disponible, respeta los márgenes seguros y
  bloquea el desplazamiento del documento mientras está abierto. Al salir se
  recupera la posición anterior. El modal se monta sobre el documento para
  evitar recortes de contenedores o transformaciones de la página.
- Arrastrar con el dedo funciona sin activar sensores. Los menús y el carrusel
  de ambientes conservan sus propios gestos de desplazamiento. Se amplían los
  controles táctiles y se actualiza el diseño cuando cambia el ancho.
- El giroscopio se ofrece en entornos seguros con capacidad táctil y se activa
  mediante una acción del usuario. Un permiso rechazado conserva el arrastre.
- Las texturas se ajustan al límite real de GPU. Se acotan a 2048 píxeles en
  dispositivos con puntero grueso y a 8192 en escritorio, conservando proporción.
  El límite del dispositivo prevalece cuando es menor. La densidad de dibujo
  máxima es 1.5 en el perfil táctil y 2 en escritorio.
- Se cancela la carga al cambiar de ambiente o desmontar el visor, y se libera
  su textura. Se retiró la caché ilimitada de texturas y la precarga duplicada de
  panoramas en el visor de enlaces directos.
- Se muestra el estado de carga real y se puede reintentar un fallo de conexión.
  Un error de imagen no genera una escena arquitectónica ficticia de respaldo.
  Los errores del renderizador o pérdidas de contexto ofrecen reiniciar el visor
  conservando el acceso a los controles de salida.
- Al volver del segundo plano se consultan de nuevo los proyectos y sus firmas,
  para renovar referencias de Storage que pudieron vencer durante la pausa.
- Los recorridos externos conservan la ruta de iframe y su permiso de pantalla
  completa. El recorrido local no depende de la API de fullscreen de iOS.

Estas medidas no añaden funcionamiento sin conexión. La PWA necesita red para
consultar el catálogo, renovar firmas y descargar panoramas no disponibles.

## Corrección de la pantalla blanca reportada en iPhone

El usuario informó que el recorrido sí carga en PC pero queda blanco tanto en
la PWA como en el navegador móvil. Se reprodujo un defecto de `RoomSphere` en
una prueba de integración con React Three Fiber: el material se montaba con
`map = null` y recibía la foto después sin cambiar de material ni incrementar
su versión. Three.js necesita recompilar al pasar de ausencia a presencia de
textura ([documentación oficial](https://threejs.org/manual/pages/materials.html)).
La disponibilidad de la imagen antes o después del primer dibujo explicaba una
diferencia posible entre equipos; no se ha inspeccionado la consola del iPhone.

La esfera y su material ahora se montan cuando la textura ya está disponible.
La prueba de descarga retrasada falló antes de la corrección y pasa después.
También se comprueba la liberación de la textura al cambiar de ambiente.

Para reducir la descarga se incluyen copias JPEG de los 12 panoramas locales F22
a 2048 × 1024 en `public/panoramas/mobile/hacienda-f22/`, seleccionadas mediante
`src/config/mobilePanoramas.json`. El total pasa de 75.242.223 a 3.443.605 bytes;
Zona Social pasa de 9.747.254 a 545.571 bytes. El escritorio conserva su resolución
original. Las URLs privadas/remotas y sus firmas no se sustituyen por copias
públicas. Si una copia móvil no está disponible, el cargador prueba su original.
La vista previa de la página usa las mismas copias móviles y se desmonta, con su
animación detenida, mientras el modal inmersivo está abierto.

Si se actualizan las fotos originales de F22, regenerar las copias con
`node scripts/prepare-mobile-panoramas.mjs` y versionar las imágenes y el manifiesto.
La conversión se hace localmente; no se añade trabajo de conversión al build.

## Validación y límites

`npm.cmd run test:tour` verifica reducción de resolución, límites de GPU,
preservación de firmas URL, fallos de red, tiempo de espera y cancelación de
cargas. TypeScript verifica la integración de componentes y controles.

Resultado actual: 39 pruebas del recorrido aprobadas; TypeScript y build completo
`npm.cmd run build` aprobados (17,19 segundos en esta ejecución). El build incluye
las 12 imágenes móviles. Se mantiene el aviso previo de bundle JavaScript grande,
que corresponde al trabajo de rendimiento pendiente. En la revisión anterior se
aprobaron 106 pruebas al combinar recorrido y seguridad. También se
consultó el catálogo público real de Supabase: F22 contiene 12 ambientes y las
12 referencias de imagen corresponden a archivos presentes en `public/` del
proyecto. Esto no equivale a verificar su despliegue HTTP en el dominio de Vercel.

Un build anterior encontró falta de espacio local al copiar `public/`; el build
completo actual sí finaliza. Vercel debe ejecutar `npm run build` con los archivos
públicos del repositorio.

La herramienta de revisión visual se detuvo al no poder verificar la URL de
Chrome en Windows. No se ha realizado una prueba en un iPhone físico ni se
garantiza compatibilidad de hardware sin WebGL, de visores externos o de
dispositivos con recursos insuficientes.

Después de publicar, comprobar en la PWA real y en un navegador de escritorio:

1. Abrir F22: debe aparecer el espacio reservado y no el reel anterior.
2. Entrar al recorrido y arrastrar en horizontal y vertical.
3. Cambiar varios ambientes mediante hotspots, carrusel y plano.
4. Girar el teléfono y comprobar que «Volver» y los controles siguen visibles.
5. Probar el arrastre con el giroscopio desactivado y después su permiso opcional.
6. Enviar la PWA a segundo plano durante más de cinco minutos, volver y cambiar
   de ambiente para verificar la renovación de enlaces.
7. Salir y comprobar que se recupera el lugar anterior de la página.
