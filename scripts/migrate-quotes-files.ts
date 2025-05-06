import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Utilise les variables d'environnement GOOGLE_APPLICATION_CREDENTIALS ou un fichier de clé de service
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function migrateQuotes() {
  const snapshot = await db.collection('quotes').get();
  let migrated = 0;
  let skipped = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    // Si déjà migré, on saute
    if (Array.isArray(data.files)) {
      skipped++;
      continue;
    }
    // Si fileUrl existe, on migre
    if (data.fileUrl) {
      await doc.ref.update({
        files: [{ fileUrl: data.fileUrl, fileName: data.fileName || '' }],
        fileUrl: FieldValue.delete(),
        fileName: FieldValue.delete(),
      });
      migrated++;
      console.log(`Migré: ${doc.id}`);
    } else {
      skipped++;
    }
  }
  console.log(`Migration terminée. Migrés: ${migrated}, ignorés: ${skipped}`);
}

migrateQuotes().catch((err) => {
  console.error('Erreur de migration:', err);
  process.exit(1);
}); 