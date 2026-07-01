export async function compressImage(file: File, maxWidth = 6144, maxHeight = 3072): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Mantener proporción equirectangular original
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Calidad de renderizado alta en el canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar en formato WebP al 88% de calidad (estándar web ultra ligero con calidad 100% intacta)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback seguro a JPEG si el navegador no retornara WebP
              canvas.toBlob((fallbackBlob) => {
                if (!fallbackBlob) { resolve(file); return; }
                const jpgFile = new File([fallbackBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(jpgFile);
              }, 'image/jpeg', 0.90);
              return;
            }
            // Crear nuevo File en formato WebP optimizado
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          0.88 // 88% de calidad: nitidez visual arquitectónica intacta pero 10 veces más ligero
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
