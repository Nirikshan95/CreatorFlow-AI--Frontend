export default function ScoreBar({ label, value = 0, type = 'novelty' }) {
  const pct = Math.round((value || 0) * 100);
  const color =
    pct >= 75 ? 'var(--success)' :
    pct >= 50 ? 'var(--warning)' :
    'var(--danger)';

  return (
    <div className="score-bar-wrap">
      <div className="score-bar-header">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value" style={{ color }}>{pct}%</span>
      </div>
      <div className="score-bar-track">
        <div
          className={`score-bar-fill ${type}`}
          style={{ '--target-width': `${pct}%` }}
        />
      </div>
    </div>
  );
}
