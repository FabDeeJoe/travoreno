import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export async function uploadQuoteFile(file: File, quoteId: string): Promise<{ fileUrl: string; fileName: string }> {
  try {
    // Si l'ID est 'new', créer un ID temporaire
    const actualQuoteId = quoteId === 'new' ? `temp_${Date.now()}` : quoteId;

    // Créer un nom de fichier unique avec l'extension d'origine
    const extension = file.name.split('.').pop();
    const fileName = `quotes/${actualQuoteId}/${Date.now()}.${extension}`;
    const storageRef = ref(storage, fileName);

    // Configurer les métadonnées
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        quoteId: actualQuoteId
      }
    };

    // Upload le fichier avec une barre de progression
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Retourner une promesse qui se résout quand l'upload est terminé
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Optionnel : suivre la progression
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          // Gérer les erreurs
          console.error('Upload error:', error);
          reject(new Error('Failed to upload file'));
        },
        async () => {
          try {
            // Upload terminé, obtenir l'URL
            const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              fileUrl,
              fileName: file.name
            });
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(new Error('Failed to get download URL'));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadQuoteFile:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteQuoteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  
  try {
    // Extraire le chemin du fichier de l'URL de Firebase Storage
    const decodedUrl = decodeURIComponent(fileUrl);
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/' + storage.app.options.storageBucket + '/o/';
    const filePath = decodedUrl.replace(baseUrl, '').split('?')[0];
    
    // Créer une référence et supprimer le fichier
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
} 