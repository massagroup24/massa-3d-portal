# Especificaciones de Hacienda F22

Fuente: imagen del cuadro de áreas y del cuadro de ocupaciones y cargas aportada
por el usuario el 3 de noviembre de 2026. Es una transcripción del documento,
sin evaluación normativa ni certificación técnica adicional.

| Dato | Valor del documento |
| --- | --- |
| Tipología | Vivienda no VIS unifamiliar |
| Área total del lote | 644,00 m² |
| Primer piso | 223,78 m² |
| Kiosco | 42,32 m² |
| Zona piscina | 56,96 m² |
| Total área primer piso | 323,06 m² |
| Segundo piso | 198,78 m² |
| Tercer piso | 70,25 m² |
| Área libre | 320,94 m² |
| Construcción total | 592,09 m² |
| Índice de ocupación | 0,41 |
| Índice de construcción | 0,91 |
| Grupo de ocupación | Residencial |
| Subgrupo de ocupación | R1 |
| Número de salidas | 2 |
| Categoría de riesgo | I |
| Carga ocupacional | 21 |

Los valores se conservan tal como aparecen. La comprobación aritmética muestra:

- 223,78 + 42,32 + 56,96 = 323,06 m².
- 323,06 + 320,94 = 644,00 m².
- 323,06 + 198,78 + 70,25 = 592,09 m² (Total primer piso + segundo piso + tercer piso).

## Implementación

`src/data/haciendaF22Technical.json` conserva los datos transcritos;
`src/data/haciendaF22Specs.ts` comparte sus formatos, resumen y niveles. La portada,
catálogo comercial, ficha pública, resúmenes, editor y metadatos de planos usan
esta información. `ProjectTechnicalSheet` presenta el cuadro completo tanto en
la página dedicada como en el portal.

Se retiraron los conteos provisionales de dormitorios, baños y parqueaderos,
así como áreas individuales de ambientes, alturas, marcas, materiales, acabados,
certificaciones, automatización y condiciones de pago que la fuente no confirma.
Los renders mantienen sus archivos y dimensiones; sus leyendas son descriptivas
y no atribuyen especificaciones constructivas. El recorrido conserva IDs,
imágenes, planos, coordenadas, pisos y destinos de navegación.

La corrección se aplica al registro F22 que devuelve la consulta autorizada y a
su guardado. No agrega F22 a un catálogo que no lo contenga ni cambia su estado
de publicación. El editor muestra las áreas documentadas como lectura y los
conteos no documentados sin una cantidad prefijada. Para incorporar datos nuevos
confirmados debe ampliarse esta fuente y su presentación.

## Actualización en Supabase y publicación

El SQL de contenido está en
`supabase/actualizar_especificaciones_hacienda_f22.sql`. Ejecutarlo completo en
SQL Editor para actualizar el JSON de F22 y los metadatos de sus medios. Incluye
una consulta de datos anteriores y una consulta final de verificación. Aborta si
no existe el registro esperado o sus datos no son un objeto JSON. Puede repetirse;
no cambia usuarios, políticas de acceso, publicación ni otros proyectos.

El SQL está preparado y probado localmente; no se ha ejecutado en el servidor
desde esta sesión. Los archivos de la web deben publicarse con el flujo habitual
de Git y Vercel.

## Verificación

Las pruebas específicas verifican los valores transcritos, las sumas, la
coincidencia entre superficies, la presentación de los 16 datos del cuadro,
la retirada de especificaciones genéricas, la conservación del recorrido y
las lecturas/escrituras de datos antiguos. El SQL real se ejecuta en PGlite,
incluida su repetición y aislamiento respecto a otros proyectos.

Comando: `npm.cmd run test:security -- tests/specs tests/tour`.
Resultado: 138 pruebas aprobadas, incluyendo 9 de especificaciones F22.
TypeScript aprobado y build completo aprobado en 17,21 segundos en la primera
verificación de esta actualización. Se mantiene el aviso previo de tamaño del
bundle JavaScript; su división forma parte de la etapa de rendimiento pendiente.
