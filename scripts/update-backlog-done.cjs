#!/usr/bin/env node
/**
 * update-backlog-done.cjs
 * Marks completed backlog items as done in Firestore.
 * Run: GOOGLE_APPLICATION_CREDENTIALS=~/secrets/pandaventuresgroup-service-account.json node scripts/update-backlog-done.cjs
 */

const { initializeApp, applicationDefault } = require('../node_modules/firebase-admin/lib/index.js');
const { getFirestore }  = require('../node_modules/firebase-admin/lib/firestore/index.js');

initializeApp({ credential: applicationDefault(), projectId: 'pandaventuresgroup' });
const db = getFirestore();

const NOW = new Date().toISOString();
const BY  = 'dockboundAI';

const DONE_ITEMS = [
  {
    id: 'db-advisor-4',
    product: 'dockbound',
    section: 'Advisor UX',
    title: 'Billing period toggle (Annual / Monthly) at advisor plan picker',
    description: 'Annual/Monthly pill toggle at advisor signup plan picker and inline Settings-tab picker. Basic tier shows "annual only" badge when monthly is selected. Effective priceId passed to Stripe based on toggle.',
    userCategory: 'MVP',
    size: 'S',
    order: 4,
    status: 'done',
    completionReason: 'Shipped 2026-09-17',
    commitRef: 'de297fe',
    updatedAt: NOW,
    updatedBy: BY,
  },
  {
    id: 'db-ux-14',
    product: 'dockbound',
    section: 'Advisor UX',
    title: 'Pricing consistency — drive landing pages from TRAVEFY_TIERS',
    description: 'ForAdvisorsPage and ForAgenciesPage now map plan cards from TRAVEFY_TIERS directly. No hardcoded prices. Annual savings % computed dynamically.',
    userCategory: 'MVP',
    size: 'XS',
    order: 14,
    status: 'done',
    completionReason: 'Shipped 2026-09-17',
    commitRef: 'c89625a',
    updatedAt: NOW,
    updatedBy: BY,
  },
  {
    id: 'db-ux-16',
    product: 'dockbound',
    section: 'Advisor UX',
    title: 'Soften return-time language + add timing disclaimer page section',
    description: 'Return-time language softened to "suggested buffer" across Travefy formatter, evidence builder, and prompt template. New "Port Return Time Guidance" section added to Disclaimers page.',
    userCategory: 'MVP',
    size: 'S',
    order: 16,
    status: 'done',
    completionReason: 'Shipped 2026-09-17',
    commitRef: 'a52c739',
    updatedAt: NOW,
    updatedBy: BY,
  },
  {
    id: 'db-ux-17',
    product: 'dockbound',
    section: 'Advisor UX',
    title: 'Embarkation day display mode in port guide',
    description: 'PortGuideDisplay suppresses return-logistics sections (Getting Off, Time Reality, Getting Back, Return Stress) and shows a boarding-day context banner when isEmbarkationDay=true. AgentDashboard detects embarkation ports via getFirstPortCode() and passes the flag when deep-linking.',
    userCategory: 'MVP',
    size: 'S',
    order: 17,
    status: 'done',
    completionReason: 'Shipped 2026-09-17',
    commitRef: '6857de2',
    updatedAt: NOW,
    updatedBy: BY,
  },
];

async function run() {
  const batch = db.batch();

  for (const item of DONE_ITEMS) {
    const ref = db.collection('backlog').doc(item.id);
    const snap = await ref.get();

    if (snap.exists) {
      const existing = snap.data();
      if (existing.status === 'done') {
        console.log(`⏭  ${item.id} already done — skipping`);
        continue;
      }
      // Write history entry first
      const historyRef = ref.collection('history').doc();
      batch.set(historyRef, {
        changedAt: NOW,
        changedBy: BY,
        changeNote: 'Marked done by dockboundAI after shipping',
        snapshot: existing,
      });
      console.log(`✏️  Updating ${item.id} → done`);
    } else {
      console.log(`➕  Creating ${item.id} (not found in Firestore)`);
    }

    const { id, ...fields } = item;
    batch.set(ref, fields, { merge: true });
  }

  await batch.commit();
  console.log('\n✅ Backlog update complete.');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
