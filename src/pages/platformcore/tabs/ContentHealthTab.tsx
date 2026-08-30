import { useEffect, useState } from 'react';
import { listDockGuides } from '../../../lib/platformcoreApi';

interface Guide {
  guideId: string;
  status: 'stub' | 'draft' | 'published';
  score: number | null;
  stale: boolean;
  portAreaActivityDepth?: string | null;
  majorExperienceTransferTime?: string | null;
  impactAction?: string | null;
  sections?: {
    transport?: { taxiPricingMethod?: string };
    food?: { tapWaterGuidance?: string };
  };
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

export default function ContentHealthTab() {
  const [guides, setGuides]   = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    listDockGuides()
      .then((data: { guides: Guide[] }) => setGuides(data.guides || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="tab-loading">Computing health stats…</div>;
  if (error)   return <div className="tab-error">Error: {error}</div>;

  const total     = guides.length;
  const published = guides.filter(g => g.status === 'published').length;
  const stale     = guides.filter(g => g.stale).length;
  const v4Full    = guides.filter(g => {
    const sec = g.sections || {};
    return g.portAreaActivityDepth && g.majorExperienceTransferTime && g.impactAction
      && sec.transport?.taxiPricingMethod && sec.food?.tapWaterGuidance;
  }).length;

  const avgScore = guides
    .filter(g => g.score != null)
    .reduce((sum, g, _i, arr) => sum + (g.score! / arr.length), 0);

  return (
    <div className="content-health">
      <h2 className="content-health__title">Content Health — Dock Guides</h2>

      <div className="stat-grid">
        <StatCard label="Total guides"        value={total} />
        <StatCard label="Published"           value={`${published} (${pct(published, total)}%)`} />
        <StatCard label="Stale"               value={stale} sub="exceeded freshness policy" />
        <StatCard label="Avg score"           value={avgScore > 0 ? avgScore.toFixed(1) : '—'} sub="published only" />
        <StatCard label="V4 fields populated" value={`${v4Full} (${pct(v4Full, total)}%)`} sub="all 5 key V4 fields present" />
      </div>
    </div>
  );
}
