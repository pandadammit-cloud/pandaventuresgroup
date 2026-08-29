import { useEffect, useState } from 'react';
import { listDockGuides } from '../../../lib/platformcoreApi';

interface Guide {
  guideId: string;
  entityName: string;
  metadata?: { portCode?: string };
  v4QaStatus?: 'pending' | 'approved' | null;
  portAreaActivityDepth?: string | null;
  majorExperienceTransferTime?: string | null;
  returnComplexity?: string | null;
  returnDependencies?: string[] | null;
  impactAction?: string | null;
  sections?: {
    transport?: { taxiPricingMethod?: string };
    food?: { tapWaterGuidance?: string };
    dayStyle?: { cardAcceptance?: string; cashRecommendation?: string };
    whatToBring?: { criticalBringItems?: string[]; helpfulBringItems?: string[] };
  };
}

export default function V4ReviewTab() {
  const [guides, setGuides]   = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    listDockGuides()
      .then((data: { guides: Guide[] }) => {
        const pending = (data.guides || []).filter(g => g.v4QaStatus === 'pending');
        setGuides(pending);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="tab-loading">Loading guides…</div>;
  if (error)   return <div className="tab-error">Error: {error}</div>;

  if (guides.length === 0) {
    return (
      <div className="tab-empty">
        <p>No guides pending V4 review.</p>
        <p className="tab-empty__hint">Run <code>node scripts/patch-v4-missing-fields.js --execute</code> to populate fields, then return here to approve.</p>
      </div>
    );
  }

  return (
    <div className="v4-review">
      <div className="v4-review__header">
        <h2 className="v4-review__title">Pending V4 Review</h2>
        <span className="v4-review__count">{guides.length} guide{guides.length !== 1 ? 's' : ''}</span>
      </div>
      <p className="v4-review__instructions">
        Review the V4 fields below. Once satisfied, approve in Firestore by setting <code>v4QaStatus</code> to <code>approved</code>, then run <code>promote-v4-section-fields.js --execute</code> to push to prod.
      </p>

      <div className="v4-review__list">
        {guides.map(guide => {
          const portCode = guide.metadata?.portCode || '';
          const isOpen   = expanded === guide.guideId;
          const sec      = guide.sections || {};

          return (
            <div key={guide.guideId} className="v4-card">
              <button
                className="v4-card__toggle"
                onClick={() => setExpanded(isOpen ? null : guide.guideId)}
              >
                <span className="v4-card__port">{portCode}</span>
                <span className="v4-card__name">{guide.entityName}</span>
                <span className={`v4-card__status v4-card__status--${guide.v4QaStatus || 'none'}`}>
                  {guide.v4QaStatus || 'no status'}
                </span>
                <span className="v4-card__chevron">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="v4-card__body">
                  <table className="v4-table">
                    <tbody>
                      <tr><th>portAreaActivityDepth</th><td>{guide.portAreaActivityDepth ?? '—'}</td></tr>
                      <tr><th>majorExperienceTransferTime</th><td>{guide.majorExperienceTransferTime ?? '—'}</td></tr>
                      <tr><th>returnComplexity</th><td>{guide.returnComplexity ?? '—'}</td></tr>
                      <tr><th>returnDependencies</th><td>{guide.returnDependencies?.join('; ') ?? '—'}</td></tr>
                      <tr><th>impactAction</th><td>{guide.impactAction ?? '—'}</td></tr>
                      <tr><th>taxiPricingMethod</th><td>{sec.transport?.taxiPricingMethod ?? '—'}</td></tr>
                      <tr><th>tapWaterGuidance</th><td>{sec.food?.tapWaterGuidance ?? '—'}</td></tr>
                      <tr><th>cardAcceptance</th><td>{sec.dayStyle?.cardAcceptance ?? '—'}</td></tr>
                      <tr><th>cashRecommendation</th><td>{sec.dayStyle?.cashRecommendation ?? '—'}</td></tr>
                      <tr><th>criticalBringItems</th><td>{sec.whatToBring?.criticalBringItems?.join(', ') ?? '—'}</td></tr>
                      <tr><th>helpfulBringItems</th><td>{sec.whatToBring?.helpfulBringItems?.join(', ') ?? '—'}</td></tr>
                    </tbody>
                  </table>
                  <div className="v4-card__actions">
                    <a
                      className="v4-card__firestore-link"
                      href={`https://console.firebase.google.com/project/platformcore-dev/firestore/data/guides/${guide.guideId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Firestore →
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
