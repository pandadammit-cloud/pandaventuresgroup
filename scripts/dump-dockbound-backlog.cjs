#!/usr/bin/env node
/**
 * dump-dockbound-backlog.cjs
 * Dumps all DockBound backlog items from Firestore as JSON.
 */
const { initializeApp, applicationDefault } = require('../node_modules/firebase-admin/lib/index.js');
const { getFirestore } = require('../node_modules/firebase-admin/lib/firestore/index.js');

initializeApp({ credential: applicationDefault(), projectId: 'pandaventuresgroup' });
const db = getFirestore();

async function run() {
  const snap = await db.collection('backlog')
    .where('product', '==', 'dockbound')
    .get();

  const items = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const s = (a.section || '').localeCompare(b.section || '');
      if (s !== 0) return s;
      return (a.order || 0) - (b.order || 0);
    });
  console.log(JSON.stringify(items, null, 2));
}

run().catch(err => { console.error(err.message); process.exit(1); });
