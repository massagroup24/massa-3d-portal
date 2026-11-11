# Análisis funcional y oportunidades de MASSA HOME

Fecha: 6 de noviembre de 2026.

## Alcance y conclusión

Revisión de la estructura de `src`, rutas, componentes, servicios, datos, configuración de despliegue, migraciones, scripts operativos, documentación y pruebas. Se ejecutaron TypeScript, la suite completa de Vitest, la compilación de producción y el comando de lint. No se modificó código funcional ni se consultó la base de datos de producción. No se realizó una prueba visual en navegador ni en dispositivos físicos; las observaciones de interacción proceden del código.

El producto actual es principalmente un portafolio comercial con presentaciones de proyectos y exploración inmersiva. Tiene recursos para evolucionar hacia una herramienta de asesoría y selección de preferencias. La prioridad de producto es conectar lo que el visitante explora con lo que desea consultar: ambiente, característica, acabados y proyecto.

La base técnica pasa sus verificaciones de tipos, pruebas y compilación. Eso no demuestra por sí solo que todos los flujos del navegador o las políticas remotas funcionen correctamente. Se encontraron diferencias entre la intención documentada y el comportamiento del frontend que conviene resolver antes de ampliar la plataforma.

## 1. Arquitectura y lógica actual

| Capa | Implementación | Función |
| --- | --- | --- |
| Aplicación | React 18, TypeScript, Vite | Interfaz y estados locales de navegación |
| Navegación | React Router en `App.tsx` | Portada, proyectos, tours y recuperación de contraseña |
| Presentación | Tailwind, Framer Motion, Embla | Animaciones, galerías, carrusel y lightbox |
| Inmersión | Three.js, React Three Fiber, Drei | Panoramas esféricos, hotspots y controles |
| Datos remotos | Supabase PostgreSQL y Storage | Catálogo, publicación, contenido y archivos |
| Acceso | Supabase Auth, perfil y RPC de autorización | Única cuenta administradora |
| Datos compilados | `projects.json`, `tourData.ts`, `projectIdentityConfig.ts`, especificaciones F22 | Catálogo editorial, identidad, medios y datos de respaldo |
| Persistencia local | `localStorage`, `sessionStorage` | Borradores, estado del editor y preferencias de interfaz |
| Entrega | Vercel, manifest y banner de instalación | SPA y apertura desde pantalla de inicio |

### Visitante

1. `/` abre `MainPortal` y consulta el catálogo disponible en Supabase.
2. Sin sesión administrativa, muestra `VipCommercialLanding`.
3. La portada presenta video, introducción, filtros de tipo/estado/año y tarjetas de proyecto.
4. Seleccionar un proyecto abre su página en otra pestaña mediante la identidad y el slug canónicos.
5. `/proyecto/:id` muestra presentación, renders, galería, niveles, ficha técnica y contactos; la disponibilidad de cada sección depende del proyecto.
6. Los proyectos con recorrido abren el motor 360° en un modal. También existe la entrada directa `/tour/:id`.
7. Los contactos llevan a WhatsApp, teléfono o correo. Actualmente no se observa un flujo conectado de registro y seguimiento de interesados dentro de la plataforma.

Esta experiencia ofrece abundante exploración visual. La consulta comercial suele comenzar desde un mensaje general del proyecto; todavía no incorpora de forma sistemática los ambientes y preferencias que la persona acaba de explorar.

### Administración

1. El modal comercial inicia sesión con Supabase Auth.
2. `authService` exige identidad autorizada, perfil `admin` y respuesta positiva de `is_platform_admin()`.
3. El rol visual `architect` abre `ProjectsManagementPortal`.
4. El portal agrupa proyectos actuales y recorridos guardados mediante listas de IDs predefinidas.
5. `ProjectConfigurator` permite editar ambientes, imágenes panorámicas, niveles, planos, posición de minimapa, conexiones y publicación.
6. Guardar escribe datos locales, notifica al componente padre y sincroniza con Supabase.

El flujo vigente favorece administrar proyectos conocidos. La creación y clasificación de proyectos adicionales necesita una ruta coherente desde el catálogo remoto: los listados administrativos actuales dependen de IDs fijos.

### Motor 360°

`TourContainer` coordina ambiente activo, transiciones, inactividad y giroscopio. `TourViewer` dibuja la escena y controla cámara, pérdida de contexto WebGL y recuperación. `RoomSphere` carga la textura, presenta errores con reintento y dibuja hotspots de navegación. `OverlayUI` ofrece selección de ambientes y planos por piso.

Ya hay una base útil de interacción: arrastre, navegación entre escenas, planos, giroscopio y recuperación ante fallos. Las nuevas propuestas deben extenderla, evitando añadir controles que repitan esas acciones.

### Modelo de acceso real

El código conserva componentes de cliente, gestión de usuarios, bitácora y otros roles de etapas anteriores. El acceso actual está deliberadamente limitado a una cuenta administradora; `authService` rechaza el ingreso de clientes y otras identidades. `/admin/usuarios` renderiza `MainPortal`, no el gestor de usuarios heredado.

Un portal privado de clientes sería una ampliación de producto y de permisos. Requeriría revisar Auth, asignaciones, políticas RLS, Storage y pruebas. No basta con mostrar los componentes que ya existen.

## 2. Qué existe y qué está conectado

| Elemento | Estado observado | Implicación |
| --- | --- | --- |
| Portada y filtros | Conectados; catálogo compilado | Ya hay filtrado; la mejora es coherencia con publicación remota y preferencias |
| Páginas dedicadas | Conectadas | Buen punto para centralizar acciones por ambiente |
| Carrusel Skiper | Conectado, con categorías, pausa, navegación y ampliación | Conviene añadir favoritos y contexto, conservando controles existentes |
| Compartir proyecto | Conectado, con compartir nativo y alternativas de copia | La ampliación útil es compartir una escena o una selección concreta |
| Tour 360° | Conectado por página y URL directa | Conviene unificar opciones y medición entre entradas |
| Estimador de inversión | Existe, sin importación desde el flujo activo | Se puede recuperar después de revisar sus supuestos y fórmulas |
| Panel de visitas | Existe; depende de `Home`, que está fuera del flujo activo | No equivale a tener analítica disponible para la administración actual |
| Editor comercial `AdminProjectEditor` | Existe, fuera del flujo activo | Su funcionalidad no debe darse por disponible desde el portal actual |
| Seguimiento de obra | Componentes y tablas existentes; sin acceso de clientes vigente | Proyecto futuro con una decisión de acceso específica |
| Modelo 3D del portal | Geometría genérica programada | No está conectado a un modelo real diferente por proyecto |
| Comparación antes/después | Componente existente en `ProgressTimeline` | El servicio entrega `beforeAfterComparison: undefined`; falta contenido y conexión |
| Instalación en inicio | Manifest y banner conectados | No se encontró service worker ni estrategia explícita de uso sin conexión |

La revisión de importaciones relativas desde `main.tsx` también identifica módulos fuera del grafo activo. Esto es evidencia de integración estática, no una recomendación de borrarlos automáticamente: algunos son recursos históricos, utilidades o declaraciones de tipos.

## 3. Hallazgos que afectan la evolución

### A. Publicación inconsistente en el frontend — prioridad alta

`App.tsx` filtra el catálogo remoto publicado para visitantes. Sin embargo, `VipCommercialLanding` recibe una prop `projects` y no la utiliza: sus filtros y tarjetas se construyen desde `CANONICAL_PROJECTS`.

Además, `ProjectDedicatedView` utiliza `project || projectsData[previewCanonical.id]` para F22 e Ibiza y un respaldo canónico para otros proyectos conocidos. Una respuesta vacía o un fallo del servidor puede terminar mostrando la presentación compilada. El nombre `canonicalRemoteProject` no implica que el dato provenga del servidor.

Consecuencia: el frontend puede seguir presentando un proyecto conocido después de que el servidor deje de devolverlo. Esto no demuestra acceso indebido a tablas o archivos protegidos de Supabase; sí demuestra que la decisión de publicación no gobierna toda la presentación pública.

Recomendación: usar el resultado autorizado del servidor para decidir la disponibilidad, tanto en portada como en enlace directo. Separar los estados «cargando», «falló la consulta» y «no disponible». Usar la identidad estática para estilo y marca después de confirmar la disponibilidad. Los archivos de `public/` y los datos compilados son distribuidos públicamente; ocultar una tarjeta no los vuelve privados.

Evidencia: [App.tsx](../src/App.tsx), [VipCommercialLanding.tsx](../src/components/commercial/VipCommercialLanding.tsx), [ProjectDedicatedView.tsx](../src/components/project/ProjectDedicatedView.tsx).

### B. Guardar y cerrar tienen efectos superpuestos — prioridad alta

`ProjectConfigurator.handleSaveToSupabase` llama a `onSave` antes de esperar su propia escritura remota. En `MainPortal`, ese callback llama a `handleSaveProject`, que inicia otra escritura a Supabase. Una acción puede generar dos guardados remotos, con errores gestionados por caminos distintos.

En proyectos existentes, `handleClose` también llama a `onSave(project)` y por esa vía persiste remotamente. Por tanto, «cerrar» puede guardar cambios aunque no se haya pulsado «guardar». El aviso de cambios pendientes está limitado al caso de proyecto nuevo sin guardar; el portal activo pasa `isNewProject={false}`.

Recomendación: una única operación remota, estados visibles de borrador/sincronización/error y acciones explícitas de guardar, descartar o continuar editando. Añadir historial y control de revisión antes de permitir trabajo simultáneo o más automatización.

Evidencia: [ProjectConfigurator.tsx](../src/components/ProjectConfigurator.tsx), [App.tsx](../src/App.tsx).

### C. Varias fuentes compiten por el contenido — prioridad media-alta

La identidad visual y renders de páginas conocidas pueden proceder de configuración compilada incluso cuando existe un proyecto remoto. El servicio del portal también contiene planos de ejemplo y valores predeterminados de fase y porcentaje. La fuente verificada de especificaciones F22 es un avance útil; el resto del catálogo necesita una política equivalente.

Consecuencia: actualizar un dato remoto no garantiza que cambie en todas las pantallas. Un valor de ejemplo puede parecer una especificación o un avance real si ese módulo vuelve a habilitarse.

Recomendación: distinguir contenido confirmado, contenido pendiente y datos de demostración. Definir una fuente principal por campo; conservar marca y tema separados del contenido editable.

Evidencia: [portalService.ts](../src/services/portalService.ts), [projectIdentityConfig.ts](../src/config/projectIdentityConfig.ts), [canonicalProjects.ts](../src/data/canonicalProjects.ts).

### D. Medición incompleta — prioridad media-alta

La llamada activa a `logProjectVisit` está en `ClientViewer`, entrada `/tour/:id`. No se encontró registro equivalente para el recorrido abierto desde `ProjectDedicatedView`, ni eventos de favoritos, ambientes o clics comerciales. `getProjectVisits` devuelve como máximo 200 filas; contar esa muestra no equivale a medir el tráfico histórico total.

Recomendación: instrumentar las entradas del mismo flujo con una taxonomía común: proyecto visto, tour iniciado, ambiente visitado, favorito añadido, selección compartida, clic de contacto y solicitud recibida. Separar clic en WhatsApp de conversación efectivamente iniciada: un enlace por sí solo no confirma esa conversación. Definir deduplicación y agregados por fecha.

### E. Carga inicial y consumo móvil — prioridad media

La compilación genera un archivo JavaScript principal de 1.908,56 kB, 523,65 kB gzip, y CSS de 173,84 kB, 23,58 kB gzip. No se encontró división de rutas con `React.lazy` en `App`. Es una oportunidad de reducir lo que descarga la persona que solo abre la portada.

`public/` contiene 143 archivos y aproximadamente 413,3 MiB. Es el volumen almacenado, no el peso de una visita. Hay videos de 33–56 MiB e imágenes de cerca de 10 MiB. El impacto real requiere medir solicitudes y tiempos en navegador.

Ya existen copias ligeras de panoramas F22. Actualmente `RoomSphere` intenta primero la imagen original y usa el modo móvil como respaldo si falla. `TourViewer` solicita alto rendimiento y admite DPR de hasta 2,5. La calidad automática por dispositivo/conexión todavía puede mejorar.

Recomendación: cargar editor y visor bajo demanda; medir imágenes, video y fuentes; añadir calidad automática y elección del usuario. [React documenta `lazy` para diferir la carga de componentes](https://react.dev/reference/react/lazy).

### F. Paridad entre formas de abrir el tour — prioridad media

La página dedicada pasa `floorPlans`, identidad y `tourEmbedUrl` al visor. `ClientViewer` no pasa esas opciones. Un enlace directo y una apertura desde la página pueden ofrecer distintas capacidades para el mismo proyecto.

Recomendación: reutilizar un adaptador de configuración del tour en ambas entradas y cubrir esa equivalencia con pruebas de flujo.

### G. Calidad y documentación

Las pruebas existentes pasan, pero no cubren todos los recorridos de UI señalados. El comando de lint falla porque falta configuración de ESLint. Parte de la documentación de permisos describe el modelo histórico de varios roles; la documentación posterior y `authService` describen el modelo vigente de cuenta única.

Recomendación: actualizar la referencia funcional vigente y añadir pocas pruebas completas sobre publicación, guardado y apertura de tours. Mantener la distinción entre pruebas locales de migraciones y comprobación del servidor real.

## 4. Funciones propuestas y prioridad

El esfuerzo es una estimación relativa, no un compromiso de plazo. Depende de contenido disponible, alcance visual y cambios de datos.

| Prioridad | Función | Interacción concreta | Valor esperado | Esfuerzo |
| --- | --- | --- | --- | --- |
| 1 | Favoritos y selección personal | Guardar renders y ambientes; revisar «Mi selección»; compartirla | Ayuda a expresar preferencias y retomar la exploración | Medio |
| 1 | Consulta contextual | «Consultar por este ambiente» incorpora proyecto, escena y selección al mensaje | Da al asesor un punto de partida concreto | Bajo-medio |
| 1 | Recorrido guiado | Elegir una ruta breve por espacios clave, con pasos y pausa | Ayuda a quien no sabe por dónde comenzar | Medio |
| 2 | Hotspots informativos | Tocar un acabado o elemento para ver material, característica y foto | Permite comprender decisiones arquitectónicas | Medio |
| 2 | Plano conectado a información | Seleccionar una estancia para abrir su escena, superficie y especificaciones verificadas | Une distribución, escala y experiencia visual | Medio |
| 2 | Comparador render/obra | Deslizar entre imágenes correspondientes, con fecha y estado | Muestra evolución y resultados con evidencia | Medio, más preparación de medios |
| 2 | Solicitud de asesoría y dossier | Elegir interés, canal de contacto y enviar selección; confirmar recepción | Crea un siguiente paso medible dentro de la plataforma | Medio |
| 2 | Retomar y elegir calidad | Volver al último ambiente y usar modo ligero/alta calidad | Reduce fricción en móvil y visitas repetidas | Bajo-medio |
| 3 | Variantes de acabados | Alternar entre opciones previamente producidas para una misma vista | Facilita decisiones y personalización | Medio-alto, más producción gráfica |
| 3 | Comparador de proyectos | Comparar dos o tres fichas usando datos confirmados | Ayuda cuando aumente el catálogo de opciones comparables | Medio |
| 3 | Modelo 3D real por proyecto | Rotar un GLB/glTF real y consultar elementos | Amplía la comprensión espacial | Alto, más preparación del modelo |
| 3 | Seguimiento privado de obra | Hitos, reportes y observaciones con permisos específicos | Aporta continuidad durante ejecución | Alto; requiere ampliar el modelo de acceso |

### Primera entrega recomendada: explorar → guardar → consultar

1. Añadir un corazón discreto a renders y ambientes.
2. Mostrar una bandeja «Mi selección» con miniaturas, quitar elementos y una nota opcional.
3. Conservar la selección en el mismo dispositivo sin exigir registro.
4. Ofrecer «Compartir selección» y «Consultar por WhatsApp» con contexto.
5. Incluir un enlace al ambiente exacto, por ejemplo `/proyecto/hacienda-f22?room=room_f22_cocina_1`. El nombre es ilustrativo: se debe validar el ID real y que el proyecto esté publicado.
6. Registrar selección y clic de contacto como eventos distintos.

Para compartir selecciones entre dispositivos hace falta serializar una lista pequeña en la URL o crear un recurso con identificador público y contenido validado. La persistencia local por sí sola no permite que otra persona abra esa selección. El receptor debe volver a comprobar la disponibilidad del proyecto y de sus medios.

Criterios de aceptación: favoritos sobreviven a una recarga en el mismo navegador; compartir reproduce la selección permitida; el enlace abre el ambiente correcto; borrar un favorito actualiza el mensaje; la acción funciona desde móvil; el catálogo no expone borradores.

### Segunda entrega: recorrido con intención

Ofrecer «Visita guiada» y «Explorar libremente», aprovechando el motor actual. La ruta podría presentar zona social, cocina, área privada y terraza, según el contenido real de cada proyecto. Mostrar «3 de 6 espacios», permitir saltar y pausar, y conservar la navegación manual.

Los hotspots actuales conectan habitaciones mediante `targetRoom`. Para informar sobre materiales y características conviene ampliar el modelo con tipos de acción explícitos: navegación, información y medio. El editor debe permitir configurar esos tipos y validar sus campos.

### Tercera entrega: seguimiento comercial

Conectar eventos a un panel administrativo por proyecto: aperturas, inicios de tour, escenas exploradas, favoritos y solicitudes recibidas. Habilitar un formulario breve de asesoría o dossier y una bandeja de interesados con estado y notas internas.

Un formulario público requiere un punto de entrada validado con control de abuso y lectura restringida al administrador. Agendar con disponibilidad real exige integración de calendario; solicitar una franja preferida puede empezar sin ese compromiso automático. La autorización del usuario para construir estas funciones no implica autorización para contactar personas.

### Recuperación del estimador existente

`InvestmentEstimator` tiene tipos de proyecto, ubicación, área, acabados y salida a WhatsApp. Antes de conectarlo, revisar tarifas y supuestos: usa costos y conversión COP/USD fijos; el tipo de proyecto no interviene en el cálculo base; `include360Tour` no modifica el resultado ni se incluye en el mensaje enviado.

Su versión publicable debería usar rangos aprobados por MASSA, explicar qué incluyen, indicar fecha y permitir actualizar supuestos desde administración. Se trata de una estimación orientativa, no de un presupuesto contractual. Esta auditoría no valida sus precios actuales.

### PWA y modo sin conexión

El manifest y el banner permiten una experiencia de apertura desde inicio. No se encontró implementación propia de service worker/caché. Un modo de visita sin conexión necesitaría almacenamiento y actualización explícitos; [MDN explica cómo los service workers y las estrategias de caché permiten esa operación](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation).

Una primera mejora pequeña es conservar preferencias y selección, e informar con claridad de la falta de conexión. Descargar tours completos requiere decidir qué contenido se puede almacenar, cuánto ocupa y cómo se actualiza. Las URLs firmadas temporales no deben tratarse como un mecanismo de descarga permanente.

## 5. Orden de trabajo recomendado

1. **Coherencia funcional:** publicar/despublicar con una fuente autorizada; unificar guardar/cerrar; revisar la precedencia de datos y las diferencias entre entradas del tour.
2. **Base de medición y carga:** eventos comunes, panel mínimo y carga del visor/editor bajo demanda. Medir en móvil antes y después.
3. **Interactividad comercial:** favoritos, selección compartida y consulta contextual.
4. **Comprensión del espacio:** visita guiada, hotspots informativos y plano conectado.
5. **Ampliaciones con contenido:** render/obra, dossier, estimador validado, variantes y modelos reales.
6. **Producto privado, si se decide:** seguimiento de obra y permisos adicionales, con diseño de acceso específico.

Para la primera entrega conviene medir porcentaje de visitantes que guardan una selección, que la comparten y que pulsan contacto. No se asignan incrementos de ventas o conversión sin una línea base y resultados observados.

## 6. Verificación realizada

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | Aprobado |
| Vitest completo | 14 archivos y 157 pruebas aprobadas |
| Build de Vite | Aprobado; advertencia por tamaño del archivo principal |
| `npm run lint` | Falló: ESLint no encuentra configuración |
| Modificación de código funcional | Ninguna |
| Servidor y políticas de producción | No comprobados en esta revisión |
| Navegador, iPhone y Android físicos | No comprobados en esta revisión |

La compilación se generó en una carpeta temporal para conservar `dist` del proyecto. Las primeras ejecuciones de Vite/Vitest encontraron una restricción de lectura del aislamiento; la repetición autorizada fuera del aislamiento completó ambas verificaciones.

Los resultados sustentan que el proyecto compila y conserva sus regresiones cubiertas. Los hallazgos de publicación, guardado e integración requieren verificaciones de flujo adicionales; que la suite actual pase no los descarta.
