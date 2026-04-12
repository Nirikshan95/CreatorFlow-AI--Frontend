import { useState } from 'react';
import ScoreBar from './ScoreBar';

const TABS = [
  { key: 'script',    label: '✍️ Script'    },
  { key: 'seo',       label: '🚀 SEO'       },
  { key: 'community', label: '💬 Community' },
  { key: 'thumbnail', label: '🎨 Thumbnail' },
  { key: 'marketing', label: '📈 Marketing' },
  { key: 'critic',    label: '🛡️ AI Review' },
];


const CATEGORY_LABELS = {
  confidence: 'Confidence',
  communication: 'Communication',
  interview: 'Interview',
  general: 'General',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  );
}

/** Render script sections from various possible structures */
function ScriptView({ script }) {
  if (!script) return <div className="opacity-60">No script available.</div>;

  const SECTION_KEYS = ['hook', 'pattern_break', 'problem', 'insight', 'steps', 'example', 'cta'];
  const SECTION_LABELS = {
    hook: 'Hook',
    pattern_break: 'Pattern Break',
    problem: 'Problem',
    insight: 'Core Insight',
    steps: 'Steps',
    example: 'Example',
    cta: 'Call to Action',
  };

  if (typeof script === 'string') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <CopyBtn text={script} />
        </div>
        <div className="script-section-content" style={{ paddingTop: 36 }}>{script}</div>
      </div>
    );
  }

  // If it's a dict/object
  return (
    <div>
      {SECTION_KEYS.map((key) => {
        const val = script[key];
        if (!val) return null;
        const content = Array.isArray(val) ? val.join('\n') : String(val);
        return (
          <div key={key} className="script-section">
            <div className="script-section-label">
              {SECTION_LABELS[key] || key}
            </div>
            <div className="script-section-content">{content}</div>
          </div>
        );
      })}
      {/* Fallback for unknown keys */}
      {Object.entries(script)
        .filter(([k]) => !SECTION_KEYS.includes(k))
        .map(([k, v]) => (
          <div key={k} className="script-section">
            <div className="script-section-label">{k}</div>
            <div className="script-section-content">{typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</div>
          </div>
        ))}
    </div>
  );
}

/** SEO tab content */
function SEOView({ seoData, title }) {
  const allTitles = seoData?.title
    ? (Array.isArray(seoData.title)
        ? seoData.title
        : [seoData.title])
    : (title ? [{ title }] : []);

  const description =
    seoData?.description?.description ||
    seoData?.description ||
    null;

  return (
    <div>
      <div className="detail-section-title">Title Options</div>
      {allTitles.length === 0 && <div className="opacity-60">No title data available.</div>}
      {allTitles.map((t, i) => {
        const titleText = typeof t === 'string' ? t : t?.title || JSON.stringify(t);
        const isBest = i === 0;
        return (
          <div key={i} className={`seo-title-option ${isBest ? 'best' : ''}`}>
            <span style={{ flex: 1 }}>{titleText}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {isBest && <span className="best-badge">Best</span>}
              <CopyBtn text={titleText} />
            </div>
          </div>
        );
      })}

      {description && (
        <>
          <div className="detail-section-title" style={{ marginTop: 20 }}>Description</div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
              <CopyBtn text={typeof description === 'string' ? description : JSON.stringify(description)} />
            </div>
            <div className="seo-description-box">
              {typeof description === 'string'
                ? description
                : JSON.stringify(description, null, 2)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** Community post tab */
function CommunityView({ post }) {
  if (!post) return <div className="opacity-60">No community post generated.</div>;
  const text =
    post?.content || post?.post || post?.text ||
    (typeof post === 'string' ? post : JSON.stringify(post, null, 2));
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <CopyBtn text={text} />
      </div>
      <div className="seo-description-box" style={{ paddingTop: 40 }}>{text}</div>
    </div>
  );
}

/** Thumbnail tab */
function ThumbnailView({ prompt }) {
  if (!prompt) return <div className="opacity-60">No thumbnail prompt generated.</div>;
  const text =
    prompt?.prompt || prompt?.description ||
    (typeof prompt === 'string' ? prompt : JSON.stringify(prompt, null, 2));
  return (
    <div>
      <div className="detail-section-title">Image Generation Prompt</div>
      <div className="thumbnail-prompt-card">
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -8, right: 0 }}>
            <CopyBtn text={text} />
          </div>
          <p style={{ paddingRight: 80 }}>{text}</p>
        </div>
      </div>
      <div className="mt-4" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        💡 Use this prompt with tools like <strong>Midjourney</strong>, <strong>DALL-E</strong>, or <strong>Ideogram</strong> to generate your thumbnail.
      </div>
    </div>
  );
}

/** Marketing strategy tab */
function MarketingView({ strategy }) {
  if (!strategy) return <div className="opacity-60">No marketing strategy generated.</div>;

  if (typeof strategy === 'string') {
    return <div className="marketing-block"><p>{strategy}</p></div>;
  }

  const entries = Object.entries(strategy).filter(([, v]) => v);

  return (
    <div>
      {entries.map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const content =
          Array.isArray(value)
            ? value.join('\n• ')
            : typeof value === 'object'
              ? JSON.stringify(value, null, 2)
              : String(value);
        return (
          <div key={key} className="marketing-block">
            <h4>{label}</h4>
            <p>{Array.isArray(value) ? `• ${content}` : content}</p>
          </div>
        );
      })}
    </div>
  );
}

/** AI Review/Critic tab */
function CritiqueView({ critique }) {
  if (!critique) return <div className="opacity-60">No quality review available for this content.</div>;

  const rating = critique.rating || 0;
  const color = rating >= 7 ? 'var(--novelty-color)' : rating >= 4 ? 'var(--virality-color)' : 'var(--error-color)';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="detail-section-title" style={{ margin: 0 }}>Engagement Quality Score</div>
          <p className="text-sm opacity-60">Calculated by the Growth Critic Agent</p>
        </div>
        <div className="rating-badge" style={{ background: color, color: '#fff', padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: '1.2rem' }}>
          {rating.toFixed(1)}/10
        </div>
      </div>

      <div className="card mb-6" style={{ background: 'rgba(255,255,255,0.03)', padding: 20 }}>
        <strong style={{ display: 'block', marginBottom: 8, color: 'var(--novelty-color)' }}>Critic Feedback:</strong>
        <p style={{ lineHeight: 1.6 }}>{critique.feedback}</p>
      </div>

      {critique.suggestions && critique.suggestions.length > 0 && (
        <div className="suggestions-section">
          <div className="detail-section-title">Improvement Ideas</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {critique.suggestions.map((s, i) => (
              <li key={i} style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--novelty-color)' }}>💡</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ContentDetail({ content }) {

  const [activeTab, setActiveTab] = useState('script');
  const cat = content?.category || 'general';

  if (!content) {
    return <div className="empty-state"><div className="empty-state-icon">🔍</div><p>No content to display.</p></div>;
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="detail-header">
        <div className="flex items-center gap-3 mb-2">
          <span className={`badge badge-${cat}`}>{CATEGORY_LABELS[cat] || cat}</span>
          {content.keywords?.slice(0, 3).map((kw) => (
            <span key={kw} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 99 }}>
              {kw}
            </span>
          ))}
        </div>

        <div className="detail-title">{content.title || 'Untitled'}</div>

        <div className="detail-meta">
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            🎯 {content.topic}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, maxWidth: 500 }}>
          <ScoreBar label="Novelty Score"   value={content.novelty_score}  type="novelty"  />
          <ScoreBar label="Virality Score"  value={content.virality_score} type="virality" />
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
          Generated {formatDate(content.created_at)} · ID: {content.video_id?.slice(0, 8)}…
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-body">
        <div className="tabs-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card tab-content">
          {activeTab === 'script'    && <ScriptView    script={content.script_data} />}
          {activeTab === 'seo'       && <SEOView        seoData={content.seo_data} title={content.title} />}
          {activeTab === 'community' && <CommunityView  post={content.community_post} />}
          {activeTab === 'thumbnail' && <ThumbnailView  prompt={content.thumbnail_prompt} />}
          {activeTab === 'marketing' && <MarketingView  strategy={content.marketing_strategy} />}
          {activeTab === 'critic'    && <CritiqueView   critique={content.critique} />}
        </div>

      </div>
    </div>
  );
}
