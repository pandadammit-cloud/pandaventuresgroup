#!/usr/bin/env node
/**
 * add-search-consolidation-backlog.cjs
 * Adds db-search-1: Consolidate all search surfaces through the API
 * Run: node scripts/add-search-consolidation-backlog.cjs
 */

const { initializeApp, applicationDefault } = require('../node_modules/firebase-admin/lib/index.js');
const { getFirestore } = require('../node_modules/firebase-admin/lib/firestore/index.js');

initializeApp({ credential: applicationDefault(), projectId: 'pandaventuresgroup' });
const db = getFirestore();

const NOW = new Date().toISOString();

const ITEM = {
  product: 'dockbound',
  section: 'Search',
  title: 'Consolidate all cruise/port searches through the API',
  description: 'Currently three search surfaces (micro-selection, advisor cruise picker, partner API) each query Firestore directly. Search analytics logging added 2026-09-27 as a stepping stone. Eventually all direct Firestore queries should route through a single CF (browseCruises or equivalent) so filters, result counts, and logging are consistent. This will also enable advanced filter support (accessibility, port type, city size, walkability) mapped to port guide section data.',
  userCategory: 'V2',
  size: 'M',
  order: 1,
  status: 'open',
  createdAt: NOW,
  createdBy: 'dockboundAI',
  updatedAt: NOW,
  updatedBy: 'dockboundAI',
};

async function run() {
  const ref = db.collection('backlog').doc('db-search-1');
  const snap = await ref.get();
  if (snap.exists) {
    console.log('⏭  db-search-1 already exists — skipping');
    return;
  }
  await ref.set(ITEM);
  console.log('✅ db-search-1 created.');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
