import { useEffect, useState } from 'react';
import { listDockGuides } from '../../../lib/platformcoreApi';

interface Guide {
  guideId: string;
  entityName: string;
  guideTypeId: string;
  status: 'stub' | 'draft' | 'published';
  metadata?: { portCode?: string; state?: string; country?: string };
  score: number | null;
  createdAt?: { seconds: number };
}

const STATUS_ORDER = { stub: 0, draft: 1, published: 2 };

export default function GuideQueueTab() {
  const [guides, setGuides]         = useState<Guide[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filterStatus, setFilter]   = useState<string>('stub');

  useEffect(() => {
    listDockGuides()
      .then((data: { guides: Guide[] }) => setGuides(data.guides || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="tab-loading">Loading guides…</div>;
  if (error)   return <div className="tab-error">Error: {error}</div>;

  const filtered = guides
    .filter(g => filterStatus === 'all' || g.status === filterStatus)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const counts = {
    stub:      guides.filter(g => g.status === 'stub').length,
    draft:     guides.filter(g => g.status === 'draft').length,
    published: guides.filter(g => g.status === 'published').length,
  };

  return (
    <div className="guide-queue">
      <div className="guide-queue__header">
        <h2 className="guide-queue__title">Guide Queue</h2>
        <div className="guide-queue__counts">
          <span className="queue-badge queue-badge--stub">{counts.stub} stub</span>
          <span className="queue-badge queue-badge--draft">{counts.draft} draft</span>
          <span className="queue-badge queue-badge--published">{counts.published} published</span>
        </div>
      </div>

      <div className="guide-queue__filters">
        {(['stub', 'draft', 'published', 'all'] as const).map(s => (
          <button
            key={s}
            className={`filter-btn${filterStatus === s ? ' filter-btn--active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <p className="tab-empty">No guides with status <strong>{filterStatus}</strong>.</p>
        : (
          <table className="queue-table">
            <thead>
              <tr>
                <th>Port</th>
                <th>Name</th>
                <th>Status</th>
                <th>Score</th>
                <th>Firestore</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.guideId}>
                  <td><code>{g.metadata?.portCode || '—'}</code></td>
                  <td>{g.entityName}</td>
                  <td><span className={`status-badge status-badge--${g.status}`}>{g.status}</span></td>
                  <td>{g.score != null ? g.score : '—'}</td>
                  <td>
                    <a
                      href={`https://console.firebase.google.com/project/platformcore-dev/firestore/data/guides/${g.guideId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="table-link"
                    >
                      Open →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  );
}
