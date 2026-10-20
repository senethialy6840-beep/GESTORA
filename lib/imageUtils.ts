/**
 * Utilitaire de compression et d'optimisation d'images côté client.
 * Permet de convertir automatiquement n'importe quelle photo lourde (ex: photo smartphone de 5 à 20 Mo)
 * en une image optimisée (< 150 Ko) parfaitement nette pour les logos, factures et tickets.
 */
export async function compressImage(
  file: File,
  maxDimension: number = 800,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Si ce n'est pas une image, rejeter
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Le fichier sélectionné n\'est pas une image valide.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Impossible de lire le fichier sélectionné.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Impossible de charger l\'image pour la compression.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcul des nouvelles dimensions proportionnelles
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback sur le base64 original si canvas n'est pas supporté
          resolve(e.target?.result as string);
          return;
        }

        // Amélioration du rendu et de l'anticrénelage
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Pour les logos avec transparence (PNG / WEBP), préserver la transparence
        const isPng = file.type === 'image/png';
        const isWebp = file.type === 'image/webp';
        
        ctx.drawImage(img, 0, 0, width, height);

        // Format de sortie adapté
        const outputMime = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';
        const compressedBase64 = canvas.toDataURL(outputMime, quality);

        resolve(compressedBase64);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
