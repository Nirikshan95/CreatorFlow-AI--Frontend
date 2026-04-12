import { useState } from 'react';

const STEPS = [
  { key: 'topics',    label: 'Analyzing memory & brainstorming…', icon: '🧠' },
  { key: 'select',    label: 'Decision Engine quality check…',      icon: '🎯' },
  { key: 'script',    label: 'Generating video narrative…',         icon: '✍️'  },
  { key: 'seo',       label: 'Optimizing for search intent…',       icon: '🚀' },
  { key: 'content',   label: 'Performing AI Quality Review…',       icon: '🛡️' },
  { key: 'marketing', label: 'Assembling distribution plan…',       icon: '📈' },
  { key: 'saving',    label: 'Persisting to semantic memory…',      icon: '💾' },
];


const CATEGORIES = [
  { value: '',              label: 'Any Category' },
  { value: 'confidence',    label: '💪 Confidence'    },
  { value: 'communication', label: '🗣️ Communication'  },
  { value: 'interview',     label: '💼 Interview'      },
];

export default function GeneratePanel({ onGenerate, isLoading, activeStep, result, error, logs = [] }) {
  const [category, setCategory]   = useState('');
  const [numTopics, setNumTopics] = useState(5);

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate({ category: category || null, numTopics });
  }

  const stepIndex = STEPS.findIndex((s) => s.key === activeStep);

  return (
    <div className="generate-panel card">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Generate <span className="gradient-text">Content</span></h1>
        <p className="page-subtitle">
          The AI will generate a unique topic, full script, SEO metadata, and marketing strategy in one shot.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="generate-grid">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Topics to Evaluate</span>
              <span className="slider-value">{numTopics}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={numTopics}
              onChange={(e) => setNumTopics(Number(e.target.value))}
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <><span className="spinner" /> Generating…</>
          ) : (
            <><span>🚀</span> Generate Content</>
          )}
        </button>
      </form>

      {isLoading && (
        <div className="progress-steps">
          {STEPS.map((step, idx) => {
            const status =
              idx < stepIndex  ? 'done'   :
              idx === stepIndex ? 'active' : '';
            return (
              <div key={step.key} className={`progress-step ${status}`}>
                <div className="step-icon">
                  {status === 'done'   ? '✓' :
                   status === 'active' ? <span className="spinner" style={{width:14,height:14}} /> :
                   step.icon}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            );
          })}
          
          <div className="step-logs mt-4">
            {logs.map((log, i) => (
              <div key={i} className="log-entry">• {log}</div>
            ))}
          </div>
        </div>
      )}


      {error && !isLoading && (
        <div className="error-box mt-4">
          <strong>Generation failed:</strong> {error}
        </div>
      )}

      {result && !isLoading && (
        <div className="result-banner mt-4 fade-in">
          <div className="result-banner-title">✅ Content generated successfully!</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            <strong>Topic:</strong> {result.topic}
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            <strong>Title:</strong> {result.title}
          </div>
          <a
            href={`/content/${result.video_id}`}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex' }}
          >
            View Full Content →
          </a>
        </div>
      )}
    </div>
  );
}
