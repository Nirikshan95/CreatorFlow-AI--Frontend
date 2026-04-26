import { useState } from 'react';
import ScoreBar from './ScoreBar';

const TAB_CONFIG = {
  script: {
    label: 'Script',
    helper: 'Generated script text only.',
  },
  seo: {
    label: 'SEO',
    helper: 'Single SEO response: title, description, and hashtags.',
  },
  post_creation: {
    label: 'Post Creation',
    helper: 'Post announcement or poll output from one structured response.',
  },
  thumbnail: {
    label: 'Thumbnail Prompt',
    helper: 'Single thumbnail generation prompt.',
  },
  distribution: {
    label: 'Distribution Strategy',
    helper: 'Structured list of individual promotion suggestions.',
  },
  quality: {
    label: 'Quality Assessment',
    helper: 'Final quality review and improvement guidance.',
  },
};

const TABS = Object.entries(TAB_CONFIG).map(([key, config]) => ({
  key,
  label: config.label,
}));

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

function parseMaybeJson(value) {
  if (value == null) return null;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
}

function isEmptyObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0;
}

function firstNonEmptyValue(candidates) {
  for (const candidate of candidates) {
    const parsed = parseMaybeJson(candidate);
    if (parsed == null) continue;
    if (Array.isArray(parsed) && parsed.length === 0) continue;
    if (isEmptyObject(parsed)) continue;
    if (typeof parsed === 'string' && !parsed.trim()) continue;
    return parsed;
  }
  return null;
}

function normalizeScript(scriptData) {
  const parsed = parseMaybeJson(scriptData);
  return typeof parsed === 'string' ? parsed.trim() : '';
}

function normalizeSeo(content) {
  const seoData = parseMaybeJson(content?.seo_data);
  let canonical = seoData && typeof seoData === 'object' ? seoData : {};

  const nestedInDescription = parseMaybeJson(canonical.description);
  if (
    nestedInDescription
    && typeof nestedInDescription === 'object'
    && (
      typeof nestedInDescription.video_title === 'string'
      || typeof nestedInDescription.description === 'string'
      || Array.isArray(nestedInDescription.hashtags)
    )
  ) {
    canonical = nestedInDescription;
  }

  const hashtags = Array.isArray(canonical.hashtags) ? canonical.hashtags : [];

  return {
    video_title: String(canonical.video_title || '').trim(),
    description: String(canonical.description || '').trim(),
    hashtags: hashtags.map((tag) => String(tag || '').trim()).filter(Boolean),
  };
}

function normalizePostCreation(content) {
  const normalized = parseMaybeJson(content?.community_post);
  if (!normalized || typeof normalized !== 'object') return null;

  const postType = String(normalized.post_type || '').toLowerCase();
  if (postType === 'poll') {
    const optionsRaw = Array.isArray(normalized.options) ? normalized.options : [];
    const options = optionsRaw.map((opt) => String(opt || '').trim()).filter(Boolean).slice(0, 4);
    return {
      post_type: 'poll',
      poll_question: String(normalized.poll_question || '').trim(),
      options,
    };
  }

  return {
    post_type: 'post',
    content: String(normalized.content || '').trim(),
    image_prompt: String(normalized.image_prompt || '').trim(),
  };
}

function normalizeThumbnailPrompt(content) {
  const data = parseMaybeJson(content?.thumbnail_prompt);

  if (!data) return '';
  if (typeof data === 'string') {
    const raw = data.trim();
    if (!raw) return '';

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof parsed.thumbnail_prompt === 'string') {
        return parsed.thumbnail_prompt.trim();
      }
    } catch {
      // Fall through to resilient extraction below.
    }

    const normalized = raw
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");
    const keyMatch = normalized.match(/["']thumbnail_prompt["']\s*:\s*/i);
    if (keyMatch) {
      let tail = normalized.slice((keyMatch.index || 0) + keyMatch[0].length).trim();
      if (tail.startsWith('"') || tail.startsWith("'")) {
        const quote = tail[0];
        tail = tail.slice(1);
        let out = '';
        let escaped = false;
        for (let i = 0; i < tail.length; i += 1) {
          const ch = tail[i];
          if (escaped) {
            out += ch;
            escaped = false;
            continue;
          }
          if (ch === '\\') {
            escaped = true;
            continue;
          }
          if (ch === quote) {
            break;
          }
          out += ch;
        }

        const cleaned = out
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\n/g, '\n')
          .trim();

        if (cleaned) return cleaned;
      } else {
        const cleaned = tail.replace(/[}\]]+$/, '').trim();
        if (cleaned) return cleaned;
      }
    }

    return raw;
  }

  if (typeof data === 'object') {
    return String(data.thumbnail_prompt || '').trim();
  }
  return '';
}

function normalizeDistribution(content) {
  const data = parseMaybeJson(content?.marketing_strategy);

  if (!data || typeof data !== 'object') return [];
  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
  return suggestions.map((s) => String(s || '').trim()).filter(Boolean);
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
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ScriptView({ script }) {
  if (!script) return <div className="opacity-60">No script available.</div>;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <CopyBtn text={script} />
      </div>
      <div className="script-section-content" style={{ whiteSpace: 'pre-wrap', paddingTop: 36 }}>{script}</div>
    </div>
  );
}

function SEOView({ seo }) {
  const hashtagsText = (seo.hashtags || []).join(' ');

  return (
    <div>
      <div className="detail-section-title">Video Title</div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <CopyBtn text={seo.video_title || ''} />
        </div>
        <div className="seo-description-box" style={{ paddingRight: 88 }}>
          {seo.video_title || 'No title generated.'}
        </div>
      </div>

      <div className="detail-section-title" style={{ marginTop: 20 }}>Description</div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <CopyBtn text={seo.description || ''} />
        </div>
        <div className="seo-description-box" style={{ whiteSpace: 'pre-wrap', paddingRight: 88 }}>
          {seo.description || 'No description generated.'}
        </div>
      </div>

      <div className="detail-section-title" style={{ marginTop: 20 }}>Hashtags</div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <CopyBtn text={hashtagsText} />
        </div>
        <div className="seo-description-box" style={{ paddingRight: 88 }}>
          {hashtagsText || 'No hashtags generated.'}
        </div>
      </div>
    </div>
  );
}

function PostCreationView({ postCreation }) {
  if (!postCreation) return <div className="opacity-60">No post creation output available.</div>;

  if (postCreation.post_type === 'poll') {
    return (
      <div>
        <div className="detail-section-title">Poll Question</div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <CopyBtn text={postCreation.poll_question || ''} />
          </div>
          <div className="seo-description-box" style={{ paddingRight: 88 }}>
            {postCreation.poll_question || 'No poll question generated.'}
          </div>
        </div>

        <div className="detail-section-title" style={{ marginTop: 20 }}>Options</div>
        {postCreation.options?.length ? (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {postCreation.options.map((option, index) => (
              <li key={index} style={{ marginBottom: 8 }}>{option}</li>
            ))}
          </ul>
        ) : (
          <div className="opacity-60">No poll options generated.</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="detail-section-title">Post Content</div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <CopyBtn text={postCreation.content || ''} />
        </div>
        <div className="seo-description-box" style={{ whiteSpace: 'pre-wrap', paddingRight: 88 }}>
          {postCreation.content || 'No post content generated.'}
        </div>
      </div>

      <div className="detail-section-title" style={{ marginTop: 20 }}>Image Prompt</div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <CopyBtn text={postCreation.image_prompt || ''} />
        </div>
        <div className="seo-description-box" style={{ whiteSpace: 'pre-wrap', paddingRight: 88 }}>
          {postCreation.image_prompt || 'No image prompt generated.'}
        </div>
      </div>
    </div>
  );
}

function ThumbnailView({ prompt }) {
  if (!prompt) return <div className="opacity-60">No thumbnail prompt generated.</div>;

  return (
    <div>
      <div className="detail-section-title">Thumbnail Prompt</div>
      <div className="thumbnail-prompt-card">
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -8, right: 0 }}>
            <CopyBtn text={prompt} />
          </div>
          <p style={{ paddingRight: 80 }}>{prompt}</p>
        </div>
      </div>
    </div>
  );
}

function DistributionView({ suggestions }) {
  if (!suggestions || suggestions.length === 0) {
    return <div className="opacity-60">No distribution suggestions generated.</div>;
  }

  return (
    <ul style={{ margin: 0, paddingLeft: 20 }}>
      {suggestions.map((item, index) => (
        <li key={index} style={{ marginBottom: 10 }}>{item}</li>
      ))}
    </ul>
  );
}

function QualityView({ critique }) {
  if (!critique || isEmptyObject(critique)) return <div className="opacity-60">No quality review available for this content.</div>;

  const rating = critique.rating || 0;
  const color = rating >= 7 ? 'var(--novelty-color)' : rating >= 4 ? 'var(--virality-color)' : 'var(--error-color)';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="detail-section-title" style={{ margin: 0 }}>Quality Score</div>
          <p className="text-sm opacity-60">Final critic assessment for this content</p>
        </div>
        <div className="rating-badge" style={{ background: color, color: '#fff', padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: '1.2rem' }}>
          {rating.toFixed(1)}/10
        </div>
      </div>

      <div className="card mb-6" style={{ background: 'rgba(255,255,255,0.03)', padding: 20 }}>
        <strong style={{ display: 'block', marginBottom: 8, color: 'var(--novelty-color)' }}>Feedback:</strong>
        <p style={{ lineHeight: 1.6 }}>{critique.feedback || 'No feedback generated.'}</p>
      </div>

      {Array.isArray(critique.suggestions) && critique.suggestions.length > 0 && (
        <div className="suggestions-section">
          <div className="detail-section-title">Suggestions</div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {critique.suggestions.map((s, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{s}</li>
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
  const activeTabHelper = TAB_CONFIG[activeTab]?.helper;

  const scriptText = normalizeScript(content?.script_data);
  const seo = normalizeSeo(content);
  const postCreation = normalizePostCreation(content);
  const thumbnailPrompt = normalizeThumbnailPrompt(content);
  const distributionSuggestions = normalizeDistribution(content);
  const qualityAssessment = parseMaybeJson(content?.quality_assessment);

  if (!content) {
    return <div className="empty-state"><div className="empty-state-icon">Search</div><p>No content to display.</p></div>;
  }

  return (
    <div className="fade-in">
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
            Topic: {content.topic}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, maxWidth: 500 }}>
          <ScoreBar label="Novelty Score" value={content.novelty_score} type="novelty" />
          <ScoreBar label="Virality Score" value={content.virality_score} type="virality" />
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
          Generated {formatDate(content.created_at)} | ID: {content.video_id?.slice(0, 8)}...
        </div>
      </div>

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
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 2px 14px' }}>
          {activeTabHelper}
        </div>

        <div className="card tab-content">
          {activeTab === 'script' && <ScriptView script={scriptText} />}
          {activeTab === 'seo' && <SEOView seo={seo} />}
          {activeTab === 'post_creation' && <PostCreationView postCreation={postCreation} />}
          {activeTab === 'thumbnail' && <ThumbnailView prompt={thumbnailPrompt} />}
          {activeTab === 'distribution' && <DistributionView suggestions={distributionSuggestions} />}
          {activeTab === 'quality' && <QualityView critique={qualityAssessment} />}
        </div>
      </div>
    </div>
  );
}

