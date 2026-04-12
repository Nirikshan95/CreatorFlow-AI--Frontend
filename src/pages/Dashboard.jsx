import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../api/content';
import ScoreBar from '../components/ScoreBar';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { '--grad-end': color } : {}}>{value}</div>
    </div>
  );
}

function RecentItem({ item, onClick }) {
  const cat = item.category || 'general';
  return (
    <div
      className="card content-card fade-in"
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="content-card-top">
        <div className="content-card-title" style={{ fontSize: '0.9rem' }}>{item.title || '—'}</div>
        <span className={`badge badge-${cat}`}>{cat}</span>
      </div>
      <div className="content-card-topic">{item.topic}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <ScoreBar label="Novelty"  value={item.novelty_score}  type="novelty"  />
        <ScoreBar label="Virality" value={item.virality_score} type="virality" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi.getHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const recent = history.slice(0, 6);
  const avgNovelty  = history.length ? (history.reduce((a, b) => a + (b.novelty_score  || 0), 0) / history.length) : 0;
  const avgVirality = history.length ? (history.reduce((a, b) => a + (b.virality_score || 0), 0) / history.length) : 0;

  const categoryCount = history.reduce((acc, item) => {
    const cat = item.category || 'general';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topCat = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">
          Welcome back 👋
        </h1>
        <p className="page-subtitle">
          Your AI-powered YouTube content strategist — non-repetitive, data-driven, and ready to go.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Content Pieces"
          value={loading ? '…' : history.length}
          icon="📁"
        />
        <StatCard
          label="Avg. Novelty Score"
          value={loading ? '…' : `${Math.round(avgNovelty * 100)}%`}
          icon="🧠"
        />
        <StatCard
          label="Avg. Virality Score"
          value={loading ? '…' : `${Math.round(avgVirality * 100)}%`}
          icon="🔥"
        />
        <StatCard
          label="Top Category"
          value={loading ? '…' : (topCat ? topCat[0] : '—')}
          icon="🏆"
        />
      </div>

      {/* Quick Action */}
      <div
        className="card"
        style={{
          padding: '28px 32px',
          marginBottom: 32,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,139,250,0.06))',
          border: '1px solid rgba(124,58,237,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="section-title">Ready to create new content?</div>
          <div className="page-subtitle" style={{ marginTop: 4 }}>
            Generate a unique topic, script, SEO metadata and marketing plan with one click.
          </div>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/generate')}
          style={{ whiteSpace: 'nowrap' }}
        >
          🚀 Generate Now
        </button>
      </div>

      {/* Recent */}
      <div style={{ marginBottom: 16 }}>
        <div className="flex items-center justify-between">
          <span className="section-title">Recent Content</span>
          {history.length > 6 && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
              View All →
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📭</div>
          <p style={{ color: 'var(--text-secondary)' }}>No content generated yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/generate')}>
            Generate Your First Content
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {recent.map((item) => (
            <RecentItem
              key={item.video_id}
              item={item}
              onClick={() => navigate(`/content/${item.video_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
