import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { collection, getDocs, writeBatch, doc, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { BACKLOG, type BacklogItem, type HistoryEntry, type ItemStatus } from '../data/backlog';

type ProductFilter  = 'all' | 'dockbound' | 'forumjourney';
type CategoryFilter = 'all' | string;

const CATEGORY_STYLE: Record<string, { background: string; color: string }> = {
  MVP:    { background: 'var(--color-brand-light)',        color: 'var(--color-brand)'         },
  Later:  { background: 'var(--color-warning-background)', color: 'var(--color-warning)'        },
  Future: { background: 'var(--color-surface-secondary)',  color: 'var(--color-text-secondary)' },
};

const STATUS_CLASS: Record<ItemStatus, string> = {
  'open':        'backlog-status--open',
  'in-progress': 'backlog-status--progress',
  'done':        'backlog-status--done',
};
const STATUS_LABEL: Record<ItemStatus, string> = {
  'open':        'Open',
  'in-progress': 'In Progress',
  'done':        'Done',
};

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function CategoryBadge({ value }: { value: string }) {
  const style = CATEGORY_STYLE[value] ?? {
    background: 'var(--color-info-background)',
    color:      'var(--color-info)',
  };
  return <span className="backlog-cat-badge" style={style}>{value}</span>;
}

function StatusBadge({ status }: { status: ItemStatus }) {
  return <span className={`backlog-status-badge ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>;
}

function SizeBadge({ size }: { size?: string }) {
  if (!size) return null;
  return <span className="backlog-size-badge">{size}</span>;
}

interface Group { product: string; section: string; items: BacklogItem[] }

function groupAndSort(items: BacklogItem[]): Group[] {
  const map = new Map<string, Group>();
  for (const item of items) {
    const key = `${item.product}::${item.section}`;
    if (!map.has(key)) map.set(key, { product: item.product, section: item.section, items: [] });
    map.get(key)!.items.push(item);
  }
  for (const g of map.values()) g.items.sort((a, b) => a.order - b.order);
  const productOrder = ['dockbound', 'forumjourney'];
  return Array.from(map.values()).sort((a, b) => {
    const diff = productOrder.indexOf(a.product) - productOrder.indexOf(b.product);
    return diff !== 0 ? diff : a.section.localeCompare(b.section);
  });
}

const PRODUCT_LABEL: Record<string, string> = {
  dockbound:    'DockBound',
  forumjourney: 'ForumJourney',
};

const COL_COUNT = 7;

export default function BacklogPage() {
  const [items,   setItems]   = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [seeding, setSeeding] = useState(false);

  const [productFilter,  setProductFilter]  = useState<ProductFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [hideDone,       setHideDone]       = useState(true);

  const [historyOpen,    setHistoryOpen]    = useState<Record<string, boolean>>({});
  const [historyData,    setHistoryData]    = useState<Record<string, HistoryEntry[]>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(collection(db, 'backlog'));
      setItems(snap.docs.map(d => d.data() as BacklogItem));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function seedDefaults() {
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      for (const item of BACKLOG) {
        batch.set(doc(db, 'backlog', item.id), item);
      }
      await batch.commit();
      await load();
    } catch (e) {
      setError((e as Error).message);
      setSeeding(false);
    }
  }

  async function toggleHistory(itemId: string) {
    if (historyOpen[itemId]) {
      setHistoryOpen(prev => ({ ...prev, [itemId]: false }));
      return;
    }
    setHistoryOpen(prev => ({ ...prev, [itemId]: true }));
    if (historyData[itemId]) return;
    setHistoryLoading(prev => ({ ...prev, [itemId]: true }));
    try {
      const snap = await getDocs(
        query(collection(db, 'backlog', itemId, 'history'), orderBy('changedAt', 'desc'))
      );
      setHistoryData(prev => ({ ...prev, [itemId]: snap.docs.map(d => d.data() as HistoryEntry) }));
    } catch {
      setHistoryData(prev => ({ ...prev, [itemId]: [] }));
    } finally {
      setHistoryLoading(prev => ({ ...prev, [itemId]: false }));
    }
  }

  useEffect(() => { load(); }, []);

  function kpi(subset: BacklogItem[]) {
    return {
      open:       subset.filter(i => i.status === 'open').length,
      inProgress: subset.filter(i => i.status === 'in-progress').length,
      done:       subset.filter(i => i.status === 'done').length,
      blocked:    subset.filter(i => !!i.blockedReason).length,
      mvp:        subset.filter(i => i.userCategory === 'MVP' && i.status !== 'done').length,
    };
  }
  const allKpi = kpi(items);
  const dbKpi  = kpi(items.filter(i => i.product === 'dockbound'));
  const fjKpi  = kpi(items.filter(i => i.product === 'forumjourney'));

  const allCategories = Array.from(new Set(items.map(i => i.userCategory))).sort();

  let visible = items;
  if (productFilter  !== 'all') visible = visible.filter(i => i.product      === productFilter);
  if (categoryFilter !== 'all') visible = visible.filter(i => i.userCategory === categoryFilter);
  if (hideDone)                 visible = visible.filter(i => i.status        !== 'done');

  const groups = groupAndSort(visible);

  return (
    <div className="backlog-page">
      <header className="admin__header">
        <div className="admin__header-brand">
          <img src="/logo-panda-ventures.png" alt="PandA Ventures" className="admin__header-logo" />
          <span className="admin__header-title">Product Backlog</span>
        </div>
        <button className="admin__signout" onClick={() => signOut(auth)}>Sign out</button>
      </header>

      {!loading && !error && (
        <div className="backlog-filters">
          <div className="backlog-filter-group">
            <span className="backlog-filter-label">Product</span>
            {(['all', 'dockbound', 'forumjourney'] as ProductFilter[]).map(p => (
              <button
                key={p}
                className={`filter-btn${productFilter === p ? ' filter-btn--active' : ''}`}
                onClick={() => setProductFilter(p)}
              >
                {p === 'all' ? 'All' : PRODUCT_LABEL[p]}
              </button>
            ))}
          </div>

          <div className="backlog-filter-group">
            <span className="backlog-filter-label">Category</span>
            {(['all', ...allCategories] as CategoryFilter[]).map(c => (
              <button
                key={c}
                className={`filter-btn${categoryFilter === c ? ' filter-btn--active' : ''}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>

          <label className="backlog-toggle">
            <input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} />
            Hide done
          </label>

          <button className="backlog-refresh" onClick={load}>Refresh</button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="backlog-kpi">
          <table className="backlog-kpi__table">
            <thead>
              <tr>
                <th className="backlog-kpi__th backlog-kpi__th--label" />
                <th className="backlog-kpi__th">Open</th>
                <th className="backlog-kpi__th">In Progress</th>
                <th className="backlog-kpi__th">Done</th>
                <th className="backlog-kpi__th">Blocked</th>
                <th className="backlog-kpi__th">MVP Left</th>
              </tr>
            </thead>
            <tbody>
              {([
                { label: 'Overall',      logo: null,                    k: allKpi },
                { label: 'DockBound',    logo: '/logo-dockbound.png',   k: dbKpi  },
                { label: 'ForumJourney', logo: '/logo-forumjourney.png',k: fjKpi  },
              ] as const).map(({ label, logo, k }) => (
                <tr key={label} className="backlog-kpi__row">
                  <td className="backlog-kpi__td backlog-kpi__td--label">
                    {logo && <img src={logo} alt={label} className="backlog-kpi__logo" />}
                    {!logo && <span className="backlog-kpi__overall">All</span>}
                  </td>
                  <td className="backlog-kpi__td backlog-kpi__td--open">{k.open}</td>
                  <td className="backlog-kpi__td backlog-kpi__td--progress">{k.inProgress}</td>
                  <td className="backlog-kpi__td backlog-kpi__td--done">{k.done}</td>
                  <td className={`backlog-kpi__td${k.blocked > 0 ? ' backlog-kpi__td--blocked' : ''}`}>{k.blocked}</td>
                  <td className="backlog-kpi__td">{k.mvp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <main className="backlog-main">
        {loading && <div className="tab-loading">Loading backlog…</div>}
        {error   && <div className="tab-error">Error: {error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="backlog-empty">
            <p>No items in the backlog collection yet.</p>
            <button className="backlog-seed-btn" onClick={seedDefaults} disabled={seeding}>
              {seeding ? 'Seeding…' : 'Seed with default items'}
            </button>
            <p className="backlog-empty__hint">
              Or have DockBound / ForumJourney write directly to the <code>backlog</code> collection
              in the <code>{import.meta.env.VITE_FIREBASE_PROJECT_ID}</code> Firestore project.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && groups.length === 0 && (
          <div className="tab-empty">No items match the current filters.</div>
        )}

        {groups.map(({ product, section, items: sectionItems }) => (
          <div key={`${product}-${section}`} className="backlog-group">
            <div className="backlog-group__header">
              <img src={`/logo-${product}.png`} alt={PRODUCT_LABEL[product]} className="backlog-group__logo" />
              <span className="backlog-group__product">{PRODUCT_LABEL[product]}</span>
              <span className="backlog-group__sep">›</span>
              <span className="backlog-group__section">{section}</span>
              <span className="backlog-group__count">{sectionItems.length}</span>
            </div>

            <table className="backlog-table">
              <thead>
                <tr>
                  <th className="backlog-table__th backlog-table__th--order">#</th>
                  <th className="backlog-table__th backlog-table__th--title">Item</th>
                  <th className="backlog-table__th backlog-table__th--size">Size</th>
                  <th className="backlog-table__th backlog-table__th--cat">Category</th>
                  <th className="backlog-table__th backlog-table__th--status">Status</th>
                  <th className="backlog-table__th backlog-table__th--updated">Last Updated</th>
                  <th className="backlog-table__th backlog-table__th--hist">Hist</th>
                </tr>
              </thead>
              <tbody>
                {sectionItems.map(item => (
                  <>
                    <tr
                      key={item.id}
                      className={[
                        'backlog-table__row',
                        item.status === 'done' ? 'backlog-table__row--done' : '',
                        item.blockedReason      ? 'backlog-table__row--blocked' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <td className="backlog-table__td backlog-table__td--order">{item.order}</td>
                      <td className="backlog-table__td">
                        <div className="backlog-table__title">{item.title}</div>
                        {item.description && <div className="backlog-table__desc">{item.description}</div>}
                        {item.notes       && <div className="backlog-table__notes">{item.notes}</div>}
                        {item.blockedReason && (
                          <div className="backlog-item__blocked">⚠ {item.blockedReason}</div>
                        )}
                        {item.status === 'done' && item.completionReason && (
                          <div className="backlog-item__completion">
                            ✓ {item.completionReason}
                            {item.commitRef && <code className="backlog-item__commit">{item.commitRef}</code>}
                          </div>
                        )}
                      </td>
                      <td className="backlog-table__td"><SizeBadge size={item.size} /></td>
                      <td className="backlog-table__td"><CategoryBadge value={item.userCategory} /></td>
                      <td className="backlog-table__td"><StatusBadge status={item.status} /></td>
                      <td className="backlog-table__td backlog-table__td--updated">
                        {item.updatedBy && <div className="backlog-updated-by">{item.updatedBy}</div>}
                        {item.updatedAt && <div className="backlog-updated-at">{fmtDate(item.updatedAt)}</div>}
                        {!item.updatedBy && !item.updatedAt && <span className="backlog-updated-at">—</span>}
                      </td>
                      <td className="backlog-table__td backlog-table__td--hist">
                        <button
                          className={`backlog-hist-btn${historyOpen[item.id] ? ' backlog-hist-btn--open' : ''}`}
                          onClick={() => toggleHistory(item.id)}
                          title="View change history"
                        >
                          {historyOpen[item.id] ? '▲' : '▼'}
                        </button>
                      </td>
                    </tr>

                    {historyOpen[item.id] && (
                      <tr key={`${item.id}-hist`} className="backlog-history-row">
                        <td colSpan={COL_COUNT} className="backlog-history-cell">
                          {historyLoading[item.id] && (
                            <div className="backlog-history-loading">Loading history…</div>
                          )}
                          {!historyLoading[item.id] && (!historyData[item.id] || historyData[item.id].length === 0) && (
                            <div className="backlog-history-empty">No history recorded yet.</div>
                          )}
                          {!historyLoading[item.id] && historyData[item.id]?.length > 0 && (
                            <ol className="backlog-history-list">
                              {historyData[item.id].map((entry, i) => (
                                <li key={i} className="backlog-history-entry">
                                  <div className="backlog-history-meta">
                                    <span className="backlog-history-who">{entry.changedBy}</span>
                                    <span className="backlog-history-when">{fmtDate(entry.changedAt)}</span>
                                  </div>
                                  <div className="backlog-history-detail">
                                    <span className={`backlog-status-badge ${STATUS_CLASS[entry.snapshot.status as ItemStatus] ?? 'backlog-status--open'}`}>
                                      {STATUS_LABEL[entry.snapshot.status as ItemStatus] ?? entry.snapshot.status}
                                    </span>
                                    {entry.changeNote && (
                                      <span className="backlog-history-note">{entry.changeNote}</span>
                                    )}
                                    {entry.snapshot.commitRef && (
                                      <code className="backlog-item__commit">{entry.snapshot.commitRef}</code>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ol>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </main>
    </div>
  );
}
