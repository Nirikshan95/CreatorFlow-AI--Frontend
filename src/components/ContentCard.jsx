import { useNavigate } from 'react-router-dom';
import ScoreBar from './ScoreBar';

const CATEGORY_LABELS = {
  confidence: 'Confidence',
  communication: 'Communication',
  interview: 'Interview',
  general: 'General',
};

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ContentCard({ item }) {
  const navigate = useNavigate();
  const cat = item.category || 'general';

  return (
    <div
      className="card content-card fade-in"
      onClick={() => navigate(`/content/${item.video_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/content/${item.video_id}`)}
    >
      <div className="content-card-top">
        <div className="content-card-title">{item.title || '—'}</div>
        <span className={`badge badge-${cat}`}>
          {CATEGORY_LABELS[cat] || cat}
        </span>
      </div>

      <div className="content-card-topic">{item.topic}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <ScoreBar label="Novelty"   value={item.novelty_score}  type="novelty"   />
        <ScoreBar label="Virality"  value={item.virality_score} type="virality"  />
      </div>

      <div className="content-card-footer">
        <span className="text-xs opacity-60">Click to view full content</span>
        <span className="content-card-date">{formatDate(item.created_at)}</span>
      </div>
    </div>
  );
}
