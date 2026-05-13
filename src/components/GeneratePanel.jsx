import { useEffect, useState } from 'react';
import { contentApi } from '../api/content';

const STEPS = [
  { key: 'topics', label: 'Analyzing memory and brainstorming...', icon: 'Brain' },
  { key: 'select', label: 'Running quality checks...', icon: 'Target' },
  { key: 'script', label: 'Generating video narrative...', icon: 'Script' },
  { key: 'seo', label: 'Optimizing for search intent...', icon: 'SEO' },
  { key: 'content', label: 'Performing AI quality review...', icon: 'Review' },
  { key: 'marketing', label: 'Assembling distribution plan...', icon: 'Plan' },
  { key: 'saving', label: 'Saving to content memory...', icon: 'Save' },
];

const CATEGORIES = [
  { value: '', label: 'Any Category' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'communication', label: 'Communication' },
  { value: 'interview', label: 'Interview' },
];

const SCRIPT_TYPES = [
  { value: 'descriptive', label: 'Descriptive' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'educational', label: 'Educational' },
];

export default function GeneratePanel({ onGenerate, isLoading, activeStep, result, error, logs = [], memorySummary = '' }) {
  const [category, setCategory] = useState('');
  const [numTopics, setNumTopics] = useState(5);
  const [scriptType, setScriptType] = useState('descriptive');
  const [useChannelProfile, setUseChannelProfile] = useState(() => {
    const savedPreference = localStorage.getItem('useChannelProfilePreference');
    if (savedPreference !== null) return JSON.parse(savedPreference);

    const hasVisitedBefore = localStorage.getItem('hasVisitedGeneratePanel') === 'true';
    return hasVisitedBefore;
  });
  const [channelProfileId, setChannelProfileId] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [profilesError, setProfilesError] = useState('');

  useEffect(() => {
    localStorage.setItem('hasVisitedGeneratePanel', 'true');
  }, []);

  function handleUseChannelProfileToggle(checked) {
    setUseChannelProfile(checked);
    localStorage.setItem('useChannelProfilePreference', JSON.stringify(checked));
  }

  useEffect(() => {
    let mounted = true;

    async function loadProfiles() {
      try {
        const data = await contentApi.getChannelProfiles();
        if (!mounted) return;
        setProfiles(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setProfilesError('Failed to load channel profiles. Generation will continue without a profile.');
      }
    }

    loadProfiles();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (profiles.length === 0 && useChannelProfile) {
      setUseChannelProfile(false);
    }
  }, [profiles.length, useChannelProfile]);

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate({
      category: category || null,
      numTopics,
      scriptType,
      channelProfileId: useChannelProfile ? (channelProfileId || null) : null,
    });
  }

  const stepIndex = STEPS.findIndex((s) => s.key === activeStep);
  const currentStepLabel = stepIndex !== -1 ? STEPS[stepIndex].label : 'Initializing...';

  // Auto-scroll logic for terminal
  const terminalRef = useEffect(() => {
    const el = document.getElementById('terminal-content');
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <div className="generate-panel card">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Generate <span className="gradient-text">Content</span></h1>
        <p className="page-subtitle">
          Choose whether to apply a channel profile during content generation.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="generate-grid">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isLoading}>
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
            <input type="range" min={1} max={10} value={numTopics} onChange={(e) => setNumTopics(Number(e.target.value))} disabled={isLoading} />
          </div>

          <div className="form-group">
            <label className="form-label">Script Style</label>
            <select className="form-control" value={scriptType} onChange={(e) => setScriptType(e.target.value)} disabled={isLoading}>
              {SCRIPT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Use Channel Profile for Content Generation</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: useChannelProfile ? 'var(--accent-color)' : 'var(--text-muted)',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  {useChannelProfile ? 'Enabled' : 'Disabled'}
                </span>
              <button
                type="button"
                onClick={() => handleUseChannelProfileToggle(!useChannelProfile)}
                disabled={isLoading || profiles.length === 0}
                aria-pressed={useChannelProfile}
                aria-label={useChannelProfile ? 'Turn off channel profile usage' : 'Turn on channel profile usage'}
                style={{
                  width: 48,
                  height: 26,
                  padding: 2,
                  borderRadius: 999,
                  border: useChannelProfile ? '1px solid var(--accent-color)' : '1px solid var(--text-muted)',
                  backgroundColor: useChannelProfile ? 'var(--accent-color)' : 'var(--card-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: useChannelProfile ? 'flex-end' : 'flex-start',
                  cursor: (isLoading || profiles.length === 0) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || profiles.length === 0) ? 0.55 : 1,
                  transition: 'all 180ms ease',
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    border: '1px solid rgba(0,0,0,0.12)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    transition: 'all 180ms ease',
                  }}
                />
              </button>
              </div>
            </div>
            {profiles.length === 0 && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                <strong>i</strong> Create at least one channel profile first to use this feature.
              </div>
            )}
            {useChannelProfile && profiles.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <select
                  className="form-control"
                  value={channelProfileId}
                  onChange={(e) => setChannelProfileId(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select a profile...</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.channel_name || 'Untitled Channel Profile'}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  Manage profiles from the Channel Profiles page.
                </div>
              </div>
            )}
            {profilesError && <div style={{ fontSize: '0.78rem', color: 'var(--error-color)', marginTop: 6 }}>{profilesError}</div>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
          {isLoading ? (<><span className="spinner" /> Generating...</>) : (<>Generate Content</>)}
        </button>
      </form>
      {memorySummary && (
        <div style={{ marginTop: 14, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <strong>Memory Summary Used for Topic Generation:</strong>
          <div style={{ marginTop: 6, whiteSpace: 'pre-wrap', opacity: 0.9 }}>{memorySummary}</div>
        </div>
      )}

      <div style={{ marginTop: isLoading ? '40px' : '0', borderTop: isLoading ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingTop: isLoading ? '40px' : '0' }}>
        {isLoading && (
          <div className="generation-dashboard">
            {/* High-Level Flow Section */}
            <div className="flow-stepper" style={{ marginBottom: '48px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                 <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', margin: 0 }}>Workflow Progress</h3>
                 <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', opacity: 0.5, textTransform: 'uppercase' }}>
                   {activeStep || 'Initializing'} Phase Active
                 </div>
              </div>
              <div className="stepper-track" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                padding: '0 10px'
              }}>
                {/* Connector Line */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '40px',
                  right: '40px',
                  height: '2px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  zIndex: 0
                }} />
                
                {STEPS.map((step, idx) => {
                  const isActive = step.key === activeStep;
                  const isPast = idx < stepIndex;
                  return (
                    <div key={step.key} className="stepper-item" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      zIndex: 1,
                      flex: 1
                    }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: isPast ? 'var(--accent-color)' : isActive ? 'var(--card-bg)' : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${isActive ? 'var(--accent-color)' : 'transparent'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isPast ? '#fff' : isActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isActive ? '0 0 25px rgba(168, 85, 247, 0.3)' : 'none'
                      }}>
                        {isPast ? '✓' : idx + 1}
                      </div>
                      <span style={{ 
                        fontSize: '0.62rem', 
                        textAlign: 'center', 
                        fontWeight: isActive ? 800 : 500,
                        color: isActive ? 'var(--text-h)' : 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        transition: 'color 0.3s ease'
                      }}>
                        {step.key}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Intelligence Section */}
            <div className="intelligence-panel" style={{
              backgroundColor: 'rgba(10, 15, 25, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
            }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
                <div className="flex items-center gap-3">
                  <div className="pulse-dot" style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#c084fc',
                    boxShadow: '0 0 12px #c084fc'
                  }}></div>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, color: 'var(--text-h)' }}>
                    Agent Intelligence Feed
                  </h3>
                </div>
                <div style={{ fontSize: '9px', fontFamily: 'monospace', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Streaming Real-time Analytics
                </div>
              </div>

              <div id="terminal-content" style={{
                height: '220px',
                overflowY: 'auto',
                paddingRight: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                scrollBehavior: 'smooth'
              }}>
                {logs.map((log, i) => {
                  const isError = log.includes('[ERROR]');
                  const isSuccess = log.includes('[SUCCESS]');
                  
                  let cleanLog = log
                    .replace(/\[.*?\]/g, '')
                    .replace(/===.*?===/g, '')
                    .trim();

                  if (!cleanLog) return null;

                  return (
                    <div key={i} className="intelligence-item fade-in" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      opacity: i === logs.length - 1 ? 1 : 0.5,
                      transform: i === logs.length - 1 ? 'translateX(0)' : 'translateX(0)',
                      transition: 'all 0.4s ease'
                    }}>
                      <div style={{
                        marginTop: '5px',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        color: isError ? '#f87171' : isSuccess ? '#4ade80' : '#c084fc',
                        fontFamily: 'monospace'
                      }}>&gt;&gt;</div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: isError ? '#f87171' : '#e5e7eb',
                        lineHeight: 1.6,
                        fontFamily: '"Fira Code", monospace',
                        letterSpacing: '-0.01em'
                      }}>
                        {cleanLog}
                      </div>
                    </div>
                  );
                })}
                <div className="cursor-blink" style={{ 
                  width: 8, 
                  height: 3, 
                  backgroundColor: '#c084fc',
                  marginTop: 6 
                }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && !isLoading && (
        <div className="error-box mt-4">
          <strong>Generation failed:</strong> {error}
        </div>
      )}

      {result && !isLoading && (
        <div className="result-banner mt-4 fade-in">
          <div className="result-banner-title">Content generated successfully.</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            <strong>Topic:</strong> {result.topic}
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            <strong>Title:</strong> {result.title}
          </div>
          {result.past_topics_summary && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              <strong>Memory Summary:</strong>
              <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{result.past_topics_summary}</div>
            </div>
          )}
          <a href={`/content/${result.video_id}`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
            View Full Content
          </a>
        </div>
      )}
    </div>
  );
}
