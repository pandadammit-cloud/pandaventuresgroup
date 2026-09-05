# Backlog Integration Guide

How DockBound and ForumJourney services write and update backlog items in the shared Firestore database.

---

## Firebase Project

- **Project ID:** `pandaventuresgroup`
- **Collection:** `backlog`
- **History subcollection:** `backlog/{id}/history`

---

## Document Schema — `backlog/{id}`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | ✅ | Stable identifier, also used as the Firestore document ID |
| `product` | `"dockbound"` \| `"forumjourney"` | ✅ | Which product owns this item |
| `section` | string | ✅ | Logical grouping, e.g. `"Auth & Onboarding"`, `"Notifications"` |
| `title` | string | ✅ | Short feature name |
| `description` | string | — | One-line elaboration of the title |
| `notes` | string | — | Longer context, links, implementation thoughts |
| `size` | string | — | Effort estimate: `"XS"` `"S"` `"M"` `"L"` `"XL"` |
| `userCategory` | string | ✅ | `"MVP"` \| `"Later"` \| `"Future"` (or any custom label) |
| `order` | number | ✅ | Sort order within the section; lower = higher priority |
| `blockedReason` | string | — | Human-readable blocker, e.g. `"Twilio account approval pending"` |
| `status` | string | ✅ | `"open"` \| `"in-progress"` \| `"done"` |
| `completionReason` | string | — | Only set when `status = "done"`. Why / how it was completed |
| `commitRef` | string | — | Commit hash, PR number, or build reference tied to completion |
| `updatedAt` | string | ✅ | ISO 8601 timestamp of the most recent change, e.g. `"2026-09-05T14:32:00Z"` |
| `updatedBy` | string | ✅ | Identity of the writer: `"dockboundAI"`, `"forumjourneyAI"`, `"amy"`, etc. |

### Rules
- **Never delete documents.** Mark items `status: "done"` with a `completionReason` instead.
- `order` is relative within a section. Items in a section are sorted ascending by `order`.
- `id` must be URL-safe (lowercase, hyphens). Convention: `db-section-N` for DockBound, `fj-section-N` for ForumJourney.

---

## History Subcollection — `backlog/{id}/history/{auto-id}`

Every time you update a backlog item, write a history entry **before or alongside** the update. This is the full state of the item **after** the change, so the history is a complete audit trail.

| Field | Type | Required | Notes |
|---|---|---|---|
| `changedAt` | string | ✅ | ISO 8601 timestamp |
| `changedBy` | string | ✅ | Same as `updatedBy` on the parent doc |
| `changeNote` | string | — | Optional human-readable note, e.g. `"Status moved to done: shipped in v2.3"` |
| `snapshot` | object | ✅ | Full copy of the backlog item fields at this point in time (everything except `id`) |

Use Firestore auto-generated document IDs for history entries. Order by `changedAt` descending when reading.

---

## TypeScript Example (Firebase Admin SDK)

```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: cert(/* your service account */) });
const db = getFirestore();

interface BacklogItem {
  id:                string;
  product:           'dockbound' | 'forumjourney';
  section:           string;
  title:             string;
  description?:      string;
  notes?:            string;
  size?:             string;
  userCategory:      string;
  order:             number;
  blockedReason?:    string;
  status:            'open' | 'in-progress' | 'done';
  completionReason?: string;
  commitRef?:        string;
  updatedAt:         string;
  updatedBy:         string;
}

async function upsertBacklogItem(
  item: BacklogItem,
  changeNote?: string,
): Promise<void> {
  const ref = db.collection('backlog').doc(item.id);
  const histRef = ref.collection('history').doc(); // auto-id

  const batch = db.batch();

  // Write the updated item
  batch.set(ref, item, { merge: true });

  // Write history entry
  batch.set(histRef, {
    changedAt:  item.updatedAt,
    changedBy:  item.updatedBy,
    changeNote: changeNote ?? null,
    snapshot: {
      product:           item.product,
      section:           item.section,
      title:             item.title,
      description:       item.description ?? null,
      notes:             item.notes ?? null,
      size:              item.size ?? null,
      userCategory:      item.userCategory,
      order:             item.order,
      blockedReason:     item.blockedReason ?? null,
      status:            item.status,
      completionReason:  item.completionReason ?? null,
      commitRef:         item.commitRef ?? null,
      updatedAt:         item.updatedAt,
      updatedBy:         item.updatedBy,
    },
  });

  await batch.commit();
}

// Marking an item done
await upsertBacklogItem(
  {
    id:               'db-notif-1',
    product:          'dockbound',
    section:          'Notifications',
    title:            'In-app port alert notifications',
    userCategory:     'Later',
    size:             'S',
    order:            1,
    status:           'done',
    completionReason: 'Shipped in v2.4 — uses Firebase Cloud Messaging',
    commitRef:        'abc1234',
    updatedAt:        new Date().toISOString(),
    updatedBy:        'dockboundAI',
  },
  'Status moved to done: shipped in release v2.4',
);
```

---

## Python Example (firebase-admin)

```python
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

cred = credentials.Certificate('path/to/serviceAccount.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def upsert_backlog_item(item: dict, change_note: str = None):
    ref = db.collection('backlog').document(item['id'])
    hist_ref = ref.collection('history').document()  # auto-id

    snapshot = {k: v for k, v in item.items() if k != 'id'}

    batch = db.batch()
    batch.set(ref, item, merge=True)
    batch.set(hist_ref, {
        'changedAt':   item['updatedAt'],
        'changedBy':   item['updatedBy'],
        'changeNote':  change_note,
        'snapshot':    snapshot,
    })
    batch.commit()

upsert_backlog_item({
    'id':               'fj-events-1',
    'product':          'forumjourney',
    'section':          'Events',
    'title':            'Create event listings',
    'userCategory':     'MVP',
    'size':             'L',
    'order':            1,
    'status':           'in-progress',
    'updatedAt':        datetime.now(timezone.utc).isoformat(),
    'updatedBy':        'forumjourneyAI',
}, 'Started implementation sprint')
```

---

## Firestore Security Rules

The `backlog` collection is **read-only from the browser** (only authenticated admin users can read it through the web app). Writes from DockBound and ForumJourney use the Firebase Admin SDK, which bypasses these rules.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /backlog/{id} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /backlog/{id}/history/{entry} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

Apply these in the Firebase console under **Firestore → Rules**.

---

## Getting the Service Account

1. Firebase Console → Project Settings → Service Accounts
2. Generate a new private key for the `pandaventuresgroup` project
3. Store the JSON securely (never commit it to git)
4. Pass the path via environment variable: `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`
