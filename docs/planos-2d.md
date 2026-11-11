# Planos ilustrados en 2D

La página de cada proyecto incluye «Planos 2D» entre la galería y la ficha
técnica, con acceso desde la navegación superior. Hacienda F22 dispone de tres
pisos e Ibiza A14 de dos. Los demás proyectos usan sus niveles configurados o
una distribución general.

Las imágenes se crean fuera de esta web. Para incorporarlas, completar
`imageUrl` de cada piso en `src/config/projectVisualPlans.ts` con una ruta de
`public/` o una URL accesible. Ejemplo de ruta: `/planos-2d/f22/primer-piso.webp`.
Se admiten imágenes PNG, JPG o WebP; el visor conserva la imagen completa, sin
recortarla, y ofrece ampliación en un diálogo con cierre mediante Escape.

Mientras un piso no tenga imagen, se muestra «Plano ilustrado en preparación».
No se solicitan archivos vacíos ni se usan planos técnicos como sustitutos.
Si una imagen falla, se muestra un aviso dentro del espacio de ese piso.

Esta sección no cambia los planos ni minimapas del recorrido 360°. Tampoco
añade cargas de archivos, publicación remota ni cambios a Supabase.
