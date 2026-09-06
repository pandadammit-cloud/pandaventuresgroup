/**
 * One-time migration: move config/' backlog'/releases → config/backlog/releases
 *
 * Usage:
 *   node scripts/migrate-releases.mjs path/to/serviceAccountKey.json
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const keyPath = process.argv[2];
if (!keyPath) {
  console.error('Usage: node scripts/migrate-releases.mjs <serviceAccountKey.json>');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const SRC  = 'config/ backlog/releases';   // space in document name
const DEST = 'config/backlog/releases';

async function migrate() {
  const srcRef  = db.collection(SRC);
  const destRef = db.collection(DEST);

  const snap = await srcRef.get();
  if (snap.empty) {
    console.log('No documents found at source path:', SRC);
    process.exit(0);
  }

  console.log(`Found ${snap.docs.length} documents to migrate.`);

  const batch = db.batch();
  for (const docSnap of snap.docs) {
    batch.set(destRef.doc(docSnap.id), docSnap.data());
    batch.delete(docSnap.ref);
    console.log(`  ${docSnap.id}`);
  }

  await batch.commit();
  console.log('Done. Documents moved to', DEST);
}

migrate().catch(err => { console.error(err); process.exit(1); });
